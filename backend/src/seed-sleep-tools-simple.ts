import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';

const schema = { ...appSchema, ...authSchema };

export async function seedSleepTools() {
  const app = await createApplication(schema);

  try {
    // Check if sleep tools already exist
    const existingTools = await app.db.select().from(appSchema.sleepTools);
    if (existingTools.length > 0) {
      console.log('Sleep tools already seeded, skipping');
      return;
    }

    const sleepToolsData = [
      {
        tool_type: 'breathwork',
        title: '4-7-8 Sleep Breathing',
        description: 'A calming breathing technique to quiet the mind and prepare for rest',
        content: 'Detailed breathing instructions: Inhale quietly through your nose for 4 counts, hold your breath for 7 counts, exhale completely through your mouth for 8 counts. Repeat this cycle 4 times. This technique activates your parasympathetic nervous system, signaling your body it\'s time to rest.',
        duration_minutes: 10,
        is_premium: false,
        audio_url: null,
      },
      {
        tool_type: 'body_scan',
        title: 'Progressive Relaxation',
        description: 'Release tension from head to toe with gentle awareness',
        content: 'Begin by bringing awareness to your forehead. Notice any tension and let it soften. Move down to your eyes, jaw, neck, shoulders. Continue through your chest, arms, hands, belly, hips, legs, and feet. With each area, simply notice and allow any tightness to dissolve.',
        duration_minutes: 15,
        is_premium: false,
        audio_url: null,
      },
      {
        tool_type: 'sleep_story',
        title: 'Forest at Twilight',
        description: 'A calming narrative journey through a peaceful evening forest',
        content: 'As the sun sets beyond the trees, you find yourself walking a familiar path through the forest. The air is cool and carries the scent of pine. Birds settle into their evening songs. Each step brings you deeper into tranquility...',
        duration_minutes: 20,
        is_premium: true,
        audio_url: null,
      },
      {
        tool_type: 'ambient_sounds',
        title: 'Ocean Waves & Rain',
        description: 'Natural soundscapes to lull you into deep rest',
        content: 'Gentle ocean waves roll onto the shore in a steady rhythm. Soft rain begins to fall, creating a layered soundscape of nature\'s lullaby. The sounds blend together, washing away the day\'s concerns.',
        duration_minutes: 30,
        is_premium: true,
        audio_url: null,
      },
      {
        tool_type: 'gratitude',
        title: 'Evening Reflection',
        description: 'Close your day with appreciation and presence',
        content: 'Bring to mind three moments from today that brought you joy, comfort, or learning. They can be small: a warm cup of tea, a kind word, a moment of laughter. Hold each one gently in your awareness, feeling the warmth of gratitude.',
        duration_minutes: 5,
        is_premium: false,
        audio_url: null,
      },
      {
        tool_type: 'wind_down',
        title: 'Gentle Evening Stretches',
        description: 'Soft movements to release the day and invite rest',
        content: 'Begin seated or lying down. Gently roll your shoulders back, then forward. Stretch your arms overhead, then let them float down. Twist gently to each side. Move slowly, breathing deeply, letting each movement be an invitation to rest.',
        duration_minutes: 12,
        is_premium: true,
        audio_url: null,
      },
    ];

    // Insert all sleep tools
    const createdTools = await app.db
      .insert(appSchema.sleepTools)
      .values(sleepToolsData)
      .returning();

    console.log(`${createdTools.length} sleep tools seeded successfully`);
  } catch (error) {
    console.error('Failed to seed sleep tools:', error);
    throw error;
  }
}

// Run seed
seedSleepTools()
  .then(() => {
    console.log('Sleep tools seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Sleep tools seed failed:', error);
    process.exit(1);
  });
