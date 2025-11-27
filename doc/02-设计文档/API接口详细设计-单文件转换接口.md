# API接口详细设计 - 单文件转换接口

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |

## 1. 文档说明

### 1.1 文档目的

本文档详细设计单文件转换接口（`POST /api/v1/convert`），包括接口规范、请求参数、响应格式、错误处理、使用示例等，为接口开发和集成提供详细指导。

### 1.2 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《RESTful API规范设计文档》
- 《格式转换核心引擎详细设计文档（DDD）》
- 《文件上传模块详细设计文档（DDD）》
- 《错误处理机制详细设计文档（DDD）》

---

## 2. 接口概述

### 2.1 接口信息

| 项目 | 内容 |
| ---- | ---- |
| 接口路径 | `/api/v1/convert` |
| HTTP方法 | `POST` |
| 接口版本 | `v1` |
| 接口描述 | 单文件格式转换接口，支持多种文档格式之间的转换 |
| 认证要求 | Bearer Token + API Key |

### 2.2 功能特性

- **多格式支持**：支持Word、Excel、PDF、PPT、图片、MD等多种格式转换
- **同步/异步模式**：支持同步和异步两种转换模式
- **参数配置**：支持转换参数的自定义配置（质量、OCR、页面设置等）
- **格式保真**：保持原文档的格式、样式、布局
- **OCR支持**：支持扫描件PDF和图片的OCR识别
- **进度查询**：异步模式下支持任务进度查询

### 2.3 支持的转换路径

参考《格式转换核心引擎详细设计文档（DDD）》中定义的转换路径矩阵。

---

## 3. 请求规范

### 3.1 请求URL

```text
POST https://api.example.com/api/v1/convert
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
interface ConvertRequest {
  // 文件来源（二选一）
  fileId?: string;          // 已上传文件的ID
  file?: FileUpload;        // 直接上传文件（multipart/form-data）
  
  // 转换配置
  sourceFormat?: string;    // 源格式（可选，自动识别）
  targetFormat: string;     // 目标格式（必需）
  
  // 转换模式
  mode?: 'sync' | 'async';  // 同步/异步模式，默认sync
  
  // 转换选项
  options?: ConvertOptions; // 转换参数配置
  
  // 回调配置（异步模式）
  callback?: CallbackConfig; // 回调URL配置
}
```

#### 3.3.2 文件上传方式

##### 方式1：使用已上传的文件ID

```json
{
  "fileId": "file_1234567890",
  "targetFormat": "pdf",
  "mode": "sync",
  "options": {
    "quality": "high"
  }
}
```

##### 方式2：直接上传文件（multipart/form-data）

```http
POST /api/v1/convert
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="document.docx"
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document

[文件内容]
------WebKitFormBoundary
Content-Disposition: form-data; name="targetFormat"

pdf
------WebKitFormBoundary
Content-Disposition: form-data; name="mode"

sync
------WebKitFormBoundary
Content-Disposition: form-data; name="options"

{"quality":"high"}
------WebKitFormBoundary--
```

#### 3.3.3 转换选项（ConvertOptions）

```typescript
interface ConvertOptions {
  // 质量设置
  quality?: 'low' | 'medium' | 'high' | 'best';  // 转换质量，默认high
  
  // OCR设置
  ocrEnabled?: boolean;        // 是否启用OCR，默认false
  ocrLanguage?: string[];      // OCR语言，默认['zh_CN', 'en']
  
  // 页面设置
  pageSize?: 'A4' | 'A3' | 'B5' | 'Letter' | 'Legal';  // 页面大小
  orientation?: 'portrait' | 'landscape';  // 页面方向
  margins?: {                // 页边距（单位：mm）
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  
  // PDF特定选项
  pdfOptions?: {
    compression?: 'none' | 'low' | 'medium' | 'high';  // 压缩级别
    embedFonts?: boolean;      // 是否嵌入字体
    password?: string;          // PDF密码（加密）
  };
  
  // 图片特定选项
  imageOptions?: {
    format?: 'jpg' | 'png';     // 图片格式
    quality?: number;           // 图片质量（1-100）
    dpi?: number;               // 分辨率（默认300）
  };
  
  // Word特定选项
  wordOptions?: {
    preserveFormatting?: boolean;  // 保留格式
    includeImages?: boolean;       // 包含图片
  };
  
  // Excel特定选项
  excelOptions?: {
    includeFormulas?: boolean;     // 包含公式
    includeCharts?: boolean;       // 包含图表
  };
  
  // 自定义设置
  customSettings?: Record<string, any>;  // 自定义设置
}
```

