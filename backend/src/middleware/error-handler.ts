import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

/**
 * 错误处理中间件
 */
export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  request.log.error({
    error: {
      message: error.message,
      stack: error.stack,
      statusCode,
    },
  });

  reply.status(statusCode).send({
    error: {
      code: `E${statusCode}`,
      message,
      timestamp: new Date().toISOString(),
    },
  });
};

