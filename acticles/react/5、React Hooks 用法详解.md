本文对 16.8 版本之后 React 发布的新特性 Hooks 进行了详细讲解，并对一些常用的 Hooks 进行代码演示，希望可以对需要的朋友提供些帮助。

<!-- More -->

## 前言

本文已收录在 `Github`: https://github.com/beichensky/Blog 中，欢迎 Star！



## 一、Hooks 简介

`Hooks` 是 `React v16.7.0-alpha` 中加入的新特性。它可以让你在 `class` 以外使用 `state` 和其他 `React` 特性。
本文就是演示各种 `Hooks API` 的使用方式，对于内部的原理这里就不做详细说明。


-----



## 二、Hooks 初体验

`Foo.js`

``` js
import React, { useState  } from 'react';

function Foo() {
    // 声明一个名为“count”的新状态变量
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>
        </div>
    );
}

export default Foo;
```

`useState` 就是一个 `Hook`，可以在我们不使用 `class` 组件的情况下，拥有自身的 `state`，并且可以通过修改 `state` 来控制 `UI` 的展示。


-----



## 三、常用的两个 Hooks 


### 1、useState

#### 语法

> `const [state, setState] = useState(initialState)`

- 传入唯一的参数: `initialState`，可以是数字，字符串等，也可以是对象或者数组。
- 返回的是包含两个元素的数组：第一个元素，`state` 变量，`setState` 修改 `state` 值的方法。


#### 与在类中使用 `setState` 的异同点：

- 相同点：在一次渲染周期中调用多次 `setState`，数据只改变一次。
- 不同点：类中的 `setState` 是合并，而函数组件中的 `setState` 是替换。


#### 使用对比

之前想要使用组件内部的状态，必须使用 `class` 组件，例如：

`Foo.js`

``` js
import React, { Component } from 'react';

export default class Foo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        };
    }

    render() {
        return (
            <div>
            <p>You clicked {this.state.count} times</p>
            <button onClick={() => this.setState({ count: this.state.count + 1 })}>
                Click me
            </button>
            </div>
        );
    }
}
```

而现在，我们使用函数式组件也可以实现一样的功能了。也就意味着函数式组件内部也可以使用 `state` 了。

`Foo.js`

``` js
import React, { useState } from 'react';

function Foo() {
    // 声明一个名为“count”的新状态变量
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>
        </div>
    );
}

export default Foo;
```


#### 优化

创建初始状态是比较昂贵的，所以我们可以在使用 `useState` API 时，传入一个函数，就可以避免重新创建忽略的初始状态。

普通的方式：

``` js
// 直接传入一个值，在每次 render 时都会执行 createRows 函数获取返回值
const [rows, setRows] = useState(createRows(props.count));
```

优化后的方式（推荐）：

``` js
// createRows 只会被执行一次
const [rows, setRows] = useState(() => createRows(props.count));
```



### 2、useEffect

之前很多具有副作用的操作，例如网络请求，修改 UI 等，一般都是在 `class` 组件的 `componentDidMount` 或者 `componentDidUpdate` 等生命周期中进行操作。而在函数组件中是没有这些生命周期的概念的，只能 `return` 想要渲染的元素。
但是现在，在函数组件中也有执行副作用操作的地方了，就是使用 `useEffect` 函数。

#### 语法

> useEffect(() => { doSomething });

两个参数：

- 第一个是一个函数，是在第一次渲染以及之后更新渲染之后会进行的副作用。
  - 这个函数可能会有返回值，倘若有返回值，返回值也必须是一个函数，会在组件被销毁时执行。

- 第二个参数是可选的，是一个数组，数组中存放的是第一个函数中使用的某些副作用属性。用来优化 `useEffect`
  - 如果使用此优化，请确保该数组包含外部作用域中随时间变化且 `effect` 使用的任何值。 否则，您的代码将引用先前渲染中的旧值。
  - 如果要运行 `effect` 并仅将其清理一次（在装载和卸载时），则可以将空数组（[]）作为第二个参数传递。 这告诉 `React` 你的 `effect` 不依赖于来自 `props` 或 `state` 的任何值，所以它永远不需要重新运行。

