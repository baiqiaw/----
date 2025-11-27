# 桌面客户端

文档转换工具的桌面客户端，基于 Electron + React + TypeScript。

## 技术栈

- **框架**：Electron 28+
- **渲染**：React 18 + TypeScript
- **数据库**：SQLite（本地文件存储）
- **打包**：electron-builder

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

### 3. 构建应用

```bash
pnpm build
```

## 项目结构

```text
desktop/
├── src/
│   ├── main/           # Electron 主进程
│   ├── renderer/       # Electron 渲染进程（React）
│   └── preload/        # 预加载脚本
├── resources/          # 资源文件
└── package.json
```

## 开发命令

- `pnpm dev` - 启动开发服务器（主进程 + 渲染进程）
- `pnpm dev:main` - 仅启动主进程开发
- `pnpm dev:renderer` - 仅启动渲染进程开发
- `pnpm build` - 构建应用
- `pnpm build:electron` - 打包 Electron 应用

## 数据库

桌面客户端使用 SQLite 数据库，数据存储在用户数据目录：

- **Windows**: `%APPDATA%/document-converter/database.db`
- **macOS**: `~/Library/Application Support/document-converter/database.db`
- **Linux**: `~/.config/document-converter/database.db`

## 更多信息

- [开发规范文档](../doc/02-设计文档/开发规范文档.md)
- [系统概要设计文档](../doc/02-设计文档/系统概要设计文档（HLD）.md)
