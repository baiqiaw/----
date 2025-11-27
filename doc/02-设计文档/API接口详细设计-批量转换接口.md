# API接口详细设计 - 批量转换接口

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |

## 1. 文档说明

### 1.1 文档目的

本文档详细设计批量转换接口（`POST /api/v1/batch/convert`），包括接口规范、请求参数、响应格式、任务管理、错误处理、使用示例等，为接口开发和集成提供详细指导。

### 1.2 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《RESTful API规范设计文档》
- 《批量处理模块详细设计文档（DDD）》
- 《单文件转换接口详细设计文档》
- 《错误处理机制详细设计文档（DDD）》

---

## 2. 接口概述

### 2.1 接口信息

| 项目 | 内容 |
| ---- | ---- |
| 接口路径 | `/api/v1/batch/convert` |
| HTTP方法 | `POST` |
| 接口版本 | `v1` |
| 接口描述 | 批量文件格式转换接口，支持多个文件同时转换 |
| 认证要求 | Bearer Token + API Key |

### 2.2 功能特性

- **批量处理**：支持≤100个文件/批次同时转换
- **异步处理**：所有批量转换均为异步模式
- **进度监控**：实时查询任务进度和单个文件状态
- **任务控制**：支持任务暂停、恢复、取消
- **文件合并**：支持多文件转换后合并为单一输出
- **批量命名**：支持自定义输出文件名规则
- **并发控制**：自动控制并发数量，优化资源使用
- **结果汇总**：提供详细的转换结果统计

### 2.3 适用场景

- **企业批量转换**：企业用户需要批量转换大量文档
- **格式标准化**：将多种格式统一转换为目标格式
- **批量归档**：批量将文档转换为PDF归档
- **数据迁移**：批量转换文档格式用于系统迁移

---

## 3. 请求规范

### 3.1 请求URL

```text
POST https://api.example.com/api/v1/batch/convert
```

### 3.2 请求头

| 请求头 | 类型 | 必需 | 说明 | 示例 |
| ---- | ---- | ---- | ---- | ---- |
| Content-Type | string | 是 | 请求体类型 | `application/json` |
| Authorization | string | 是 | Bearer Token | `Bearer {token}` |
| X-API-Key | string | 是 | API密钥 | `{api_key}` |
| Accept | string | 否 | 接受的响应类型 | `application/json` |
| X-Request-ID | string | 否 | 请求ID（用于追踪） | `uuid` |

### 3.3 请求参数

#### 3.3.1 请求体结构

```typescript
interface BatchConvertRequest {
  // 文件列表
  files: BatchFileItem[];     // 文件列表（必需，≤100个）
  
  // 转换配置
  targetFormat: string;        // 目标格式（必需）
  sourceFormat?: string;       // 源格式（可选，自动识别）
  
  // 转换选项
  options?: ConvertOptions;    // 转换参数配置（参考单文件转换接口）
  
  // 批量处理选项
  batchOptions?: BatchOptions; // 批量处理特定选项
  
  // 回调配置
  callback?: CallbackConfig;  // 回调URL配置
}
```

#### 3.3.2 文件项（BatchFileItem）

```typescript
interface BatchFileItem {
  fileId: string;              // 文件ID（必需）
  fileName?: string;           // 文件名（可选，用于显示）
  targetFormat?: string;       // 单个文件的目标格式（可选，覆盖全局设置）
  options?: ConvertOptions;    // 单个文件的转换选项（可选，覆盖全局设置）
}
```

#### 3.3.3 批量处理选项（BatchOptions）

```typescript
interface BatchOptions {
  // 并发控制
  concurrency?: number;       // 并发数量，默认5，最大20
  
  // 文件合并
  mergeEnabled?: boolean;     // 是否合并文件，默认false
  mergeOptions?: MergeOptions; // 合并选项
  
  // 批量命名
  namingRule?: NamingRule;    // 命名规则
  
  // 任务控制
  autoRetry?: boolean;         // 自动重试失败任务，默认true
  maxRetries?: number;         // 最大重试次数，默认3
  
  // 优先级
  priority?: 'low' | 'normal' | 'high';  // 任务优先级，默认normal
  
  // 通知设置
  notifyOnComplete?: boolean; // 完成时通知，默认false
  notifyOnError?: boolean;    // 错误时通知，默认true
}
```