> 虽然传递 [] 更接近熟悉的 `componentDidMount` 和 `componentWillUnmount` 执行规则，但我们建议不要将它作为一种习惯，因为它经常会导致错误。


#### 使用对比

假如此时我们有一个需求，让 `document` 的 `title` 与 `Foo` 组件中的 `count` 次数保持一致。

使用 类组件：

`Foo.js`

``` js
import React, { Component } from 'react';

export default class Foo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        };
    }

    componentDidMount() {
        document.title = `You clicked ${ this.state.count } times`;
    }

    componentDidUpdate() {
        document.title = `You clicked ${ this.state.count } times`;
    }

    render() {
        return (
            <div>
            <p>You clicked {this.state.count} times</p>
            <button onClick={() => this.setState({ count: this.state.count + 1 })}>
                Click me
            </button>
            </div>
        );
    }
}
```


而现在在函数组件中也可以进行副作用操作了。

`Foo.js`

``` js
import React, { useState, useEffect } from 'react';

function Foo() {
    // 声明一个名为“count”的新状态变量
    const [count, setCount] = useState(0);

    // 类似于 componentDidMount 和 componentDidUpdate:
    useEffect(() => {
        // 使用浏览器API更新文档标题
        document.title = `You clicked ${count} times`;
    });

    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>
        </div>
    );
}

export default Foo;
```

> 不仅如此，我们可以使用 useEffect 执行多个副作用（可以使用一个 useEffect 执行多个副作用，也可以分开执行）

``` js
useEffect(() => {
    // 使用浏览器API更新文档标题
    document.title = `You clicked ${count} times`;
});

const handleClick = () => {
    console.log('鼠标点击');
}

useEffect(() => {
    // 给 window 绑定点击事件
    window.addEventListener('click', handleClick);
});
```


> 现在看来功能差不多了。但是在使用类组件时，我们一般会在 `componentWillMount` 生命周期中进行移除注册的事件等操作。那么在函数组件中又该如何操作呢？

``` js
useEffect(() => {
    // 使用浏览器API更新文档标题
    document.title = `You clicked ${count} times`;
});

const handleClick = () => {
    console.log('鼠标点击');
}

useEffect(() => {
    // 给 window 绑定点击事件
    window.addEventListener('click', handleClick);

    return () => {
        // 给 window 移除点击事件
        window.removeEventListener('click', handleClick);
    }
});
```

可以看到，我们传入的第一个参数，可以 `return` 一个函数出去，**在组件被销毁时，会自动执行这个函数**。



#### 优化 useEffect

上面我们一直使用的都是 `useEffect` 中的第一个参数，传入了一个函数。那么 `useEffect` 的第二个参数呢？

`useEffect` 的第二个参数是一个数组，里面放入在 `useEffect` 使用到的 `state` 值，可以用作优化，只有当数组中 `state` 值发生变化时，才会执行这个 `useEffect`。

``` js
useEffect(() => {
    // 使用浏览器API更新文档标题
    document.title = `You clicked ${count} times`;
}, [ count ]);
```

> Tip：如果想模拟 class 组件的行为，只在 componetDidMount 时执行副作用，在 componentDidUpdate 时不执行，那么 `useEffect` 的第二个参数传一个 [] 即可。（但是不建议这么做，可能会由于疏漏出现错误） 


-----



## 四、其他 Hooks API

### 1、useContext

#### 语法

> `const value = useContext(MyContext);`

接受上下文对象（从中 `React.createContext` 返回的值）并返回该上下文的当前上下文值。当前上下文值由树中调用组件上方 `value` 最近的 `prop` 确定 `<MyContext.Provider>`。

`useContext(MyContext)` 则相当于 `static contextType = MyContext` 在类中，或者 `<MyContext.Consumer>`。


#### 用法

在 `App.js` 文件中创建一个 `context`，并将 `context` 传递给 `Foo` 子组件

`App.js`

``` js
import React, { createContext } from 'react';
import Foo from './Foo';

import './App.css';

export const ThemeContext = createContext(null);

export default () => {

    return (
        <ThemeContext.Provider value="light">
            <Foo />
        </ThemeContext.Provider>
    )
}
```

在 `Foo` 组件中，使用 `useContext` API 可以获取到传入的 `context` 值

