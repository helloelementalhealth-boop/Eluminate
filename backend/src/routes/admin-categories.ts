import type { FastifyInstance } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { adminCategories } from '../db/schema.js';
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
  // GET /api/admin/categories - Returns all categories
  fastify.get('/api/admin/categories', async (request, reply) => {
    app.logger.info({}, 'Fetching all admin categories');
    try {
      const categories = await app.db
        .select()
        .from(adminCategories)
        .orderBy(desc(adminCategories.display_order));

      const formatted = categories.map((cat) => ({
        id: cat.id,
        categoryName: cat.category_name,
        iconName: cat.icon_name,
        routePath: cat.route_path,
        displayOrder: cat.display_order,
        isActive: cat.is_active,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at,
      }));

      app.logger.info({ count: categories.length }, 'Admin categories fetched successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch admin categories');
      throw error;
    }
  });

  // POST /api/admin/categories - Create new category
  fastify.post('/api/admin/categories', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    const body = request.body as {
      categoryName: string;
      iconName: string;
      routePath: string;
      displayOrder?: number;
      isActive?: boolean;
    };

    app.logger.info({ body }, 'Creating new admin category');
    try {
      const category = await app.db
        .insert(adminCategories)
        .values({
          category_name: body.categoryName,
          icon_name: body.iconName,
          route_path: body.routePath,
          display_order: body.displayOrder || 0,
          is_active: body.isActive !== undefined ? body.isActive : true,
        })
        .returning();

      const formatted = {
        id: category[0].id,
        categoryName: category[0].category_name,
        iconName: category[0].icon_name,
        routePath: category[0].route_path,
        displayOrder: category[0].display_order,
        isActive: category[0].is_active,
        createdAt: category[0].created_at,
        updatedAt: category[0].updated_at,
      };

      app.logger.info({ categoryId: category[0].id }, 'Admin category created successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to create admin category');
      throw error;
    }
  });

  // PUT /api/admin/categories/:id - Update category
  fastify.put('/api/admin/categories/:id', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    const { id } = request.params as { id: string };
    const body = request.body as {
      categoryName?: string;
      iconName?: string;
      routePath?: string;
      displayOrder?: number;
      isActive?: boolean;
    };

    app.logger.info({ id, body }, 'Updating admin category');
    try {
      const updateData: any = {
        updated_at: new Date(),
      };

      if (body.categoryName !== undefined) updateData.category_name = body.categoryName;
      if (body.iconName !== undefined) updateData.icon_name = body.iconName;
      if (body.routePath !== undefined) updateData.route_path = body.routePath;
      if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;
      if (body.isActive !== undefined) updateData.is_active = body.isActive;

      const updated = await app.db
        .update(adminCategories)
        .set(updateData)
        .where(eq(adminCategories.id, id))
        .returning();

      if (updated.length === 0) {
        app.logger.warn({ id }, 'Admin category not found for update');
        return reply.code(404).send({ error: 'Admin category not found' });
      }

      const formatted = {
        id: updated[0].id,
        categoryName: updated[0].category_name,
        iconName: updated[0].icon_name,
        routePath: updated[0].route_path,
        displayOrder: updated[0].display_order,
        isActive: updated[0].is_active,
        createdAt: updated[0].created_at,
        updatedAt: updated[0].updated_at,
      };

      app.logger.info({ id }, 'Admin category updated successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error, id, body }, 'Failed to update admin category');
      throw error;
    }
  });

  // DELETE /api/admin/categories/:id - Delete category
  fastify.delete('/api/admin/categories/:id', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Deleting admin category');
    try {
      const deleted = await app.db
        .delete(adminCategories)
        .where(eq(adminCategories.id, id))
        .returning();

      if (deleted.length === 0) {
        app.logger.warn({ id }, 'Admin category not found for deletion');
        return reply.code(404).send({ error: 'Admin category not found' });
      }

      app.logger.info({ id }, 'Admin category deleted successfully');
      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to delete admin category');
      throw error;
    }
  });
}
