/**
 * 文档转换工具 TypeScript 类型定义
 */

// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  accountType: AccountType;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  Admin = 'admin',
  EnterpriseAdmin = 'enterprise_admin',
  EnterpriseUser = 'enterprise_user',
  BasicUser = 'basic_user',
  FreeUser = 'free_user',
}

export enum AccountType {
  Free = 'free',
  Basic = 'basic',
  Enterprise = 'enterprise',
}

export enum UserStatus {
  Active = 'active',
  Disabled = 'disabled',
  Suspended = 'suspended',
}

// 文件相关类型
export interface File {
  id: string;
  userId?: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType?: string;
  fileFormat?: string;
  createdAt: Date;
}

// 转换任务相关类型
export interface ConversionTask {
  id: string;
  userId?: string;
  fileId: string;
  sourceFormat: string;
  targetFormat: string;
  status: TaskStatus;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

