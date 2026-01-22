
import Constants from 'expo-constants';

// Get backend URL from app.json configuration
export const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || '';

console.log('[API] Backend URL configured:', BACKEND_URL);

// Type definitions
export type Mood = 'calm' | 'energized' | 'reflective' | 'restless' | 'grateful' | 'uncertain';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type WorkoutType = 'strength' | 'cardio' | 'flexibility' | 'sports';
export type PracticeType = 'breathwork' | 'mindfulness' | 'body_scan' | 'loving_kindness' | 'gratitude';
export type ActivityType = 'steps' | 'sleep' | 'water' | 'mood_check';
export type GoalType = 'daily_calories' | 'daily_protein' | 'weekly_workouts' | 'daily_meditation' | 'daily_steps' | 'daily_water' | 'daily_sleep';
export type SleepToolType = 'breathwork' | 'body_scan' | 'sleep_story' | 'ambient_sounds' | 'gratitude' | 'wind_down';

export interface JournalEntry {
  id: string;
  content: string;
  mood?: Mood;
  energy?: number;
  intention?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionLog {
  id: string;
  date: string;
  meal_type: MealType;
  food_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  notes?: string;
  created_at: string;
}

export interface WorkoutExercise {
  id?: string;
  exercise_name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration_seconds?: number;
}

export interface Workout {
  id: string;
  date: string;
  workout_type: WorkoutType;
  title: string;
  duration_minutes: number;
  calories_burned?: number;
  notes?: string;
  exercises?: WorkoutExercise[];
  created_at: string;
}

export interface MeditationSession {
  id: string;
  date: string;
  practice_type: PracticeType;
  duration_minutes: number;
  mood_before?: string;
  mood_after?: string;
  notes?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  date: string;
  activity_type: ActivityType;
  value: number;
  notes?: string;
  created_at: string;
}

export interface WellnessGoal {
  id: string;
  goal_type: GoalType;
  target_value: number;
  current_streak: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SleepTool {
  id: string;
  tool_type: SleepToolType;
  title: string;
  description: string;
  content?: string;
  duration_minutes: number;
  is_premium: boolean;
  audio_url?: string;
  created_at: string;
}

// API helper function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  console.log(`[API] ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error ${response.status}:`, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[API] Success:`, data);
    return data;
  } catch (error) {
    console.error('[API] Request failed:', error);
    throw error;
  }
}

// Journal API
export const journalApi = {
  async getEntries(): Promise<JournalEntry[]> {
    return apiCall<JournalEntry[]>('/api/journal/entries', { method: 'GET' });
  },
  async createEntry(input: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> {
    return apiCall<JournalEntry>('/api/journal/entries', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async deleteEntry(id: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/api/journal/entries/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
};

// Nutrition API
export const nutritionApi = {
  async getLogs(date?: string): Promise<NutritionLog[]> {
    const query = date ? `?date=${date}` : '';
    return apiCall<NutritionLog[]>(`/api/nutrition/logs${query}`, { method: 'GET' });
  },
  async createLog(input: Omit<NutritionLog, 'id' | 'created_at'>): Promise<NutritionLog> {
    return apiCall<NutritionLog>('/api/nutrition/logs', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async getSummary(date: string): Promise<any> {
    return apiCall<any>(`/api/nutrition/summary?date=${date}`, { method: 'GET' });
  },
  async deleteLog(id: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/api/nutrition/logs/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
};

// Workout API
export const workoutApi = {
  async getWorkouts(date?: string): Promise<Workout[]> {
    const query = date ? `?date=${date}` : '';
    return apiCall<Workout[]>(`/api/workouts${query}`, { method: 'GET' });
  },
  async createWorkout(input: Omit<Workout, 'id' | 'created_at'>): Promise<Workout> {
    return apiCall<Workout>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async getWorkout(id: string): Promise<Workout> {
    return apiCall<Workout>(`/api/workouts/${id}`, { method: 'GET' });
  },
  async deleteWorkout(id: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/api/workouts/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
};

// Meditation API
export const meditationApi = {
  async getSessions(date?: string): Promise<MeditationSession[]> {
    const query = date ? `?date=${date}` : '';
    return apiCall<MeditationSession[]>(`/api/meditation/sessions${query}`, { method: 'GET' });
  },
  async createSession(input: Omit<MeditationSession, 'id' | 'created_at'>): Promise<MeditationSession> {
    return apiCall<MeditationSession>('/api/meditation/sessions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async getStats(): Promise<any> {
    return apiCall<any>('/api/meditation/stats', { method: 'GET' });
  },
  async deleteSession(id: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/api/meditation/sessions/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
};

// Activity API
export const activityApi = {
  async getActivities(date?: string, type?: ActivityType): Promise<Activity[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (type) params.append('type', type);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall<Activity[]>(`/api/activities${query}`, { method: 'GET' });
  },
  async createActivity(input: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    return apiCall<Activity>('/api/activities', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async getSummary(date: string): Promise<any> {
    return apiCall<any>(`/api/activities/summary?date=${date}`, { method: 'GET' });
  },
  async deleteActivity(id: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/api/activities/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
};

// Goals API
export const goalsApi = {
  async getGoals(): Promise<WellnessGoal[]> {
    return apiCall<WellnessGoal[]>('/api/goals', { method: 'GET' });
  },
  async createGoal(input: { goal_type: GoalType; target_value: number }): Promise<WellnessGoal> {
    return apiCall<WellnessGoal>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async updateGoal(id: string, input: { target_value?: number; is_active?: boolean }): Promise<WellnessGoal> {
    return apiCall<WellnessGoal>(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  async getProgress(date: string): Promise<any> {
    return apiCall<any>(`/api/goals/progress?date=${date}`, { method: 'GET' });
  },
  async deleteGoal(id: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/api/goals/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
};

// Dashboard API
export const dashboardApi = {
  async getOverview(date: string): Promise<any> {
    return apiCall<any>(`/api/dashboard/overview?date=${date}`, { method: 'GET' });
  },
};

// Quotes API
export interface WeeklyQuote {
  id: string;
  quote_text: string;
  week_start_date: string;
  created_at: string;
}

export const quotesApi = {
  async getCurrentQuote(): Promise<WeeklyQuote> {
    return apiCall<WeeklyQuote>('/api/quotes/current', { method: 'GET' });
  },
  async regenerateQuote(): Promise<WeeklyQuote> {
    return apiCall<WeeklyQuote>('/api/quotes/regenerate', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};

// Visual Themes API
export interface VisualTheme {
  id: string;
  theme_name: string;
  background_color: string;
  card_color: string;
  text_color: string;
  text_secondary_color: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  is_active: boolean;
  created_at: string;
}

export const themesApi = {
  async getThemes(): Promise<VisualTheme[]> {
    return apiCall<VisualTheme[]>('/api/themes', { method: 'GET' });
  },
  async getTheme(id: string): Promise<VisualTheme> {
    return apiCall<VisualTheme>(`/api/themes/${id}`, { method: 'GET' });
  },
};

// Rhythm Visuals API
export interface RhythmVisual {
  id: string;
  rhythm_category: 'movement' | 'nourishment' | 'presence' | 'reflection';
  rhythm_name: string;
  image_url: string;
  video_url?: string;
  month_active: number;
  display_order: number;
  created_at: string;
}

export const visualsApi = {
  async getRhythmVisuals(): Promise<RhythmVisual[]> {
    return apiCall<RhythmVisual[]>('/api/visuals/rhythms', { method: 'GET' });
  },
  async getRhythmVisualsByCategory(category: string): Promise<RhythmVisual[]> {
    return apiCall<RhythmVisual[]>(`/api/visuals/rhythms/${category}`, { method: 'GET' });
  },
};

// User Preferences API
export interface UserPreferences {
  id: string;
  user_id: string;
  selected_theme_id?: string;
  auto_theme_by_time: boolean;
  theme_details?: VisualTheme;
  created_at: string;
  updated_at: string;
}

export const preferencesApi = {
  async getPreferences(): Promise<UserPreferences> {
    return apiCall<UserPreferences>('/api/preferences', { method: 'GET' });
  },
  async updatePreferences(input: { selected_theme_id?: string; auto_theme_by_time?: boolean }): Promise<UserPreferences> {
    return apiCall<UserPreferences>('/api/preferences', {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  async getCurrentTheme(): Promise<VisualTheme> {
    return apiCall<VisualTheme>('/api/preferences/current-theme', { method: 'GET' });
  },
};

// Sleep Tools API
export const sleepApi = {
  async getTools(): Promise<SleepTool[]> {
    return apiCall<SleepTool[]>('/api/sleep/tools', { method: 'GET' });
  },
  async getTool(id: string): Promise<SleepTool> {
    return apiCall<SleepTool>(`/api/sleep/tools/${id}`, { method: 'GET' });
  },
  async createTool(input: Omit<SleepTool, 'id' | 'created_at'>): Promise<SleepTool> {
    return apiCall<SleepTool>('/api/sleep/tools', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async updateTool(id: string, input: Partial<Omit<SleepTool, 'id' | 'created_at'>>): Promise<SleepTool> {
    return apiCall<SleepTool>(`/api/sleep/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  async deleteTool(id: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/api/sleep/tools/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
  async generateContent(id: string, durationMinutes: number): Promise<{ content: string }> {
    return apiCall<{ content: string }>(`/api/sleep/tools/${id}/generate-content`, {
      method: 'POST',
      body: JSON.stringify({ duration_minutes: durationMinutes }),
    });
  },
};
