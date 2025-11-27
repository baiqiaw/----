# API文档编写指南

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |

## 1. 文档说明

### 1.1 文档目的

本文档说明如何使用Swagger/OpenAPI编写完整的API文档，包括OpenAPI规范、Swagger UI配置、文档结构、代码示例等，为API文档的编写和维护提供指导。

### 1.2 适用范围

本文档适用于：

- API接口开发人员
- 文档编写人员
- 前端开发人员
- SDK开发人员

### 1.3 参考文档

- 《RESTful API规范设计文档》
- 《API接口详细设计-单文件转换接口》
- 《API接口详细设计-批量转换接口》
- 《API接口详细设计-任务状态查询接口》
- 《API接口详细设计-系统状态监控接口》
- 《API错误码定义文档》
- 《认证授权机制设计文档》

---

## 2. OpenAPI规范

### 2.1 OpenAPI版本

使用 **OpenAPI 3.0.3** 规范。

### 2.2 文档结构

OpenAPI文档采用YAML格式，主要包含以下部分：

- **openapi**：OpenAPI版本
- **info**：API基本信息
- **servers**：服务器地址
- **paths**：API路径定义
- **components**：可复用组件（schemas、parameters、responses等）
- **security**：安全定义
- **tags**：标签定义

### 2.3 基础模板

```yaml
openapi: 3.0.3
info:
  title: 文档转换工具API
  description: 文档转换工具RESTful API文档
  version: 1.0.0
  contact:
    name: API支持
    email: api-support@example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.example.com/api/v1
    description: 生产环境
  - url: https://api-staging.example.com/api/v1
    description: 测试环境
  - url: http://localhost:3000/api/v1
    description: 本地开发环境

tags:
  - name: 文件转换
    description: 文档格式转换相关接口
  - name: 任务管理
    description: 转换任务管理相关接口
  - name: 文件管理
    description: 文件上传、下载、管理相关接口
  - name: 系统监控
    description: 系统状态监控相关接口
  - name: 认证授权
    description: 用户认证和授权相关接口

paths:
  # API路径定义

components:
  # 可复用组件定义

security:
  # 安全定义
```

---

## 3. 接口文档编写

### 3.1 单文件转换接口

```yaml
paths:
  /convert:
    post:
      tags:
        - 文件转换
      summary: 单文件格式转换
      description: 将单个文件从一种格式转换为另一种格式，支持同步和异步两种模式
      operationId: convertFile
      security:
        - bearerAuth: []
        - apiKeyAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ConvertRequest'
            examples:
              sync:
                summary: 同步转换示例
                value:
                  fileId: "file_1234567890"
                  targetFormat: "pdf"
                  mode: "sync"
                  options:
                    quality: "high"
              async:
                summary: 异步转换示例
                value:
                  fileId: "file_1234567890"
                  targetFormat: "pdf"
                  mode: "async"
                  options:
                    quality: "high"
      responses:
        '200':
          description: 转换成功（同步模式）
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ConvertResponse'
        '202':
          description: 转换任务已创建（异步模式）
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AsyncConvertResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'
```

### 3.2 批量转换接口

```yaml
  /batch/convert:
    post:
      tags:
        - 文件转换
      summary: 批量文件格式转换
      description: 批量转换多个文件，支持文件列表、文件夹、自定义命名规则等
      operationId: batchConvert
      security:
        - bearerAuth: []
        - apiKeyAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BatchConvertRequest'
      responses:
        '202':
          description: 批量转换任务已创建
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BatchTaskResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'
```

### 3.3 任务状态查询接口

```yaml
  /tasks/{task_id}:
    get:
      tags:
        - 任务管理
      summary: 查询任务状态
      description: 查询转换任务的状态、进度、结果等信息
      operationId: getTaskStatus
      security:
        - bearerAuth: []
        - apiKeyAuth: []
      parameters:
        - $ref: '#/components/parameters/TaskId'
        - name: format
          in: query
          description: 响应格式
          schema:
            type: string
            enum: [full, summary]
            default: full
        - name: include
          in: query
          description: 包含的关联数据
          schema:
            type: string
            example: "files,results,errors"
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskStatusResponse'
        '404':
          $ref: '#/components/responses/NotFound'
        '401':
          $ref: '#/components/responses/Unauthorized'
```

### 3.4 系统状态监控接口

```yaml
  /system/status:
    get:
      tags:
        - 系统监控
      summary: 获取系统状态
      description: 获取系统运行状态、健康检查、性能指标等信息
      operationId: getSystemStatus
      parameters:
        - name: level
          in: query
          description: 监控级别
          schema:
            type: string
            enum: [basic, detailed, full]
            default: basic
        - name: include
          in: query
          description: 包含的监控项
          schema:
            type: string
            example: "health,performance,services"
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SystemStatusResponse'
        '503':
          description: 服务不可用
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
```

---

## 4. 组件定义

### 4.1 Schema定义

#### 4.1.1 转换请求

```yaml
components:
  schemas:
    ConvertRequest:
      type: object
      required:
        - targetFormat
      properties:
        fileId:
          type: string
          description: 已上传文件的ID
          example: "file_1234567890"
        targetFormat:
          type: string
          description: 目标格式
          enum: [pdf, docx, xlsx, pptx, md, txt, html]
          example: "pdf"
        mode:
          type: string
          description: 转换模式
          enum: [sync, async]
          default: sync
        options:
          $ref: '#/components/schemas/ConvertOptions'
    ConvertOptions:
      type: object
      properties:
        quality:
          type: string
          enum: [low, medium, high]
          default: medium
        ocr:
          type: boolean
          default: false
        pages:
          type: object
          properties:
            start:
              type: integer
              minimum: 1
            end:
              type: integer
              minimum: 1
```

#### 4.1.2 转换响应

```yaml
    ConvertResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data:
          type: object
          properties:
            taskId:
              type: string
              example: "task_1234567890"
            fileId:
              type: string
              example: "file_9876543210"
            fileName:
              type: string
              example: "document.pdf"
            fileUrl:
              type: string
              format: uri
              example: "https://api.example.com/api/v1/files/file_9876543210/download"
            fileSize:
              type: integer
              example: 1024000
            format:
              type: string
              example: "pdf"
            conversionTime:
              type: integer
              description: 转换耗时（毫秒）
              example: 5000
            quality:
              $ref: '#/components/schemas/QualityMetrics'
```

#### 4.1.3 错误响应

```yaml
    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
              example: "E00001"
            message:
              type: string
              example: "参数错误"
            details:
              type: object
              description: 错误详情
```

### 4.2 参数定义

```yaml
  parameters:
    TaskId:
      name: task_id
      in: path
      required: true
      description: 任务ID
      schema:
        type: string
        example: "task_1234567890"
    FileId:
      name: file_id
      in: path
      required: true
      description: 文件ID
      schema:
        type: string
        example: "file_1234567890"
```

### 4.3 响应定义

```yaml
  responses:
    BadRequest:
      description: 请求参数错误
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            success: false
            error:
              code: "E00002"
              message: "参数错误"
    Unauthorized:
      description: 未授权
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            success: false
            error:
              code: "E00004"
              message: "未授权"
    NotFound:
      description: 资源不存在
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    InternalServerError:
      description: 服务器内部错误
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
```

### 4.4 安全定义

```yaml
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT Bearer Token认证
    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: API Key认证
```

---

## 5. Swagger UI配置

### 5.1 安装依赖

```bash
# 安装Swagger相关依赖
pnpm add @fastify/swagger @fastify/swagger-ui
```

### 5.2 Fastify配置

```typescript
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'

// 注册Swagger
await fastify.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: '文档转换工具API',
      description: '文档转换工具RESTful API文档',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'https://api.example.com/api/v1',
        description: '生产环境',
      },
      {
        url: 'http://localhost:3000/api/v1',
        description: '本地开发环境',
      },
    ],
    tags: [
      { name: '文件转换', description: '文档格式转换相关接口' },
      { name: '任务管理', description: '转换任务管理相关接口' },
      { name: '文件管理', description: '文件上传、下载、管理相关接口' },
      { name: '系统监控', description: '系统状态监控相关接口' },
      { name: '认证授权', description: '用户认证和授权相关接口' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
    },
  },
})

// 注册Swagger UI
await fastify.register(fastifySwaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next()
    },
    preHandler: function (request, reply, next) {
      next()
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
})
```

### 5.3 路由文档化

