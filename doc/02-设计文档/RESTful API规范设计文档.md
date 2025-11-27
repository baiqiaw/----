# RESTful API规范设计文档

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |

## 1. 文档说明

### 1.1 文档目的

本文档定义文档转换工具系统的RESTful API规范，包括URL规则、HTTP方法、状态码、请求/响应格式、认证授权、错误处理等，为所有API接口设计提供统一的规范和标准。

### 1.2 适用范围

本文档适用于：

- API接口开发人员
- 前端开发人员
- SDK开发人员
- 测试人员
- 第三方集成开发者

### 1.3 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《系统概要设计文档（HLD）》
- 《技术选型方案文档》
- 《错误处理机制详细设计文档（DDD）》

---

## 2. API概述

### 2.1 API定位

文档转换工具提供RESTful API接口，支持企业版用户通过API方式集成文档转换功能到自己的系统中。

### 2.2 API特性

- **RESTful风格**：遵循REST架构原则
- **统一规范**：所有接口遵循统一的规范和格式
- **安全认证**：Bearer Token + API Key双重认证
- **版本管理**：支持API版本控制
- **错误处理**：统一的错误码和错误消息
- **限流保护**：支持请求限流和频率控制
- **文档完善**：提供完整的API文档（Swagger/OpenAPI）

### 2.3 API版本

当前版本：**v1**

API版本通过URL路径标识：`/api/v1/`

---

## 3. 基础规范

### 3.1 URL规则

#### 3.1.1 URL格式

```text
https://api.example.com/api/{version}/{resource}/{identifier}/{action}
```

**格式说明**：

- `https://api.example.com`：API服务域名
- `/api`：API路径前缀
- `{version}`：API版本（如v1）
- `{resource}`：资源名称（复数形式，如files、tasks）
- `{identifier}`：资源标识符（可选，如文件ID、任务ID）
- `{action}`：操作名称（可选，如download、cancel）

#### 3.1.2 URL命名规范

- **使用小写字母**：URL全部使用小写字母
- **使用连字符**：多个单词使用连字符（-）分隔，不使用下划线
- **使用复数形式**：资源名称使用复数形式
- **避免动词**：URL中不包含动词，动词通过HTTP方法表达

**示例**：

```text
✅ 正确：
GET /api/v1/files
GET /api/v1/files/{file_id}
POST /api/v1/files/{file_id}/download
GET /api/v1/tasks/{task_id}/status

❌ 错误：
GET /api/v1/getFiles
GET /api/v1/file_list
POST /api/v1/files/{file_id}/getDownload
```

### 3.2 HTTP方法

#### 3.2.1 方法使用规范

| HTTP方法 | 用途 | 幂等性 | 示例 |
| ---- | ---- | ---- | ---- |
| GET | 获取资源 | 是 | `GET /api/v1/files/{file_id}` |
| POST | 创建资源或执行操作 | 否 | `POST /api/v1/convert` |
| PUT | 完整更新资源 | 是 | `PUT /api/v1/users/{user_id}` |
| PATCH | 部分更新资源 | 否 | `PATCH /api/v1/tasks/{task_id}` |
| DELETE | 删除资源 | 是 | `DELETE /api/v1/files/{file_id}` |

#### 3.2.2 方法选择原则

- **GET**：用于查询和获取资源，不改变服务器状态
- **POST**：用于创建资源或执行非幂等操作（如转换、上传）
- **PUT**：用于完整替换资源（不常用）
- **PATCH**：用于部分更新资源
- **DELETE**：用于删除资源

### 3.3 HTTP状态码

#### 3.3.1 状态码使用规范

| 状态码 | 含义 | 使用场景 |
| ---- | ---- | ---- |
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 202 | Accepted | 请求已接受，异步处理中 |
| 204 | No Content | 请求成功，无返回内容 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或认证失败 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable Entity | 请求格式正确但语义错误 |
| 429 | Too Many Requests | 请求频率超限 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |
| 504 | Gateway Timeout | 网关超时 |

#### 3.3.2 状态码使用示例

```typescript
// 成功响应
200 OK - 获取文件信息成功
201 Created - 创建任务成功
202 Accepted - 批量转换任务已接受
204 No Content - 删除文件成功

// 客户端错误
400 Bad Request - 请求参数格式错误
401 Unauthorized - Token无效或过期
403 Forbidden - 用户无权限访问该资源
404 Not Found - 文件不存在
409 Conflict - 任务已存在
422 Unprocessable Entity - 文件格式不支持

// 服务器错误
500 Internal Server Error - 服务器内部错误
503 Service Unavailable - 转换服务暂时不可用
```

