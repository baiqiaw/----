import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * 认证中间件
 * 验证 JWT Token
 */
export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // TODO: 实现 JWT Token 验证逻辑
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    reply.status(401).send({
      error: {
        code: 'E401',
        message: 'Unauthorized: Missing token',
      },
    });
    return;
  }

  // TODO: 验证 token 并设置 request.user
  // request.user = await verifyToken(token);
};

