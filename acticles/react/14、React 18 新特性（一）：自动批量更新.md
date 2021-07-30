## 前言

本文已收录在 Github: [https://github.com/beichensky/Blog](https://github.com/beichensky/Blog) 中，欢迎 Star，欢迎 Follow！


## 18 版本之前

### 经典面试题：setState 是同步还是异步

在 `react 18` 版本之前，在面试中经常会出现这个问题，那么答案又是什么样的呢？

- 在 `React` 合成事件中是异步的

- 在 `hooks` 中是异步的

- 其他情况皆是同步的，例如：原生事件、`setTimeout`、`Promise` 等

看看下面这段代码的执行结果，就知道所言非虚了

``` js
class App extends React.Component {

    state = {
        count: 0
    }
    
    componentDidMount() {
        this.setState({count: this.state.count + 1})
        console.log(this.state.count);
        this.setState({count: this.state.count + 1})
        console.log(this.state.count);

        setTimeout(() => {
            this.setState({count: this.state.count + 1})
            console.log(this.state.count);
            this.setState({count: this.state.count + 1})
            console.log(this.state.count);
        });
        
    }

    render() {
        return <h1>Count: {this.state.count}</h1>
    }
}
```

有经验的同学肯定都知道，最终的结果是： `0 0 2 3`。

原因就是因为 `componentDidMount` 中的 `setState` 是批量更新，在整体逻辑没走完之前，不会进行更新。所以前两次打印结果都是 0，并且将两次更新合并成了一次。

而在 `setTimeout` 中，脱离了 `React` 的掌控，变成了同步更新，因为下方的 `log` 可以实时打印出即时的状态。

此时 `React` 的内部的处理逻辑我们可以写一段代码简单模拟一下：

- 先声明三个变量，用来记录数据
  - `isBatchUpdate`: 判断是否批量更新的标志

  - `count`: 状态

  - `queue`: 存储状态的数组

- 声明一个 `handleClick` 方法，来模拟 `React` 合成事件

- 声明一个 `setState` 方法，来模拟 `React` 的 `setState`

``` js
// 判断是否批量更新的标志
let isBatchUpdate = false;
// 状态
let count = 0;
// 存储最新状态的数组
let queue = [];
const setState = (state) => {
    // 批量更新，则将状态暂存，否则直接更新
    if (isBatchUpdate) {
        queue.push(state);
    } else {
        count = state;
    }
}

const handleClick = () => {
    // 进入事件，先将 isBatchUpdate 设置为 true
    isBatchUpdate = true

    setState(count + 1)
    console.log(count);
    setState(count + 1)
    console.log(count);
    setTimeout(() => {
        setState(count + 1)
        console.log(count);
        setState(count + 1)
        console.log(count);
    })
    
    // 事件结束，将 isBatchUpdate 置为 false
    isBatchUpdate = false;
}

handleClick();

count = queue.pop();

// 更新完成，重置状态数组 queue
queue = [];

```

可以看到，上面这段代码的打印结果也是 `0 0 2 3`。


### 手动批量更新

上面提到，在原生事件以及 `setTimeout` 等情况下，`setState` 是同步的，那**如果我们仍然希望这种情况下可以同步更新**，该怎么办呢？

**`React` 也提供了一种解决方案：从 `react` 包中暴露了一个 `API`: `unstable_batchedUpdates`**

那我们简单用一下看看效果：

``` js
class App extends React.Component {

    state = {
        count: 0
    }
    
    componentDidMount() {
        this.setState({count: this.state.count + 1})
        console.log(this.state.count);
        this.setState({count: this.state.count + 1})
        console.log(this.state.count)

        setTimeout(() => {
            React.unstable_batchedUpdates(() => {
                this.setState({count: this.state.count + 1})
                console.log(this.state.count)
                this.setState({count: this.state.count + 1})
                console.log(this.state.count)
            }) 
        })
    }

    render() {
        return <h1>Count: {this.state.count}</h1>
    }
}
```

可以看到此时的打印结果为 `0 0 1 1`。

> Ok，React 18 之前 `setState` 的更新方式就说到这里，那 React 18 里做了什么改动呢？

## React 18 版本之后

上面提到了默认批量更新以及手动批量更新，那有些同学不满足了呀，觉得手动的还是不够智能，在很多情况下还得手动去调用 `unstable_batchedUpdates` 这个函数，用起来不爽。

别急，React 18 新版本就可以解决这些同学的痛点了！

Ok，直接上代码，看看 React 18 到底怎么用的

``` js
class App extends React.Component {

    state = {
        count: 0
    }
    
    componentDidMount() {
        this.setState({count: this.state.count + 1})
        console.log(this.state.count);
        this.setState({count: this.state.count + 1})
        console.log(this.state.count)

        setTimeout(() => {
            this.setState({count: this.state.count + 1})
            console.log(this.state.count)
            this.setState({count: this.state.count + 1})
            console.log(this.state.count)
        })
    }

    render() {
        return <h1>Count: {this.state.count}</h1>
    }
}

// 使用 react 18 新的并发模式写法进行 dom render
ReactDOM.createRoot(document.getElementById('#root')!).render(<App />)
```

组件代码保持和第一版的一致，没有使用 `unstable_batchedUpdates`。

可以看到，此时的打印结果也是: `0 0 1 1`

仅仅是使用了新的 `API`： `ReactDOM.createRoot(root).render(jsx)`。React 就能实现自动的批量更新了。感觉有点神奇。

我们依然写一段代码来模拟一下这个过程：

- 此时不需要 `isBatchUpdate` 来判断是否批量更新了，而是通过更新的优先级来进行判断

- 每次更新会进行优先级的判定，相同优先级的任务会被合并。

- 事件执行完毕，进行任务的执行和更新


```js
// 状态
let count = 0;
// 存储状态的数组
let queue = [];
const setState = (state) => {
    const newState = {payload: state, priority: 0 }
    // 判断当前优先级的任务集合是否存在，不存在则初始化，存在则存到对应由县级的任务集合中
    if (queue[newState.priority]) {
        queue[newState.priority].push(newState.payload)
    } else {
        queue[newState.priority] = [newState.payload]
    }
}

const handleClick = () => {
    setState(count + 1)
    console.log(count);
    setState(count + 1)
    console.log(count);
    setTimeout(() => {
        setState(count + 1);
        console.log(count);
        setState(count + 1)
        console.log(count);
    })
}

handleClick();

count = queue.pop().pop();

setTimeout(() => {
    count = queue.pop().pop();
})
```

可以看到，上面这段代码的执行结果也是 `0 0 1 1`

*上述模拟代码仅为了展示优先级批量更新，不代表任何 React 源码的逻辑和思想*

好了，自动批量更新的新特性就说到这里了。这里引入了三个问题：

1. Q: React 18 之后提供了 `ReactDOM.createRoot`(root).render(jsx) 的 API，那之前 `ReactDOM.render` 的 API 还支持吗？

   A: 支持的，并且行为和之前版本是一致的。只有使用了 `ReactDOM.createRoot` 这种方式，才会启用新的并发模式。

   

2. Q: React 全自动更新后，那如果我就是想拿到更新之后的数据怎么办呢？
   A: 类组件中可以使用 `setState(state, callback)` 的方式，在 `callback` 中取到最新的值，函数组件可以使用 `useEffect`，将 `state` 作为依赖。即可以拿到最新的值。

   

3. Q: 文章中说到的优先级的概念是怎么回事呢？
   A: 这个涉及到 React 最新的调度以及更新的机制，优先级的概念以及其他优先级的任务如何创建，我们之后会一一展开来说。

   目前的话，可以理解为 React 的更新机制进行了变化，不再依赖于批量更新的标志。而是根据任务优先级来进行更新：高优先级的任务先执行，低优先级的任务后执行。

## 写在后面

代码量很少，主要是修改了 `ReactDOM` 的渲染方式，可以亲自尝试一下，有疑惑的地方可以说出来一起进行讨论。

如果有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。

如果喜欢或者有所帮助，欢迎 Star，对作者也是一种鼓励和支持。