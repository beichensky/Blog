本文简要介绍了 React 中 PureComponent 与 Component 的区别以及使用时需要注意的问题，并在后面附上了源码解析，希望对有疑惑的朋友提供一些帮助。

<!-- More -->


## 前言

先介绍一下 PureComponent，平时我们创建 React 组件一般是继承于 Component，而 PureComponent 相当于是一个更纯净的 Component，对更新前后的数据进行了一次浅比较。只有在数据真正发生改变时，才会对组件重新进行 render。因此可以大大提高组件的性能。



本文已收录在 `Github`: [https://github.com/beichensky/Blog](https://github.com/beichensky/Blog) 中，欢迎 Star！


-----



## 对比 Component 和 PureComponent


### 继承 Component 创建组件

#### `App.js`

里面的 `state` 有两个属性，`text` 属性是基本数据类型，`todo` 属性是引用类型。针对这两种数据类型分别进行对比：

``` js
import React, { Component, PureComponent } from 'react';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props)

        this.state = {
            text: 'Hello',
            todo: {
                id: 1,
                message: '学习 React'
            }
        }
    }

    /**
     * 修改 state 中 text 属性的函数
     */
    changeText = () => {
        this.setState({
            text: 'World'
        });
    }

    /**
     * 修改 state 中 todo 对象的函数
     */
    changeTodo = () => {
        this.setState({
            id: 1,
            message: '学习 Vue'
        });
    }

    render() {
        // 打印 log，查看渲染情况
        console.log('tag', 'render');
        
        const { text, todo } = this.state;
        return (
            <div className="App">
                <div>
                    <span>文字：{ text }</span>
                    <button onClick={ this.changeText }>更改文字</button>
                </div>
                <br />
                <div>
                    <span>计划：{ todo.message }</span>
                    <button onClick={ this.changeTodo }>更改计划</button>
                </div>
            </div>
        );
    }
}

export default App;
```


#### 浏览器中界面

![界面显示](https://user-gold-cdn.xitu.io/2019/1/16/168563dbe58652cc?w=427&h=111&f=png&s=5030)


#### 测试

运行项目，打开控制台，此时看到只有一个 `log`：`tag render`

  - 点击 5 次 ·更改文字· 按钮，可以看到控制台再次多打印了 **5 次** `log`，浏览器中的 `Hello` 文字变成了 `World`

  - 点击 5 次 ·更改计划· 按钮，控制台一样多打印 **5 次** `log`，浏览器中的 `学习 React` 计划变成了 `学习 Vue`

分析一下，其实 5 次点击中只有一次是有效的，后来的数据其实并没有真正改变，但是由于依然使用了 `setState()`，所以还是会重新 `render`。所以这种模式是比较消耗性能的。



### 继承 PureComponent

其实 `PureComponent` 用法也是和 `Component` 一样，只不过是将继承 `Component` 换成了 `PureComponent`。

#### App.js

``` js
...
// 上面的代码和之前一致

class App extends PureComponent {
    // 下面的代码也和之前一样
    ...
}

export default App;
```

#### 浏览器中界面

![界面显示](https://user-gold-cdn.xitu.io/2019/1/16/168563dbe58652cc?w=427&h=111&f=png&s=5030)


#### 测试

和上面 Component 的测试方式一样

  - 点击 5 次 ·更改文字· 按钮，可以看到控制台只多打印了 **1 次**  `log`，浏览器中的 `Hello` 文字变成了 `World`

  - 点击 5 次 ·更改计划· 按钮，控制台只多打印了 **1 次** `log`，浏览器中的 `学习 React` 计划变成了 `学习 Vue`

> 由此可以看出，使用 PureComponent 还是比较节省性能的，即便是使用了 setState()，也会在数据真正改变时才会重新渲染组件



#### 使用时可能遇到的问题

下面我们将代码中 `changeText` 和 `changeTodo` 方法修改一下

``` js
/**
 * 修改 state 中 text 属性的函数
 */
changeText = () => {
    let { text } = this.state;
    text = 'World';
    this.setState({
        text
    });
}

/**
 * 修改 state 中 todo 对象的函数
 */
changeTodo = () => {
    let { todo } = this.state;
    todo.message = "学习 Vue";
    this.setState({
        todo
    });
}
```

此时我们再重新测试一下：

  - 点击 ·更改文字· 按钮，控制台多打印一次 `log`，浏览器中的 `Hello` 文字变成了 `World`

  - **注意：**点击 ·更改计划· 按钮，控制台没有 `log` 打印，浏览器中的计划也没有发生改变


> 为什么代码修改之后，明明 todo 里的 message 属性也已经发生变化了，调用 setState()，却不进行渲染了呢？这是因为 PureComponent 在调用 shouldComponent 生命周期的时候，对数据进行了一次浅比较，判断数据是否发生改变，没发生改变，返回 false，改变了，就返回 true。那这个浅比较的机制是怎么做的呢？我们一起看下面源码解析，来分析一下。


-----


## PureComponent 源码解析


### `ReactBaseClasses.js` （[Github 代码位置](https://github.com/facebook/react/blob/master/packages/react/src/ReactBaseClasses.js)）

``` js
function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;

/**
 * Convenience component with default shallow equality check for sCU.
 */
function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    // If a component has string refs, we will assign a different object later.
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
}

const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
pureComponentPrototype.constructor = PureComponent;
// Avoid an extra prototype jump for these methods.
Object.assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;
```

可以看到 `PureComponent` 的使用和 `Component` 一致，只时最后为其添加了一个 `isPureReactComponent` 属性。`ComponentDummy` 就是通过原型模拟继承的方式将 `Component` 原型中的方法和属性传递给了 `PureComponent`。同时为了避免原型链拉长导致属性查找的性能消耗，通过 `Object.assign` 把属性从 `Component` 拷贝了过来。

但是这里只是 `PureComponent` 的声明创建，没有显示如何进行比较更新的，那我们继续看下面的代码。



### `ReactFiberClassComponent.js` （[Github 代码位置](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberClassComponent.js)）

``` js
function checkShouldComponentUpdate(
  workInProgress,
  ctor,
  oldProps,
  newProps,
  oldState,
  newState,
  nextContext,
) {
    ...

    // 这里根据上面 PureComponent 设置的属性 isPureReactComponent 判断一下，如果是 PureComponent，就会走里面的代码，将比较的值返回出去
    if (ctor.prototype && ctor.prototype.isPureReactComponent) {
        return (
            !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)
        );
    }
}
```

`shallowEqual` 是在 `share` 包中一个工具方法，看一下其中的内部实现吧。



### `shallowEqual.js` （[Github 代码位置](https://github.com/facebook/react/blob/master/packages/shared/shallowEqual.js)）

``` js
import is from './objectIs';

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA: mixed, objB: mixed): boolean {
  if (is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (
      !hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}

export default shallowEqual;
```

这里面还调用了 `is` 函数，这个函数也是 `share` 包中的一个工具方法。



### `objectIs.js` （[Github 代码位置](https://github.com/facebook/react/blob/master/packages/shared/objectIs.js)）

``` js
/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x: any, y: any) {
    return (
        (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y) // eslint-disable-line no-self-compare
    );
}

export default is;
```



### `PureComponent` 源码分析总结

由上面的源码可以发现，其实 `PureComponent` 和 `Component` 中的方法和属性基本一致，只不过 `PureComponent` 多了一个 `isPureReactComponent` 为 `true` 的属性。在 `checkShouldComponentUpdate` 的时候，会根据这个属性判断是否是 `PureComponent`，如果是的话，就会根据 `!shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)` 这个判断语句的返回值作为更新依据。所以，查看了 `shallowEqual` 和 `objectIs` 的文件源码，我们可以得出 `PureComponent` 的浅比较结论：

  - 先通过 `is` 函数判断两个参数是否相同，相同则直接返回 ture，也就是不更新组件。
    - 根据 `objectIs.js` 代码可知，基本属性类型判断值是否相同（包括 `NaN`），引用数据类型判断是否是一个引用

  - 若 `is` 函数判断为 `false`，则判断两个参数是否都为 对象 且 都不为 `null`，若任意一个 不是对象 或 任意一个为 `null`，直接返回 `false`，也就是更新组件

  - 若前两个判断都通过，则可断定两个参数皆为对象，此时判断它们 `keys` 的长度是否相同，若不同，则直接返回 `false`，即更新组件

  - 若 `keys` 长度不同，则对两个对象中的第一层属性进行比较，若都相同，则返回 `true`，有任一属性不同，则返回 `false`


-----


## 总结

阅读源码之后，可以发现之前我们修改了 `changeTodo` 方法的逻辑之后，为什么数据改变，组件却依然不更新的原因了。是因为修改的是同一个对象，所以 `PureComponent` 默认引用相同，不进行组件更新，所以才会出现这个陷阱，在使用的过程中希望大家注意一下这个问题。

  - 对比 `PureComponent` 和 `Component`，可以发现，PureComponent 性能更高，一般有几次有效修改，就会进行几次有效更新

  - 为了避免出现上面所说的陷阱问题，建议将 `React` 和 `Immutable.js` 配合使用，因为 `Immutable.js` 中的数据类型都是不可变，每个变量都不会相同。但是由于 `Immutable` 学习成本较高，可以在项目中使用 `immutability-helper` 插件，也能实现类似的功能。关于 `immutability-helper` 的使用，可以查看我的另一篇博客：**[immutability-helper 插件的基本使用](https://juejin.im/post/6844903753649225741)**

  - 虽然 `PureComponent` 提高了性能，但是也只是对数据进行了一次浅比较，最能优化性能的方式还是自己在 `shouldComponent` 生命周期中实现响应逻辑

  - 关于 `PureComponent` 浅比较的总结可以查看上面的 [PureComponent 源码分析总结](#heading-16)


## 写在后面

如果有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。 

如果喜欢或者有所帮助，欢迎 Star，对作者也是一种鼓励和支持。