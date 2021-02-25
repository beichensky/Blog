import React, { useContext } from 'react';
import { ThemeContext, CounterContext } from '../Context';

export default function HookContext() {
    /**
     * 使用 useContext 的方式获取到对应的 context 值
     */

    const { color } = useContext(ThemeContext);
    const { count, setCount } = useContext(CounterContext);

    return (
        <>
            <h2 style={{ color }}>HookContext 组件</h2>
            <div>useContext 使用</div>
            <p>count: {count}</p>
            <button onClick={() => setCount(count + 1)}>increment</button>
        </>
    );
}
