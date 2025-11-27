/**
 * 共享 TypeScript 类型定义
 * 供后端、前端和桌面客户端使用
 */

// 用户相关类型
export enum UserRole {
  ADMIN = 'admin',
  ENTERPRISE_ADMIN = 'enterprise_admin',
  ENTERPRISE_USER = 'enterprise_user',
  BASIC_USER = 'basic_user',
  FREE_USER = 'free_user',
}

export enum AccountType {
  FREE = 'free',
  BASIC = 'basic',
  ENTERPRISE = 'enterprise',
}

export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  SUSPENDED = 'suspended',
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  accountType: AccountType;
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 文件相关类型
export enum StorageType {
  LOCAL = 'local',
  S3 = 's3',
  OSS = 'oss',
}

export enum FileStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
  EXPIRED = 'expired',
}

export interface File {
  id: string;
  userId?: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType?: string;
  fileFormat?: string;
  fileHash?: string;
  storageType: StorageType;
  status: FileStatus;
  createdAt: Date;
  updatedAt: Date;
}

// 任务相关类型
export enum TaskType {
  SINGLE = 'single',
  BATCH = 'batch',
}

export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum BatchTaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
  PARTIAL = 'partial',
}

export interface ConversionTask {
  id: string;
  userId?: string;
  taskType: TaskType;
  batchId?: string;
  sourceFileId: string;
  targetFormat: string;
  sourceFormat?: string;
  status: TaskStatus;
  progress: number;
  options?: Record<string, unknown>;
  resultFileId?: string;
  errorCode?: string;
  errorMessage?: string;
  conversionTime?: number;
  qualityMetrics?: Record<string, unknown>;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface BatchTask {
  id: string;
  userId?: string;
  taskName?: string;
  status: BatchTaskStatus;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  progress: number;
  options?: Record<string, unknown>;
  progressDetail?: Record<string, unknown>;
  mergeResult: boolean;
  resultFileId?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    timestamp: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 错误码类型
export interface ErrorCode {
  code: string;
  message: string;
  httpStatus: number;
}

