`React 18` 目前已经开放 `alpha` 版本可以供我们体验了，那为了更方便快捷的体验 `React 18` 新特性，我们今天使用 `Vite` 搭建一个简易版的 `React` 开发环境，帮助我们快速尝鲜。

## 前言

本文已收录在 Github: [https://github.com/beichensky/Blog](https://github.com/beichensky/Blog) 中，欢迎 Star，欢迎 Follow！



### 初始化项目

新建一个 `react-react18-demo` 文件作为我们的项目

``` bash
mkdir vite-react18-demo

cd vite-react-react18-demo

npm init -y
```

## 依赖安装 / 项目配置

- 使用 `Vite` 以及 React 18 进行开发，那自然需要先安装

  > 注意：node 版本需要大于 12，否则的话，即便 `Vite` 安装成功，启动时也会报错：`Cannot find module worker_threads`

``` bash
npm install react@alpha react-dom@alpha

npm install vite -D
```

- 使用 `Webpack` 时需要启动 `devServer`，但使用 `Vite` 时不需要再去额外配置
  想要使用 `Vite` 启动项目，直接在 `package.json` 文件中添加命令：
  - 启动："start": "vite"`

  - 打包："build": "vite build"

- 那我们之前用 `Webpack` 时可以热更新，那 `Vite` 可以吗？当然是可以的了。

``` bash
npm install @vitejs/plugin-react-refresh -D
```

安装完之后，和 `Webpack` 一样，新建 `vite.config.js` 配置文件，在 `plugins` 属性中添加热更新插件即可

``` js
import { defineConfig } from 'vite'
import refreshReactPlugin from '@vitejs/plugin-react-refresh'

export default defineConfig({
    plugins: [refreshReactPlugin()]
})
```

- ok，那我们现在许多项目使用了 `typescript`，使用 `vite` 开发时可以集成吗？当然可以了。步骤如下:

  - 安装依赖

    ``` bash
    npm install typescript @types/react @types/react-dom -D
    ```

  - 根目录下添加 `tsconfig.json` 配置文件

    ``` json
    {
        "compilerOptions": {
            "target": "ESNext",
            "lib": ["DOM", "DOM.Iterable", "ESNext"],
            "allowJs": false,
            "skipLibCheck": false,
            "esModuleInterop": false,
            "allowSyntheticDefaultImports": true,
            "strict": true,
            "forceConsistentCasingInFileNames": true,
            "module": "ESNext",
            "moduleResolution": "Node",
            "resolveJsonModule": true,
            "isolatedModules": true,
            "noEmit": true,
            "jsx": "react",
            "types": ["react/next", "react-dom/next"]
        },
        "include": ["./src"]
    }
    ```

- 添加完之后，由于使用了 `typescript`，那我们修改一下打包命令：`"build": "tsc && vite build"`

## React 18 体验

- 创建入口文件：新建 `src` 目录，在 `src` 下创建一个 `index.tsx` 文件

`index.tsx`

``` tsx
import React from 'react'
import ReactDOM from 'react-dom'

const App = () => {
    return <h1>Hello, React 18</h1>
}

// 使用 react 18 新的并发模式写法进行 dom render
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
```

- 现在入口文件有了，但是还没有承载的页面，所以我们可以在根目录下创建 `index.html` 作为页面

  - **创建 `script` 标签，`src` 指向刚才创建的入口文件 `index.tsx`**

  - **设置 `script` 标签 `type` 为 `module`**：可以导入 `ES6` 模块，可以启用 `ESM` 模块机制

`index.html`

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
     <div id="root"></div>
     <script type="module" src="/src/index.tsx"></script>
</body>
</html>
```

- 启动项目

执行 `npm run start` 命令后，会启动 3000 端口（被占用的话会向后顺延）。打开浏览器，输入 `http://localhost:3000`，就可以看到：**`Hello, React 18`** 这几个大字了。

- 项目打包

执行 `npm run build` 命令后，会进行项目打包，生成 `dist 文件夹`。我们使用 `live-server` 插件（需要提前进行全局安装哦，`npm i live-server -g`），看看有没有打包成功

``` bash
cd dist

liver-server
```

打开浏览器，输入 `http://localhost:8080/`，同样可以看到：**`Hello, React 18`** 这几个大字。说明打包成功了。

Ok，`Vite` 搭配 React 18 的环境搭建到这里就成功了。后面我们会详细介绍一下 React 18 更新的新特性。



> 注意：node 版本需要大于 12，否则的话，即便 Vite 安装成功，启动时也会报错：`Cannot find module worker_threads`

## 写在后面

代码都在文中了，有想要快速搭建 React 调试环境的，可以速度冲了。

如果有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。

如果喜欢或者有所帮助，欢迎 Star，对作者也是一种鼓励和支持。