```typescript
// 在路由定义中添加schema
fastify.post(
  '/convert',
  {
    schema: {
      description: '单文件格式转换',
      tags: ['文件转换'],
      summary: '单文件格式转换',
      security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
      body: {
        type: 'object',
        required: ['targetFormat'],
        properties: {
          fileId: {
            type: 'string',
            description: '已上传文件的ID',
          },
          targetFormat: {
            type: 'string',
            enum: ['pdf', 'docx', 'xlsx', 'pptx', 'md', 'txt', 'html'],
          },
          mode: {
            type: 'string',
            enum: ['sync', 'async'],
            default: 'sync',
          },
          options: {
            type: 'object',
            properties: {
              quality: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
              },
            },
          },
        },
      },
      response: {
        200: {
          description: '转换成功',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                taskId: { type: 'string' },
                fileId: { type: 'string' },
                fileName: { type: 'string' },
                fileUrl: { type: 'string' },
              },
            },
          },
        },
        400: {
          description: '请求参数错误',
          $ref: 'ErrorResponse#',
        },
      },
    },
  },
  async (request, reply) => {
    // 处理逻辑
  }
)
```

---

## 6. 文档维护

### 6.1 文档更新流程

1. **接口变更**：接口变更时同步更新OpenAPI文档
2. **代码审查**：文档变更需要代码审查
3. **版本管理**：文档版本与API版本保持一致
4. **发布流程**：文档更新后自动发布到Swagger UI

### 6.2 文档质量检查

- **完整性**：所有接口都有文档
- **准确性**：文档与代码实现一致
- **示例**：每个接口都有请求/响应示例
- **描述**：接口和参数都有清晰描述

### 6.3 文档生成

```bash
# 生成OpenAPI文档
pnpm run docs:generate

# 验证OpenAPI文档
pnpm run docs:validate

# 启动Swagger UI
pnpm run docs:serve
```

---

## 7. 代码示例

### 7.1 多语言示例

在OpenAPI文档中为每个接口提供多语言代码示例：

```yaml
paths:
  /convert:
    post:
      x-code-samples:
        - lang: 'JavaScript'
          source: |
            const response = await fetch('https://api.example.com/api/v1/convert', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer {token}',
                'X-API-Key': '{api_key}'
              },
              body: JSON.stringify({
                fileId: 'file_1234567890',
                targetFormat: 'pdf',
                mode: 'sync'
              })
            });
        - lang: 'Python'
          source: |
            import requests
            
            response = requests.post(
              'https://api.example.com/api/v1/convert',
              headers={
                'Authorization': 'Bearer {token}',
                'X-API-Key': '{api_key}'
              },
              json={
                'fileId': 'file_1234567890',
                'targetFormat': 'pdf',
                'mode': 'sync'
              }
            )
        - lang: 'cURL'
          source: |
            curl -X POST https://api.example.com/api/v1/convert \
              -H "Content-Type: application/json" \
              -H "Authorization: Bearer {token}" \
              -H "X-API-Key: {api_key}" \
              -d '{
                "fileId": "file_1234567890",
                "targetFormat": "pdf",
                "mode": "sync"
              }'
```

---

## 8. 最佳实践

### 8.1 文档编写原则

- **清晰描述**：接口和参数都有清晰的描述
- **完整示例**：提供完整的请求/响应示例
- **错误说明**：说明可能的错误情况和处理方式
- **版本管理**：文档版本与API版本保持一致

### 8.2 命名规范

- **操作ID**：使用驼峰命名，如`convertFile`、`getTaskStatus`
- **标签名**：使用中文，便于理解
- **Schema名**：使用PascalCase，如`ConvertRequest`、`ErrorResponse`

### 8.3 文档组织

- **按功能分组**：使用tags将相关接口分组
- **复用组件**：公共的schema、参数、响应定义在components中
- **版本控制**：使用OpenAPI的版本管理功能

---

## 9. 工具推荐

### 9.1 编辑工具

- **Swagger Editor**：在线编辑OpenAPI文档
- **VS Code扩展**：OpenAPI (Swagger) Editor
- **IntelliJ IDEA**：内置OpenAPI支持

### 9.2 验证工具

- **Swagger Validator**：验证OpenAPI文档格式
- **Spectral**：OpenAPI规范检查工具

### 9.3 生成工具

- **Swagger Codegen**：从OpenAPI文档生成客户端代码
- **OpenAPI Generator**：更强大的代码生成工具

---

## 10. 附录

### 10.1 参考资源

- [OpenAPI规范](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Fastify Swagger文档](https://github.com/fastify/fastify-swagger)

### 10.2 示例文档

完整的OpenAPI文档示例请参考项目中的`openapi.yaml`文件。

---

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |
