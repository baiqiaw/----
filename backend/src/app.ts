import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { registerRoutes } from './api/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { config } from './config/index.js';

// 加载环境变量
dotenv.config();

const app = Fastify({
  logger: true,
});

// 注册 CORS
app.register(cors, {
  origin: true,
});

// 注册错误处理
app.setErrorHandler(errorHandler);

// 注册 API 路由
app.register(registerRoutes, { prefix: config.apiPrefix });

// 健康检查路由
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// 启动服务器
const start = async () => {
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`🚀 Server is running on http://localhost:${config.port}`);
    console.log(`📚 API prefix: ${config.apiPrefix}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

