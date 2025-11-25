# 文件上传模块详细设计文档（DDD）

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |

## 1. 文档说明

### 1.1 文档目的

本文档详细描述文件上传模块的设计，包括文件上传、存储管理、下载、临时文件清理等功能的设计和实现方案。

### 1.2 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《系统概要设计文档（HLD）》
- 《技术选型方案文档》

---

## 2. 模块概述

### 2.1 模块定位

文件上传模块负责处理文件的上传、存储、下载和清理等操作，是文档转换工具的基础模块。

### 2.2 功能职责

- **文件上传**：支持单文件、批量文件、文件夹导入
- **文件存储**：管理文件的存储位置、元数据
- **文件下载**：提供文件下载功能
- **临时文件管理**：自动清理临时文件
- **文件验证**：验证文件格式、大小、完整性

### 2.3 功能需求

#### 2.3.1 上传方式

- **单文件上传**：
  - 拖拽上传
  - 文件选择器上传
- **批量上传**：
  - 多文件同时选择（≤100个/批次）
  - 文件夹导入
- **文件夹监控**（企业版）：
  - 监控指定目录
  - 自动转换新增文件

#### 2.3.2 文件限制

- **文件大小**：单文件≤100MB
- **批量限制**：每批次≤100个文件
- **支持格式**：Word、Excel、PDF、PPT、图片、MD等

---

## 3. 架构设计

### 3.1 模块架构

```text
文件上传模块
  ├── 上传处理器（UploadHandler）
  │   ├── 单文件上传处理器
  │   ├── 批量上传处理器
  │   └── 文件夹导入处理器
  │
  ├── 文件验证器（FileValidator）
  │   ├── 格式验证
  │   ├── 大小验证
  │   ├── 完整性验证
  │   └── 安全性验证
  │
  ├── 存储管理器（StorageManager）
  │   ├── 本地文件存储
  │   ├── 对象存储（企业版）
  │   └── 存储策略
  │
  ├── 元数据管理器（MetadataManager）
  │   ├── 文件元数据存储
  │   ├── 元数据查询
  │   └── 元数据更新
  │
  ├── 下载管理器（DownloadManager）
  │   ├── 文件下载
  │   ├── 批量下载
  │   └── 下载权限控制
  │
  └── 清理管理器（CleanupManager）
      ├── 临时文件清理
      ├── 过期文件清理
      └── 自动清理策略
```

### 3.2 核心组件说明

#### 3.2.1 上传处理器（UploadHandler）

**职责**：处理各种上传方式的文件上传

**处理流程**：

```text
接收上传请求
  ↓
文件验证
  ├── 格式验证
  ├── 大小验证
  └── 安全性检查
  ↓
生成文件ID
  ↓
存储文件
  ├── 选择存储位置
  ├── 保存文件
  └── 生成存储路径
  ↓
保存元数据
  ├── 文件信息
  ├── 用户信息
  └── 时间戳
  ↓
返回上传结果
```

#### 3.2.2 文件验证器（FileValidator）

**职责**：验证上传文件的合法性

**验证内容**：

- **格式验证**：检查文件扩展名和MIME类型
- **大小验证**：检查文件大小是否超限
- **完整性验证**：检查文件是否损坏
- **安全性验证**：检查文件是否包含恶意内容

#### 3.2.3 存储管理器（StorageManager）

**职责**：管理文件的物理存储

**存储策略**：

- **个人版**：本地文件系统
- **企业版**：本地文件系统或对象存储（OSS/S3）

**存储结构**：

```text
storage/
  ├── uploads/          # 上传文件
  │   ├── {date}/       # 按日期分目录
  │   │   └── {fileId}.{ext}
  │   └── temp/         # 临时文件
  │
  ├── converted/        # 转换结果
  │   ├── {date}/
  │   │   └── {fileId}.{ext}
  │   └── temp/
  │
  └── cache/           # 缓存文件
      └── {fileId}/
```

#### 3.2.4 元数据管理器（MetadataManager）

**职责**：管理文件的元数据信息

**元数据内容**：

- 文件ID、文件名、扩展名
- 文件大小、MIME类型
- 上传时间、用户ID
- 存储路径、访问权限
- 转换状态、关联任务ID

#### 3.2.5 下载管理器（DownloadManager）

**职责**：处理文件下载请求

**下载流程**：

```text
接收下载请求
  ↓
权限验证
  ├── 用户权限检查
  └── 文件访问权限
  ↓
查找文件
  ├── 根据文件ID查找
  └── 验证文件存在
  ↓
生成下载链接/流
  ├── 直接下载
  └── 临时下载链接
  ↓
返回下载内容
```

#### 3.2.6 清理管理器（CleanupManager）

**职责**：清理临时文件和过期文件

**清理策略**：

- **临时文件**：转换完成后立即清理或延迟清理（1-24小时可配置）
- **过期文件**：定期清理超过保留期的文件
- **缓存文件**：按LRU策略清理缓存

---

## 4. 接口设计

### 4.1 上传接口

#### 4.1.1 单文件上传

```typescript
/**
 * 单文件上传
 * @param file 文件对象
 * @param metadata 文件元数据
 * @returns 上传结果
 */
interface UploadMetadata {
  userId?: string;           // 用户ID（企业版）
  taskId?: string;           // 关联任务ID
  autoDelete?: boolean;      // 是否自动删除
  deleteAfterHours?: number; // 自动删除时间（小时）
  tags?: string[];          // 文件标签
}

interface UploadResult {
  success: boolean;          // 是否成功
  fileId: string;           // 文件ID
  fileName: string;         // 文件名
  fileSize: number;         // 文件大小（字节）
  filePath: string;         // 存储路径
  mimeType: string;         // MIME类型
  uploadTime: Date;         // 上传时间
  downloadUrl?: string;      // 下载链接（企业版）
  errors?: string[];        // 错误信息
}

function uploadFile(
  file: File | Buffer,
  metadata?: UploadMetadata
): Promise<UploadResult>;
```

#### 4.1.2 批量文件上传

```typescript
/**
 * 批量文件上传
 * @param files 文件列表
 * @param metadata 元数据
 * @returns 上传结果列表
 */
interface BatchUploadResult {
  success: boolean;          // 整体是否成功
  total: number;            // 总文件数
  succeeded: number;        // 成功数量
  failed: number;           // 失败数量
  results: UploadResult[];  // 详细结果
  errors?: string[];        // 错误信息
}

function uploadFiles(
  files: (File | Buffer)[],
  metadata?: UploadMetadata
): Promise<BatchUploadResult>;
```

#### 4.1.3 文件夹导入

```typescript
/**
 * 文件夹导入
 * @param folderPath 文件夹路径
 * @param options 导入选项
 * @returns 导入结果
 */
interface FolderImportOptions {
  recursive?: boolean;       // 是否递归导入子文件夹
  filterExtensions?: string[]; // 文件扩展名过滤
  maxFiles?: number;        // 最大文件数（默认100）
  metadata?: UploadMetadata;
}

interface FolderImportResult {
  success: boolean;
  total: number;
  succeeded: number;
  failed: number;
  results: UploadResult[];
  skipped: string[];        // 跳过的文件（格式不支持等）
  errors?: string[];
}

function importFolder(
  folderPath: string,
  options?: FolderImportOptions
): Promise<FolderImportResult>;
```

### 4.2 下载接口

#### 4.2.1 文件下载

```typescript
/**
 * 下载文件
 * @param fileId 文件ID
 * @param options 下载选项
 * @returns 下载流或路径
 */
interface DownloadOptions {
  asAttachment?: boolean;   // 是否作为附件下载
  filename?: string;        // 自定义文件名
  expiresIn?: number;       // 下载链接有效期（秒）
}

interface DownloadResult {
  success: boolean;
  filePath?: string;        // 文件路径（直接访问）
  downloadUrl?: string;     // 下载链接（临时）
  stream?: ReadableStream;  // 文件流
  fileSize: number;
  mimeType: string;
  error?: string;
}

function downloadFile(
  fileId: string,
  options?: DownloadOptions
): Promise<DownloadResult>;
```

#### 4.2.2 批量下载

```typescript
/**
 * 批量下载（打包为ZIP）
 * @param fileIds 文件ID列表
 * @param options 下载选项
 * @returns ZIP文件下载
 */
interface BatchDownloadOptions {
  zipFileName?: string;     // ZIP文件名
  expiresIn?: number;       // 下载链接有效期
}

interface BatchDownloadResult {
  success: boolean;
  zipFileId: string;        // ZIP文件ID
  downloadUrl?: string;     // 下载链接
  fileCount: number;       // 包含的文件数
  totalSize: number;       // 总大小
  error?: string;
}

function downloadFiles(
  fileIds: string[],
  options?: BatchDownloadOptions
): Promise<BatchDownloadResult>;
```

