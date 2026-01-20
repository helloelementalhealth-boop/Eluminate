import type { FastifyInstance } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { adminSubscriptionPlans } from '../db/schema.js';
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
  // GET /api/admin/subscriptions - Returns all subscription plans
  fastify.get('/api/admin/subscriptions', async (request, reply) => {
    app.logger.info({}, 'Fetching all subscription plans');
    try {
      const plans = await app.db
        .select()
        .from(adminSubscriptionPlans)
        .orderBy(desc(adminSubscriptionPlans.display_order));

      const formatted = plans.map((plan) => ({
        id: plan.id,
        planName: plan.plan_name,
        planDescription: plan.plan_description,
        price: plan.price,
        billingPeriod: plan.billing_period,
        features: JSON.parse(plan.features),
        isActive: plan.is_active,
        displayOrder: plan.display_order,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
      }));

      app.logger.info({ count: plans.length }, 'Subscription plans fetched successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch subscription plans');
      throw error;
    }
  });

  // POST /api/admin/subscriptions - Create subscription plan
  fastify.post('/api/admin/subscriptions', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    const body = request.body as {
      planName: string;
      planDescription?: string;
      price: string;
      billingPeriod: string;
      features: string[];
      displayOrder?: number;
      isActive?: boolean;
    };

    app.logger.info({ body }, 'Creating new subscription plan');
    try {
      const plan = await app.db
        .insert(adminSubscriptionPlans)
        .values({
          plan_name: body.planName,
          plan_description: body.planDescription || null,
          price: body.price,
          billing_period: body.billingPeriod,
          features: JSON.stringify(body.features),
          display_order: body.displayOrder || 0,
          is_active: body.isActive !== undefined ? body.isActive : true,
        })
        .returning();

      const formatted = {
        id: plan[0].id,
        planName: plan[0].plan_name,
        planDescription: plan[0].plan_description,
        price: plan[0].price,
        billingPeriod: plan[0].billing_period,
        features: JSON.parse(plan[0].features),
        isActive: plan[0].is_active,
        displayOrder: plan[0].display_order,
        createdAt: plan[0].created_at,
        updatedAt: plan[0].updated_at,
      };

      app.logger.info({ planId: plan[0].id }, 'Subscription plan created successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to create subscription plan');
      throw error;
    }
  });

  // PUT /api/admin/subscriptions/:id - Update subscription plan
  fastify.put('/api/admin/subscriptions/:id', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    const { id } = request.params as { id: string };
    const body = request.body as {
      planName?: string;
      planDescription?: string;
      price?: string;
      billingPeriod?: string;
      features?: string[];
      displayOrder?: number;
      isActive?: boolean;
    };

    app.logger.info({ id, body }, 'Updating subscription plan');
    try {
      const updateData: any = {
        updated_at: new Date(),
      };

      if (body.planName !== undefined) updateData.plan_name = body.planName;
      if (body.planDescription !== undefined) updateData.plan_description = body.planDescription;
      if (body.price !== undefined) updateData.price = body.price;
      if (body.billingPeriod !== undefined) updateData.billing_period = body.billingPeriod;
      if (body.features !== undefined) updateData.features = JSON.stringify(body.features);
      if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;
      if (body.isActive !== undefined) updateData.is_active = body.isActive;

      const updated = await app.db
        .update(adminSubscriptionPlans)
        .set(updateData)
        .where(eq(adminSubscriptionPlans.id, id))
        .returning();

      if (updated.length === 0) {
        app.logger.warn({ id }, 'Subscription plan not found for update');
        return reply.code(404).send({ error: 'Subscription plan not found' });
      }

      const formatted = {
        id: updated[0].id,
        planName: updated[0].plan_name,
        planDescription: updated[0].plan_description,
        price: updated[0].price,
        billingPeriod: updated[0].billing_period,
        features: JSON.parse(updated[0].features),
        isActive: updated[0].is_active,
        displayOrder: updated[0].display_order,
        createdAt: updated[0].created_at,
        updatedAt: updated[0].updated_at,
      };

      app.logger.info({ id }, 'Subscription plan updated successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error, id, body }, 'Failed to update subscription plan');
      throw error;
    }
  });

  // DELETE /api/admin/subscriptions/:id - Delete subscription plan
  fastify.delete('/api/admin/subscriptions/:id', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Deleting subscription plan');
    try {
      const deleted = await app.db
        .delete(adminSubscriptionPlans)
        .where(eq(adminSubscriptionPlans.id, id))
        .returning();

      if (deleted.length === 0) {
        app.logger.warn({ id }, 'Subscription plan not found for deletion');
        return reply.code(404).send({ error: 'Subscription plan not found' });
      }

      app.logger.info({ id }, 'Subscription plan deleted successfully');
      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to delete subscription plan');
      throw error;
    }
  });
}