#### 3.3.4 回调配置（CallbackConfig）

```typescript
interface CallbackConfig {
  url: string;              // 回调URL
  method?: 'POST' | 'PUT';   // 回调方法，默认POST
  headers?: Record<string, string>;  // 回调请求头
  timeout?: number;          // 回调超时时间（秒），默认30
}
```

### 3.4 参数说明

#### 3.4.1 必需参数

| 参数 | 类型 | 说明 | 示例 |
| ---- | ---- | ---- | ---- |
| fileId 或 file | string / File | 文件ID或文件对象（二选一） | `file_123456` |
| targetFormat | string | 目标格式 | `pdf` |

#### 3.4.2 可选参数

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| sourceFormat | string | 自动识别 | 源格式（建议提供，提高识别准确性） |
| mode | string | `sync` | 转换模式：`sync`（同步）或`async`（异步） |
| options | object | `{}` | 转换选项配置 |
| callback | object | - | 回调配置（异步模式必需） |

#### 3.4.3 格式代码

| 格式 | 代码 | 说明 |
| ---- | ---- | ---- |
| Word | `docx`, `doc` | Microsoft Word文档 |
| Excel | `xlsx`, `xls` | Microsoft Excel文档 |
| PDF | `pdf` | PDF文档 |
| PowerPoint | `pptx`, `ppt` | Microsoft PowerPoint文档 |
| Markdown | `md` | Markdown文档 |
| 文本 | `txt` | 纯文本文件 |
| 图片 | `jpg`, `jpeg`, `png`, `tiff` | 图片文件 |
| HTML | `html` | HTML文档 |
| CSV | `csv` | CSV文件 |

---

## 4. 响应规范

### 4.1 同步模式响应

#### 4.1.1 成功响应（200 OK）

```typescript
interface ConvertSyncResponse {
  success: true;
  data: {
    taskId: string;           // 任务ID
    fileId: string;            // 源文件ID
    resultFileId: string;      // 结果文件ID
    resultFileName: string;    // 结果文件名
    resultFileSize: number;    // 结果文件大小（字节）
    resultFileUrl: string;     // 结果文件下载URL
    sourceFormat: string;       // 源格式
    targetFormat: string;       // 目标格式
    conversionTime: number;     // 转换耗时（毫秒）
    quality: {
      fidelity: number;         // 格式保真度（0-100）
      accuracy: number;         // 内容准确度（0-100）
    };
    metadata?: {                // 文件元数据
      pageCount?: number;       // 页数
      wordCount?: number;       // 字数
      imageCount?: number;      // 图片数
    };
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
    "fileId": "file_1234567890",
    "resultFileId": "file_9876543210",
    "resultFileName": "document.pdf",
    "resultFileSize": 2048000,
    "resultFileUrl": "https://api.example.com/api/v1/files/file_9876543210/download",
    "sourceFormat": "docx",
    "targetFormat": "pdf",
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
  "timestamp": "2025-11-15T10:30:00Z",
  "requestId": "req_abc123"
}
```

#### 4.1.2 错误响应

参考《RESTful API规范设计文档》中的错误响应格式。

**常见错误**：

| HTTP状态码 | 错误码 | 错误消息 | 说明 |
| ---- | ---- | ---- | ---- |
| 400 | E00002 | 参数错误 | 请求参数不合法 |
| 400 | E02001 | 文件格式不支持 | 源格式或目标格式不支持 |
| 400 | E02002 | 文件过大 | 文件大小超过限制 |
| 401 | E00003 | 未认证 | Token无效或过期 |
| 403 | E00004 | 权限不足 | 用户无权限执行操作 |
| 404 | E00005 | 文件不存在 | 指定的文件ID不存在 |
| 422 | E01001 | 格式不支持 | 不支持该转换路径 |
| 422 | E01002 | 文件损坏 | 源文件损坏或无法读取 |
| 500 | E01003 | 转换失败 | 转换过程失败 |
| 503 | E01006 | 引擎不可用 | 转换引擎暂时不可用 |

### 4.2 异步模式响应

#### 4.2.1 成功响应（202 Accepted）

