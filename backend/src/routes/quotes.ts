import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { weeklyQuotes } from '../db/schema.js';
import type { App } from '../index.js';
import { gateway } from '@specific-dev/framework';
import { generateText } from 'ai';

// Helper function to get Monday of current week
function getMondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// Helper function to generate quote using AI
async function generateQuoteWithAI(): Promise<string> {
  const prompt =
    'Generate a single poetic, encouraging wellness quote (2-3 sentences max) that feels warm, grounding, and aligned with holistic wellbeing. The tone should be elemental, human, and never generic or overly polished. Focus on themes like presence, rhythm, nourishment, movement, and emotional grounding.';

  const { text } = await generateText({
    model: gateway('openai/gpt-5.2'),
    prompt,
  });

  return text;
}

// Helper function to generate personalized wellness intention using AI
async function generateWellnessIntention(): Promise<string> {
  const prompt = `Generate a single personalized wellness intention (1-2 sentences max) that feels like a gentle invitation into deeper self-awareness.
The intention should:
- Feel calming and presence-centered
- Use sensory or body-aware language
- Suggest listening to internal wisdom
- Feel warm and non-prescriptive
- Never use generic wellness clichés
- Focus on themes like rhythm, breath, rest, curiosity, and listening

Examples of good intentions:
- "Notice the rhythm of your breath as you move through today"
- "Let rest be a practice, not a reward"
- "Your body knows what it needs—listen with curiosity"
- "Find one moment today where you slow down enough to hear yourself"

Generate only the intention text, nothing else.`;

  const { text } = await generateText({
    model: gateway('openai/gpt-5.2'),
    prompt,
  });

  return text.trim();
}

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/quotes/current - Returns the current week's quote or generates a new one
  fastify.get('/api/quotes/current', async (request, reply) => {
    const weekStartDate = getMondayOfWeek();

    app.logger.info({ weekStartDate }, 'Fetching current week quote');
    try {
      // Check if quote exists for this week
      const existingQuote = await app.db
        .select()
        .from(weeklyQuotes)
        .where(eq(weeklyQuotes.week_start_date, weekStartDate))
        .limit(1);

      if (existingQuote.length > 0) {
        app.logger.info({ quoteId: existingQuote[0].id }, 'Current week quote found');
        return existingQuote[0];
      }

      // Generate new quote
      app.logger.info({}, 'Generating new quote for current week');
      const quoteText = await generateQuoteWithAI();

      const newQuote = await app.db
        .insert(weeklyQuotes)
        .values({
          quote_text: quoteText,
          week_start_date: weekStartDate,
        })
        .returning();

      app.logger.info({ quoteId: newQuote[0].id }, 'New quote generated and created');
      return newQuote[0];
    } catch (error) {
      app.logger.error({ err: error, weekStartDate }, 'Failed to fetch or generate quote');
      throw error;
    }
  });

  // POST /api/quotes/regenerate - Generates a new quote for the current week
  fastify.post('/api/quotes/regenerate', async (request, reply) => {
    const weekStartDate = getMondayOfWeek();

    app.logger.info({ weekStartDate }, 'Regenerating quote for current week');
    try {
      // Delete existing quote for this week if present
      await app.db.delete(weeklyQuotes).where(eq(weeklyQuotes.week_start_date, weekStartDate));

      // Generate new quote
      app.logger.info({}, 'Generating new quote');
      const quoteText = await generateQuoteWithAI();

      const newQuote = await app.db
        .insert(weeklyQuotes)
        .values({
          quote_text: quoteText,
          week_start_date: weekStartDate,
        })
        .returning();

      app.logger.info({ quoteId: newQuote[0].id }, 'Quote regenerated successfully');
      return newQuote[0];
    } catch (error) {
      app.logger.error({ err: error, weekStartDate }, 'Failed to regenerate quote');
      throw error;
    }
  });

  // POST /api/quotes/generate-intention - Generate personalized wellness intention
  fastify.post('/api/quotes/generate-intention', async (request, reply) => {
    app.logger.info({}, 'Generating wellness intention');
    try {
      const intention = await generateWellnessIntention();

      app.logger.info({ intentionLength: intention.length }, 'Wellness intention generated successfully');
      return { intention };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to generate wellness intention');
      throw error;
    }
  });
}
