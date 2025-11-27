# API接口详细设计 - 系统状态监控接口

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |

## 1. 文档说明

### 1.1 文档目的

本文档详细设计系统状态监控接口（`GET /api/v1/system/status`），包括接口规范、监控指标、响应格式、健康检查、性能指标、错误处理、使用示例等，为系统监控和运维提供详细指导。

### 1.2 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《RESTful API规范设计文档》
- 《系统概要设计文档（HLD）》
- 《错误处理机制详细设计文档（DDD）》

---

## 2. 接口概述

### 2.1 接口信息

| 项目 | 内容 |
| ---- | ---- |
| 接口路径 | `/api/v1/system/status` |
| HTTP方法 | `GET` |
| 接口版本 | `v1` |
| 接口描述 | 获取系统运行状态、健康检查、性能指标等信息 |
| 认证要求 | Bearer Token + API Key（可选，公开接口可无需认证） |

### 2.2 功能特性

- **系统健康检查**：检查系统各组件运行状态
- **性能指标监控**：提供系统性能指标（CPU、内存、磁盘等）
- **服务状态监控**：监控各服务模块状态（转换引擎、OCR引擎、数据库等）
- **实时统计信息**：提供系统实时统计信息（任务数、用户数等）
- **版本信息**：提供系统版本和组件版本信息

### 2.3 使用场景

- **健康检查**：负载均衡器、监控系统定期检查系统健康状态
- **运维监控**：运维人员查看系统运行状态和性能指标
- **故障诊断**：系统故障时快速定位问题组件
- **性能分析**：分析系统性能瓶颈和资源使用情况

---

## 3. 请求规范

### 3.1 请求URL

```text
GET https://api.example.com/api/v1/system/status
```

### 3.2 查询参数

| 参数 | 类型 | 必需 | 说明 | 示例 |
| ---- | ---- | ---- | ---- | ---- |
| level | string | 否 | 监控级别，默认`basic` | `basic`（基础）、`detailed`（详细）、`full`（完整） |
| include | string | 否 | 包含的监控项（逗号分隔） | `health,performance,services,statistics` |
| exclude | string | 否 | 排除的监控项（逗号分隔） | `performance` |

**监控级别说明**：

- **basic**：基础监控（健康状态、基本统计）
- **detailed**：详细监控（包含性能指标、服务状态）
- **full**：完整监控（包含所有监控项和详细信息）

**监控项说明**：

- **health**：健康检查
- **performance**：性能指标
- **services**：服务状态
- **statistics**：统计信息
- **version**：版本信息

### 3.3 请求头

| 请求头 | 类型 | 必需 | 说明 |
| ---- | ---- | ---- | ---- |
| Authorization | string | 否 | Bearer Token（可选，公开接口可无需认证） |
| X-API-Key | string | 否 | API Key（可选） |

---

## 4. 响应规范

### 4.1 响应格式

响应采用JSON格式，包含以下字段：

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-15T10:30:00Z",
    "version": {
      "api": "1.0.0",
      "system": "1.0.0"
    },
    "health": {
      "overall": "healthy",
      "checks": {
        "database": "healthy",
        "redis": "healthy",
        "conversion_engine": "healthy",
        "ocr_engine": "healthy"
      }
    },
    "performance": {
      "cpu": {
        "usage": 45.2,
        "cores": 8
      },
      "memory": {
        "used": 4096,
        "total": 16384,
        "usage": 25.0
      },
      "disk": {
        "used": 500,
        "total": 1000,
        "usage": 50.0
      }
    },
    "services": {
      "conversion_engine": {
        "status": "running",
        "version": "1.0.0",
        "uptime": 86400
      },
      "ocr_engine": {
        "status": "running",
        "version": "1.0.0",
        "uptime": 86400
      }
    },
    "statistics": {
      "tasks": {
        "total": 1000,
        "active": 50,
        "completed": 900,
        "failed": 50
      },
      "users": {
        "total": 100,
        "active": 20
      },
      "conversions": {
        "today": 500,
        "this_week": 3000,
        "this_month": 12000
      }
    }
  }
}
```

### 4.2 响应字段说明

#### 4.2.1 基础字段

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| success | boolean | 请求是否成功 |
| data | object | 监控数据 |
| data.status | string | 系统整体状态（healthy/degraded/unhealthy） |
| data.timestamp | string | 监控数据时间戳（ISO 8601格式） |

#### 4.2.2 版本信息（version）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| api | string | API版本号 |
| system | string | 系统版本号 |

#### 4.2.3 健康检查（health）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| overall | string | 整体健康状态（healthy/degraded/unhealthy） |
| checks | object | 各组件健康检查结果 |

**健康状态说明**：

- **healthy**：健康，所有组件正常运行
- **degraded**：降级，部分组件异常但不影响核心功能
- **unhealthy**：不健康，核心组件异常，系统无法正常工作

**组件健康检查项**：

- **database**：数据库连接状态
- **redis**：Redis连接状态
- **conversion_engine**：转换引擎状态
- **ocr_engine**：OCR引擎状态
- **file_storage**：文件存储状态
- **message_queue**：消息队列状态

#### 4.2.4 性能指标（performance）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| cpu | object | CPU使用情况 |
| cpu.usage | number | CPU使用率（0-100） |
| cpu.cores | number | CPU核心数 |
| memory | object | 内存使用情况 |
| memory.used | number | 已使用内存（MB） |
| memory.total | number | 总内存（MB） |
| memory.usage | number | 内存使用率（0-100） |
| disk | object | 磁盘使用情况 |
| disk.used | number | 已使用磁盘（GB） |
| disk.total | number | 总磁盘（GB） |
| disk.usage | number | 磁盘使用率（0-100） |

#### 4.2.5 服务状态（services）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| {service_name} | object | 服务状态信息 |
| {service_name}.status | string | 服务状态（running/stopped/error） |
| {service_name}.version | string | 服务版本号 |
| {service_name}.uptime | number | 服务运行时间（秒） |

#### 4.2.6 统计信息（statistics）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| tasks | object | 任务统计 |
| tasks.total | number | 总任务数 |
| tasks.active | number | 活跃任务数 |
| tasks.completed | number | 已完成任务数 |
| tasks.failed | number | 失败任务数 |
| users | object | 用户统计 |
| users.total | number | 总用户数 |
| users.active | number | 活跃用户数 |
| conversions | object | 转换统计 |
| conversions.today | number | 今日转换数 |
| conversions.this_week | number | 本周转换数 |
| conversions.this_month | number | 本月转换数 |

---

## 5. 详细设计

### 5.1 健康检查实现

#### 5.1.1 数据库健康检查

```typescript
/**
 * 检查数据库健康状态
 */
async function checkDatabaseHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
  try {
    // 执行简单查询测试连接
    const result = await db.query('SELECT 1')
    if (result) {
      return 'healthy'
    }
    return 'degraded'
  } catch (error) {
    return 'unhealthy'
  }
}
```

#### 5.1.2 Redis健康检查

```typescript
/**
 * 检查Redis健康状态
 */
async function checkRedisHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
  try {
    const result = await redis.ping()
    if (result === 'PONG') {
      return 'healthy'
    }
    return 'degraded'
  } catch (error) {
    return 'unhealthy'
  }
}
```

#### 5.1.3 转换引擎健康检查

```typescript
/**
 * 检查转换引擎健康状态
 */
async function checkConversionEngineHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
  try {
    // 检查转换引擎进程状态
    const status = await conversionEngine.getStatus()
    if (status === 'running') {
      return 'healthy'
    }
    return 'degraded'
  } catch (error) {
    return 'unhealthy'
  }
}
```

#### 5.1.4 整体健康状态计算

```typescript
/**
 * 计算整体健康状态
 */
function calculateOverallHealth(checks: Record<string, string>): 'healthy' | 'degraded' | 'unhealthy' {
  const values = Object.values(checks)
  
  // 如果有任何核心组件不健康，整体不健康
  const coreComponents = ['database', 'conversion_engine']
  const hasUnhealthyCore = coreComponents.some(comp => checks[comp] === 'unhealthy')
  if (hasUnhealthyCore) {
    return 'unhealthy'
  }
  
  // 如果有任何组件不健康，整体降级
  if (values.includes('unhealthy')) {
    return 'degraded'
  }
  
  // 如果有任何组件降级，整体降级
  if (values.includes('degraded')) {
    return 'degraded'
  }
  
  return 'healthy'
}
```

### 5.2 性能指标收集

#### 5.2.1 CPU使用率

```typescript
/**
 * 获取CPU使用率
 */
async function getCpuUsage(): Promise<{ usage: number; cores: number }> {
  const os = require('os')
  const cpus = os.cpus()
  const cores = cpus.length
  
  // 计算CPU使用率（需要两次采样）
  const loadAvg = os.loadavg()[0]
  const usage = Math.min((loadAvg / cores) * 100, 100)
  
  return {
    usage: Math.round(usage * 10) / 10,
    cores,
  }
}
```

#### 5.2.2 内存使用情况

```typescript
/**
 * 获取内存使用情况
 */
async function getMemoryUsage(): Promise<{ used: number; total: number; usage: number }> {
  const os = require('os')
  const total = os.totalmem() / (1024 * 1024) // MB
  const free = os.freemem() / (1024 * 1024) // MB
  const used = total - free
  const usage = (used / total) * 100
  
  return {
    used: Math.round(used),
    total: Math.round(total),
    usage: Math.round(usage * 10) / 10,
  }
}
```

#### 5.2.3 磁盘使用情况

```typescript
/**
 * 获取磁盘使用情况
 */
async function getDiskUsage(): Promise<{ used: number; total: number; usage: number }> {
  const fs = require('fs')
  const path = require('path')
  
  // 获取文件存储目录的磁盘使用情况
  const storagePath = config.fileStorage.path
  const stats = fs.statfsSync(storagePath)
  
  const total = (stats.blocks * stats.bsize) / (1024 * 1024 * 1024) // GB
  const free = (stats.bavail * stats.bsize) / (1024 * 1024 * 1024) // GB
  const used = total - free
  const usage = (used / total) * 100
  
  return {
    used: Math.round(used * 10) / 10,
    total: Math.round(total * 10) / 10,
    usage: Math.round(usage * 10) / 10,
  }
}
```

### 5.3 服务状态监控

#### 5.3.1 服务状态收集

```typescript
/**
 * 获取服务状态
 */
async function getServiceStatus(): Promise<Record<string, ServiceStatus>> {
  const services: Record<string, ServiceStatus> = {}
  
  // 转换引擎状态
  services.conversion_engine = await getConversionEngineStatus()
  
  // OCR引擎状态
  services.ocr_engine = await getOcrEngineStatus()
  
  // 文件存储状态
  services.file_storage = await getFileStorageStatus()
  
  // 消息队列状态
  services.message_queue = await getMessageQueueStatus()
  
  return services
}

interface ServiceStatus {
  status: 'running' | 'stopped' | 'error'
  version: string
  uptime: number
}
```

### 5.4 统计信息收集

#### 5.4.1 任务统计

```typescript
/**
 * 获取任务统计
 */
async function getTaskStatistics(): Promise<TaskStatistics> {
  // 总任务数
  const totalResult = await db.query('SELECT COUNT(*) FROM conversion_tasks')
  const total = parseInt(totalResult[0].count)
  
  // 活跃任务数
  const activeResult = await db.query(
    "SELECT COUNT(*) FROM conversion_tasks WHERE status IN ('pending', 'processing')"
  )
  const active = parseInt(activeResult[0].count)
  
  // 已完成任务数
  const completedResult = await db.query(
    "SELECT COUNT(*) FROM conversion_tasks WHERE status = 'completed'"
  )
  const completed = parseInt(completedResult[0].count)
  
  // 失败任务数
  const failedResult = await db.query(
    "SELECT COUNT(*) FROM conversion_tasks WHERE status = 'failed'"
  )
  const failed = parseInt(failedResult[0].count)
  
  return {
    total,
    active,
    completed,
    failed,
  }
}
```

#### 5.4.2 用户统计

```typescript
/**
 * 获取用户统计
 */
async function getUserStatistics(): Promise<UserStatistics> {
  // 总用户数
  const totalResult = await db.query('SELECT COUNT(*) FROM users')
  const total = parseInt(totalResult[0].count)
  
  // 活跃用户数（最近7天有活动的用户）
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const activeResult = await db.query(
    'SELECT COUNT(DISTINCT user_id) FROM conversion_tasks WHERE created_at >= $1',
    [sevenDaysAgo]
  )
  const active = parseInt(activeResult[0].count)
  
  return {
    total,
    active,
  }
}
```

#### 5.4.3 转换统计

```typescript
/**
 * 获取转换统计
 */
async function getConversionStatistics(): Promise<ConversionStatistics> {
  // 今日转换数
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayResult = await db.query(
    'SELECT COUNT(*) FROM conversion_tasks WHERE created_at >= $1',
    [today]
  )
  const todayCount = parseInt(todayResult[0].count)
  
  // 本周转换数
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekResult = await db.query(
    'SELECT COUNT(*) FROM conversion_tasks WHERE created_at >= $1',
    [weekAgo]
  )
  const weekCount = parseInt(weekResult[0].count)
  
  // 本月转换数
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const monthResult = await db.query(
    'SELECT COUNT(*) FROM conversion_tasks WHERE created_at >= $1',
    [monthAgo]
  )
  const monthCount = parseInt(monthResult[0].count)
  
  return {
    today: todayCount,
    this_week: weekCount,
    this_month: monthCount,
  }
}
```

### 5.5 接口实现

#### 5.5.1 主接口实现

```typescript
/**
 * 系统状态监控接口
 */
async function getSystemStatus(
  level: 'basic' | 'detailed' | 'full' = 'basic',
  include?: string[],
  exclude?: string[]
): Promise<SystemStatusResponse> {
  const response: SystemStatusResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: {
        api: '1.0.0',
        system: '1.0.0',
      },
    },
  }
  
  // 健康检查
  if (shouldInclude('health', include, exclude)) {
    const health = await performHealthChecks()
    response.data.health = health
    response.data.status = calculateOverallHealth(health.checks)
  }
  
  // 性能指标（详细级别以上）
  if ((level === 'detailed' || level === 'full') && shouldInclude('performance', include, exclude)) {
    response.data.performance = await collectPerformanceMetrics()
  }
  
  // 服务状态（详细级别以上）
  if ((level === 'detailed' || level === 'full') && shouldInclude('services', include, exclude)) {
    response.data.services = await getServiceStatus()
  }
  
  // 统计信息
  if (shouldInclude('statistics', include, exclude)) {
    response.data.statistics = await collectStatistics()
  }
  
  // 版本信息
  if (shouldInclude('version', include, exclude)) {
    // 版本信息已在基础字段中包含
  }
  
  return response
}

function shouldInclude(item: string, include?: string[], exclude?: string[]): boolean {
  if (exclude && exclude.includes(item)) {
    return false
  }
  if (include && !include.includes(item)) {
    return false
  }
  return true
}
```

---

## 6. 错误处理

### 6.1 错误类型

| 错误类型 | 错误码 | HTTP状态码 | 说明 |
| ---- | ---- | ---- | ---- |
| 参数错误 | E00002 | 400 | 查询参数不合法 |
| 服务不可用 | E10001 | 503 | 系统服务不可用 |

### 6.2 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "E00002",
    "message": "Invalid parameter: level",
    "details": {
      "parameter": "level",
      "value": "invalid",
      "allowed": ["basic", "detailed", "full"]
    }
  }
}
```

---

## 7. 性能优化

### 7.1 缓存策略

- **基础监控**：缓存30秒
- **详细监控**：缓存60秒
- **完整监控**：缓存120秒

```typescript
/**
 * 获取系统状态（带缓存）
 */
async function getSystemStatusCached(
  level: 'basic' | 'detailed' | 'full' = 'basic'
): Promise<SystemStatusResponse> {
  const cacheKey = `system:status:${level}`
  const cacheTTL = level === 'basic' ? 30 : level === 'detailed' ? 60 : 120
  
  // 尝试从缓存获取
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // 从系统获取
  const status = await getSystemStatus(level)
  
  // 写入缓存
  await redis.setex(cacheKey, cacheTTL, JSON.stringify(status))
  
  return status
}
```

### 7.2 异步收集

对于详细和完整级别的监控，使用异步方式收集各项指标，避免阻塞：

```typescript
/**
 * 异步收集监控数据
 */
async function collectMonitoringData(
  level: 'basic' | 'detailed' | 'full'
): Promise<MonitoringData> {
  const promises: Promise<any>[] = []
  
  // 并行收集各项数据
  promises.push(performHealthChecks())
  if (level === 'detailed' || level === 'full') {
    promises.push(collectPerformanceMetrics())
    promises.push(getServiceStatus())
  }
  promises.push(collectStatistics())
  
  const [health, performance, services, statistics] = await Promise.all(promises)
  
  return {
    health,
    performance,
    services,
    statistics,
  }
}
```

---

## 8. 安全考虑

### 8.1 访问控制

- **公开接口**：基础监控可公开访问（无需认证）
- **详细监控**：详细和完整监控需要认证
- **敏感信息**：某些敏感信息（如详细错误信息）仅管理员可见

### 8.2 信息脱敏

- **用户信息**：统计信息中不包含具体用户数据
- **系统路径**：不暴露系统内部路径
- **配置信息**：不暴露敏感配置信息

---

## 9. 使用示例

### 9.1 基础健康检查

```bash
# 请求
curl -X GET "https://api.example.com/api/v1/system/status?level=basic"

# 响应
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-15T10:30:00Z",
    "version": {
      "api": "1.0.0",
      "system": "1.0.0"
    },
    "health": {
      "overall": "healthy",
      "checks": {
        "database": "healthy",
        "redis": "healthy",
        "conversion_engine": "healthy"
      }
    },
    "statistics": {
      "tasks": {
        "total": 1000,
        "active": 50,
        "completed": 900,
        "failed": 50
      }
    }
  }
}
```

### 9.2 详细监控

```bash
# 请求
curl -X GET "https://api.example.com/api/v1/system/status?level=detailed" \
  -H "Authorization: Bearer {token}" \
  -H "X-API-Key: {api_key}"

# 响应（包含性能指标和服务状态）
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-15T10:30:00Z",
    "health": { ... },
    "performance": {
      "cpu": {
        "usage": 45.2,
        "cores": 8
      },
      "memory": {
        "used": 4096,
        "total": 16384,
        "usage": 25.0
      },
      "disk": {
        "used": 500,
        "total": 1000,
        "usage": 50.0
      }
    },
    "services": {
      "conversion_engine": {
        "status": "running",
        "version": "1.0.0",
        "uptime": 86400
      }
    },
    "statistics": { ... }
  }
}
```

### 9.3 指定监控项

```bash
# 只获取健康检查和统计信息
curl -X GET "https://api.example.com/api/v1/system/status?include=health,statistics"
```

---

## 10. 监控告警

### 10.1 告警规则

- **系统不健康**：overall状态为`unhealthy`时告警
- **CPU使用率高**：CPU使用率>80%时告警
- **内存使用率高**：内存使用率>85%时告警
- **磁盘空间不足**：磁盘使用率>90%时告警
- **服务异常**：任何服务状态为`error`时告警

### 10.2 告警集成

系统状态监控接口可以与监控系统（如Prometheus、Grafana）集成，定期调用接口获取监控数据。

---

## 11. 附录

### 11.1 监控指标说明

| 指标 | 说明 | 单位 | 正常范围 |
| ---- | ---- | ---- | ---- |
| CPU使用率 | CPU使用百分比 | % | <80% |
| 内存使用率 | 内存使用百分比 | % | <85% |
| 磁盘使用率 | 磁盘使用百分比 | % | <90% |
| 任务完成率 | 任务完成百分比 | % | >95% |

### 11.2 健康状态说明

| 状态 | 说明 | 处理建议 |
| ---- | ---- | ---- |
| healthy | 系统健康，所有组件正常 | 无需处理 |
| degraded | 系统降级，部分组件异常 | 检查异常组件，准备修复 |
| unhealthy | 系统不健康，核心组件异常 | 立即处理，系统可能无法正常工作 |

---

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |
