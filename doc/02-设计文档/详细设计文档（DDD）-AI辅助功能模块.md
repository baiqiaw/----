# AI辅助功能模块详细设计文档（DDD）

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | AI工程师 |

## 1. 文档说明

### 1.1 文档目的

本文档详细描述AI辅助功能模块的设计，包括结构化提取、摘要生成、格式修复等AI功能的实现方案，为AI功能开发和集成提供详细指导。

### 1.2 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《系统概要设计文档（HLD）》
- 《技术选型方案文档》
- 《格式转换核心引擎详细设计文档（DDD）》

---

## 2. 模块概述

### 2.1 模块定位

AI辅助功能模块负责提供智能化的文档处理能力，包括结构化提取、摘要生成、格式修复等功能，提升文档转换的质量和用户体验。

### 2.2 功能职责

- **结构化提取**：从文档中提取结构化数据（如Excel表格转Markdown表格）
- **摘要生成**：为长文档生成300字以内的AI摘要
- **格式修复**：自动修正转换过程中的排版错乱（如错位表格、重叠文字）
- **智能推荐**：根据文档内容推荐合适的输出格式

### 2.3 功能需求

#### 2.3.1 结构化提取

- **Excel转Markdown**：自动将Excel表格转换为Markdown表格格式
- **表格识别**：识别文档中的表格结构
- **数据提取**：提取表格数据并保持格式

#### 2.3.2 摘要生成

- **长度限制**：生成300字以内的摘要
- **内容质量**：基于文档核心内容生成摘要
- **多语言支持**：支持中文、英文等语言的摘要生成

#### 2.3.3 格式修复

- **表格错位修复**：修复转换后表格错位问题
- **文字重叠修复**：修复文字重叠问题
- **排版优化**：优化文档排版，提升可读性

---

## 3. 架构设计

### 3.1 模块架构

```text
AI辅助功能模块
  ├── AI服务适配器（AIServiceAdapter）
  │   ├── 百度文心适配器
  │   ├── 阿里通义适配器
  │   └── 降级策略
  │
  ├── 结构化提取服务（StructureExtractionService）
  │   ├── 表格识别
  │   ├── 数据提取
  │   └── 格式转换
  │
  ├── 摘要生成服务（SummaryGenerationService）
  │   ├── 内容分析
  │   ├── 摘要生成
  │   └── 质量评估
  │
  ├── 格式修复服务（FormatFixService）
  │   ├── 问题检测
  │   ├── 修复策略
  │   └── 修复执行
  │
  └── 智能推荐服务（SmartRecommendationService）
      ├── 内容分析
      ├── 格式推荐
      └── 参数优化
```

### 3.2 核心组件说明

#### 3.2.1 AI服务适配器（AIServiceAdapter）

**职责**：统一封装不同AI服务的调用接口

**功能**：

- 适配不同AI服务提供商的API
- 实现降级策略
- 统一错误处理

#### 3.2.2 结构化提取服务（StructureExtractionService）

**职责**：从文档中提取结构化数据

**功能**：

- 识别表格结构
- 提取表格数据
- 转换为目标格式（如Markdown表格）

#### 3.2.3 摘要生成服务（SummaryGenerationService）

**职责**：为文档生成摘要

**功能**：

- 分析文档内容
- 生成摘要
- 评估摘要质量

#### 3.2.4 格式修复服务（FormatFixService）

**职责**：修复转换后的格式问题

**功能**：

- 检测格式问题
- 制定修复策略
- 执行修复操作

---

## 4. 接口设计

### 4.1 结构化提取接口

#### 4.1.1 提取表格结构

```typescript
/**
 * 提取表格结构
 */
interface ExtractTableRequest {
  fileId: string;            // 文件ID
  pageRange?: {              // 页面范围（可选）
    start: number;
    end: number;
  };
  options?: {
    includeHeaders?: boolean; // 是否包含表头
    mergeCells?: boolean;     // 是否合并单元格
  };
}

interface TableStructure {
  rows: number;              // 行数
  columns: number;           // 列数
  headers?: string[];        // 表头（如果有）
  data: string[][];         // 表格数据
  mergedCells?: Array<{      // 合并单元格信息
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
  }>;
}

interface ExtractTableResponse {
  success: boolean;
  data: {
    tables: TableStructure[];
    totalTables: number;
  };
}

function extractTable(request: ExtractTableRequest): Promise<ExtractTableResponse>;
```

#### 4.1.2 Excel转Markdown表格

```typescript
/**
 * Excel转Markdown表格
 */
interface ExcelToMarkdownRequest {
  fileId: string;            // Excel文件ID
  sheetName?: string;        // 工作表名称（可选）
  options?: {
    includeHeaders?: boolean;
    align?: 'left' | 'center' | 'right'; // 对齐方式
  };
}

interface ExcelToMarkdownResponse {
  success: boolean;
  data: {
    markdown: string;        // Markdown表格文本
    tableCount: number;      // 表格数量
  };
}

function excelToMarkdown(request: ExcelToMarkdownRequest): Promise<ExcelToMarkdownResponse>;
```

### 4.2 摘要生成接口

#### 4.2.1 生成文档摘要

```typescript
/**
 * 生成文档摘要
 */
interface GenerateSummaryRequest {
  fileId: string;            // 文件ID
  maxLength?: number;        // 最大长度（默认300字）
  language?: string;         // 语言（zh/en，默认自动检测）
  style?: 'concise' | 'detailed'; // 摘要风格
}

interface SummaryResult {
  summary: string;           // 摘要内容
  length: number;            // 实际长度
  language: string;          // 检测到的语言
  quality: {
    score: number;          // 质量评分（0-100）
    coverage: number;        // 内容覆盖率（0-100）
  };
  keywords: string[];         // 关键词
}

interface GenerateSummaryResponse {
  success: boolean;
  data: SummaryResult;
}

function generateSummary(request: GenerateSummaryRequest): Promise<GenerateSummaryResponse>;
```

### 4.3 格式修复接口

#### 4.3.1 检测格式问题

```typescript
/**
 * 检测格式问题
 */
interface DetectFormatIssuesRequest {
  fileId: string;            // 文件ID
  issueTypes?: string[];     // 问题类型（可选）
}

interface FormatIssue {
  type: 'table_misalignment' | 'text_overlap' | 'layout_break' | 'font_inconsistency';
  severity: 'low' | 'medium' | 'high';
  location: {
    page: number;
    x: number;
    y: number;
  };
  description: string;
  suggestion: string;        // 修复建议
}

interface DetectFormatIssuesResponse {
  success: boolean;
  data: {
    issues: FormatIssue[];
    totalIssues: number;
    hasCriticalIssues: boolean;
  };
}

function detectFormatIssues(request: DetectFormatIssuesRequest): Promise<DetectFormatIssuesResponse>;
```

#### 4.3.2 修复格式问题

```typescript
/**
 * 修复格式问题
 */
interface FixFormatRequest {
  fileId: string;           // 文件ID
  issueIds?: string[];       // 要修复的问题ID（可选，不指定则修复所有）
  options?: {
    backup?: boolean;        // 是否备份原文件
    autoFix?: boolean;       // 是否自动修复（无需确认）
  };
}

interface FixFormatResponse {
  success: boolean;
  data: {
    fixedFileId: string;     // 修复后的文件ID
    fixedIssues: number;     // 修复的问题数量
    failedIssues: number;    // 修复失败的问题数量
    backupFileId?: string;   // 备份文件ID（如果启用备份）
  };
}

function fixFormat(request: FixFormatRequest): Promise<FixFormatResponse>;
```

### 4.4 智能推荐接口

#### 4.4.1 推荐输出格式

```typescript
/**
 * 推荐输出格式
 */
interface RecommendFormatRequest {
  fileId: string;            // 文件ID
  currentFormat: string;     // 当前格式
}

interface FormatRecommendation {
  format: string;            // 推荐格式
  score: number;            // 推荐分数（0-100）
  reasons: string[];        // 推荐理由
  advantages: string[];      // 优势
  disadvantages: string[];  // 劣势
}

interface RecommendFormatResponse {
  success: boolean;
  data: {
    recommendations: FormatRecommendation[];
    bestMatch: FormatRecommendation;
  };
}

function recommendFormat(request: RecommendFormatRequest): Promise<RecommendFormatResponse>;
```

---

## 5. 详细设计

### 5.1 AI服务适配器设计

#### 5.1.1 适配器接口

```typescript
/**
 * AI服务适配器接口
 */
interface AIServiceAdapter {
  /**
   * 生成摘要
   */
  generateSummary(text: string, options: SummaryOptions): Promise<string>;
  
  /**
   * 分析文档内容
   */
  analyzeDocument(content: string): Promise<DocumentAnalysis>;
  
  /**
   * 修复格式问题
   */
  fixFormat(content: string, issues: FormatIssue[]): Promise<string>;
  
  /**
   * 检查服务可用性
   */
  checkHealth(): Promise<boolean>;
}
```

#### 5.1.2 百度文心适配器

```typescript
/**
 * 百度文心适配器
 */
class BaiduWenxinAdapter implements AIServiceAdapter {
  private apiKey: string;
  private secretKey: string;
  private accessToken?: string;
  
  async generateSummary(text: string, options: SummaryOptions): Promise<string> {
    // 获取访问令牌
    if (!this.accessToken) {
      await this.refreshAccessToken()
    }
    
    // 调用文心一言API
    const response = await fetch('https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `请为以下文档生成一个${options.maxLength}字以内的摘要：\n\n${text}`,
          },
        ],
        temperature: 0.7,
        max_output_tokens: options.maxLength * 2, // 预留空间
      }),
    })
    
    const result = await response.json()
    return result.result
  }
  
  private async refreshAccessToken(): Promise<void> {
    const response = await fetch(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`,
      { method: 'POST' }
    )
    const result = await response.json()
    this.accessToken = result.access_token
  }
  
  async checkHealth(): Promise<boolean> {
    try {
      if (!this.accessToken) {
        await this.refreshAccessToken()
      }
      return !!this.accessToken
    } catch (error) {
      return false
    }
  }
}
```

#### 5.1.3 降级策略

```typescript
/**
 * AI服务管理器（带降级策略）
 */
class AIServiceManager {
  private adapters: AIServiceAdapter[] = []
  private currentAdapterIndex: number = 0
  
  async generateSummary(text: string, options: SummaryOptions): Promise<string> {
    // 尝试使用当前适配器
    for (let i = 0; i < this.adapters.length; i++) {
      const adapter = this.adapters[this.currentAdapterIndex]
      try {
        // 检查服务健康状态
        const isHealthy = await adapter.checkHealth()
        if (!isHealthy) {
          throw new Error('Service unhealthy')
        }
        
        // 调用服务
        const result = await adapter.generateSummary(text, options)
        return result
      } catch (error) {
        // 切换到下一个适配器
        this.currentAdapterIndex = (this.currentAdapterIndex + 1) % this.adapters.length
        continue
      }
    }
    
    // 所有适配器都失败，使用本地降级方案
    return this.fallbackSummary(text, options)
  }
  
  /**
   * 降级方案：基于规则的简单摘要
   */
  private fallbackSummary(text: string, options: SummaryOptions): string {
    // 提取前N段作为摘要
    const sentences = text.split(/[。！？]/)
    const maxSentences = Math.ceil(options.maxLength / 50) // 假设每句约50字
    return sentences.slice(0, maxSentences).join('。') + '。'
  }
}
```

### 5.2 结构化提取设计

#### 5.2.1 Excel转Markdown表格实现

```typescript
/**
 * Excel转Markdown表格
 */
async function excelToMarkdown(
  fileId: string,
  options?: ExcelToMarkdownOptions
): Promise<string> {
  // 1. 读取Excel文件
  const excelFile = await fileService.getFile(fileId)
  const workbook = await readExcel(excelFile.path)
  
  // 2. 选择工作表
  const sheet = options?.sheetName
    ? workbook.getWorksheet(options.sheetName)
    : workbook.getWorksheet(0)
  
  // 3. 提取表格数据
  const rows: string[][] = []
  sheet.eachRow((row, rowNumber) => {
    const rowData: string[] = []
    row.eachCell((cell, colNumber) => {
      rowData.push(cell.value?.toString() || '')
    })
    rows.push(rowData)
  })
  
  // 4. 转换为Markdown表格
  let markdown = ''
  
  // 表头
  if (options?.includeHeaders !== false && rows.length > 0) {
    const headerRow = rows[0]
    markdown += '| ' + headerRow.join(' | ') + ' |\n'
    markdown += '| ' + headerRow.map(() => '---').join(' | ') + ' |\n'
  }
  
  // 数据行
  const dataRows = options?.includeHeaders !== false ? rows.slice(1) : rows
  for (const row of dataRows) {
    markdown += '| ' + row.join(' | ') + ' |\n'
  }
  
  return markdown
}
```

#### 5.2.2 表格识别（PDF/Word）

```typescript
/**
 * 识别PDF/Word中的表格
 */
async function extractTablesFromDocument(
  fileId: string,
  format: 'pdf' | 'word'
): Promise<TableStructure[]> {
  const file = await fileService.getFile(fileId)
  
  if (format === 'pdf') {
    // 使用PDF解析库提取表格
    const pdfDoc = await PDFDocument.load(file.path)
    const tables: TableStructure[] = []
    
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i)
      // 使用表格识别算法
      const pageTables = await detectTablesInPDFPage(page)
      tables.push(...pageTables)
    }
    
    return tables
  } else if (format === 'word') {
    // 使用Word解析库提取表格
    const doc = await Document.load(file.path)
    const tables: TableStructure[] = []
    
    doc.sections.forEach(section => {
      section.tables.forEach(table => {
        const tableData: TableStructure = {
          rows: table.rows.length,
          columns: table.columns.length,
          data: [],
        }
        
        table.rows.forEach(row => {
          const rowData: string[] = []
          row.cells.forEach(cell => {
            rowData.push(cell.getText())
          })
          tableData.data.push(rowData)
        })
        
        tables.push(tableData)
      })
    })
    
    return tables
  }
  
  return []
}
```

### 5.3 摘要生成设计

#### 5.3.1 摘要生成流程

```text
1. 文档预处理
   ├── 提取文本内容
   ├── 清理无关内容（页眉、页脚、水印等）
   └── 分段处理

2. 内容分析
   ├── 识别文档类型（报告、论文、合同等）
   ├── 提取关键信息（标题、段落、列表等）
   └── 计算内容重要性

3. AI摘要生成
   ├── 调用AI服务生成摘要
   ├── 质量评估
   └── 长度调整

4. 后处理
   ├── 格式优化
   ├── 语言检查
   └── 返回结果
```

#### 5.3.2 摘要生成实现

```typescript
/**
 * 生成文档摘要
 */
async function generateDocumentSummary(
  fileId: string,
  options: SummaryOptions
): Promise<SummaryResult> {
  // 1. 提取文档文本
  const file = await fileService.getFile(fileId)
  const text = await extractTextFromFile(file)
  
  // 2. 预处理文本
  const processedText = preprocessText(text)
  
  // 3. 分析文档结构
  const analysis = await analyzeDocumentStructure(processedText)
  
  // 4. 提取关键内容
  const keyContent = extractKeyContent(processedText, analysis)
  
  // 5. 调用AI服务生成摘要
  const aiService = aiServiceManager.getAdapter()
  let summary = await aiService.generateSummary(keyContent, {
    maxLength: options.maxLength || 300,
    language: options.language || 'auto',
  })
  
  // 6. 质量评估和调整
  const quality = evaluateSummaryQuality(summary, processedText)
  if (quality.score < 60) {
    // 质量不足，尝试重新生成
    summary = await aiService.generateSummary(keyContent, {
      ...options,
      style: 'detailed',
    })
  }
  
  // 7. 长度调整
  if (summary.length > options.maxLength) {
    summary = truncateSummary(summary, options.maxLength)
  }
  
  // 8. 提取关键词
  const keywords = extractKeywords(processedText)
  
  return {
    summary,
    length: summary.length,
    language: detectLanguage(summary),
    quality: {
      score: quality.score,
      coverage: quality.coverage,
    },
    keywords,
  }
}
```

### 5.4 格式修复设计

#### 5.4.1 格式问题检测

```typescript
/**
 * 检测格式问题
 */
async function detectFormatIssues(
  fileId: string,
  format: string
): Promise<FormatIssue[]> {
  const file = await fileService.getFile(fileId)
  const issues: FormatIssue[] = []
  
  if (format === 'pdf') {
    // PDF格式问题检测
    const pdfDoc = await PDFDocument.load(file.path)
    
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i)
      
      // 检测表格错位
      const tableIssues = await detectTableMisalignment(page)
      issues.push(...tableIssues)
      
      // 检测文字重叠
      const overlapIssues = await detectTextOverlap(page)
      issues.push(...overlapIssues)
      
      // 检测布局断裂
      const layoutIssues = await detectLayoutBreak(page)
      issues.push(...layoutIssues)
    }
  } else if (format === 'word') {
    // Word格式问题检测
    const doc = await Document.load(file.path)
    
    // 检测字体不一致
    const fontIssues = await detectFontInconsistency(doc)
    issues.push(...fontIssues)
    
    // 检测段落格式问题
    const paragraphIssues = await detectParagraphIssues(doc)
    issues.push(...paragraphIssues)
  }
  
  return issues
}
```

#### 5.4.2 格式修复实现

```typescript
/**
 * 修复格式问题
 */
async function fixFormatIssues(
  fileId: string,
  issueIds?: string[]
): Promise<FixFormatResult> {
  const file = await fileService.getFile(fileId)
  
  // 1. 检测所有问题
  const allIssues = await detectFormatIssues(fileId, file.format)
  
  // 2. 筛选要修复的问题
  const issuesToFix = issueIds
    ? allIssues.filter(issue => issueIds.includes(issue.id))
    : allIssues
  
  // 3. 按优先级排序
  issuesToFix.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
  
  // 4. 执行修复
  let fixedCount = 0
  let failedCount = 0
  const fixedFile = await fileService.createCopy(fileId)
  
  for (const issue of issuesToFix) {
    try {
      await applyFix(fixedFile, issue)
      fixedCount++
    } catch (error) {
      failedCount++
      logger.error(`Failed to fix issue ${issue.id}:`, error)
    }
  }
  
  // 5. 保存修复后的文件
  const fixedFileId = await fileService.saveFile(fixedFile)
  
  return {
    fixedFileId,
    fixedIssues: fixedCount,
    failedIssues: failedCount,
  }
}
```

---

## 6. 性能优化

### 6.1 缓存策略

- **摘要缓存**：相同文档的摘要缓存24小时
- **分析结果缓存**：文档分析结果缓存12小时
- **格式检测缓存**：格式问题检测结果缓存6小时

### 6.2 异步处理

- **摘要生成**：大文档摘要生成采用异步任务
- **格式修复**：复杂格式修复采用后台任务

### 6.3 批量处理

- **批量摘要**：支持批量文档摘要生成
- **批量修复**：支持批量格式修复

---

## 7. 错误处理

### 7.1 错误类型

| 错误类型 | 错误码 | 说明 | 处理方式 |
| ---- | ---- | ---- | ---- |
| AI服务不可用 | E20001 | AI服务连接失败 | 使用降级方案 |
| 文档解析失败 | E20002 | 无法解析文档内容 | 返回错误信息 |
| 摘要生成失败 | E20003 | 摘要生成超时或失败 | 使用规则摘要 |
| 格式修复失败 | E20004 | 格式修复失败 | 返回部分修复结果 |

### 7.2 降级策略

- **AI服务降级**：AI服务不可用时使用基于规则的简单方案
- **功能降级**：部分功能失败时返回基础结果

---

## 8. 测试设计

### 8.1 单元测试

- **结构化提取测试**：Excel转Markdown、表格识别
- **摘要生成测试**：不同长度、不同语言的摘要生成
- **格式修复测试**：各种格式问题的检测和修复

### 8.2 集成测试

- **AI服务集成测试**：测试AI服务适配器的调用
- **端到端测试**：完整的AI功能流程测试

---

## 9. 部署说明

### 9.1 配置

```typescript
const aiConfig = {
  // AI服务配置
  services: {
    baidu: {
      apiKey: process.env.BAIDU_API_KEY,
      secretKey: process.env.BAIDU_SECRET_KEY,
      enabled: true,
    },
    alibaba: {
      apiKey: process.env.ALIBABA_API_KEY,
      enabled: false,
    },
  },
  
  // 降级策略
  fallback: {
    enabled: true,
    strategy: 'rule-based',
  },
  
  // 缓存配置
  cache: {
    enabled: true,
    ttl: 86400, // 24小时
  },
}
```

---

## 10. 附录

### 10.1 术语表

- **结构化提取**：从非结构化文档中提取结构化数据
- **摘要生成**：使用AI技术生成文档摘要
- **格式修复**：自动修复文档转换后的格式问题

### 10.2 参考资源

- 百度文心一言API文档
- 阿里通义千问API文档

---

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | AI工程师 |
