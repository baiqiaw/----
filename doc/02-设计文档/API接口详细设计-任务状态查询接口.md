# API接口详细设计 - 任务状态查询接口

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |

## 1. 文档说明

### 1.1 文档目的

本文档详细设计任务状态查询接口（`GET /api/v1/tasks/{task_id}`），包括接口规范、请求参数、响应格式、任务类型、错误处理、使用示例等，为接口开发和集成提供详细指导。

### 1.2 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《RESTful API规范设计文档》
- 《单文件转换接口详细设计文档》
- 《批量转换接口详细设计文档》
- 《批量处理模块详细设计文档（DDD）》
- 《错误处理机制详细设计文档（DDD）》

---

## 2. 接口概述

### 2.1 接口信息

| 项目 | 内容 |
| ---- | ---- |
| 接口路径 | `/api/v1/tasks/{task_id}` |
| HTTP方法 | `GET` |
| 接口版本 | `v1` |
| 接口描述 | 查询转换任务的状态、进度、结果等信息 |
| 认证要求 | Bearer Token + API Key |

### 2.2 功能特性

- **统一查询**：支持查询单文件转换任务和批量转换任务
- **实时状态**：实时返回任务当前状态和进度
- **详细信息**：提供任务详细信息，包括文件信息、转换参数、结果等
- **错误信息**：提供详细的错误信息和处理建议
- **性能优化**：支持轻量级查询（仅状态）和完整查询（包含详细信息）

### 2.3 支持的任务类型

- **单文件转换任务**：单个文件的格式转换任务
- **批量转换任务**：多个文件的批量格式转换任务

---

## 3. 请求规范

### 3.1 请求URL

```text
GET https://api.example.com/api/v1/tasks/{task_id}
```

### 3.2 路径参数

| 参数 | 类型 | 必需 | 说明 | 示例 |
| ---- | ---- | ---- | ---- | ---- |
| task_id | string | 是 | 任务ID | `task_1234567890` |

### 3.3 查询参数

| 参数 | 类型 | 必需 | 说明 | 示例 |
| ---- | ---- | ---- | ---- | ---- |
| fields | string | 否 | 返回字段（逗号分隔），默认返回所有字段 | `status,progress` |
| include | string | 否 | 包含的关联数据（逗号分隔） | `files,results,errors` |
| format | string | 否 | 响应格式，默认`full` | `full`（完整）或`summary`（摘要） |

**字段说明**：

- **fields**：控制返回的字段，可选值：`status`, `progress`, `files`, `results`, `errors`, `metadata`, `timestamps`
- **include**：包含的关联数据，可选值：`files`（文件信息）, `results`（结果信息）, `errors`（错误信息）, `metadata`（元数据）
- **format**：
  - `full`：返回完整信息（默认）
  - `summary`：返回摘要信息（仅状态和进度）

### 3.4 请求头

| 请求头 | 类型 | 必需 | 说明 | 示例 |
| ---- | ---- | ---- | ---- | ---- |
| Authorization | string | 是 | Bearer Token | `Bearer {token}` |
| X-API-Key | string | 是 | API密钥 | `{api_key}` |
| Accept | string | 否 | 接受的响应类型 | `application/json` |
| X-Request-ID | string | 否 | 请求ID（用于追踪） | `uuid` |

### 3.5 请求示例

#### 3.5.1 基础查询

```bash
GET /api/v1/tasks/task_1234567890
```

#### 3.5.2 轻量级查询（仅状态和进度）

```bash
GET /api/v1/tasks/task_1234567890?format=summary
```

#### 3.5.3 指定字段查询

```bash
GET /api/v1/tasks/task_1234567890?fields=status,progress,results
```

#### 3.5.4 包含关联数据查询

```bash
GET /api/v1/tasks/task_1234567890?include=files,results,errors
```

---

## 4. 响应规范

### 4.1 单文件转换任务响应

#### 4.1.1 完整响应（format=full）

