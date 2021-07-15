// import React, { Component } from 'react';
// import ReactDOM from 'react-dom';

import React, { Component } from './z-react/react';
import ReactDOM, { useState } from './z-react/react-dom';

import './index.css';

class ClassComp extends Component {
    static defaultProps = {
        title: '类组件默认标题',
        name: 'class',
    };

    render() {
        const { title, name } = this.props;
        return (
            <h2>
                title：{title}，name： {name}
            </h2>
        );
    }
}

function FunComponent({ title, name }) {
    return (
        <h2>
            title：{title}，name： {name}
        </h2>
    );
}
FunComponent.defaultProps = {
    title: '函数组件默认标题',
    name: 'function',
};

// jsx 语法使用
const App = () => (
    <div className="box border">
        <ClassComp name="Jack" />
        <FunComponent name="Lily" />
        <button onClick={() => alert('Hello Fiber')}>弹出提示</button>
    </div>
);

// useState 使用
const StateApp = () => {
    const [count, setCount] = useState(0);

    console.log('render');

    return (
        <div className="box border">
            <p>count: {count}</p>
            <span>{count % 2 === 0 ? '偶数' : '奇数'}</span>
            <div>
                {count % 2 === 0 ? (
                    <span className="blue">even</span>
                ) : (
                    <strong className="gray">odd</strong>
                )}
            </div>
            <button onClick={() => setCount(count + 1)}>increment</button>
        </div>
    );
};

// 查看 diff 过程
const DiffApp = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="box border">
            <p>count: {count}</p>
            {count % 2 === 0 ? <div>偶数</div> : <p>奇数</p>}
            <div>
                {count % 2 === 0 ? (
                    <span className="box">even</span>
                ) : (
                    <strong className="border">odd</strong>
                )}
            </div>
            {count % 2 === 0 ? (
                <ul>
                    <li key="1">1</li>
                    <li key="2">2</li>
                    <li key="3">3</li>
                    <li key="4">4</li>
                    <li key="5">5</li>
                </ul>
            ) : (
                <ul>
                    <li key="3">a</li>
                    <li key="4">b</li>
                    <li key="5">c</li>
                </ul>
            )}
            <button onClick={() => setCount(count + 1)}>increment</button>
        </div>
    );
};

// 查看使用 index 作为 key 的弊端
const KeyApp = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="box border">
            <p>count: {count}</p>
            {/* 使用 index 作为 key */}
            {/* {count % 2 === 0 ? (
                    <ul>
                        <li key={0}>a</li>
                        <p key={1}>b</p>
                        <span key={2}>c</span>
                        <section key={3}>d</section>
                        <div key={4}>e</div>
                    </ul>
                ) : (
                    <ul>
                        <div key={0}>测试 Key</div>
                        <li key={1}>a</li>
                        <p key={2}>b</p>
                        <span key={3}>c</span>
                        <section key={4}>d</section>
                        <div key={5}>e</div>
                    </ul>
                )} */}
            {count % 2 === 0 ? (
                <ul>
                    <li key="a">a</li>
                    <p key="b">b</p>
                    <span key="c">c</span>
                    <section key="d">d</section>
                    <div key="e">e</div>
                </ul>
            ) : (
                <ul>
                    <div key={0}>测试 Key</div>
                    <li key="a">a</li>
                    <p key="b">b</p>
                    <span key="c">c</span>
                    <section key="d">d</section>
                    <div key="e">e</div>
                </ul>
            )}
            <button onClick={() => setCount(count + 1)}>increment</button>
        </div>
    );
};

ReactDOM.render(<DiffApp />, document.getElementById('root'));
