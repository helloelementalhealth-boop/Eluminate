import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';
import { eq } from 'drizzle-orm';

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
        description: 'A guided breathing technique to calm the nervous system and prepare for sleep',
        content: `4-7-8 Sleep Breathing Technique

Let yourself settle into a comfortable position, lying down or sitting upright with your spine supported.

Begin by becoming aware of your natural breath. Feel the gentle movement of your body as you breathe. Notice how the air moves in through your nostrils and out again. There's nothing to fix or change right now—just noticing.

When you're ready, we'll begin the 4-7-8 pattern. This is an ancient breathing rhythm that invites your nervous system into rest.

Here's how it works:
- Inhale slowly through your nose for a count of 4 (one, two, three, four)
- Hold your breath gently for a count of 7 (one, two, three, four, five, six, seven)
- Exhale completely through your mouth for a count of 8 (one, two, three, four, five, six, seven, eight)

Let's begin. Find your breath. Inhale for 4... hold for 7... exhale for 8.

Again. Inhale for 4... hold for 7... exhale for 8.

Notice how each exhale feels longer, deeper, more complete. Your body is recognizing this rhythm as a signal to rest.

Once more. Inhale for 4... hold for 7... exhale for 8.

And again. Inhale for 4... hold for 7... exhale for 8.

As you continue with this pattern, your breath becomes your anchor. Each cycle invites you deeper into relaxation. There's nothing to do but breathe and allow your body to settle.

When you're ready to transition to sleep, simply return to your natural breath. Notice how much quieter your mind has become. Your body knows what it needs now—rest.

Allow yourself to drift toward sleep, carrying this calm with you.`,
        duration_minutes: 10,
        is_premium: false,
        audio_url: null,
      },
      {
        tool_type: 'body_scan',
        title: 'Progressive Relaxation',
        description: 'A head-to-toe guided relaxation to release tension and prepare for deep sleep',
        content: `Progressive Body Scan Relaxation

Find yourself in a comfortable place where you can lie down undisturbed. Let your body settle into the surface beneath you. Feel gravity holding you gently.

We're going to move awareness slowly through your entire body, from the crown of your head all the way to your toes. As you notice each area, there's nothing to change or fix—simply allow your attention to rest there, and feel what relaxation naturally wants to happen.

Let's begin with your forehead. Notice the space between your eyebrows. Is there any tension here? Breathe into this area and let it soften. Your forehead can be smooth and easeful.

Now your eyes. Feel the gentle weight of your eyelids. They can be heavy and rested. Your eyes have been working hard—let them rest now.

Move to your jaw. Notice if you're holding tension here—many of us do without realizing. Soften your jaw. Let your teeth part slightly if that feels natural. Let your whole face become heavy and supported.

Bring awareness to your neck. Feel the length of it, the gentle curve. Release any holding here. Your neck can be soft and easy.

Now your shoulders. This is where we often carry the weight of the day. Breathe here. Feel them relax down away from your ears. Let them sink into the surface below you.

Move into your upper back and chest. Feel the rhythm of your breath here. Each exhale invites deeper relaxation. Your chest can be open and easy.

Bring awareness to your arms. From your shoulders all the way down to your fingertips. Feel them becoming heavy, supported, at rest. Your hands can be open and peaceful.

Notice your lower back. Feel where it touches the surface supporting you. You are held. You are safe. Let any tension melt away.

Move to your belly and hips. Breathe into this center. Feel it soften with each breath. Your core can be at ease.

Now your legs. From hips to knees, notice the length of your thighs. Heavy, supported, relaxed. Feel your calves. The backs of your knees. Let them all settle completely.

Finally, bring awareness to your feet and toes. These have carried you all day. Thank them for their service. Let them be completely at rest.

Take a moment to notice your entire body now. You are fully supported. Every part of you is held. There is nothing left to do but breathe and allow sleep to come.

Rest here in this complete ease, drifting gently toward sleep.`,
        duration_minutes: 15,
        is_premium: false,
        audio_url: null,
      },
      {
        tool_type: 'sleep_story',
        title: 'Forest at Twilight',
        description: 'A calming narrative that transports you to a peaceful forest setting as evening falls',
        content: `Forest at Twilight: A Sleep Story

You find yourself walking through an ancient forest as the day softly turns to evening. The light is golden, diffused through the canopy of tall trees. The air is cool and gentle against your skin.

Around you, the world is settling. Birds are returning to their nests, their calls becoming quieter, more distant. The light filters through the leaves in soft, amber rays.

Your feet find a path naturally. The ground beneath you is soft—generations of fallen leaves creating a cushion. With each step, the forest feels more familiar, as though you've been here forever. As though you belong here.

The trees around you are ancient, their bark deep and weathered. They've stood here for centuries, witnessing the turning of seasons. You feel their steadiness, their quiet knowing.

As you walk deeper, the light becomes softer still. Twilight is deepening. The sky above begins to shift from gold to silver. Stars are beginning to appear, just hints of them through the branches.

You notice a clearing ahead. Drawn toward it, you find a small meadow surrounded by these great trees. In the center is a fallen log, weathered smooth by time. It feels like the perfect place to rest.

You settle onto the log. The coolness of the evening wraps around you like a blanket. The meadow smells of earth and pine and something indefinably peaceful.

Around you, the forest is quieting. The hum of day creatures gives way to the gentle sounds of evening. An owl calls, far away. The wind moves softly through the canopy.

Above you, the sky deepens to indigo. More stars emerge. The first star of evening seems to shine just for you. The world is becoming gentler, softer, slower.

Time feels different here. Moments stretch. Your breathing slows to match the rhythm of the forest. Your heartbeat finds a steady, peaceful pace.

The darkness deepens gently, not suddenly, but like coming home to rest. You are safe in this forest. You are witnessed by these ancient trees. You are held by the earth beneath you.

Your thoughts become dreamier. Fewer. The boundary between waking and sleeping begins to blur, like watercolors diffusing into each other.

The forest breathes around you. You breathe with it. One breath. Another. Each breath taking you deeper into ease, deeper into rest, closer to sleep.

The stars multiply above you, a map of peace. The trees stand in their eternal quietness. And you drift... deeper into the night... toward sleep.`,
        duration_minutes: 20,
        is_premium: true,
        audio_url: null,
      },
      {
        tool_type: 'ambient_sounds',
        title: 'Ocean Waves & Rain',
        description: 'A layered soundscape combining gentle ocean waves with soft rainfall for deep sleep',
        content: `Ocean Waves & Rain Soundscape

Close your eyes and imagine yourself in a safe place overlooking the sea, where gentle rain begins to fall.

Primary Layer - Ocean Waves:
Imagine waves rolling onto a distant beach. Not crashing waves, but the gentle, rhythmic sound of water meeting sand. The waves arrive and retreat in a predictable pattern, like breathing. Each wave has a gentle whoosh as it reaches the shore, then a softer, more subtle sound as it retreats, leaving foam behind. This pattern repeats endlessly—a natural rhythm that has existed for millennia. Your nervous system recognizes this rhythm as safe, ancestral, known.

Secondary Layer - Rainfall:
Gently, softly, rain begins to fall. Not a heavy rain, but a gentle patter. The sound starts at the canopy above you—you hear the rain on leaves and branches, creating a soft, whispering sound. Then the rain reaches the ground around you, adding a layer of gentle tapping. The two sounds blend: the soft drumming on natural surfaces.

How They Interweave:
The waves continue their ancient rhythm while the rain adds its own gentle percussion. Sometimes the rain becomes slightly louder, bringing the sound closer. Sometimes it feels more distant. The waves remain constant beneath—the anchor, the foundation. The rain adds texture and softness, variation within consistency.

Emotional Atmosphere:
There's a sense of being held by nature. The ocean is vast and ancient, reminding you that you're part of something much larger than your daily worries. The rain is intimate and close, creating a sense of being sheltered. Together, they create a cocoon of sound—protection and belonging.

How It Evolves:
Over the course of listening, the intensity remains steady but your perception of it shifts. What first feels novel becomes familiar. Your mind, instead of tracking the changes, begins to relax into the pattern. Your breathing naturally synchronizes with the rhythm of the waves.

The Effect:
This soundscape is designed to occupy just enough of your attention that racing thoughts can't intrude. The rhythmic, cyclical nature of waves combined with the gentle randomness of rain creates something both predictable and absorbing—exactly what your brain needs to transition from waking to sleeping.

Let these sounds carry you toward rest.`,
        duration_minutes: 30,
        is_premium: true,
        audio_url: null,
      },
      {
        tool_type: 'gratitude',
        title: 'Evening Reflection',
        description: 'A guided gratitude practice to reflect on the day and settle into rest',
        content: `Evening Reflection: A Gratitude Practice

As you settle into the quiet of evening, let's take a few moments to reflect on your day through the lens of gratitude. Not gratitude that's forced or generic, but genuine noticing of what showed up for you.

Begin by taking a few slow breaths. Feel yourself settling. The day has passed. What remains now is presence and reflection.

First Reflection: Who Showed Up for You?
Think about the people in your day. It could be someone you spent significant time with, or a brief interaction. Who did something that made a difference, even a small one? Maybe someone listened to you. Maybe someone made you laugh. Maybe someone's presence simply felt steady and kind.

Notice who comes to mind. Don't force it—whoever appears naturally is the right person to reflect on. Feel gratitude for their presence in your life. In your own way, acknowledge them silently.

Take a breath with this gratitude.

Second Reflection: What Did Your Body Offer You?
Your body has been working all day, without your constant attention. It's held you, carried you, allowed you to move and experience the world. What did your body do well today?

Maybe you walked somewhere and your legs carried you. Maybe you created something with your hands. Maybe your voice spoke something true. Maybe your body simply rested when it needed to.

Feel gratitude for your body. For its loyalty. For asking for what it needs.

Take a breath with this gratitude.

Third Reflection: What Small Moment Brought Ease?
There was likely one moment—maybe brief, maybe unexpected—where something felt good. A moment of ease, comfort, or unexpected peace. A nice meal. A moment of laughter. Sunlight through a window. A conversation that felt genuine.

Let that moment come to mind. Not the biggest moment of the day, necessarily, but one that brought ease. Sit with it. Feel the gratitude for that ease.

Take a breath with this gratitude.

Fourth Reflection: What Did You Learn About Yourself?
Not a grand realization necessarily. Maybe you noticed you're stronger than you thought. Maybe you learned you need more rest. Maybe you realized something about what matters to you. Maybe you simply noticed a pattern or a feeling.

What small understanding came to you today?

Feel gratitude for that knowing, for the growth of understanding yourself.

Take a breath with this gratitude.

Closing:
You've moved through your day. You've noticed what went well, who helped you, what your body offered, what brought ease, and what you learned. This is a full life. This is a day well-lived.

Carry this gratitude into your rest. Let it be the last thing you hold before sleep claims you.

Sleep well, knowing you are grateful and grateful is you.`,
        duration_minutes: 5,
        is_premium: false,
        audio_url: null,
      },
      {
        tool_type: 'wind_down',
        title: 'Gentle Evening Stretches',
        description: 'A slow, gentle stretching sequence to release tension and prepare for sleep',
        content: `Gentle Evening Stretches: A Wind-Down Sequence

Find yourself in comfortable clothing. Dim the lights. We'll move slowly and gently, with intention. Each stretch is an invitation—never a demand.

Stretch 1: Neck Releases (2 minutes)
Come to a comfortable seated or standing position with your spine tall.

Gently drop your right ear toward your right shoulder. Feel a soft stretch along the left side of your neck. Don't force it—just let gravity do the work. Breathe slowly here for 5-6 breaths. Feel the tension melting.

Return to center. Now drop your left ear toward your left shoulder, balancing the stretch.

Slowly turn your head to look over your right shoulder, feeling the gentle twist. Hold for 5-6 breaths. Return to center. Look over your left shoulder.

As you move, notice how your neck and shoulders begin to release. This area holds so much of the day's tension.

Stretch 2: Shoulder Rolls & Release (2 minutes)
Lift both shoulders up toward your ears on an inhale. Feel the tightness. Hold for a moment.

Exhale and drop them down heavily, releasing completely. Feel the difference. Repeat 4-5 times, getting progressively slower and more deliberate.

Roll your shoulders backward slowly, 5 times. Feel the opening across your chest and front of shoulders.

Roll them forward slowly, releasing any remaining tension.

Stretch 3: Spinal Twist (2 minutes)
Sit upright with your legs extended or crossed comfortably.

Inhale and lengthen your spine. Exhale and gently twist to your right, placing your left hand on your right thigh. Let your right hand rest behind you. Feel the gentle twist from your lower belly all the way up through your chest.

Breathe here slowly for 6-8 breaths. Feel your spine releasing.

Return to center. Repeat on the left side.

This stretch helps digest the day and calm your nervous system.

Stretch 4: Forward Fold (3 minutes)
Standing or sitting, hinge forward from your hips with a long spine. Let your head, neck, and arms hang heavy.

Don't push. Let gravity do the work. Breathe into the back of your legs, your lower back, your neck.

This is a profoundly calming pose. Stay here for 8-10 slow breaths. Feel yourself turning inward, downward, toward rest.

Slowly roll up, one vertebra at a time, until you're upright.

Stretch 5: Hip Openers (3 minutes)
Lie on your back with knees bent. Hug your right knee toward your chest, holding behind the thigh.

Feel a gentle stretch in your right hip and lower back. Breathe slowly. Hold for 6-8 breaths.

Release and repeat with the left knee.

This releases one of the biggest tension-holding areas of your body.

Stretch 6: Reclined Spinal Twist (2 minutes)
Lying on your back, hug both knees to your chest. Then drop both knees to your right while keeping your shoulders flat. Let your head turn left if that feels good.

Feel the gentle twist through your spine. Breathe for 6-8 breaths.

Return to center and repeat on the left side.

Final Position: Legs Up the Wall or Supported Rest (5 minutes)
If possible, lie on your back with your legs up a wall or on a pillow—this inverted position is deeply calming.

If not, simply lie on your back with knees bent, feet flat, arms at your sides.

Let your whole body become heavy. Feel supported by the earth beneath you. Your breathing becomes the only movement.

Stay here as long as feels good. Notice how your body has released, softened, and is now ready for the profound rest of sleep.

When you're ready, slowly roll to one side and make your way to bed.

Your body is prepared. Rest well.`,
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