`Foo.js`

``` js
import React, { useContext } from 'react';

import { ThemeContext } from './App';

export default () => {
    
    const context = useContext(ThemeContext);

    return (
        <div>Foo 组件：当前 theme 是：{ context }</div>   
    )
}
```


#### 注意事项

`useContext` 必须是上下文对象本身的参数：

- 正确： `useContext(MyContext)`
- 不正确： `useContext(MyContext.Consumer)`
- 不正确： `useContext(MyContext.Provider)`

> useContext(MyContext) 只允许您阅读上下文并订阅其更改。您仍然需要 <MyContext.Provider> 在树中使用以上内容来为此上下文提供值。



### 2、useReducer

#### 语法

> `const [state, dispatch] = useReducer(reducer, initialArg, init);`

`useState` 的替代方案。 接受类型为 `(state, action) => newState 的reducer`，并返回与 `dispatch` 方法配对的当前状态。

> 当你涉及多个子值的复杂 `state`(状态) 逻辑时，`useReducer` 通常优于 `useState` 。


#### 用法

`Foo.js`

``` js
import React, { useReducer } from 'react';

const initialState = {count: 0};

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return {count: state.count + 1};
        case 'decrement':
            return {count: state.count - 1};
        default:
            throw new Error();
    }
}

export default () => {
    
    // 使用 useReducer 函数创建状态 state 以及更新状态的 dispatch 函数
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <>
            Count: {state.count}
            <br />
            <button onClick={() => dispatch({type: 'increment'})}>+</button>
            <button onClick={() => dispatch({type: 'decrement'})}>-</button>
        </>
    );
}
```


#### 优化：延迟初始化

还可以惰性地创建初始状态。为此，你可以将init函数作为第三个参数传递。初始状态将设置为 `init(initialArg)`。

它允许你提取用于计算 `reducer` 外部的初始状态的逻辑。这对于稍后重置状态以响应操作也很方便：

`Foo.js`

``` js
import React, { useReducer } from 'react';

function init(initialCount) {
    return {count: initialCount};
}
  
function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return {count: state.count + 1};
        case 'decrement':
            return {count: state.count - 1};
        case 'reset':
            return init(action.payload);
        default:
            throw new Error();
    }
}

export default ({initialCount = 0}) => {
    
    const [state, dispatch] = useReducer(reducer, initialCount, init);
    return (
        <>
            Count: {state.count}
            <br />
            <button
                onClick={() => dispatch({type: 'reset', payload: initialCount})}>
                Reset
            </button>
            <button onClick={() => dispatch({type: 'increment'})}>+</button>
            <button onClick={() => dispatch({type: 'decrement'})}>-</button>
        </>
    );

}
```


#### 与 useState 的区别

- 当 `state` 状态值结构比较复杂时，使用 `useReducer` 更有优势。
- **使用 `useState` 获取的 `setState` 方法更新数据时是异步的；而使用 `useReducer` 获取的 `dispatch` 方法更新数据是同步的。**

针对第二点区别，我们可以演示一下：
在上面 `useState` 用法的例子中，我们新增一个 `button`：

`useState` 中的 `Foo.js`

``` js
import React, { useState } from 'react';

function Foo() {
    // 声明一个名为“count”的新状态变量
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>
            <button onClick={() => {
                setCount(count + 1);
                setCount(count + 1);
            }}>
                测试能否连加两次
            </button>
        </div>
    );
}

export default Foo;
```

> 点击 *测试能否连加两次* 按钮，会发现，点击一次， `count` 还是只增加了 1，由此可见，`useState` 确实是 **异步** 更新数据；

在上面 `useReducer` 用法的例子中，我们新增一个 `button`：
`useReducer ` 中的 `Foo.js`

``` js
import React, { useReducer } from 'react';

const initialState = {count: 0};

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return {count: state.count + 1};
        case 'decrement':
            return {count: state.count - 1};
        default:
            throw new Error();
    }
}

export default () => {
    
    // 使用 useReducer 函数创建状态 state 以及更新状态的 dispatch 函数
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <>
            Count: {state.count}
            <br />
            <button onClick={() => dispatch({type: 'increment'})}>+</button>
            <button onClick={() => dispatch({type: 'decrement'})}>-</button>
            <button onClick={() => {
                dispatch({type: 'increment'});
                dispatch({type: 'increment'});
            }}>
                测试能否连加两次
            </button>
        </>
    );
}
```

