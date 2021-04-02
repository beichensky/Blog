## 前言

本文主要介绍了 react-redux 的用法，以及在各种场景下不同 API 的使用方式和区别。

本文代码是在上一篇博客的基础上进行的，有缺漏的地方可以先查看上一篇博客：**[轻松掌握 Redux 核心用法](https://blog.csdn.net/zgd826237710/article/details/115017280)**

本文已收录在 `Github`: https://github.com/beichensky/Blog 中，欢迎 Star！

## 一、准备工作

### 安装
```bash
npm install react-redux
# or
yarn add react-redux
```

### 常规用法

  - `Provider`: 使用 `Provider` 标签包裹根组件，将 `store` 作为属性传入，后续的子组件才能获取到 store 中的 `state` 和 `dispatch`
  
  - `connect`：返回一个高阶组件，用来连接 `React` 组件与 `Redux store`，返回一个新的**已与 `Redux store` 连接的组件类**。

### hooks 用法

  - `useDispatch`：返回一个 `dispatch` 对象
  
  - `useSelector`：接受一个函数，将函数的返回值返回出来

## 二、Provider 的使用

根目录下 `index.js` 文件

```js
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./App";
import store from "./store";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    {/* 使用 Provider 标签包裹住根组件，并将 store 作为参数传入 */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
```

## 三、connect 的使用

- `API`：`connect([mapStateToProps],[mapDispatchToProps],[mergeProps],[options])`

`connect` 的用法相对复杂一些，接受四个参数，返回的是一个高阶组件。用来连接当前组件和 `Redux store`。

### 1. mapStateToProps
`mapStateToProps`：函数类型，接受两个参数： `state` 和 `ownProps`(当前组件的 `props`，不建议使用，会导致重渲染，损耗性能)，必须返回一个纯对象，这个对象会与组件的 `props` 合并

   - `(state[, ownProps]) => ({ count: state.count, todoList: state.todos })`

### 2. mapDispatchToProps
`mapDispatchToProps`：object | 函数

   - 不传递这个参数时，`dispatch` 会默认挂载到组件的的 `props` 中
   - 传递 `object` 类型时，会把 `object` 中的属性值使用 `dispatch` 包装后，与组件的 `props` 合并

   ```js
   {
       increment: () => ({ type: "INCREMENT" }),
       decrement: () => ({ type: "DECREMENT" }),
   }
   ```

   - 对象的属性值都必须是 `ActionCreator`
   - `dispatch` 不会再挂载到组件的 `props` 中

   - 传递函数类型时，接收两个参数：`dispatch` 和 `ownProps`(当前组件的 `props`，不建议使用，会导致重渲染，损耗性能)，必须返回一个纯对象，这个对象会和组件的 `props` 合并

   ```js
   (state[, ownProps]) => ({
       dispatch,
       increment: dispatch({ type: "INCREMENT" }),
       decrement: dispatch({ type: "DECREMENT" })
   })
   ```

### 3. mergeProps
`mergeProps`：_(很少使用)_ 函数类型。如果指定了这个参数，`mapStateToProps()`与 `mapDispatchToProps()`的执行结果和组件自身的 `props` 将传入到这个回调函数中。该回调函数返回的对象将作为 `props` 传递到被包装的组件中。你也许可以用这个回调函数，根据组件的 `props` 来筛选部分的 `state` 数据，或者把 `props` 中的某个特定变量与 `ActionCreator` 绑定在一起。如果你省略这个参数，默认情况下组件的 `props` 返回 `Object.assign({}, ownProps, stateProps, dispatchProps)` 的结果

   - `mergeProps(stateProps, dispatchProps, ownProps): props`

### 4. options
   - `context?: Object`
   - `pure?: boolean`
   - `areStatesEqual?: Function`
   - `areOwnPropsEqual?: Function`
   - `areStatePropsEqual?: Function`
   - `areMergedPropsEqual?: Function`
   - `forwardRef?: boolean`

下面 **改写一下 `App.js` 中 `redux` 的用法**

- `mapDispatchToProps` 参数不传时

```jsx
import React, { useEffect, useCallback, useState, useMemo } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actionCreators } from "./store";

function App({ count, todos, dispatch }) {
  const [value, setValue] = useState("");

  // 生成包装后的 actionCreator，执行之后就会触发 store 数据的更新
  const { increment, decrement, getAsyncTodos, addTodo } = useMemo(
    () => bindActionCreators(actionCreators, dispatch),
    [dispatch]
  );

  // 初始化 TodoList
  useEffect(() => {
    getAsyncTodos();
  }, [getAsyncTodos]);

  const add = useCallback(() => {
    if (value) {
      // 分发 action
      addTodo(value);
      setValue("");
    }
  }, [value, addTodo]);

  return (
    <div className="App">
      <h1>Hello Redux</h1>
      <p>count: {count}</p>
      <button onClick={increment}>increment</button>
      <button onClick={decrement}>decrement</button>
      <br />
      <br />
      <input
        placeholder="请输入待办事项"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button onClick={add}>add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}

// count、todos 也会被挂载到组件的 props 中
const mapStateToProps = ({ count, todos }) => ({ count, todos });

// 第二个参数没有传递，dispatch 默认会挂载到组件的 props 中
export default connect(mapStateToProps)(App);
```

- `mapDispatchToProps` 参数为对象时

```jsx
import React, { useEffect, useCallback, useState } from "react";
import { connect } from "react-redux";
import { actionCreators } from "./store";

function App({ count, todos, increment, decrement, getAsyncTodos, addTodo }) {
  const [value, setValue] = useState("");

  // 初始化 TodoList
  useEffect(() => {
    getAsyncTodos();
  }, [getAsyncTodos]);

  const add = useCallback(() => {
    if (value) {
      // 分发 action
      addTodo(value);
      setValue("");
    }
  }, [value, addTodo]);

  return (
    <div className="App">
      <h1>Hello Redux</h1>
      <p>count: {count}</p>
      <button onClick={increment}>increment</button>
      <button onClick={decrement}>decrement</button>
      <br />
      <br />
      <input
        placeholder="请输入待办事项"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button onClick={add}>add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}

// count、todos 会被挂载到组件的 props 中
const mapStateToProps = ({ count, todos }) => ({ count, todos });

// actionCreators 中的 actionCreator 会被 dispatch 进行包装，之后合并到组建的 props 中去
const mapDispatchToProps = { ...actionCreators };

export default connect(mapStateToProps, mapDispatchToProps)(App);
```

- `mapDispatchToProps` 参数为函数时

```jsx
import React, { useEffect, useCallback, useState } from "react";
import { connect } from "react-redux";
import { actionCreators } from "./store";
import { bindActionCreators } from "redux";

function App({
  count,
  todos,
  increment,
  decrement,
  getAsyncTodos,
  addTodo,
  dispatch
}) {
  const [value, setValue] = useState("");

  // 初始化 TodoList
  useEffect(() => {
    getAsyncTodos();
  }, [getAsyncTodos]);

  const add = useCallback(() => {
    if (value) {
      // 分发 action
      addTodo(value);
      setValue("");
    }
  }, [value, addTodo]);

  return (
    <div className="App">
      <h1>Hello Redux</h1>
      <p>count: {count}</p>
      <button onClick={increment}>increment</button>
      <button onClick={decrement}>decrement</button>
      <br />
      <br />
      <input
        placeholder="请输入待办事项"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button onClick={add}>add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}

// count、todos 会被挂载到组件的 props 中
const mapStateToProps = ({ count, todos }) => ({ count, todos });

// mapDispatchToProps 为函数时，actionCreators 中的 actionCreator 需要自己处理，返回的对象会被合并到组件的 props 中去
const mapDispatchToProps = dispatch => ({
  dispatch,
  ...bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
```


- 如果不需要更新 store 中的数据，则不需要传 mapDispatchToProps 参数
- 如果不需要自己控制 dispatch，则传递 ActionCreators 对象即可
- 如果需要自己完全控制，则传递一个回调函数


> 虽然上面使用 `connect` 是在 `class` 组件，但是在函数组件中依然适用。

## 四、useDispatch 和 useSelector 的使用

上面我们在组件中使用的是 `connect`，但是在现在这个 `hooks` 盛行的时代，怎么能只有高阶组件呢，所以下面我们来探究一下 `useDispatch` 和 `useSelector` 的用法。

改写 `App.js` 文件

```jsx
import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "./store";

function App() {
  const [value, setValue] = useState("");

  // 从 useDispatch 中获取 dispatch
  const dispatch = useDispatch();

  // 生成包装后的 actionCreator，执行之后就会触发 store 数据的更新
  const { increment, decrement, getAsyncTodos, addTodo } = useMemo(
    () => bindActionCreators(actionCreators, dispatch),
    [dispatch]
  );

  // 通过 useSelector 获取需要用到 state 值
  const { count, todos } = useSelector(({ count, todos }) => ({
    count,
    todos
  }));

  // 初始化 TodoList
  useEffect(() => {
    getAsyncTodos();
  }, [getAsyncTodos]);

  const add = useCallback(() => {
    if (value) {
      // 分发 action
      addTodo(value);
      setValue("");
    }
  }, [value, addTodo]);

  return (
    <div className="App">
      <h1>Hello Redux</h1>
      <p>count: {count}</p>
      <button onClick={increment}>increment</button>
      <button onClick={decrement}>decrement</button>
      <br />
      <br />
      <input
        placeholder="请输入待办事项"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button onClick={add}>add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

使用 `hooks` 方式改写之后，感觉简洁了不少，数据来源也很清晰。至于用 `connect` 还是 `hook` 的方式，可以根据情况自己选择。

## 五、总结

- `Redux` 由 `Action、Reducer、Store` 组成

  - 通过 `Reducer` 创建 `Store`
  - 通过 `store.dispatch(action)` 触发更新函数 `reducer`
  - 通过 `reducer` 更新数据
  - 数据更新触发订阅 `subscribe`

- 通过 `combineReducers` 可以合并多个 `reducer`

- 通过 `applyMiddleware` 可以使用插件

- 通过 `bindActionCreators` 可以将 `ActionCreator` 转化成 `dispatch` 包装后的 `ActionCreator`


> 是不是还没有看过瘾呢？没有的话请看我的下一篇博客，详细讲解了 `Redux` 以及 `React-Redux` 的实现原理。

## 六、源码位置

**[react-redux-demo](https://github.com/beichensky/ReactUtilsDemo/blob/master/react-redux-demo)**

如果有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。

如果喜欢或者有所帮助，欢迎 Star，对作者也是一种鼓励和支持。