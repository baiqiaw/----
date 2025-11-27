# 用户管理模块详细设计文档（DDD）

## 版本信息

| 版本号 | 编制日期 | 修订说明 | 编制人 |
| ---- | ----------- | ---- | ----- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |

## 1. 文档说明

### 1.1 文档目的

本文档详细描述用户管理模块的设计，包括用户注册、登录、权限管理、角色管理等功能的设计和实现方案。

### 1.2 参考文档

- 《文档转换工具需求规格说明书（SRS）》
- 《系统概要设计文档（HLD）》
- 《认证授权机制设计文档》
- 《数据库设计文档》

---

## 2. 模块概述

### 2.1 模块定位

用户管理模块负责系统的用户账户管理、认证授权、权限控制等功能，是系统的基础支撑模块。

### 2.2 功能职责

- **用户注册**：新用户注册、账户激活
- **用户登录**：用户认证、Token管理
- **用户信息管理**：用户信息查询、更新、删除
- **角色管理**：角色定义、角色分配
- **权限管理**：权限定义、权限分配、权限验证
- **账户管理**：账户类型管理、账户升级/降级
- **用户设置**：用户偏好设置、个人配置

### 2.3 功能需求

#### 2.3.1 用户注册

- **注册方式**：邮箱注册、手机号注册（可选）
- **注册验证**：邮箱验证、手机验证码（可选）
- **注册限制**：防止重复注册、防止恶意注册

#### 2.3.2 用户登录

- **登录方式**：用户名/邮箱 + 密码
- **安全措施**：密码加密、登录失败限制、验证码（可选）
- **会话管理**：Token管理、会话超时

#### 2.3.3 权限控制

- **角色定义**：admin、enterprise_admin、enterprise_user、basic_user、free_user
- **权限分配**：基于角色的权限分配
- **权限验证**：接口级权限验证、资源级权限验证

---

## 3. 架构设计

### 3.1 模块架构

```text
用户管理模块
  ├── 用户服务（UserService）
  │   ├── 用户注册
  │   ├── 用户登录
  │   ├── 用户信息管理
  │   └── 账户管理
  │
  ├── 认证服务（AuthService）
  │   ├── 密码管理
  │   ├── Token管理
  │   ├── 会话管理
  │   └── 登录限制
  │
  ├── 权限服务（PermissionService）
  │   ├── 角色管理
  │   ├── 权限管理
  │   ├── 权限验证
  │   └── 权限缓存
  │
  ├── 用户设置服务（UserSettingsService）
  │   ├── 设置管理
  │   ├── 偏好设置
  │   └── 配置同步
  │
  └── 审计服务（AuditService）
      ├── 操作日志
      ├── 登录日志
      └── 安全事件
```

### 3.2 核心组件说明

#### 3.2.1 用户服务（UserService）

**职责**：管理用户账户和用户信息

**功能**：

- 用户注册
- 用户信息查询和更新
- 用户删除（软删除）
- 账户类型管理

#### 3.2.2 认证服务（AuthService）

**职责**：处理用户认证和会话管理

**功能**：

- 用户登录验证
- 密码管理（加密、验证、重置）
- Token生成和验证
- 登录限制和防护

#### 3.2.3 权限服务（PermissionService）

**职责**：管理角色和权限

**功能**：

- 角色定义和管理
- 权限定义和管理
- 权限验证
- 权限缓存

#### 3.2.4 用户设置服务（UserSettingsService）

**职责**：管理用户个人设置

**功能**：

- 设置存储和读取
- 偏好设置管理
- 配置同步

---

## 4. 接口设计

### 4.1 用户注册接口

#### 4.1.1 用户注册

```typescript
/**
 * 用户注册
 */
interface RegisterRequest {
  username: string;          // 用户名（3-50字符）
  email: string;             // 邮箱
  password: string;           // 密码（8-128字符，包含大小写字母、数字、特殊字符）
  confirmPassword: string;   // 确认密码
  verificationCode?: string;  // 验证码（邮箱验证）
  agreeToTerms: boolean;     // 同意服务条款
}

interface RegisterResponse {
  success: boolean;
  data: {
    userId: string;
    username: string;
    email: string;
    message: string;          // 提示信息（如：请验证邮箱）
  };
}

function register(request: RegisterRequest): Promise<RegisterResponse>;
```

#### 4.1.2 邮箱验证

```typescript
/**
 * 验证邮箱
 */
interface VerifyEmailRequest {
  userId: string;
  verificationCode: string;
}

interface VerifyEmailResponse {
  success: boolean;
  data: {
    message: string;
  };
}

function verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse>;
```

### 4.2 用户登录接口

#### 4.2.1 用户登录

```typescript
/**
 * 用户登录
 */
interface LoginRequest {
  username: string;          // 用户名或邮箱
  password: string;
  rememberMe?: boolean;      // 记住我
  captcha?: string;          // 验证码（登录失败后需要）
}

interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;       // 'Bearer'
    expiresIn: number;       // 过期时间（秒）
    user: {
      userId: string;
      username: string;
      email: string;
      role: string;
      accountType: string;
      permissions: string[];
    };
  };
}

function login(request: LoginRequest): Promise<LoginResponse>;
```

#### 4.2.2 用户登出

```typescript
/**
 * 用户登出
 */
interface LogoutResponse {
  success: boolean;
  data: {
    message: string;
  };
}

function logout(token: string): Promise<LogoutResponse>;
```

### 4.3 用户信息管理接口

#### 4.3.1 获取用户信息

```typescript
/**
 * 获取当前用户信息
 */
interface GetUserResponse {
  success: boolean;
  data: {
    userId: string;
    username: string;
    email: string;
    role: string;
    accountType: string;
    status: string;
    permissions: string[];
    createdAt: string;
    lastLoginAt?: string;
  };
}

function getCurrentUser(): Promise<GetUserResponse>;
```

#### 4.3.2 更新用户信息

```typescript
/**
 * 更新用户信息
 */
interface UpdateUserRequest {
  username?: string;
  email?: string;
  avatar?: string;            // 头像URL
}

interface UpdateUserResponse {
  success: boolean;
  data: {
    userId: string;
    username: string;
    email: string;
    updatedAt: string;
  };
}

function updateUser(request: UpdateUserRequest): Promise<UpdateUserResponse>;
```

### 4.4 密码管理接口

#### 4.4.1 修改密码

```typescript
/**
 * 修改密码
 */
interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  data: {
    message: string;
  };
}

function changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse>;
```

#### 4.4.2 重置密码

```typescript
/**
 * 重置密码（忘记密码）
 */
interface ResetPasswordRequest {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  data: {
    message: string;
  };
}

function resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse>;
```

### 4.5 角色和权限管理接口

#### 4.5.1 获取用户角色和权限

```typescript
/**
 * 获取用户角色和权限
 */
interface GetUserPermissionsResponse {
  success: boolean;
  data: {
    userId: string;
    role: string;
    permissions: string[];
    accountType: string;
  };
}

function getUserPermissions(userId: string): Promise<GetUserPermissionsResponse>;
```

#### 4.5.2 更新用户角色（管理员）

```typescript
/**
 * 更新用户角色（仅管理员）
 */
interface UpdateUserRoleRequest {
  userId: string;
  role: string;
}

interface UpdateUserRoleResponse {
  success: boolean;
  data: {
    userId: string;
    role: string;
    updatedAt: string;
  };
}

function updateUserRole(request: UpdateUserRoleRequest): Promise<UpdateUserRoleResponse>;
```

---

## 5. 详细设计

### 5.1 用户注册流程

#### 5.1.1 注册流程

```text
1. 用户提交注册信息
   ├── 验证用户名格式和唯一性
   ├── 验证邮箱格式和唯一性
   ├── 验证密码强度
   └── 验证服务条款同意

2. 生成验证码（邮箱验证）
   ├── 生成6位数字验证码
   ├── 发送验证邮件
   └── 存储验证码（5分钟有效期）

3. 创建用户账户
   ├── 密码加密（bcrypt）
   ├── 生成用户ID
   ├── 设置默认角色和账户类型
   └── 保存到数据库

4. 返回注册结果
   └── 提示用户验证邮箱
```

#### 5.1.2 密码强度验证

```typescript
/**
 * 密码强度验证
 */
interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  
  // 长度检查
  if (password.length < 8) {
    errors.push('密码长度至少8个字符')
  }
  if (password.length > 128) {
    errors.push('密码长度不能超过128个字符')
  }
  
  // 复杂度检查
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  const complexityCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar]
    .filter(Boolean).length
  
  if (complexityCount < 3) {
    errors.push('密码必须包含大小写字母、数字、特殊字符中的至少三种')
  }
  
  // 常见弱密码检查
  const weakPasswords = ['password', '12345678', 'qwerty', 'admin']
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('密码过于简单，请使用更复杂的密码')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
```

### 5.2 用户登录流程

#### 5.2.1 登录流程

```text
1. 用户提交登录信息
   ├── 验证用户名/邮箱格式
   ├── 验证密码格式
   └── 检查登录限制（防止暴力破解）

2. 验证用户身份
   ├── 查询用户信息
   ├── 验证密码
   ├── 检查账户状态（是否激活、是否禁用）
   └── 检查账户类型

3. 生成Token
   ├── 生成Access Token（1小时有效期）
   ├── 生成Refresh Token（7天有效期）
   └── 记录登录日志

4. 返回登录结果
   └── 返回Token和用户信息
```

#### 5.2.2 登录限制机制

```typescript
/**
 * 登录限制检查
 */
interface LoginLimitResult {
  allowed: boolean;
  remainingAttempts?: number;
  lockoutUntil?: Date;
}

async function checkLoginLimit(
  identifier: string,
  ip: string
): Promise<LoginLimitResult> {
  const key = `login:attempts:${identifier}:${ip}`
  const attempts = await redis.incr(key)
  
  if (attempts === 1) {
    await redis.expire(key, 900) // 15分钟窗口
  }
  
  // 5次失败后锁定15分钟
  if (attempts > 5) {
    const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000)
    return {
      allowed: false,
      lockoutUntil,
    }
  }
  
  return {
    allowed: true,
    remainingAttempts: 5 - attempts,
  }
}
```

### 5.3 权限管理设计

#### 5.3.1 角色定义

```typescript
/**
 * 角色定义
 */
interface Role {
  code: string;              // 角色代码
  name: string;              // 角色名称
  description: string;       // 角色描述
  permissions: string[];     // 权限列表
  isSystem: boolean;        // 是否系统角色
}

const ROLES: Record<string, Role> = {
  admin: {
    code: 'admin',
    name: '系统管理员',
    description: '系统管理员，拥有所有权限',
    permissions: ['*'],      // 所有权限
    isSystem: true,
  },
  enterprise_admin: {
    code: 'enterprise_admin',
    name: '企业管理员',
    description: '企业管理员，管理企业内用户和资源',
    permissions: [
      'user:manage',
      'file:manage',
      'task:manage',
      'convert:unlimited',
    ],
    isSystem: true,
  },
  enterprise_user: {
    code: 'enterprise_user',
    name: '企业用户',
    description: '企业用户，可以使用所有转换功能',
    permissions: [
      'convert:single',
      'convert:batch',
      'convert:unlimited',
      'ocr:recognize',
      'ai:assist',
    ],
    isSystem: true,
  },
  basic_user: {
    code: 'basic_user',
    name: '基础用户',
    description: '基础用户，可以使用基本转换功能',
    permissions: [
      'convert:single',
      'convert:batch',
      'ocr:recognize',
    ],
    isSystem: true,
  },
  free_user: {
    code: 'free_user',
    name: '免费用户',
    description: '免费用户，可以使用基础转换功能（有限制）',
    permissions: [
      'convert:single',
    ],
    isSystem: true,
  },
}
```

#### 5.3.2 权限定义

```typescript
/**
 * 权限定义
 */
interface Permission {
  code: string;              // 权限代码
  name: string;              // 权限名称
  description: string;       // 权限描述
  category: string;          // 权限分类
}

const PERMISSIONS: Record<string, Permission> = {
  'convert:single': {
    code: 'convert:single',
    name: '单文件转换',
    description: '执行单文件格式转换',
    category: 'convert',
  },
  'convert:batch': {
    code: 'convert:batch',
    name: '批量转换',
    description: '执行批量文件格式转换',
    category: 'convert',
  },
  'convert:unlimited': {
    code: 'convert:unlimited',
    name: '无限制转换',
    description: '无限制的文件转换（无文件大小、数量限制）',
    category: 'convert',
  },
  'ocr:recognize': {
    code: 'ocr:recognize',
    name: 'OCR识别',
    description: '使用OCR识别文字',
    category: 'ocr',
  },
  'ai:assist': {
    code: 'ai:assist',
    name: 'AI辅助',
    description: '使用AI辅助功能',
    category: 'ai',
  },
  'user:manage': {
    code: 'user:manage',
    name: '用户管理',
    description: '管理用户账户',
    category: 'user',
  },
  'file:manage': {
    code: 'file:manage',
    name: '文件管理',
    description: '管理所有文件',
    category: 'file',
  },
  'task:manage': {
    code: 'task:manage',
    name: '任务管理',
    description: '管理所有任务',
    category: 'task',
  },
}
```

#### 5.3.3 权限验证

```typescript
/**
 * 权限验证
 */
async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  // 获取用户角色
  const user = await getUserById(userId)
  if (!user) {
    return false
  }
  
  // 获取角色权限
  const role = ROLES[user.role]
  if (!role) {
    return false
  }
  
  // 检查权限（admin拥有所有权限）
  if (role.permissions.includes('*')) {
    return true
  }
  
  return role.permissions.includes(permission)
}

/**
 * 权限验证中间件
 */
function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.userId
    
    const hasPerm = await hasPermission(userId, permission)
    if (!hasPerm) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'E00004',
          message: '权限不足',
        },
      })
    }
    
    next()
  }
}
```

### 5.4 用户设置管理

#### 5.4.1 设置管理

```typescript
/**
 * 用户设置接口
 */
interface UserSettings {
  // 转换设置
  defaultTargetFormat?: string;  // 默认目标格式
  defaultQuality?: string;       // 默认质量
  autoDeleteAfterHours?: number;  // 自动删除时间
  
  // 界面设置
  language?: string;              // 语言偏好
  theme?: string;                 // 主题
  fontSize?: number;              // 字体大小
  
  // 通知设置
  emailNotifications?: boolean;   // 邮件通知
  taskCompleteNotification?: boolean; // 任务完成通知
  
  // 其他设置
  [key: string]: any;
}

/**
 * 获取用户设置
 */
async function getUserSettings(userId: string): Promise<UserSettings> {
  const settings = await db.query(
    'SELECT * FROM user_settings WHERE user_id = $1',
    [userId]
  )
  
  const result: UserSettings = {}
  for (const setting of settings) {
    result[setting.setting_key] = JSON.parse(setting.setting_value)
  }
  
  return result
}

/**
 * 更新用户设置
 */
async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  for (const [key, value] of Object.entries(settings)) {
    await db.query(
      `INSERT INTO user_settings (user_id, setting_key, setting_value)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, setting_key)
       DO UPDATE SET setting_value = $3, updated_at = CURRENT_TIMESTAMP`,
      [userId, key, JSON.stringify(value)]
    )
  }
}
```

---

## 6. 安全设计

### 6.1 密码安全

#### 6.1.1 密码加密

- **算法**：bcrypt（cost factor: 12）
- **盐值**：自动生成，每个密码使用不同的盐值
- **存储**：仅存储哈希值，不存储明文

```typescript
/**
 * 密码加密
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * 密码验证
 */
async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}
```

#### 6.1.2 密码策略

- **最小长度**：8个字符
- **最大长度**：128个字符
- **复杂度要求**：至少包含大小写字母、数字、特殊字符中的三种
- **密码历史**：不能使用最近5次使用过的密码
- **密码过期**：90天（企业版可配置）

### 6.2 账户安全

#### 6.2.1 账户状态管理

- **active**：正常状态
- **disabled**：禁用状态（管理员操作）
- **suspended**：暂停状态（违规操作）

#### 6.2.2 登录安全

- **登录限制**：5次失败后锁定15分钟
- **IP限制**：同一IP频繁失败后临时封禁
- **验证码**：登录失败3次后需要验证码
- **异地登录**：检测异常登录位置，发送通知

### 6.3 审计日志

#### 6.3.1 日志记录

记录以下操作：

- 用户注册
- 用户登录/登出
- 密码修改
- 角色变更
- 权限变更
- 账户状态变更

```typescript
/**
 * 记录审计日志
 */
async function logAuditEvent(event: AuditEvent): Promise<void> {
  await db.insert('audit_logs', {
    user_id: event.userId,
    action: event.action,
    resource_type: event.resourceType,
    resource_id: event.resourceId,
    ip_address: event.ip,
    user_agent: event.userAgent,
    request_id: event.requestId,
    details: JSON.stringify(event.details),
    created_at: new Date(),
  })
}
```

---

## 7. 性能优化

### 7.1 权限缓存

#### 7.1.1 权限缓存策略

- **缓存键**：`permissions:${userId}`
- **缓存时间**：1小时
- **缓存失效**：权限变更时清除缓存

```typescript
/**
 * 获取用户权限（带缓存）
 */
async function getUserPermissionsCached(userId: string): Promise<string[]> {
  const cacheKey = `permissions:${userId}`
  
  // 尝试从缓存获取
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // 从数据库获取
  const permissions = await getUserPermissions(userId)
  
  // 写入缓存
  await redis.setex(cacheKey, 3600, JSON.stringify(permissions))
  
  return permissions
}
```

### 7.2 用户信息缓存

#### 7.2.1 用户信息缓存

- **缓存键**：`user:${userId}`
- **缓存时间**：30分钟
- **缓存失效**：用户信息更新时清除缓存

---

## 8. 错误处理

### 8.1 错误类型

| 错误类型 | 错误码 | 说明 | 处理方式 |
| ---- | ---- | ---- | ---- |
| 用户名已存在 | E06006 | 用户名已被注册 | 提示用户使用其他用户名 |
| 邮箱已存在 | E06006 | 邮箱已被注册 | 提示用户使用其他邮箱 |
| 密码强度不足 | E06007 | 密码不符合要求 | 提示密码要求 |
| 登录失败 | E06001 | 用户名或密码错误 | 记录失败次数，超过限制后锁定 |
| Token过期 | E06002 | Token已过期 | 提示重新登录或刷新Token |
| Token无效 | E06003 | Token格式错误或无效 | 提示重新登录 |
| 账户被禁用 | E06004 | 用户账户已被禁用 | 提示联系管理员 |
| 权限不足 | E06005 | 用户无权限执行操作 | 提示权限不足 |

### 8.2 错误处理流程

```text
1. 捕获错误
   ├── 业务错误 → 返回业务错误码
   ├── 系统错误 → 记录日志，返回通用错误
   └── 安全错误 → 记录安全日志，返回安全错误

2. 错误记录
   ├── 记录错误日志
   ├── 记录审计日志（安全相关）
   └── 发送告警（严重错误）

3. 错误响应
   └── 返回统一错误格式
```

---

## 9. 测试设计

### 9.1 单元测试

- **用户注册测试**：正常注册、重复注册、无效输入
- **用户登录测试**：正常登录、错误密码、账户禁用
- **权限验证测试**：权限检查、角色验证
- **密码管理测试**：密码加密、密码验证、密码重置

### 9.2 集成测试

- **注册登录流程**：完整注册登录流程
- **权限控制流程**：权限验证流程
- **账户管理流程**：账户升级、角色变更

---

## 10. 部署说明

### 10.1 配置

```typescript
const userManagementConfig = {
  // 密码配置
  password: {
    minLength: 8,
    maxLength: 128,
    requireComplexity: true,
    historyCount: 5,
    expiryDays: 90,
  },
  
  // 登录配置
  login: {
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15分钟
    requireCaptchaAfter: 3,
  },
  
  // Token配置
  token: {
    accessTokenExpiry: 3600,      // 1小时
    refreshTokenExpiry: 7 * 24 * 3600, // 7天
  },
  
  // 缓存配置
  cache: {
    permissionsTTL: 3600,          // 1小时
    userInfoTTL: 1800,             // 30分钟
  },
}
```

## 11. 附录

### 11.1 术语表

- **角色**：用户的身份标识，决定用户的基本权限
- **权限**：具体的操作权限，如文件转换、用户管理等
- **账户类型**：用户的账户级别（free/basic/enterprise）

### 11.2 参考资源

- 《认证授权机制设计文档》
- 《数据库设计文档》

---

## 更新记录

| 版本号 | 更新日期 | 更新内容 | 更新人 |
| ---- | ---- | ---- | ---- |
| V1.0 | 2025 年 11 月 | 初始版本 | 后端开发 |
