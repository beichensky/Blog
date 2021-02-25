import React, { Component } from 'react';
import { ThemeContext } from '../Context';

export default class ContextType extends Component {
    /**
     * 使用静态属性 contextType，将 ThemeContext 挂载到组件的 context 属性上
     */

    static contextType = ThemeContext;

    state = {
        value: '#2900f5',
    };

    render() {
        const { color, setColor } = this.context;
        const { value } = this.state;

        return (
            <>
                <h2 style={{ color }}>ContextType 组件</h2>
                <p>contextType 这种方式只能使用有一个 Context </p>
                <input
                    type="color"
                    placeholder="请选择颜色值"
                    value={value}
                    onChange={e => this.setState({ value: e.target.value })}
                />
                {'  '}
                <button onClick={() => value && setColor(value)}>修改所有标题颜色</button>
            </>
        );
    }
}
