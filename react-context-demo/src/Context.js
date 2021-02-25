import React from 'react';

const defaultTheme = { color: 'black', setColor: () => {} };
const defaultCounter = {
    count: 1,
    setCount: () => {},
};

const ThemeContext = React.createContext(defaultTheme);
// 可以设置 displayName 属性，在 DevTools 中可以找到
ThemeContext.displayName = 'ThemeDisplayName';

const CounterContext = React.createContext(defaultCounter);
ThemeContext.displayName = 'CounterDisplayName';

export { ThemeContext, CounterContext };
