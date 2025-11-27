# 后端服务

文档转换工具的后端服务，基于 Node.js + TypeScript + Fastify。

## 技术栈

- **运行时**：Node.js 20 LTS
- **语言**：TypeScript
- **框架**：Fastify
- **ORM**：Prisma
- **数据库**：SQLite（开发/个人版）、PostgreSQL（企业版）

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
pnpm prisma:generate

# 运行数据库迁移
pnpm prisma:migrate
```

### 4. 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3000` 启动。

## 项目结构

```text
backend/
├── src/
│   ├── api/            # API 路由
│   ├── services/       # 业务逻辑
│   ├── models/         # 数据模型
│   ├── utils/          # 工具函数
│   ├── middleware/     # 中间件
│   ├── config/         # 配置文件
│   └── app.ts          # 应用入口
├── prisma/             # Prisma 配置和迁移
├── tests/              # 测试文件
└── package.json
```

## 开发命令

- `pnpm dev` - 启动开发服务器（热重载）
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm test` - 运行测试
- `pnpm lint` - 代码检查
- `pnpm type-check` - TypeScript 类型检查
- `pnpm prisma:generate` - 生成 Prisma Client
- `pnpm prisma:migrate` - 运行数据库迁移
- `pnpm prisma:studio` - 打开 Prisma Studio

## 环境变量

详见 `.env.example` 文件。

## 更多信息

- [开发规范文档](../doc/02-设计文档/开发规范文档.md)
- [API 接口设计文档](../doc/02-设计文档/)
