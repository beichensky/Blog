import React from 'react';
import { ThemeContext, CounterContext } from '../Context';

export default function ConsumerContext() {
    /**
     * 使用 Consumer 组件，运用 render props 的方式进行 context 的使用
     */

    return (
        <ThemeContext.Consumer>
            {themeContxt => (
                <CounterContext.Consumer>
                    {counterContext => {
                        const { color } = themeContxt;
                        const { count, setCount } = counterContext;
                        return (
                            <>
                                <h2 style={{ color }}>ConsumerContext 组件</h2>
                                <div>Context.Consumer 使用</div>
                                <p> count: {count}</p>
                                <button onClick={() => setCount(count + 1)}>increment</button>
                            </>
                        );
                    }}
                </CounterContext.Consumer>
            )}
        </ThemeContext.Consumer>
    );
}