> 点击 *测试能否连加两次* 按钮，会发现，点击一次， count 增加了 2，由此可见，每次 dispatch 一个 action 就会更新一次数据，useReducer 确实是 **同步** 更新数据；



### 3、useCallback

#### 语法

> const memoizedCallback = useCallback(() => { doSomething(a, b); }, [a, b]);

返回值 `memoizedCallback` 是一个 `memoized` 回调。传递内联回调和一系列依赖项。`useCallback` 将返回一个回忆的memoized版本，该版本仅在其中一个依赖项发生更改时才会更改。

当将回调传递给依赖于引用相等性的优化子组件以防止不必要的渲染（例如 `shouldComponentUpdate`）时，这非常有用。

配合子组件使用 `PureComponent`、`memo` 时，可以减少子组件不必要的渲染次数

#### 用法

- 不使用 `useCallback` 的情况下给子组件传递函数

  `Foo.js`

  ``` js
  import React from 'react';
  
  const Foo = ({ onClick }) => {
      
      console.log('Foo：', 'render');
      return <button onClick={onClick}>Foo 组件按钮</button>
  
  }
  
  export default Foo
  ```

  

  `Bar.js`

  ``` js
  import React from 'react';
  
  const Bar = ({ onClick }) => {
  
      console.log('Bar：', 'render');
      return <button onClick={onClick}>Bar 组件按钮</button>;
  
  };
  
  export default Bar;
  ```

  `App.js`

  ``` js
  import React, { useState } from 'react';
  import Foo from './Foo';
  import Bar from './Bar';
  
  function App() {
      const [count, setCount] = useState(0);
  
      const fooClick = () => {
          console.log('点击了 Foo 组件的按钮');
      };
  
      const barClick = () => {
          console.log('点击了 Bar 组件的按钮');
      };
  
      return (
          <div style={{ padding: 50 }}>
              <p>{count}</p>
              <Foo onClick={fooClick} />
              <br />
              <br />
              <Bar onClick={barClick} />
              <br />
              <br />
              <button onClick={() => setCount(count + 1)}>count increment</button>
          </div>
      );
  }
  
  export default App;
  ```

  >  此时我们点击上面任意 count increment 按钮，都会看到控制台打印了两条输出， Foo 和 Bar 组件都会被重新渲染。但其实在我们当前的逻辑中，Foo 和 Bar 组件根本不需要重新 render

  现在我们使用 `useCallback` 进行优化

  

- 使用 `useCallback` 优化后的版本

  `Foo.js`

  ```js
  import React from 'react';
  
  const Foo = ({ onClick }) => {
  
      console.log('Foo：', 'render');
      return <button onClick={onClick}>Foo 组件按钮</button>;
  
  };
  
  export default React.memo(Foo);
  ```

  `Bar.js`

  ```js
  import React from 'react';
  
  const Bar = ({ onClick }) => {
  
      console.log('Bar：', 'render');
      return <button onClick={onClick}>Bar 组件按钮</button>;
  
  };
  
  export default React.memo(Bar);
  ```

  App.js

  ```js
  import React, { useCallback, useState } from 'react';
  import Foo from './Foo';
  import Bar from './Bar';
  
  function App() {
      const [count, setCount] = useState(0);
  
      const fooClick = useCallback(() => {
          console.log('点击了 Foo 组件的按钮');
      }, []);
  
      const barClick = useCallback(() => {
          console.log('点击了 Bar 组件的按钮');
      }, []);
  
      return (
          <div style={{ padding: 50 }}>
              <p>{count}</p>
              <Foo onClick={fooClick} />
              <br />
              <br />
              <Bar onClick={barClick} />
              <br />
              <br />
              <button onClick={() => setCount(count + 1)}>count increment</button>
          </div>
      );
  }
  
  export default App;
  ```

  > 此时点击 count increment 按钮，可以看到控制台没有任何输出。

  如果将 `useCallback` 或者 `React.memo` 移除，可以看到对应的组件又会出现不必要的 `render`

  

