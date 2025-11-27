# 缓存管理模块详细设计文档（DDD）

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |

## 1. 文档说明

### 1.1 文档目的

本文档详细描述缓存管理模块的设计，包括文件缓存、临时文件清理、自动删除机制等功能的设计和实现方案。

### 1.2 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《系统概要设计文档（HLD）》
- 《技术选型方案文档》

---

## 2. 模块概述

### 2.1 模块定位

缓存管理模块负责管理文件缓存、临时文件清理和自动删除，确保系统资源合理使用和数据安全。

### 2.2 功能职责

- **文件缓存管理**：缓存转换结果，减少重复计算
- **临时文件清理**：自动清理转换过程中的临时文件
- **自动删除机制**：按配置自动删除文件（1-24小时可配置）
- **缓存策略管理**：管理缓存策略和生命周期
- **存储空间管理**：监控和管理存储空间使用

### 2.3 功能需求

#### 2.3.1 缓存功能

- **转换结果缓存**：缓存相同文件的转换结果
- **元数据缓存**：缓存文件元数据信息
- **会话缓存**：缓存用户会话信息（企业版）

#### 2.3.2 清理功能

- **临时文件清理**：转换完成后自动清理临时文件
- **过期文件清理**：清理超过保留期的文件
- **缓存清理**：按策略清理缓存文件

#### 2.3.3 自动删除

- **可配置删除时间**：支持1-24小时可配置
- **自动删除触发**：按配置时间自动删除文件
- **删除前通知**：删除前可发送通知（可选）

---

## 3. 架构设计

### 3.1 模块架构

```text
缓存管理模块
  ├── 缓存管理器（CacheManager）
  │   ├── 转换结果缓存
  │   ├── 元数据缓存
  │   └── 会话缓存
  │
  ├── 临时文件管理器（TempFileManager）
  │   ├── 临时文件创建
  │   ├── 临时文件跟踪
  │   └── 临时文件清理
  │
  ├── 清理调度器（CleanupScheduler）
  │   ├── 定时清理任务
  │   ├── 事件触发清理
  │   └── 手动清理
  │
  ├── 存储空间管理器（StorageManager）
  │   ├── 空间监控
  │   ├── 空间统计
  │   └── 空间清理
  │
  └── 删除策略管理器（DeletionPolicyManager）
      ├── 删除策略配置
      ├── 删除任务调度
      └── 删除执行
```

### 3.2 核心组件说明

#### 3.2.1 缓存管理器（CacheManager）

**职责**：管理各种类型的缓存

**缓存类型**：

- **转换结果缓存**：缓存文件转换结果
- **元数据缓存**：缓存文件元数据
- **会话缓存**：缓存用户会话（企业版）

#### 3.2.2 临时文件管理器（TempFileManager）

**职责**：管理临时文件的创建、跟踪和清理

**功能**：

- 创建临时文件
- 跟踪临时文件生命周期
- 自动清理临时文件

#### 3.2.3 清理调度器（CleanupScheduler）

**职责**：调度和执行清理任务

**清理触发**：

- **定时清理**：定时任务触发
- **事件触发**：转换完成等事件触发
- **手动触发**：用户手动触发

#### 3.2.4 存储空间管理器（StorageManager）

**职责**：监控和管理存储空间

**功能**：

- 监控存储空间使用情况
- 统计文件占用空间
- 执行空间清理

#### 3.2.5 删除策略管理器（DeletionPolicyManager）

**职责**：管理文件自动删除策略

**功能**：

- 配置删除策略
- 调度删除任务
- 执行自动删除

---

## 4. 接口设计

### 4.1 缓存管理接口

#### 4.1.1 缓存操作

```typescript
/**
 * 缓存转换结果
 * @param key 缓存键
 * @param value 缓存值（文件路径或Buffer）
 * @param options 缓存选项
 * @returns 缓存结果
 */
interface CacheOptions {
  ttl?: number;                  // 生存时间（秒）
  maxSize?: number;              // 最大大小（字节）
  priority?: 'high' | 'medium' | 'low'; // 优先级
}

interface CacheResult {
  success: boolean;
  key: string;
  size: number;
  expiresAt?: Date;
}

function setCache(
  key: string,
  value: string | Buffer,
  options?: CacheOptions
): Promise<CacheResult>;

/**
 * 获取缓存
 * @param key 缓存键
 * @returns 缓存值
 */
function getCache(key: string): Promise<Buffer | null>;

/**
 * 删除缓存
 * @param key 缓存键
 * @returns 删除结果
 */
function deleteCache(key: string): Promise<boolean>;

/**
 * 清空缓存
 * @param pattern 匹配模式（可选）
 * @returns 清空结果
 */
function clearCache(pattern?: string): Promise<number>; // 返回删除的缓存数量
```

#### 4.1.2 缓存键生成

```typescript
/**
 * 生成缓存键
 * @param fileId 文件ID
 * @param targetFormat 目标格式
 * @param options 转换选项（用于生成唯一键）
 * @returns 缓存键
 */
function generateCacheKey(
  fileId: string,
  targetFormat: string,
  options?: Record<string, any>
): string {
  // 生成唯一缓存键
  const hash = crypto.createHash('sha256')
    .update(JSON.stringify({ fileId, targetFormat, options }))
    .digest('hex');
  
  return `cache:convert:${hash}`;
}
```

### 4.2 临时文件管理接口

#### 4.2.1 临时文件操作

```typescript
/**
 * 创建临时文件
 * @param prefix 文件名前缀
 * @param suffix 文件名后缀
 * @returns 临时文件路径
 */
function createTempFile(
  prefix?: string,
  suffix?: string
): Promise<string>;

/**
 * 注册临时文件
 * @param filePath 文件路径
 * @param metadata 元数据
 * @returns 注册结果
 */
interface TempFileMetadata {
  filePath: string;
  createdAt: Date;
  expiresAt?: Date;
  taskId?: string;
  autoCleanup: boolean;
}

function registerTempFile(
  filePath: string,
  metadata?: Partial<TempFileMetadata>
): Promise<void>;

/**
 * 清理临时文件
 * @param options 清理选项
 * @returns 清理结果
 */
interface CleanupOptions {
  olderThanHours?: number;      // 清理N小时前的文件
  taskId?: string;              // 关联任务ID
  filePaths?: string[];         // 指定文件路径列表
  dryRun?: boolean;             // 仅检查，不实际删除
}

interface CleanupResult {
  success: boolean;
  totalFiles: number;           // 总文件数
  deletedFiles: number;         // 已删除文件数
  freedSpace: number;           // 释放空间（字节）
  errors?: string[];            // 错误信息
}

function cleanTempFiles(
  options?: CleanupOptions
): Promise<CleanupResult>;
```

### 4.3 自动删除接口

#### 4.3.1 删除策略配置

```typescript
/**
 * 配置文件自动删除策略
 * @param fileId 文件ID
 * @param deleteAfterHours 删除时间（小时，1-24）
 * @returns 配置结果
 */
function setAutoDelete(
  fileId: string,
  deleteAfterHours: number
): Promise<void>;

/**
 * 取消自动删除
 * @param fileId 文件ID
 * @returns 取消结果
 */
function cancelAutoDelete(fileId: string): Promise<void>;

/**
 * 立即删除文件
 * @param fileId 文件ID
 * @param force 是否强制删除
 * @returns 删除结果
 */
function deleteFileNow(
  fileId: string,
  force?: boolean
): Promise<boolean>;
```

---

## 5. 缓存策略设计

### 5.1 缓存类型

#### 5.1.1 转换结果缓存

**缓存内容**：文件转换后的结果文件

**缓存键生成**：

```typescript
// 基于文件内容哈希和转换参数生成唯一键
const cacheKey = generateCacheKey(fileId, targetFormat, {
  quality: options.quality,
  pageRange: options.pageRange,
  // ... 其他影响结果的参数
});
```

**缓存策略**：

- **TTL**：默认7天
- **大小限制**：单文件≤100MB
- **清理策略**：LRU（最近最少使用）

#### 5.1.2 元数据缓存

**缓存内容**：文件元数据信息

**缓存策略**：

- **TTL**：默认1小时
- **大小限制**：无限制（元数据很小）
- **清理策略**：TTL过期自动清理

#### 5.1.3 会话缓存（企业版）

**缓存内容**：用户会话信息

**缓存策略**：

- **TTL**：默认30分钟
- **大小限制**：无限制
- **清理策略**：TTL过期自动清理

### 5.2 缓存存储

#### 5.2.1 个人版缓存

**存储方式**：本地文件系统

**存储结构**：

```text
cache/
  ├── convert/          # 转换结果缓存
  │   ├── {hash}.{ext}
  │   └── {hash}.meta.json
  │
  ├── metadata/         # 元数据缓存
  │   └── {fileId}.json
  │
  └── temp/            # 临时缓存
      └── {tempId}.{ext}
```

#### 5.2.2 企业版缓存

**存储方式**：Redis + 本地文件系统

**存储策略**：

- **小文件（<10MB）**：存储在Redis中
- **大文件（≥10MB）**：存储在文件系统，Redis存储路径

---

## 6. 临时文件管理设计

### 6.1 临时文件分类

#### 6.1.1 转换临时文件

**用途**：转换过程中的中间文件

**生命周期**：

- **创建**：转换开始时创建
- **使用**：转换过程中使用
- **清理**：转换完成后立即清理

#### 6.1.2 上传临时文件

**用途**：文件上传过程中的临时文件

**生命周期**：

- **创建**：上传开始时创建
- **使用**：上传过程中使用
- **清理**：上传完成后立即清理或延迟清理

#### 6.1.3 下载临时文件

**用途**：批量下载打包的临时ZIP文件

**生命周期**：

- **创建**：打包时创建
- **使用**：下载时使用
- **清理**：下载完成后延迟清理（1-24小时）

### 6.2 临时文件跟踪

#### 6.2.1 跟踪机制

```typescript
/**
 * 临时文件跟踪器
 */
class TempFileTracker {
  private tempFiles: Map<string, TempFileMetadata> = new Map();
  
  /**
   * 注册临时文件
   */
  register(filePath: string, metadata: TempFileMetadata): void {
    this.tempFiles.set(filePath, metadata);
  }
  
  /**
   * 获取过期文件
   */
  getExpiredFiles(now: Date = new Date()): string[] {
    const expired: string[] = [];
    
    this.tempFiles.forEach((metadata, filePath) => {
      if (metadata.expiresAt && metadata.expiresAt < now) {
        expired.push(filePath);
      }
    });
    
    return expired;
  }
  
  /**
   * 清理文件
   */
  async cleanup(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      this.tempFiles.delete(filePath);
      return true;
    } catch (error) {
      console.error(`Failed to cleanup temp file: ${filePath}`, error);
      return false;
    }
  }
}
```

### 6.3 清理策略

#### 6.3.1 立即清理

**触发时机**：

- 转换完成后立即清理
- 上传完成后立即清理
- 任务取消时立即清理

#### 6.3.2 延迟清理

**触发时机**：

- 下载完成后延迟清理（1-24小时可配置）
- 用户设置延迟清理时间

#### 6.3.3 定时清理

**触发时机**：

- 定时任务（每小时）清理过期临时文件
- 清理超过保留期的文件

---

## 7. 自动删除机制设计

### 7.1 删除策略

#### 7.1.1 时间策略

**配置方式**：

- **固定时间**：文件创建后N小时删除
- **相对时间**：转换完成后N小时删除
- **自定义时间**：用户自定义删除时间

**时间范围**：1-24小时可配置

#### 7.1.2 条件策略

**删除条件**：

- **时间条件**：超过配置时间
- **状态条件**：文件状态为"可删除"
- **关联条件**：无关联任务或任务已完成

### 7.2 删除流程

```text
删除任务触发
  ├── 定时任务（每分钟检查）
  ├── 转换完成事件
  └── 手动触发
  ↓
查找待删除文件
  ├── 检查删除时间
  ├── 检查文件状态
  └── 检查关联任务
  ↓
验证可删除
  ├── 检查文件是否在使用
  ├── 检查是否有下载中
  └── 检查用户权限
  ↓
执行删除
  ├── 删除物理文件
  ├── 删除元数据
  └── 更新数据库
  ↓
记录删除日志
  ↓
发送删除通知（可选）
  ↓
完成
```

### 7.3 删除实现