#### 3.3.4 文件合并选项（MergeOptions）

```typescript
interface MergeOptions {
  // 合并方式
  method: 'append' | 'interleave';  // 追加或交错合并
  
  // 合并顺序
  orderBy?: 'filename' | 'uploadTime' | 'custom';  // 排序方式
  customOrder?: string[];      // 自定义顺序（文件ID列表）
  
  // 分隔符
  separator?: {
    type: 'pageBreak' | 'blankPage' | 'custom';  // 分隔符类型
    content?: string;           // 自定义内容（如标题）
  };
  
  // 输出选项
  outputFileName?: string;      // 合并后的文件名
  outputFormat?: string;        // 合并后的格式（默认与targetFormat相同）
}
```

#### 3.3.5 命名规则（NamingRule）

```typescript
interface NamingRule {
  // 命名模式
  pattern: string;             // 命名模式，支持变量替换
  
  // 变量说明
  // {originalName} - 原文件名（不含扩展名）
  // {originalExt} - 原文件扩展名
  // {targetFormat} - 目标格式
  // {timestamp} - 时间戳
  // {index} - 文件序号（从1开始）
  // {date} - 日期（YYYY-MM-DD）
  // {time} - 时间（HH-mm-ss）
  
  // 示例：
  // "{originalName}_{targetFormat}_{index}" -> "document_pdf_1.pdf
  // "{originalName}_{date}_{time}" -> "document_2025-11-15_10-30-00.pdf
}
```

### 3.4 请求示例

#### 3.4.1 基础批量转换

```json
{
  "files": [
    {
      "fileId": "file_1234567890"
    },
    {
      "fileId": "file_1234567891"
    },
    {
      "fileId": "file_1234567892"
    }
  ],
  "targetFormat": "pdf",
  "options": {
    "quality": "high"
  }
}
```

#### 3.4.2 带合并的批量转换

```json
{
  "files": [
    {
      "fileId": "file_1234567890"
    },
    {
      "fileId": "file_1234567891"
    }
  ],
  "targetFormat": "pdf",
  "options": {
    "quality": "high"
  },
  "batchOptions": {
    "mergeEnabled": true,
    "mergeOptions": {
      "method": "append",
      "orderBy": "filename",
      "separator": {
        "type": "pageBreak"
      },
      "outputFileName": "merged_documents.pdf"
    },
    "concurrency": 3
  },
  "callback": {
    "url": "https://example.com/webhook/batch",
    "method": "POST"
  }
}
```

#### 3.4.3 自定义命名规则

```json
{
  "files": [
    {
      "fileId": "file_1234567890",
      "fileName": "document1.docx"
    },
    {
      "fileId": "file_1234567891",
      "fileName": "document2.docx"
    }
  ],
  "targetFormat": "pdf",
  "batchOptions": {
    "namingRule": {
      "pattern": "{originalName}_{date}_{index}"
    },
    "concurrency": 5
  }
}
```

---

## 4. 响应规范

### 4.1 成功响应（202 Accepted）

批量转换接口始终返回异步响应（202 Accepted），因为批量转换需要较长时间。

```typescript
interface BatchConvertResponse {
  success: true;
  data: {
    batchId: string;           // 批量任务ID
    taskCount: number;         // 任务总数
    status: 'pending' | 'processing';  // 任务状态
    estimatedTime?: number;    // 预计完成时间（秒）
    progressUrl: string;       // 进度查询URL
    resultUrl: string;         // 结果查询URL
    controlUrl: string;        // 任务控制URL
  };
  timestamp: string;
  requestId?: string;
}
```

**示例**：

