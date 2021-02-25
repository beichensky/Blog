import React, { useState } from 'react';
import { ThemeContext, CounterContext } from './Context';
import ContextType from './components/ContextType';
import HookContext from './components/HookContext';
import ConsumerContext from './components/ConsumerContext';

function App() {
    const [count, setCount] = useState(0);
    const [color, setColor] = useState('blue');

    return (
        <ThemeContext.Provider value={{ color, setColor }}>
            <CounterContext.Provider value={{ count, setCount }}>
                <h2 style={{ color }}>App 页面 </h2>
                <p>count: {count}</p>
                <hr />
                <ContextType />
                <hr />
                <HookContext />
                <hr />
                <ConsumerContext />
            </CounterContext.Provider>
        </ThemeContext.Provider>
    );
}

export default App;
