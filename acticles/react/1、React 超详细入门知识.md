
## 前言

本文已收录在 `Github`: [https://github.com/beichensky/Blog](https://github.com/beichensky/Blog) 中，欢迎 Star！

## Overview

本文共用 19 个例子，详细讲解了 React 基础入门知识，列举了相关 API 的使用方式，并且在每个 API 的说明中给出了详细的使用规则、建议以及注意事项。

对于不熟悉 React 的朋友，可以作为入门文档进行学习

对于已经掌握 React 的朋友，也可以作为 API 参考手册，用来查漏补缺

## Index

- [demo01：`jsx` 基本语法](#demo01)

- [demo02：在 `jsx` 语法中使用 `js`，条件判断以及循环](#demo02)

- [demo03：类组件以及函数组件声明方式](#demo03)

- [demo04：在组件中为元素绑定事件](#demo04)

- [demo05：父子组件的传值方式 `props` 以及 `props.children`](#demo05)

- [demo06：类组件如何修改自身状态：`setState`](#demo06)

- [demo07：`setState` 详细使用方法](#demo07)

- [demo08：类组件进行网络请求和添加监听事件的时机 `componentDidMount` 生命周期](#demo08)

- [demo09：类组件生命周期详解](#demo09)

- [demo10：受控组件的含义，Form 组件的使用和值的获取](#demo10)

- [demo11：函数组件修改自身状态、发送网络请求、添加事件监听的方式，`useState`、`useReducer` 以及 `useEffect` 的使用](#demo11)

- [demo12：类组件的错误边界处理：`static getDerivedStateFromError` 和 `componentDidCatch` 生命周期](#demo12)

- [demo13：高阶组件 `HOC` 的声明方式](#demo13)

- [demo14：组件中 `Context` 上下文的使用，`createContext` 以及 `useContext` 的基本使用](#demo14)

- [demo15：组件中 `ref` 转发的使用，`createRef` 以及 `useRef` 的基本使用](#demo15)

- [demo16：在函数组件中，父组件如何调用子组件中的状态或者函数: `useImperativeHandle`](#demo16)

- [demo17：`React` 中传送门 `createPortal` 的使用方式和场景](#demo17)

- [demo18：常用的组件优化方案：`Fragment`、`PureComponent`、`memo`](#demo18)

- [demo19：函数组件中方法以及变量的缓存方案 `useCallback`、`useMemo`](#demo19)

## HTML Template

`demo` 相关的代码都依赖以下模板

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React JSX</title>
    
    <style>
        .blue {
            color: blue;
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script src="../libs/react.min.js"></script>
    <script src="../libs/react-dom.min.js"></script>
    <script src="../libs/babel.min.js"></script>
    <script type="text/jsx">
        // 真正编写 jsx 代码的地方
    </script>
</body>

</html>
```

## Demo01

[demo](https://beichensky.github.io/example/react-demos/demo01/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo01/index.html)

`jsx` 语法的基本使用

类似于 `xml` 的代码格式，但是可以书写 `js` 逻辑

```js
// 利用 babel 可以直接在 javascript 环境下使用 jsx 语法

// 由于 class 是关键字，所以在 jsx 中给元素设置 class 需要使用 className
const jsx = (
  <div>
    <h1 className="blue">Hello React</h1>
    <p>用于构建用户界面的 JavaScript 库</p>
  </div>
);

ReactDOM.render(jsx, root);
```

## Demo02

[demo](https://beichensky.github.io/example/react-demos/demo02/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo02/index.html)

如何在 `jsx` 语法中编写 `js` 代码

- 在标签内需要使用 `js` 语法的时候，使用 `{}` 将 `js` 表达式包裹起来即可

- `{}` 中可以是 `js` 基础类型、引用类型（对象，数组等），也可以是 `js` 表达式

- 无论是标签内部还是标签属性，都需要在 `{}` 内才能使用 `js` 语法

- 使用 `{/*  */}` 可以在 `jsx` 语法中书写注释

下面演示在 `jsx` 中使用 `js` 的循环、条件判断语法

```js
const todoList = ['吃饭', '睡觉', '敲代码'];

function handleAlert() {
  alert('Hello React!')
}

const a = 1;
const b = 2;
const showModal = true;
const loadingStatus = 'refreshing';

const jsx = (
  <div>
    {/* style 可以使用对象的形式来写，style 的属性必须使用驼峰法则 */}
    <h1 style={{ fontSize: 24, color: 'blue' }}>Hello React</h1>

    {/* 逻辑运算符 */}
    {a === b && <section>等于</section>}

    {/* 三目运算符 */}
    {showModal ? <section>弹窗组件</section> : null}

    {/* 列表循环生成新数组，数组内元素会被直接渲染到界面，
            每个节点可以给一个 key 值，方便 react 在更新时的 diff 对比 */}
    <ul>
      {todoList.map(todo => <li key={todo}>{todo}</li>)}
    </ul>
    <p>
      {
        {
          'loading': '加载中。。。。',
          'refreshing': '点击刷新重试！',
          'no-more': '没有更多了'
        }[loadingStatus] /** loadingStatus 是 `loading`、`refreshing`、`no-more`  其中一种状态 **/
      }
    </p>

    {/* 添加事件 */}
    <button onClick={handleAlert}>弹出提示</button>
  </div>
);

ReactDOM.render(jsx, root);
```

## Demo03

[demo](https://beichensky.github.io/example/react-demos/demo03/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo03/index.html)

类组件和函数组件的声明和使用

下面的代码演示 React 组件的声明和使用

```js
// 1、类组件，需要继承 React.Component，render 函数的执行结果会被作为界面展示内容
class ClassComponent extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello, Class Component</h1>
      </div>
    );
  }
}

// 2、函数组件，本身就是一个函数，函数的执行结果会被作为界面展示内容
const FunctionComponent = () => {
  return (
    <div>
      <h1>Hello, Function Component</h1>
    </div>
  );
}

const App = () => (
  <div>
    <ClassComponent/>
    <FunctionComponent/>
  </div>
)

ReactDOM.render(<App/>, root);
```

## Demo04

[demo](https://beichensky.github.io/example/react-demos/demo04/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo04/index.html)

如何为函数组件和类组件中的元素添加事件绑定？

在类组件中，为元素绑定事件时，事件函数内可能会用到组件的一些属性或者方法，那么此时 `this` 指向会出现问题。目前可以使用以下三种解决办法：

- 使用箭头函数代替普通函数

- 使用 `bind` 函数绑定 `this` 指向

- 使用匿名函数的方式调用组件的属性或者方法

而函数组件中不存在这个问题

``` js
class ClassComponent extends React.Component {

    // 箭头函数
    arrowFunction = () => {
        console.log('使用箭头函数，this 指向：', this);
    }

    // bind 绑定 this
    bindFunction() {
        console.log('使用 bind 改变 this 指向：', this);
    }

    render() {
        return (
            <React.Fragment>
                <h3>类组件</h3>
                <div>
                    <button onClick={ this.arrowFunction }>箭头函数打印 this</button>
                    <br /><br />
                    <button onClick={ this.bindFunction.bind(this) }>bind 函数打印 this</button>
                    <br /><br />
                    <button onClick={() => console.log('匿名函数调用，this 指向：', this)}>匿名函数打印 this</button>
                </div>
            </React.Fragment>
        );
    }
}

/**
  * 在函数组件中，是不存在组件的 this 实例的，因此绑定事件时，不需要有类组件中的顾虑
  */
const FunctionComponent = () => {
    // 箭头函数
    const arrowFunction = () => {
        console.log('使用箭头函数');
    }

    // bind 绑定函数
    const bindFunction = function() {
        console.log('使用 bind 调用函数');
    }

    // 普通函数
    const normalFunction = function() {
        console.log('调用普通函数');
    }
    return (
        <React.Fragment>
            <h3>函数组件</h3>
            <div>
                <button onClick={ arrowFunction }>普通函数</button>
                <br /><br />
                <button onClick={ arrowFunction }>箭头函数</button>
                <br /><br />
                <button onClick={ bindFunction.bind(this) }>bind 函数</button>
                <br /><br />
                <button onClick={() => console.log('匿名函数调用')}>匿名函数</button>
            </div>
        </React.Fragment>
    );
}

const App = () => (
    <div>
        <ClassComponent />
        <FunctionComponent />
    </div>
)

ReactDOM.render(<App />, root);
```

## Demo05

[demo](https://beichensky.github.io/example/react-demos/demo05/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo05/index.html)

`React` 组件中父子组件传值的方式：`props`

- 类组件的实例上会挂载 `props` 属性，包含父组件传递过来的所有参数
- 函数组件会接受一个 `props` 参数，包含父组件传递过来的所有参数
- `props` 中会包含一个 `children` 属性，标签内的所有内容都会被存放到 `children` 中。可以是标签、组件或者文本

``` js
/**
  * 1、类组件的实例上会挂载 props 属性，包含父组件传递过来的所有参数
  *
  * props 中会包含一个 children 属性，标签内的所有内容都会被存放到 children 中。
  * 可以是标签、组件或者文本
  */
class ClassComponent extends React.Component {
    render() {
        return (
            <div className="box">
                <h1>Class Component</h1>
                <p>Receive Message: { this.props.msg }</p>
                { this.props.children }
            </div>
        );
    }
}

/**
  * 2、函数组件会接受一个 props 参数，包含父组件传递过来的所有参数
  *
  * props 中会包含一个 children 属性，标签内的所有内容都会被存放到 children 中。
  * 可以是标签、组件或者文本
  */
const FunctionComponent = (props) => {
    return (
        <div className="box">
            <h1>Function Component</h1>
            <p>Receive Message: { props.msg }</p>
            { props.children }
        </div>
    );
}

const App = () => (
    <div>
        <h1>App</h1>
        <ClassComponent msg="App 传递过来的 msg 信息">
            App 传递过来的 children 是文本
        </ClassComponent>
        <FunctionComponent  msg="App 传递过来的 msg 信息">
            App 传递过来的 children 是 ClassComponent 组件：
            <ClassComponent msg="Function Component 传递过来的 msg 信息"/>
        </FunctionComponent>
    </div>
);

ReactDOM.render(<App />, root);
```

## Demo06

[demo](https://beichensky.github.io/example/react-demos/demo06/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo06/index.html)

React 类组件如何控制自身状态变化并触发界面更新？

- 类组件中通过 `state` 属性控制自身状态变化，导致组件重新进行渲染（`render`）

- 类组件在 `state` 属性中对数据进行初始化，`state` 是一个对象

- 通过实例的 `setState` 函数可以更新 `state` 内容，重新渲染界面

- `setState` 接受两个参数，第一个参数是对象或者是函数，第二个参数回调函数 `callback`

  - 第一个参数是对象时，直接将对象和 `state` 进行合并，设置为新的 `state` 值

  > 例如 state 初始值为 {a: 1, b: 2}, setState({ b, 3 })，那么新的 state 为 { a: 1, b: 3 }

    - 第一个参数为函数时，函数的参数就是上一次 `state` 值，返回值就是希望更新的对象，更新规则同上

  > 例如 state 初始值为 {a: 1, b: 2}，setState((prevState) => ({ b: prevState.b - 1 }))，那么新的 state 为 { a: 1, b: 1 }

``` js
class App extends React.Component {

    state = {
        count: 0
    }

    increment = () => {
        this.setState({
            count: this.state.count + 1
        }, () => {
            console.log(`最新的 state 值：${this.state.count}`)
        });
    }

    decrement = () => {
        this.setState((prevState) => ({
            count: prevState.count - 1
        }));
    }

    render() {
        return (
            <div>
                <p>count: { this.state.count }</p>
                <button onClick={ this.increment }>increment</button>
                <br />
                <br />
                <button onClick={ this.decrement }>decrement</button>
            </div>
        );
    }
}

ReactDOM.render(<App />, root);
```

## Demo07

[demo](https://beichensky.github.io/example/react-demos/demo07/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo07/index.html)

**类组件中 `setState` 用法详解**

- 在同一 `React` 事件中，多次 `setState` 会被合并
- 在原生事件中，多个 `setState` 不会被合并，会按顺序执行
- 在定时器中（无论是多个定时器中分别执行 `setState`，还是一个定时器中执行 `setState` ）执行 `setState`，不会被合并，会按照代码顺序执行

``` js
class App extends React.Component {

    state = {
        count: 0
    }

    handleClick = () => {
        // 1、同一 React 事件内的多次 setState 会被合并，最终的结果 count 只会 + 1

        this.setState({
            count: this.state.count + 2
        });

        this.setState({
            count: this.state.count + 1
        });
    }

    handleCallbackClick = () => {
        /*
          * 2、setState 第二个参数是一个回调函数 callback，当上一次 setState 完成时，会触发这个回调函数
          * 在 callback 内部可以获取到最新的 state 值
          */

        // 3、这种写法 setState 也不会被合并，两次操作都会按顺序执行

        this.setState({
            count: this.state.count + 2
        }, () => {
            this.setState({
                count: this.state.count + 1
            })
        });
    }

    handleSetTimeoutClick = () => {
        // 3、使用 setTimeout 的方式使用 setState 不会被合并，两次操作都会按顺序执行

        setTimeout(() => this.setState({ count: this.state.count + 2 }));
        setTimeout(() => this.setState({ count: this.state.count + 1 }));
    }

    handleOriginClick = () => {
        // 4、在绑定的原生事件中多次调用 setState 不会被合并，两次操作都会执行

        this.setState({
            count: this.state.count + 2
        });

        this.setState({
            count: this.state.count + 1
        });
    }

    componentDidMount() {
        const originBtn = document.querySelector('#originBtn');
        originBtn.addEventListener('click', this.handleOriginClick, false);
    }

    componentWillUnmount() {
        const originBtn = document.querySelector('#originBtn');
        originBtn.removeEventListener('click', this.handleOriginClick, false);
    }

    render() {
        return (
            <div>
                <p>count: { this.state.count }</p>
                <button onClick={ this.handleClick }>increment</button>
                <br />
                <br />
                <button onClick={ this.handleCallbackClick }>callback increment</button>
                <br />
                <br />
                <button onClick={ this.handleSetTimeoutClick }>setTimeout increment</button>
                <br />
                <br />
                <button id="originBtn">origin event increment</button>
            </div>
        );
    }
}

ReactDOM.render(<App />, root);
```

## Demo08

[demo](https://beichensky.github.io/example/react-demos/demo08/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo08/index.html)

在类组件中进行 *异步操作* 或者 *为元素绑定原生事件* 的时机：`componentDidMount`

``` js
function fetchData() {
    return new Promise(rseolve => {
        setTimeout(() => {
            const todoList = [
                { id: 1, name: '吃饭'},
                { id: 2, name: '睡觉'},
                { id: 3, name: '敲代码'},
            ];
            rseolve(todoList);
        }, 1000)
    });
}

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            todos:[],
            toggle: true,
            loading: true,
        }
    }

    handleWindowClick = () => {
        this.setState({ toggle: !this.state.toggle });
    }

    componentDidMount() {

        // 1、网络请求
        fetchData()
            .then(result => {
                this.setState({ todos: result });
            })
            .finally(() => {
                this.setState({ loading: false });
            });

        // 2、添加事件监听
        window.addEventListener('click', this.handleWindowClick, false);
    }

    componentWillUnmount() {
        // 移除事件监听
        window.removeEventListener('click', this.handleWindowClick, false);
    }
    
    render() {
        const { todos, toggle, loading } = this.state;
        return (
            <React.Fragment>
                <span style={{ color: 'gray', fontSize: 14 }}>随便点点试试</span>
                <h1 className="ani" style={{ height: toggle ? 50 : 200 }}>Hello React</h1>
                {
                    loading ? 
                        <p>Loading ...</p> :
                        <ul>
                            { todos.map(todo => <li key={ todo.id }>{ todo.name }</li>) }
                        </ul>
                }
                
            </React.Fragment>
        );
    }
}

ReactDOM.render(<App />, root);
```

## Demo09

[demo](https://beichensky.github.io/example/react-demos/demo09/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo09/index.html)

`React` 类组件各生命周期触发时机

更多内容可参考这里：**[React 类组件生命周期详解](https://github.com/beichensky/Blog/issues/3)**

``` js
/**
  * 生命周期执行过程
  *
  * 初始化：constructor -> static getDerivedStateFromProps -> render -> componentDidMount
  * 更新：static getDerivedStateFromProps -> shouldComponentUpdate -> render -> getSnapshotBeforeUpdate -> componentDidUpdate
  * 销毁：componentWillUnmount
  */

class LifeCycleComponent extends React.Component {

    /**
      * 组件初次渲染或者更新之前触发
      *
      * 返回值会作为新的 state 值与组件中之前的 state 进行合并
      */
    static getDerivedStateFromProps(nextProps, prevState) {
        console.log('LifeCycleComponent >>>', 'getDerivedStateFromProps ----', 'init or update');
        return null;
    }

    /**
      * 组件创建时调用
      * 可以在这里做一些初始化操作
      */
    constructor(props) {
        super(props);
        console.log('LifeCycleComponent >>>', 'constructor ----', 'init');
        this.state = {
            count: 0
        }
    }

    /**
      * 组件初次挂载完成时触发
      * 可以在这里处理一些异步操作，比如：事件监听，网络请求等
      */
    componentDidMount() {
        console.log('LifeCycleComponent >>>', 'componentDidMount ----', 'mounted');
    }

    /**
      * 组件触发更新时调用，决定组件是否需要更新
      * 返回 true，则组件会被更新，返回 false，则组件停止更新
      */
    shouldComponentUpdate(nextProps, nextState) {
        console.log('LifeCycleComponent >>>', 'shouldComponentUpdate ----', 'need update ? ');
        return true;
    }

    /**
      * 组将 render 之后，提交更新之前触发，返回值会作为 componentDidUpdate 的第三个参数传入
      */
    getSnapshotBeforeUpdate(prevProps, prevState) {
        console.log('LifeCycleComponent >>>', 'getSnapshotBeforeUpdate ----', 'before update');
        return null;
    }

    /**
      * 组件更新结束后触发
      */
    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('LifeCycleComponent >>>', 'componentDidUpdate ----', 'updated');
    }

    /**
      * 组将即将被卸载时触发
      */
    componentWillUnmount() {
        console.log('LifeCycleComponent >>>', 'componentWillUnmount ----', 'will unmount');
    }

    increment = () => {
        const { count } = this.state;
        this.setState({
            count: count + 1
        });
    }

    /**
      * 渲染函数 render
      */
    render() {
        console.log('LifeCycleComponent >>>', 'render');
        const { msg } = this.props;
        const { count } = this.state;
        return (
            <div>
                <h1>LifeCycleComponent</h1>
                <p>Receive Message: { msg }</p>
                <p>count: { count }</p>
                <button onClick={ this.increment }>increment</button>
            </div>
        );
    }
}

class App extends React.Component {

    state = {
        message: 'Hello World',
        show: true
    }

    render() {
        const { message, show } = this.state;
        return (
            <div>
                <button onClick={ () => this.setState({ message: 'Hello React' }) }>修改 message </button> | {' '}
                <button onClick={ () => this.setState({ show: !show }) }>
                    { show ? '销毁 LifeCycleComponent' : '创建 LifeCycleComponent' }
                </button>
                { show && <LifeCycleComponent msg={ message } /> }
            </div>
        );
    }
}

ReactDOM.render(<App />, root);
```

## Demo10

[demo](https://beichensky.github.io/example/react-demos/demo10/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo10/index.html)

React 中受控组件的定义和使用

类似于 `vue` 中的 `v-model`

定义：组件的值受 `React` 中状态的控制，组件的变化会导致 `React` 中状态的更新

``` js
/**
  * 受控组件：
  *      组件的属性值会受到 React state 的控制，
  *      并且在组件的属性值发生变化时，React 的 state 值会做相应的修改。
  */

class App extends React.Component {

    state = {
        username: ''
    }

    handleNameChange = (e) => {
        this.setState({ username: e.target.value });
    }

    handleSubmit = () => {
        const { username } = this.state;
        if (username) {
            alert(`提交成功，username = ${ username }`);
        } else {
            alert('请填写用户名！');
        }
    }

    render() {
        const { username } = this.state
        return (
            <div>
                <p>username: { username }</p>
                <section>
                    <label>用户名：</label>
                    <input
                        placeholader="请输入用户名"
                        value={ username }
                        onChange={ this.handleNameChange }
                    />
                </section>
                <br />
                <button onClick={ this.handleSubmit }>submit</button>
            </div>
        );
    }
}

ReactDOM.render(<App />, root);
```

## Demo11

[demo](https://beichensky.github.io/example/react-demos/demo11/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo11/index.html)

> 如何在 React 函数组件中控制自身状态变化以及副作用处理？

函数组件中控制自身状态的相关 `hooks`：`useState` 和 `useReducer`

函数组件中处理副作用相关的 `hooks`: `useLayoutEffect` 和 `useEffect`

- `useState: [state, setState] = useState(initState)`
  - `initState` 可以是函数，也可以是值，函数的话，仅会在组件创建时执行一次，返回值作为 `state` 的初始值

  - 组件中可以使用多次 `useState`，创建出不同的状态

  - **与 类组件中的 `setState` 不同的地方在于，同一 `React` 事件中，多次 `setState` 会被最后一次的替换**，其他逻辑相似

- `useReducer: [state, dispatch] = useState(reducer)`

  - `reducer` 是一个函数，第一个参数是上一次的 state 值；第二个参数是传入的 `action`，不传的话则没有。返回值会作为新的 `state` 进行使用

- `useEffect: useEffect(() => doSomething, deps)`

  - `useEffect` 是副作用执行 `hook`，第一次组件渲染完毕或依赖的 `deps` `发生变化时，doSomething` 逻辑都会被执行

  - `deps` 是一个数组，发生变化的判断标准是将 `deps` 中的依赖进行前后两次的浅比较

- `useLayoutEffect: useLayoutEffect(() => doSomething, deps)`
  - `useLayoutEffect` 也是副作用执行 `hook`，同 `useEffect`，第一次组件渲染完毕或依赖的 `deps` `发生变化时，doSomething` 逻辑都会被执行
  - 与 `useEffect` 不同的地方在于，组件渲染完毕，会同步执行 `useLayoutEffect`，而异步执行 `useEffect`
  - 当需要处理与界面元素尺寸相关的逻辑时，可以使用 `useLayoutEffect`

- 同一帧的 `useLayoutEffect` 会在 `useEffect` 前执行

``` js
/**
  * 为了能够在函数组件中也能使用状态、执行副作用等操作，引入了 hooks 的概念
  * 
  * useState: 函数组件也可以拥有自身状态
  *
  * useReducer: useState 的升级版，可以根据不同操作返回不同的状态值
  *
  * useEffect 用法：
  *      1、第一个参数是副作用函数，第二个参数是依赖项集合
  *      2、副作用函数的返回值可以是一个函数，会在当前 useEffect 被销毁时执行，可以在这里做一些状态回收，事件解除等操作
  *      3、依赖项发生变化时，副作用操作会重新执行
  *      4、希望 useEffect 只执行一次，则可以给依赖项一个空数组
  *      5、希望组件的每次更新都执行 useEffect，可以不写依赖项
  */

const { useState, useEffect, useReducer, useLayoutEffect } = React;

const App = () => {
    // 
    const [count, setCount] = useState(0);
    const [num, dispatch] = useReducer((state, action) => {
        switch(action.type) {
            case 'INCREMENT': 
                return state + 1;
            case 'DECREMENT': 
                return state - 1;
            default:
                return state;
        }
    }, 0)

    useEffect(() => {
        console.log('useEffect')
        // 执行异步操作获取数据
        setCount(10);
    }, [])

    useLayoutEffect(() => {
        console.log('useLayoutEffect')
        // 绑定事件
        const handleClick = () => {
            alert(count);
        }
        const box = document.querySelector('#box');
        box.addEventListener('click', handleClick, false);

        return () => {
            box.removeEventListener('click', handleClick, false);
        }
    }, [count])

    return (
        <div>
            <p>count: { count }</p>
            <button onClick={() => setCount(count + 1)}>count increment</button>
            <p>num: { num }</p>
            <button onClick={() => dispatch({ type: 'INCREMENT' })}>num increment</button> | {' '}
            <button onClick={() => dispatch({ type: 'DECREMENT' })}>num decrement</button>
            <br />
            <br />
            <button id="box">alert count</button>
        </div>
    );
}

ReactDOM.render(<App />, root)
```

## Demo12

[demo](https://beichensky.github.io/example/react-demos/demo12/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo12/index.html)

`React` 中错误边界处理

- 组件出现异常，会触发 `static getDerivedStateFromError` 和 `componentDidCatch` 生命周期

- `static getDerivedStateFromError` 的返回值会合并到组件的 `state` 中作为最新的 `state` 值

``` js
/**
  * 错误边界处理：组件出现异常，会触发 static getDerivedStateFromError 和 componentDidCatch 生命周期
  * 
  * static getDerivedStateFromError 的返回值会合并到组件的 state 中作为最新的 state 值
  */

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            errorMsg: ''
        };
    }
    
    static getDerivedStateFromError(error) {
        // 更新 state 使下一次渲染能够显示降级后的 UI
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        this.setState({errorMsg: error.message})
        console.log('异常信息：', error, ' , ', errorInfo )
    }
    
    render() {
        const { hasError, errorMsg } = this.state;
        if (hasError) {
            // 你可以自定义降级后的 UI 并渲染
            return <h1>Something went wrong, Error Message: {errorMsg}</h1>;
        }
    
        return this.props.children; 
    }
}

const App = () => {
    const [count, setCount] = React.useState(0);

    if (count > 0) {
        throw TypeError('数据异常');
    }

    return (
        <div>
            <h2>App 组件</h2>
            <p>count: { count }</p>
            <button onClick={() => setCount(count + 1)}>increment</button>
        </div>
    );
}

ReactDOM.render(<ErrorBoundary><App /></ErrorBoundary>, root);
```

## Demo13

[demo](https://beichensky.github.io/example/react-demos/demo13/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo13/index.html)

React 高阶组件（HOC）的两种创建方式

- 属性代理（`Props Proxy`）：类组件和函数组件都可以使用

- 反向继承（`Inheritance Inversion`，缩写 `II` )：只用类组件可以使用

``` js
/**
  * 高阶组件的两种创建方式
  *  1、属性代理（Props Proxy）：类组件和函数组件都可以使用
  *  2、反向继承（Inheritance Inversion, 缩写II)：只用类组件可以使用
  */

  /**
  * 通过属性代理的方式向组件中注入 permission 属性
  */
function ComposeHOC(OriginComponent) {
    const permission = 'edit permission from ComposeHOC'
    return (props) => <OriginComponent {...props} permission={permission} />
}

/**
  * 通过反向继承的方式向组件中注入 DOM 节点
  */
function iiHOC(OriginComponent) {
    return class WrapperComponent extends OriginComponent {

        render() {
            return <div>
                    <h1>Title from iiHOC</h1>
                    { super.render() }
                </div>;
        }
    }
}

const ComponentA = (props) => <h2 className="box">ComponentA props permission: { props.permission }</h2>
class ComponentB extends React.Component {
    render() {
        return <h2 className="box">ComponentB</h2>;
    }
}

// 使用高阶组件包裹 A、B 组件
const WrapperComponentA = ComposeHOC(ComponentA);
const WrapperComponentB = iiHOC(ComponentB);


const App = () => (<div><WrapperComponentA /><WrapperComponentB /></div>);

ReactDOM.render(<App />, root);
```

## Demo14

[demo](https://beichensky.github.io/example/react-demos/demo14/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo14/index.html)

`Context` 在类组件和函数组件中的使用

- 创建 `Context`： `const { Provider, Consumer } = React.createContext()`
- 使用
  - 在类组件或者函数组件中，均可使用 `Provider` 标签包裹住父组件，则在任意深度的子孙组件中，都可以在 `Consumer` 标签中通过 `renderProps` 的方式获取到对应 `Context` 的值
- 在函数组件中亦可以通过更简便的方式 `useContext()` 获取到对应 `Context` 的值

更多 `Context` 用法可参考这里：**[React 中 Context 用法详解](https://github.com/beichensky/Blog/issues/2)**

``` js
const { createContext, Component, useContext, useState } = React;

/**
 * createContext:    创建 context 上下文
 * Context.Provider: 需要对子组件进行包裹，在能在子组件中获取到 context 中的 value
 * Context.Consumer: 在类组件中使用 Render Props 的方式 context 上下文
 * useContext:       在函数组件中使用 context 上下文
 */

const UserContext = React.createContext();
const { Provider, Consumer } = UserContext;

class ClassComponent extends React.Component {
    render() {
        return (
            <div className="box">
                <h2>类组件</h2>
                <Consumer>
                    {user => (<div>name: { user.name }</div>)}
                </Consumer>
            </div>
        );
    }
}

const FunctionComponent = () => {
    const user = useContext(UserContext);
    return (
        <div className="box">
            <h2>函数组件</h2>
            <div>name: { user.name }</div>
        </div>
    );
}

const App = () => {
    const [user, setUser] = useState({ name: '孙悟空' });

    return (
        <Provider value={user}>
            <h1>App</h1>
            <label>Change name:</label>
            <input
                placeholder="请输入用户名称"
                value={user.name}
                onChange={(e) => setUser({ name: e.target.value })}
            />
            <ClassComponent />
            <FunctionComponent />
        </Provider>
    );
}

ReactDOM.render(<App />, root);
```

## Demo15

[demo](https://beichensky.github.io/example/react-demos/demo15/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo15/index.html)

> 类组件和函数组件中 `ref` 的使用

- 作用
  - 可以作为 `DOM` 节点或者 `React` 组件的引用
  - 在函数组件中还可以用来将任意值转化为带有 current 属性的对象

- 创建 `ref`：
  - 类组件中：`ref = React.createRef()`
  - 函数组件中：`ref = useRef()`

- 使用：
  - 类组件中，`ref` 直接作为元素的 `ref` 属性使用，给子组件设置 `ref` 时，需要配合 `forwardRef` 包裹子组件
  - 函数组件中，`ref` 可以作为元素或者组件的 `ref`，也可以只作为一个变量使用，将变量随函数组件的创建而创建，销毁而销毁

``` js
const { createRef, useRef } = React;

/**
 * createRef：在类组件中为元素设置 ref
 * useRef： 在函数组件中为元素设置 ref
 *
 * 之前使用受控组件的方式进行表单提交。其实也可以使用 ref 的方式操作非受控组件
 */

class ClassComponent extends React.Component{
    inputRef = createRef();

    submit = () => {
        const { value } = this.inputRef.current;
        if (value) {
            alert(`提交成功，用户名为：${ value }`);
        } else {
            alert('请输入用户名！');
        }
    }

    render() {
        return (
            <div className="box">
                <h2>类组件</h2>
                <section>
                    <label>用户名：</label>
                    <input ref={ this.inputRef } placeholder="请输入用户名" />
                </section>
                <br />
                <button onClick={ this.submit }>提交</button>
            </div>
        );
    }
}

const FunctionComponent = () => {
    const inputRef = useRef();

    const submit = () => {
        const { value } = inputRef.current;
        if (value) {
            alert(`提交成功，用户名为：${ value }`);
        } else {
            alert('请输入用户名！');
        }
    }

    return (
        <div className="box">
            <h2>函数组件</h2>
            <section>
                <label>用户名：</label>
                <input ref={ inputRef } placeholder="请输入用户名" />
            </section>
            <br />
            <button onClick={ submit }>提交</button>
        </div>
    );
}

const App = () =>  (
    <div>
        <ClassComponent />
        <FunctionComponent />
    </div>
)

ReactDOM.render(<App />, root);
```

## Demo16

[demo](https://beichensky.github.io/example/react-demos/demo16/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo16/index.html)

> 在函数组件中，父组件如何调用子组件中的状态或者函数：使用`useImperativeHandle`

用法：`useImperativeHandle(ref, createHandle, [deps])`

- 第一个参数是 `ref` 值，可以通过属性传入，也可以配合 `forwardRef` 使用

- 第二个参数是一个函数，返回一个对象，对象中的属性都会被挂载到第一个参数 `ref` 的 `current` 属性上

- 第三个参数是依赖的元素集合，同 `useEffect`、`useCallback`、`useMemo`，当依赖发生变化时，第二个参数会重新执行，重新挂载到第一个参数的 `current` 属性上

注意事项

- 第三个参数，依赖必须按照要求填写，少了会导致返回的对象属性异常，多了会导致 `createHandle` 重复执行

- 一个组件或者 `hook` 中，对于同一个 `ref`，只能使用一次 `useImperativeHandle`，多次的话，后面执行的 `useImperativeHandle` 的 `createHandle` 返回值会替换掉前面执行的 `useImperativeHandle` 的 `createHandle` 返回值

```js
const { useState, useRef, useImperativeHandle, useCallback } = React;

const ChildComponent = ({ actionRef }) => {

  const [value, setValue] = useState('')

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

  useImperativeHandle(actionRef, () => {
    return {
      randomValue,
      submit,
    }
  }, [randomValue, submit])

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
        <input value={value} placeholder="请输入用户名" onChange={e => setValue(e.target.value)}/>
      </section>
      <br/>
    </div>
  );
}

const App = () => {

  const childRef = useRef();

  return (
    <div>
      <ChildComponent actionRef={childRef}/>
      <button onClick={() => childRef.current.submit()}>调用子组件的提交函数</button>
      <br/>
      <br/>
      <button onClick={() => childRef.current.randomValue()}>随机修改子组件的 input 值</button>
    </div>
  )
}

ReactDOM.render(<App/>, root);
```

## Demo17

[demo](https://beichensky.github.io/example/react-demos/demo17/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo17/index.html)

`React` 中传送门 `Portals` 的使用：可以将指定 `React` 元素挂载到任意的 `DOM` 节点上去， 虽然在层级关系上，看起来实在父组件下，但在界面上是挂载到了指定的 `DOM` 节点上

> 官网解释：`Portal` 提供了一种将子节点渲染到存在于父组件以外的 `DOM` 节点的优秀的方案。

用法: `ReactDOM.createPortal(child, container)`

- 第一个参数是任何可渲染的 `React` 元素
- 第二个参数是一个真实 `DOM` 元素

`Portals` 的典型用例是当父组件有 `overflow: hidden` 或 `z-index` 样式时， 但你需要子组件能够在视觉上“跳出”其容器。例如，对话框、悬浮卡以及提示框。

> 注意：**尽管 portal 可以被放置在 DOM 树中的任何地方，但在任何其他方面，其行为和普通的 React 子节点行为一致。**
> 由于 portal 仍存在于 React 树， 且与 DOM 树 中的位置无关，那么无论其子节点是否是 portal，像 context 这样的功能特性都是不变的。包含事件冒泡。

```js
/**
 * 通过 createPortal API，将 Modal 组件的真实节点挂载到新建的 div 元素上去
 * 虽然在 React 树中，Modal 组件仍然在 App 组件中，但是在界面上，Modal 节点其实是挂载在了新的 div 节点上
 */

const { useEffect, useState } = React;
const { createPortal } = ReactDOM;

const modalRoot = document.createElement('div');

/**
 * Modal: 弹窗组件
 */
function Modal({ children, onCancel }) {

  useEffect(() => {
    document.body.appendChild(modalRoot);
    return () => {
      document.body.removeChild(modalRoot);
    }
  })

  return createPortal(
    <div className="modal">
      <div className="modal-inner">
        <div className="mask"/>
        <section className="modal-content-wrapper">
          <div className="modal-content">
            <header>
              <h1>提示弹窗</h1>
            </header>
            <hr/>
            <content>{children}</content>
            <footer>
              <button onClick={onCancel}>关闭</button>
            </footer>
          </div>
        </section>
      </div>
    </div>,
    modalRoot
  );
}

const App = () => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <h1>App</h1>
      <br/>
      <button onClick={() => setVisible(true)}>展示弹窗</button>
      {visible && <Modal onCancel={() => setVisible(false)}>
        自定义内容
      </Modal>}
    </div>
  );
}

ReactDOM.render(<App/>, root);
```

## Demo18

[demo](https://beichensky.github.io/example/react-demos/demo18/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo18/index.html)

优化 `React` 组件的几种方式

- `Fragment`: 可以作为标签包裹子元素，并不会在 `DOM` 中生成真实节点
- `PureComponent`: 会对类组件的 `props` 和 `state` 做一次浅比较，只有当数据发生变化式，组件才会重新渲染
  - 关于 `PureComponent` 的更多内容可以参考这里：**[PureComponent 使用注意事项以及源码解析](https://github.com/beichensky/Blog/issues/4)**
- `memo`: 作用和 `PureComponent` 类似，只不过是作为高阶组件，作用在函数组件上

``` js
const { Fragment, PureComponent, memo, useState, Component } = React;

class ClassComponent extends PureComponent {

    render() {
        console.log('PureComponent render');
        return (
            <div className="box">
                <h1>PureComponent 组件</h1>
                <p>count: {this.props.count}</p>
            </div>
        );
    }
}

const FunctionComponent = memo((props) => {
    console.log('memo function render');

    return (
        <div className="box">
            <h1>memo 函数组件</h1>
            <p>num: {props.num}</p>
        </div>
    );
})

const App = () => {
    const [count, setCount] = useState(0);
    const [num, setNum] = useState(0);
    return (
        <Fragment>
            <p>打开控制台查看 render 日志</p>
            <div>
                <button onClick={ () => setCount(count + 1) }>increment count</button> | {' '}
                <button onClick={ () => setNum(num + 1) }>increment num</button>
                <ClassComponent count={ count }/>
                <FunctionComponent num={ num }/>
            </div>
        </Fragment>
    );
}

ReactDOM.render(<App />, root);
```

## Demo19

[demo](https://beichensky.github.io/example/react-demos/demo19/) / [source](https://github.com/beichensky/Blog/blob/main/react-demos/demo19/index.html)

提升函数组件性能常用的两个 `hooks`: `useCallback`、`useMemo`

- `useCallback(fn, deps)`: 会对函数进行缓存，当第二个参数依赖项发生变化时，才会重新生成新的函数
  - `fn`: 返回的函数
  - `deps`: 依赖项集合，是个数组
  - 返回值是一个被缓存的函数

- `useMemo(fn, deps)`: 会对函数的返回值进行缓存，当第二个参数依赖项发生变化时，才会重新执行，返回新的数据
  - `fn`: 需要执行的函数
  - `deps`: 依赖项集合，是个数组
  - 返回值是一个被缓存的值，可以是基础类型或者对象类型，也可以是函数，甚至是 `React` 组件

> useCallback(fn, deps) 相当于 useMemo(() => fn, deps)

```js
const { Fragment, useCallback, useMemo, useState } = React;

const App = () => {
  const [count, setCount] = useState(0);
  const [num, setNum] = useState(0);

  const doubleCount = useMemo(() => {
    return count * 2;
  }, [count])

  const alertNum = useCallback(() => {
    alert(`num 值：${num}`);
  }, [num])

  console.log('render');

  return (
    <Fragment>
      <p>count: {count}</p>
      <p>doubleCount: {doubleCount}</p>
      <p>num: {num}</p>
      <button onClick={() => setCount(count + 1)}>increment count</button>
      | {' '}
      <button onClick={() => setNum(num + 1)}>increment num</button>
      | {' '}
      <button onClick={alertNum}>alert num</button>
    </Fragment>
  );
}

ReactDOM.render(<App/>, root);
```

## 写在后面

如果有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。 

如果喜欢或者有所帮助，欢迎 Star，对作者也是一种鼓励和支持。