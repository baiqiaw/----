/**
 * 应用配置
 */

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || 104857600, // 100MB
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'docx',
      'pdf',
      'xlsx',
      'pptx',
      'md',
      'txt',
      'jpg',
      'png',
    ],
  },
};

