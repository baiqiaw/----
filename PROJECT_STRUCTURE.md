# 项目结构说明

## 目录结构

```text
文档转换/
├── doc/                    # 项目文档
│   ├── 01-需求文档/        # 需求相关文档
│   ├── 02-设计文档/        # 设计相关文档
│   ├── 03-任务管理/        # 任务管理文档
│   ├── 04-API文档/         # API 文档
│   ├── 05-测试文档/        # 测试文档
│   └── 06-部署文档/        # 部署文档
│
├── packages/               # 共享代码库（monorepo）
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   └── api-client/         # API 客户端
│
├── backend/                # 后端服务（Node.js + TypeScript + Fastify）
│   ├── src/
│   │   ├── api/            # API 路由
│   │   ├── services/       # 业务逻辑
│   │   ├── models/         # 数据模型（Prisma）
│   │   ├── utils/          # 工具函数
│   │   ├── middleware/     # 中间件
│   │   ├── config/          # 配置文件
│   │   └── app.ts          # 应用入口
│   ├── prisma/             # Prisma 配置和迁移
│   ├── tests/              # 测试文件
│   ├── package.json
│   └── tsconfig.json
│
├── web/                    # Web 前端（React + TypeScript + Vite）
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── stores/         # 状态管理（Zustand）
│   │   ├── utils/          # 工具函数
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── api/            # API 调用
│   │   ├── router/         # 路由配置
│   │   └── App.tsx         # 应用入口
│   ├── public/             # 静态资源
│   ├── package.json
│   └── vite.config.ts
│
├── desktop/                # 桌面客户端（Electron + React + TypeScript）
│   ├── src/
│   │   ├── main/           # Electron 主进程
│   │   ├── renderer/      # Electron 渲染进程（React）
│   │   └── preload/       # 预加载脚本
│   ├── resources/          # 资源文件
│   ├── package.json
│   └── electron-builder.yml
│
├── .github/                # GitHub 配置
│   └── workflows/         # CI/CD 工作流
│
├── .vscode/                # VS Code 配置
│   └── settings.json
│
├── .gitignore              # Git 忽略文件
├── .eslintrc.json          # ESLint 配置
├── .prettierrc.json        # Prettier 配置
├── pnpm-workspace.yaml     # pnpm workspace 配置
├── package.json            # 根 package.json（monorepo）
└── README.md               # 项目说明
```

## 技术栈

### 后端

- **运行时**：Node.js 20 LTS
- **语言**：TypeScript
- **框架**：Fastify
- **ORM**：Prisma
- **数据库**：SQLite（开发/个人版）、PostgreSQL（企业版）
- **测试**：Jest

### Web 前端

- **框架**：React 18
- **语言**：TypeScript
- **构建工具**：Vite 5
- **UI 组件库**：Ant Design
- **状态管理**：Zustand
- **路由**：React Router v6

### 桌面客户端

- **框架**：Electron 28+
- **渲染**：React 18 + TypeScript
- **数据库**：SQLite（本地文件）
- **打包**：electron-builder

## 开发规范

请参考 [开发规范文档](./doc/02-设计文档/开发规范文档.md)

## 快速开始

### 1. 安装依赖

```bash
# 安装 pnpm（如果还没有）
npm install -g pnpm

# 安装所有依赖
pnpm install
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，配置数据库连接等信息
```

### 3. 初始化数据库

```bash
cd backend
pnpm prisma migrate dev
pnpm prisma generate
```

### 4. 启动开发服务器

```bash
# 启动后端
cd backend
pnpm dev

# 启动前端（新终端）
cd web
pnpm dev

# 启动桌面客户端（新终端）
cd desktop
pnpm dev
```

## 更多信息

- [项目启动指南](./doc/项目启动指南.md)
- [开发环境搭建指南](./doc/06-部署文档/开发环境搭建指南.md)
- [开发阶段启动清单](./doc/03-任务管理/开发阶段启动清单.md)
