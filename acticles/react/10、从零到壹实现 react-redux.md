## 前言

在 **[十分钟学会 react-redux](https://github.com/beichensky/Blog/issues/8)** 一文中详细讲解了 `react-redux` 的使用。

在 **[从零到一实现 Redux](https://github.com/beichensky/Blog/issues/9)** 中，实现了关于 redux 的核心代码。

下面我们按照上一篇的节奏，继续实现一下 `react-redux` 的核心代码。



> 本文已收录在 `Github`: [https://github.com/beichensky/Blog](https://github.com/beichensky/Blog) 中，欢迎 Star！

## 核心 API
包含以下核心 `API`

- `Provider`: 上下文组件
- `connect`: 带参的高阶函数
- `useSelector`: 获取需要的 `state` 数据
- `useDispatch`: 获取 `dispatch`

## 一、Provider

全局只有一个 store 对象，需要在多层级组件中传递 `store`，
并且 store 中的 state 发生变化，组件需要相应的做出更新。
所以这里我们使用 `Context` 进行数据传递

- 创建 Context

```js
import React, { useContext, useEffect, useReducer } from "react";
import { bindActionCreators } from "./redux";

const StoreContext = React.createContext();
```

- 创建 Provider 组件

```js
/**
 * Provider 组件，用来传递 Context 中数据，进行跨层级组件通信
 */
const Provider = ({ store, children }) => (
  // 将 store 作为 value 传递下去
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);
export { Provider, connect, useDispatch, useSelector };
```

## 二、connect 高阶函数

- 订阅监听事件，`state` 发生变化，强制更新组件

- 将 `stateProps`、`dispatchProps`、`mergeProps` 合并到组件的 `props` 中

- `API`：`connect([mapStateToProps],[mapDispatchToProps],[mergeProps],[options])`

`connect` 的用法相对复杂一些，接受四个参数（我们这里暂时不管第四个参数），返回的是一个高阶组件。用来连接当前组件和 `Redux store`。

### 1. mapStateToProps

`mapStateToProps`：函数类型，接受两个参数： `state` 和 `ownProps`(当前组件的 `props`，不建议使用，会导致重渲染，损耗性能)，必须返回一个纯对象，这个对象会与组件的 `props` 合并

   - `(state[, ownProps]) => ({ count: state.count, todoList: state.todos })`

### 2. mapDispatchToProps

 `mapDispatchToProps`：object | 函数

   - 不传递这个参数时，`dispatch` 会默认挂载到组件的的 `props` 中

   - 传递 `object` 类型时，会把 `object` 中的属性值使用 `dispatch` 包装后，与组件的 `props` 合并

     - 对象的属性值都必须是 `ActionCreator`

     - `dispatch` 不会再挂载到组件的 `props` 中

   - 传递函数类型时，接收两个参数：`dispatch` 和 `ownProps`(当前组件的 `props`，不建议使用，会导致重渲染，损耗性能)，必须返回一个纯对象，这个对象会和组件的 `props` 合并

### 3. mergeProps

 `mergeProps`：_(很少使用)_ 函数类型。如果指定了这个参数，`mapStateToProps()`与 `mapDispatchToProps()`的执行结果和组件自身的 `props` 将传入到这个回调函数中。该回调函数返回的对象将作为 `props` 传递到被包装的组件中。你也许可以用这个回调函数，根据组件的 `props` 来筛选部分的 `state` 数据，或者把 `props` 中的某个特定变量与 `ActionCreator` 绑定在一起。如果你省略这个参数，默认情况下组件的 `props` 返回 `Object.assign({}, ownProps, stateProps, dispatchProps)` 的结果

   - `mergeProps(stateProps, dispatchProps, ownProps): props`

`connect`

```js
/**
 * connect 函数，源码中包含四个参数，我们这里只用到这些，所以就暂时只实现了前三个参数
 *
 * @param {*} mapStateToProps 将 state 合并到组件的 props 中的函数
 * @param {*} mapDispatchToProps 将 actionCreator 合并到组件的 props 中的函数
 * @param {*} mergeProps 自定义属性合并到组件的 props
 */
const connect = (
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
) => WrapperComponent => {
  return props => {
    const { getState, dispatch, subscribe } = useContext(StoreContext);
    const [, forceUpdate] = useReducer(x => x + 1, []);
    // 执行 mapStateToProps，获取用户需要的 state 数据
    const stateProps = mapStateToProps(getState());
    // 默认将 dispatch 挂载到 props 上
    let dispatchProps = { dispatch };

    // 判断 mapDispatchToProps 是函数还是对象，函数的话，执行获取返回的对象
    if (typeof mapDispatchToProps === "function") {
      dispatchProps = mapDispatchToProps(dispatch);
    } else if (mapDispatchToProps === "object") {
      // 对象的话，直接将对象中的 actionCreator 使用 dispatch 进行包装
      dispatchProps = bindActionCreators(mapDispatchToProps, dispatch);
    }

    mergeProps = mergeProps(stateProps, dispatchProps, props);

    useEffect(() => {
      // 添加事件订阅，state 发生变化时会触发，更新组件
      const unsubscribe = subscribe(() => forceUpdate());
      return () => {
        unsubscribe();
      };
    }, [subscribe]);

    return (
      <WrapperComponent
        {...props}
        {...stateProps}
        {...dispatchProps}
        {...mergeProps}
      />
    );
  };
};
```

## 三、useDispatch 获取 dispatch

`useDispatch`

```js
/**
 * 获取 store 对象
 */
const useStore = () => {
  const store = useContext(StoreContext);
  return store;
};

/**
 * 获取 store 中 dispatch
 */
const useDispatch = () => {
  const store = useStore();
  return store.dispatch;
};
```

## 四、useSelector 获取需要的 state 值

- 订阅事件监听，`state` 发生变化，强制更新组件

- 接受一个函数作为参数，函数的返回值作为 `useSelector` 的返回值传递出去

```js
/**
 * useSelector 从 store 中获取当前组件所需要的 state
 *
 * @param {(state) => props} selector 用户传入的函数，接收 store 当前的 state，返回一个组织好的数据对象
 */
const useSelector = selector => {
  const [, forceUpdate] = useReducer(x => x + 1, []);
  const { subscribe, getState } = useStore();

  useEffect(() => {
    // 添加事件订阅，state 发生变化时会触发，更新组件
    const unsubscribe = subscribe(() => forceUpdate());
    return () => {
      unsubscribe();
    };
  }, [subscribe]);
  return selector(getState());
};
```

## 系列文章
- [轻松掌握 Redux 核心用法](https://github.com/beichensky/Blog/issues/7)

- [十分钟学会 react-redux](https://github.com/beichensky/Blog/issues/8)

- [从零到一实现 Redux](https://github.com/beichensky/Blog/issues/9)

- [从零到一实现 react-redux](https://github.com/beichensky/Blog/issues/10)

## 写在后面

至此， `react-redux` 的核心功能基本已经实现，不过有很多细节和参数的兼容都没有进行处理，有兴趣的朋友可以参照源码完善。

**[源码地址](https://github.com/beichensky/ReactUtilsDemo/blob/master/react-my-redux/README.md)**

如果有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。

如果喜欢或者有所帮助，欢迎 Star，对作者也是一种鼓励和支持。
