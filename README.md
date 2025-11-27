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

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 安装步骤

1. **克隆仓库**

   ```bash
   git clone <repository-url>
   cd 文档转换
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **配置环境变量**

   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置数据库、Redis 等连接信息
   ```

4. **初始化数据库**

   ```bash
   npm run db:migrate
   ```

5. **启动服务**

   ```bash
   # 开发环境
   npm run dev

   # 生产环境
   npm run build
   npm start
   ```

## 📚 文档

完整的项目文档位于 `doc/` 目录：

- 📋 [需求规格说明书](./doc/01-需求文档/易档转需求规格说明书（SRS）.md)
- 🏗️ [系统概要设计](./doc/02-设计文档/系统概要设计文档（HLD）.md)
- 🔧 [技术选型方案](./doc/02-设计文档/技术选型方案文档.md)
- 📖 [API 接口文档](./doc/02-设计文档/RESTful%20API规范设计文档.md)
- 🗄️ [数据库设计](./doc/02-设计文档/数据库设计文档.md)
- 🔐 [认证授权机制](./doc/02-设计文档/认证授权机制设计文档.md)
- 📝 [开发规范](./doc/02-设计文档/开发规范文档.md)
- 🧪 [测试计划](./doc/05-测试文档/测试计划文档.md)
- 🚀 [部署文档](./doc/06-部署文档/部署文档模板.md)

**查看完整文档目录**：[doc/README.md](./doc/README.md)

## 🛠️ 技术栈

### 后端

- **运行时**：Node.js + TypeScript
- **框架**：Express.js / Fastify
- **数据库**：PostgreSQL 14+
- **缓存**：Redis 6+
- **文件存储**：本地存储 / AWS S3 / 阿里云 OSS
- **转换引擎**：LibreOffice / Pandoc / PDF.js

### 前端

- **框架**：Vue 3 / React
- **构建工具**：Vite
- **UI 组件库**：Element Plus / Ant Design

### 开发工具

- **代码规范**：ESLint + Prettier
- **类型检查**：TypeScript
- **测试框架**：Jest / Vitest
- **API 文档**：Swagger / OpenAPI

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

- [x] 核心转换功能设计
- [x] API 接口设计
- [x] 数据库设计
- [x] 认证授权机制设计
- [ ] 核心功能开发
- [ ] 前端界面开发
- [ ] 测试用例编写
- [ ] 性能优化
- [ ] 生产环境部署

**详细任务清单**：[易档转任务清单](./doc/03-任务管理/易档转任务清单.md)

---

**最后更新**：2025年11月

**文档版本**：V1.0
