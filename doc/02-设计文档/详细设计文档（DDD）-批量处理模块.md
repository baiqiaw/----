# 批量处理模块详细设计文档（DDD）

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |

## 1. 文档说明

### 1.1 文档目的

本文档详细描述批量处理模块的设计，包括任务队列管理、并发控制、进度监控、结果汇总等功能的设计和实现方案。

### 1.2 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《系统概要设计文档（HLD）》
- 《技术选型方案文档》

---

## 2. 模块概述

### 2.1 模块定位

批量处理模块负责管理批量文档转换任务，提供任务队列、并发控制、进度监控等功能，是支持批量转换的核心模块。

### 2.2 功能职责

- **批量任务创建**：创建批量转换任务
- **任务队列管理**：管理任务队列，支持优先级、延迟、重试
- **并发控制**：控制同时执行的任务数量
- **进度监控**：实时监控任务进度和状态
- **结果汇总**：汇总批量转换结果
- **文件合并**：支持多文件合并为单一输出
- **批量命名**：支持自定义输出文件名规则

### 2.3 功能需求

#### 2.3.1 批量转换

- **文件数量**：支持≤100个文件/批次
- **并发处理**：支持多个文件并行转换
- **进度显示**：显示总体进度和单个文件状态

#### 2.3.2 任务状态

- **等待**：任务在队列中等待处理
- **处理中**：任务正在执行
- **完成**：任务成功完成
- **失败**：任务执行失败

#### 2.3.3 增强功能

- **文件合并**：多文件转换后可合并为单一输出文件
- **批量命名**：支持自定义输出文件名规则
- **任务暂停/恢复**：支持任务暂停和恢复

---

## 3. 架构设计

### 3.1 模块架构

```text
批量处理模块
  ├── 任务管理器（TaskManager）
  │   ├── 任务创建
  │   ├── 任务查询
  │   ├── 任务更新
  │   └── 任务删除
  │
  ├── 任务队列（TaskQueue）
  │   ├── BullMQ队列
  │   ├── 优先级队列
  │   ├── 延迟队列
  │   └── 重试队列
  │
  ├── 任务调度器（TaskScheduler）
  │   ├── 任务分发
  │   ├── 并发控制
  │   ├── 资源管理
  │   └── 负载均衡
  │
  ├── 任务执行器（TaskExecutor）
  │   ├── Worker线程池
  │   ├── 任务执行
  │   └── 结果收集
  │
  ├── 进度监控器（ProgressMonitor）
  │   ├── 进度跟踪
  │   ├── 状态更新
  │   └── 事件通知
  │
  ├── 结果汇总器（ResultAggregator）
  │   ├── 结果收集
  │   ├── 文件合并
  │   └── 批量命名
  │
  └── 任务持久化（TaskPersistence）
      ├── 任务存储
      ├── 状态持久化
      └── 历史记录
```

### 3.2 核心组件说明

#### 3.2.1 任务管理器（TaskManager）

**职责**：管理批量任务的生命周期

**功能**：

- 创建批量任务
- 查询任务信息
- 更新任务状态
- 删除任务

#### 3.2.2 任务队列（TaskQueue）

**职责**：管理任务队列，使用BullMQ + Redis

**队列类型**：

- **普通队列**：FIFO队列
- **优先级队列**：按优先级处理
- **延迟队列**：延迟执行的任务
- **重试队列**：失败重试的任务

#### 3.2.3 任务调度器（TaskScheduler）

**职责**：调度任务执行，控制并发

**调度策略**：

- **并发控制**：限制同时执行的任务数
- **优先级调度**：高优先级任务优先执行
- **负载均衡**：均衡分配任务到Worker

#### 3.2.4 任务执行器（TaskExecutor）

**职责**：执行实际的转换任务

**执行方式**：

- **Worker线程池**：使用Worker线程执行任务
- **异步执行**：异步执行，不阻塞主线程
- **结果回调**：执行完成后回调结果

#### 3.2.5 进度监控器（ProgressMonitor）

**职责**：监控任务进度和状态

**监控内容**：

- 总体进度（已完成/总数）
- 单个文件状态
- 执行时间
- 资源使用情况

#### 3.2.6 结果汇总器（ResultAggregator）

**职责**：汇总批量转换结果

**功能**：

- 收集所有转换结果
- 文件合并（如需要）
- 批量命名（如需要）
- 生成结果报告

---

## 4. 接口设计

### 4.1 任务管理接口

#### 4.1.1 创建批量任务

```typescript
/**
 * 创建批量转换任务
 * @param files 文件列表
 * @param options 任务选项
 * @returns 任务信息
 */
interface BatchTaskOptions {
  targetFormat: string;           // 目标格式
  outputPath?: string;            // 输出路径
  mergeOutput?: boolean;          // 是否合并输出
  mergeFormat?: string;           // 合并格式（如PDF）
  namingRule?: string;            // 命名规则（如"{date}-{filename}"）
  priority?: number;              // 优先级（1-10，数字越小优先级越高）
  maxConcurrency?: number;       // 最大并发数（默认5）
  retryOnFailure?: boolean;      // 失败是否重试
  maxRetries?: number;           // 最大重试次数（默认3）
  notifyOnComplete?: boolean;    // 完成时是否通知
  webhookUrl?: string;           // Webhook URL（企业版）
  customOptions?: Record<string, any>; // 自定义选项
}

interface BatchTask {
  taskId: string;                // 任务ID
  userId?: string;                // 用户ID（企业版）
  totalFiles: number;             // 总文件数
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;               // 总数
    completed: number;           // 已完成
    failed: number;              // 失败数
    processing: number;          // 处理中
    pending: number;             // 等待中
    percentage: number;          // 完成百分比
  };
  createdAt: Date;               // 创建时间
  startedAt?: Date;              // 开始时间
  completedAt?: Date;            // 完成时间
  estimatedTime?: number;        // 预估剩余时间（秒）
  results?: FileResult[];         // 结果列表
  errors?: TaskError[];          // 错误列表
}

interface FileResult {
  fileId: string;                // 文件ID
  fileName: string;              // 文件名
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputPath?: string;           // 输出路径
  error?: string;                // 错误信息
  processingTime?: number;       // 处理时间（毫秒）
}

interface TaskError {
  fileId: string;
  fileName: string;
  error: string;
  timestamp: Date;
}

function createBatchTask(
  files: string[] | FileInfo[],
  options: BatchTaskOptions
): Promise<BatchTask>;
```

#### 4.1.2 查询任务状态

```typescript
/**
 * 查询任务状态
 * @param taskId 任务ID
 * @returns 任务状态
 */
interface TaskStatus {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;
    completed: number;
    failed: number;
    processing: number;
    pending: number;
    percentage: number;
  };
  currentFile?: {
    fileId: string;
    fileName: string;
    progress?: number;            // 当前文件进度（0-100）
  };
  startedAt?: Date;
  completedAt?: Date;
  estimatedTime?: number;        // 预估剩余时间（秒）
  fileStatuses: FileResult[];
}

function getTaskStatus(taskId: string): Promise<TaskStatus>;
```

#### 4.1.3 获取任务进度

```typescript
/**
 * 获取任务进度
 * @param taskId 任务ID
 * @returns 进度信息
 */
interface TaskProgress {
  taskId: string;
  progress: {
    total: number;
    completed: number;
    failed: number;
    processing: number;
    pending: number;
    percentage: number;
  };
  currentFile?: {
    fileId: string;
    fileName: string;
    progress: number;
  };
  speed: number;                 // 处理速度（文件/秒）
  estimatedTime: number;         // 预估剩余时间（秒）
  throughput: number;            // 吞吐量（MB/秒）
}

function getTaskProgress(taskId: string): Promise<TaskProgress>;
```

#### 4.1.4 任务控制

```typescript
/**
 * 暂停任务
 */
function pauseTask(taskId: string): Promise<void>;

/**
 * 恢复任务
 */
function resumeTask(taskId: string): Promise<void>;

/**
 * 取消任务
 */
function cancelTask(taskId: string): Promise<void>;

/**
 * 重试失败的任务
 */
function retryFailedFiles(taskId: string, fileIds?: string[]): Promise<void>;
```

### 4.2 结果管理接口

#### 4.2.1 获取任务结果

```typescript
/**
 * 获取任务结果
 * @param taskId 任务ID
 * @param options 查询选项
 * @returns 任务结果
 */
interface TaskResultOptions {
  includeFailed?: boolean;       // 是否包含失败的文件
  page?: number;                 // 页码
  pageSize?: number;             // 每页数量
}

interface TaskResult {
  taskId: string;
  status: string;
  totalFiles: number;
  succeeded: number;
  failed: number;
  results: FileResult[];
  mergedFile?: {
    fileId: string;
    filePath: string;
    fileSize: number;
  };
  summary: {
    totalSize: number;           // 总文件大小
    totalTime: number;           // 总处理时间（毫秒）
    averageTime: number;         // 平均处理时间（毫秒）
    successRate: number;         // 成功率（0-1）
  };
}

function getTaskResult(
  taskId: string,
  options?: TaskResultOptions
): Promise<TaskResult>;
```

#### 4.2.2 文件合并

```typescript
/**
 * 合并文件
 * @param fileIds 文件ID列表
 * @param options 合并选项
 * @returns 合并结果
 */
interface MergeOptions {
  outputFormat: string;          // 输出格式（PDF、Word等）
  outputPath?: string;           // 输出路径
  orderBy?: 'name' | 'time' | 'custom'; // 排序方式
  customOrder?: string[];        // 自定义顺序
  pageBreak?: boolean;           // 是否添加分页符
}

interface MergeResult {
  success: boolean;
  mergedFileId: string;
  mergedFilePath: string;
  fileSize: number;
  pageCount: number;
  error?: string;
}

function mergeFiles(
  fileIds: string[],
  options: MergeOptions
): Promise<MergeResult>;
```

---

## 5. 任务队列设计

### 5.1 BullMQ队列配置

#### 5.1.1 队列初始化

```typescript
import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

// Redis连接
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// 创建队列
const conversionQueue = new Queue('document-conversion', {
  connection,
  defaultJobOptions: {
    attempts: 3,                 // 最大重试次数
    backoff: {
      type: 'exponential',
      delay: 2000,               // 初始延迟2秒
    },
    removeOnComplete: {
      age: 3600,                 // 完成后保留1小时
      count: 1000,               // 最多保留1000个
    },
    removeOnFail: {
      age: 86400,                // 失败后保留24小时
    },
  },
});
```

#### 5.1.2 Worker配置

```typescript
// 创建Worker
const worker = new Worker(
  'document-conversion',
  async (job) => {
    const { fileId, targetFormat, options } = job.data;
    
    // 更新进度
    await job.updateProgress(0);
    
    // 执行转换
    const result = await convertFile(fileId, targetFormat, options);
    
    // 更新进度
    await job.updateProgress(100);
    
    return result;
  },
  {
    connection,
    concurrency: 5,              // 并发数
    limiter: {
      max: 10,                   // 每秒最多10个任务
      duration: 1000,
    },
  }
);
```

### 5.2 任务优先级

#### 5.2.1 优先级队列

```typescript
/**
 * 添加任务到队列（带优先级）
 */
async function addTaskToQueue(
  task: ConversionTask,
  priority: number = 5
): Promise<void> {
  await conversionQueue.add(
    `convert-${task.fileId}`,
    {
      fileId: task.fileId,
      targetFormat: task.targetFormat,
      options: task.options,
    },
    {
      priority,                  // 优先级（1-10，数字越小优先级越高）
      jobId: `job-${task.fileId}`, // 任务ID
    }
  );
}
```

### 5.3 任务重试

#### 5.3.1 重试策略

```typescript
/**
 * 配置重试策略
 */
const retryStrategy = {
  attempts: 3,                  // 最大重试3次
  backoff: {
    type: 'exponential',         // 指数退避
    delay: 2000,                 // 初始延迟2秒
  },
  onFailedAttempt: async (error: Error, job: Job) => {
    // 记录重试日志
    console.log(`Job ${job.id} failed, retrying...`, error);
    
    // 判断是否可重试
    if (!isRetryableError(error)) {
      throw new Error('Non-retryable error');
    }
  },
};
```

---

## 6. 并发控制设计

### 6.1 并发策略

#### 6.1.1 全局并发控制

```typescript
/**
 * 全局并发控制
 */
class ConcurrencyController {
  private maxConcurrency: number;
  private currentConcurrency: number = 0;
  private queue: Array<() => Promise<void>> = [];
  
  constructor(maxConcurrency: number = 5) {
    this.maxConcurrency = maxConcurrency;
  }
  
  async execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        this.currentConcurrency++;
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.currentConcurrency--;
          this.processQueue();
        }
      });
      
      this.processQueue();
    });
  }
  
  private processQueue(): void {
    if (this.currentConcurrency < this.maxConcurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        task();
      }
    }
  }
}
```

#### 6.1.2 资源限制

```typescript
/**
 * 资源限制配置
 */
const resourceLimits = {
  maxConcurrentTasks: 10,        // 最大并发任务数
  maxMemoryPerTask: 1024 * 1024 * 1024, // 每个任务最大内存（1GB）
  maxCpuPerTask: 0.5,           // 每个任务最大CPU（50%）
  maxTotalMemory: 4 * 1024 * 1024 * 1024, // 总内存限制（4GB）
};
```

### 6.2 负载均衡

#### 6.2.1 Worker负载均衡

```typescript
/**
 * Worker负载均衡
 */
class LoadBalancer {
  private workers: Worker[] = [];
  
  /**
   * 选择Worker
   */
  selectWorker(): Worker {
    // 选择负载最低的Worker
    return this.workers.reduce((min, worker) => {
      return worker.load < min.load ? worker : min;
    });
  }
  
  /**
   * 分配任务
   */
  async assignTask(task: ConversionTask): Promise<void> {
    const worker = this.selectWorker();
    await worker.assignTask(task);
  }
}
```

---

## 7. 进度监控设计

### 7.1 进度跟踪

#### 7.1.1 进度更新机制

```typescript
/**
 * 进度更新
 */
class ProgressTracker {
  private progressMap: Map<string, TaskProgress> = new Map();
  
  /**
   * 更新任务进度
   */
  async updateProgress(
    taskId: string,
    fileId: string,
    progress: number
  ): Promise<void> {
    const taskProgress = this.progressMap.get(taskId) || this.createProgress(taskId);
    
    // 更新文件进度
    const fileStatus = taskProgress.fileStatuses.find(f => f.fileId === fileId);
    if (fileStatus) {
      fileStatus.progress = progress;
      fileStatus.status = progress === 100 ? 'completed' : 'processing';
    }
    
    // 更新总体进度
    this.calculateOverallProgress(taskProgress);
    
    // 保存进度
    this.progressMap.set(taskId, taskProgress);
    
    // 发布进度事件
    this.publishProgressEvent(taskId, taskProgress);
  }
  
  /**
   * 计算总体进度
   */
  private calculateOverallProgress(taskProgress: TaskProgress): void {
    const total = taskProgress.progress.total;
    const completed = taskProgress.fileStatuses.filter(
      f => f.status === 'completed'
    ).length;
    
    taskProgress.progress.completed = completed;
    taskProgress.progress.percentage = Math.round((completed / total) * 100);
    
    // 计算预估剩余时间
    if (completed > 0) {
      const avgTime = taskProgress.summary.averageTime;
      const remaining = total - completed;
      taskProgress.estimatedTime = Math.round((avgTime * remaining) / 1000);
    }
  }
  
  /**
   * 发布进度事件
   */
  private publishProgressEvent(
    taskId: string,
    progress: TaskProgress
  ): void {
    // 通过WebSocket或Server-Sent Events推送进度
    eventEmitter.emit('task-progress', { taskId, progress });
  }
}
```

### 7.2 实时通知

#### 7.2.1 WebSocket通知

```typescript
/**
 * WebSocket进度通知
 */
class ProgressNotifier {
  private connections: Map<string, WebSocket> = new Map();
  
  /**
   * 注册连接
   */
  register(taskId: string, ws: WebSocket): void {
    this.connections.set(taskId, ws);
    
    ws.on('close', () => {
      this.connections.delete(taskId);
    });
  }
  
  /**
   * 发送进度更新
   */
  notify(taskId: string, progress: TaskProgress): void {
    const ws = this.connections.get(taskId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'progress',
        taskId,
        progress,
      }));
    }
  }
  
  /**
   * 发送完成通知
   */
  notifyComplete(taskId: string, result: TaskResult): void {
    const ws = this.connections.get(taskId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'complete',
        taskId,
        result,
      }));
    }
  }
}
```

---

## 8. 文件合并设计

### 8.1 合并策略

#### 8.1.1 PDF合并

```typescript
import PDFDocument from 'pdfkit';
import fs from 'fs';

/**
 * 合并多个PDF文件
 */
async function mergePDFs(
  filePaths: string[],
  outputPath: string
): Promise<MergeResult> {
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  
  for (const filePath of filePaths) {
    // 读取PDF文件
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // 复制页面
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const [width, height] = page.getSize();
      const newPage = doc.addPage([width, height]);
      
      // 复制页面内容（简化示例）
      // 实际需要使用pdf-lib等库进行页面复制
    }
    
    // 添加分页符（如需要）
    doc.addPage();
  }
  
  doc.end();
  
  return {
    success: true,
    mergedFilePath: outputPath,
    pageCount: await countPages(outputPath),
  };
}
```

#### 8.1.2 Word合并

```typescript
/**
 * 合并多个Word文件
 */
async function mergeWords(
  filePaths: string[],
  outputPath: string
): Promise<MergeResult> {
  // 使用LibreOffice合并Word文件
  const command = `soffice --headless --convert-to docx "${filePaths.join('" "')}" --outdir "${path.dirname(outputPath)}"`;
  
  // 或使用docx库合并
  const mergedDoc = new Document();
  
  for (const filePath of filePaths) {
    const doc = await Document.load(filePath);
    
    // 复制段落
    doc.body.forEach(paragraph => {
      mergedDoc.addParagraph(paragraph);
    });
    
    // 添加分页符
    mergedDoc.addPageBreak();
  }
  
  await mergedDoc.save(outputPath);
  
  return {
    success: true,
    mergedFilePath: outputPath,
  };
}
```

### 8.2 批量命名

#### 8.2.1 命名规则引擎

```typescript
/**
 * 批量命名
 */
interface NamingRule {
  pattern: string;               // 命名模式，如"{date}-{filename}-{index}"
  variables: {
    date?: string;               // 日期格式
    time?: string;               // 时间格式
    filename?: string;          // 原文件名
    index?: number;              // 序号
    extension?: string;         // 扩展名
    [key: string]: any;          // 自定义变量
  };
}

function generateFileName(
  originalName: string,
  rule: NamingRule,
  index: number
): string {
  let fileName = rule.pattern;
  
  // 替换变量
  fileName = fileName.replace('{date}', formatDate(new Date(), rule.variables.date));
  fileName = fileName.replace('{time}', formatTime(new Date(), rule.variables.time));
  fileName = fileName.replace('{filename}', path.parse(originalName).name);
  fileName = fileName.replace('{index}', String(index).padStart(3, '0'));
  fileName = fileName.replace('{extension}', path.parse(originalName).ext);
  
  // 替换自定义变量
  Object.keys(rule.variables).forEach(key => {
    if (key !== 'date' && key !== 'time' && key !== 'filename' && 
        key !== 'index' && key !== 'extension') {
      fileName = fileName.replace(`{${key}}`, rule.variables[key]);
    }
  });
  
  return fileName;
}
```

---

## 9. 任务流程设计

### 9.1 批量任务创建流程

```text
用户选择多个文件
  ↓
创建批量任务
  ├── 验证文件列表（≤100个）
  ├── 验证文件格式
  └── 验证目标格式
  ↓
生成任务ID
  ↓
创建任务记录
  ├── 保存任务信息
  ├── 保存文件列表
  └── 初始化进度
  ↓
创建转换任务
  ├── 为每个文件创建子任务
  ├── 设置任务优先级
  └── 添加到任务队列
  ↓
返回任务ID
  ↓
开始任务调度
```

### 9.2 任务执行流程

```text
任务调度器获取任务
  ↓
检查并发限制
  ├── 检查当前并发数
  └── 检查资源使用
  ↓
分配Worker
  ├── 选择可用Worker
  └── 分配任务
  ↓
Worker执行转换
  ├── 更新状态为"处理中"
  ├── 执行文件转换
  ├── 更新进度
  └── 保存结果
  ↓
任务完成
  ├── 更新状态为"完成"
  ├── 更新总体进度
  └── 触发完成事件
  ↓
检查是否全部完成
  ├── 是 → 触发任务完成
  └── 否 → 继续处理下一个
```

### 9.3 任务完成流程

```text
所有文件处理完成
  ↓
收集结果
  ├── 收集成功结果
  ├── 收集失败结果
  └── 统计信息
  ↓
文件合并（如需要）
  ├── 检查是否启用合并
  ├── 执行文件合并
  └── 保存合并文件
  ↓
批量命名（如需要）
  ├── 应用命名规则
  └── 重命名文件
  ↓
生成任务报告
  ├── 统计信息
  ├── 结果列表
  └── 错误列表
  ↓
发送完成通知
  ├── WebSocket通知
  ├── Webhook回调（企业版）
  └── 邮件通知（可选）
  ↓
任务完成
```

---

## 10. 错误处理

### 10.1 错误类型

| 错误类型 | 错误码 | 说明 | 处理方式 |
| ---- | ---- | ---- | ---- |
| 文件数量超限 | E301 | 批量文件数超过100个 | 返回错误，提示最大文件数 |
| 任务创建失败 | E302 | 任务创建过程失败 | 返回错误，记录日志 |
| 任务执行失败 | E303 | 单个文件转换失败 | 记录错误，继续处理其他文件 |
| 队列满 | E304 | 任务队列已满 | 返回错误，提示稍后重试 |
| 资源不足 | E305 | 系统资源不足 | 返回错误，提示稍后重试 |
| 任务不存在 | E306 | 任务ID对应的任务不存在 | 返回错误，提示任务不存在 |

### 10.2 错误处理策略

#### 10.2.1 单个文件失败处理

```typescript
/**
 * 处理单个文件转换失败
 */
async function handleFileFailure(
  taskId: string,
  fileId: string,
  error: Error
): Promise<void> {
  // 1. 更新文件状态
  await updateFileStatus(taskId, fileId, {
    status: 'failed',
    error: error.message,
  });
  
  // 2. 更新任务进度
  await updateTaskProgress(taskId);
  
  // 3. 判断是否重试
  if (shouldRetry(error)) {
    await retryFile(taskId, fileId);
  } else {
    // 记录失败
    await recordFailure(taskId, fileId, error);
  }
}
```

#### 10.2.2 任务级错误处理

```typescript
/**
 * 处理任务级错误
 */
async function handleTaskFailure(
  taskId: string,
  error: Error
): Promise<void> {
  // 1. 更新任务状态
  await updateTaskStatus(taskId, 'failed');
  
  // 2. 取消所有未执行的任务
  await cancelPendingTasks(taskId);
  
  // 3. 记录错误
  await recordTaskError(taskId, error);
  
  // 4. 发送错误通知
  await notifyTaskFailure(taskId, error);
}
```

---

## 11. 性能优化

### 11.1 队列优化

#### 11.1.1 队列配置优化

```typescript
const queueConfig = {
  // 批量处理配置
  batchSize: 10,                 // 批量处理大小
  batchDelay: 100,              // 批量处理延迟（毫秒）
  
  // 优先级配置
  priorityLevels: 10,            // 优先级级别
  
  // 延迟配置
  delay: 0,                      // 默认延迟
  
  // 重试配置
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
};
```

### 11.2 并发优化

#### 11.2.1 动态并发调整

```typescript
/**
 * 动态调整并发数
 */
class DynamicConcurrencyController {
  private currentConcurrency: number;
  private maxConcurrency: number;
  private minConcurrency: number;
  
  /**
   * 根据系统负载调整并发数
   */
  async adjustConcurrency(): Promise<void> {
    const systemLoad = await this.getSystemLoad();
    
    if (systemLoad.cpu > 80 || systemLoad.memory > 80) {
      // 负载高，降低并发数
      this.currentConcurrency = Math.max(
        this.minConcurrency,
        this.currentConcurrency - 1
      );
    } else if (systemLoad.cpu < 50 && systemLoad.memory < 50) {
      // 负载低，提高并发数
      this.currentConcurrency = Math.min(
        this.maxConcurrency,
        this.currentConcurrency + 1
      );
    }
    
    // 更新Worker并发数
    await this.updateWorkerConcurrency(this.currentConcurrency);
  }
}
```

---

## 12. 测试设计

### 12.1 单元测试

- **任务创建测试**：测试批量任务创建
- **队列操作测试**：测试任务入队、出队
- **进度更新测试**：测试进度更新机制
- **文件合并测试**：测试文件合并功能

### 12.2 集成测试

- **端到端测试**：测试完整的批量转换流程
- **并发测试**：测试并发处理能力
- **错误处理测试**：测试各种错误场景

### 12.3 性能测试

- **吞吐量测试**：测试批量处理吞吐量
- **并发能力测试**：测试最大并发数
- **资源使用测试**：测试资源占用情况

---

## 13. 部署说明

### 13.1 Redis配置

```typescript
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  },
};
```

### 13.2 BullMQ配置

```typescript
const bullMQConfig = {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
  },
};
```

---

## 14. 附录

### 14.1 术语表

- **任务队列**：存储待处理任务的队列
- **Worker**：执行任务的 worker 进程
- **并发控制**：控制同时执行的任务数量
- **进度监控**：实时监控任务执行进度

### 14.2 参考资源

- [BullMQ文档](https://docs.bullmq.io/)
- [Redis文档](https://redis.io/docs/)
- [PDFKit文档](https://pdfkit.org/)

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |
