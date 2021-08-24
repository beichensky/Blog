## 前言

本文已收录在 Github: <https://github.com/beichensky/Blog> 中，欢迎 Star，欢迎 Follow！

在 [React 18 新特性（一）：自动批量更新](https://github.com/beichensky/Blog/issues/14) 一文中提到：在 React 新版本中，更新会有优先级的顺序。

那如果希望更新时进行低优先级的处理，应该如何做呢，就是今天讲到的主题：**渐变更新**。

> 如果还不知道如何搭建 React18 的体验环境，可以先查看这篇文章：[使用 Vite 尝鲜 React 18](https://github.com/beichensky/Blog/issues/13)

## 一、startTransition：渐变更新

- `startTransition` 接受一个回调函数，可以将放入其中的 `setState` 更新推迟

- 允许组件将速度较慢的更新延迟渲染，以便能够立即渲染更重要的更新

### 举个例子

先来看一个例子，在使用谷歌或者百度搜索时，都会遇到如下的场景：

![搜索](https://raw.githubusercontent.com/beichensky/Blog/main/images/deps/16-1-search.png)

这里的展示分为两部分

- 一部分是输入框中的搜索内容

- 另一部分是展示的联想内容。

从用户的角度进行分析：

- 输入框中的内容是需要即时更新的

- 而联想出来的内容是需要进行请求或者加载的，甚至于最开始的时候联想的不准确，用不到。所以用户可以接受这部分内容有一定延迟。

那在这种情况下，用户的输入就是高优先级操作，而联想区域的变化就属于低优先级的操作。

### 模拟代码实现这个例子

我们写一段代码来实现一下这个搜索框。

`App.jsx`

```jsx
import React, { useEffect, useState, startTransition } from 'react';
import ReactDOM from 'react-dom';

const App = () => {
    const [value, setValue] = useState('');
    const [keywords, setKeywords] = useState([]);

    useEffect(() => {
        const getList = () => {
            const list = value
                ? Array.from({ length: 10000 }, (_, index) => ({
                      id: index,
                      keyword: `${value} -- ${index}`,
                  }))
                : [];
            return Promise.resolve(list);
        };
        getList().then(res => setKeywords(res));
    }, [value]);

    return (
        <>
            <input value={value} onChange={e => setValue(e.target.value)} />
            <ul>
                {keywords.map(({ id, keyword }) => (
                    <li key={id}>{keyword}</li>
                ))}
            </ul>
        </>
    );
};

// 使用 react 18 新的并发模式写法进行 dom render
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// legacy 旧模式
// ReactDOM.render(<App />, document.getElementById('root')!)
```

然后我们先看一下现在的效果（这里暂时不讨论防抖或者节流）：

![缓慢加载](https://raw.githubusercontent.com/beichensky/Blog/main/images/deps/16-2-slow.gif)

可以看到，不仅联想区域的内容加载缓慢，甚至用户的交互内容也反应迟钝。

既然刚才说到了低优先级更新，那么此时，我们是否可以让联想区域的内容低优更新，以避免抢占用户操作的更新呢？

接下来主角登场，使用 `startTransition` 对代码进行改造。

### 启用渐变更新

`App.jsx`

```jsx
import React, { useEffect, useState, startTransition } from 'react';
import ReactDOM from 'react-dom';

const App = () => {
    const [value, setValue] = useState('');
    const [keywords, setKeywords] = useState([]);

    useEffect(() => {
        const getList = () => {
            const list = value
                ? Array.from({ length: 10000 }, (_, index) => ({
                      id: index,
                      keyword: `${value} -- ${index}`,
                  }))
                : [];
            return Promise.resolve(list);
        };
-        //getList().then(res => setKeywords(res));
        // 仅仅只是将 setKeywords 用 startTransition 包裹一层，即可启用渐变更新
+        getList().then(res => startTransition(() => setKeywords(res)));
    }, [value]);

    return (
        <>
            <input value={value} onChange={e => setValue(e.target.value)} />
            <ul>
                {keywords.map(({ id, keyword }) => (
                    <li key={id}>{keyword}</li>
                ))}
            </ul>
        </>
    );
};

// 使用 react 18 新的并发模式写法进行 dom render
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// legacy 旧模式
// ReactDOM.render(<App />, document.getElementById('root')!)
```

重新执行后，看看此时的效果：

![迅速响应](https://raw.githubusercontent.com/beichensky/Blog/main/images/deps/16-3-fast.gif)

可以看到，此时界面的响应速度比之前快了许多。

## 二、useDeferredValue：返回一个延迟响应的值

`useDeferredValue` 相当于是 `startTransition(() => setState(xxx))` 的语法糖，在内部会调用一次 `setState`，但是此更新的优先级更低

那么我们用 `useDeferredValue`  改写一下上面的代码，看看是否有哪里不一样呢？

`App.jsx`

```jsx
import React, { useEffect, useState, useDeferredValue } from 'react';
import ReactDOM from 'react-dom';

const App = () => {
    const [value, setValue] = useState('');
    const [keywords, setKeywords] = useState([]);
+    const text = useDeferredValue(value);

    useEffect(() => {
        const getList = () => {
            const list = value
                ? Array.from({ length: 10000 }, (_, index) => ({
                      id: index,
                      keyword: `${value} -- ${index}`,
                  }))
                : [];
            return Promise.resolve(list);
        };
        getList().then(res => setKeywords(res));
        // 只是将依赖的值由 value 更新为 text
+    }, [text]);

    return (
        <>
            <input value={value} onChange={e => setValue(e.target.value)} />
            <ul>
                {keywords.map(({ id, keyword }) => (
                    <li key={id}>{keyword}</li>
                ))}
            </ul>
        </>
    );
};

// 使用 react 18 新的并发模式写法进行 dom render
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// legacy 旧模式
// ReactDOM.render(<App />, document.getElementById('root')!)
```

看看此时界面的响应速度：

![同样迅速响应](https://raw.githubusercontent.com/beichensky/Blog/main/images/deps/16-4-fast2.gif)

可以看到此时的响应速度和使用 `startTransition` 时相差无几。

## 三、useTransition

还记得在 [React 18 新特性（二）：Suspense & SuspenseList](https://github.com/beichensky/Blog/issues/15) 一文中使用过的 `Suspense` 组件以及 `User` 组件吗？我们在这两个组件的基础上，展示一下 `useTransition` 的用法和特性。

### 举个异步加载的例子

假设我们目前需要使用 `Suspense` 来包裹 `User` 组件，此时 `User` 组件内部会有网络请求等耗时操作。点击按钮，会触发 `User` 组件的更新，重新进行耗时操作获取数据

`App.jsx`

```jsx
import React, { Suspense, useState } from 'react';
import ReactDOM from 'react-dom';

// 对 promise 进行一层封装
function wrapPromise(promise) {
    let status = 'pending';
    let result;
    let suspender = promise.then(
        r => {
            status = 'success';
            result = r;
        },
        e => {
            status = 'error';
            result = e;
        }
    );
    return {
        read() {
            if (status === 'pending') {
                throw suspender;
            } else if (status === 'error') {
                throw result;
            } else if (status === 'success') {
                return result;
            }
        },
    };
}

// 网络请求，获取 user 数据
const requestUser = id =>
    new Promise(resolve =>
        setTimeout(() => resolve({ id, name: `用户${id}`, age: 10 + id }), id * 100)
    );

// User 组件
const User = props => {
    const user = props.resource.read();
    return <div>当前用户是: {user.name}</div>;
};

// 通过 id 获取对应 resource
const getResource = id => wrapPromise(requestUser(id));

const App = () => {
    const [resource, setResource] = useState(getResource(10));

    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <User resource={resource} />
            </Suspense>
            <button onClick={() => setResource(wrapPromise(requestUser(1)))}>切换用户</button>
        </>
    );
};

// 使用 react 18 新的并发模式写法进行 dom render
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// legacy 旧模式
// ReactDOM.render(<App />, document.getElementById('root')!)
```

OK，那我们看一下此时的效果哈：

![loading效果](https://raw.githubusercontent.com/beichensky/Blog/main/images/deps/16-5-loading.gif)

可以看到，第一次加载时，会出现 `loading` 效果，这是正常的，但是在点击按钮，切换用户时，依然会有 `loading` 效果的出现，这本来没有问题，但是当请求速度很快时，就会出现闪一下的问题。此时应该不需要 `loading` 的出现。

这个时候，`useTransition` 就派上用场了。

### 概念

- `useTransition` 允许组件再切换到下一个界面之前等待内容加载，从而避免出现不必要的加载状态

- 允许组件将速度较慢的数据获取更新推迟到随后渲染（低优先级更新），以便能够立即渲染更重要的更新

- `useTransition` 返回包含两个元素的数组：

  - `isPending: Boolean`，通知我们是否正在等待过渡效果的完成
  - `startTransition: Function`，用它来包裹需要延迟更新的状态

### 使用 useTransition  修改上述的例子

使用 `useTransition` 中返回的 `startTransition` 包裹需要更新的 setState，就会降低更新的优先级，并且会对界面进行缓冲，等待下一个界面准备就绪后直接进行更新。

`App.jsx`

```jsx
import React, { Suspense, useState, useTransition } from 'react';
import ReactDOM from 'react-dom';

// 对 promise 进行一层封装
function wrapPromise(promise) {
    let status = 'pending';
    let result;
    let suspender = promise.then(
        r => {
            status = 'success';
            result = r;
        },
        e => {
            status = 'error';
            result = e;
        }
    );
    return {
        read() {
            if (status === 'pending') {
                throw suspender;
            } else if (status === 'error') {
                throw result;
            } else if (status === 'success') {
                return result;
            }
        },
    };
}

// 网络请求，获取 user 数据
const requestUser = id =>
    new Promise(resolve =>
        setTimeout(() => resolve({ id, name: `用户${id}`, age: 10 + id }), id * 100)
    );

// User 组件
const User = props => {
    const user = props.resource.read();
    return <div>当前用户是: {user.name}</div>;
};

// 通过 id 获取对应 resource
const getResource = id => wrapPromise(requestUser(id));

const App = () => {
    const [resource, setResource] = useState(getResource(10));
+    const [isPending, startTransition] = useTransition();

    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <User resource={resource} />
            </Suspense>
+            <button onClick={() => startTransition(() => setResource(wrapPromise(requestUser(1))))}>
                切换用户
            </button>
        </>
    );
};

// 使用 react 18 新的并发模式写法进行 dom render
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// legacy 旧模式
// ReactDOM.render(<App />, document.getElementById('root')!)
```

可以看到，加载状态的 `loading` 就不会出现了，闪一下的情况消失了：

![减少不必要的 loading](https://raw.githubusercontent.com/beichensky/Blog/main/images/deps/16-6-no-loading.gif)

那么问题来了，如果耗时操作确实会花费很久的时间，没有 `loading` 的话，对于用户来说就没有任何的反馈了呀。

别急，这个时候第一个元素 `isPending` 就可以用起来啦：

`App.jsx`

```jsx
import React, { Suspense, useState, useTransition } from 'react';
import ReactDOM from 'react-dom';

// 对 promise 进行一层封装
function wrapPromise(promise) {
    let status = 'pending';
    let result;
    let suspender = promise.then(
        r => {
            status = 'success';
            result = r;
        },
        e => {
            status = 'error';
            result = e;
        }
    );
    return {
        read() {
            if (status === 'pending') {
                throw suspender;
            } else if (status === 'error') {
                throw result;
            } else if (status === 'success') {
                return result;
            }
        },
    };
}

// 网络请求，获取 user 数据
const requestUser = id =>
    new Promise(resolve =>
        setTimeout(() => resolve({ id, name: `用户${id}`, age: 10 + id }), id * 100)
    );

// User 组件
const User = props => {
    const user = props.resource.read();
    return <div>当前用户是: {user.name}</div>;
};

// 通过 id 获取对应 resource
const getResource = id => wrapPromise(requestUser(id));

const App = () => {
    const [resource, setResource] = useState(getResource(10));
    const [isPending, startTransition] = useTransition();

    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <User resource={resource} />
            </Suspense>
+            {isPending ? <div>Loading</div> : null}
            <button
                onClick={() => startTransition(() => setResource(wrapPromise(requestUser(20))))}
            >
                切换用户
            </button>
        </>
    );
};

// 使用 react 18 新的并发模式写法进行 dom render
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// legacy 旧模式
// ReactDOM.render(<App />, document.getElementById('root')!)
```

此时点击按钮切换用户，会有 2s 左右的等待时间，就可以展示出 `loading`  状态，用来提示用户：

![isPending](https://raw.githubusercontent.com/beichensky/Blog/main/images/deps/16-7-isPending.gif)

所以，在使用 `useTransition` 时，一定要注意场景：

- 在明确知道耗时操作速度极快的情况下，可以直接使用返回值中的 `startTransition`

- 如果不能保证响应速度，还是需要使用 `isPending` 进行过渡状态的判断和展示

- 如果对于更新的优先级有较高的要求，可以不使用 `useTransition`

## 相关链接

- [使用 Vite 尝鲜 React 18](https://github.com/beichensky/Blog/issues/13)

- [React 18 新特性（一）：自动批量更新](https://github.com/beichensky/Blog/issues/14)

- [React 18 新特性（二）：Suspense & SuspenseList](https://github.com/beichensky/Blog/issues/15)

## 后记

好啦，关于 `startTransition`、`useDeferredValue`、`useTransition` 的用法和使用场景都已经介绍完了。

所有的代码均已在文中贴出。

文中有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。

如果喜欢或者有所帮助，欢迎 Star。