```typescript
interface ConvertAsyncResponse {
  success: true;
  data: {
    taskId: string;           // 任务ID
    fileId: string;           // 源文件ID
    status: 'pending' | 'processing';  // 任务状态
    estimatedTime?: number;    // 预计完成时间（秒）
    progressUrl: string;       // 进度查询URL
    resultUrl?: string;         // 结果查询URL（完成后可用）
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
    "fileId": "file_1234567890",
    "status": "pending",
    "estimatedTime": 30,
    "progressUrl": "https://api.example.com/api/v1/tasks/task_1234567890/status",
    "resultUrl": "https://api.example.com/api/v1/tasks/task_1234567890/result"
  },
  "timestamp": "2025-11-15T10:30:00Z",
  "requestId": "req_abc123"
}
```

#### 4.2.2 任务状态查询

**接口**：`GET /api/v1/tasks/{task_id}/status`

**响应**：

```typescript
interface TaskStatusResponse {
  success: true;
  data: {
    taskId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    progress: number;          // 进度（0-100）
    message?: string;           // 状态消息
    resultFileId?: string;     // 结果文件ID（完成时）
    error?: {                   // 错误信息（失败时）
      code: string;
      message: string;
    };
    estimatedTimeRemaining?: number;  // 预计剩余时间（秒）
  };
  timestamp: string;
}
```

#### 4.2.3 任务结果查询

**接口**：`GET /api/v1/tasks/{task_id}/result`

**响应**：

```typescript
interface TaskResultResponse {
  success: true;
  data: {
    taskId: string;
    status: 'completed' | 'failed';
    resultFileId?: string;
    resultFileUrl?: string;
    resultFileName?: string;
    resultFileSize?: number;
    conversionTime?: number;
    quality?: {
      fidelity: number;
      accuracy: number;
    };
    error?: {
      code: string;
      message: string;
    };
  };
  timestamp: string;
}
```

---

## 5. 使用场景

### 5.1 场景1：同步转换（小文件）

**适用场景**：文件较小（≤10MB），转换时间较短（≤30秒）

**请求示例**：

```json
{
  "fileId": "file_1234567890",
  "targetFormat": "pdf",
  "mode": "sync",
  "options": {
    "quality": "high",
    "pdfOptions": {
      "compression": "medium",
      "embedFonts": true
    }
  }
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "taskId": "task_1234567890",
    "resultFileId": "file_9876543210",
    "resultFileUrl": "https://api.example.com/api/v1/files/file_9876543210/download",
    "conversionTime": 15000
  }
}
```

### 5.2 场景2：异步转换（大文件）

**适用场景**：文件较大（>10MB），转换时间较长（>30秒）

**请求示例**：

```json
{
  "fileId": "file_1234567890",
  "targetFormat": "pdf",
  "mode": "async",
  "options": {
    "quality": "best"
  },
  "callback": {
    "url": "https://example.com/webhook/convert",
    "method": "POST"
  }
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "taskId": "task_1234567890",
    "status": "pending",
    "estimatedTime": 60,
    "progressUrl": "https://api.example.com/api/v1/tasks/task_1234567890/status"
  }
}
```

### 5.3 场景3：OCR转换（扫描件PDF）

**适用场景**：扫描件PDF或图片需要OCR识别

**请求示例**：

```json
{
  "fileId": "file_1234567890",
  "targetFormat": "docx",
  "sourceFormat": "pdf",
  "mode": "sync",
  "options": {
    "ocrEnabled": true,
    "ocrLanguage": ["zh_CN", "en"],
    "quality": "high"
  }
}
```

### 5.4 场景4：直接上传文件转换

**适用场景**：文件未预先上传，直接上传并转换

**请求示例**（multipart/form-data）：

```http
POST /api/v1/convert
Content-Type: multipart/form-data

file: [文件内容]
targetFormat: pdf
mode: sync
options: {"quality":"high"}
```

---

## 6. 错误处理

### 6.1 错误码定义

参考《错误处理机制详细设计文档（DDD）》中的错误码体系。

### 6.2 错误处理流程

```text
1. 参数验证
   ├── 验证必需参数
   ├── 验证参数格式
   └── 验证参数值范围

2. 文件验证
   ├── 验证文件存在
   ├── 验证文件格式
   ├── 验证文件大小
   └── 验证文件完整性

3. 转换执行
   ├── 选择转换引擎
   ├── 执行转换
   └── 验证转换结果

4. 错误处理
   ├── 捕获异常
   ├── 记录错误日志
   └── 返回错误响应
```

### 6.3 重试机制

