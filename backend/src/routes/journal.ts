import type { FastifyInstance } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { journalEntries } from '../db/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/journal/entries - Returns array of journal entries sorted by createdAt desc
  fastify.get('/api/journal/entries', async (request, reply) => {
    app.logger.info({}, 'Fetching all journal entries');
    try {
      const entries = await app.db
        .select()
        .from(journalEntries)
        .orderBy(desc(journalEntries.createdAt));

      app.logger.info({ count: entries.length }, 'Journal entries fetched successfully');
      return entries;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch journal entries');
      throw error;
    }
  });

  // POST /api/journal/entries - Create a new journal entry
  fastify.post('/api/journal/entries', async (request, reply) => {
    const body = request.body as {
      content: string;
      mood?: string;
      energy?: number;
      intention?: string;
    };

    app.logger.info({ body }, 'Creating new journal entry');
    try {
      const entry = await app.db
        .insert(journalEntries)
        .values({
          content: body.content,
          mood: body.mood || null,
          energy: body.energy || null,
          intention: body.intention || null,
        })
        .returning();

      app.logger.info({ entryId: entry[0].id }, 'Journal entry created successfully');
      return entry[0];
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to create journal entry');
      throw error;
    }
  });

  // GET /api/journal/entries/:id - Returns single entry
  fastify.get('/api/journal/entries/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Fetching journal entry by ID');
    try {
      const entry = await app.db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, id))
        .limit(1);

      if (entry.length === 0) {
        app.logger.warn({ id }, 'Journal entry not found');
        return reply.code(404).send({ error: 'Journal entry not found' });
      }

      app.logger.info({ id }, 'Journal entry fetched successfully');
      return entry[0];
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to fetch journal entry');
      throw error;
    }
  });

  // PUT /api/journal/entries/:id - Update journal entry
  fastify.put('/api/journal/entries/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      content?: string;
      mood?: string;
      energy?: number;
      intention?: string;
    };

    app.logger.info({ id, body }, 'Updating journal entry');
    try {
      // Build update object with only provided fields
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (body.content !== undefined) {
        updateData.content = body.content;
      }
      if (body.mood !== undefined) {
        updateData.mood = body.mood;
      }
      if (body.energy !== undefined) {
        updateData.energy = body.energy;
      }
      if (body.intention !== undefined) {
        updateData.intention = body.intention;
      }

      const updated = await app.db
        .update(journalEntries)
        .set(updateData)
        .where(eq(journalEntries.id, id))
        .returning();

      if (updated.length === 0) {
        app.logger.warn({ id }, 'Journal entry not found for update');
        return reply.code(404).send({ error: 'Journal entry not found' });
      }

      app.logger.info({ id }, 'Journal entry updated successfully');
      return updated[0];
    } catch (error) {
      app.logger.error({ err: error, id, body }, 'Failed to update journal entry');
      throw error;
    }
  });

  // DELETE /api/journal/entries/:id - Delete journal entry
  fastify.delete('/api/journal/entries/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Deleting journal entry');
    try {
      const deleted = await app.db
        .delete(journalEntries)
        .where(eq(journalEntries.id, id))
        .returning();

      if (deleted.length === 0) {
        app.logger.warn({ id }, 'Journal entry not found for deletion');
        return reply.code(404).send({ error: 'Journal entry not found' });
      }

      app.logger.info({ id }, 'Journal entry deleted successfully');
      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to delete journal entry');
      throw error;
    }
  });
}