```typescript
interface SingleTaskResponse {
  success: true;
  data: {
    taskId: string;             // 任务ID
    taskType: 'single';         // 任务类型
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    progress: number;            // 进度（0-100）
    
    // 文件信息
    file: {
      fileId: string;           // 文件ID
      fileName: string;          // 文件名
      fileSize: number;          // 文件大小（字节）
      sourceFormat: string;      // 源格式
      targetFormat: string;      // 目标格式
    };
    
    // 转换配置
    options?: {
      quality?: string;
      ocrEnabled?: boolean;
      // ... 其他选项
    };
    
    // 结果信息（完成时）
    result?: {
      resultFileId: string;      // 结果文件ID
      resultFileName: string;   // 结果文件名
      resultFileSize: number;    // 结果文件大小
      resultFileUrl: string;     // 结果文件下载URL
      conversionTime: number;     // 转换耗时（毫秒）
      quality?: {
        fidelity: number;        // 格式保真度（0-100）
        accuracy: number;       // 内容准确度（0-100）
      };
      metadata?: {
        pageCount?: number;
        wordCount?: number;
        imageCount?: number;
      };
    };
    
    // 错误信息（失败时）
    error?: {
      code: string;              // 错误码
      message: string;           // 错误消息
      details?: any;             // 错误详情
      suggestion?: string;      // 处理建议
    };
    
    // 时间信息
    timestamps: {
      createdAt: string;         // 创建时间
      startedAt?: string;       // 开始时间
      completedAt?: string;      // 完成时间
      updatedAt: string;         // 更新时间
    };
    
    // 预估信息
    estimatedTime?: number;      // 预计剩余时间（秒）
    estimatedCompletion?: string; // 预计完成时间
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
    "taskId": "task_1234567890",
    "taskType": "single",
    "status": "completed",
    "progress": 100,
    "file": {
      "fileId": "file_1234567890",
      "fileName": "document.docx",
      "fileSize": 1024000,
      "sourceFormat": "docx",
      "targetFormat": "pdf"
    },
    "options": {
      "quality": "high",
      "ocrEnabled": false
    },
    "result": {
      "resultFileId": "file_9876543210",
      "resultFileName": "document.pdf",
      "resultFileSize": 2048000,
      "resultFileUrl": "https://api.example.com/api/v1/files/file_9876543210/download",
      "conversionTime": 15000,
      "quality": {
        "fidelity": 98,
        "accuracy": 99
      },
      "metadata": {
        "pageCount": 10,
        "wordCount": 5000,
        "imageCount": 5
      }
    },
    "timestamps": {
      "createdAt": "2025-11-15T10:30:00Z",
      "startedAt": "2025-11-15T10:30:01Z",
      "completedAt": "2025-11-15T10:30:16Z",
      "updatedAt": "2025-11-15T10:30:16Z"
    }
  },
  "timestamp": "2025-11-15T10:35:00Z",
  "requestId": "req_abc123"
}
```

#### 4.1.2 摘要响应（format=summary）

```typescript
interface SingleTaskSummaryResponse {
  success: true;
  data: {
    taskId: string;
    taskType: 'single';
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    estimatedTime?: number;
    resultFileUrl?: string;
    error?: {
      code: string;
      message: string;
    };
  };
  timestamp: string;
}
```

**示例**：

```json
{
  "success": true,
  "data": {
    "taskId": "task_1234567890",
    "taskType": "single",
    "status": "completed",
    "progress": 100,
    "resultFileUrl": "https://api.example.com/api/v1/files/file_9876543210/download"
  },
  "timestamp": "2025-11-15T10:35:00Z"
}
```

### 4.2 批量转换任务响应

#### 4.2.1 完整响应（format=full）

