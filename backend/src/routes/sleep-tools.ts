import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { sleepTools } from '../db/schema.js';
import type { App } from '../index.js';
import { gateway } from '@specific-dev/framework';
import { generateText } from 'ai';

// Helper function to generate sleep tool content using AI
async function generateSleepToolContent(
  toolType: string,
  title: string,
  durationMinutes: number
): Promise<string> {
  let prompt = '';

  switch (toolType) {
    case 'breathwork':
      prompt = `Create detailed, step-by-step instructions for a ${durationMinutes}-minute ${title} breathing exercise for sleep.
Include:
- Opening guidance (grounding the person in their body)
- Clear breathing pattern with counts (e.g., "inhale for 4 counts, hold for 7, exhale for 8")
- 3-4 cycles of the pattern
- Closing guidance to transition to sleep
Use warm, calming language. Focus on the sensation of breath and gentle rhythm.`;
      break;

    case 'body_scan':
      prompt = `Create a detailed ${durationMinutes}-minute progressive body scan relaxation script for sleep.
Include:
- Opening: settling into a comfortable position
- Head-to-toe scan with attention on: forehead, eyes, jaw, neck, shoulders, arms, hands, chest, belly, lower back, hips, legs, feet
- For each area: invite noticing without forcing change, suggest gentle relaxation
- Closing: whole body awareness and transition to sleep
Use warm, inviting language that honors the body's wisdom.`;
      break;

    case 'sleep_story':
      prompt = `Create a ${durationMinutes}-minute calming sleep story titled "${title}".
The story should:
- Begin with sensory details (sights, sounds, textures)
- Feature a peaceful natural setting
- Progress slowly with rhythmic, hypnotic pacing
- Use gentle metaphors and soft imagery
- Include a sense of safety and rest
- Gradually become dreamier and more abstract
- End with deep rest and stillness
Use present tense, warm language, and avoid excitement or conflict. The goal is to guide the listener toward sleep.`;
      break;

    case 'ambient_sounds':
      prompt = `Create a detailed description of a ${durationMinutes}-minute ambient soundscape titled "${title}".
Describe:
- Primary sounds (ocean waves, rain, etc.)
- Secondary ambient layers (wind, distant elements)
- How sounds overlap and create rhythm
- The overall emotional atmosphere
- How the soundscape evolves over time
- The calming effect on the listener
Write as if describing the experience of listening, with evocative sensory language.`;
      break;

    case 'gratitude':
      prompt = `Create a ${durationMinutes}-minute evening gratitude reflection script.
Include:
- Opening: settling into a receptive state
- 3-4 gratitude prompts that are specific and reflective (not generic)
- Space for personal reflection after each prompt
- Prompts like: "Who showed up for me today?", "What did my body offer me?", "What small moment brought ease?"
- Closing: integrating gratitude into sleep
Use warm, inviting language that honors authentic reflection.`;
      break;

    case 'wind_down':
      prompt = `Create a ${durationMinutes}-minute gentle evening stretching and wind-down sequence.
Include:
- 5-6 slow, gentle stretches appropriate for before bed
- For each stretch: clear instructions, breath guidance, and time cues
- Stretches for: neck/shoulders, spine, hips, hamstrings, chest
- Hold times of 30-60 seconds with slow breathing
- Progression from more active to very gentle/restorative
- Final resting position
Use calming language that emphasizes release and preparation for sleep.`;
      break;

    default:
      throw new Error(`Unknown tool type: ${toolType}`);
  }

  const { text } = await generateText({
    model: gateway('openai/gpt-5.2'),
    system:
      'You are a wellness guide creating calming, evidence-informed sleep content. Your writing is warm, human, and aligned with holistic wellbeing practices. You focus on presence, body awareness, and gentle invitation rather than forcing relaxation.',
    prompt,
  });

  return text.trim();
}

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/sleep/tools - Returns all sleep tools (summary list)
  fastify.get('/api/sleep/tools', async (request, reply) => {
    app.logger.info({}, 'Fetching all sleep tools');
    try {
      const tools = await app.db.select().from(sleepTools);

      const formatted = tools.map((tool) => ({
        id: tool.id,
        tool_type: tool.tool_type,
        title: tool.title,
        description: tool.description,
        duration_minutes: tool.duration_minutes,
        is_premium: tool.is_premium,
      }));

      app.logger.info({ count: tools.length }, 'Sleep tools fetched successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch sleep tools');
      throw error;
    }
  });

  // GET /api/sleep/tools/:id - Returns full tool details including content
  fastify.get('/api/sleep/tools/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Fetching sleep tool by ID');
    try {
      const tool = await app.db
        .select()
        .from(sleepTools)
        .where(eq(sleepTools.id, id))
        .limit(1);

      if (tool.length === 0) {
        app.logger.warn({ id }, 'Sleep tool not found');
        return reply.code(404).send({ error: 'Sleep tool not found' });
      }

      const formatted = {
        id: tool[0].id,
        tool_type: tool[0].tool_type,
        title: tool[0].title,
        description: tool[0].description,
        content: tool[0].content,
        duration_minutes: tool[0].duration_minutes,
        is_premium: tool[0].is_premium,
        audio_url: tool[0].audio_url,
      };

      app.logger.info({ id }, 'Sleep tool fetched successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to fetch sleep tool');
      throw error;
    }
  });

  // POST /api/sleep/tools/:id/generate-content - Generate content for sleep tool
  fastify.post('/api/sleep/tools/:id/generate-content', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      duration_minutes: number;
    };

    app.logger.info({ id, body }, 'Generating sleep tool content');
    try {
      // Fetch the tool to get its details
      const tool = await app.db
        .select()
        .from(sleepTools)
        .where(eq(sleepTools.id, id))
        .limit(1);

      if (tool.length === 0) {
        app.logger.warn({ id }, 'Sleep tool not found');
        return reply.code(404).send({ error: 'Sleep tool not found' });
      }

      const toolData = tool[0];

      // Generate content using AI
      app.logger.info({ toolType: toolData.tool_type }, 'Generating AI content for tool');
      const generatedContent = await generateSleepToolContent(
        toolData.tool_type,
        toolData.title,
        body.duration_minutes
      );

      // Update the tool with generated content
      const updated = await app.db
        .update(sleepTools)
        .set({ content: generatedContent })
        .where(eq(sleepTools.id, id))
        .returning();

      app.logger.info({ id, contentLength: generatedContent.length }, 'Sleep tool content generated and saved');
      return { content: updated[0].content };
    } catch (error) {
      app.logger.error({ err: error, id, body }, 'Failed to generate sleep tool content');
      throw error;
    }
  });
}
