本文已收录在 `Github`: https://github.com/beichensky/Blog 中，欢迎 Star！

## 写在前面

本文代码通过 `create-react-app` 脚手架进行搭建，所有的代码均可直接复制运行。

代码位置：**[react-redux-demo](https://github.com/beichensky/ReactUtilsDemo/blob/master/react-redux-demo)**

本文主要讲解了 Redux 和 React-Redux 的使用，详细的概念以及设计思想请看 **[Redux 中文官网](https://cn.redux.js.org/docs/faq/DesignDecisions.html)**

- 使用 [`create-react-app`](https://www.html.cn/create-react-app/docs/getting-started/) 创建 `React` 项目

```bash
# npx
npx create-react-app my-app

# npm
npm init react-app my-app

# yarn
yarn create react-app my-app
```

- 安装 `redux`

```bash
cd my-app

npm install redux
# or
yarn add redux
```

## 一、Action 描述更新对象

是把数据从组件传到 `store` 的载体，是修改 `store` 数据的唯一来源。
是一个普通的 `javascript` 对象，必须包含一个 `type` 属性，用来通知 `reducer` 这个 `action` 需要做的操作类型。
比如：

```js
{
    type: 'ADD',
    payload: 1
}
```

通过 `store.dispatch(action)` 将 `action` 传给 `store`

## 二、Reducer 执行更新函数

描述 `store` 数据如何更新的纯函数，接受两个参数

- `state`：`store` 中的 `state` 值，可以给 `state` 设置初始值

- `action`：通过 `store.dispatch(action)` 传递的 `action` 对象

通过 `action` 的 `type` 类型来判断如何更新 `state` 数据

比如：

```js
function reducer(state = 0, { type, payload }) {
  switch (type) {
    case "ADD":
      return state + payload;
    case "DELETE":
      return state - payload;
    default:
      return state;
  }
}
```

## 三、Store

将 `action` 和 `reducer` 联系到一起的对象，具有以下职责

- 维持应用的 `state`
- 提供 `getState()` 方法获取 `state`
- 提供 `dispatch(action)` 方法更新 `state`
- 通过 `subscribe(listener)` 注册监听器;
- 通过 `subscribe(listener)` 返回的函数注销监听器

`store` 的创建方式

```js
const store = createStore(reducer[, prevState, ehancer]);
```

## 四、实现一个简单的 React 计数器

- 通过 `store.dispatch(action)` 通知数据更新
- 通过 `store` 获取 `state` 数据
- 编写 `reducer` 实现数据更新

`store/index.js`

```js
import { createStore } from "redux";

// 创建 reducer 函数 ，更新 state 数据
const reducer = function(state = 0, { type }) {
  switch (type) {
    case "INCREMENT":
      return ++state;
    case "DECREMENT":
      return --state;
    default:
      return state;
  }
};

// 创建 store
const store = createStore(reducer);

export default store;
```

`App.js`

```jsx
import React, { useEffect, useReducer, useCallback } from "react";
import store from "./store";

function App() {
  // 模拟 forceUpdate 方法
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    // 订阅 store 监听事件
    const unsubscribe = store.subscribe(() => {
      forceUpdate();
    });
    return () => {
      // 组件销毁时移除事件订阅
      unsubscribe();
    };
  }, []);

  const increment = useCallback(
    // 分发 action
    () => store.dispatch({ type: "INCREMENT" }),
    []
  );

  const decrement = useCallback(
    // 分发 action
    () => store.dispatch({ type: "DECREMENT" }),
    []
  );

  return (
    <div className="App">
      <h1>Hello Redux</h1>
      {/* 获取当前 state 值 */}
      <p>count: {store.getState()}</p>
      <button onClick={increment}>increment</button>
      <button onClick={decrement}>decrement</button>
    </div>
  );
}

export default App;
```

这个时候，计数器已经实现了，点击 `increment` 或者 `decrement` 按钮，会更新界面上的数据


> 那假如说，此时我们可能会处理多个业务场景，比如一个是计数器，一个是 `TodoList`，会有两个 `reducer`，这个时候该如何创建呢？请看下一个 `API`

## 五、combineReducers 合并 reducer

是一个高阶函数，作用是将多个 `reducer` 函数按照合并生成一个 `reducer` 函数。
接受一个对象，返回一个 `reducer` 函数。对象的键可以设置任意属性名，对象的值是对应的 `reducer` 函数。

> 在使用 `store` 中的 `state` 值时，`state` 中的对应的属性名就是之前传给 `combineReducers` 方法的对象的属性名。

比如：

```js
const reducer = combineReducers({
  count: counterReducer,
  todos: todoReducer
});
```

获取 `state` 时：

```js
const state = store.getState();
// state: { count: xxx, todos: xxx }
```

我们在上面的例子中再加一个展示 `TodoList` 的功能

`store/index.js`

```js
import { createStore, combineReducers } from "redux";

// 创建 counterReducer 函数 ，更新 state 数据
const counterReducer = function(state = 0, { type }) {
  switch (type) {
    case "INCREMENT":
      return ++state;
    case "DECREMENT":
      return --state;
    default:
      return state;
  }
};

// 创建 todoReducer 函数，更新 state 数据
const todoReducer = function(state = [], { type, payload }) {
  switch (type) {
    case "INIT":
      return payload;
    case "ADD":
      state.push(payload);
      return [...state];
    default:
      return state;
  }
};

// 合并 reducer
const reducer = combineReducers({
  count: counterReducer,
  todos: todoReducer
});

// 创建 store
const store = createStore(reducer);

export default store;
```

`App.js`

```jsx
import React, { useEffect, useReducer, useCallback, useState } from "react";
import store from "./store";

function App() {
  // 模拟 forceUpdate 方法
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [value, setValue] = useState("");

  useEffect(() => {
    // 订阅 store 监听事件
    const unsubscribe = store.subscribe(() => {
      forceUpdate();
    });
    return () => {
      // 组件销毁时移除事件订阅
      unsubscribe();
    };
  }, []);

  const increment = useCallback(
    // 分发 action
    () => store.dispatch({ type: "INCREMENT" }),
    []
  );

  const decrement = useCallback(
    // 分发 action
    () => store.dispatch({ type: "DECREMENT" }),
    []
  );

  const add = useCallback(() => {
    if (value) {
      // 分发 action
      store.dispatch({ type: "ADD", payload: value });
      setValue("");
    }
  }, [value]);

  // 解构 state
  const { count, todos } = store.getState();

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

至此，计数器和 `TodoList` 的功能都已经实现了


> 我们现在一直用的都是 `redux` 自己的功能，如果我想使用一些插件该怎么做呢，比如我想使用 `logger` 插件打印一些日志，请看下一个 `API`

## 六、applyMiddleware 应用插件

使用 `applyMiddleware` 可以应用插件，扩展 `redux` 功能。

`applyMiddleware` 是一个函数，接受多个参数值，返回一个高阶函数供 `createStore` 使用。

```js
const ehancer = applyMiddleware(middleware1[, middleware2, middleware3, ...]);
```

下面我们以 `redux-logger` 插件为例，使用 `applyMiddleware`：

安装 `redux-logger`

```bash
npm install redux-logger -D
# or
yarn add redux-logger -D
```

`store/index.js`

```js
// ...

// 合并 reducer
const reducer = combineReducers({
  count: counterReducer,
  todos: todoReducer
});

// 应用插件
const ehancer = applyMiddleware(logger);

// 创建 store
const store = createStore(reducer, ehancer);

export default store;
```


> 上面我们修改数据的时候一直都是在同步状态下进行，那如果现在有一个副作用操作，需要异步执行完成才能进行 `state` 更新，又该怎么做呢？就要用到 `redux-thunk` 插件了


## 七、redux-thunk 支持异步 action

这个插件把 `store` 的 `dispatch` 方法做了一层封装，可以接受一个函数作为 `action`。

当判断当前 `action` 是一个函数的时候，会自动执行，并将 `dispatch` 作为参数传给我们。

安装 `redux-thunk`

```bash
npm install redux-thunk -D
# or
yarn add redux-thunk -D
```

下面我们看看 `redux-thunk` 的用法以及使用场景

还是在刚才的例子上，我们想要在组件加载完成之后对 `TodoList` 添加一些初始值，这个过程是一个异步过程

将 `redux-thunk` 插件应用到 `store` 中去
`store/index.js`

```js
import thunk from "redux-thunk";
// ...

// 应用插件
const ehancer = applyMiddleware(thunk, logger);

// 创建 store
const store = createStore(reducer, ehancer);

export default store;
```

`App.js`

```jsx
// ...

useEffect(() => {
  // 派发一个异步 action，是一个函数
  store.dispatch(dispatch => {
    setTimeout(() => {
      dispatch({ type: "INIT", payload: ["吃饭", "睡觉", "敲代码"] });
    }, 1000);
  });
}, []);

// ...
```

> 我们现在分发 `action` 的时候，都是直接 `dispatch` 一个对象，代码少的情况下还好，多的话可能就比较复杂，还要和 `reducer` 中的 `type` 对应，所以写起来比较麻烦，下面我们介绍一个概念：`ActionCreator`

## 八、ActionCreator: action 创建函数

这不是一个 `API` 或者方法，只是一种思想和实现。就是通过调用一个函数生成一个对应的 `action`，在需要的时候我们直接调用这个函数，进行 `dispatch` 就可以了

比如：

```js
const addTodo = todo => ({ type: "ADD", payload: todo });
```

这种写法我们 `dispatch` 的时候不用考虑 `type` ，也不用写键值对，只要传入正确的参数，就可以了。
下面我们就把刚才我们写的例子修改一下，使用这种 `ActionCreator` 的思想去编写 `action`

`store/index.js` 中添加 `actionCreator` 并导出

```js
// ...

const increment = () => ({ type: "INCREMENT" });
const decrement = () => ({ type: "DECREMENT" });

const initTodos = todos => ({ type: "INIT", payload: todos });
const addTodo = todo => ({ type: "ADD", payload: todo });

// 异步 action，执行完成之后调用同步 action
const getAsyncTodos = () => dispatch =>
  setTimeout(() => dispatch(initTodos(["吃饭", "睡觉", "写代码"])), 1000);

export const actionCreators = { increment, decrement, getAsyncTodos, addTodo };
```

`App.js` 中 `dispatch` 中调用 `actionCreator`

```jsx
import React, { useEffect, useReducer, useCallback, useState } from "react";
import store, { actionCreators } from "./store";

const {
  increment as inc,
  decrement as dec,
  getAsyncTodos,
  addTodo
} = actionCreators;

function App() {
  // 模拟 forceUpdate 方法
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [value, setValue] = useState("");

  useEffect(() => {
    // 订阅 store 监听事件
    const unsubscribe = store.subscribe(() => {
      forceUpdate();
    });
    return () => {
      // 组件销毁时移除事件订阅
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // 派发一个异步 action，是一个函数
    store.dispatch(getAsyncTodos());
  }, []);

  const increment = useCallback(
    // 分发 action
    () => store.dispatch(inc()),
    []
  );

  const decrement = useCallback(
    // 分发 action
    () => store.dispatch(dec()),
    []
  );

  const add = useCallback(() => {
    if (value) {
      // 分发 action
      store.dispatch(addTodo(value));
      setValue("");
    }
  }, [value]);

  // 解构 state
  const { count, todos } = store.getState();

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

> 但是这个时候，感觉还是有点麻烦，每次触发 `store` 更新都要使用 `dispatch(actionCreator(args))` 才行，能不能直接调用方法，就能触发 store 更新呢。
`当然也可以了，redux` 为我们提供了一个 `bindActionCreators` 函数


## 九、bindActionCreators

这个函数是将 `dispatch` 绑定到了 `actionCreator` 方法上，之后只要我们执行 `actionCreator` 就会触发 `store` 更新了，不用每次都 `dispacth` 了。

接受两个参数：

- `actionCreators`：是一个对象，对象的属性名可以任意命名，属性值是对应的 `actionCreator` 方法
- `dispatch`：`store` 中的 `dipatch` 属性

返回一个新的对象，对象的属性名是刚才传入的 `actionCreators` 中的属性名，属性值时包装后的方法，执行即可触发 `store` 更新

比如：

```js
const finalActions = bindActionCreators({
    increment: () => ({ type: 'INCREMENT }),
    decrement: () => ({ type: 'DECREMENT })
},  dispatch)

// finalActions: { increment, decrement }
```

下面我们将 `App.js` 中的代码进行一波优化，看看最后的效果

```jsx
import React, { useEffect, useReducer, useCallback, useState } from "react";
import { bindActionCreators } from "redux";
import store, { actionCreators } from "./store";

// 生成包装后的 actionCreator，执行之后就会触发 store 数据的更新
const { increment, decrement, getAsyncTodos, addTodo } = bindActionCreators(
  actionCreators,
  store.dispatch
);

function App() {
  // 模拟 forceUpdate 方法
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [value, setValue] = useState("");

  useEffect(() => {
    // 订阅 store 监听事件
    const unsubscribe = store.subscribe(() => {
      forceUpdate();
    });
    return () => {
      // 组件销毁时移除事件订阅
      unsubscribe();
    };
  }, []);

  // 初始化 TodoList
  useEffect(() => {
    getAsyncTodos();
  }, []);

  const add = useCallback(() => {
    if (value) {
      // 分发 action
      addTodo(value);
      setValue("");
    }
  }, [value]);

  // 解构 state
  const { count, todos } = store.getState();

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

> 有没有发现，到目前为止，数据变化时，我们更新 React 组件还是通过自己去添加 subscribe 订阅，一个组件还好，那在项目开发的过程中，每个组件都这么写，岂不是太麻烦了。
> 可以看我的下一篇博客：**[十分钟学会 react-redux](https://github.com/beichensky/Blog/issues/8)**，详细介绍了 `react-redux` 的用法。

## 写在后面

如果有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。

如果喜欢或者有所帮助，欢迎 Star，对作者也是一种鼓励和支持。

