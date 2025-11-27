# 历史记录模块详细设计文档（DDD）

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |

## 1. 文档说明

### 1.1 文档目的

本文档详细描述历史记录模块的设计，包括转换历史记录的存储、查询、管理等功能的设计和实现方案。

### 1.2 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《系统概要设计文档（HLD）》
- 《数据库设计文档》
- 《格式转换核心引擎详细设计文档（DDD）》

---

## 2. 模块概述

### 2.1 模块定位

历史记录模块负责管理用户的转换历史记录，提供历史记录查询、统计、管理等功能，帮助用户追踪和管理转换操作。

### 2.2 功能职责

- **历史记录存储**：自动记录所有转换任务的历史
- **历史记录查询**：支持多种查询方式（时间、格式、状态等）
- **历史记录统计**：提供转换统计信息
- **历史记录管理**：支持删除、导出等操作
- **快速重转换**：基于历史记录快速重新转换

### 2.3 功能需求

#### 2.3.1 历史记录保存

- **保存范围**：保存最近30次转换记录
- **记录内容**：源文件、目标文件、转换参数、转换结果等
- **自动清理**：超过30天的记录自动清理

#### 2.3.2 历史记录查询

- **按时间查询**：最近7天、30天、全部
- **按格式查询**：源格式、目标格式
- **按状态查询**：成功、失败
- **关键词搜索**：文件名搜索

#### 2.3.3 历史记录操作

- **重新下载**：下载历史转换结果
- **再次转换**：基于历史记录快速转换
- **删除记录**：删除不需要的历史记录
- **导出记录**：导出历史记录为CSV/Excel

---

## 3. 架构设计

### 3.1 模块架构

```text
历史记录模块
  ├── 历史记录服务（HistoryService）
  │   ├── 记录创建
  │   ├── 记录查询
  │   ├── 记录统计
  │   └── 记录管理
  │
  ├── 历史记录存储（HistoryStorage）
  │   ├── 数据库存储
  │   ├── 缓存存储
  │   └── 归档存储
  │
  ├── 历史记录查询器（HistoryQuery）
  │   ├── 时间查询
  │   ├── 格式查询
  │   ├── 状态查询
  │   └── 关键词搜索
  │
  ├── 历史记录统计器（HistoryStatistics）
  │   ├── 转换统计
  │   ├── 格式统计
  │   └── 趋势分析
  │
  └── 历史记录清理器（HistoryCleanup）
      ├── 自动清理
      ├── 归档管理
      └── 存储优化
```

### 3.2 核心组件说明

#### 3.2.1 历史记录服务（HistoryService）

**职责**：提供历史记录的完整服务

**功能**：

- 创建历史记录
- 查询历史记录
- 统计历史记录
- 管理历史记录

#### 3.2.2 历史记录存储（HistoryStorage）

**职责**：管理历史记录的存储

**存储策略**：

- **数据库存储**：最近30天的记录存储在数据库
- **缓存存储**：最近7天的记录缓存在Redis
- **归档存储**：超过30天的记录归档到归档表

#### 3.2.3 历史记录查询器（HistoryQuery）

**职责**：提供灵活的查询功能

**查询方式**：

- 时间范围查询
- 格式过滤查询
- 状态过滤查询
- 关键词搜索

---

## 4. 接口设计

### 4.1 历史记录查询接口

#### 4.1.1 查询历史记录列表

```typescript
/**
 * 查询历史记录列表
 */
interface QueryHistoryRequest {
  page?: number;             // 页码，默认1
  pageSize?: number;         // 每页数量，默认20
  startDate?: string;        // 开始日期（ISO格式）
  endDate?: string;          // 结束日期（ISO格式）
  sourceFormat?: string;     // 源格式过滤
  targetFormat?: string;     // 目标格式过滤
  status?: string;           // 状态过滤（completed/failed）
  keyword?: string;          // 关键词搜索（文件名）
  sortBy?: string;          // 排序字段（createdAt/conversionTime）
  order?: 'asc' | 'desc';   // 排序方向，默认desc
}

interface HistoryRecord {
  historyId: string;
  taskId: string;
  sourceFileId: string;
  resultFileId?: string;
  sourceFileName: string;
  resultFileName?: string;
  sourceFormat: string;
  targetFormat: string;
  status: 'completed' | 'failed';
  conversionTime?: number;   // 转换耗时（毫秒）
  fileSizeBefore: number;
  fileSizeAfter?: number;
  quality?: {
    fidelity: number;
    accuracy: number;
  };
  createdAt: string;
  resultFileUrl?: string;    // 结果文件下载URL
}

interface QueryHistoryResponse {
  success: boolean;
  data: HistoryRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

function queryHistory(request: QueryHistoryRequest): Promise<QueryHistoryResponse>;
```

#### 4.1.2 获取历史记录详情

```typescript
/**
 * 获取历史记录详情
 */
interface GetHistoryDetailResponse {
  success: boolean;
  data: {
    historyId: string;
    taskId: string;
    sourceFile: {
      fileId: string;
      fileName: string;
      fileSize: number;
      format: string;
      fileUrl: string;
    };
    resultFile?: {
      fileId: string;
      fileName: string;
      fileSize: number;
      format: string;
      fileUrl: string;
    };
    conversionInfo: {
      sourceFormat: string;
      targetFormat: string;
      status: string;
      conversionTime: number;
      quality?: {
        fidelity: number;
        accuracy: number;
      };
    };
    options?: any;           // 转换选项
    error?: {
      code: string;
      message: string;
    };
    createdAt: string;
  };
}

function getHistoryDetail(historyId: string): Promise<GetHistoryDetailResponse>;
```

### 4.2 历史记录统计接口

#### 4.2.1 获取转换统计

```typescript
/**
 * 获取转换统计
 */
interface ConversionStatistics {
  total: number;             // 总转换次数
  success: number;           // 成功次数
  failed: number;            // 失败次数
  successRate: number;       // 成功率（0-100）
  totalConversionTime: number; // 总转换时间（毫秒）
  averageConversionTime: number; // 平均转换时间（毫秒）
  formatStatistics: Array<{  // 格式统计
    sourceFormat: string;
    targetFormat: string;
    count: number;
  }>;
  timeStatistics: Array<{    // 时间统计（按天）
    date: string;
    count: number;
  }>;
}

interface GetStatisticsResponse {
  success: boolean;
  data: ConversionStatistics;
}

function getStatistics(
  startDate?: string,
  endDate?: string
): Promise<GetStatisticsResponse>;
```

### 4.3 历史记录管理接口

#### 4.3.1 删除历史记录

```typescript
/**
 * 删除历史记录
 */
interface DeleteHistoryRequest {
  historyIds: string[];      // 历史记录ID列表
}

interface DeleteHistoryResponse {
  success: boolean;
  data: {
    deleted: number;         // 删除数量
    message: string;
  };
}

function deleteHistory(request: DeleteHistoryRequest): Promise<DeleteHistoryResponse>;
```

#### 4.3.2 重新转换

```typescript
/**
 * 基于历史记录重新转换
 */
interface ReconvertRequest {
  historyId: string;
  targetFormat?: string;     // 可选，使用新的目标格式
  options?: any;             // 可选，使用新的转换选项
}

interface ReconvertResponse {
  success: boolean;
  data: {
    taskId: string;
    message: string;
  };
}

function reconvert(request: ReconvertRequest): Promise<ReconvertResponse>;
```

#### 4.3.3 导出历史记录

```typescript
/**
 * 导出历史记录
 */
interface ExportHistoryRequest {
  format: 'csv' | 'excel';   // 导出格式
  startDate?: string;
  endDate?: string;
  filters?: {
    sourceFormat?: string;
    targetFormat?: string;
    status?: string;
  };
}

interface ExportHistoryResponse {
  success: boolean;
  data: {
    fileId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  };
}

function exportHistory(request: ExportHistoryRequest): Promise<ExportHistoryResponse>;
```

---

## 5. 详细设计

### 5.1 历史记录创建流程

#### 5.1.1 自动创建流程

```text
1. 转换任务完成
   ├── 任务状态变为completed或failed
   └── 触发历史记录创建事件

2. 收集历史记录信息
   ├── 任务信息（taskId、用户ID）
   ├── 文件信息（源文件、结果文件）
   ├── 转换信息（格式、耗时、质量）
   └── 错误信息（如果失败）

3. 创建历史记录
   ├── 生成历史记录ID
   ├── 保存到数据库
   ├── 更新缓存（如果适用）
   └── 检查记录数量限制

4. 清理旧记录
   ├── 检查用户历史记录数量
   ├── 如果超过30条，删除最旧的记录
   └── 如果超过30天，归档到归档表
```

#### 5.1.2 历史记录创建实现

```typescript
/**
 * 创建历史记录
 */
async function createHistoryRecord(task: ConversionTask): Promise<void> {
  const historyRecord = {
    historyId: generateUUID(),
    userId: task.userId,
    taskId: task.taskId,
    sourceFileId: task.sourceFileId,
    resultFileId: task.resultFileId,
    sourceFormat: task.sourceFormat,
    targetFormat: task.targetFormat,
    status: task.status,
    conversionTime: task.conversionTime,
    fileSizeBefore: task.sourceFileSize,
    fileSizeAfter: task.resultFileSize,
    quality: task.qualityMetrics,
    createdAt: new Date(),
  }
  
  // 保存到数据库
  await db.insert('conversion_history', historyRecord)
  
  // 更新缓存
  await updateHistoryCache(task.userId, historyRecord)
  
  // 检查并清理旧记录
  await cleanupOldHistory(task.userId)
}
```

### 5.2 历史记录查询设计

#### 5.2.1 查询优化

- **索引优化**：使用复合索引优化查询
- **分页查询**：使用LIMIT和OFFSET实现分页
- **缓存策略**：最近查询结果缓存5分钟

```typescript
/**
 * 查询历史记录（优化版）
 */
async function queryHistoryOptimized(
  userId: string,
  request: QueryHistoryRequest
): Promise<QueryHistoryResponse> {
  // 构建查询条件
  const conditions: string[] = ['user_id = $1']
  const params: any[] = [userId]
  let paramIndex = 2
  
  if (request.startDate) {
    conditions.push(`created_at >= $${paramIndex}`)
    params.push(request.startDate)
    paramIndex++
  }
  
  if (request.endDate) {
    conditions.push(`created_at <= $${paramIndex}`)
    params.push(request.endDate)
    paramIndex++
  }
  
  if (request.sourceFormat) {
    conditions.push(`source_format = $${paramIndex}`)
    params.push(request.sourceFormat)
    paramIndex++
  }
  
  if (request.targetFormat) {
    conditions.push(`target_format = $${paramIndex}`)
    params.push(request.targetFormat)
    paramIndex++
  }
  
  if (request.status) {
    conditions.push(`status = $${paramIndex}`)
    params.push(request.status)
    paramIndex++
  }
  
  // 关键词搜索（文件名）
  if (request.keyword) {
    conditions.push(`source_file_name ILIKE $${paramIndex}`)
    params.push(`%${request.keyword}%`)
    paramIndex++
  }
  
  // 排序
  const sortBy = request.sortBy || 'created_at'
  const order = request.order || 'desc'
  const orderBy = `${sortBy} ${order}`
  
  // 分页
  const page = request.page || 1
  const pageSize = request.pageSize || 20
  const offset = (page - 1) * pageSize
  
  // 查询总数
  const countQuery = `SELECT COUNT(*) FROM conversion_history WHERE ${conditions.join(' AND ')}`
  const countResult = await db.query(countQuery, params)
  const total = parseInt(countResult[0].count)
  
  // 查询数据
  const dataQuery = `
    SELECT * FROM conversion_history
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `
  params.push(pageSize, offset)
  const records = await db.query(dataQuery, params)
  
  return {
    success: true,
    data: records.map(mapToHistoryRecord),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}
```

### 5.3 历史记录统计设计

#### 5.3.1 统计实现

```typescript
/**
 * 获取转换统计
 */
async function getConversionStatistics(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<ConversionStatistics> {
  // 构建时间条件
  const timeConditions: string[] = ['user_id = $1']
  const params: any[] = [userId]
  let paramIndex = 2
  
  if (startDate) {
    timeConditions.push(`created_at >= $${paramIndex}`)
    params.push(startDate)
    paramIndex++
  }
  
  if (endDate) {
    timeConditions.push(`created_at <= $${paramIndex}`)
    params.push(endDate)
    paramIndex++
  }
  
  const whereClause = timeConditions.join(' AND ')
  
  // 总统计
  const totalQuery = `SELECT COUNT(*) as total FROM conversion_history WHERE ${whereClause}`
  const totalResult = await db.query(totalQuery, params)
  const total = parseInt(totalResult[0].total)
  
  // 成功/失败统计
  const statusQuery = `
    SELECT status, COUNT(*) as count
    FROM conversion_history
    WHERE ${whereClause}
    GROUP BY status
  `
  const statusResult = await db.query(statusQuery, params)
  const success = statusResult.find((r: any) => r.status === 'completed')?.count || 0
  const failed = statusResult.find((r: any) => r.status === 'failed')?.count || 0
  
  // 转换时间统计
  const timeQuery = `
    SELECT
      SUM(conversion_time) as total_time,
      AVG(conversion_time) as avg_time
    FROM conversion_history
    WHERE ${whereClause} AND status = 'completed'
  `
  const timeResult = await db.query(timeQuery, params)
  const totalConversionTime = timeResult[0].total_time || 0
  const averageConversionTime = Math.round(timeResult[0].avg_time || 0)
  
  // 格式统计
  const formatQuery = `
    SELECT source_format, target_format, COUNT(*) as count
    FROM conversion_history
    WHERE ${whereClause}
    GROUP BY source_format, target_format
    ORDER BY count DESC
    LIMIT 10
  `
  const formatResult = await db.query(formatQuery, params)
  
  // 时间统计（按天）
  const dailyQuery = `
    SELECT
      DATE(created_at) as date,
      COUNT(*) as count
    FROM conversion_history
    WHERE ${whereClause}
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 30
  `
  const dailyResult = await db.query(dailyQuery, params)
  
  return {
    total,
    success,
    failed,
    successRate: total > 0 ? Math.round((success / total) * 100) : 0,
    totalConversionTime,
    averageConversionTime,
    formatStatistics: formatResult.map((r: any) => ({
      sourceFormat: r.source_format,
      targetFormat: r.target_format,
      count: parseInt(r.count),
    })),
    timeStatistics: dailyResult.map((r: any) => ({
      date: r.date,
      count: parseInt(r.count),
    })),
  }
}
```

### 5.4 历史记录清理设计

#### 5.4.1 自动清理策略

- **数量限制**：每个用户最多保留30条记录
- **时间限制**：超过30天的记录自动归档
- **清理时机**：创建新记录时触发清理

```typescript
/**
 * 清理旧历史记录
 */
async function cleanupOldHistory(userId: string): Promise<void> {
  // 1. 检查记录数量，超过30条删除最旧的
  const countQuery = 'SELECT COUNT(*) FROM conversion_history WHERE user_id = $1'
  const countResult = await db.query(countQuery, [userId])
  const count = parseInt(countResult[0].count)
  
  if (count > 30) {
    const deleteQuery = `
      DELETE FROM conversion_history
      WHERE user_id = $1
      AND history_id IN (
        SELECT history_id
        FROM conversion_history
        WHERE user_id = $1
        ORDER BY created_at ASC
        LIMIT $2
      )
    `
    await db.query(deleteQuery, [userId, count - 30])
  }
  
  // 2. 归档超过30天的记录
  const archiveDate = new Date()
  archiveDate.setDate(archiveDate.getDate() - 30)
  
  const archiveQuery = `
    INSERT INTO conversion_history_archive
    SELECT * FROM conversion_history
    WHERE user_id = $1 AND created_at < $2
  `
  await db.query(archiveQuery, [userId, archiveDate])
  
  const deleteOldQuery = `
    DELETE FROM conversion_history
    WHERE user_id = $1 AND created_at < $2
  `
  await db.query(deleteOldQuery, [userId, archiveDate])
}
```

### 5.5 快速重转换设计

#### 5.5.1 重转换流程

```text
1. 用户选择历史记录
   └── 获取历史记录详情

2. 准备转换参数
   ├── 使用历史记录的源文件
   ├── 使用历史记录的目标格式（或新格式）
   ├── 使用历史记录的转换选项（或新选项）
   └── 创建新的转换任务

3. 执行转换
   └── 调用格式转换服务

4. 创建新的历史记录
   └── 记录新的转换结果
```

#### 5.5.2 重转换实现

```typescript
/**
 * 基于历史记录重新转换
 */
async function reconvertFromHistory(
  userId: string,
  historyId: string,
  options?: ReconvertOptions
): Promise<string> {
  // 获取历史记录
  const history = await getHistoryDetail(historyId)
  if (!history || history.data.userId !== userId) {
    throw new Error('历史记录不存在或无权限访问')
  }
  
  // 检查源文件是否存在
  const sourceFile = await getFileById(history.data.sourceFile.fileId)
  if (!sourceFile || sourceFile.status !== 'active') {
    throw new Error('源文件不存在或已删除')
  }
  
  // 准备转换参数
  const convertOptions = {
    fileId: history.data.sourceFile.fileId,
    targetFormat: options?.targetFormat || history.data.conversionInfo.targetFormat,
    sourceFormat: history.data.conversionInfo.sourceFormat,
    options: options?.options || history.data.options || {},
  }
  
  // 创建新的转换任务
  const task = await conversionService.convertFile(convertOptions)
  
  return task.taskId
}
```

---

## 6. 性能优化

### 6.1 查询性能优化

#### 6.1.1 索引优化

- **复合索引**：`(user_id, created_at DESC)`用于按时间查询
- **格式索引**：`(user_id, source_format, target_format)`用于格式过滤
- **状态索引**：`(user_id, status)`用于状态过滤

#### 6.1.2 缓存策略

- **最近记录缓存**：最近7天的记录缓存在Redis
- **统计结果缓存**：统计结果缓存10分钟
- **查询结果缓存**：常用查询结果缓存5分钟

```typescript
/**
 * 查询历史记录（带缓存）
 */
async function queryHistoryCached(
  userId: string,
  request: QueryHistoryRequest
): Promise<QueryHistoryResponse> {
  // 生成缓存键
  const cacheKey = `history:${userId}:${JSON.stringify(request)}`
  
  // 尝试从缓存获取
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // 从数据库查询
  const result = await queryHistoryOptimized(userId, request)
  
  // 写入缓存（5分钟）
  await redis.setex(cacheKey, 300, JSON.stringify(result))
  
  return result
}
```

### 6.2 存储优化

#### 6.2.1 数据归档

- **归档策略**：超过30天的记录归档到归档表
- **归档表**：使用分区表按月分区
- **查询优化**：归档表使用只读查询

#### 6.2.2 数据压缩

- **JSON压缩**：大字段使用压缩存储
- **定期清理**：定期清理归档数据

---

## 7. 错误处理

### 7.1 错误类型

| 错误类型 | 错误码 | 说明 | 处理方式 |
| ---- | ---- | ---- | ---- |
| 历史记录不存在 | E00005 | 指定的历史记录不存在 | 返回404错误 |
| 无权限访问 | E00004 | 用户无权限访问该历史记录 | 返回403错误 |
| 查询参数错误 | E00002 | 查询参数不合法 | 返回400错误 |
| 导出失败 | E10002 | 历史记录导出失败 | 返回500错误 |

### 7.2 错误处理流程

```text
1. 参数验证
   ├── 验证必需参数
   ├── 验证参数格式
   └── 验证参数值范围

2. 权限验证
   ├── 验证用户身份
   └── 验证资源所有权

3. 数据查询
   ├── 执行查询
   └── 处理查询错误

4. 错误处理
   ├── 捕获异常
   ├── 记录错误日志
   └── 返回错误响应
```

---

## 8. 测试设计

### 8.1 单元测试

- **历史记录创建测试**：正常创建、异常处理
- **历史记录查询测试**：各种查询条件、分页
- **历史记录统计测试**：统计准确性
- **历史记录清理测试**：自动清理逻辑

### 8.2 集成测试

- **完整流程测试**：转换→记录→查询→重转换
- **性能测试**：大量历史记录的查询性能

---

## 9. 部署说明

### 9.1 配置

```typescript
const historyConfig = {
  // 记录限制
  maxRecords: 30,             // 每个用户最多保留记录数
  retentionDays: 30,         // 记录保留天数
  
  // 缓存配置
  cache: {
    recentDays: 7,            // 最近N天记录缓存
    ttl: 300,                 // 缓存时间（秒）
  },
  
  // 归档配置
  archive: {
    enabled: true,            // 是否启用归档
    archiveAfterDays: 30,     // 归档时间（天）
  },
}
```

---

## 10. 附录

### 10.1 术语表

- **历史记录**：用户转换操作的记录
- **重转换**：基于历史记录快速重新执行转换
- **归档**：将旧记录移动到归档表

### 10.2 参考资源

- 《数据库设计文档》
- 《格式转换核心引擎详细设计文档（DDD）》

---

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |
