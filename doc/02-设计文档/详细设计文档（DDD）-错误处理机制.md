# 错误处理机制详细设计文档（DDD）

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 架构师 |

## 1. 文档说明

### 1.1 文档目的

本文档详细描述错误处理机制的设计，包括统一的错误码体系、异常捕获机制、错误提示机制、错误恢复策略等，为系统各模块提供统一的错误处理方案。

### 1.2 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《系统概要设计文档（HLD）》
- 《技术选型方案文档》

---

## 2. 模块概述

### 2.1 模块定位

错误处理机制是系统的基础支撑模块，为所有业务模块提供统一的错误处理、异常捕获、错误提示和错误恢复能力。

### 2.2 功能职责

- **统一错误码体系**：定义系统统一的错误码和错误消息
- **异常捕获机制**：统一的异常捕获和处理流程
- **错误分类管理**：按错误类型和严重程度分类管理
- **错误日志记录**：记录错误信息用于问题排查
- **错误提示机制**：向用户提供友好的错误提示
- **错误恢复策略**：定义错误恢复和重试机制
- **错误监控告警**：监控错误率并触发告警

### 2.3 设计原则

- **统一性**：所有模块使用统一的错误处理机制
- **可追溯性**：错误信息包含足够的上下文信息
- **用户友好**：向用户提供清晰、可操作的错误提示
- **可恢复性**：支持错误恢复和重试机制
- **可监控性**：错误信息可用于监控和告警

---

## 3. 架构设计

### 3.1 模块架构

```text
错误处理机制
  ├── 错误码管理器（ErrorCodeManager）
  │   ├── 错误码定义
  │   ├── 错误消息管理
  │   └── 多语言支持
  │
  ├── 异常捕获器（ExceptionCatcher）
  │   ├── 全局异常捕获
  │   ├── 异步异常捕获
  │   └── 边界异常捕获
  │
  ├── 错误分类器（ErrorClassifier）
  │   ├── 错误类型分类
  │   ├── 错误级别分类
  │   └── 错误严重程度评估
  │
  ├── 错误记录器（ErrorLogger）
  │   ├── 错误日志记录
  │   ├── 错误上下文收集
  │   └── 错误统计分析
  │
  ├── 错误提示器（ErrorNotifier）
  │   ├── 用户错误提示
  │   ├── 错误消息格式化
  │   └── 多语言错误消息
  │
  ├── 错误恢复器（ErrorRecovery）
  │   ├── 重试机制
  │   ├── 降级策略
  │   └── 容错处理
  │
  └── 错误监控器（ErrorMonitor）
      ├── 错误率统计
      ├── 错误趋势分析
      └── 告警触发
```

### 3.2 核心组件说明

#### 3.2.1 错误码管理器（ErrorCodeManager）

**职责**：管理统一的错误码体系

**功能**：

- 定义和维护错误码
- 管理错误消息（支持多语言）
- 提供错误码查询接口

#### 3.2.2 异常捕获器（ExceptionCatcher）

**职责**：捕获和处理系统异常

**功能**：

- 全局异常捕获
- 异步异常捕获
- 边界异常捕获（API边界、模块边界）

#### 3.2.3 错误分类器（ErrorClassifier）

**职责**：对错误进行分类和评估

**功能**：

- 按错误类型分类
- 按错误级别分类
- 评估错误严重程度

#### 3.2.4 错误记录器（ErrorLogger）

**职责**：记录错误信息用于问题排查

**功能**：

- 记录错误日志
- 收集错误上下文
- 统计分析错误

#### 3.2.5 错误提示器（ErrorNotifier）

**职责**：向用户提供友好的错误提示

**功能**：

- 格式化错误消息
- 多语言错误消息
- 提供操作建议

#### 3.2.6 错误恢复器（ErrorRecovery）

**职责**：处理错误恢复和重试

**功能**：

- 重试机制
- 降级策略
- 容错处理

#### 3.2.7 错误监控器（ErrorMonitor）

**职责**：监控错误并触发告警

**功能**：

- 统计错误率
- 分析错误趋势
- 触发告警

---

## 4. 错误码体系设计

### 4.1 错误码结构

#### 4.1.1 错误码格式

```text
错误码格式：E[模块][序号]
- E：错误码前缀
- [模块]：2位数字，表示模块编号
- [序号]：3位数字，表示错误序号

示例：
- E01001：格式转换模块，错误序号001
- E02001：文件上传模块，错误序号001
- E03001：OCR识别模块，错误序号001
```

#### 4.1.2 模块编号定义

| 模块编号 | 模块名称 | 说明 |
| ---- | ---- | ---- |
| 00 | 系统通用 | 系统级错误 |
| 01 | 格式转换 | 格式转换相关错误 |
| 02 | 文件上传 | 文件上传相关错误 |
| 03 | OCR识别 | OCR识别相关错误 |
| 04 | 批量处理 | 批量处理相关错误 |
| 05 | 缓存管理 | 缓存管理相关错误 |
| 06 | 用户管理 | 用户管理相关错误 |
| 07 | AI辅助 | AI辅助功能相关错误 |
| 08 | API接口 | API接口相关错误 |
| 09 | 数据库 | 数据库相关错误 |
| 10 | 文件存储 | 文件存储相关错误 |

### 4.2 错误级别定义

#### 4.2.1 错误级别

| 级别 | 代码 | 说明 | 处理方式 |
| ---- | ---- | ---- | ---- |
| 致命错误 | FATAL | 系统无法继续运行 | 立即停止，记录日志，告警 |
| 严重错误 | ERROR | 功能无法正常完成 | 返回错误，记录日志，告警 |
| 警告 | WARN | 功能可降级完成 | 记录警告，继续执行 |
| 信息 | INFO | 一般性信息 | 记录信息，正常执行 |

### 4.3 错误码列表

#### 4.3.1 系统通用错误（E00xxx）

| 错误码 | 错误级别 | 错误消息 | 说明 |
| ---- | ---- | ---- | ---- |
| E00001 | FATAL | 系统内部错误 | 系统内部未知错误 |
| E00002 | ERROR | 参数错误 | 请求参数不合法 |
| E00003 | ERROR | 权限不足 | 用户无权限执行操作 |
| E00004 | ERROR | 资源不存在 | 请求的资源不存在 |
| E00005 | ERROR | 操作超时 | 操作执行超时 |
| E00006 | ERROR | 服务不可用 | 服务暂时不可用 |
| E00007 | WARN | 配置错误 | 系统配置错误 |
| E00008 | ERROR | 网络错误 | 网络连接失败 |

#### 4.3.2 格式转换错误（E01xxx）

| 错误码 | 错误级别 | 错误消息 | 说明 |
| ---- | ---- | ---- | ---- |
| E01001 | ERROR | 格式不支持 | 源格式或目标格式不支持 |
| E01002 | ERROR | 文件损坏 | 源文件损坏或无法读取 |
| E01003 | ERROR | 转换失败 | 转换过程失败 |
| E01004 | ERROR | 转换超时 | 转换执行超时 |
| E01005 | WARN | 格式保真度降低 | 转换后格式保真度降低 |
| E01006 | ERROR | 引擎不可用 | 转换引擎不可用 |
| E01007 | ERROR | 内存不足 | 转换过程内存不足 |

#### 4.3.3 文件上传错误（E02xxx）

| 错误码 | 错误级别 | 错误消息 | 说明 |
| ---- | ---- | ---- | ---- |
| E02001 | ERROR | 文件格式不支持 | 文件格式不在支持列表中 |
| E02002 | ERROR | 文件过大 | 文件大小超过限制 |
| E02003 | ERROR | 文件损坏 | 文件损坏或无法读取 |
| E02004 | ERROR | 上传失败 | 文件上传失败 |
| E02005 | ERROR | 存储空间不足 | 存储空间不足 |
| E02006 | WARN | 文件名包含特殊字符 | 文件名包含特殊字符 |
| E02007 | ERROR | 文件包含恶意内容 | 文件包含恶意内容 |

#### 4.3.4 OCR识别错误（E03xxx）

| 错误码 | 错误级别 | 错误消息 | 说明 |
| ---- | ---- | ---- | ---- |
| E03001 | ERROR | OCR引擎不可用 | OCR引擎不可用 |
| E03002 | ERROR | 图像质量过低 | 图像质量过低无法识别 |
| E03003 | ERROR | 识别失败 | OCR识别失败 |
| E03004 | ERROR | 语言不支持 | 不支持的语言 |
| E03005 | WARN | 识别准确度低 | 识别准确度低于预期 |

#### 4.3.5 批量处理错误（E04xxx）

| 错误码 | 错误级别 | 错误消息 | 说明 |
| ---- | ---- | ---- | ---- |
| E04001 | ERROR | 批量任务创建失败 | 批量任务创建失败 |
| E04002 | ERROR | 任务队列已满 | 任务队列已满 |
| E04003 | WARN | 部分任务失败 | 批量任务中部分任务失败 |
| E04004 | ERROR | 并发数超限 | 并发处理数超过限制 |

#### 4.3.6 缓存管理错误（E05xxx）

| 错误码 | 错误级别 | 错误消息 | 说明 |
| ---- | ---- | ---- | ---- |
| E05001 | WARN | 缓存写入失败 | 缓存写入失败 |
| E05002 | WARN | 缓存读取失败 | 缓存读取失败 |
| E05003 | WARN | 临时文件清理失败 | 临时文件清理失败 |
| E05004 | ERROR | 存储空间不足 | 存储空间不足 |

### 4.4 错误消息管理

#### 4.4.1 错误消息结构

```typescript
interface ErrorMessage {
  code: string;              // 错误码
  message: string;           // 错误消息（默认语言）
  messageI18n: {             // 多语言消息
    zh_CN: string;          // 简体中文
    zh_TW: string;          // 繁体中文
    en: string;             // 英文
    ja: string;             // 日文
    ko: string;             // 韩文
  };
  level: ErrorLevel;         // 错误级别
  category: ErrorCategory;   // 错误类别
  recoverable: boolean;     // 是否可恢复
  retryable: boolean;       // 是否可重试
  suggestion?: string;      // 操作建议
}
```

#### 4.4.2 错误消息定义

```typescript
const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  E01001: {
    code: 'E01001',
    message: '格式不支持',
    messageI18n: {
      zh_CN: '格式不支持',
      zh_TW: '格式不支援',
      en: 'Format not supported',
      ja: 'フォーマットがサポートされていません',
      ko: '형식이 지원되지 않습니다',
    },
    level: 'ERROR',
    category: 'FORMAT',
    recoverable: false,
    retryable: false,
    suggestion: '请检查文件格式，确保使用支持的格式',
  },
  // ... 其他错误消息
};
```

---

## 5. 异常捕获机制

### 5.1 异常捕获层次

#### 5.1.1 捕获层次

```text
应用层异常捕获
  ├── 全局异常处理器（Global Exception Handler）
  │   ├── 未捕获异常
  │   ├── Promise rejection
  │   └── 进程异常
  │
  ├── API层异常捕获（API Exception Handler）
  │   ├── HTTP请求异常
  │   ├── 参数验证异常
  │   └── 业务逻辑异常
  │
  ├── 服务层异常捕获（Service Exception Handler）
  │   ├── 业务逻辑异常
  │   ├── 数据访问异常
  │   └── 外部服务异常
  │
  └── 数据层异常捕获（Data Exception Handler）
      ├── 数据库异常
      ├── 文件系统异常
      └── 网络异常
```

### 5.2 全局异常捕获

#### 5.2.1 Node.js全局异常捕获

```typescript
/**
 * 全局异常捕获
 */
process.on('uncaughtException', (error: Error) => {
  errorHandler.handleFatalError(error, {
    type: 'uncaughtException',
    timestamp: new Date(),
  });
  
  // 致命错误，记录后退出
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  errorHandler.handleError(reason, {
    type: 'unhandledRejection',
    timestamp: new Date(),
    promise,
  });
});
```

#### 5.2.2 Express/Fastify异常捕获

```typescript
/**
 * API异常捕获中间件
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorInfo = errorHandler.captureError(error, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  
  const statusCode = errorHandler.getStatusCode(errorInfo);
  const response = errorHandler.formatErrorResponse(errorInfo);
  
  res.status(statusCode).json(response);
});
```

### 5.3 异步异常捕获

#### 5.3.1 Promise异常捕获

```typescript
/**
 * Promise异常捕获包装器
 */
function asyncHandler<T>(
  fn: (...args: any[]) => Promise<T>
): (...args: any[]) => Promise<T> {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.handleError(error, {
        function: fn.name,
        args: args,
      });
      throw error;
    }
  };
}

// 使用示例
const convertFile = asyncHandler(async (fileId: string, targetFormat: string) => {
  // 转换逻辑
});
```

#### 5.3.2 异步任务异常捕获

```typescript
/**
 * 异步任务异常捕获
 */
class AsyncTaskManager {
  async executeTask<T>(task: () => Promise<T>): Promise<T> {
    try {
      return await task();
    } catch (error) {
      errorHandler.handleError(error, {
        task: task.name,
        timestamp: new Date(),
      });
      throw error;
    }
  }
  
  async executeBatch<T>(
    tasks: Array<() => Promise<T>>
  ): Promise<Array<{ success: boolean; result?: T; error?: Error }>> {
    const results = await Promise.allSettled(
      tasks.map(task => this.executeTask(task))
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { success: true, result: result.value };
      } else {
        errorHandler.handleError(result.reason, {
          taskIndex: index,
        });
        return { success: false, error: result.reason };
      }
    });
  }
}
```

### 5.4 边界异常捕获

#### 5.4.1 模块边界异常捕获

```typescript
/**
 * 模块边界异常捕获装饰器
 */
function moduleBoundary(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function (...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      errorHandler.handleError(error, {
        module: target.constructor.name,
        method: propertyKey,
        boundary: 'module',
      });
      throw error;
    }
  };
  
  return descriptor;
}

// 使用示例
class ConversionService {
  @moduleBoundary
  async convertFile(fileId: string, targetFormat: string) {
    // 转换逻辑
  }
}
```

---

## 6. 错误分类和评估

### 6.1 错误分类

#### 6.1.1 按错误类型分类

| 错误类型 | 说明 | 示例 |
| ---- | ---- | ---- |
| 业务错误 | 业务逻辑错误 | 格式不支持、文件过大 |
| 系统错误 | 系统内部错误 | 内存不足、服务不可用 |
| 网络错误 | 网络相关错误 | 连接超时、网络中断 |
| 数据错误 | 数据相关错误 | 数据格式错误、数据不存在 |
| 权限错误 | 权限相关错误 | 权限不足、认证失败 |
| 配置错误 | 配置相关错误 | 配置缺失、配置错误 |

#### 6.1.2 按错误来源分类

| 错误来源 | 说明 | 示例 |
| ---- | ---- | ---- |
| 用户输入 | 用户输入错误 | 参数错误、文件格式错误 |
| 系统内部 | 系统内部错误 | 内存不足、服务异常 |
| 外部服务 | 外部服务错误 | OCR服务不可用、AI服务失败 |
| 资源限制 | 资源限制错误 | 存储空间不足、并发数超限 |

### 6.2 错误严重程度评估

#### 6.2.1 严重程度级别

| 严重程度 | 级别 | 说明 | 处理优先级 |
| ---- | ---- | ---- | ---- |
| 致命 | CRITICAL | 系统无法运行 | P0 |
| 严重 | HIGH | 核心功能不可用 | P0 |
| 中等 | MEDIUM | 部分功能受影响 | P1 |
| 轻微 | LOW | 功能降级但可用 | P2 |
| 信息 | INFO | 仅记录信息 | P3 |

#### 6.2.2 严重程度评估算法

```typescript
/**
 * 评估错误严重程度
 */
function assessSeverity(error: Error, context: ErrorContext): SeverityLevel {
  let score = 0;
  
  // 错误级别评分
  if (error.level === 'FATAL') score += 10;
  else if (error.level === 'ERROR') score += 5;
  else if (error.level === 'WARN') score += 2;
  
  // 影响范围评分
  if (context.affectedUsers > 100) score += 5;
  else if (context.affectedUsers > 10) score += 3;
  else if (context.affectedUsers > 1) score += 1;
  
  // 功能重要性评分
  if (context.isCoreFunction) score += 5;
  else if (context.isImportantFunction) score += 3;
  
  // 可恢复性评分
  if (!error.recoverable) score += 3;
  
  // 确定严重程度
  if (score >= 15) return 'CRITICAL';
  else if (score >= 10) return 'HIGH';
  else if (score >= 5) return 'MEDIUM';
  else if (score >= 2) return 'LOW';
  else return 'INFO';
}
```

---

## 7. 错误记录和日志

### 7.1 错误日志结构

#### 7.1.1 日志格式

```typescript
interface ErrorLog {
  timestamp: Date;           // 时间戳
  errorCode: string;         // 错误码
  errorLevel: ErrorLevel;    // 错误级别
  severity: SeverityLevel;   // 严重程度
  message: string;           // 错误消息
  stack?: string;            // 堆栈信息
  context: {                 // 上下文信息
    requestId?: string;      // 请求ID
    userId?: string;         // 用户ID
    sessionId?: string;       // 会话ID
    module: string;          // 模块名称
    function: string;        // 函数名称
    parameters?: any;        // 参数信息
    environment?: string;    // 环境信息
  };
  metadata?: {              // 元数据
    userAgent?: string;
    ip?: string;
    url?: string;
    method?: string;
  };
}
```

### 7.2 错误日志记录

#### 7.2.1 日志记录实现

```typescript
/**
 * 错误日志记录器
 */
class ErrorLogger {
  async logError(error: Error, context: ErrorContext): Promise<void> {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      errorCode: error.code,
      errorLevel: error.level,
      severity: assessSeverity(error, context),
      message: error.message,
      stack: error.stack,
      context: {
        requestId: context.requestId,
        userId: context.userId,
        sessionId: context.sessionId,
        module: context.module,
        function: context.function,
        parameters: context.parameters,
        environment: process.env.NODE_ENV,
      },
      metadata: context.metadata,
    };
    
    // 记录到文件
    await this.writeToFile(errorLog);
    
    // 记录到数据库（企业版）
    if (this.isEnterprise) {
      await this.writeToDatabase(errorLog);
    }
    
    // 发送到监控系统（严重错误）
    if (errorLog.severity === 'CRITICAL' || errorLog.severity === 'HIGH') {
      await this.sendToMonitoring(errorLog);
    }
  }
  
  private async writeToFile(errorLog: ErrorLog): Promise<void> {
    const logLine = JSON.stringify(errorLog) + '\n';
    await fs.appendFile(this.logFilePath, logLine);
  }
}
```

### 7.3 错误统计分析

#### 7.3.1 错误统计

```typescript
/**
 * 错误统计分析
 */
class ErrorStatistics {
  private errorCounts: Map<string, number> = new Map();
  private errorTimeline: Array<{ timestamp: Date; errorCode: string }> = [];
  
  recordError(errorCode: string): void {
    const count = this.errorCounts.get(errorCode) || 0;
    this.errorCounts.set(errorCode, count + 1);
    
    this.errorTimeline.push({
      timestamp: new Date(),
      errorCode,
    });
  }
  
  getErrorRate(timeWindow: number = 3600): number {
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindow * 1000);
    
    const errorsInWindow = this.errorTimeline.filter(
      entry => entry.timestamp >= windowStart
    );
    
    return errorsInWindow.length / timeWindow;
  }
  
  getTopErrors(limit: number = 10): Array<{ errorCode: string; count: number }> {
    return Array.from(this.errorCounts.entries())
      .map(([errorCode, count]) => ({ errorCode, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
```

---

## 8. 错误提示机制

### 8.1 用户错误提示

#### 8.1.1 错误提示格式

```typescript
interface UserErrorPrompt {
  title: string;            // 错误标题
  message: string;          // 错误消息
  code: string;            // 错误码
  suggestion?: string;     // 操作建议
  actions?: Array<{        // 可执行操作
    label: string;
    action: string;
  }>;
  helpLink?: string;        // 帮助链接
}
```

#### 8.1.2 错误提示生成

```typescript
/**
 * 生成用户错误提示
 */
function generateUserPrompt(
  error: Error,
  locale: string = 'zh_CN'
): UserErrorPrompt {
  const errorMessage = getErrorMessage(error.code, locale);
  
  return {
    title: errorMessage.title || '操作失败',
    message: errorMessage.message,
    code: error.code,
    suggestion: errorMessage.suggestion,
    actions: getErrorActions(error),
    helpLink: getHelpLink(error.code),
  };
}
```

### 8.2 多语言错误消息

#### 8.2.1 多语言支持

```typescript
/**
 * 获取多语言错误消息
 */
function getErrorMessage(errorCode: string, locale: string): string {
  const errorDef = ERROR_MESSAGES[errorCode];
  if (!errorDef) {
    return ERROR_MESSAGES['E00001'].messageI18n[locale] || '未知错误';
  }
  
  return errorDef.messageI18n[locale] || errorDef.message;
}
```

### 8.3 错误提示UI组件

#### 8.3.1 前端错误提示

```typescript
/**
 * 错误提示组件（React示例）
 */
function ErrorPrompt({ error }: { error: Error }) {
  const prompt = generateUserPrompt(error, getLocale());
  
  return (
    <Alert
      type="error"
      message={prompt.title}
      description={
        <div>
          <p>{prompt.message}</p>
          {prompt.suggestion && <p>建议：{prompt.suggestion}</p>}
          {prompt.helpLink && (
            <a href={prompt.helpLink}>查看帮助文档</a>
          )}
        </div>
      }
      action={
        prompt.actions?.map(action => (
          <Button key={action.action} onClick={() => handleAction(action.action)}>
            {action.label}
          </Button>
        ))
      }
    />
  );
}
```

---

## 9. 错误恢复机制

### 9.1 重试机制

#### 9.1.1 重试策略

```typescript
/**
 * 重试配置
 */
interface RetryConfig {
  maxRetries: number;       // 最大重试次数
  initialDelay: number;     // 初始延迟（毫秒）
  maxDelay: number;         // 最大延迟（毫秒）
  backoffFactor: number;    // 退避因子
  retryableErrors: string[]; // 可重试的错误码
}

/**
 * 重试执行器
 */
async function retry<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error;
  let delay = config.initialDelay;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 检查是否可重试
      if (!isRetryable(error, config.retryableErrors)) {
        throw error;
      }
      
      // 最后一次尝试失败，抛出错误
      if (attempt === config.maxRetries) {
        throw error;
      }
      
      // 等待后重试
      await sleep(delay);
      delay = Math.min(delay * config.backoffFactor, config.maxDelay);
    }
  }
  
  throw lastError!;
}
```

#### 9.1.2 可重试错误判断

```typescript
/**
 * 判断错误是否可重试
 */
function isRetryable(error: Error, retryableErrors: string[]): boolean {
  // 网络错误、超时错误、临时服务不可用等可重试
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /temporary/i,
    /unavailable/i,
    /ECONNRESET/i,
    /ETIMEDOUT/i,
  ];
  
  // 检查错误码
  if (retryableErrors.includes(error.code)) {
    return true;
  }
  
  // 检查错误消息
  if (retryablePatterns.some(pattern => pattern.test(error.message))) {
    return true;
  }
  
  return false;
}
```

### 9.2 降级策略

#### 9.2.1 降级策略定义

```typescript
/**
 * 降级策略
 */
interface FallbackStrategy {
  errorCode: string;        // 触发降级的错误码
  fallbackAction: () => Promise<any>; // 降级操作
  condition?: (context: any) => boolean; // 降级条件
}

/**
 * 降级执行器
 */
async function executeWithFallback<T>(
  primaryAction: () => Promise<T>,
  fallbackStrategies: FallbackStrategy[],
  context?: any
): Promise<T> {
  try {
    return await primaryAction();
  } catch (error) {
    // 查找匹配的降级策略
    const strategy = fallbackStrategies.find(
      s => s.errorCode === error.code &&
        (!s.condition || s.condition(context))
    );
    
    if (strategy) {
      console.warn(`执行降级策略: ${error.code}`);
      return await strategy.fallbackAction();
    }
    
    throw error;
  }
}
```

#### 9.2.2 降级策略示例

```typescript
// OCR识别降级：在线OCR失败时使用离线OCR
const ocrFallbackStrategies: FallbackStrategy[] = [
  {
    errorCode: 'E03001', // OCR引擎不可用
    fallbackAction: async () => {
      return await offlineOCR.recognize(image);
    },
  },
];

// AI服务降级：AI服务失败时返回空结果
const aiFallbackStrategies: FallbackStrategy[] = [
  {
    errorCode: 'E07001', // AI服务不可用
    fallbackAction: async () => {
      return { summary: '', structured: null };
    },
  },
];
```

### 9.3 容错处理

#### 9.3.1 容错处理策略

```typescript
/**
 * 容错处理
 */
async function executeWithFaultTolerance<T>(
  action: () => Promise<T>,
  options: {
    timeout?: number;
    circuitBreaker?: CircuitBreaker;
    bulkhead?: Bulkhead;
  }
): Promise<T> {
  // 超时控制
  if (options.timeout) {
    return await Promise.race([
      action(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('操作超时')), options.timeout)
      ),
    ]);
  }
  
  // 熔断器
  if (options.circuitBreaker) {
    return await options.circuitBreaker.execute(action);
  }
  
  // 隔离舱
  if (options.bulkhead) {
    return await options.bulkhead.execute(action);
  }
  
  return await action();
}
```

---

## 10. 错误监控和告警

### 10.1 错误监控

#### 10.1.1 错误率监控

```typescript
/**
 * 错误率监控
 */
class ErrorRateMonitor {
  private errorCounts: Map<string, number> = new Map();
  private requestCounts: Map<string, number> = new Map();
  
  recordRequest(endpoint: string): void {
    const count = this.requestCounts.get(endpoint) || 0;
    this.requestCounts.set(endpoint, count + 1);
  }
  
  recordError(endpoint: string, errorCode: string): void {
    const count = this.errorCounts.get(endpoint) || 0;
    this.errorCounts.set(endpoint, count + 1);
  }
  
  getErrorRate(endpoint: string): number {
    const errors = this.errorCounts.get(endpoint) || 0;
    const requests = this.requestCounts.get(endpoint) || 0;
    
    return requests > 0 ? errors / requests : 0;
  }
  
  checkThreshold(endpoint: string, threshold: number = 0.1): boolean {
    return this.getErrorRate(endpoint) > threshold;
  }
}
```

### 10.2 告警机制

#### 10.2.1 告警触发

```typescript
/**
 * 告警管理器
 */
class AlertManager {
  async checkAndAlert(): Promise<void> {
    const errorRate = errorRateMonitor.getErrorRate('all');
    
    // 错误率超过阈值，触发告警
    if (errorRate > 0.1) {
      await this.sendAlert({
        type: 'ERROR_RATE_HIGH',
        message: `错误率过高: ${(errorRate * 100).toFixed(2)}%`,
        severity: 'HIGH',
      });
    }
    
    // 检查严重错误
    const criticalErrors = await this.getCriticalErrors();
    if (criticalErrors.length > 0) {
      await this.sendAlert({
        type: 'CRITICAL_ERROR',
        message: `发现 ${criticalErrors.length} 个严重错误`,
        severity: 'CRITICAL',
        errors: criticalErrors,
      });
    }
  }
  
  private async sendAlert(alert: Alert): Promise<void> {
    // 发送到监控系统
    await monitoringService.sendAlert(alert);
    
    // 发送通知（邮件、短信等）
    if (alert.severity === 'CRITICAL') {
      await notificationService.sendCriticalAlert(alert);
    }
  }
}
```

---

## 11. 错误处理最佳实践

### 11.1 错误处理原则

1. **尽早捕获**：在错误发生的地方立即捕获
2. **统一处理**：使用统一的错误处理机制
3. **记录上下文**：记录足够的上下文信息
4. **用户友好**：向用户提供清晰的错误提示
5. **可恢复性**：尽可能支持错误恢复和重试
6. **可监控性**：错误信息可用于监控和告警

### 11.2 错误处理模式

#### 11.2.1 错误处理模式

```typescript
// 模式1：Try-Catch模式
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  errorHandler.handleError(error, context);
  throw errorHandler.formatError(error);
}

// 模式2：Result模式
const result = await riskyOperation();
if (result.success) {
  return result.data;
} else {
  errorHandler.handleError(result.error, context);
  throw errorHandler.formatError(result.error);
}

// 模式3：装饰器模式
@errorHandler
async function riskyOperation() {
  // 操作逻辑
}
```

---

## 12. 测试设计

### 12.1 单元测试

- **错误码测试**：测试错误码定义和查询
- **异常捕获测试**：测试异常捕获机制
- **错误分类测试**：测试错误分类和评估
- **错误恢复测试**：测试重试和降级机制

### 12.2 集成测试

- **端到端错误处理测试**：测试完整的错误处理流程
- **错误监控测试**：测试错误监控和告警
- **多语言错误消息测试**：测试多语言错误消息

---

## 13. 部署说明

### 13.1 配置

```typescript
const errorHandlingConfig = {
  // 错误日志配置
  logging: {
    enabled: true,
    level: 'ERROR',
    filePath: './logs/error.log',
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 10,
  },
  
  // 错误监控配置
  monitoring: {
    enabled: true,
    errorRateThreshold: 0.1, // 10%
    alertInterval: 300, // 5分钟
  },
  
  // 重试配置
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  },
};
```

---

## 14. 附录

### 14.1 术语表

- **错误码**：系统定义的唯一错误标识
- **错误级别**：错误的严重程度级别
- **错误恢复**：错误发生后的恢复机制
- **降级策略**：主功能失败时的备用方案
- **熔断器**：防止级联故障的机制

### 14.2 参考资源

- [Node.js Error Handling Best Practices](https://nodejs.org/en/docs/guides/error-handling/)
- [Error Handling in Express](https://expressjs.com/en/guide/error-handling.html)

---

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 架构师 |