- **自动重试**：对于临时性错误（如网络错误、服务不可用），系统自动重试
- **重试策略**：指数退避，最多重试3次
- **重试间隔**：1秒、2秒、4秒

---

## 7. 性能要求

### 7.1 响应时间

| 文件大小 | 同步模式 | 异步模式 |
| ---- | ---- | ---- |
| ≤1MB | ≤5秒 | ≤1秒（接受响应） |
| ≤10MB | ≤30秒 | ≤1秒（接受响应） |
| >10MB | 建议异步 | ≤1秒（接受响应） |

### 7.2 并发处理

- **同步模式**：单用户最多5个并发请求
- **异步模式**：无限制（通过队列管理）

### 7.3 文件大小限制

| 用户类型 | 文件大小限制 |
| ---- | ---- |
| 免费用户 | 10MB |
| 基础用户 | 50MB |
| 企业用户 | 200MB |
| 企业高级 | 500MB |

---

## 8. 安全要求

### 8.1 认证授权

- 所有请求必须提供有效的Token和API Key
- 验证用户权限（文件访问权限、转换权限）

### 8.2 文件安全

- 文件上传时进行病毒扫描
- 文件转换后自动清理临时文件
- 敏感文件支持加密存储

### 8.3 数据保护

- 传输使用HTTPS
- 敏感信息不在日志中记录
- 文件访问有有效期限制

---

## 9. 测试用例

### 9.1 功能测试

| 测试用例 | 输入 | 预期结果 |
| ---- | ---- | ---- |
| TC001 | 正常Word转PDF | 转换成功，返回结果文件 |
| TC002 | 不支持的格式 | 返回错误E01001 |
| TC003 | 文件不存在 | 返回错误E00005 |
| TC004 | 文件过大 | 返回错误E02002 |
| TC005 | 异步转换 | 返回任务ID，可查询状态 |
| TC006 | OCR转换 | 转换成功，识别文字 |

### 9.2 性能测试

| 测试用例 | 文件大小 | 预期响应时间 |
| ---- | ---- | ---- |
| PT001 | 1MB Word转PDF | ≤5秒 |
| PT002 | 10MB Word转PDF | ≤30秒 |
| PT003 | 50MB PDF转Word | 异步模式 |

### 9.3 安全测试

| 测试用例 | 输入 | 预期结果 |
| ---- | ---- | ---- |
| ST001 | 无效Token | 返回401错误 |
| ST002 | 无权限文件 | 返回403错误 |
| ST003 | 恶意文件 | 拒绝处理 |

---

## 10. 代码示例

### 10.1 JavaScript/TypeScript

```typescript
// 使用fetch API
async function convertFile(fileId: string, targetFormat: string) {
  const response = await fetch('https://api.example.com/api/v1/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({
      fileId,
      targetFormat,
      mode: 'sync',
      options: {
        quality: 'high',
      },
    }),
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('转换成功:', result.data.resultFileUrl);
    return result.data;
  } else {
    console.error('转换失败:', result.error);
    throw new Error(result.error.message);
  }
}
```

### 10.2 Python

```python
import requests

def convert_file(file_id: str, target_format: str):
    url = 'https://api.example.com/api/v1/convert'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
        'X-API-Key': api_key,
    }
    data = {
        'fileId': file_id,
        'targetFormat': target_format,
        'mode': 'sync',
        'options': {
            'quality': 'high',
        },
    }
    
    response = requests.post(url, json=data, headers=headers)
    result = response.json()
    
    if result['success']:
        print('转换成功:', result['data']['resultFileUrl'])
        return result['data']
    else:
        print('转换失败:', result['error'])
        raise Exception(result['error']['message'])
```

### 10.3 cURL

```bash
curl -X POST https://api.example.com/api/v1/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -H "X-API-Key: {api_key}" \
  -d '{
    "fileId": "file_1234567890",
    "targetFormat": "pdf",
    "mode": "sync",
    "options": {
      "quality": "high"
    }
  }'
```

---

## 11. 附录

### 11.1 术语表

- **同步模式**：请求后等待转换完成，直接返回结果
- **异步模式**：请求后立即返回，通过任务ID查询状态和结果
- **格式保真度**：转换后文档与原文档格式的一致性（0-100）
- **OCR**：Optical Character Recognition，光学字符识别

### 11.2 参考资源

- 《RESTful API规范设计文档》
- 《格式转换核心引擎详细设计文档（DDD）》
- 《文件上传模块详细设计文档（DDD）》

---

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |
