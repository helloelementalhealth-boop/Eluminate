import { pgTable, text, timestamp, uuid, integer, date, boolean, foreignKey } from 'drizzle-orm/pg-core';

// Journal entries table
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  mood: text('mood'),
  energy: integer('energy'),
  intention: text('intention'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Nutrition logs table
export const nutritionLogs = pgTable('nutrition_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  meal_type: text('meal_type').notNull(), // breakfast, lunch, dinner, snack
  food_name: text('food_name').notNull(),
  calories: integer('calories').notNull(),
  protein: integer('protein'),
  carbs: integer('carbs'),
  fats: integer('fats'),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Workouts table
export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  workout_type: text('workout_type').notNull(), // strength, cardio, flexibility, sports
  title: text('title').notNull(),
  duration_minutes: integer('duration_minutes').notNull(),
  calories_burned: integer('calories_burned'),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Workout exercises table
export const workoutExercises = pgTable('workout_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  workout_id: uuid('workout_id').notNull().references(() => workouts.id),
  exercise_name: text('exercise_name').notNull(),
  sets: integer('sets'),
  reps: integer('reps'),
  weight: integer('weight'),
  duration_seconds: integer('duration_seconds'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Meditation sessions table
export const meditationSessions = pgTable('meditation_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  practice_type: text('practice_type').notNull(), // breathwork, mindfulness, body_scan, loving_kindness, gratitude
  duration_minutes: integer('duration_minutes').notNull(),
  mood_before: text('mood_before'),
  mood_after: text('mood_after'),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Activities table
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  activity_type: text('activity_type').notNull(), // steps, sleep, water, mood_check
  value: integer('value').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Wellness goals table
export const wellnessGoals = pgTable('wellness_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  goal_type: text('goal_type').notNull(), // daily_calories, daily_protein, weekly_workouts, daily_meditation, daily_steps, daily_water, daily_sleep
  target_value: integer('target_value').notNull(),
  current_streak: integer('current_streak').default(0),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Weekly quotes table
export const weeklyQuotes = pgTable('weekly_quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  quote_text: text('quote_text').notNull(),
  week_start_date: date('week_start_date').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Visual themes table
export const visualThemes = pgTable('visual_themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  theme_name: text('theme_name').notNull(),
  background_color: text('background_color').notNull(),
  card_color: text('card_color').notNull(),
  text_color: text('text_color').notNull(),
  text_secondary_color: text('text_secondary_color').notNull(),
  primary_color: text('primary_color').notNull(),
  secondary_color: text('secondary_color').notNull(),
  accent_color: text('accent_color').notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Rhythm visuals table
export const rhythmVisuals = pgTable('rhythm_visuals', {
  id: uuid('id').primaryKey().defaultRandom(),
  rhythm_category: text('rhythm_category').notNull(), // movement, nourishment, presence, reflection
  rhythm_name: text('rhythm_name').notNull(),
  image_url: text('image_url').notNull(),
  video_url: text('video_url'),
  month_active: integer('month_active').notNull(),
  display_order: integer('display_order').default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// User preferences table
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').default('default_user'),
  selected_theme_id: uuid('selected_theme_id').references(() => visualThemes.id),
  auto_theme_by_time: boolean('auto_theme_by_time').default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Admin content table
export const adminContent = pgTable('admin_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  page_name: text('page_name').notNull(),
  content_type: text('content_type').notNull(), // text, image, video
  content_key: text('content_key').notNull(),
  content_value: text('content_value').notNull(),
  display_order: integer('display_order').default(0),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Admin categories table
export const adminCategories = pgTable('admin_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  category_name: text('category_name').notNull().unique(),
  icon_name: text('icon_name').notNull(),
  route_path: text('route_path').notNull(),
  display_order: integer('display_order').default(0),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Admin subscription plans table
export const adminSubscriptionPlans = pgTable('admin_subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  plan_name: text('plan_name').notNull(),
  plan_description: text('plan_description'),
  price: text('price').notNull(),
  billing_period: text('billing_period').notNull(), // monthly, yearly
  features: text('features').notNull(), // JSON array as text
  is_active: boolean('is_active').default(true),
  display_order: integer('display_order').default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Sleep tools table
export const sleepTools = pgTable('sleep_tools', {
  id: uuid('id').primaryKey().defaultRandom(),
  tool_type: text('tool_type').notNull(), // breathwork, body_scan, sleep_story, ambient_sounds, gratitude, wind_down
  title: text('title').notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  duration_minutes: integer('duration_minutes'),
  is_premium: boolean('is_premium').default(false),
  audio_url: text('audio_url'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
