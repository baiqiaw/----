# 文档转换工具

一款支持多格式、跨平台、高保真的文档转换工具，集成 AI 辅助能力，满足个人用户日常办公、企业团队协作、开发者系统集成等多场景需求。

## ✨ 核心特性

- 🔄 **多格式支持**：支持 Word、PDF、Excel、PPT、Markdown、图片等多种格式互转
- 🚀 **高性能转换**：支持单文件和批量转换，异步处理，实时进度查询
- 🔒 **安全可靠**：文件加密存储、访问权限控制、审计日志记录
- 🤖 **AI 辅助**：OCR 文字识别、智能格式优化、内容提取
- 📦 **易于集成**：RESTful API 设计，支持多种认证方式（Token + API Key）
- 🎯 **企业级功能**：用户管理、权限控制、历史记录、统计分析

## 🚀 快速开始

### 环境要求

**开发环境和个人版：**

- Node.js 20 LTS+
- SQLite 3（无需单独安装，Prisma 自动管理）
- Python 3.10+（OCR引擎）
- Docker 20.10+（可选，推荐）

**企业版（生产环境）：**

- Node.js 20 LTS+
- PostgreSQL 14+
- Redis 7+（缓存和消息队列）
- Python 3.10+（OCR引擎）
- Docker 20.10+（推荐）

### 安装步骤

1. **克隆仓库**

   ```bash
   git clone <repository-url>
   cd 文档转换
   ```

2. **安装依赖**

   ```bash
   # 安装pnpm（推荐）
   npm install -g pnpm

   # 安装项目依赖
   pnpm install
   ```

3. **配置环境变量**

   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置数据库、Redis 等连接信息
   ```

4. **初始化数据库**

   ```bash
   cd backend
   pnpm prisma migrate dev
   pnpm prisma generate
   ```

5. **启动服务**

   ```bash
   # 启动后端（开发环境）
   cd backend
   pnpm dev

   # 启动前端（开发环境）
   cd web
   pnpm dev

   # 或使用Docker Compose（推荐）
   docker-compose up -d
   ```

**详细部署指南**：请参考 [开发环境搭建指南](./doc/06-部署文档/开发环境搭建指南.md)

## 📚 文档

完整的项目文档位于 `doc/` 目录，**核心设计文档已完成**（28份）：

### 核心文档

- 📋 [需求规格说明书](./doc/01-需求文档/易档转需求规格说明书（SRS）.md)
- 🏗️ [系统概要设计](./doc/02-设计文档/系统概要设计文档（HLD）.md)
- 🔧 [技术选型方案](./doc/02-设计文档/技术选型方案文档.md)
- 📖 [API 接口文档](./doc/02-设计文档/RESTful%20API规范设计文档.md)
- 🗄️ [数据库设计](./doc/02-设计文档/数据库设计文档.md)
- 🔐 [认证授权机制](./doc/02-设计文档/认证授权机制设计文档.md)
- 📝 [开发规范](./doc/02-设计文档/开发规范文档.md)
- 🧪 [测试计划](./doc/05-测试文档/测试计划文档.md)
- 🚀 [部署文档](./doc/06-部署文档/部署文档模板.md)
- 🛠️ [开发环境搭建指南](./doc/06-部署文档/开发环境搭建指南.md)

### 详细设计文档（DDD）

- [格式转换核心引擎](./doc/02-设计文档/详细设计文档（DDD）-格式转换核心引擎.md)
- [文件上传模块](./doc/02-设计文档/详细设计文档（DDD）-文件上传模块.md)
- [OCR识别模块](./doc/02-设计文档/详细设计文档（DDD）-OCR识别模块.md)
- [批量处理模块](./doc/02-设计文档/详细设计文档（DDD）-批量处理模块.md)
- [缓存管理模块](./doc/02-设计文档/详细设计文档（DDD）-缓存管理模块.md)
- [错误处理机制](./doc/02-设计文档/详细设计文档（DDD）-错误处理机制.md)
- [用户管理模块](./doc/02-设计文档/详细设计文档（DDD）-用户管理模块.md)
- [历史记录模块](./doc/02-设计文档/详细设计文档（DDD）-历史记录模块.md)
- [AI辅助功能模块](./doc/02-设计文档/详细设计文档（DDD）-AI辅助功能模块.md)

### API接口详细设计

- [单文件转换接口](./doc/02-设计文档/API接口详细设计-单文件转换接口.md)
- [批量转换接口](./doc/02-设计文档/API接口详细设计-批量转换接口.md)
- [任务状态查询接口](./doc/02-设计文档/API接口详细设计-任务状态查询接口.md)
- [系统状态监控接口](./doc/02-设计文档/API接口详细设计-系统状态监控接口.md)
- [API错误码定义](./doc/02-设计文档/API错误码定义文档.md)

**查看完整文档目录和总结**：

- [文档目录索引](./doc/README.md)
- [项目文档总结](./doc/项目文档总结.md)

## 🛠️ 技术栈

### 后端

- **运行时**：Node.js 20 LTS + TypeScript
- **框架**：Fastify
- **数据库**：PostgreSQL 14+
- **ORM**：Prisma
- **缓存/队列**：Redis 7+ / BullMQ
- **文件存储**：本地存储 / AWS S3 / 阿里云 OSS
- **转换引擎**：LibreOffice / Poppler / Sharp / Pandoc / pdf2docx
- **OCR引擎**：PaddleOCR（个人版）/ 百度OCR（企业版）
- **AI服务**：百度文心

### 前端

- **桌面客户端**：Electron 28+ + React 18 + TypeScript
- **Web前端**：React 18 + TypeScript + Vite 5
- **UI组件库**：Ant Design / Ant Design Pro
- **状态管理**：Zustand
- **路由**：React Router v6

### 开发工具

- **代码规范**：ESLint + Prettier
- **类型检查**：TypeScript
- **测试框架**：Jest / Playwright
- **API 文档**：Swagger / OpenAPI 3.0
- **包管理**：pnpm

## 📦 项目结构

```text
文档转换/
├── doc/                    # 项目文档
│   ├── 01-需求文档/        # 需求相关文档
│   ├── 02-设计文档/        # 设计相关文档
│   ├── 03-任务管理/        # 任务管理文档
│   ├── 04-API文档/         # API 文档
│   ├── 05-测试文档/        # 测试文档
│   └── 06-部署文档/        # 部署文档
├── src/                    # 源代码（待创建）
│   ├── api/                # API 路由
│   ├── services/           # 业务逻辑
│   ├── models/             # 数据模型
│   ├── utils/              # 工具函数
│   └── middleware/         # 中间件
├── tests/                  # 测试文件（待创建）
├── .env.example            # 环境变量示例
└── README.md               # 本文件
```

## 🔌 API 使用示例

### 单文件转换

```bash
curl -X POST https://api.example.com/api/v1/convert \
  -H "Authorization: Bearer <your-token>" \
  -H "X-API-Key: <your-api-key>" \
  -F "file=@document.docx" \
  -F "targetFormat=pdf" \
  -F "mode=sync"