### 4、useMemo

#### 语法

> const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

返回一个memoized值。
传递“创建”函数和依赖项数组。`useMemo` 只会在其中一个依赖项发生更改时重新计算 `memoized` 值。此优化有助于避免在每个渲染上进行昂贵的计算。

> useMemo在渲染过程中传递的函数会运行。不要做那些在渲染时通常不会做的事情。例如，副作用属于 useEffect，而不是 useMemo。

#### 用法

- 可以进行数据的缓存，类似于 `Vue` 的 `computed`，可以根据依赖变化自动重新计算
- 可以帮助我们优化子组件的渲染，比如这种场景：
  在 App 组件中有两个子组件 Foo 和 Bar，当 App 组件中传给 Foo 组件的 `props` 发生变化时，App 组件状态会改变，重新渲染。此时 Foo 组件 和 Bar 组件 也都会重新渲染。其实这种情况是比较浪费资源的，现在我们就可以使用 `useMemo` 进行优化，Foo 组件用到的 `props` 变化时，只有 Foo 组件进行 `render`，而 Bar 却不会重新渲染。

例子：

`Foo.js`

``` js
import React from 'react';

export default ({ text }) => {
    
    console.log('Foo：', 'render');
    return <div>Foo 组件：{ text }</div>

}
```

`Bar.js`

``` js
import React from 'react';

export default ({ text }) => {
    
    console.log('Bar：', 'render');
    return <div>Bar 组件：{ text }</div>

}
```

`App.js`

``` js
import React, { useState } from 'react';
import Foo from './Foo';
import Bar from './Bar';

export default () => {

    const [a, setA] = useState('foo');
    const [b, setB] = useState('bar');

    return (
        <div>
            <Foo text={ a } />
            <Bar text={ b } />
            <br />
            <button onClick={ () => setA('修改后的 Foo') }>修改传给 Foo 的属性</button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <button onClick={ () => setB('修改后的 Bar') }>修改传给 Bar 的属性</button>
        </div>
    )
}
```

> 此时我们点击上面任意一个按钮，都会看到控制台打印了两条输出， A 和 B 组件都会被重新渲染。

现在我们使用 `useMemo` 进行优化

`App.js`

``` js
import React, { useState, useMemo } from 'react';
import Foo from './Foo';
import Bar from './Bar';

import './App.css';

export default () => {

    const [a, setA] = useState('foo');
    const [b, setB] = useState('bar');

+    const foo = useMemo(() => <Foo text={ a } />, [a]);
+    const bar = useMemo(() => <Bar text={ b } />, [b]);

    return (
        <div>
+            {/* <Foo text={ a } />
+            <Bar text={ b } /> */}
+            { foo }
+            { bar }
            <br />
            <button onClick={ () => setA('修改后的 Foo') }>修改传给 Foo 的属性</button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <button onClick={ () => setB('修改后的 Bar') }>修改传给 Bar 的属性</button>
        </div>
    )
}
```

> 此时我们点击不同的按钮，控制台都只会打印一条输出，改变 a 或者 b，A 和 B 组件都只有一个会重新渲染。

> useCallback(fn, deps) 相当于 useMemo(() => fn, deps)



### 5、useRef

#### 语法

> const refContainer = useRef(initialValue);

`useRef` 返回一个可变的 `ref` 对象，其 `.current` 属性被初始化为传递的参数（initialValue）。返回的对象将存留在整个组件的生命周期中。

- 从本质上讲，`useRef` 就像一个“盒子”，可以在其 `.current` 财产中保持一个可变的价值。
- `useRef Hooks` 不仅适用于 DOM 引用。 “ref” 对象是一个通用容器，其 `current` 属性是可变的，可以保存任何值（可以是元素、对象、基本类型、甚至函数），类似于类上的实例属性。
- `useRef` 具有闭包穿透的能力

> 注意：useRef() 比 ref 属性更有用。与在类中使用 instance(实例) 字段的方式类似，它可以 方便地保留任何可变值。

> 注意，内容更改时useRef 不会通知您。变异.current属性不会导致重新渲染。如果要在 React 将引用附加或分离到DOM节点时运行某些代码，则可能需要使用回调引用。