### 4.3 文件管理接口

#### 4.3.1 文件查询

```typescript
/**
 * 查询文件信息
 * @param fileId 文件ID
 * @returns 文件信息
 */
interface FileInfo {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  extension: string;
  filePath: string;
  uploadTime: Date;
  userId?: string;
  taskId?: string;
  status: 'uploaded' | 'converting' | 'converted' | 'failed' | 'deleted';
  metadata?: Record<string, any>;
}

function getFileInfo(fileId: string): Promise<FileInfo>;
```

#### 4.3.2 文件列表查询

```typescript
/**
 * 查询文件列表
 * @param query 查询条件
 * @returns 文件列表
 */
interface FileQuery {
  userId?: string;          // 用户ID
  taskId?: string;          // 任务ID
  status?: string;          // 状态
  extension?: string;      // 扩展名
  startTime?: Date;        // 开始时间
  endTime?: Date;          // 结束时间
  page?: number;           // 页码
  pageSize?: number;       // 每页数量
}

interface FileListResult {
  files: FileInfo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function listFiles(query: FileQuery): Promise<FileListResult>;
```

#### 4.3.3 文件删除

```typescript
/**
 * 删除文件
 * @param fileId 文件ID
 * @param force 是否强制删除（忽略关联检查）
 * @returns 删除结果
 */
interface DeleteResult {
  success: boolean;
  fileId: string;
  deleted: boolean;         // 是否实际删除
  reason?: string;          // 删除原因或失败原因
}

function deleteFile(
  fileId: string,
  force?: boolean
): Promise<DeleteResult>;
```

### 4.4 清理接口

#### 4.4.1 临时文件清理

```typescript
/**
 * 清理临时文件
 * @param options 清理选项
 * @returns 清理结果
 */
interface CleanupOptions {
  olderThanHours?: number;  // 清理N小时前的文件
  fileIds?: string[];       // 指定文件ID列表
  taskId?: string;         // 关联任务ID
  dryRun?: boolean;         // 仅检查，不实际删除
}

interface CleanupResult {
  success: boolean;
  totalFiles: number;      // 总文件数
  deletedFiles: number;    // 已删除文件数
  freedSpace: number;      // 释放空间（字节）
  errors?: string[];       // 错误信息
}

function cleanTempFiles(
  options?: CleanupOptions
): Promise<CleanupResult>;
```

---

## 5. 文件存储设计

### 5.1 存储结构

#### 5.1.1 目录结构

```text
storage/
  ├── uploads/                    # 上传文件目录
  │   ├── {YYYY-MM-DD}/          # 按日期分目录
  │   │   ├── {fileId}.{ext}     # 原始文件
  │   │   └── {fileId}.meta.json # 元数据文件
  │   └── temp/                   # 临时上传文件
  │       └── {tempId}.{ext}
  │
  ├── converted/                  # 转换结果目录
  │   ├── {YYYY-MM-DD}/
  │   │   ├── {fileId}_{format}.{ext}
  │   │   └── {fileId}_{format}.meta.json
  │   └── temp/
  │
  └── cache/                      # 缓存目录
      └── {fileId}/
          ├── thumbnail.{ext}     # 缩略图
          └── preview.{ext}       # 预览图
```

#### 5.1.2 文件命名规则

- **文件ID生成**：UUID v4 或 雪花算法ID
- **文件名格式**：`{fileId}.{extension}`
- **元数据文件**：`{fileId}.meta.json`

### 5.2 存储策略

#### 5.2.1 个人版存储

- **存储位置**：本地文件系统
- **存储路径**：用户数据目录下的 `storage` 文件夹
- **权限控制**：仅当前用户可访问

#### 5.2.2 企业版存储

**私有部署**：

- **存储位置**：本地文件系统或NFS
- **存储路径**：服务器指定目录
- **权限控制**：基于用户角色的访问控制

**SaaS部署**：

- **存储位置**：对象存储（OSS/S3）
- **存储路径**：对象存储的Bucket
- **访问控制**：通过预签名URL控制访问

