
import { StyleSheet } from 'react-native';

// Muted, moody, natural color palette for wellness
export const colors = {
  // Light theme - muted, natural tones
  light: {
    background: '#E8E4DF',        // Muted warm gray
    card: '#F5F3F0',              // Soft off-white
    text: '#2A2826',              // Deep charcoal
    textSecondary: '#6B6662',     // Muted brown-gray
    primary: '#8B7355',           // Earthy brown
    secondary: '#A89B8E',         // Warm stone
    accent: '#6D5D4B',            // Deep earth
    highlight: '#D4CEC7',         // Soft taupe
    border: '#C9C3BC',            // Subtle border
    shadow: 'rgba(0, 0, 0, 0.12)',
    success: '#7A8B6F',           // Muted sage
    warning: '#B89968',           // Warm ochre
    error: '#A67B6B',             // Soft terracotta
  },
  // Dark theme - deep, moody, grounding
  dark: {
    background: '#1A1816',        // Deep charcoal-brown
    card: '#252321',              // Elevated dark surface
    text: '#E8E4DF',              // Soft warm white
    textSecondary: '#8B8580',     // Muted gray
    primary: '#A89B8E',           // Warm stone
    secondary: '#3A3632',         // Deep gray-brown
    accent: '#C4B5A6',            // Light earth
    highlight: '#2F2D2A',         // Subtle highlight
    border: '#3A3632',            // Subtle border
    shadow: 'rgba(0, 0, 0, 0.4)',
    success: '#8B9B7F',           // Muted sage
    warning: '#C4A876',           // Warm ochre
    error: '#B88B7B',             // Soft terracotta
  },
};

// Mood colors for journaling - muted and natural
export const moodColors = {
  calm: '#7A8B9B',        // Muted blue-gray
  energized: '#C4A876',   // Warm ochre
  reflective: '#8B7A9B',  // Muted purple-gray
  restless: '#B88B7B',    // Soft terracotta
  grateful: '#8B9B7F',    // Muted sage
  uncertain: '#9B8B7A',   // Neutral taupe
};

// Practice type colors for meditation
export const practiceColors = {
  breathwork: '#7A8B9B',
  mindfulness: '#8B9B7F',
  body_scan: '#9B8B7A',
  loving_kindness: '#B88B7B',
  gratitude: '#C4A876',
};

// Workout type colors
export const workoutColors = {
  strength: '#8B7355',
  cardio: '#B88B7B',
  flexibility: '#8B9B7F',
  sports: '#7A8B9B',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
});
