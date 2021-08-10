本文已收录在 Github: https://github.com/beichensky/Blog 中，欢迎 Star，欢迎 Follow！

## 前言

本文介绍了 React 18 版本中 `Suspense` 组件和新增 `SuspenseList` 组件的使用以及相关属性的用法。并且和 18 之前的版本做了对比，介绍了新特性的一些优势。

## 一、回顾 Suspense 用法

早在 React 16 版本，就可以使用 `React.lazy` 配合 `Suspense` 来进行代码拆分，我们来回顾一下之前的用法。

1. 在编写 `User` 组件，在 `User` 组件中进行网络请求，获取数据

   `User.jsx`

   ``` jsx
   import React, { useState, useEffect } from 'react';
   
   // 网络请求，获取 user 数据
   const requestUser = id =>
       new Promise(resolve =>
           setTimeout(() => resolve({ id, name: `用户${id}`, age: 10 + id }), id * 1000)
       );
   
   const User = props => {
       const [user, setUser] = useState({});
   
       useEffect(() => {
           requestUser(props.id).then(res => setUser(res));
       }, [props.id]);
    
       return <div>当前用户是: {user.name}</div>;
   };
   
   export default User;
   ```

2. 在 App 组件中通过 `React.lazy` 的方式加载 `User` 组件（使用时需要用 `Suspense` 组件包裹起来哦）

   `App.jsx`

   ``` jsx
   import React from "react";
   import ReactDOM from "react-dom";
   
   const User = React.lazy(() => import("./User"));
   
   const App = () => {
       return (
           <>
               <React.Suspense fallback={<div>Loading...</div>}>
                   <User id={1} />
               </React.Suspense>
           </>
       );
   };
   
   ReactDOM.createRoot(document.getElementById("root")).render(<App />);
   ```

3. 效果图：

   ![Suspense 老版用法图例](https://raw.githubusercontent.com/beichensky/Blog/main/images/deps/15-1-old.gif)

4. 此时，可以看到 User 组件在加载出来之前会 `loading` 一下，虽然进行了代码拆分，但还是有两个美中不足的地方

   - 需要在 `User` 组件中进行一些列的操作：定义 `state` ，`effect` 中发请求，然后修改 `state`，触发 `render`

   - 虽然看到 `loading` 展示了出来，但是仅仅只是组件加载完成，内部的请求以及用户想要看到的真实数据还没有处理完成

   > Ok, 带着这两个问题，我们继续向下探索。

## 二、Suspense 的实现原理

### 内部流程

- `Suspense` 让子组件在渲染之前进行等待，并在等待时显示 fallback 的内容

- `Suspense` 内的组件子树比组件树的其他部分拥有更低的优先级

- 执行流程

  - 在 `render` 函数中可以使用异步请求数据

  - `react` 会从我们的缓存中读取

  - 如果缓存命中，直接进行 `render`

  - 如果没有缓存，会抛出一个 `promise` 异常

  - 当 `promise` 完成后，`react` 会重新进行 `render`，把数据展示出来

  - 完全同步写法，没有任何异步 `callback`

### 简易版代码实现

- 子组件没有加载完成时，会抛出一个 `promise` 异常

- 监听 `promise`，状态变更后，更新 `state`，触发组件更新，重新渲染子组件

- 展示子组件内容

``` jsx
import React from "react";

class Suspense extends React.Component {
    state = {
        loading: false,
    };

    componentDidCatch(error) {
        if (error && typeof error.then === "function") {
            error.then(() => {
                this.setState({ loading: true });
            });
            this.setState({ loading: false });
        }
    }

    render() {
        const { fallback, children } = this.props;
        const { loading } = this.state;
        return loading ? fallback : children;
    }
}

export default Suspense;

```

## 三、新版 User 组件编写方式

针对上面我们说的两个问题，来修改一下我们的 `User` 组件

``` jsx
const User = async (props) => {
    const user = await requestUser(props.id);
    return <div>当前用户是: {user.name}</div>;
};
```

多希望 `User` 组件能这样写，省去了很多冗余的代码，并且能够在请求完成之前统一展示 `fallback`

但是我们又不能直接使用 `async`、`await` 去编写组件。这时候怎么办呢？

结合上面我们讲述的 `Suspense` 实现原理，那我们可以封装一层 `promise`，请求中，我们将 `promise` 作为异常抛出，请求完成展示结果。

`wrapPromise` 函数的含义：

- 接受一个 `promise` 作为参数

- 定义了 `promise` 状态和结果

- 返回一个包含 `read` 方法的对象

- 调用 `read` 方法时，会根据 `promise` 当前的状态去判断抛出异常还是返回结果。

``` jsx
function wrapPromise(promise) {
    let status = "pending";
    let result;
    let suspender = promise.then(
        (r) => {
            status = "success";
            result = r;
        },
        (e) => {
            status = "error";
            result = e;
        }
    );
    return {
        read() {
            if (status === "pending") {
                throw suspender;
            } else if (status === "error") {
                throw result;
            } else if (status === "success") {
                return result;
            }
        },
    };
}
```

使用 `wrapPromise` 重新改写一下 `User` 组件

``` jsx
// 网络请求，获取 user 数据
const requestUser = (id) =>
    new Promise((resolve) =>
        setTimeout(
            () => resolve({ id, name: `用户${id}`, age: 10 + id }),
            id * 1000
        )
    );

const resourceMap = {
    1: wrapPromise(requestUser(1)),
};

const User = (props) => {
    const resource = resourceMap[props.id];
    const user = resource.read();
    return <div>当前用户是: {user.name}</div>;
};
```

这时候可以看到界面首先展示 `loading`，请求结束后，直接将数据展示出来。不需要编写副作用代码，也不需要在组件内进行 `loading` 的判断。

![Suspense 新版用法图例](https://raw.githubusercontent.com/beichensky/Blog/main/images/deps/15-2-new.gif)

## 四、SuspenseList

上面我们讲述了 `Suspense` 的用法，那如果有多个 `Suspense` 同时存在时，我们想控制他们的展示顺序以及展示方式，应该怎么做呢？

React 中也提供了一个新的组件：`SuspenseList`

### SuspenseList 属性

`SuspenseList` 组件接受三个属性

- `revealOrder`: 子 `Suspense` 的加载顺序

  - forwards: 从前向后展示，无论请求的速度快慢都会等前面的先展示

  - Backwards: 从后向前展示，无论请求的速度快慢都会等后面的先展示

  - together: 所有的 Suspense 都准备好之后同时显示

- tail: 指定如何显示 `SuspenseList` 中未准备好的 `Suspense`

  - 不设置：默认加载所有 Suspense 对应的 fallback

  - collapsed：仅展示列表中下一个 Suspense 的 fallback

  - hidden: 未准备好的项目不限时任何信息

- children: 子元素

  - 子元素可以是任意 React 元素

  - **当子元素中包含非  `Suspense` 组件时，且未设置 `tail` 属性，那么此时所有的 `Suspense` 元素必定是同时加载，设置 `revealOrder` 属性也无效。当设置 `tail` 属性后，无论是 `collapsed` 还是 `hidden`，`revealOrder` 属性即可生效**

  - 子元素中多个 `Suspense` 不会相互阻塞

### SuspenseList 使用

`User` 组件

``` jsx
import React from "react";

function wrapPromise(promise) {
    let status = "pending";
    let result;
    let suspender = promise.then(
        (r) => {
            status = "success";
            result = r;
        },
        (e) => {
            status = "error";
            result = e;
        }
    );
    return {
        read() {
            if (status === "pending") {
                throw suspender;
            } else if (status === "error") {
                throw result;
            } else if (status === "success") {
                return result;
            }
        },
    };
}

// 网络请求，获取 user 数据
const requestUser = (id) =>
    new Promise((resolve) =>
        setTimeout(
            () => resolve({ id, name: `用户${id}`, age: 10 + id }),
            id * 1000
        )
    );

const resourceMap = {
    1: wrapPromise(requestUser(1)),
    3: wrapPromise(requestUser(3)),
    5: wrapPromise(requestUser(5)),
};

const User = (props) => {
    const resource = resourceMap[props.id];
    const user = resource.read();
    return <div>当前用户是: {user.name}</div>;
};

export default User;
```

`App` 组件

``` jsx
import React from "react";
import ReactDOM from "react-dom";

const User = React.lazy(() => import("./User"));
// 此处亦可以不使用 React.lazy()，直接使用以下 import 方式引入也可以
// import User from "./User"

const App = () => {
    return (
        <React.SuspenseList revealOrder="forwards" tail="collapsed">
            <React.Suspense fallback={<div>Loading...</div>}>
                <User id={1} />
            </React.Suspense>
            <React.Suspense fallback={<div>Loading...</div>}>
                <User id={3} />
            </React.Suspense>
            <React.Suspense fallback={<div>Loading...</div>}>
                <User id={5} />
            </React.Suspense>
        </React.SuspenseList>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

### 使用 SuspenseList 后效果图

![SuspenseList 用法图例](https://raw.githubusercontent.com/beichensky/Blog/main/images/deps/15-3-list.gif)

## 相关链接

- 本文 `wrapPromise` 方法取自 [Dan Abramov](https://github.com/gaearon) 的 **[frosty-hermann-bztrp](https://codesandbox.io/s/frosty-hermann-bztrp?file=/src/fakeApi.js)**

## 后记

好了，关于 React 中 Suspense 以及 SuspenseList 组件的用法，就已经介绍完了，在 SuspenseList 使用章节，所有的代码均已贴出来了。有疑惑的地方可以说出来一起进行讨论。

文中有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。

如果喜欢或者有所帮助，欢迎 Star。

