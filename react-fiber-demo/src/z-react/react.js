/**
 * 根据接收的参数，返回虚拟 DOM 对象
 * @param {*} type 元素类型
 * @param {*} config 元素属性
 * @param  {...any} children 子元素
 */
export const createElement = (type, config, ...children) => {
    //
    console.log('React createElement >>> ', type, config, children);

    // 设置 key 和 ref 值
    let key = null;
    let ref = null;

    // 设置 props 属性值
    const props = {};
    if (config) {
        if (config.key) {
            key = config.key;
            delete config.key;
        }
        if (config.ref) {
            ref = config.ref;
            delete config.key;
        }
        delete config.__self;
        delete config.__source;

        Object.keys(config).forEach(propName => {
            props[propName] = config[propName];
        });
    }

    if (type && type.defaultProps) {
        const { defaultProps } = type;
        Object.keys(defaultProps).forEach(propName => {
            if (!props[propName] && defaultProps[propName]) {
                props[propName] = defaultProps[propName];
            }
        });
    }

    // 这里应该是直接 props.children = children，
    // 但是我们为了简单一点，给文本节点也转换成 vNode对象，React 源码中并没有这么做
    props.children = children.map(child =>
        typeof child === 'object' ? child : createTextNode(child)
    );

    return {
        key,
        ref,
        type,
        props,
    };
};

function createTextNode(text) {
    return {
        type: 'TEXT',
        props: {
            children: [],
            nodeValue: text,
        },
    };
}

/**
 * 类组件声明
 * @param {*} props 组件属性
 */
export function Component(props) {
    this.props = props;
}

// 设置 isReactComponent 属性，用来区分类组件和函数组件
Component.prototype.isReactComponent = {};

export default {
    createElement,
    Component,
};
