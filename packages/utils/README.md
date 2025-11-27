# 工具函数包

共享的工具函数，供后端、前端和桌面客户端使用。

## 使用方式

```typescript
import {
  generateUUID,
  formatFileSize,
  formatDateTime,
  getFileExtension,
  isValidEmail,
} from '@document-converter/utils';

// 生成 UUID
const id = generateUUID();

// 格式化文件大小
const size = formatFileSize(1048576); // "1 MB"

// 格式化日期时间
const date = formatDateTime(new Date()); // "2025-11-27 16:30:00"

// 获取文件扩展名
const ext = getFileExtension('document.pdf'); // "pdf"

// 验证邮箱
const isValid = isValidEmail('user@example.com'); // true
```

## API

### 字符串工具

- `generateUUID()`: 生成 UUID
- `getFileExtension(filename)`: 获取文件扩展名
- `getFileNameWithoutExtension(filename)`: 获取文件名（不含扩展名）

### 格式化工具

- `formatFileSize(bytes)`: 格式化文件大小
- `formatDateTime(date, format?)`: 格式化日期时间

### 验证工具

- `isValidEmail(email)`: 验证邮箱格式
- `isValidUrl(url)`: 验证 URL 格式

### 函数工具

- `delay(ms)`: 延迟函数
- `debounce(func, wait)`: 防抖函数
- `throttle(func, wait)`: 节流函数

### 对象工具

- `deepClone(obj)`: 深拷贝对象
