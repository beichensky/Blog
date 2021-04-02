
## 前言

本文已收录在 `Github`: [https://github.com/beichensky/Blog](https://github.com/beichensky/Blog) 中，欢迎 Star！

**[Demo 地址](https://github.com/beichensky/Blog/blob/main/react-context-demo)**

## `Context` 的创建

`API: const MyContext = React.createContext(initialValue)`

- `initialValue`：`context` 初始值

- 返回值
  - `MyContext.Provider`: 提供者，是一个 `React` 组件，使用 `Provider ` 标签包裹后的组件，自身以及后代组件都可以访问到 `MyContext` 的值
  
  - `MyContext.Consumer`: 消费者，是 `React` 组件，使用 `Consumer` 包裹后，可以使用 `render props` 的方式渲染内容，获取到 `MyContext` 的值

```js
import React from "react";

const defaultTheme = { color: "black" };

const ThemeContext = React.createContext(defaultTheme);
```



## `Context.Provider` 的使用

每个 `Context` 对象都会返回一个 `Provider React` 组件，它允许消费组件订阅 `context` 的变化。

使用一个 `Provider` 来将当前的 `context` 传递给以下的组件树，无论多深，任何组件都能读取这个值。

**接受一个属性 `value`，子组件中获取到的 `context` 值就是 `value` 值**

- 单个 `Provider` 使用

```jsx
function App() {
  return (
    <ThemeContext.Provider value={{ color: "blue" }}>
      <p>Hello World</p>
    </ThemeContext.Provider>
  );
}
```

- 多个 `Provider` 使用

```jsx
function App() {
  const [count, setCount] = useState(0);
  return (
    <ThemeContext.Provider value={{ color: "blue" }}>
      <CounterContext.Provider value={{ count, setCount }}>
        <p>Hello World</p>
      </CounterContext.Provider>
    </ThemeContext.Provider>
  );
}
```



## 动态 `Context`

`Context.Provider` 不仅可以设置 `value`，也可以动态的修改 `value`

**当 `value` 值发生变化的时候，所有依赖改 `Context` 的子组件都会进行渲染**

创建动态 `CounterContext`

```js
const defaultTheme = { color: "black" };
const defaultCounter = {
  count: 1,
  setCount: () => {},
};

const ThemeContext = React.createContext(defaultTheme);

const CounterContext = React.createContext(defaultCounter);
```

将修改 `value` 的方法作为 `value` 的属性传递下去

```js
function App() {
  const [count, setCount] = useState(0);
  return (
    <ThemeContext.Provider value={{ color: "blue" }}>
      <CounterContext.Provider value={{ count, setCount }}>
        <p>App 页面 count: {count}</p>
        <ContextType />
        <HookContext />
        <ConsumerContext />
      </CounterContext.Provider>
    </ThemeContext.Provider>
  );
}
```

在子组件中调用修改 `value` 的方法

```js
export default function HookContext() {
  const { color } = useContext(ThemeContext);
  const { count, setCount } = useContext(CounterContext);
  return (
    <>
      <h2 style={{ color }}>useContext 使用</h2>
      <p>
        <div>HookContext 页面 count: {count}</div>
        <button onClick={() => setCount(count + 1)}>increment</button>
      </p>
    </>
  );
}
```



## 消费 `Context` 值

- `static contextType`

- `Context.Consumer`

- `useContext`

### `Class.contextType`

- 在类组件中设置静态属性 `contextType` 为某个 `Context`

- 在使用的时候通过 `this.context` 获取到 `Context` 的值

```js
export default class ContextType extends Component {
  static contextType = ThemeContext;
  render() {
    const { color } = this.context;
    return <h2 style={{ color }}>ContextType 使用</h2>;
  }
}
```

### `Context.Consumer`

`Context.Consumer` 是一个 React 组件可以订阅 `context` 的变更，既可以在函数组件中使用也可以在类组件中使用

这种方法需要一个函数作为子元素`（function as a child）`。这个函数接收当前的 `context` 值，并返回一个 `React` 节点。

传递给函数的 `value` 值等等价于组件树上方离这个 `context` 最近的 `Provider` 提供的 `value` 值。如果没有对应的 `Provider`，`value` 参数等同于传递给 `createContext()` 的 `defaultValue`

- 消费一个 `Context`

```js
export default function ConsumerContext() {
  return (
    <ThemeContext.Consumer>
      {(theme) => {
        const { color } = theme;
        return <h2 style={{ color }}>Context.Consumer</h2>;
      }}
    </ThemeContext.Consumer>
  );
}
```

- 消费多个 `Context`

```js
export default function ConsumerContext() {
  return (
    <ThemeContext.Consumer>
      {(theme) => (
        <CounterContext.Consumer>
          {(context) => {
            const { color } = theme;
            const { count } = context;
            return (
              <>
                <h2 style={{ color }}>Context.Consumer</h2>
                <p>ConsumerContext 页面 count: {count}</p>
              </>
            );
          }}
        </CounterContext.Consumer>
      )}
    </ThemeContext.Consumer>
  );
}
```

### `useContext`

通过 `useContext` 可以获取到 `value` 值，参数是对应的 `Context`

可以再一个组件中使用多次 `useContext` 获取多个 `Context` 对应的 `value` 值

```js
export default function HookContext() {
  const { color } = useContext(ThemeContext);
  const { count, setCount } = useContext(CounterContext);
  return (
    <>
      <h2 style={{ color }}>useContext 使用</h2>
      <p>
        <div>HookContext 页面 count: {count}</div>
        <button onClick={() => setCount(count + 1)}>increment</button>
      </p>
    </>
  );
}
```



## `displayName`

`context` 对象接受一个名为 `displayName` 的 `property`，类型为字符串。`React DevTools` 使用该字符串来确定 `context` 要显示的内容。

示例，下述组件在 `DevTools` 中将显示为 `MyDisplayName`：

```js
const MyContext = React.createContext(/* some value */);
MyContext.displayName = 'MyDisplayName';

<MyContext.Provider> // "MyDisplayName.Provider" 在 DevTools 中
<MyContext.Consumer> // "MyDisplayName.Consumer" 在 DevTools 中
```



## 总结

- 创建 `Context`: `const MyContext = React.createContext(defaultValue)`

- 使用 `Context.Provider` 组件将子组件进行包裹，则无论子组件层级多深，都可以获取到对应的 `value` 值

- 使用 `Class.contextType` 的方式获取 `Context`，可以在组件中通过 `this.context` 的方式获取到对应的 `value` 值

  - 只能在类组件中使用
  - 组件中只能使用一个 `Context`

- 使用 `Context.Consumer` 组件消费 `Context`

  - 需要一个函数作为子元素，函数参数是距离最近的 `Context` 的 `value` 值，返回一个组件
  - 可以在类组件中使用也可以在函数组件中使用
  - 可以消费多个 `Context`

- 使用 `useContext` 消费 `Context`

  - 只能在函数组件中使用
  - 可以通过调用多次 `useContext` 消费多个 `Context`

- `Context.Provider` 中的 `value` 发生变化，则依赖当前 `Context` 的子组件都会发生进行更新



## 写在后面

如果有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。 

如果喜欢或者有所帮助，欢迎 Star，对作者也是一种鼓励和支持。