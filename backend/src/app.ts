import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = Fastify({
  logger: true,
});

// 注册 CORS
app.register(cors, {
  origin: true,
});

// 健康检查路由
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// 启动服务器
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server is running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