### 3.4 请求格式

#### 3.4.1 请求头

**必需请求头**：

| 请求头 | 说明 | 示例 |
| ---- | ---- | ---- |
| Content-Type | 请求体类型 | `application/json` |
| Authorization | 认证Token | `Bearer {token}` |
| X-API-Key | API密钥 | `{api_key}` |
| Accept | 接受的响应类型 | `application/json` |

**可选请求头**：

| 请求头 | 说明 | 示例 |
| ---- | ---- | ---- |
| X-Request-ID | 请求ID（用于追踪） | `uuid` |
| X-Client-Version | 客户端版本 | `1.0.0` |
| Accept-Language | 接受的语言 | `zh-CN,en-US` |

#### 3.4.2 请求体

**JSON格式**：

- Content-Type: `application/json`
- 使用UTF-8编码
- 字段命名使用驼峰命名（camelCase）

**示例**：

```json
{
  "sourceFormat": "docx",
  "targetFormat": "pdf",
  "fileId": "file_123456",
  "options": {
    "quality": "high",
    "ocrEnabled": false
  }
}
```

#### 3.4.3 查询参数

- 使用小写字母和连字符
- 布尔值使用`true`/`false`
- 数组使用逗号分隔或重复参数

**示例**：

```text
GET /api/v1/files?page=1&pageSize=20&sort=createdAt&order=desc
GET /api/v1/tasks?status=pending,processing&limit=10
```

#### 3.4.4 路径参数

- 使用小写字母和连字符
- 在URL中明确标识

**示例**：

```text
GET /api/v1/files/{file_id}
GET /api/v1/tasks/{task_id}/status
```

### 3.5 响应格式

#### 3.5.1 成功响应格式

**标准成功响应**：

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}
```

**示例**：

```json
{
  "success": true,
  "data": {
    "fileId": "file_123456",
    "fileName": "document.docx",
    "fileSize": 1024000,
    "createdAt": "2025-11-15T10:30:00Z"
  },
  "message": "文件信息获取成功",
  "timestamp": "2025-11-15T10:30:00Z",
  "requestId": "req_abc123"
}
```

**分页响应**：

```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
  requestId?: string;
}
```

**示例**：

```json
{
  "success": true,
  "data": [
    {
      "fileId": "file_123456",
      "fileName": "document1.docx"
    },
    {
      "fileId": "file_123457",
      "fileName": "document2.docx"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2025-11-15T10:30:00Z",
  "requestId": "req_abc123"
}
```

#### 3.5.2 错误响应格式

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // 错误码
    message: string;        // 错误消息
    details?: any;          // 错误详情
    suggestion?: string;    // 操作建议
  };
  timestamp: string;
  requestId?: string;
}
```

**示例**：

```json
{
  "success": false,
  "error": {
    "code": "E01001",
    "message": "格式不支持",
    "details": {
      "sourceFormat": "xyz",
      "supportedFormats": ["docx", "pdf", "xlsx"]
    },
    "suggestion": "请使用支持的格式：docx, pdf, xlsx"
  },
  "timestamp": "2025-11-15T10:30:00Z",
  "requestId": "req_abc123"
}
```

### 3.6 日期时间格式

统一使用ISO 8601格式：`YYYY-MM-DDTHH:mm:ssZ`

**示例**：

```json
{
  "createdAt": "2025-11-15T10:30:00Z",
  "updatedAt": "2025-11-15T11:00:00Z"
}
```

---

## 4. 认证授权

### 4.1 认证方式

#### 4.1.1 双重认证机制

系统采用**Bearer Token + API Key**双重认证：

1. **Bearer Token**：用于用户身份认证
2. **API Key**：用于API访问授权

#### 4.1.2 认证流程

```text
1. 用户登录获取Token
   POST /api/v1/auth/login
   → 返回: { token: "xxx", expiresIn: 3600 }

2. 获取API Key（企业版）
   GET /api/v1/auth/api-keys
   → 返回: { apiKey: "xxx" }

3. 使用Token和API Key访问API
   Headers:
     Authorization: Bearer {token}
     X-API-Key: {api_key}
```

### 4.2 Token认证

#### 4.2.1 Token获取

**接口**：`POST /api/v1/auth/login`

**请求**：

```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "refreshToken": "refresh_token_xxx"
  }
}
```

#### 4.2.2 Token刷新

**接口**：`POST /api/v1/auth/refresh`

**请求**：

```json
{
  "refreshToken": "refresh_token_xxx"
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "token": "new_token_xxx",
    "expiresIn": 3600
  }
}
```

#### 4.2.3 Token使用

在请求头中携带Token：

```http
Authorization: Bearer {token}
```

### 4.3 API Key认证

#### 4.3.1 API Key获取

**接口**：`GET /api/v1/auth/api-keys`

**响应**：

```json
{
  "success": true,
  "data": {
    "apiKey": "api_key_xxx",
    "createdAt": "2025-11-15T10:30:00Z",
    "expiresAt": "2026-11-15T10:30:00Z"
  }
}
```

#### 4.3.2 API Key使用

在请求头中携带API Key：

```http
X-API-Key: {api_key}
```

#### 4.3.3 API Key管理

- **创建**：`POST /api/v1/auth/api-keys`
- **列表**：`GET /api/v1/auth/api-keys`
- **删除**：`DELETE /api/v1/auth/api-keys/{key_id}`
- **重置**：`POST /api/v1/auth/api-keys/{key_id}/reset`

### 4.4 权限控制

#### 4.4.1 权限级别

| 权限级别 | 说明 | 适用场景 |
| ---- | ---- | ---- |
| Public | 公开接口，无需认证 | 健康检查、系统状态 |
| User | 需要用户认证 | 个人文件操作 |
| Admin | 需要管理员权限 | 系统管理、用户管理 |
| Enterprise | 需要企业版权限 | API访问、批量操作 |

#### 4.4.2 权限验证

- 所有需要认证的接口必须同时提供Token和API Key
- 权限不足时返回`403 Forbidden`
- Token过期时返回`401 Unauthorized`

---

## 5. 错误处理

### 5.1 错误码体系

使用统一的错误码体系（参考《错误处理机制详细设计文档（DDD）》）：

- **格式**：`E[模块][序号]`
- **示例**：`E01001`（格式转换模块，错误序号001）

### 5.2 错误响应

所有错误都返回统一的错误响应格式：

```json
{
  "success": false,
  "error": {
    "code": "E01001",
    "message": "格式不支持",
    "details": {
      "sourceFormat": "xyz",
      "supportedFormats": ["docx", "pdf"]
    },
    "suggestion": "请使用支持的格式"
  },
  "timestamp": "2025-11-15T10:30:00Z",
  "requestId": "req_abc123"
}
```

### 5.3 常见错误

| HTTP状态码 | 错误码 | 错误消息 | 说明 |
| ---- | ---- | ---- | ---- |
| 400 | E00002 | 参数错误 | 请求参数不合法 |
| 401 | E00003 | 未认证 | Token无效或过期 |
| 403 | E00004 | 权限不足 | 用户无权限执行操作 |
| 404 | E00005 | 资源不存在 | 请求的资源不存在 |
| 422 | E01001 | 格式不支持 | 文件格式不支持 |
| 429 | E00006 | 请求频率超限 | 请求频率超过限制 |
| 500 | E00001 | 系统内部错误 | 服务器内部错误 |

---

## 6. 限流和频率控制

### 6.1 限流策略

#### 6.1.1 限流级别

| 用户类型 | 限流规则 | 说明 |
| ---- | ---- | ---- |
| 免费用户 | 100次/小时 | 每小时最多100次请求 |
| 基础用户 | 1000次/小时 | 每小时最多1000次请求 |
| 企业用户 | 10000次/小时 | 每小时最多10000次请求 |
| 企业高级 | 无限制 | 无限制（需单独配置） |

#### 6.1.2 限流响应

当请求频率超限时，返回`429 Too Many Requests`：

```json
{
  "success": false,
  "error": {
    "code": "E00006",
    "message": "请求频率超限",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "resetAt": "2025-11-15T11:00:00Z"
    }
  },
  "timestamp": "2025-11-15T10:30:00Z"
}
```

**响应头**：

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1734264000
```

### 6.2 频率控制

#### 6.2.1 控制维度

- **按用户**：每个用户的请求频率
- **按IP**：每个IP地址的请求频率
- **按接口**：每个接口的请求频率

#### 6.2.2 控制策略

- **令牌桶算法**：平滑处理突发请求
- **滑动窗口**：精确控制时间窗口内的请求数
- **分布式限流**：支持多实例部署的限流

---

## 7. 版本管理

### 7.1 版本策略

#### 7.1.1 URL版本控制

API版本通过URL路径标识：

```text
/api/v1/files
/api/v2/files
```

#### 7.1.2 版本兼容性

- **主版本（v1, v2）**：不兼容的变更
- **次版本（v1.1, v1.2）**：向后兼容的新功能
- **补丁版本（v1.1.1）**：向后兼容的bug修复

#### 7.1.3 版本支持策略

- 同时支持最多3个主版本
- 旧版本至少支持6个月
- 版本废弃前提前3个月通知

### 7.2 版本迁移

#### 7.2.1 迁移指南

- 提供详细的版本迁移文档
- 提供迁移工具和脚本
- 支持渐进式迁移

---

## 8. 安全性

### 8.1 传输安全

#### 8.1.1 HTTPS强制

- 所有API请求必须使用HTTPS
- HTTP请求自动重定向到HTTPS
- 使用TLS 1.2或更高版本

#### 8.1.2 证书验证

- 使用有效的SSL证书
- 支持证书链验证
- 定期更新证书

### 8.2 数据安全

#### 8.2.1 敏感数据保护

- 密码、Token等敏感信息不在URL中传递
- 敏感数据使用加密传输
- 日志中不记录敏感信息

#### 8.2.2 数据验证

- 所有输入数据必须验证
- 防止SQL注入、XSS攻击
- 文件上传安全检查

### 8.3 请求安全

#### 8.3.1 CORS配置

```typescript
const corsOptions = {
  origin: ['https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
};
```

#### 8.3.2 CSRF保护

- 使用CSRF Token
- 验证请求来源
- 检查Referer头

---

## 9. 文档和规范

### 9.1 API文档

#### 9.1.1 OpenAPI规范

使用OpenAPI 3.0规范编写API文档：

- **格式**：YAML或JSON
- **工具**：Swagger UI、ReDoc
- **访问**：`/api/docs`

#### 9.1.2 文档内容

- 接口描述和用途
- 请求参数和响应格式
- 错误码和错误消息
- 请求示例和响应示例
- 认证和授权说明

### 9.2 代码示例

#### 9.2.1 示例代码

提供多种语言的示例代码：

- **JavaScript/TypeScript**
- **Python**
- **Java**
- **C#**
- **cURL**

#### 9.2.2 SDK支持

- 提供官方SDK（Python、Java、C#）
- SDK文档和使用示例
- SDK版本管理

---

## 10. 最佳实践

### 10.1 设计原则

1. **RESTful原则**：遵循REST架构原则
2. **统一规范**：所有接口遵循统一规范
3. **版本管理**：支持API版本控制
4. **错误处理**：统一的错误码和错误消息
5. **安全性**：HTTPS、认证、授权、限流
6. **文档完善**：提供完整的API文档

### 10.2 开发建议

1. **使用HTTPS**：所有请求使用HTTPS
2. **错误处理**：正确处理所有错误情况
3. **参数验证**：验证所有输入参数
4. **日志记录**：记录关键操作和错误
5. **性能优化**：合理使用缓存和异步处理
6. **测试覆盖**：编写单元测试和集成测试

### 10.3 使用建议

1. **重试机制**：实现请求重试机制
2. **错误处理**：正确处理错误响应
3. **限流处理**：遵守限流规则，实现退避策略
4. **版本管理**：及时更新API版本
5. **安全存储**：安全存储Token和API Key

---

## 11. 附录

### 11.1 术语表

- **REST**：Representational State Transfer，表述性状态转移
- **API**：Application Programming Interface，应用程序编程接口
- **Token**：访问令牌，用于身份认证
- **API Key**：API密钥，用于API访问授权
- **CORS**：Cross-Origin Resource Sharing，跨域资源共享
- **CSRF**：Cross-Site Request Forgery，跨站请求伪造

### 11.2 参考资源

- [RESTful API设计指南](https://restfulapi.net/)
- [OpenAPI规范](https://swagger.io/specification/)
- [HTTP状态码](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [JWT认证](https://jwt.io/)

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |
