const FRAGMENT = 11;
const PLACEMENT = 'PLACEMENT';  // 新增
const UPDATE = 'UPDATE';        // 更新
const DELETION = 'DELETION'     // 删除

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

// 存放上一次的 root fiber
let currentRootFiber = null;
// 记录当前执行的 function fiber
let wipFunctionFible = null;
// 用来储存需要被删除的 fiber
let deletions = [];

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
        base: currentRootFiber,
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
    if (nextUnitWork === null && wipRoot) {
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
    // 将 hook 属性挂载到 function fiber 上
    fiber.hooks = [];
    fiber.hookIndex = 0;
    wipFunctionFible = fiber;

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

    updateNode(node, {}, props);

    return node;
}

/**
 * 更新 DOM 属性
 * @param {*} node 真实 DOM
 * @param {*} nextProps 节点属性
 */
function updateNode(node, prevProps, nextProps) {
    if (!node || !nextProps || !prevProps) {
        return;
    }

    /**
     * 移除上一次的事件监听
     * 若当前 nextProps 中不包含上一次的某个属性，则将该属性值置为空
     */
    Object.keys(prevProps)
        .filter(propName => propName !== 'children')
        .forEach(propName => {
            if (propName.startsWith('on')) {
                const eventName = propName.slice(2).toLowerCase();
                node.removeEventListener(eventName, prevProps[propName], false);
            } else if (!([propName] in nextProps)) {
                node[propName] = '';
            }
        });

    // 将新的属性设置到 node 上
    Object.keys(nextProps)
        .filter(propName => propName !== 'children')
        .forEach(propName => {
            // 设置事件监听
            if (propName.startsWith('on')) {
                const eventName = propName.slice(2).toLowerCase();
                node.addEventListener(eventName, nextProps[propName], false);
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
    // 找到上一次的 fiber
    let oldFiber = returnFiber.base && returnFiber.base.child;

    let prevFiber = null;

    // 循环子元素，生成链表结构
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        let newFiber = null;

        // 判断 oldFiber 和 child 是否可以复用
        const sameType =
            oldFiber && child && oldFiber.key === child.key && oldFiber.type === child.type;

        // 1、如果可以复用，则将 oldFiber 设置为 newFiber 的 base 属性，并将 effectTag 设置为 UPDATE
        if (sameType) {
            newFiber = {
                type: child.type,
                key: child.key,
                props: child.props,
                node: oldFiber.node,
                base: oldFiber,
                return: returnFiber,
                effectTag: UPDATE,
            };
        }

        // 2、如果不能复用，则将 newFiber 的 effectTag 属性设置为 PLACEMENT
        if (!sameType && child) {
            newFiber = {
                type: child.type,
                key: child.key,
                props: child.props,
                node: null,
                base: null,
                return: returnFiber,
                effectTag: PLACEMENT,
            };
        }

        // 3、如果 oldFiber 存在但是不能复用，则将 oldFiber 的 effectTag 属性设置为 DELETION，
        //  并添加到 deletions 数组中
        if (oldFiber && !sameType) {
            oldFiber.effectTag = DELETION;
            deletions.push(oldFiber);
        }

        // oldFiber 后移，找到兄弟节点
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

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
    // 执行 fiber 删除任务
    deletions.forEach(commitWorker);

    // 执行 fiber 更新任务
    commitWorker(wipRoot.child);

    // 将 wipRoot 赋值给 currentRootFiber 临时保存，用于更新时重新为 wipRoot 赋值
    currentRootFiber = wipRoot;

    // 将 wipRoot 置为 null，停止 fiber 操作
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

    // 执行新增插入操作
    if (fiber.node && fiber.effectTag === PLACEMENT) {
        let parentFiber = fiber.return;
        let parentNode = null;
        // 有可能 parentFiber 是 Fragment 或者 Provider 等这些组件，是没有 node 属性的，所以要循环向上找到 parentNode
        while (parentFiber) {
            if (parentFiber.node && parentFiber.node.nodeType !== FRAGMENT) {
                parentNode = parentFiber.node;
                break;
            }
            parentFiber = parentFiber.return;
        }
        parentNode.appendChild(fiber.node);
    } else if (fiber.node && fiber.effectTag === UPDATE) {
        // 执行属性更新操作
        updateNode(fiber.node, fiber.base.props, fiber.props);
    } else if (fiber.effectTag === DELETION) {
        // 执行删除操作
        commitDeletion(fiber);
        return;
    }

    // 提交子 fiber 任务
    commitWorker(fiber.child);
    // 提交兄弟 fiber 任务
    commitWorker(fiber.sibling);
}

/**
 * 提交 fiber 删除操作
 * @param {*} fiber
 */
function commitDeletion(fiber) {
    // 当前 fiber 上不存在 node，则删除子 fiber 的 node
    if (fiber.node) {
        fiber.node.remove();
    } else {
        commitDeletion(fiber.child);
    }
}

/**
 * 函数组件更新 state 的 hook
 * @param {*} init
 */
export const useState = init => {
    /**
     * 获取到上一次的 fiber ，如果存在，则取出上一次的 fiber 中存储的 hooks
     * 根据当前执行 fiber 的 hookIndex 找到当前 useState 值的 oldHook
     * 如果 oldHook 存在，则使用 oldHook，不存在则使用初始值
     *
     * !循环 hook 中队列 queue 存储的值，为 state 设置最新的值
     */
    const oldFiber = wipFunctionFible.base && wipFunctionFible.base;
    const oldHook = oldFiber && oldFiber.hooks[wipFunctionFible.hookIndex];
    const hook = oldHook
        ? { state: oldHook.state, queue: oldHook.queue }
        : { state: init, queue: [] };
    hook.queue.forEach(i => (hook.state = i));
    hook.queue = [];

    /**
     * 设置 state，将接收到的 aciton push 到队列 queue 中
     *
     * 为 wipRoot 赋值，并将 wipRoot 赋值给 nextUnitWork，启动 fiber 任务
     */
    const setState = action => {
        // 若新的 action 和 上一次的 state 相同，则无需更新
        if (action === hook.state) {
            return;
        }
        // 不同，则 push 到 queue 中
        hook.queue.push(action);

        // 启动 fiber 更新任务
        wipRoot = {
            props: currentRootFiber.props,
            node: currentRootFiber.node,
            base: currentRootFiber,
        };
        nextUnitWork = wipRoot;
        deletions = [];
    };

    /**
     * 将 hook push 到 wipFunctionFible 的 hooks 属性中，用于下一次的更新操作。
     * 并将 wipFunctionFible 的 hookIndex 后移，执行下一个 useState
     */
    wipFunctionFible.hooks.push(hook);
    wipFunctionFible.hookIndex++;

    return [hook.state, setState];
};

export default {
    render,
};