```typescript
/**
 * 自动删除管理器
 */
class AutoDeleteManager {
  private deletionTasks: Map<string, DeletionTask> = new Map();
  
  /**
   * 设置自动删除
   */
  async setAutoDelete(
    fileId: string,
    deleteAfterHours: number
  ): Promise<void> {
    const deleteAt = new Date();
    deleteAt.setHours(deleteAt.getHours() + deleteAfterHours);
    
    const task: DeletionTask = {
      fileId,
      deleteAt,
      status: 'scheduled',
    };
    
    this.deletionTasks.set(fileId, task);
    
    // 保存到数据库
    await this.saveDeletionTask(task);
  }
  
  /**
   * 检查并执行删除
   */
  async checkAndDelete(): Promise<void> {
    const now = new Date();
    const toDelete: string[] = [];
    
    this.deletionTasks.forEach((task, fileId) => {
      if (task.deleteAt <= now && task.status === 'scheduled') {
        toDelete.push(fileId);
      }
    });
    
    for (const fileId of toDelete) {
      await this.deleteFile(fileId);
    }
  }
  
  /**
   * 删除文件
   */
  private async deleteFile(fileId: string): Promise<void> {
    const task = this.deletionTasks.get(fileId);
    if (!task) return;
    
    try {
      // 1. 检查文件是否可删除
      if (!await this.canDelete(fileId)) {
        return;
      }
      
      // 2. 删除物理文件
      await this.deletePhysicalFile(fileId);
      
      // 3. 删除元数据
      await this.deleteMetadata(fileId);
      
      // 4. 更新任务状态
      task.status = 'deleted';
      task.deletedAt = new Date();
      
      // 5. 记录日志
      await this.logDeletion(fileId);
      
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      console.error(`Failed to delete file: ${fileId}`, error);
    }
  }
}
```

---

## 8. 存储空间管理

### 8.1 空间监控

#### 8.1.1 空间统计

```typescript
/**
 * 存储空间统计
 */
interface StorageStats {
  totalSpace: number;            // 总空间（字节）
  usedSpace: number;            // 已使用空间（字节）
  freeSpace: number;            // 可用空间（字节）
  usagePercentage: number;      // 使用百分比（0-100）
  fileCount: number;            // 文件数量
  cacheSize: number;            // 缓存大小（字节）
  tempSize: number;             // 临时文件大小（字节）
}

/**
 * 获取存储空间统计
 */
async function getStorageStats(): Promise<StorageStats> {
  const stats = await calculateStorageStats();
  return {
    ...stats,
    usagePercentage: Math.round((stats.usedSpace / stats.totalSpace) * 100),
  };
}
```

#### 8.1.2 空间告警

```typescript
/**
 * 空间告警配置
 */
interface StorageAlert {
  enabled: boolean;
  threshold: number;            // 告警阈值（百分比，如80）
  actions: string[];            // 告警动作
}

/**
 * 检查空间使用情况
 */
async function checkStorageSpace(): Promise<void> {
  const stats = await getStorageStats();
  
  if (stats.usagePercentage >= 80) {
    // 触发告警
    await triggerAlert('storage_high', stats);
    
    // 自动清理
    if (stats.usagePercentage >= 90) {
      await autoCleanup();
    }
  }
}
```

### 8.2 空间清理

#### 8.2.1 清理策略

```typescript
/**
 * 自动空间清理
 */
async function autoCleanup(): Promise<CleanupResult> {
  const stats = await getStorageStats();
  const targetFreeSpace = stats.totalSpace * 0.2; // 目标释放到20%可用
  
  let freedSpace = 0;
  const actions: string[] = [];
  
  // 1. 清理过期缓存
  const cacheResult = await cleanExpiredCache();
  freedSpace += cacheResult.freedSpace;
  actions.push(`清理过期缓存: ${formatBytes(cacheResult.freedSpace)}`);
  
  // 2. 清理临时文件
  const tempResult = await cleanTempFiles({ olderThanHours: 1 });
  freedSpace += tempResult.freedSpace;
  actions.push(`清理临时文件: ${formatBytes(tempResult.freedSpace)}`);
  
  // 3. 如果还不够，清理LRU缓存
  if (stats.freeSpace + freedSpace < targetFreeSpace) {
    const lruResult = await cleanLRUCache();
    freedSpace += lruResult.freedSpace;
    actions.push(`清理LRU缓存: ${formatBytes(lruResult.freedSpace)}`);
  }
  
  return {
    success: true,
    freedSpace,
    actions,
  };
}
```

---

## 9. 清理调度设计

### 9.1 定时清理任务

#### 9.1.1 清理任务配置

```typescript
/**
 * 清理任务配置
 */
const cleanupSchedule = {
  // 临时文件清理（每小时）
  tempFiles: {
    schedule: '0 * * * *',      // Cron表达式：每小时
    enabled: true,
    options: {
      olderThanHours: 1,
    },
  },
  
  // 过期缓存清理（每天凌晨2点）
  expiredCache: {
    schedule: '0 2 * * *',
    enabled: true,
    options: {
      ttl: 7 * 24 * 3600,       // 7天
    },
  },
  
  // 存储空间检查（每10分钟）
  storageCheck: {
    schedule: '*/10 * * * *',
    enabled: true,
  },
  
  // 自动删除检查（每分钟）
  autoDelete: {
    schedule: '* * * * *',
    enabled: true,
  },
};
```

#### 9.1.2 任务执行

```typescript
import cron from 'node-cron';

/**
 * 启动清理任务
 */
function startCleanupTasks(): void {
  // 临时文件清理
  cron.schedule(cleanupSchedule.tempFiles.schedule, async () => {
    if (cleanupSchedule.tempFiles.enabled) {
      await cleanTempFiles(cleanupSchedule.tempFiles.options);
    }
  });
  
  // 过期缓存清理
  cron.schedule(cleanupSchedule.expiredCache.schedule, async () => {
    if (cleanupSchedule.expiredCache.enabled) {
      await cleanExpiredCache(cleanupSchedule.expiredCache.options);
    }
  });
  
  // 存储空间检查
  cron.schedule(cleanupSchedule.storageCheck.schedule, async () => {
    if (cleanupSchedule.storageCheck.enabled) {
      await checkStorageSpace();
    }
  });
  
  // 自动删除检查
  cron.schedule(cleanupSchedule.autoDelete.schedule, async () => {
    if (cleanupSchedule.autoDelete.enabled) {
      await autoDeleteManager.checkAndDelete();
    }
  });
}
```

### 9.2 事件触发清理

#### 9.2.1 事件监听

```typescript
/**
 * 事件触发的清理
 */
eventEmitter.on('conversion-complete', async (data: { fileId: string }) => {
  // 转换完成，清理临时文件
  await cleanTempFiles({ taskId: data.taskId });
});

eventEmitter.on('upload-complete', async (data: { fileId: string }) => {
  // 上传完成，清理上传临时文件
  await cleanTempFiles({ filePaths: [data.tempPath] });
});

eventEmitter.on('download-complete', async (data: { fileId: string }) => {
  // 下载完成，延迟清理ZIP文件
  const deleteAfterHours = 1; // 1小时后删除
  await setAutoDelete(data.fileId, deleteAfterHours);
});
```

---

## 10. 缓存算法设计

### 10.1 LRU缓存

#### 10.1.1 LRU实现

```typescript
/**
 * LRU缓存实现
 */
class LRUCache {
  private capacity: number;
  private cache: Map<string, CacheEntry>;
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key: string): CacheEntry | null {
    if (!this.cache.has(key)) {
      return null;
    }
    
    // 移动到末尾（最近使用）
    const entry = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry;
  }
  
  set(key: string, value: CacheEntry): void {
    if (this.cache.has(key)) {
      // 更新现有项
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的项（第一个）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
  
  /**
   * 清理最久未使用的项
   */
  evict(count: number): number {
    let evicted = 0;
    const iterator = this.cache.keys();
    
    while (evicted < count && iterator.hasNext()) {
      const key = iterator.next().value;
      this.cache.delete(key);
      evicted++;
    }
    
    return evicted;
  }
}
```

### 10.2 缓存淘汰策略

#### 10.2.1 淘汰策略

```typescript
/**
 * 缓存淘汰策略
 */
enum EvictionPolicy {
  LRU = 'lru',              // 最近最少使用
  LFU = 'lfu',              // 最不经常使用
  TTL = 'ttl',              // 基于时间
  SIZE = 'size',            // 基于大小
}

/**
 * 执行缓存淘汰
 */
async function evictCache(
  policy: EvictionPolicy,
  targetSize: number
): Promise<number> {
  switch (policy) {
    case EvictionPolicy.LRU:
      return await evictLRU(targetSize);
    case EvictionPolicy.LFU:
      return await evictLFU(targetSize);
    case EvictionPolicy.TTL:
      return await evictTTL();
    case EvictionPolicy.SIZE:
      return await evictBySize(targetSize);
    default:
      return 0;
  }
}
```

---

## 11. 错误处理

### 11.1 错误类型

| 错误类型 | 错误码 | 说明 | 处理方式 |
| ---- | ---- | ---- | ---- |
| 缓存写入失败 | E401 | 缓存写入失败 | 记录错误，继续执行（不影响主流程） |
| 缓存读取失败 | E402 | 缓存读取失败 | 降级到直接计算 |
| 临时文件清理失败 | E403 | 临时文件清理失败 | 记录错误，稍后重试 |
| 存储空间不足 | E404 | 存储空间不足 | 触发自动清理，返回错误 |
| 删除失败 | E405 | 文件删除失败 | 记录错误，稍后重试 |

### 11.2 错误处理策略

```typescript
/**
 * 缓存操作（带错误处理）
 */
async function setCacheWithFallback(
  key: string,
  value: string | Buffer,
  options?: CacheOptions
): Promise<CacheResult> {
  try {
    return await setCache(key, value, options);
  } catch (error) {
    // 缓存失败不影响主流程
    console.warn(`Cache write failed for key: ${key}`, error);
    return {
      success: false,
      key,
      size: 0,
    };
  }
}
```

---

## 12. 性能优化

### 12.1 缓存性能优化

#### 12.1.1 异步操作

- **异步写入**：缓存写入不阻塞主流程
- **批量操作**：批量读取和写入缓存
- **连接池**：Redis连接池复用

#### 12.1.2 缓存预热

```typescript
/**
 * 缓存预热
 */
async function warmupCache(): Promise<void> {
  // 预加载常用转换结果
  const commonConversions = await getCommonConversions();
  
  for (const conversion of commonConversions) {
    // 预加载到缓存
    await preloadCache(conversion);
  }
}
```

### 12.2 清理性能优化

#### 12.2.1 批量清理

```typescript
/**
 * 批量清理文件
 */
async function batchCleanup(files: string[]): Promise<number> {
  let deleted = 0;
  const batchSize = 100;
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(file => deleteFile(file))
    );
    
    deleted += results.filter(r => r.status === 'fulfilled').length;
  }
  
  return deleted;
}
```

---

## 13. 测试设计

### 13.1 单元测试

- **缓存操作测试**：测试缓存的增删改查
- **临时文件管理测试**：测试临时文件的创建和清理
- **自动删除测试**：测试自动删除机制
- **清理调度测试**：测试清理任务的调度和执行

### 13.2 集成测试

- **端到端测试**：测试完整的缓存和清理流程
- **性能测试**：测试缓存和清理的性能
- **压力测试**：测试大量文件下的缓存和清理

---

## 14. 部署说明

### 14.1 Redis配置（企业版）

```typescript
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 1,                         // 使用专门的数据库
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  },
};
```

### 14.2 清理任务配置

```typescript
const cleanupConfig = {
  enabled: true,
  schedules: {
    tempFiles: '0 * * * *',      // 每小时
    expiredCache: '0 2 * * *',   // 每天凌晨2点
    storageCheck: '*/10 * * * *', // 每10分钟
    autoDelete: '* * * * *',     // 每分钟
  },
  limits: {
    maxCacheSize: 10 * 1024 * 1024 * 1024, // 10GB
    maxTempSize: 5 * 1024 * 1024 * 1024,  // 5GB
    storageThreshold: 80,                   // 80%告警
  },
};
```

---

## 15. 附录

### 15.1 术语表

- **LRU**：Least Recently Used，最近最少使用
- **LFU**：Least Frequently Used，最不经常使用
- **TTL**：Time To Live，生存时间
- **临时文件**：转换过程中的中间文件

### 15.2 参考资源

- [Redis文档](https://redis.io/docs/)
- [Node-cron文档](https://github.com/node-cron/node-cron)
- [LRU Cache算法](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU))

---

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |
