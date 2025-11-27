# API 客户端库

封装 API 调用，提供类型安全的接口。

## 使用方式

```typescript
import { createApiClient } from '@document-converter/api-client';

// 创建客户端实例
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 30000,
});

// 设置认证 Token
apiClient.setAuthToken('your-token');

// 设置 API Key
apiClient.setApiKey('your-api-key');

// GET 请求
const response = await apiClient.get('/users/me');
if (response.success) {
  console.log(response.data);
}

// POST 请求
const result = await apiClient.post('/convert', {
  fileId: 'file-id',
  targetFormat: 'pdf',
});

// 文件上传
const uploadResult = await apiClient.upload(
  '/files/upload',
  file,
  (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
);
```

## API

### createApiClient(config)

创建 API 客户端实例。

**参数**：

- `config.baseURL`: API 基础 URL
- `config.timeout`: 请求超时时间（毫秒），默认 30000
- `config.headers`: 自定义请求头

### ApiClient 方法

- `setAuthToken(token)`: 设置认证 Token
- `setApiKey(apiKey)`: 设置 API Key
- `clearAuth()`: 清除认证信息
- `get<T>(url, params?)`: GET 请求
- `post<T>(url, data?, options?)`: POST 请求
- `put<T>(url, data?, options?)`: PUT 请求
- `delete<T>(url)`: DELETE 请求
- `upload<T>(url, file, onProgress?)`: 文件上传
