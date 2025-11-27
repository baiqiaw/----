import { FastifyInstance } from 'fastify';

/**
 * 注册所有 API 路由
 */
export const registerRoutes = async (app: FastifyInstance) => {
  // 健康检查
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // TODO: 注册其他路由
  // app.register(authRoutes, { prefix: '/auth' });
  // app.register(convertRoutes, { prefix: '/convert' });
  // app.register(fileRoutes, { prefix: '/files' });
};