### 5.3 元数据存储

#### 5.3.1 元数据格式

```json
{
  "fileId": "550e8400-e29b-41d4-a716-446655440000",
  "fileName": "document.docx",
  "originalName": "我的文档.docx",
  "fileSize": 1048576,
  "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "extension": "docx",
  "filePath": "uploads/2025-11-25/550e8400-e29b-41d4-a716-446655440000.docx",
  "uploadTime": "2025-11-25T10:30:00Z",
  "userId": "user123",
  "taskId": "task456",
  "status": "uploaded",
  "autoDelete": true,
  "deleteAfterHours": 24,
  "tags": ["重要", "合同"],
  "checksum": "sha256:abc123...",
  "metadata": {
    "author": "张三",
    "created": "2025-11-20T08:00:00Z"
  }
}
```

#### 5.3.2 元数据存储方式

- **个人版**：JSON文件存储在文件同目录
- **企业版**：存储在数据库（PostgreSQL）中

---

## 6. 文件验证设计

### 6.1 验证规则

#### 6.1.1 格式验证

```typescript
const SUPPORTED_FORMATS = {
  word: ['.doc', '.docx'],
  excel: ['.xls', '.xlsx'],
  pdf: ['.pdf'],
  ppt: ['.ppt', '.pptx'],
  image: ['.jpg', '.jpeg', '.png', '.tiff', '.bmp'],
  markdown: ['.md'],
};

const SUPPORTED_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'text/markdown',
];

function validateFormat(file: File): ValidationResult {
  // 1. 检查扩展名
  const ext = getExtension(file.name);
  if (!isSupportedExtension(ext)) {
    return { valid: false, error: '不支持的文件格式' };
  }
  
  // 2. 检查MIME类型
  if (!isSupportedMimeType(file.type)) {
    return { valid: false, error: '不支持的MIME类型' };
  }
  
  return { valid: true };
}
```

#### 6.1.2 大小验证

```typescript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_BATCH_SIZE = 100; // 100个文件

function validateSize(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `文件大小超过限制（${MAX_FILE_SIZE / 1024 / 1024}MB）`,
    };
  }
  
  return { valid: true };
}
```

#### 6.1.3 完整性验证

```typescript
async function validateIntegrity(
  file: File | Buffer
): Promise<ValidationResult> {
  try {
    // 1. 读取文件头（Magic Number）
    const header = await readFileHeader(file);
    
    // 2. 验证文件头是否匹配扩展名
    const isValid = validateFileHeader(header, file.name);
    
    if (!isValid) {
      return { valid: false, error: '文件可能已损坏或格式不匹配' };
    }
    
    // 3. 计算文件校验和
    const checksum = await calculateChecksum(file);
    
    return {
      valid: true,
      checksum,
    };
  } catch (error) {
    return { valid: false, error: '文件读取失败' };
  }
}
```

#### 6.1.4 安全性验证

```typescript
async function validateSecurity(
  file: File | Buffer
): Promise<ValidationResult> {
  // 1. 检查文件是否包含恶意内容
  const isMalicious = await scanForMalware(file);
  if (isMalicious) {
    return { valid: false, error: '文件包含恶意内容' };
  }
  
  // 2. 检查文件名是否包含危险字符
  if (containsDangerousChars(file.name)) {
    return { valid: false, error: '文件名包含非法字符' };
  }
  
  return { valid: true };
}
```

### 6.2 验证流程

```text
文件上传
  ↓
格式验证
  ├── 扩展名检查
  └── MIME类型检查
  ↓
大小验证
  ├── 单文件大小检查
  └── 批量总大小检查
  ↓
完整性验证
  ├── 文件头验证
  └── 校验和计算
  ↓
安全性验证
  ├── 恶意内容扫描
  └── 文件名安全检查
  ↓
验证通过
```

---

## 7. 上传流程设计

### 7.1 单文件上传流程

```text
用户选择/拖拽文件
  ↓
前端验证（可选）
  ├── 格式检查
  └── 大小检查
  ↓
文件分块（大文件）
  ├── 计算分块数量
  └── 生成上传任务
  ↓
上传到服务器
  ├── 单次上传（小文件）
  └── 分块上传（大文件）
  ↓
服务器接收
  ├── 合并分块（如需要）
  └── 保存临时文件
  ↓
文件验证
  ├── 格式验证
  ├── 大小验证
  ├── 完整性验证
  └── 安全性验证
  ↓
生成文件ID
  ↓
保存文件
  ├── 选择存储位置
  ├── 保存文件
  └── 生成存储路径
  ↓
保存元数据
  ↓
清理临时文件
  ↓
返回上传结果
```

### 7.2 批量上传流程

```text
用户选择多个文件
  ↓
前端验证
  ├── 文件数量检查（≤100）
  ├── 总大小检查
  └── 格式检查
  ↓
创建批量上传任务
  ↓
并行上传（限制并发数）
  ├── 文件1上传
  ├── 文件2上传
  └── ...
  ↓
收集上传结果
  ├── 成功列表
  └── 失败列表
  ↓
生成批量上传结果
  ↓
返回结果
```

### 7.3 文件夹导入流程

```text
用户选择文件夹
  ↓
扫描文件夹
  ├── 递归扫描（如启用）
  ├── 过滤文件（按扩展名）
  └── 限制文件数（≤100）
  ↓
文件列表验证
  ├── 格式验证
  └── 大小验证
  ↓
创建导入任务
  ↓
批量上传文件
  ├── 保持目录结构（可选）
  └── 并行上传
  ↓
生成导入结果
  ↓
返回结果
```

---

## 8. 下载流程设计

### 8.1 单文件下载流程

```text
用户请求下载
  ↓
权限验证
  ├── 用户身份验证
  ├── 文件访问权限
  └── 下载权限检查
  ↓
查找文件
  ├── 根据文件ID查找
  └── 验证文件存在
  ↓
生成下载方式
  ├── 直接下载（个人版）
  └── 生成下载链接（企业版）
  ↓
返回下载内容
  ├── 文件流
  └── 下载链接
```

### 8.2 批量下载流程

```text
用户选择多个文件
  ↓
权限验证
  ├── 验证所有文件权限
  └── 过滤无权限文件
  ↓
创建ZIP打包任务
  ↓
打包文件
  ├── 读取所有文件
  ├── 创建ZIP文件
  └── 压缩文件
  ↓
保存ZIP文件
  ↓
生成下载链接
  ↓
返回下载链接
```

---

## 9. 清理机制设计

### 9.1 清理策略

#### 9.1.1 临时文件清理

**清理时机**：

- 转换完成后立即清理
- 延迟清理（1-24小时可配置）
- 定期清理（定时任务）

**清理规则**：

```typescript
interface CleanupRule {
  type: 'temp' | 'converted' | 'cache';
  condition: 'after_conversion' | 'after_hours' | 'after_days';
  value: number; // 小时数或天数
  enabled: boolean;
}
```

#### 9.1.2 过期文件清理

**清理规则**：

- 超过保留期的文件自动清理
- 用户手动删除的文件立即清理
- 关联任务删除时清理相关文件

### 9.2 清理流程

```text
清理任务触发
  ├── 定时任务（每小时）
  ├── 转换完成事件
  └── 手动触发
  ↓
查找待清理文件
  ├── 临时文件（超过保留期）
  ├── 过期文件（超过保留期）
  └── 已删除标记的文件
  ↓
验证文件可删除
  ├── 检查文件关联
  └── 检查下载状态
  ↓
删除文件
  ├── 删除物理文件
  ├── 删除元数据
  └── 更新数据库
  ↓
记录清理日志
  ↓
返回清理结果
```

---

## 10. 错误处理

### 10.1 错误类型

| 错误类型 | 错误码 | 说明 | 处理方式 |
| ---- | ---- | ---- | ---- |
| 文件格式不支持 | E101 | 文件格式不在支持列表中 | 返回错误，提示支持的格式 |
| 文件过大 | E102 | 文件大小超过限制 | 返回错误，提示最大文件大小 |
| 批量文件过多 | E103 | 批量上传文件数超过限制 | 返回错误，提示最大文件数 |
| 存储空间不足 | E104 | 存储空间不足 | 返回错误，提示清理空间 |
| 文件损坏 | E105 | 文件无法读取或损坏 | 返回错误，提示检查文件 |
| 权限不足 | E106 | 用户无权限访问文件 | 返回错误，提示权限不足 |
| 文件不存在 | E107 | 文件ID对应的文件不存在 | 返回错误，提示文件不存在 |

