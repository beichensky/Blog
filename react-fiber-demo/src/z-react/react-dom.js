const FRAGMENT = 11;
const PLACEMENT = 'PLACEMENT'; // 新增
const UPDATE = 'UPDATE'; // 更新
const DELETION = 'DELETION'; // 删除

/**
 * fiber 属性
 *  type: 节点类型
 *  key: key 值
 *  props: 组件属性
 *  index: fiber 在当前层级的位置
 *  child: 第一个子 fiber
 *  node: 对应的真实 DOM
 *  base: 对应的上一次的 fiber
 *  return: 父 fiber
 *  sibling: 下一个兄弟 fiber
 *  effectTag: 操作类型，新增、更新、删除
 */

/**
 * 注意点：
 *  1、生成 map 结构时，是使用 oldFiber 生成
 *  2、查找 map 中数据时，若 newChild 中没有 key，则使用 newIdx 查找，而不是 newChild.index，因为 newChild 没有 index 属性
 *  3、找到 map 中数据，匹配后删除，避免重复查找
 */

// 下一个将被执行的 fiber
let nextUnitWork = null;
// 根 fiber
let wipRoot = null;

// 存放上一次的 root fiber
let currentRootFiber = null;
// 记录当前执行的 function 组件的 fiber
let wipFunctionFiber = null;
// 用来存储将要被删除的 fiber
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
    wipFunctionFiber = fiber;

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
 * 为新的 fiber 设置 index 属性
 * 返回上一次 fiber 的位置
 * @param {*} newFiber
 * @param {*} lastPlacedIndex
 * @param {*} newIdx
 * @param {*} shouldTrackSideEffects
 */
function placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects) {
    // 将 newFiber 在当前层级的位置设置到 newFiber 的 index 属性上
    newFiber.index = newIdx;
    if (!shouldTrackSideEffects) {
        return lastPlacedIndex;
    }
    const base = newFiber.base;
    if (base !== null) {
        if (base.index < lastPlacedIndex) {
            return lastPlacedIndex;
        } else {
            return base.index;
        }
    } else {
        newFiber.effectTag = PLACEMENT;
        return lastPlacedIndex;
    }
}

/**
 * 将 fiber 链表结构转换成 map 结构
 * @param {*} returnFiber 父 fiber
 * @param {*} currentChildFiber 当前 fiber
 */
function mapRemainingChildren(returnFiber, currentChildFiber) {
    const existingChildren = new Map();
    while (currentChildFiber) {
        if (currentChildFiber.key !== null) {
            existingChildren.set(currentChildFiber.key, currentChildFiber);
        } else {
            existingChildren.set(currentChildFiber.index, currentChildFiber);
        }
        currentChildFiber = currentChildFiber.sibling;
    }
    return existingChildren;
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

    // fiber 上一次的位置下标
    let lastPlacedIndex = 0;

    // 用来循环的下标
    let newIdx = 0;

    // 用来临时存放 oldFiber 的变量
    let nextOldFiber = null;

    // 判断初次渲染还是更新的 flag
    const shouldTrackSideEffects = !!oldFiber;

    // 1、组件更新时，走这个条件分支
    for (; oldFiber && newIdx < children.length; newIdx++) {
        const newChild = children[newIdx];
        if (oldFiber.index > newIdx) {
            nextOldFiber = oldFiber;
            oldFiber = null;
        } else {
            nextOldFiber = oldFiber.sibling;
        }

        if (oldFiber === null) {
            oldFiber = nextOldFiber;
        }

        const sameType =
            newChild &&
            oldFiber &&
            newChild.key === oldFiber.key &&
            newChild.type === oldFiber.type;

        if (!sameType) {
            break;
        }

        const newFiber = {
            type: newChild.type,
            key: newChild.key,
            props: newChild.props,
            return: returnFiber,
            node: oldFiber.node,
            base: oldFiber,
            effectTag: UPDATE,
        };

        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects);

        if (prevFiber === null) {
            returnFiber.child = newFiber;
        } else {
            prevFiber.sibling = newFiber;
        }
        prevFiber = newFiber;

        oldFiber = nextOldFiber;
    }

    // 2、如果是循环结束，会走到这个条件分支，则将剩余的 oldFiber 删除
    if (newIdx === children.length) {
        while (oldFiber) {
            deletions.push({
                ...oldFiber,
                effectTag: DELETION,
            });
            oldFiber = oldFiber.sibling;
        }
    }

    // 3、如果 oldFiber 不存在，代表新增元素，可能是初始化，也可能是新插入的元素
    if (!oldFiber) {
        for (; newIdx < children.length; newIdx++) {
            const newChild = children[newIdx];
            if (!newChild) {
                continue;
            }
            const newFiber = {
                type: newChild.type,
                key: newChild.key,
                props: newChild.props,
                return: returnFiber,
                node: null,
                base: null,
                effectTag: PLACEMENT,
            };
            
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects);

            if (prevFiber === null) {
                returnFiber.child = newFiber;
            } else {
                prevFiber.sibling = newFiber;
            }
            prevFiber = newFiber;
        }
        return;
    }

    // 将链表结构转化成 map 结构
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
    // 4、当 oldFiber 存在并且 oldFiber 不能被复用的时候，会走到这个条件分支
    for (; newIdx < children.length; newIdx++) {
        const newChild = children[newIdx];
        let newFiber = {
            type: newChild.type,
            key: newChild.key,
            props: newChild.props,
            return: returnFiber,
        };

        /**
         * 和第 1 个条件分支不同：
         *  1 中是一一对比，看是否能够复用 oldFiber
         *  这里是根据 key(没有 key 使用 index) 从剩余的 oldFiber 中查找出是否有对应的 oldFiber
         */

        const matchedFiber = existingChildren.get(newChild.key == null ? newIdx : newChild.key);

        // 如果匹配到对应 key / index 的 oldFiber，并且 type 也是相同的，则可以进行复用，更新即可
        if (matchedFiber && matchedFiber.type === newChild.type) {
            newFiber = {
                ...newFiber,
                node: matchedFiber.node,
                base: matchedFiber,
                effectTag: UPDATE,
            };
            // 匹配到 oldFiber 之后，则从 map 中移除对应的 fiber，避免重复匹配
            existingChildren.delete(newChild.key == null ? newIdx : newChild.key);
        } else {
            // 没有匹配到的话，则新增 fiber
            newFiber = {
                ...newFiber,
                node: null,
                base: null,
                effectTag: PLACEMENT,
            };
        }

        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects);

        if (prevFiber === null) {
            returnFiber.child = newFiber;
        } else {
            prevFiber.sibling = newFiber;
        }
        prevFiber = newFiber;
    }

    // 更新阶段，fiber 操作执行完毕，map 中仍有未被匹配的 oldFiber ，则进行删除
    if (shouldTrackSideEffects) {
        existingChildren.forEach(child => {
            deletions.push({
                ...child,
                effectTag: DELETION,
            });
        });
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
        if (fiber.type !== 'TEXT') {
            console.log('新增', fiber);
        }
        // parentNode.appendChild(fiber.node);
        insertOrAppend(fiber, parentNode);
    } else if (fiber.node && fiber.effectTag === UPDATE) {
        // 执行属性更新操作
        updateNode(fiber.node, fiber.base.props, fiber.props);
    } else if (fiber.effectTag === DELETION) {
        // 执行删除操作
        commitDeletion(fiber);
        // !!! 这里要 return 掉，不能执行 child 和 sibling，因为 child 和 sibling 的 effectTag 值并没有修改成 DELETION
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
    const oldFiber = wipFunctionFiber.base && wipFunctionFiber.base;
    const oldHook = oldFiber && oldFiber.hooks[wipFunctionFiber.hookIndex];
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
     * 将 hook push 到 wipFunctionFiber 的 hooks 属性中，用于下一次的更新操作。
     * 并将 wipFunctionFiber 的 hookIndex 后移，执行下一个 useState
     */
    wipFunctionFiber.hooks.push(hook);
    wipFunctionFiber.hookIndex++;

    return [hook.state, setState];
};

function getHostSibling(fiber) {
    let sibling = fiber.return.child;
    while (sibling) {
        // !!! 这里判断 fiber.index 小于它的兄弟节点 index 即可，因为此时 index 可能不是连续的，不能直接使用 fiber.index + 1 === sibling.index 来判断
        if (fiber.index < sibling.index && sibling.effectTag === 'UPDATE') {
            return sibling.node;
        }
        sibling = sibling.sibling;
    }

    return null;
}

function insertOrAppend(fiber, parentNode) {
    let before = getHostSibling(fiber);
    let node = fiber.node;
    if (before) {
        parentNode.insertBefore(node, before);
    } else {
        parentNode.appendChild(node);
    }
}

export default {
    render,
};
