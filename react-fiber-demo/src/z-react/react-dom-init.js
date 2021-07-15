/**
 * fiber 属性
 *  type: 节点类型
 *  key: key 值
 *  props: 组件属性
 *  child: 第一个子 fiber
 *  node: 对应的真实 DOM
 *  base: 对应的上一次的 fiber
 *  return: 父 fiber
 *  sibling: 下一个兄弟 fiber
 *  effectTag: 操作类型，新增、更新、删除
 */

// 下一个将被执行的 fiber
let nextUnitWork = null;
// 根 fiber
let wipRoot = null;

/**
 * 渲染函数
 * @param {*} vNode 虚拟 DOM
 * @param {*} container DOM 容器
 */
export const render = (vNode, container) => {
    wipRoot = {
        props: {
            children: [vNode],
        },
        node: container,
        base: null,
        return: null,
        sibling: null,
    };

    nextUnitWork = wipRoot;
};

window.requestIdleCallback(workLoop);

/**
 * 轮询 fiber 任务
 * @param {*} deadLine
 */
function workLoop(deadLine) {
    // 有 fiber 需要执行并且浏览器处于空闲状态时，执行 fiber 任务
    while (nextUnitWork && deadLine.timeRemaining() > 0) {
        nextUnitWork = perforUnitOfWork(nextUnitWork);
    }

    // 已经没有 fiber 任务需要执行了
    if (nextUnitWork == null && wipRoot) {
        // 提交 Root Fiber 更新
        commitRoot();
    }

    window.requestIdleCallback(workLoop);
}

/**
 * 执行 fiber 任务
 * @param {*} fiber
 */
function perforUnitOfWork(fiber) {
    if (!fiber) {
        return null;
    }
    // 1、执行 fiber 操作，根据 type 值的类型进行节点更新操作
    const { type } = fiber;
    if (typeof type === 'function') {
        type.prototype && type.prototype.isReactComponent
            ? updateClassComponent(fiber)
            : updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }

    /**
     * 2、返回下一个 fiber
     *  优先返回子节点 fiber
     *  如果没有子 fiber，返回兄弟节点 fiber
     *  没有兄弟节点 fiber，返回父节点的 fiber
     */
    if (fiber.child) {
        return fiber.child;
    }

    while (fiber) {
        if (fiber.sibling) {
            return fiber.sibling;
        }
        fiber = fiber.return;
    }
    return null;
}

/**
 * 将类组件转化成真实 DOM
 * @param {*} vNode 虚拟 DOM
 */
function updateClassComponent(fiber) {
    const { type: Type, props } = fiber;
    const vNode = new Type(props).render();
    reconcileChildren(fiber, [vNode]);
}

/**
 * 将函数组件 转化成真实 DOM
 * @param {*} vNode 虚拟 DOM
 */
function updateFunctionComponent(fiber) {
    const { type, props } = fiber;
    const vNode = type(props);
    reconcileChildren(fiber, [vNode]);
}

/**
 * 为 fiber 设置 node 属性
 * @param {*} fiber
 */
function updateHostComponent(fiber) {
    if (!fiber.node) {
        fiber.node = createNode(fiber);
    }
    if (fiber.props && fiber.props.children) {
        reconcileChildren(fiber, fiber.props.children);
    }
}

/**
 * 将虚拟 DOM转化成真实 DOM 节点
 * @param {*} vNode 虚拟 DOM
 */
function createNode(fiber) {
    let node = null;
    const { type, props } = fiber;
    if (type === 'TEXT') {
        node = document.createTextNode('');
    } else if (typeof type === 'string') {
        node = document.createElement(type);
    } else {
        node = document.createDocumentFragment();
    }

    updateNode(node, props);

    return node;
}

/**
 * 更新 DOM 属性
 * @param {*} node 真实 DOM
 * @param {*} nextProps 节点属性
 */
function updateNode(node, nextProps) {
    if (!nextProps) {
        return;
    }
    Object.keys(nextProps)
        .filter(propName => propName !== 'children')
        .forEach(propName => {
            // 设置事件监听
            if (propName.startsWith('on')) {
                const eventName = propName.slice(2).toLowerCase();
                node.addEventListener(eventName, nextProps[propName]);
            } else {
                // 设置节点属性
                node[propName] = nextProps[propName];
            }
        });
}

/**
 * 协调子元素
 * @param {*} children 子元素数组
 * @param {*} node 真实 DOM
 */
function reconcileChildren(returnFiber, children) {
    let prevFiber = null;

    // 循环子元素，生成链表结构
    for (let i = 0; i < children.length; i++) {
        const child = children[i];

        const newFiber = {
            type: child.type,
            key: child.key,
            props: child.props,
            node: null,
            base: null,
            return: returnFiber,
            effectTag: 'PLACEMENT',
        };
        if (prevFiber === null) {
            returnFiber.child = newFiber;
        } else {
            prevFiber.sibling = newFiber;
        }
        prevFiber = newFiber;
    }
}

/**
 * 提交根 Fiber 更新
 */
function commitRoot() {
    commitWorker(wipRoot.child);
    wipRoot = null;
}

/**
 * 提交 Fiber 更新
 * @param {*} fiber
 */
function commitWorker(fiber) {
    if (!fiber) {
        return;
    }

    if (fiber.node && fiber.effectTag === 'PLACEMENT') {
        let parentFiber = fiber.return;
        let parentNode = null;
        while (parentFiber) {
            if (parentFiber.node && parentFiber.node.nodeType !== 11) {
                parentNode = parentFiber.node;
                break;
            }
            parentFiber = parentFiber.return;
        }
        parentNode.appendChild(fiber.node);
    }

    // 提交子 fiber 任务
    commitWorker(fiber.child);
    // 提交兄弟 fiber 任务
    commitWorker(fiber.sibling);
}

export default {
    render,
};