### 10.2 错误处理流程

```text
操作执行
  ↓
发生错误
  ↓
捕获异常
  ↓
错误分类
  ├── 可恢复错误 → 重试
  ├── 用户错误 → 返回错误信息
  └── 系统错误 → 记录日志，返回通用错误
  ↓
错误记录
  ├── 记录错误日志
  └── 错误统计
  ↓
返回错误信息
```

---

## 11. 性能优化

### 11.1 上传优化

#### 11.1.1 分块上传

- **大文件分块**：文件>10MB时自动分块上传
- **并发上传**：多个分块并行上传
- **断点续传**：支持上传中断后继续上传

#### 11.1.2 压缩上传

- **客户端压缩**：图片等可压缩文件在上传前压缩
- **服务端解压**：服务端自动解压

### 11.2 存储优化

#### 11.2.1 存储分片

- **按日期分目录**：避免单目录文件过多
- **按用户分目录**：企业版按用户分目录存储

#### 11.2.2 存储压缩

- **文件压缩**：对可压缩文件进行压缩存储
- **元数据压缩**：JSON元数据文件压缩存储

### 11.3 下载优化

#### 11.3.1 缓存机制

- **CDN缓存**：企业版使用CDN加速下载
- **本地缓存**：个人版本地缓存下载文件

#### 11.3.2 流式下载

- **流式传输**：大文件使用流式传输，不占用大量内存
- **范围请求**：支持HTTP Range请求，支持断点续传

---

## 12. 安全设计

### 12.1 文件安全

#### 12.1.1 文件隔离

- **目录隔离**：不同用户的文件存储在不同目录
- **权限隔离**：文件访问权限严格控制

#### 12.1.2 文件加密

- **传输加密**：HTTPS传输
- **存储加密**：敏感文件加密存储（可选）

### 12.2 访问控制

#### 12.2.1 权限验证

- **身份验证**：验证用户身份
- **权限检查**：检查文件访问权限
- **操作审计**：记录文件访问日志

#### 12.2.2 下载链接

- **临时链接**：下载链接有时效性
- **签名验证**：下载链接包含签名，防止篡改

---

## 13. 测试设计

### 13.1 单元测试

- **上传功能测试**：测试各种上传场景
- **下载功能测试**：测试下载功能
- **验证功能测试**：测试文件验证逻辑
- **清理功能测试**：测试文件清理逻辑

### 13.2 集成测试

- **端到端测试**：测试完整的上传下载流程
- **批量操作测试**：测试批量上传下载
- **错误场景测试**：测试各种错误场景

### 13.3 性能测试

- **上传性能测试**：测试大文件上传性能
- **并发测试**：测试并发上传下载
- **存储性能测试**：测试存储读写性能

---

## 14. 部署说明

### 14.1 存储配置

#### 14.1.1 个人版配置

```typescript
const storageConfig = {
  type: 'local',
  basePath: path.join(os.homedir(), '.document-converter', 'storage'),
  maxSize: 10 * 1024 * 1024 * 1024, // 10GB
};
```

#### 14.1.2 企业版配置

```typescript
const storageConfig = {
  type: 'oss', // 'local' | 'oss' | 's3'
  basePath: '/data/storage',
  oss: {
    region: 'oss-cn-beijing',
    bucket: 'doc-converter',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  },
};
```

### 14.2 清理任务配置

```typescript
const cleanupConfig = {
  enabled: true,
  schedule: '0 * * * *', // 每小时执行
  rules: [
    {
      type: 'temp',
      condition: 'after_hours',
      value: 24,
      enabled: true,
    },
    {
      type: 'converted',
      condition: 'after_days',
      value: 7,
      enabled: true,
    },
  ],
};
```

---

## 15. 附录

### 15.1 术语表

- **文件ID**：文件的唯一标识符
- **元数据**：文件的描述信息
- **临时文件**：转换过程中的临时文件
- **存储路径**：文件在存储系统中的路径

### 15.2 参考资源

- [Multer文档](https://github.com/expressjs/multer)（Node.js文件上传中间件）
- [Sharp文档](https://sharp.pixelplumbing.com/)（图片处理）
- [AWS S3文档](https://docs.aws.amazon.com/s3/)（对象存储）

---

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |
