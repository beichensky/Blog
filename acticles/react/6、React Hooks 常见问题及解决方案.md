本文已收录在 `Github`: https://github.com/beichensky/Blog 中，欢迎 Star！

## 常见问题

- 🐤 [useState 和 setState 有什么明显的区别?](#heading-3)

  

- 🐤 [useState 和 useReducer 的初始值如果是个执行函数返回值，执行函数是否会多次执行？](#heading-4)

  

- 🐤 [还原 useReducer 的初始值，为什么还原不回去了？](#heading-7)

  

- 🐤 [useEffect 如何模拟 componentDidMount、componentUpdate、componentWillUnmount 生命周期？](#heading-8)

  

- 🐤 [如何在 useEffect 中正确的为 DOM 设置事件监听？](#heading-12)

  

- 🐤 [useEffect、useCallback、useMemo 中取到的 state、props 中为什么会是旧值？](#heading-13)

  

- 🐤 [useEffect 为什么会出现无限执行的问题？](#heading-14)

  

- 🐤 [useEffect 中出现竞态如何解决？](#heading-15)

  

- 🐤 [如何在函数组件中保存一些属性，跟随组件进行创建和销毁？](#heading-16)

  

- 🐤 [当 useCallback 会频繁触发时，应该如何进行优化？](#heading-19)

  

- 🐤 [useCallback 和 useMemo 的使用场景有何区别？](#heading-23)

  

- 🐤 [useCallback 和  useMemo 是否应该频繁使用？](#heading-23)

  

- 🐤 [如何在父组件中调用子组件的状态或者方法？](#heading-23)

  

相信看完本文，你可以得到需要的答案。

## 一、函数组件渲染过程

先来看一下函数组件的运作方式：

`Counter.js`

```js
function Counter() {
    const [count, setCount] = useState(0);

    return <p onClick={() => setCount(count + 1)}>count: {count}</p>;
}
```

每次点击 `p` 标签，`count` 都会 + 1，`setCount` 会触发函数组件的渲染。函数组件的重新渲染其实是当前函数的重新执行。
在函数组件的每一次渲染中，内部的 `state`、函数以及传入的 `props` 都是独立的。

比如：

```js
// 第一次渲染
function Counter() {
    // 第一次渲染，count = 0
    const [count, setCount] = useState(0);

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}


// 点击 p 标签触发第二次渲染
function Counter() {
    // 第二次渲染，count = 1
    const [count, setCount] = useState(0);

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}

// 点击 p 标签触发第三次渲染
function Counter() {
    // 第三次渲染，count = 2
    const [count, setCount] = useState(0);

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}

// ...
```

> 在函数组件中声明的方法也是类似。因此，在函数组件渲染的每一帧对应这自己独立的 `state`、`function`、`props`。

## 二、useState / useReducer

### `useState` VS `setState`

- `useState` 只能作用在函数组件，`setState` 只能作用在类组件

- `useState` 可以在函数组件中声明多个，而类组件中的状态值都必须声明在 `this` 的 `state` 对象中

- 一般的情况下，`state` 改变时：

  - `useState` 修改 `state` 时，同一个 `useState` 声明的值会被 **覆盖处理**，多个 `useState` 声明的值会触发 **多次渲染**

  - `setState` 修改 `state` 时，多次 `setState` 的对象会被 **合并处理**

- `useState` 修改 `state` 时，设置相同的值，函数组件不会重新渲染，而继承 `Component` 的类组件，即便 `setState` 相同的值，也会触发渲染

### `useState` VS `useReducer`

#### 初始值

- `useState` 设置初始值时，如果初始值是个值，可以直接设置，如果是个函数返回值，建议使用回调函数的方式设置

``` js
const initCount = c => {
    console.log('initCount 执行');
    return c * 2;
};

function Counter() {
    const [count, setCount] = useState(initCount(0));

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}

```

会发现即便 `Counter` 组件重新渲染时没有再给 `count` 重新赋初始值，但是 `initCount` 函数却会重复执行

修改成回调函数的方式：

``` js
const initCount = c => {
    console.log('initCount 执行');
    return c * 2;
};

function Counter() {
    const [count, setCount] = useState(() => initCount(0));

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

这个时候，`initCount` 函数只会在 `Counter` 组件初始化的时候执行，之后无论组件如何渲染，`initCount` 函数都不会再执行

- `useReducer` 设置初始值时，初始值只能是个值，不能使用回调函数的方式
  - 如果是个执行函数返回值，那么在组件重新渲染时，这个执行函数依然会执行

#### 修改状态

- `useState` 修改状态时，同一个 `useState` 声明的状态会被覆盖处理

``` js
function Counter() {
    const [count, setCount] = useState(0);

    return (
        <p
            onClick={() => {
                setCount(count + 1);
                setCount(count + 2);
            }}
        >
            clicked {count} times
        </p>
    );
}
```

> 当前界面中 `count` 的 `step` 是 2

![useState效果](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/891325df456a4de0a2f6f1d6f2e34dfb~tplv-k3u1fbpfcp-zoom-1.image)

- `useReducer` 修改状态时，多次 `dispatch` 会按顺序执行，依次对组件进行渲染

```js
function Counter() {
    const [count, dispatch] = useReducer((x, payload) => x + payload, 0);

    return (
        <p
            onClick={() => {
                dispatch(1);
                dispatch(2);
            }}
        >
            clicked {count} times
        </p>
    );
}
```

> 当前界面中 `count` 的 `step` 是 3

![useReducer效果](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45c286cf3de249fba84e0bd24aa27743~tplv-k3u1fbpfcp-zoom-1.image)

### 还原 `useReducer` 的初始值，为什么还原不了

比如下面这个例子：

``` js
const initPerson = { name: '小明' };

const reducer = function (state, action) {
    switch (action.type) {
        case 'CHANGE':
            state.name = action.payload;
            return { ...state };
        case 'RESET':
            return initPerson;
        default:
            return state;
    }
};

function Counter() {
    const [person, dispatch] = useReducer(reducer, initPerson);
    const [value, setValue] = useState('小红');

    const handleChange = useCallback(e => setValue(e.target.value), []);

    const handleChangeClick = useCallback(() => dispatch({ type: 'CHANGE', payload: value }), [value]);

    const handleResetClick = useCallback(() => dispatch({ type: 'RESET' }), []);

    return (
        <>
            <p>name: {person.name}</p>
            <input type="text" value={value} onChange={handleChange} />
            <br />
            <br />
            <button onClick={handleChangeClick}>修改</button> |{' '}
            <button onClick={handleResetClick}>重置</button>
        </>
    );
}
```

点击修改按钮，将对象的 `name` 改为 小红，点击重置按钮，还原为原始对象。但是我们看看效果：

![unreset](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff1443b40a0b4f2786cb393c25cddc94~tplv-k3u1fbpfcp-zoom-1.image)

可以看到 `name` 修改小红后，无论如何点击重置按钮，都无法还原。

这是因为在 `initPerson` 的时候，我们改变了 `state` 的属性，导致初始值 `initPerson` 发生了变化，所以之后 `RESET`，即使返回了 `initPerson``，但是name` 值依然是小红。

所以我们在修改数据时，要注意，不要在原有数据上进行属性操作，重新创建新的对象进行操作即可。比如进行如下的修改：


``` js
// ...

const reducer = function (state, action) {
    switch (action.type) {
        case 'CHANGE':
            // !修改后的代码
            const newState = { ...state, name: action.payload }
            return newState;
        case 'RESET':
            return initPerson;
        default:
            return state;
    }
};

// ...
```

看看修改后的效果，可以正常的进行重置了：

![reset](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e9e07d7424904bd899fa2a3af778c79f~tplv-k3u1fbpfcp-zoom-1.image)

## 三、useEffect

`useEffect` 基本用法:

```js
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log('count: ', count);
    });

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

每次点击 `p` 标签，`Counter` 组件都会重新渲染，都可以在控制台看到有 `log` 打印。

### 使用 `useEffect` 模拟 `componentDidMount`

```js
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log('count: ', count);
        // 设置依赖为一个空数组
    }, []);

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

将 `useEffect` 的依赖设置为空数组，可以看到，只有在组件初次渲染时，控制台会打印输出。之后无论 `count` 如何更新，都不会再打印。

### 使用 `useEffect` 模拟 `componentDidUpdate`

- 使用条件判断依赖项是否是初始值，不是的话走更新逻辑

``` js
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (count !== 0) {
          console.log('count: ', count);
        }
    }, [count]);

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

> 但是这样处理有个弊端，当有多个依赖项时，需要多次比较，因此可以选择使用下面这种方式。

- 使用 `useRef` 设置一个初始值，进行比较

``` js
function Counter() {
    const [count, setCount] = useState(0);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
          firstRender.current = false;
        } else {
          console.log('count: ', count);
        }
    }, [count]);

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

### 使用 `useEffect` 模拟 `componentWillUnmount`

``` js
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log('count: ', count);

        return () => {
          console.log('component will unmount')
        }
    }, []);

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

`useEffect` 中包裹函数中返回的函数，会在函数组件重新渲染时，清理上一帧数据时触发执行。因此这个函数可以做一些清理的工作。
如果 `useEffect` 给定的依赖项是一个空数组，那么返回函数被执行时，代表着组件真正被卸载了。

> 给 `useEffect` 设置 **依赖项为空数组**，并且 **返回一个函数**，那么这个返回的函数就相当于是 `componentWillUnmount`
>
> 请注意，必须要设置依赖项为空数组。如果不是空数组，那么这个函数并不是在组件被卸载时触发，而是会在组件重新渲染，清理上一帧的数据时触发。

### 在 `useEffect` 正确的为 `DOM` 设置事件监听

```js
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const handleClick = function() {
            console.log('count: ', count);
        }
        window.addEventListener('click', handleClick, false)

        return () => {
          window.removeEventListener('click', handleClick, false)
        };
    }, [count]);

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

在 `useEffect` 中设置事件监听，在 `return` 的函数中对副作用进行清理，取消监听事件

### 在 `useEffect、useCallback、useMemo` 中获取到的 `state、props` 为什么是旧值

正如我们刚才所说，函数组件的每一帧会有自己独立的 `state、function、props`。而 `useEffect、useCallback、useMemo` 具有缓存功能。

因此，我们取的是当前对应函数作用域下的变量。如果没有正确的设置依赖项，那么 `useEffect、useCallback、useMemo` 就不会重新执行，其中使用的变量还是之前的值。

```js
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
      const handleClick = function() {
        console.log('count: ', count);
      }
        window.addEventListener('click', handleClick, false)

        return () => {
          window.removeEventListener('click', handleClick, false)
        };
    }, []);

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

> 还是上一个例子，如果此时给 `useEffect` 设置空数组为依赖项，那么无论 `count` 改变了多少次，点击 `window`，打印出来的 `count` 依然是 0

### `useEffect` 中为什么会出现无限执行的情况

- 没有为 `useEffect` 设置依赖项，并且在 `useEffect` 中更新 `state`，会导致界面无限重复渲染

``` js
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
      setCount(count + 1);
    });

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

这种情况会导致界面无限重复渲染，因为没有设置依赖项，如果我们想在界面初次渲染时，给 `count` 设置新值，给依赖项设置空数组即可。

修改后：只会在初始化时设置 `count` 值

``` js
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
      setCount(count + 1);
    }, []);

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

> 上面这个例子是依赖项缺失的时候，会出现问题，那么在依赖项正常设置的情况下，也会出现问题。

- 此时有一个需求：每次 `count` 增加的时候，我们需要进行翻页（`page` + 1），看看如何写：

由于此时我们依赖 `count`，依赖项中要包含 `count`，而修改 `page` 时又需要依赖 `page`，所以依赖项中也要包含 `page`

```js
function Counter() {
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(0);

    useEffect(() => {
        setPage(page + 1);
    }, [count, page]);

    return (
        <>
            <p onClick={() => setCount(count + 1)}>clicked {count} times</p>
            <p>page: {page}</p>
        </>
    );
}
```

此时也会导致界面无限重复渲染的情况，那么此时修改 `page` 时改成函数的方式，并从依赖性中移除 `page` 即可

修改后：既能实现效果，又避免了重复渲染

``` js
function Counter() {
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(0);

    useEffect(() => {
        setPage(p => p + 1);
    }, [count]);

    return (
        <>
            <p onClick={() => setCount(count + 1)}>clicked {count} times</p>
            <p>page: {page}</p>
        </>
    );
}
```

## 四、竞态

> **执行更早但返回更晚的情况会错误的对状态值进行覆盖**

在 `useEffect` 中，可能会有进行网络请求的场景，我们会根据父组件传入的 `id`，去发起网络请求，`id` 变化时，会重新进行请求。

``` js
function App() {
    const [id, setId] = useState(0);

    useEffect(() => {
        setId(10);
    }, []);

    // 传递 id 属性
    return <Counter id={id} />;
}


// 模拟网络请求
const fetchData = id =>
    new Promise(resolve => {
        setTimeout(() => {
            const result = `id 为${id} 的请求结果`;
            resolve(result);
        }, Math.random() * 1000 + 1000);
    });


function Counter({ id }) {
    const [data, setData] = useState('请求中。。。');

    useEffect(() => {
        // 发送网络请求，修改界面展示信息
        const getData = async () => {
            const result = await fetchData(id);
            setData(result);
        };
        getData();
    }, [id]);

    return <p>result: {data}</p>;
}
```

展示结果：

![竞态问题](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa411d6446804735be2bbd8b62d3271e~tplv-k3u1fbpfcp-zoom-1.image)

上面的实例，多次刷新页面，可以看到最终结果有时展示的是 `id 为 0 的请求结果`，有时是 `id 为 10 的结果`。
正确的结果应该是 ‘id 为 10 的请求结果’。这个就是竞态带来的问题。

**解决办法：**

- 取消异步操作

``` js
// 存储网络请求的 Map
const fetchMap = new Map();

// 模拟网络请求
const fetchData = id =>
    new Promise(resolve => {
        const timer = setTimeout(() => {
            const result = `id 为${id} 的请求结果`;
            // 请求结束移除对应的 id
            fetchMap.delete(id);
            resolve(result);
        }, Math.random() * 1000 + 1000);

        // 设置 id 到 fetchMap
        fetchMap.set(id, timer);
    });

// 取消 id 对应网络请求
const removeFetch = (id) => {
  clearTimeout(fetchMap.get(id));
}

function Counter({ id }) {
    const [data, setData] = useState('请求中。。。');

    useEffect(() => {
        const getData = async () => {
            const result = await fetchData(id);
            setData(result);
        };
        getData();
        return () => {
            // 取消对应网络请求
            removeFetch(id)
        }
    }, [id]);

    return <p>result: {data}</p>;
}
```

展示结果：

![解决竞态问题](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1367f2b0320c4ee1a702c7c150f4de51~tplv-k3u1fbpfcp-zoom-1.image)

此时无论如何刷新页面，都只展示 `id 为 10 的请求结果`。

- 设置布尔值变量进行追踪

``` js
// 模拟网络请求
const fetchData = id =>
    new Promise(resolve => {
        setTimeout(() => {
            const result = `id 为${id} 的请求结果`;
            resolve(result);
        }, Math.random() * 1000 + 1000);
    });

function Counter({ id }) {
    const [data, setData] = useState('请求中。。。');

    useEffect(() => {
        let didCancel = false;
        const getData = async () => {
            const result = await fetchData(id);
            if (!didCancel) {
                setData(result);
            }
        };
        getData();
        return () => {
            didCancel = true;
        };
    }, [id]);

    return <p>result: {data}</p>;
}
```

可以发现，此时无论如何刷新页面，也都只展示 `id 为 10 的请求结果`。

## 五、如何在函数组件中保存住非 `state`、`props` 的值

函数组件是没有 `this` 指向的，所以为了可以保存住*组件实例*的属性，可以使用 `useRef` 来进行操作

函数组件的 `ref` 具有可以 *穿透闭包* 的能力。通过将普通类型的值转换为一个带有 `current` 属性的对象引用，来保证每次访问到的属性值是最新的。

### 保证在函数组件的每一帧里访问到的 `state` 值是相同的

- 先看看不使用 `useRef` 的情况下，每一帧里的 `state` 值是如何打印的

``` js
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const handleClick = function() {
            console.log('count: ', count);
        }
        window.addEventListener('click', handleClick, false)
    });

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

先点击 `p` 标签 5 次，之后点击 `window` 对象，可以看到打印结果：

![不使用ref时](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9685199fa90049e391953fdb3a0094f9~tplv-k3u1fbpfcp-zoom-1.image)

- 使用 `useRef` 之后，每一帧里的 `ref` 值是如何打印的

``` js
function Counter() {
    const [count, setCount] = useState(0);
    const countRef = useRef(count);

    useEffect(() => {
        // 将最新 state 设置给 countRef.current
        countRef.current = count;
        const handleClick = function () {
            console.log('count: ', countRef.current);
        };
        window.addEventListener('click', handleClick, false);
    });

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

和之前一样的操作，先点击 `p` 标签 5 次，之后点击 `window` 界面，可以看到打印结果

![使用ref时](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4222616c42f34db5b7b7621f7ca758ad~tplv-k3u1fbpfcp-zoom-1.image)

> 使用 `useRef` 即可以保证函数组件的每一帧里访问到的 `state` 值是相同的。

### 如何保存住函数组件实例的属性

函数组件是没有实例的，因此属性也无法挂载到 `this` 上。那如果我们想创建一个非 `state`、`props` 变量，能够跟随函数组件进行创建销毁，该如何操作呢？

同样的，还是可以通过 `useRef`，`useRef` 不仅可以作用在 `DOM` 上，还可以将普通变量转化成带有 `current` 属性的对象

比如，我们希望设置一个 `Model` 的实例，在组件创建时，生成 `model` 实例，组件销毁后，重新创建，会自动生成新的 `model` 实例

``` js
class Model {
    constructor() {
        console.log('创建 Model');
        this.data = [];
    }
}

function Counter() {
    const [count, setCount] = useState(0);
    const countRef = useRef(new Model());

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

按照这种写法，可以实现在函数组件创建时，生成 `Model` 的实例，挂载到 `countRef` 的 `current` 属性上。重新渲染时，不会再给 `countRef` 重新赋值。

也就意味着在组件卸载之前使用的都是同一个 `Model` 实例，在卸载之后，当前 `model` 实例也会随之销毁。

> 仔细观察控制台的输出，会发现虽然 `countRef` 没有被重新赋值，但是在组件在重新渲染时，`Model` 的构造函数却依然会多次执行

所以此时我们可以借用 `useState` 的特性，改写一下。

``` js
class Model {
    constructor() {
        console.log('创建 Model');
        this.data = [];
    }
}

function Counter() {
    const [count, setCount] = useState(0);
    const [model] = useState(() => new Model());
    const countRef = useRef(model);

    return <p onClick={() => setCount(count + 1)}>clicked {count} times</p>;
}
```

这样使用，可以在不修改 `state` 的情况下，使用 `model` 实例中的一些属性，可以使 `flag`，可以是数据源，甚至可以作为 `Mobx` 的 `store` 进行使用。

## 六、useCallback

如题，当依赖频繁变更时，如何避免 `useCallback` 频繁执行呢？

``` js
function Counter() {
    const [count, setCount] = useState(0);

    const handleClick = useCallback(() => {
        setCount(count + 1);
    }, [count]);

    return <p onClick={handleClick}>clicked {count} times</p>;
}
```

这里，我们把 `click` 事件提取出来，使用 `useCallback` 包裹，但其实并没有起到很好的效果。

因为 `Counter` 组件重新渲染目前只依赖 `count` 的变化，所以这里的 `useCallback` 用与不用没什么区别。

### 使用 `useReducer` 替代 `useState`

可以使用 `useReducer` 进行替代。

``` js
function Counter() {
    const [count, dispatch] = useReducer(x => x + 1, 0);

    const handleClick = useCallback(() => {
        dispatch();
    }, []);

    return <p onClick={handleClick}>clicked {count} times</p>;
}
```

`useReducer` 返回的 `dispatch` 函数是自带了 `memoize` 的，不会在多次渲染时改变。因此在 `useCallback` 中不需要将 `dispatch` 作为依赖项。

### 向 `setState` 中传递函数

```js
function Counter() {
    const [count, setCount] = useState(0);

    const handleClick = useCallback(() => {
        setCount(c => c + 1);
    }, []);

    return <p onClick={handleClick}>clicked {count} times</p>;
}
```

在 `setCount` 中使用函数作为参数时，接收到的值是最新的 `state` 值，因此可以通过这个值执行操作。

### 通过 `useRef` 进行闭包穿透

```js
function Counter() {
    const [count, setCount] = useState(0);
    const countRef = useRef(count);

    useEffect(() => {
        countRef.current = count;
    }, [count]);

    const handleClick = useCallback(() => {
        setCount(countRef.current + 1);
    }, []);

    return <p onClick={handleClick}>clicked {count} times</p>;
}
```

> 这种方式也可以实现同样的效果。但是不推荐使用，不仅要编写更多的代码，而且可能会产生出乎预料的问题。

## 七、useMemo

上面讲述了 `useCallback` 的一些问题和解决办法。下面看一看 `useMemo`。

`useMemo` 和 `React.memo` 不同：

- `useMemo` 是对组件内部的一些数据进行优化和缓存，惰性处理。
- `React.memo` 是对函数组件进行包裹，对组件内部的 `state` 、 `props` 进行浅比较，判断是否需要进行渲染。

`useMemo` 和 `useCallback` 的区别

- `useMemo` 的返回值是一个值，可以是属性，可以是函数（包括组件）
- `useCallback` 的返回值只能是函数

因此，`useMemo` 一定程度上可以替代 `useCallback`，等价条件：`useCallback(fn, deps) => useMemo(() => fn, deps)`

所以，上述关于 `useCallback` 一些优化点同样适用于 `useMemo`。



## 八、useCallback 和  useMemo 是否应该频繁使用

这里先说一下我的浅见：**不建议频繁使用**

各位大佬先别开喷，容我说一说自己的观点

原因：

- useCallback 和 useMemo 其实在函数组件中是作为函数进行调用，那么第一个参数就是我们传递的回调函数，无论是否使用 useCallback 和 useMemo，这个回调函数都会被创建，所以起不到降低函数创建成本的作用
- 不仅无法降低创建成本，使用 useCallback 和 useMemo 后，第二个参数依赖项在每次 render 的时候还需要进行一次浅比较，无形中增加了数据对比的成本
- 所以使用 useCallback 和 useMemo 不仅不能减少工作量，反而还会增加对比成本，因此不建议频繁的进行使用

原因解释了一波，那 useCallback 和 useMemo 是不是就没有意义呢，当然不是，一点作用没有的话，React 何必提供出来呢。

用还是要用的，不过我们需要根据情况进行判断，什么时候去使用。

下面介绍一些 useCallback 和 useMemo 适用的场景

### useCallback 的使用场景

1. 场景一：需要对子组件进行性能优化

   这个例子中，App 会向子组件 Foo 传递一个函数属性 onClick

   

   **使用 useCallback 进行优化前的代码**

   `App.js`

   ```js
   import React, { useState } from 'react';
   import Foo from './Foo';
   
   function App() {
       const [count, setCount] = useState(0);
   
       const fooClick = () => {
           console.log('点击了 Foo 组件的按钮');
       };
   
       return (
           <div style={{ padding: 50 }}>
               <Foo onClick={fooClick} />
               <p>{count}</p>
               <button onClick={() => setCount(count + 1)}>count increment</button>
           </div>
       );
   }
   
   export default App;
   ```

   `Foo.js`

   ```js
   import React from 'react';
   
   const Foo = ({ onClick }) => {
   
       console.log('Foo 组件: render');
       return <button onClick={onClick}>Foo 组件中的 button</button>;
   
   };
   
   export default Foo;
   ```

   点击 App 中的 count increment 按钮，可以看到子组件 Foo 每次都会重新 render，但其实在 count 变化时，父组件重新 render，而子组件却不需要重新 render，当前情况自然没有什么问题。

   但是如果 Foo 组件是一个非常复杂庞大的组件，那么此时就有必要对 Foo 组件进行优化，useCallback 就能派上用场了。

   

   **使用 useCallback 进行优化后的代码**

   `App.js` 中将传递给子组件的函数属性用 useCallback 包裹起来

   ```js
   import React, { useCallback, useState } from 'react';
   import Foo from './Foo';
   
   function App() {
       const [count, setCount] = useState(0);
   
       const fooClick = useCallback(() => {
           console.log('点击了 Foo 组件的按钮');
       }, []);
   
       return (
           <div style={{ padding: 50 }}>
               <Foo onClick={fooClick} />
               <p>{count}</p>
               <button onClick={() => setCount(count + 1)}>count increment</button>
           </div>
       );
   }
   
   export default App;
   ```

   `Foo.js` 中使用 React.memo 对组件进行包裹（类组件的话继承 PureComponent 是同样的效果)

   ``` js
   import React from 'react';
   
   const Foo = ({ onClick }) => {
   
       console.log('Foo 组件: render');
       return <button onClick={onClick}>Foo 组件中的 button</button>;
   
   };
   
   export default React.memo(Foo);
   ```

   此时再点击 `count increment` 按钮，可以看到，父组件更新，但是子组件不会重新 `render`

   

2. 场景二：需要作为其他 `hooks` 的依赖，这里仅使用 `useEffect` 进行演示

   这个例子中，会根据状态 `page` 的变化去重新请求网络数据，当 `page` 发生变化，我们希望能触发 `useEffect` 调用网络请求，而 `useEffect` 中调用了 `getDetail` 函数，为了用到最新的 `page`，所以在 `useEffect` 中需要依赖 `getDetail` 函数，用以调用最新的 `getDetail`

   

   **使用 `useCallback` 处理前的代码**

   `App.js`

   ```js
   import React, { useEffect, useState } from 'react';
   
   const request = (p) =>
       new Promise(resolve => setTimeout(() => resolve({ content: `第 ${p} 页数据` }), 300));
   
   function App() {
       const [page, setPage] = useState(1);
       const [detail, setDetail] = useState('');
   
       const getDetail = () => {
           request(page).then(res => setDetail(res));
       };
   
       useEffect(() => {
           getDetail();
       }, [getDetail]);
   
       console.log('App 组件：render');
   
       return (
           <div style={{ padding: 50 }}>
               <p>Detail: {detail.content}</p>
               <p>Current page: {page}</p>
               <button onClick={() => setPage(page + 1)}>page increment</button>
           </div>
       );
   }
   
   export default App;
   ```

   但是按照上面的写法，会导致 `App` 组件无限循环进行 `render`，此时就需要用到 `useCallback` 进行处理

   

   **使用 `useCallback` 处理后的代码**

   `App.js`

   ```js
   import React, { useEffect, useState, useCallback } from 'react';
   
   const request = (p) =>
       new Promise(resolve => setTimeout(() => resolve({ content: `第 ${p} 页数据` }), 300));
   
   function App() {
       const [page, setPage] = useState(1);
       const [detail, setDetail] = useState('');
   
       const getDetail = useCallback(() => {
           request(page).then(res => setDetail(res));
       }, [page]);
   
       useEffect(() => {
           getDetail();
       }, [getDetail]);
   
       console.log('App 组件：render');
   
       return (
           <div style={{ padding: 50 }}>
               <p>Detail: {detail.content}</p>
               <p>Current page: {page}</p>
               <button onClick={() => setPage(page + 1)}>page increment</button>
           </div>
       );
   }
   
   export default App;
   ```

   此时可以看到，`App` 组件可以正常的进行 `render` 了。这里仅使用 `useEffect` 进行演示，作为其他 `hooks` 的依赖项时，也需要照此进行优化

   

3. `useCallback` 使用场景总结：

   

   1. 向子组件传递函数属性，并且子组件需要进行优化时，需要对函数属性进行 `useCallback` 包裹

      

   2. 函数作为其他 `hooks` 的依赖项时，需要对函数进行 `useCallback` 包裹



### useMemo 的使用场景

1. 同 `useCallback` 场景一：需要对子组件进行性能优化时，用法也基本一致

2. 同 `useCallback` 场景二：需要作为其他 `hooks` 的依赖时，用法也基本一致

3. 需要进行大量或者复杂运算时，为了提高性能，可以使用 `useMemo` 进行数据缓存

   > 这里也是用到了 useMemo 的数据缓存功能，在依赖项发生变化之前，useMemo 中包裹的函数不会重新执行

   

   看下面这个例子，`App`  组件中两个状态：`count` 和 `Number` 数组 `dataSource`，点击 `increment` 按钮，`count` 会增加，点击 `fresh` 按钮，会重新获取 `dataSource`，但是界面上并不需要展示 `dataSource`，而是需要展示 `dataSource` 中所有元素的和，所以我们需要一个新的变量 `sum` 来承载，展示到页面上。

   下面看代码

   

   **使用 `useMemo` 优化前的代码**

   `App.js`

   ```js
   import React, { useState } from 'react';
   
   const request = () =>
       new Promise(resolve =>
           setTimeout(
               () => resolve(Array.from({ length: 100 }, () => Math.floor(100 * Math.random()))),
               300
           )
       );
   
   function App() {
       const [count, setCount] = useState(1);
       const [dataSource, setDataSource] = useState([]);
   
       const reduceDataSource = () => {
           console.log('reduce');
           return dataSource.reduce((reducer, item) => {
               return reducer + item;
           }, 0);
       };
   
       const sum = reduceDataSource();
   
       const refreshClick = () => {
           request().then(res => setDataSource(res));
       };
   
       return (
           <div style={{ padding: 50 }}>
               <p>DataSource 元素之和: {sum}</p>
               <button onClick={refreshClick}>Refresh</button>
               <p>Current count: {count}</p>
               <button onClick={() => setCount(count + 1)}>increment</button>
           </div>
       );
   }
   
   export default App;
   ```

   打开控制台，可以看到，此时无论点击 `increment` 或者 `Refresh` 按钮，`reduceDataSource` 函数都会执行一次，但是 `dataSource` 中有 100 个元素，所以我们肯定是希望在 `dataSource` 变化时才重新计算 `sum` 值，这时候 `useMemo` 就排上用场了。

   

   **使用 `useMemo` 优化后的代码**

   `App.js`

   ```js
   import React, { useMemo, useState } from 'react';
   
   const request = () =>
       new Promise(resolve =>
           setTimeout(
               () => resolve(Array.from({ length: 100 }, () => Math.floor(100 * Math.random()))),
               300
           )
       );
   
   function App() {
       const [count, setCount] = useState(1);
       const [dataSource, setDataSource] = useState([]);
   
       const sum = useMemo(() => {
           console.log('reduce');
           return dataSource.reduce((reducer, item) => {
               return reducer + item;
           }, 0);
       }, [dataSource]);
   
       const refreshClick = () => {
           request().then(res => setDataSource(res));
       };
   
       return (
           <div style={{ padding: 50 }}>
               <p>DataSource 元素之和: {sum}</p>
               <button onClick={refreshClick}>Refresh</button>
               <p>Current count: {count}</p>
               <button onClick={() => setCount(count + 1)}>increment</button>
           </div>
       );
   }
   
   export default App;
   ```

   此时可以看到，只有点击 `Refresh` 按钮 时，`useMemo` 中的函数才会重新执行。点击 `increment` 按钮时，sum 还是之前的缓存结果，不会重新计算。

   

4. `useMemo` 使用场景总结：

   

   1. 向子组件传递 **引用类型** 属性，并且子组件需要进行优化时，需要对属性进行 `useMemo` 包裹

      

   2. **引用类型值**，作为其他 `hooks` 的依赖项时，需要使用 `useMemo` 包裹，返回属性值

      

   3. 需要进行大量或者复杂运算时，为了提高性能，可以使用 `useMemo` 进行数据缓存，节约计算成本



> 所以，在 useCallback 和 useMemo 使用过程中，如非必要，无需使用，频繁使用反而可能会增加依赖对比的成本，降低性能。



## 九、如何在父组件中调用子组件的状态或者方法

在函数组件中，没有组件实例，所以无法像类组件中，通过绑定子组件的实例调用子组件中的状态或者方法。

那么在函数组件中，如何在父组件调用子组件的状态或者方法呢？答案就是使用 `useImperativeHandle`

####  语法

> useImperativeHandle(ref, createHandle, [deps])

- 第一个参数是 ref 值，可以通过属性传入，也可以配合 forwardRef 使用

- 第二个参数是一个函数，返回一个对象，对象中的属性都会被挂载到第一个参数 ref 的 current 属性上

- 第三个参数是依赖的元素集合，同 useEffect、useCallback、useMemo，当依赖发生变化时，第二个参数会重新执行，重新挂载到第一个参数的 current 属性上

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



## 十、参考文档

- [useEffect 完整指南](https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/)
- [React Hooks 第一期：聊聊 useCallback](https://zhuanlan.zhihu.com/p/56975681)



## 写在后面

如果有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。

如果喜欢或者有所帮助，欢迎 Star，对作者也是一种鼓励和支持。