#### 用法

下面这个例子中展示了可以在 `useRef()` 生成的 `ref` 的 `current` 中存入元素、字符串

`Example.js`

``` js
import React, { useRef, useState, useEffect } from 'react'; 

export default () => {
    
    // 使用 useRef 创建 inputEl 
    const inputEl = useRef(null);

    const [text, updateText] = useState('');

    // 使用 useRef 创建 textRef 
    const textRef = useRef();

    useEffect(() => {
        // 将 text 值存入 textRef.current 中
        textRef.current = text;
        console.log('textRef.current：', textRef.current);
    });

    const onButtonClick = () => {
        // `current` points to the mounted text input element
        inputEl.current.value = "Hello, useRef";
    };

    return (
        <>
            {/* 保存 input 的 ref 到 inputEl */}
            <input ref={ inputEl } type="text" />
            <button onClick={ onButtonClick }>在 input 上展示文字</button>
            <br />
            <br />
            <input value={text} onChange={e => updateText(e.target.value)} />
        </>
    );

}
```

点击 *在 input 上展示文字* 按钮，就可以看到第一个 input 上出现 `Hello, useRef`；在第二个 input 中输入内容，可以看到控制台打印出对应的内容。



### 6、useLayoutEffect

#### 语法

> useLayoutEffect(() => { doSomething });

与 `useEffect Hooks` 类似，都是执行副作用操作。但是它是在所有 DOM 更新完成后触发。可以用来执行一些与布局相关的副作用，比如获取 DOM 元素宽高，窗口滚动距离等等。

> 进行副作用操作时尽量优先选择 useEffect，以免阻止视觉更新。与 DOM 无关的副作用操作请使用 `useEffect`。

#### 用法

用法与 `useEffect` 类似。但会在 `useEffect` 之前执行

`Foo.js`

``` js
import React, { useRef, useState, useLayoutEffect } from 'react'; 

export default () => {

    const divRef = useRef(null);

    const [height, setHeight] = useState(100);

    useLayoutEffect(() => {
        // DOM 更新完成后打印出 div 的高度
        console.log('useLayoutEffect: ', divRef.current.clientHeight);
    })
    
    return <>
        <div ref={ divRef } style={{ background: 'red', height: height }}>Hello</div>
        <button onClick={ () => setHeight(height + 50) }>改变 div 高度</button>
    </>

}
```



### 7、useImperativeHandle

在函数组件中，没有组件实例，所以无法像类组件中，通过绑定子组件的实例调用子组件中的状态或者方法。

那么在函数组件中，如何在父组件调用子组件的状态或者方法呢？答案就是使用 `useImperativeHandle`

####  语法

> useImperativeHandle(ref, createHandle, [deps])

- 第一个参数是 `ref` 值，可以通过属性传入，也可以配合 `forwardRef` 使用

- 第二个参数是一个函数，返回一个对象，对象中的属性都会被挂载到第一个参数 `ref` 的 `current` 属性上

- 第三个参数是依赖的元素集合，同 `useEffect`、`useCallback`、`useMemo`，当依赖发生变化时，第二个参数会重新执行，重新挂载到第一个参数的 `current` 属性上

#### 用法

注意：

- 第三个参数，依赖必须按照要求填写，少了会导致返回的对象属性异常，多了会导致 `createHandle` 重复执行
- 一个组件或者 `hook` 中，对于同一个 `ref`，只能使用一次 `useImperativeHandle`，多次的话，后面执行的 `useImperativeHandle` 的 `createHandle` 返回值会替换掉前面执行的 `useImperativeHandle` 的 `createHandle` 返回值

`Foo.js`