```json
{
  "success": true,
  "data": {
    "batchId": "batch_1234567890",
    "taskCount": 10,
    "status": "pending",
    "estimatedTime": 300,
    "progressUrl": "https://api.example.com/api/v1/batch/batch_1234567890/progress",
    "resultUrl": "https://api.example.com/api/v1/batch/batch_1234567890/result",
    "controlUrl": "https://api.example.com/api/v1/batch/batch_1234567890/control"
  },
  "timestamp": "2025-11-15T10:30:00Z",
  "requestId": "req_abc123"
}
```

### 4.2 错误响应

参考《RESTful API规范设计文档》中的错误响应格式。

**常见错误**：

| HTTP状态码 | 错误码 | 错误消息 | 说明 |
| ---- | ---- | ---- | ---- |
| 400 | E00002 | 参数错误 | 请求参数不合法 |
| 400 | E04001 | 批量任务创建失败 | 批量任务创建失败 |
| 400 | E04002 | 任务队列已满 | 任务队列已满 |
| 400 | E02002 | 文件过大 | 文件大小超过限制 |
| 401 | E00003 | 未认证 | Token无效或过期 |
| 403 | E00004 | 权限不足 | 用户无权限执行操作 |
| 404 | E00005 | 文件不存在 | 指定的文件ID不存在 |
| 422 | E01001 | 格式不支持 | 不支持该转换路径 |
| 429 | E00006 | 请求频率超限 | 请求频率超过限制 |

---

## 5. 任务管理接口

### 5.1 任务进度查询

**接口**：`GET /api/v1/batch/{batch_id}/progress`

**响应**：

```typescript
interface BatchProgressResponse {
  success: true;
  data: {
    batchId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'paused';
    progress: {
      total: number;           // 总任务数
      completed: number;       // 已完成数
      failed: number;          // 失败数
      processing: number;      // 处理中数
      pending: number;         // 等待数
      percentage: number;      // 完成百分比（0-100）
    };
    tasks: Array<{             // 任务列表
      taskId: string;
      fileId: string;
      fileName: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;         // 单个任务进度（0-100）
      error?: {
        code: string;
        message: string;
      };
    }>;
    estimatedTimeRemaining?: number;  // 预计剩余时间（秒）
    startTime?: string;        // 开始时间
    endTime?: string;          // 结束时间
  };
  timestamp: string;
}
```

**示例**：

```json
{
  "success": true,
  "data": {
    "batchId": "batch_1234567890",
    "status": "processing",
    "progress": {
      "total": 10,
      "completed": 5,
      "failed": 1,
      "processing": 2,
      "pending": 2,
      "percentage": 50
    },
    "tasks": [
      {
        "taskId": "task_001",
        "fileId": "file_1234567890",
        "fileName": "document1.docx",
        "status": "completed",
        "progress": 100
      },
      {
        "taskId": "task_002",
        "fileId": "file_1234567891",
        "fileName": "document2.docx",
        "status": "processing",
        "progress": 60
      },
      {
        "taskId": "task_003",
        "fileId": "file_1234567892",
        "fileName": "document3.docx",
        "status": "failed",
        "progress": 0,
        "error": {
          "code": "E01002",
          "message": "文件损坏"
        }
      }
    ],
    "estimatedTimeRemaining": 120,
    "startTime": "2025-11-15T10:30:00Z"
  },
  "timestamp": "2025-11-15T10:35:00Z"
}
```

### 5.2 任务结果查询

**接口**：`GET /api/v1/batch/{batch_id}/result`

**响应**：

```typescript
interface BatchResultResponse {
  success: true;
  data: {
    batchId: string;
    status: 'completed' | 'failed' | 'cancelled' | 'partial';  // partial表示部分成功
    summary: {
      total: number;
      success: number;
      failed: number;
      successRate: number;      // 成功率（0-100）
    };
    results: Array<{
      taskId: string;
      fileId: string;
      fileName: string;
      status: 'completed' | 'failed';
      resultFileId?: string;    // 结果文件ID（成功时）
      resultFileName?: string;  // 结果文件名
      resultFileUrl?: string;   // 结果文件下载URL
      resultFileSize?: number;  // 结果文件大小
      error?: {
        code: string;
        message: string;
      };
      conversionTime?: number;  // 转换耗时（毫秒）
    }>;
    mergedFile?: {              // 合并文件（如果启用合并）
      fileId: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
    };
    downloadUrl?: string;       // 批量下载URL（ZIP包）
    startTime: string;
    endTime: string;
    totalTime: number;          // 总耗时（毫秒）
  };
  timestamp: string;
}
```

**示例**：

```json
{
  "success": true,
  "data": {
    "batchId": "batch_1234567890",
    "status": "completed",
    "summary": {
      "total": 10,
      "success": 9,
      "failed": 1,
      "successRate": 90
    },
    "results": [
      {
        "taskId": "task_001",
        "fileId": "file_1234567890",
        "fileName": "document1.docx",
        "status": "completed",
        "resultFileId": "file_result_001",
        "resultFileName": "document1.pdf",
        "resultFileUrl": "https://api.example.com/api/v1/files/file_result_001/download",
        "resultFileSize": 2048000,
        "conversionTime": 15000
      },
      {
        "taskId": "task_002",
        "fileId": "file_1234567891",
        "fileName": "document2.docx",
        "status": "failed",
        "error": {
          "code": "E01002",
          "message": "文件损坏"
        }
      }
    ],
    "mergedFile": {
      "fileId": "file_merged_123",
      "fileName": "merged_documents.pdf",
      "fileUrl": "https://api.example.com/api/v1/files/file_merged_123/download",
      "fileSize": 20480000
    },
    "downloadUrl": "https://api.example.com/api/v1/batch/batch_1234567890/download",
    "startTime": "2025-11-15T10:30:00Z",
    "endTime": "2025-11-15T10:35:00Z",
    "totalTime": 300000
  },
  "timestamp": "2025-11-15T10:35:00Z"
}
```

### 5.3 任务控制

#### 5.3.1 暂停任务

**接口**：`POST /api/v1/batch/{batch_id}/pause`

**响应**：

```json
{
  "success": true,
  "data": {
    "batchId": "batch_1234567890",
    "status": "paused",
    "message": "任务已暂停"
  },
  "timestamp": "2025-11-15T10:35:00Z"
}
```

#### 5.3.2 恢复任务

**接口**：`POST /api/v1/batch/{batch_id}/resume`

**响应**：

```json
{
  "success": true,
  "data": {
    "batchId": "batch_1234567890",
    "status": "processing",
    "message": "任务已恢复"
  },
  "timestamp": "2025-11-15T10:35:00Z"
}
```

#### 5.3.3 取消任务

**接口**：`POST /api/v1/batch/{batch_id}/cancel`

**响应**：

```json
{
  "success": true,
  "data": {
    "batchId": "batch_1234567890",
    "status": "cancelled",
    "message": "任务已取消"
  },
  "timestamp": "2025-11-15T10:35:00Z"
}
```

#### 5.3.4 重试失败任务

**接口**：`POST /api/v1/batch/{batch_id}/retry`

**请求**：

```json
{
  "taskIds": ["task_001", "task_002"]  // 可选，不提供则重试所有失败任务
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "batchId": "batch_1234567890",
    "retriedTasks": 2,
    "message": "已重新提交2个失败任务"
  },
  "timestamp": "2025-11-15T10:35:00Z"
}
```

### 5.4 批量下载

**接口**：`GET /api/v1/batch/{batch_id}/download`

**说明**：下载所有成功转换的文件（ZIP压缩包）

**响应**：返回ZIP文件的二进制流

**响应头**：

```http
Content-Type: application/zip
Content-Disposition: attachment; filename="batch_1234567890_results.zip"
```

---

## 6. 使用场景

### 6.1 场景1：基础批量转换

**适用场景**：批量转换多个文件为同一格式

**请求示例**：

```json
{
  "files": [
    {"fileId": "file_001"},
    {"fileId": "file_002"},
    {"fileId": "file_003"}
  ],
  "targetFormat": "pdf",
  "options": {
    "quality": "high"
  }
}
```

**查询进度**：

```bash
GET /api/v1/batch/batch_1234567890/progress
```

**查询结果**：

```bash
GET /api/v1/batch/batch_1234567890/result
```

### 6.2 场景2：带合并的批量转换

**适用场景**：多个文件转换后合并为单一PDF

**请求示例**：

```json
{
  "files": [
    {"fileId": "file_001"},
    {"fileId": "file_002"},
    {"fileId": "file_003"}
  ],
  "targetFormat": "pdf",
  "batchOptions": {
    "mergeEnabled": true,
    "mergeOptions": {
      "method": "append",
      "orderBy": "filename",
      "separator": {
        "type": "pageBreak"
      },
      "outputFileName": "merged_report.pdf"
    }
  }
}
```

### 6.3 场景3：自定义命名规则

**适用场景**：批量转换后需要统一的命名规则

**请求示例**：

```json
{
  "files": [
    {"fileId": "file_001", "fileName": "report_2024.docx"},
    {"fileId": "file_002", "fileName": "report_2025.docx"}
  ],
  "targetFormat": "pdf",
  "batchOptions": {
    "namingRule": {
      "pattern": "{originalName}_converted_{date}"
    }
  }
}
```

### 6.4 场景4：任务控制

**适用场景**：需要暂停、恢复或取消批量任务

**暂停任务**：

```bash
POST /api/v1/batch/batch_1234567890/pause
```

**恢复任务**：

```bash
POST /api/v1/batch/batch_1234567890/resume
```

**取消任务**：

```bash
POST /api/v1/batch/batch_1234567890/cancel
```

**重试失败任务**：

```bash
POST /api/v1/batch/batch_1234567890/retry
```

---

## 7. 错误处理

### 7.1 错误码定义

参考《错误处理机制详细设计文档（DDD）》中的错误码体系。

### 7.2 部分失败处理

批量转换中，部分任务可能失败。系统会：

1. **继续处理**：失败任务不影响其他任务
2. **记录错误**：详细记录每个失败任务的原因
3. **提供重试**：支持重试失败的任务
4. **结果汇总**：在结果中提供成功率和失败详情

### 7.3 重试机制

- **自动重试**：可配置自动重试失败任务
- **手动重试**：通过API手动重试失败任务
- **重试策略**：指数退避，最多重试3次

---

## 8. 性能要求

### 8.1 处理能力

| 文件数量 | 预计处理时间 | 并发数 |
| ---- | ---- | ---- |
| ≤10个 | ≤5分钟 | 5 |
| ≤50个 | ≤20分钟 | 10 |
| ≤100个 | ≤40分钟 | 20 |

### 8.2 文件大小限制

| 用户类型 | 单文件限制 | 批次总大小限制 |
| ---- | ---- | ---- |
| 免费用户 | 10MB | 100MB |
| 基础用户 | 50MB | 500MB |
| 企业用户 | 200MB | 2GB |
| 企业高级 | 500MB | 5GB |

### 8.3 并发控制

- **默认并发数**：5
- **最大并发数**：20（企业高级用户）
- **自动调整**：根据系统负载自动调整

---

## 9. 安全要求

### 9.1 认证授权

- 所有请求必须提供有效的Token和API Key
- 验证用户权限（文件访问权限、批量转换权限）
- 验证文件所有权（只能转换自己的文件）

### 9.2 资源限制

- **批次大小限制**：≤100个文件/批次
- **并发批次限制**：每个用户最多3个并发批次
- **频率限制**：每小时最多10个批次

### 9.3 数据保护

- 传输使用HTTPS
- 敏感信息不在日志中记录
- 任务完成后自动清理临时文件

---

## 10. 测试用例

### 10.1 功能测试

| 测试用例 | 输入 | 预期结果 |
| ---- | ---- | ---- |
| TC001 | 10个文件批量转换 | 全部转换成功 |
| TC002 | 100个文件批量转换 | 全部转换成功 |
| TC003 | 包含不支持格式的文件 | 该文件失败，其他继续 |
| TC004 | 启用文件合并 | 生成合并文件 |
| TC005 | 自定义命名规则 | 文件名符合规则 |
| TC006 | 任务暂停/恢复 | 任务正确暂停和恢复 |
| TC007 | 任务取消 | 任务正确取消 |
| TC008 | 重试失败任务 | 失败任务重新处理 |

### 10.2 性能测试

| 测试用例 | 文件数量 | 预期处理时间 |
| ---- | ---- | ---- |
| PT001 | 10个文件（每个1MB） | ≤5分钟 |
| PT002 | 50个文件（每个1MB） | ≤20分钟 |
| PT003 | 100个文件（每个1MB） | ≤40分钟 |

### 10.3 安全测试

| 测试用例 | 输入 | 预期结果 |
| ---- | ---- | ---- |
| ST001 | 无效Token | 返回401错误 |
| ST002 | 无权限文件 | 返回403错误 |
| ST003 | 超过批次限制 | 返回400错误 |
| ST004 | 超过并发限制 | 返回429错误 |

---

## 11. 代码示例

### 11.1 JavaScript/TypeScript

```typescript
// 创建批量转换任务
async function createBatchConvert(files: string[], targetFormat: string) {
  const response = await fetch('https://api.example.com/api/v1/batch/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({
      files: files.map(fileId => ({ fileId })),
      targetFormat,
      batchOptions: {
        concurrency: 5,
      },
    }),
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('批量任务创建成功:', result.data.batchId);
    return result.data;
  } else {
    console.error('批量任务创建失败:', result.error);
    throw new Error(result.error.message);
  }
}

// 查询任务进度
async function getBatchProgress(batchId: string) {
  const response = await fetch(
    `https://api.example.com/api/v1/batch/${batchId}/progress`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': apiKey,
      },
    }
  );
  
  return await response.json();
}

// 查询任务结果
async function getBatchResult(batchId: string) {
  const response = await fetch(
    `https://api.example.com/api/v1/batch/${batchId}/result`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': apiKey,
      },
    }
  );
  
  return await response.json();
}
```

### 11.2 Python

```python
import requests
import time

def create_batch_convert(file_ids: list, target_format: str):
    url = 'https://api.example.com/api/v1/batch/convert'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
        'X-API-Key': api_key,
    }
    data = {
        'files': [{'fileId': fid} for fid in file_ids],
        'targetFormat': target_format,
        'batchOptions': {
            'concurrency': 5,
        },
    }
    
    response = requests.post(url, json=data, headers=headers)
    result = response.json()
    
    if result['success']:
        print('批量任务创建成功:', result['data']['batchId'])
        return result['data']
    else:
        print('批量任务创建失败:', result['error'])
        raise Exception(result['error']['message'])

def wait_for_batch_complete(batch_id: str, poll_interval: int = 5):
    """等待批量任务完成"""
    while True:
        progress = get_batch_progress(batch_id)
        status = progress['data']['status']
        
        if status in ['completed', 'failed', 'cancelled']:
            return get_batch_result(batch_id)
        
        print(f'进度: {progress["data"]["progress"]["percentage"]}%')
        time.sleep(poll_interval)
```

### 11.3 cURL

```bash
# 创建批量转换任务
curl -X POST https://api.example.com/api/v1/batch/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -H "X-API-Key: {api_key}" \
  -d '{
    "files": [
      {"fileId": "file_001"},
      {"fileId": "file_002"},
      {"fileId": "file_003"}
    ],
    "targetFormat": "pdf",
    "batchOptions": {
      "concurrency": 5
    }
  }'

# 查询任务进度
curl -X GET https://api.example.com/api/v1/batch/{batch_id}/progress \
  -H "Authorization: Bearer {token}" \
  -H "X-API-Key: {api_key}"

# 查询任务结果
curl -X GET https://api.example.com/api/v1/batch/{batch_id}/result \
  -H "Authorization: Bearer {token}" \
  -H "X-API-Key: {api_key}"
```

---

## 12. 附录

### 12.1 术语表

- **批量任务**：包含多个文件转换任务的集合
- **并发数**：同时执行的任务数量
- **文件合并**：将多个转换后的文件合并为单一文件
- **命名规则**：定义输出文件名的规则模板

### 12.2 参考资源

- 《RESTful API规范设计文档》
- 《批量处理模块详细设计文档（DDD）》
- 《单文件转换接口详细设计文档》

---

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |
