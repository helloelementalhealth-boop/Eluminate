import type { FastifyInstance } from 'fastify';
import { gateway } from '@specific-dev/framework';
import { generateText } from 'ai';
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
  // POST /api/admin/ai/generate-content - Generate content based on prompt
  fastify.post('/api/admin/ai/generate-content', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    const body = request.body as {
      prompt: string;
      contentType: 'text' | 'description' | 'features';
      context?: string;
    };

    app.logger.info({ body }, 'Generating AI content');
    try {
      let systemPrompt = 'You are a helpful content writer for a wellness application.';

      if (body.contentType === 'text') {
        systemPrompt = 'You are a wellness content expert. Create clear, engaging, and helpful text content.';
      } else if (body.contentType === 'description') {
        systemPrompt =
          'You are a product description expert. Create concise, compelling descriptions that highlight benefits and value.';
      } else if (body.contentType === 'features') {
        systemPrompt =
          'You are a features expert. Create clear, benefit-focused feature descriptions that resonate with users.';
      }

      const fullPrompt = body.context ? `${body.context}\n\n${body.prompt}` : body.prompt;

      const { text } = await generateText({
        model: gateway('openai/gpt-5.2'),
        system: systemPrompt,
        prompt: fullPrompt,
      });

      app.logger.info({ contentType: body.contentType }, 'AI content generated successfully');
      return { generatedContent: text };
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to generate AI content');
      throw error;
    }
  });

  // POST /api/admin/ai/improve-content - Improve existing content
  fastify.post('/api/admin/ai/improve-content', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    const body = request.body as {
      content: string;
      improvementType: 'clarity' | 'tone' | 'length' | 'engagement';
    };

    app.logger.info({ improvementType: body.improvementType }, 'Improving AI content');
    try {
      let prompt = '';

      if (body.improvementType === 'clarity') {
        prompt = `Improve the clarity of this content while keeping it concise:\n\n${body.content}`;
      } else if (body.improvementType === 'tone') {
        prompt = `Rewrite this content to have a warmer, more human tone that aligns with wellness and wellbeing:\n\n${body.content}`;
      } else if (body.improvementType === 'length') {
        prompt = `Make this content more concise while retaining all important information:\n\n${body.content}`;
      } else if (body.improvementType === 'engagement') {
        prompt = `Rewrite this content to be more engaging and compelling:\n\n${body.content}`;
      }

      const { text } = await generateText({
        model: gateway('openai/gpt-5.2'),
        system: 'You are an expert content editor. Improve the provided content while maintaining its core message and purpose.',
        prompt,
      });

      app.logger.info({ improvementType: body.improvementType }, 'AI content improved successfully');
      return { improvedContent: text };
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to improve AI content');
      throw error;
    }
  });

  // POST /api/admin/ai/generate-features - Generate feature list for subscription plan
  fastify.post('/api/admin/ai/generate-features', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    const body = request.body as {
      planName: string;
      planType: 'basic' | 'premium' | 'enterprise';
    };

    app.logger.info({ body }, 'Generating subscription plan features');
    try {
      let tierDescription = '';

      if (body.planType === 'basic') {
        tierDescription = 'Basic tier - essential features for getting started';
      } else if (body.planType === 'premium') {
        tierDescription =
          'Premium tier - advanced features for engaged users who want more capabilities';
      } else if (body.planType === 'enterprise') {
        tierDescription =
          'Enterprise tier - comprehensive features for power users and teams';
      }

      const prompt = `Generate a feature list for a wellness app subscription plan.
Plan Name: ${body.planName}
Tier: ${tierDescription}

Create 5-7 specific, benefit-focused features for this plan. Each feature should:
- Be a concrete capability or benefit
- Be specific to wellness/wellbeing
- Be appropriate for this tier level
- Highlight unique value

Return ONLY a JSON array of feature strings, no other text.
Example format: ["Feature 1", "Feature 2", "Feature 3"]`;

      const { text } = await generateText({
        model: gateway('openai/gpt-5.2'),
        system:
          'You are a product manager for a wellness app. Generate practical, benefit-focused feature lists for subscription tiers.',
        prompt,
      });

      try {
        const features = JSON.parse(text);
        app.logger.info({ planType: body.planType, count: features.length }, 'Subscription features generated successfully');
        return { features };
      } catch {
        app.logger.warn({ text }, 'Failed to parse features as JSON, returning as array');
        const featureArray = text
          .split('\n')
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) => line.replace(/^[-•*]\s*/, '').trim());
        return { features: featureArray };
      }
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to generate subscription features');
      throw error;
    }
  });
}
