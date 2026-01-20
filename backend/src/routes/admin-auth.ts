import type { FastifyInstance } from 'fastify';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  const requireAuth = app.requireAuth();

  // GET /api/admin/check - Check if current user is admin
  fastify.get('/api/admin/check', async (request, reply) => {
    app.logger.info({}, 'Checking admin status');
    try {
      const session = await requireAuth(request, reply);

      if (!session) {
        app.logger.info({}, 'No authenticated user found');
        return { isAdmin: false };
      }

      const isAdmin = session.user.role === 'admin';

      app.logger.info({ userId: session.user.id, isAdmin }, 'Admin check completed');
      return { isAdmin };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to check admin status');
      return { isAdmin: false };
    }
  });

  // POST /api/admin/require-auth - Middleware helper to check admin status
  fastify.post('/api/admin/require-auth', async (request, reply) => {
    app.logger.info({}, 'Validating admin authentication');
    try {
      const session = await requireAuth(request, reply);

      if (!session) {
        app.logger.warn({}, 'Unauthorized: No authenticated user');
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      if (session.user.role !== 'admin') {
        app.logger.warn({ userId: session.user.id }, 'Forbidden: User is not admin');
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
      }

      app.logger.info({ userId: session.user.id }, 'Admin authentication validated');
      return { authenticated: true, user: session.user };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to validate admin authentication');
      throw error;
    }
  });
}
