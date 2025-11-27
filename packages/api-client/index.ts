/**
 * API 客户端库
 * 封装 API 调用，提供类型安全的接口
 */

import type { ApiResponse } from '@document-converter/types';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * 设置认证 Token
   */
  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * 设置 API Key
   */
  setApiKey(apiKey: string): void {
    this.headers['X-API-Key'] = apiKey;
  }

  /**
   * 清除认证信息
   */
  clearAuth(): void {
    delete this.headers['Authorization'];
    delete this.headers['X-API-Key'];
  }

  /**
   * GET 请求
   */
  async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    const response = await this.request<T>(`${url}${queryString}`, {
      method: 'GET',
    });
    return response;
  }

  /**
   * POST 请求
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const response = await this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return response;
  }

  /**
   * PUT 请求
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const response = await this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return response;
  }

  /**
   * DELETE 请求
   */
  async delete<T = unknown>(url: string): Promise<ApiResponse<T>> {
    const response = await this.request<T>(url, {
      method: 'DELETE',
    });
    return response;
  }

  /**
   * 文件上传
   */
  async upload<T = unknown>(
    url: string,
    file: File | Blob,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data as ApiResponse<T>);
          } catch {
            resolve({
              success: true,
              data: xhr.responseText as unknown as T,
            } as ApiResponse<T>);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${this.baseURL}${url}`);
      Object.entries(this.headers).forEach(([key, value]) => {
        if (key !== 'Content-Type') {
          xhr.setRequestHeader(key, value);
        }
      });
      xhr.send(formData);
    });
  }

  /**
   * 基础请求方法
   */
  private async request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers: {
          ...this.headers,
          ...(options.headers as Record<string, string>),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `E${response.status}`,
            message: data.error?.message || response.statusText,
            timestamp: new Date().toISOString(),
          },
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: {
          code: 'E000',
          message: error instanceof Error ? error.message : 'Network error',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}

/**
 * 创建 API 客户端实例
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