``` js
import React, { useState, useImperativeHandle, useCallback } from 'react';

const Foo = ({ actionRef }) => {
    const [value, setValue] = useState('');

    /**
     * 随机修改 value 值的函数
     */
    const randomValue = useCallback(() => {
        setValue(Math.round(Math.random() * 100) + '');
    }, []);

    /**
     * 提交函数
     */
    const submit = useCallback(() => {
        if (value) {
            alert(`提交成功，用户名为：${value}`);
        } else {
            alert('请输入用户名！');
        }
    }, [value]);

    useImperativeHandle(
        actionRef,
        () => {
            return {
                randomValue,
                submit,
            };
        },
        [randomValue, submit]
    );

    /* !! 返回多个属性要按照上面这种写法，不能像下面这样使用多个 useImperativeHandle
      useImperativeHandle(actionRef, () => {
          return {
              submit,
          }
      }, [submit])

      useImperativeHandle(actionRef, () => {
          return {
              randomValue
          }
      }, [randomValue])
  */

    return (
        <div className="box">
            <h2>函数组件</h2>
            <section>
                <label>用户名：</label>
                <input
                    value={value}
                    placeholder="请输入用户名"
                    onChange={e => setValue(e.target.value)}
                />
            </section>
            <br />
        </div>
    );
};

export default Foo;

```

`App.js`

```js
import React, { useRef } from 'react';
import Foo from './Foo'

const App = () => {
    const childRef = useRef();

    return (
        <div>
            <Foo actionRef={childRef} />
            <button onClick={() => childRef.current.submit()}>调用子组件的提交函数</button>
            <br />
            <br />
            <button onClick={() => childRef.current.randomValue()}>
                随机修改子组件的 input 值
            </button>
        </div>
    );
};

```


-----



## 五、尝试编写自定义 Hooks

这里我们就仿照官方的 `useReducer` 做一个自定义的 `Hooks`。

### 1、编写自定义 useReducer

在 `src` 目录下新建一个 `useReducer.js` 文件：

`useReducer.js`

``` js
import React, { useState } from 'react';

function useReducer(reducer, initialState) {
    const [state, setState] = useState(initialState);

    function dispatch(action) {
        const nextState = reducer(state, action);
        setState(nextState);
    }

    return [state, dispatch];
}
```

> Tip: Hooks 不仅可以在函数组件中使用，也可以在别的 Hooks 中进行使用。

### 2、使用自定义 useReducer

好了，自定义 `useReducer` 编写完成了，下面我们看一下能不能正常使用呢？

改写 `Foo` 组件

`Example.js`

``` js
import React from 'react';

// 从自定义 useReducer 中引入
import useReducer from './useReducer';

const initialState = {count: 0};

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return {count: state.count + 1};
        case 'decrement':
            return {count: state.count - 1};
        default:
            throw new Error();
    }
}

export default () => {
    
    // 使用 useReducer 函数创建状态 state 以及更新状态的 dispatch 函数
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <>
            Count: {state.count}
            <br />
            <button onClick={() => dispatch({type: 'increment'})}>+</button>
            <button onClick={() => dispatch({type: 'decrement'})}>-</button>
        </>
    );
}
```


-----


## 五、Hooks 使用及编写规范

- 不要从常规 `JavaScript` 函数调用 `Hooks`;

  

- 不要在循环，条件或嵌套函数中调用 `Hooks`;

  

- 必须在组件的顶层调用 `Hooks`;

  

- 可以从 `React` 功能组件调用 `Hooks`;

  

- 可以从自定义 `Hooks` 中调用 `Hooks`;

  

- 自定义 `Hooks` 必须使用 `use` 开头，这是一种约定;

-----



## 六、使用 React 提供的 ESLint 插件

根据上一段所写，在 `React` 中使用 `Hooks` 需要遵循一些特定规则。但是在代码的编写过程中，可能会忽略掉这些使用规则，从而导致出现一些不可控的错误。这种情况下，我们就可以使用 React 提供的 ESLint 插件：[eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)。下面我们就看看如何使用吧。

### 安装 ESLint 插件

``` bash
$ npm install eslint-plugin-react-hooks --save
```



### 在 .eslintrc 中使用插件

``` json
// Your ESLint configuration
// "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
// "react-hooks/exhaustive-deps": "warn" // Checks effect dependencies
{
  "plugins": [
    "react-hooks"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```


-----



## 七、参考文档

[React 官网](https://reactjs.org/docs/hooks-intro.html)

[React Hooks FAQ](https://reactjs.org/docs/hooks-faq.html)



## 写在后面

如果有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。

如果喜欢或者有所帮助，欢迎 Star，对作者也是一种鼓励和支持。