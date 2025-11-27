# Web 前端

文档转换工具的 Web 前端，基于 React + TypeScript + Vite。

## 技术栈

- **框架**：React 18
- **语言**：TypeScript
- **构建工具**：Vite 5
- **UI 组件库**：Ant Design
- **状态管理**：Zustand
- **路由**：React Router v6

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

应用将在 `http://localhost:5173` 启动。

### 3. 构建生产版本

```bash
pnpm build
```

## 项目结构

```text
web/
├── src/
│   ├── components/     # 组件
│   ├── pages/          # 页面
│   ├── stores/         # 状态管理（Zustand）
│   ├── utils/          # 工具函数
│   ├── hooks/          # 自定义 Hooks
│   ├── api/            # API 调用
│   ├── router/         # 路由配置
│   ├── App.tsx         # 应用入口
│   └── main.tsx        # 入口文件
├── public/             # 静态资源
└── package.json
```

## 开发命令

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm preview` - 预览生产构建
- `pnpm lint` - 代码检查
- `pnpm type-check` - TypeScript 类型检查

## 更多信息

- [开发规范文档](../doc/02-设计文档/开发规范文档.md)
- [UI/UX 设计文档](../doc/02-设计文档/)
