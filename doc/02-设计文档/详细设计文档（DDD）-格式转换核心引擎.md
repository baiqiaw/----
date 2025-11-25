# 格式转换核心引擎详细设计文档（DDD）

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 核心开发 |

## 1. 文档说明

### 1.1 文档目的

本文档详细描述格式转换核心引擎模块的设计，包括架构设计、接口定义、算法流程、错误处理等，为开发实现提供详细指导。

### 1.2 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《系统概要设计文档（HLD）》
- 《技术选型方案文档》

---

## 2. 模块概述

### 2.1 模块定位

格式转换核心引擎是文档转换工具的核心模块，负责执行各种文档格式之间的转换，确保转换质量和格式保真度。

### 2.2 功能职责

- **格式识别**：自动识别输入文件的格式类型
- **转换执行**：执行不同格式之间的转换
- **格式保真**：保持原文档的格式、样式、布局
- **参数配置**：支持转换参数的自定义配置
- **质量验证**：验证转换结果的正确性

### 2.3 支持的转换路径

| 输入格式 | 输出格式 | 转换引擎 | 优先级 |
| ---- | ---- | ---- | ---- |
| Word (.doc/.docx) | PDF | LibreOffice | P0 |
| Word (.doc/.docx) | MD | Pandoc | P0 |
| Word (.doc/.docx) | Excel | LibreOffice | P1 |
| Word (.doc/.docx) | TXT | LibreOffice | P0 |
| Word (.doc/.docx) | 图片 (JPG/PNG) | LibreOffice + Sharp | P1 |
| Excel (.xls/.xlsx) | PDF | LibreOffice | P0 |
| Excel (.xls/.xlsx) | MD | Pandoc + 自研 | P0 |
| Excel (.xls/.xlsx) | Word | LibreOffice | P1 |
| Excel (.xls/.xlsx) | CSV | LibreOffice | P0 |
| Excel (.xls/.xlsx) | HTML | LibreOffice | P1 |
| PDF（可编辑） | Word | pdf2docx | P0 |
| PDF（可编辑） | MD | Poppler + Pandoc | P0 |
| PDF（可编辑） | Excel | Poppler + 自研 | P1 |
| PDF（可编辑） | TXT | Poppler | P0 |
| PDF（可编辑） | PPT | Poppler + LibreOffice | P1 |
| PDF（扫描件） | Word | OCR + 格式化 | P0 |
| PDF（扫描件） | MD | OCR + 格式化 | P0 |
| PDF（扫描件） | TXT | OCR | P0 |
| PPT (.ppt/.pptx) | PDF | LibreOffice | P0 |
| PPT (.ppt/.pptx) | 图片 | LibreOffice + Sharp | P0 |
| PPT (.ppt/.pptx) | Word | LibreOffice | P1 |
| PPT (.ppt/.pptx) | MD | LibreOffice + Pandoc | P1 |
| 图片 (JPG/PNG/TIFF) | PDF | Sharp | P0 |
| 图片 (JPG/PNG/TIFF) | Word | OCR + 格式化 | P0 |
| 图片 (JPG/PNG/TIFF) | MD | OCR + 格式化 | P0 |
| 图片 (JPG/PNG/TIFF) | TXT | OCR | P0 |
| MD (.md) | Word | Pandoc | P0 |
| MD (.md) | PDF | Pandoc | P0 |
| MD (.md) | HTML | markdown-it | P0 |
| MD (.md) | PPT | Pandoc | P1 |

---

## 3. 架构设计

### 3.1 模块架构

```text
格式转换核心引擎
  ├── 格式识别器（FormatDetector）
  │   ├── 文件扩展名识别
  │   ├── MIME类型识别
  │   └── 文件内容识别
  │
  ├── 转换路由（ConversionRouter）
  │   ├── 转换路径映射
  │   ├── 引擎选择策略
  │   └── 降级策略
  │
  ├── 转换引擎适配器（EngineAdapter）
  │   ├── LibreOffice适配器
  │   ├── Poppler适配器
  │   ├── Pandoc适配器
  │   ├── Sharp适配器
  │   └── pdf2docx适配器
  │
  ├── 转换执行器（ConversionExecutor）
  │   ├── 同步转换执行
  │   ├── 异步转换执行
  │   └── 批量转换执行
  │
  ├── 格式保真控制器（FidelityController）
  │   ├── 样式保留
  │   ├── 布局保持
  │   └── 元素映射
  │
  └── 质量验证器（QualityValidator）
      ├── 格式验证
      ├── 内容完整性验证
      └── 保真度评估
```

### 3.2 核心组件说明

#### 3.2.1 格式识别器（FormatDetector）

**职责**：识别输入文件的格式类型

**实现方式**：

1. **文件扩展名识别**：根据文件扩展名快速识别
2. **MIME类型识别**：通过文件头信息识别MIME类型
3. **文件内容识别**：深度解析文件内容，确保准确性

**识别流程**：

```text
输入文件
  ↓
检查文件扩展名
  ↓
读取文件头（Magic Number）
  ↓
解析文件内容（如需要）
  ↓
返回格式信息（格式类型、版本、编码等）
```

#### 3.2.2 转换路由（ConversionRouter）

**职责**：根据输入输出格式，选择最优转换路径和引擎

**路由策略**：

1. **直接转换**：有直接转换引擎的路径
2. **中间格式转换**：通过中间格式（如HTML）进行转换
3. **多步转换**：需要多步转换的复杂路径

**路由表**：

```typescript
interface ConversionRoute {
  sourceFormat: string;
  targetFormat: string;
  engine: string;
  method: 'direct' | 'intermediate' | 'multi-step';
  intermediateFormat?: string;
  steps?: ConversionStep[];
}
```

#### 3.2.3 转换引擎适配器（EngineAdapter）

**职责**：封装不同转换引擎的调用接口，提供统一的转换接口

**适配器模式**：

- 每个引擎对应一个适配器
- 适配器负责参数转换、错误处理、结果验证
- 支持引擎的插拔式替换

#### 3.2.4 转换执行器（ConversionExecutor）

**职责**：执行实际的转换操作

**执行模式**：

- **同步执行**：单文件转换，等待完成
- **异步执行**：大文件或批量转换，使用任务队列
- **批量执行**：多文件并行转换

#### 3.2.5 格式保真控制器（FidelityController）

**职责**：控制转换过程中的格式保真度

**保真策略**：

- **样式保留**：字体、颜色、大小等样式信息
- **布局保持**：页面布局、边距、分栏等
- **元素映射**：表格、图片、超链接等元素映射

#### 3.2.6 质量验证器（QualityValidator）

**职责**：验证转换结果的质量和正确性

**验证内容**：

- 文件格式正确性
- 内容完整性
- 格式保真度评估

---

## 4. 接口设计

### 4.1 核心接口

#### 4.1.1 格式识别接口

```typescript
/**
 * 识别文件格式
 * @param filePath 文件路径
 * @param fileBuffer 文件内容（可选）
 * @returns 格式信息
 */
interface FormatInfo {
  format: string;          // 格式类型：'word', 'excel', 'pdf', 'ppt', 'image', 'markdown'
  extension: string;       // 文件扩展名
  mimeType: string;        // MIME类型
  version?: string;        // 格式版本
  encoding?: string;       // 编码方式
  isEncrypted?: boolean;   // 是否加密
  confidence: number;      // 识别置信度（0-1）
}

function detectFormat(filePath: string, fileBuffer?: Buffer): Promise<FormatInfo>;
```

#### 4.1.2 转换执行接口

```typescript
/**
 * 执行文件转换
 * @param sourceFile 源文件路径
 * @param targetFormat 目标格式
 * @param options 转换选项
 * @returns 转换结果
 */
interface ConversionOptions {
  targetFormat: string;           // 目标格式
  outputPath?: string;            // 输出路径（可选）
  quality?: 'high' | 'medium' | 'low';  // 质量等级
  pageRange?: { start: number; end: number };  // 页面范围
  preserveFormatting?: boolean;    // 是否保留格式
  compressImages?: boolean;       // 是否压缩图片
  password?: string;              // PDF密码（如需要）
  customOptions?: Record<string, any>;  // 自定义选项
}

interface ConversionResult {
  success: boolean;               // 是否成功
  outputPath: string;             // 输出文件路径
  fileSize: number;               // 输出文件大小
  conversionTime: number;         // 转换耗时（毫秒）
  formatInfo?: FormatInfo;        // 格式信息
  warnings?: string[];            // 警告信息
  errors?: string[];              // 错误信息
  fidelityScore?: number;         // 保真度评分（0-1）
}

function convertFile(
  sourceFile: string,
  options: ConversionOptions
): Promise<ConversionResult>;
```

#### 4.1.3 转换验证接口

```typescript
/**
 * 验证转换可行性
 * @param sourceFormat 源格式
 * @param targetFormat 目标格式
 * @returns 验证结果
 */
interface ValidationResult {
  supported: boolean;              // 是否支持
  method: 'direct' | 'intermediate' | 'multi-step' | 'unsupported';
  engine?: string;                 // 推荐引擎
  intermediateFormat?: string;     // 中间格式（如需要）
  estimatedTime?: number;         // 预估耗时（毫秒）
  limitations?: string[];         // 限制说明
}

function validateConversion(
  sourceFormat: string,
  targetFormat: string
): Promise<ValidationResult>;
```

### 4.2 引擎适配器接口

```typescript
/**
 * 转换引擎适配器接口
 */
interface IConversionEngine {
  /**
   * 引擎名称
   */
  name: string;

  /**
   * 支持的转换路径
   */
  supportedConversions: Array<{
    source: string;
    target: string;
  }>;

  /**
   * 执行转换
   */
  convert(
    sourceFile: string,
    targetFormat: string,
    options: ConversionOptions
  ): Promise<ConversionResult>;

  /**
   * 检查引擎是否可用
   */
  isAvailable(): Promise<boolean>;

  /**
   * 获取引擎信息
   */
  getInfo(): EngineInfo;
}
```

---

## 5. 转换流程设计

### 5.1 单文件转换流程

```text
开始转换
  ↓
1. 格式识别
  ├── 读取文件扩展名
  ├── 读取文件头信息
  └── 解析文件内容（如需要）
  ↓
2. 转换验证
  ├── 检查格式支持
  ├── 选择转换引擎
  └── 验证转换可行性
  ↓
3. 预处理
  ├── 文件验证（大小、完整性）
  ├── 参数准备
  └── 临时文件准备
  ↓
4. 执行转换
  ├── 调用转换引擎
  ├── 监控转换进度
  └── 处理转换错误
  ↓
5. 后处理
  ├── 格式保真处理
  ├── 质量验证
  └── 结果优化
  ↓
6. 输出结果
  ├── 保存输出文件
  ├── 生成元数据
  └── 清理临时文件
  ↓
结束
```

### 5.2 批量转换流程

```text
批量转换开始
  ↓
1. 文件列表处理
  ├── 解析文件列表
  ├── 分组（按转换路径）
  └── 优先级排序
  ↓
2. 任务队列
  ├── 创建转换任务
  ├── 入队（按优先级）
  └── 并发控制
  ↓
3. 并行执行
  ├── Worker线程池
  ├── 任务分发
  └── 进度监控
  ↓
4. 结果收集
  ├── 收集转换结果
  ├── 错误处理
  └── 统计信息
  ↓
5. 输出汇总
  ├── 生成结果列表
  ├── 生成报告
  └── 清理资源
  ↓
结束
```

### 5.3 复杂转换流程（多步转换）

```text
复杂转换开始
  ↓
1. 转换路径规划
  ├── 分析转换路径
  ├── 确定中间格式
  └── 规划转换步骤
  ↓
2. 第一步转换
  ├── 源格式 → 中间格式
  └── 验证中间结果
  ↓
3. 中间处理
  ├── 格式调整
  ├── 内容优化
  └── 质量检查
  ↓
4. 第二步转换
  ├── 中间格式 → 目标格式
  └── 验证最终结果
  ↓
5. 后处理
  ├── 格式优化
  └── 质量验证
  ↓
结束
```

---

## 6. 引擎适配器详细设计

### 6.1 LibreOffice适配器

#### 6.1.1 功能说明

LibreOffice适配器用于处理Office文档（Word、Excel、PPT）的转换。

#### 6.1.2 调用方式

```typescript
class LibreOfficeAdapter implements IConversionEngine {
  /**
   * 使用LibreOffice命令行工具进行转换
   * 命令格式：soffice --headless --convert-to <format> <input> --outdir <output>
   */
  async convert(
    sourceFile: string,
    targetFormat: string,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    // 1. 构建转换命令
    const command = this.buildCommand(sourceFile, targetFormat, options);
    
    // 2. 执行转换
    const result = await this.executeCommand(command);
    
    // 3. 验证结果
    const validation = await this.validateResult(result);
    
    return {
      success: validation.valid,
      outputPath: result.outputPath,
      // ...
    };
  }

  private buildCommand(
    sourceFile: string,
    targetFormat: string,
    options: ConversionOptions
  ): string {
    const formatMap = {
      'pdf': 'pdf',
      'docx': 'docx',
      'xlsx': 'xlsx',
      'pptx': 'pptx',
      'html': 'html',
      'txt': 'txt',
    };
    
    const outputFormat = formatMap[targetFormat] || targetFormat;
    const outputDir = path.dirname(options.outputPath || sourceFile);
    
    return `soffice --headless --convert-to ${outputFormat} "${sourceFile}" --outdir "${outputDir}"`;
  }
}
```

#### 6.1.3 参数配置

- **无头模式**：`--headless` 不显示GUI
- **输出目录**：`--outdir` 指定输出目录
- **格式选项**：`--convert-to` 指定目标格式

### 6.2 Poppler适配器

#### 6.2.1 功能说明

Poppler适配器用于处理PDF文件的转换。

#### 6.2.2 工具集使用

- **pdftotext**：PDF转文本
- **pdftoppm**：PDF转图片
- **pdftohtml**：PDF转HTML
- **pdftocairo**：PDF转其他格式

#### 6.2.3 实现示例

```typescript
class PopplerAdapter implements IConversionEngine {
  async convert(
    sourceFile: string,
    targetFormat: string,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    switch (targetFormat) {
      case 'txt':
        return await this.pdfToText(sourceFile, options);
      case 'html':
        return await this.pdfToHtml(sourceFile, options);
      case 'png':
      case 'jpg':
        return await this.pdfToImage(sourceFile, options);
      default:
        throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }

  private async pdfToText(
    sourceFile: string,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    const outputPath = options.outputPath || 
      sourceFile.replace(/\.pdf$/i, '.txt');
    
    const command = `pdftotext "${sourceFile}" "${outputPath}"`;
    await this.executeCommand(command);
    
    return {
      success: true,
      outputPath,
      // ...
    };
  }
}
```

### 6.3 Pandoc适配器

#### 6.3.1 功能说明

Pandoc适配器用于处理Markdown和其他文档格式的转换。

#### 6.3.2 调用方式

```typescript
class PandocAdapter implements IConversionEngine {
  async convert(
    sourceFile: string,
    targetFormat: string,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    const outputPath = options.outputPath || 
      this.generateOutputPath(sourceFile, targetFormat);
    
    const command = `pandoc "${sourceFile}" -o "${outputPath}" ${this.buildOptions(options)}`;
    
    await this.executeCommand(command);
    
    return {
      success: true,
      outputPath,
      // ...
    };
  }

  private buildOptions(options: ConversionOptions): string {
    const opts: string[] = [];
    
    if (options.preserveFormatting) {
      opts.push('--standalone');
    }
    
    if (options.quality === 'high') {
      opts.push('--pdf-engine=xelatex');
    }
    
    return opts.join(' ');
  }
}
```

### 6.4 Sharp适配器

#### 6.4.1 功能说明

Sharp适配器用于处理图片格式转换。

#### 6.4.2 实现示例

```typescript
import sharp from 'sharp';

class SharpAdapter implements IConversionEngine {
  async convert(
    sourceFile: string,
    targetFormat: string,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    const outputPath = options.outputPath || 
      this.generateOutputPath(sourceFile, targetFormat);
    
    let pipeline = sharp(sourceFile);
    
    // 应用转换选项
    if (options.compressImages) {
      pipeline = pipeline.jpeg({ quality: 85 });
    }
    
    // 执行转换
    await pipeline.toFile(outputPath);
    
    return {
      success: true,
      outputPath,
      // ...
    };
  }
}
```

---

## 7. 格式保真控制

### 7.1 保真策略

#### 7.1.1 样式保留

- **字体信息**：字体名称、大小、颜色、粗体、斜体等
- **段落格式**：对齐方式、行距、缩进等
- **页面设置**：页边距、纸张大小、方向等

#### 7.1.2 布局保持

- **表格布局**：保持表格结构、列宽、行高
- **图片位置**：保持图片在文档中的位置
- **分栏布局**：保持多栏布局

#### 7.1.3 元素映射

- **超链接**：保持链接地址和文本
- **书签/目录**：保持文档结构
- **脚注/尾注**：保持注释信息

### 7.2 保真度评估

```typescript
interface FidelityMetrics {
  stylePreservation: number;      // 样式保留度（0-1）
  layoutPreservation: number;     // 布局保留度（0-1）
  contentCompleteness: number;    // 内容完整度（0-1）
  elementMapping: number;          // 元素映射度（0-1）
  overallScore: number;           // 总体评分（0-1）
}

function evaluateFidelity(
  sourceFile: string,
  targetFile: string
): Promise<FidelityMetrics> {
  // 1. 解析源文件和目标文件
  // 2. 对比样式信息
  // 3. 对比布局信息
  // 4. 对比内容完整性
  // 5. 计算各项评分
  // 6. 返回综合评分
}
```

---

## 8. 错误处理

### 8.1 错误类型

| 错误类型 | 错误码 | 说明 | 处理方式 |
| ---- | ---- | ---- | ---- |
| 格式不支持 | E001 | 源格式或目标格式不支持 | 返回错误，提示支持的格式 |
| 文件损坏 | E002 | 源文件损坏或无法读取 | 返回错误，提示检查文件 |
| 转换失败 | E003 | 转换过程失败 | 记录错误日志，返回错误信息 |
| 引擎不可用 | E004 | 转换引擎未安装或不可用 | 提示安装引擎，或使用备选引擎 |
| 内存不足 | E005 | 转换过程内存不足 | 提示文件过大，建议分批处理 |
| 超时 | E006 | 转换超时 | 增加超时时间，或提示文件过大 |

### 8.2 错误处理流程

```text
转换过程
  ↓
发生错误
  ↓
捕获异常
  ↓
错误分类
  ├── 可恢复错误 → 重试机制
  ├── 不可恢复错误 → 返回错误
  └── 引擎错误 → 降级策略
  ↓
错误记录
  ├── 记录错误日志
  ├── 记录错误上下文
  └── 错误统计
  ↓
错误返回
  ├── 构造错误信息
  └── 返回给调用者
```

### 8.3 重试机制

```typescript
async function convertWithRetry(
  sourceFile: string,
  options: ConversionOptions,
  maxRetries: number = 3
): Promise<ConversionResult> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await convertFile(sourceFile, options);
    } catch (error) {
      lastError = error;
      
      // 判断是否可重试
      if (!isRetryableError(error)) {
        throw error;
      }
      
      // 等待后重试
      await sleep(1000 * (i + 1));
    }
  }
  
  throw lastError;
}
```

---

## 9. 性能优化

### 9.1 优化策略

#### 9.1.1 缓存机制

- **转换结果缓存**：相同文件的转换结果缓存
- **格式识别缓存**：格式识别结果缓存
- **引擎状态缓存**：引擎可用性状态缓存

#### 9.1.2 并发控制

- **Worker线程池**：使用Worker线程处理转换任务
- **资源限制**：限制同时转换的文件数量
- **优先级队列**：按优先级处理转换任务

#### 9.1.3 资源管理

- **引擎实例池**：复用引擎实例，减少初始化开销
- **临时文件管理**：及时清理临时文件
- **内存管理**：大文件分块处理，避免内存溢出

### 9.2 性能指标

| 指标 | 目标值 | 说明 |
| ---- | ---- | ---- |
| 单文件转换时间 | ≤30秒（10MB文件） | 标准格式转换 |
| 大文件转换时间 | ≤3分钟（100MB文件） | 大文件转换 |
| 并发转换能力 | 10个文件/秒 | 批量转换 |
| 内存占用 | ≤1GB | 单文件转换 |
| CPU占用 | ≤50% | 单文件转换 |

---

## 10. 测试设计

### 10.1 单元测试

- **格式识别测试**：测试各种格式的识别准确性
- **转换功能测试**：测试各种转换路径的正确性
- **错误处理测试**：测试各种错误场景的处理

### 10.2 集成测试

- **引擎集成测试**：测试各引擎适配器的集成
- **端到端测试**：测试完整的转换流程
- **性能测试**：测试转换性能和资源占用

### 10.3 质量测试

- **格式保真度测试**：测试转换后的格式保真度
- **兼容性测试**：测试不同版本文件的兼容性
- **边界测试**：测试大文件、特殊格式等边界情况

---

## 11. 部署说明

### 11.1 依赖安装

#### 11.1.1 LibreOffice

**Windows**：

```bash
# 下载安装LibreOffice
# 或使用Chocolatey
choco install libreoffice
```

**macOS**：

```bash
brew install --cask libreoffice
```

**Linux**：

```bash
sudo apt-get install libreoffice
```

#### 11.1.2 Poppler

**Windows**：

```bash
choco install poppler
```

**macOS**：

```bash
brew install poppler
```

**Linux**：

```bash
sudo apt-get install poppler-utils
```

#### 11.1.3 Pandoc

```bash
# 下载安装Pandoc
# https://pandoc.org/installing.html
```

### 11.2 配置说明

```typescript
// 引擎配置
const engineConfig = {
  libreOffice: {
    path: '/usr/bin/soffice',  // LibreOffice可执行文件路径
    timeout: 60000,            // 超时时间（毫秒）
    headless: true,             // 无头模式
  },
  poppler: {
    path: '/usr/bin',           // Poppler工具路径
    timeout: 30000,
  },
  pandoc: {
    path: '/usr/bin/pandoc',
    timeout: 60000,
  },
};
```

---

## 12. 附录

### 12.1 术语表

- **格式保真**：转换后保持原文档的格式、样式、布局
- **转换路径**：从源格式到目标格式的转换路线
- **中间格式**：多步转换中使用的中间格式
- **引擎适配器**：封装转换引擎的适配器类

### 12.2 参考资源

- [LibreOffice文档](https://www.libreoffice.org/)
- [Poppler文档](https://poppler.freedesktop.org/)
- [Pandoc文档](https://pandoc.org/)
- [Sharp文档](https://sharp.pixelplumbing.com/)

---

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 核心开发 |