```typescript
interface BatchTaskResponse {
  success: true;
  data: {
    taskId: string;             // 批量任务ID（batchId）
    taskType: 'batch';           // 任务类型
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'paused' | 'partial';
    progress: {
      total: number;             // 总任务数
      completed: number;         // 已完成数
      failed: number;            // 失败数
      processing: number;        // 处理中数
      pending: number;           // 等待数
      percentage: number;        // 完成百分比（0-100）
    };
    
    // 批量任务配置
    batchConfig: {
      targetFormat: string;      // 目标格式
      concurrency: number;       // 并发数
      mergeEnabled: boolean;     // 是否合并
      namingRule?: string;       // 命名规则
    };
    
    // 文件列表
    files: Array<{
      fileId: string;
      fileName: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;          // 单个文件进度（0-100）
      resultFileId?: string;      // 结果文件ID
      resultFileName?: string;   // 结果文件名
      resultFileUrl?: string;    // 结果文件下载URL
      error?: {
        code: string;
        message: string;
      };
      conversionTime?: number;   // 转换耗时（毫秒）
    }>;
    
    // 汇总结果
    summary?: {
      total: number;
      success: number;
      failed: number;
      successRate: number;       // 成功率（0-100）
    };
    
    // 合并文件（如果启用合并）
    mergedFile?: {
      fileId: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
    };
    
    // 批量下载URL
    downloadUrl?: string;        // 批量下载URL（ZIP包）
    
    // 错误信息（失败时）
    error?: {
      code: string;
      message: string;
      details?: any;
    };
    
    // 时间信息
    timestamps: {
      createdAt: string;
      startedAt?: string;
      completedAt?: string;
      updatedAt: string;
    };
    
    // 预估信息
    estimatedTimeRemaining?: number;  // 预计剩余时间（秒）
    estimatedCompletion?: string;      // 预计完成时间
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
    "taskId": "batch_1234567890",
    "taskType": "batch",
    "status": "processing",
    "progress": {
      "total": 10,
      "completed": 5,
      "failed": 1,
      "processing": 2,
      "pending": 2,
      "percentage": 50
    },
    "batchConfig": {
      "targetFormat": "pdf",
      "concurrency": 5,
      "mergeEnabled": false,
      "namingRule": "{originalName}_{date}"
    },
    "files": [
      {
        "fileId": "file_001",
        "fileName": "document1.docx",
        "status": "completed",
        "progress": 100,
        "resultFileId": "file_result_001",
        "resultFileName": "document1_2025-11-15.pdf",
        "resultFileUrl": "https://api.example.com/api/v1/files/file_result_001/download",
        "conversionTime": 15000
      },
      {
        "fileId": "file_002",
        "fileName": "document2.docx",
        "status": "processing",
        "progress": 60
      },
      {
        "fileId": "file_003",
        "fileName": "document3.docx",
        "status": "failed",
        "progress": 0,
        "error": {
          "code": "E01002",
          "message": "文件损坏"
        }
      }
    ],
    "summary": {
      "total": 10,
      "success": 5,
      "failed": 1,
      "successRate": 50
    },
    "timestamps": {
      "createdAt": "2025-11-15T10:30:00Z",
      "startedAt": "2025-11-15T10:30:01Z",
      "updatedAt": "2025-11-15T10:35:00Z"
    },
    "estimatedTimeRemaining": 120,
    "estimatedCompletion": "2025-11-15T10:37:00Z"
  },
  "timestamp": "2025-11-15T10:35:00Z",
  "requestId": "req_abc123"
}
```

#### 4.2.2 摘要响应（format=summary）

```typescript
interface BatchTaskSummaryResponse {
  success: true;
  data: {
    taskId: string;
    taskType: 'batch';
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'paused' | 'partial';
    progress: {
      total: number;
      completed: number;
      failed: number;
      percentage: number;
    };
    estimatedTimeRemaining?: number;
    downloadUrl?: string;
  };
  timestamp: string;
}
```

**示例**：

```json
{
  "success": true,
  "data": {
    "taskId": "batch_1234567890",
    "taskType": "batch",
    "status": "processing",
    "progress": {
      "total": 10,
      "completed": 5,
      "failed": 1,
      "percentage": 50
    },
    "estimatedTimeRemaining": 120
  },
  "timestamp": "2025-11-15T10:35:00Z"
}
```

### 4.3 错误响应

参考《RESTful API规范设计文档》中的错误响应格式。

**常见错误**：

| HTTP状态码 | 错误码 | 错误消息 | 说明 |
| ---- | ---- | ---- | ---- |
| 400 | E00002 | 参数错误 | 请求参数不合法 |
| 401 | E00003 | 未认证 | Token无效或过期 |
| 403 | E00004 | 权限不足 | 用户无权限访问该任务 |
| 404 | E00005 | 任务不存在 | 指定的任务ID不存在 |
| 500 | E00001 | 系统内部错误 | 服务器内部错误 |

---

## 5. 任务状态说明

### 5.1 单文件任务状态

| 状态 | 说明 | 可执行操作 |
| ---- | ---- | ---- |
| pending | 任务已创建，等待处理 | 取消 |
| processing | 任务正在处理中 | 取消 |
| completed | 任务成功完成 | 下载结果 |
| failed | 任务执行失败 | 重试、查看错误 |
| cancelled | 任务已取消 | - |

### 5.2 批量任务状态

| 状态 | 说明 | 可执行操作 |
| ---- | ---- | ---- |
| pending | 任务已创建，等待处理 | 取消 |
| processing | 任务正在处理中 | 暂停、取消 |
| completed | 所有任务成功完成 | 下载结果、批量下载 |
| failed | 所有任务执行失败 | 重试、查看错误 |
| partial | 部分任务成功，部分失败 | 重试失败任务、下载结果 |
| cancelled | 任务已取消 | - |
| paused | 任务已暂停 | 恢复、取消 |

### 5.3 进度说明

- **单文件任务**：进度为0-100的整数，表示转换完成百分比
- **批量任务**：进度包含总体进度和单个文件进度
  - `percentage`：总体完成百分比
  - 每个文件的`progress`：单个文件完成百分比

---

## 6. 使用场景

### 6.1 场景1：查询单文件转换任务状态

**适用场景**：异步单文件转换后查询任务状态

**请求示例**：

```bash
GET /api/v1/tasks/task_1234567890
```

**响应示例**（处理中）：

```json
{
  "success": true,
  "data": {
    "taskId": "task_1234567890",
    "taskType": "single",
    "status": "processing",
    "progress": 60,
    "estimatedTime": 10
  }
}
```

**响应示例**（已完成）：

```json
{
  "success": true,
  "data": {
    "taskId": "task_1234567890",
    "taskType": "single",
    "status": "completed",
    "progress": 100,
    "result": {
      "resultFileUrl": "https://api.example.com/api/v1/files/file_9876543210/download"
    }
  }
}
```

### 6.2 场景2：查询批量转换任务状态

**适用场景**：批量转换后查询任务进度和结果

**请求示例**：

```bash
GET /api/v1/tasks/batch_1234567890
```

**响应示例**（处理中）：

```json
{
  "success": true,
  "data": {
    "taskId": "batch_1234567890",
    "taskType": "batch",
    "status": "processing",
    "progress": {
      "total": 10,
      "completed": 5,
      "failed": 1,
      "percentage": 50
    },
    "estimatedTimeRemaining": 120
  }
}
```

**响应示例**（已完成）：

```json
{
  "success": true,
  "data": {
    "taskId": "batch_1234567890",
    "taskType": "batch",
    "status": "completed",
    "progress": {
      "total": 10,
      "completed": 10,
      "failed": 0,
      "percentage": 100
    },
    "downloadUrl": "https://api.example.com/api/v1/batch/batch_1234567890/download"
  }
}
```

### 6.3 场景3：轻量级状态查询（轮询）

**适用场景**：频繁轮询任务状态，只需基本状态信息

**请求示例**：

```bash
GET /api/v1/tasks/task_1234567890?format=summary
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "taskId": "task_1234567890",
    "taskType": "single",
    "status": "processing",
    "progress": 60
  }
}
```

### 6.4 场景4：查询失败任务详情

**适用场景**：任务失败后查询详细错误信息

**请求示例**：

```bash
GET /api/v1/tasks/task_1234567890?include=errors
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "taskId": "task_1234567890",
    "status": "failed",
    "error": {
      "code": "E01002",
      "message": "文件损坏",
      "details": {
        "fileId": "file_1234567890",
        "reason": "文件格式不匹配或文件已损坏"
      },
      "suggestion": "请检查文件完整性，重新上传文件"
    }
  }
}
```

---

## 7. 轮询建议

### 7.1 轮询策略

- **初始阶段**：每2-3秒轮询一次
- **处理中**：每5-10秒轮询一次
- **接近完成**：每1-2秒轮询一次
- **完成或失败**：停止轮询

### 7.2 轮询优化

- **使用轻量级查询**：使用`format=summary`减少响应大小
- **指数退避**：失败时使用指数退避策略
- **最大轮询次数**：设置最大轮询次数，避免无限轮询
- **超时处理**：设置轮询超时时间

### 7.3 代码示例

```typescript
async function pollTaskStatus(
  taskId: string,
  onUpdate: (status: TaskStatus) => void,
  options: {
    interval?: number;      // 轮询间隔（毫秒），默认5000
    maxAttempts?: number;   // 最大轮询次数，默认60
    timeout?: number;        // 超时时间（毫秒），默认300000（5分钟）
  } = {}
): Promise<TaskStatus> {
  const {
    interval = 5000,
    maxAttempts = 60,
    timeout = 300000,
  } = options;
  
  const startTime = Date.now();
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    // 检查超时
    if (Date.now() - startTime > timeout) {
      throw new Error('轮询超时');
    }
    
    // 查询状态（使用轻量级查询）
    const response = await fetch(
      `https://api.example.com/api/v1/tasks/${taskId}?format=summary`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': apiKey,
        },
      }
    );
    
    const result = await response.json();
    const status = result.data;
    
    // 通知更新
    onUpdate(status);
    
    // 检查是否完成
    if (['completed', 'failed', 'cancelled'].includes(status.status)) {
      // 获取完整信息
      const fullResponse = await fetch(
        `https://api.example.com/api/v1/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-API-Key': apiKey,
          },
        }
      );
      return (await fullResponse.json()).data;
    }
    
    // 等待后继续
    await sleep(interval);
    attempts++;
  }
  
  throw new Error('达到最大轮询次数');
}
```

---

## 8. 性能要求

### 8.1 响应时间

| 查询类型 | 响应时间要求 |
| ---- | ---- |
| 摘要查询（format=summary） | ≤100ms |
| 完整查询（format=full） | ≤500ms |
| 包含大量文件的任务 | ≤1000ms |

### 8.2 缓存策略

- **状态缓存**：任务状态缓存5秒
- **结果缓存**：已完成任务的结果缓存1小时
- **错误缓存**：失败任务的信息缓存10分钟

### 8.3 并发限制

- **单用户**：每秒最多10次查询
- **单任务**：每秒最多5次查询

---

## 9. 安全要求

### 9.1 认证授权

- 所有请求必须提供有效的Token和API Key
- 验证用户权限（只能查询自己的任务）
- 验证任务所有权

### 9.2 数据保护

- 传输使用HTTPS
- 敏感信息不在日志中记录
- 任务信息有访问有效期限制

---

## 10. 测试用例

### 10.1 功能测试

| 测试用例 | 输入 | 预期结果 |
| ---- | ---- | ---- |
| TC001 | 查询存在的单文件任务 | 返回任务状态 |
| TC002 | 查询存在的批量任务 | 返回任务状态和进度 |
| TC003 | 查询不存在的任务 | 返回404错误 |
| TC004 | 查询其他用户的任务 | 返回403错误 |
| TC005 | 使用format=summary | 返回摘要信息 |
| TC006 | 使用fields参数 | 返回指定字段 |
| TC007 | 查询已完成任务 | 返回完整结果信息 |
| TC008 | 查询失败任务 | 返回错误信息 |

### 10.2 性能测试

| 测试用例 | 输入 | 预期响应时间 |
| ---- | ---- | ---- |
| PT001 | 摘要查询 | ≤100ms |
| PT002 | 完整查询 | ≤500ms |
| PT003 | 包含100个文件的批量任务 | ≤1000ms |

### 10.3 安全测试

| 测试用例 | 输入 | 预期结果 |
| ---- | ---- | ---- |
| ST001 | 无效Token | 返回401错误 |
| ST002 | 无权限任务 | 返回403错误 |
| ST003 | 超过频率限制 | 返回429错误 |

---

## 11. 代码示例

### 11.1 JavaScript/TypeScript

```typescript
// 查询任务状态
async function getTaskStatus(taskId: string, format: 'full' | 'summary' = 'full') {
  const url = `https://api.example.com/api/v1/tasks/${taskId}${format === 'summary' ? '?format=summary' : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-API-Key': apiKey,
    },
  });
  
  const result = await response.json();
  
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error.message);
  }
}

// 轮询任务状态直到完成
async function waitForTaskComplete(taskId: string) {
  while (true) {
    const status = await getTaskStatus(taskId, 'summary');
    
    if (['completed', 'failed', 'cancelled'].includes(status.status)) {
      // 获取完整信息
      return await getTaskStatus(taskId, 'full');
    }
    
    // 等待5秒后继续
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
```

### 11.2 Python

```python
import requests
import time

def get_task_status(task_id: str, format: str = 'full'):
    url = f'https://api.example.com/api/v1/tasks/{task_id}'
    if format == 'summary':
        url += '?format=summary'
    
    headers = {
        'Authorization': f'Bearer {token}',
        'X-API-Key': api_key,
    }
    
    response = requests.get(url, headers=headers)
    result = response.json()
    
    if result['success']:
        return result['data']
    else:
        raise Exception(result['error']['message'])

def wait_for_task_complete(task_id: str):
    """等待任务完成"""
    while True:
        status = get_task_status(task_id, 'summary')
        
        if status['status'] in ['completed', 'failed', 'cancelled']:
            return get_task_status(task_id, 'full')
        
        time.sleep(5)
```

### 11.3 cURL

```bash
# 查询任务状态
curl -X GET https://api.example.com/api/v1/tasks/task_1234567890 \
  -H "Authorization: Bearer {token}" \
  -H "X-API-Key: {api_key}"

# 轻量级查询
curl -X GET "https://api.example.com/api/v1/tasks/task_1234567890?format=summary" \
  -H "Authorization: Bearer {token}" \
  -H "X-API-Key: {api_key}"

# 指定字段查询
curl -X GET "https://api.example.com/api/v1/tasks/task_1234567890?fields=status,progress,result" \
  -H "Authorization: Bearer {token}" \
  -H "X-API-Key: {api_key}"
```

## 12. 附录

### 12.1 术语表

- **任务ID**：任务的唯一标识符
- **任务类型**：任务类型（single或batch）
- **任务状态**：任务的当前状态
- **任务进度**：任务的完成进度（0-100）

### 12.2 参考资源

- 《RESTful API规范设计文档》
- 《单文件转换接口详细设计文档》
- 《批量转换接口详细设计文档》

---

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |
