import { FastifyInstance } from 'fastify';

/**
 * 注册所有 API 路由
 */
export const registerRoutes = async (app: FastifyInstance) => {
  // 健康检查
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // 系统状态
  app.get('/system/status', async () => {
    return {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // TODO: 注册其他路由
  // app.register(authRoutes, { prefix: '/auth' });
  // app.register(convertRoutes, { prefix: '/convert' });
  // app.register(fileRoutes, { prefix: '/files' });
  // app.register(batchRoutes, { prefix: '/batch' });
  // app.register(taskRoutes, { prefix: '/task' });
};