```

### 批量转换

```bash
curl -X POST https://api.example.com/api/v1/convert/batch \
  -H "Authorization: Bearer <your-token>" \
  -H "X-API-Key: <your-api-key>" \
  -F "files=@file1.docx" \
  -F "files=@file2.docx" \
  -F "targetFormat=pdf"
```

### 查询任务状态

```bash
curl -X GET https://api.example.com/api/v1/tasks/<task-id> \
  -H "Authorization: Bearer <your-token>" \
  -H "X-API-Key: <your-api-key>"
```

更多 API 文档请参考：[API 接口详细设计](./doc/02-设计文档/API接口详细设计-单文件转换接口.md)

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

请确保代码符合项目的[开发规范](./doc/02-设计文档/开发规范文档.md)。

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 📞 联系方式

- **项目维护者**：技术产品部
- **问题反馈**：请提交 [Issue](../../issues)
- **功能建议**：请提交 [Feature Request](../../issues/new)

## 🗺️ 开发路线图

### ✅ 已完成（设计阶段）

- [x] 需求规格说明书（SRS）
- [x] 系统概要设计（HLD）
- [x] 技术选型方案
- [x] 所有模块详细设计（DDD）- 10个核心模块
- [x] API接口详细设计 - 4个核心接口
- [x] 数据库设计
- [x] 认证授权机制设计
- [x] 开发规范文档
- [x] 测试计划文档
- [x] 开发环境搭建指南
- [x] 部署文档模板

**核心设计文档完成度：100%**（28份文档）

**项目总结文档**：

- [项目文档总结](./doc/项目文档总结.md) - 完整的文档体系总结
- [项目启动指南](./doc/项目启动指南.md) - 开发阶段启动指南
- [项目进度报告](./doc/03-任务管理/项目进度报告.md) - 项目进度跟踪

### 🚧 进行中 / 待开始

- [ ] 核心功能开发
- [ ] 前端界面开发
- [ ] 测试用例编写
- [ ] 性能优化
- [ ] 生产环境部署

**详细任务清单**：[易档转任务清单](./doc/03-任务管理/易档转任务清单.md)

---

**最后更新**：2025年11月

**文档版本**：V1.0
