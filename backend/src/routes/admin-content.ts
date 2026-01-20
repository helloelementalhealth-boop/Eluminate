import type { FastifyInstance } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { adminContent } from '../db/schema.js';
import type { App } from '../index.js';

// Helper function to check admin status
async function requireAdmin(app: App, requireAuth: any, request: any, reply: any) {
  const session = await requireAuth(request, reply);

  if (!session || !session.user) {
    app.logger.warn({}, 'Unauthorized: No authenticated user');
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  if (session.user.role !== 'admin') {
    app.logger.warn({ userId: session.user.id }, 'Forbidden: User is not admin');
    return reply.code(403).send({ error: 'Forbidden: Admin access required' });
  }

  return session;
}

export function register(app: App, fastify: FastifyInstance) {
  const requireAuthFunc = app.requireAuth();

  // GET /api/admin/content - Returns all content
  fastify.get('/api/admin/content', async (request, reply) => {
    app.logger.info({}, 'Fetching all admin content');
    try {
      const content = await app.db
        .select()
        .from(adminContent)
        .orderBy(desc(adminContent.display_order));

      const formatted = content.map((item) => ({
        id: item.id,
        pageName: item.page_name,
        contentType: item.content_type,
        contentKey: item.content_key,
        contentValue: item.content_value,
        displayOrder: item.display_order,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      app.logger.info({ count: content.length }, 'Admin content fetched successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch admin content');
      throw error;
    }
  });

  // GET /api/admin/content/:pageName - Returns content for specific page
  fastify.get('/api/admin/content/:pageName', async (request, reply) => {
    const { pageName } = request.params as { pageName: string };

    app.logger.info({ pageName }, 'Fetching admin content by page');
    try {
      const content = await app.db
        .select()
        .from(adminContent)
        .where(eq(adminContent.page_name, pageName))
        .orderBy(desc(adminContent.display_order));

      const formatted = content.map((item) => ({
        id: item.id,
        pageName: item.page_name,
        contentType: item.content_type,
        contentKey: item.content_key,
        contentValue: item.content_value,
        displayOrder: item.display_order,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      app.logger.info({ pageName, count: content.length }, 'Admin content by page fetched successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error, pageName }, 'Failed to fetch admin content by page');
      throw error;
    }
  });

  // POST /api/admin/content - Create new content
  fastify.post('/api/admin/content', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    const body = request.body as {
      pageName: string;
      contentType: string;
      contentKey: string;
      contentValue: string;
      displayOrder?: number;
      isActive?: boolean;
    };

    app.logger.info({ body }, 'Creating new admin content');
    try {
      const item = await app.db
        .insert(adminContent)
        .values({
          page_name: body.pageName,
          content_type: body.contentType,
          content_key: body.contentKey,
          content_value: body.contentValue,
          display_order: body.displayOrder || 0,
          is_active: body.isActive !== undefined ? body.isActive : true,
        })
        .returning();

      const formatted = {
        id: item[0].id,
        pageName: item[0].page_name,
        contentType: item[0].content_type,
        contentKey: item[0].content_key,
        contentValue: item[0].content_value,
        displayOrder: item[0].display_order,
        isActive: item[0].is_active,
        createdAt: item[0].created_at,
        updatedAt: item[0].updated_at,
      };

      app.logger.info({ contentId: item[0].id }, 'Admin content created successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to create admin content');
      throw error;
    }
  });

  // PUT /api/admin/content/:id - Update content
  fastify.put('/api/admin/content/:id', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    const { id } = request.params as { id: string };
    const body = request.body as {
      pageName?: string;
      contentType?: string;
      contentKey?: string;
      contentValue?: string;
      displayOrder?: number;
      isActive?: boolean;
    };

    app.logger.info({ id, body }, 'Updating admin content');
    try {
      const updateData: any = {
        updated_at: new Date(),
      };

      if (body.pageName !== undefined) updateData.page_name = body.pageName;
      if (body.contentType !== undefined) updateData.content_type = body.contentType;
      if (body.contentKey !== undefined) updateData.content_key = body.contentKey;
      if (body.contentValue !== undefined) updateData.content_value = body.contentValue;
      if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;
      if (body.isActive !== undefined) updateData.is_active = body.isActive;

      const updated = await app.db
        .update(adminContent)
        .set(updateData)
        .where(eq(adminContent.id, id))
        .returning();

      if (updated.length === 0) {
        app.logger.warn({ id }, 'Admin content not found for update');
        return reply.code(404).send({ error: 'Admin content not found' });
      }

      const formatted = {
        id: updated[0].id,
        pageName: updated[0].page_name,
        contentType: updated[0].content_type,
        contentKey: updated[0].content_key,
        contentValue: updated[0].content_value,
        displayOrder: updated[0].display_order,
        isActive: updated[0].is_active,
        createdAt: updated[0].created_at,
        updatedAt: updated[0].updated_at,
      };

      app.logger.info({ id }, 'Admin content updated successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error, id, body }, 'Failed to update admin content');
      throw error;
    }
  });

  // DELETE /api/admin/content/:id - Delete content
  fastify.delete('/api/admin/content/:id', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Deleting admin content');
    try {
      const deleted = await app.db
        .delete(adminContent)
        .where(eq(adminContent.id, id))
        .returning();

      if (deleted.length === 0) {
        app.logger.warn({ id }, 'Admin content not found for deletion');
        return reply.code(404).send({ error: 'Admin content not found' });
      }

      app.logger.info({ id }, 'Admin content deleted successfully');
      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to delete admin content');
      throw error;
    }
  });
}
