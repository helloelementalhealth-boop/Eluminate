
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { dashboardApi, quotesApi, WeeklyQuote, visualsApi, RhythmVisual } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/WidgetContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [weeklyQuote, setWeeklyQuote] = useState<WeeklyQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [movementVisuals, setMovementVisuals] = useState<RhythmVisual[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const loadOverview = React.useCallback(async () => {
    console.log('[HomeScreen] Loading dashboard overview');
    setRefreshing(true);
    try {
      const data = await dashboardApi.getOverview(today);
      setOverview(data);
      console.log('[HomeScreen] Overview loaded:', data);
    } catch (error) {
      console.error('[HomeScreen] Failed to load overview:', error);
    } finally {
      setRefreshing(false);
    }
  }, [today]);

  const loadWeeklyQuote = React.useCallback(async () => {
    console.log('[HomeScreen] Loading weekly quote');
    try {
      const quote = await quotesApi.getCurrentQuote();
      setWeeklyQuote(quote);
      console.log('[HomeScreen] Weekly quote loaded:', quote);
    } catch (error) {
      console.error('[HomeScreen] Failed to load weekly quote:', error);
      setWeeklyQuote({
        id: 'fallback',
        quote_text: 'Welcome to your wellness journey. Take a moment to breathe and be present.',
        week_start_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    }
  }, []);

  const loadMovementVisuals = React.useCallback(async () => {
    console.log('[HomeScreen] Loading movement visuals for current month');
    try {
      const visuals = await visualsApi.getRhythmVisualsByCategory('movement');
      if (visuals && visuals.length > 0) {
        setMovementVisuals(visuals);
        console.log('[HomeScreen] Movement visuals loaded:', visuals.length, 'items');
      } else {
        setMovementVisuals([
          {
            id: '1',
            rhythm_category: 'movement',
            rhythm_name: 'Morning Activation',
            image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
            month_active: new Date().getMonth() + 1,
            display_order: 0,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            rhythm_category: 'movement',
            rhythm_name: 'Restorative Flow',
            image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
            month_active: new Date().getMonth() + 1,
            display_order: 1,
            created_at: new Date().toISOString(),
          },
          {
            id: '3',
            rhythm_category: 'movement',
            rhythm_name: 'Strength Building',
            image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
            month_active: new Date().getMonth() + 1,
            display_order: 2,
            created_at: new Date().toISOString(),
          },
          {
            id: '4',
            rhythm_category: 'movement',
            rhythm_name: 'Evening Unwinding',
            image_url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
            month_active: new Date().getMonth() + 1,
            display_order: 3,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('[HomeScreen] Failed to load movement visuals:', error);
      setMovementVisuals([
        {
          id: '1',
          rhythm_category: 'movement',
          rhythm_name: 'Morning Activation',
          image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
          month_active: new Date().getMonth() + 1,
          display_order: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          rhythm_category: 'movement',
          rhythm_name: 'Restorative Flow',
          image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
          month_active: new Date().getMonth() + 1,
          display_order: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          rhythm_category: 'movement',
          rhythm_name: 'Strength Building',
          image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
          month_active: new Date().getMonth() + 1,
          display_order: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: '4',
          rhythm_category: 'movement',
          rhythm_name: 'Evening Unwinding',
          image_url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
          month_active: new Date().getMonth() + 1,
          display_order: 3,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  const handleRegenerateQuote = async () => {
    console.log('[HomeScreen] User tapped regenerate quote - generating AI-powered intention');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoadingQuote(true);
    try {
      const newQuote = await quotesApi.regenerateQuote();
      setWeeklyQuote(newQuote);
      console.log('[HomeScreen] New AI-generated intention:', newQuote);
    } catch (error) {
      console.error('[HomeScreen] Failed to regenerate quote:', error);
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    loadOverview();
    loadWeeklyQuote();
    loadMovementVisuals();
  }, [loadOverview, loadWeeklyQuote, loadMovementVisuals]);

  const greetingText = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              loadOverview();
              loadWeeklyQuote();
              loadMovementVisuals();
            }} 
            tintColor={theme.primary} 
          />
        }
      >
        {/* Weekly Quote Hero Section - Removed app name */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.heroSection}>
          <View style={styles.heroBackground}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={
                colorScheme === 'dark'
                  ? ['rgba(26, 24, 22, 0.7)', 'rgba(26, 24, 22, 0.95)']
                  : ['rgba(232, 228, 223, 0.7)', 'rgba(232, 228, 223, 0.95)']
              }
              style={styles.heroGradient}
            >
              <View style={styles.header}>
                <Text style={[styles.greeting, { color: theme.textSecondary }]}>
                  {greetingText}
                </Text>
              </View>

              {weeklyQuote && (
                <View style={styles.quoteContainer}>
                  <Text style={[styles.quoteLabel, { color: theme.textSecondary }]}>
                    This Week&apos;s Intention
                  </Text>
                  <Text style={[styles.quoteText, { color: theme.text }]}>
                    &quot;{weeklyQuote.quote_text}&quot;
                  </Text>
                  <TouchableOpacity
                    onPress={handleRegenerateQuote}
                    disabled={loadingQuote}
                    style={[styles.refreshButton, { backgroundColor: theme.card }]}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      ios_icon_name="refresh"
                      android_material_icon_name="refresh"
                      size={16}
                      color={theme.primary}
                    />
                    <Text style={[styles.refreshText, { color: theme.primary }]}>
                      {loadingQuote ? 'Generating...' : 'New Intention'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Movement Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Movement</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Choose what feels right for your body today
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.movementScroll}
          >
            {movementVisuals.map((visual, index) => (
              <Animated.View key={visual.id} entering={FadeInDown.delay(index * 100).duration(400)}>
                <TouchableOpacity
                  style={[styles.movementCard, { backgroundColor: theme.card }]}
                  onPress={() => {
                    console.log('[HomeScreen] User tapped', visual.rhythm_name);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(tabs)/fitness');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.movementImageContainer}>
                    <Image
                      source={{ uri: visual.image_url }}
                      style={styles.movementImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                      style={styles.movementGradient}
                    >
                      <Text style={styles.movementTitle}>{visual.rhythm_name}</Text>
                      {visual.video_url && (
                        <View style={styles.videoIndicator}>
                          <IconSymbol
                            ios_icon_name="play-circle"
                            android_material_icon_name="play-circle-outline"
                            size={16}
                            color="#FFFFFF"
                          />
                          <Text style={styles.videoText}>Video</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Today's Rhythm */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today&apos;s Rhythm</Text>
          <View style={styles.rhythmGrid}>
            <TouchableOpacity
              style={[styles.rhythmCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('[HomeScreen] User tapped Nourishment');
                router.push('/(tabs)/nourishment');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.rhythmIcon, { backgroundColor: theme.info + '20' }]}>
                <IconSymbol
                  ios_icon_name="water-drop"
                  android_material_icon_name="water-drop"
                  size={24}
                  color={theme.info}
                />
              </View>
              <Text style={[styles.rhythmLabel, { color: theme.text }]}>Nourishment</Text>
              <Text style={[styles.rhythmValue, { color: theme.textSecondary }]}>
                {overview?.nutrition?.total_calories || 0}
              </Text>
              <Text style={[styles.rhythmUnit, { color: theme.textSecondary }]}>kcal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rhythmCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('[HomeScreen] User tapped Movement');
                router.push('/(tabs)/movement');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.rhythmIcon, { backgroundColor: theme.error + '20' }]}>
                <IconSymbol
                  ios_icon_name="autorenew"
                  android_material_icon_name="autorenew"
                  size={24}
                  color={theme.error}
                />
              </View>
              <Text style={[styles.rhythmLabel, { color: theme.text }]}>Movement</Text>
              <Text style={[styles.rhythmValue, { color: theme.textSecondary }]}>
                {overview?.workouts?.count || 0}
              </Text>
              <Text style={[styles.rhythmUnit, { color: theme.textSecondary }]}>sessions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rhythmCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('[HomeScreen] User tapped Presence');
                router.push('/(tabs)/mindfulness');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.rhythmIcon, { backgroundColor: theme.success + '20' }]}>
                <IconSymbol
                  ios_icon_name="self-improvement"
                  android_material_icon_name="self-improvement"
                  size={24}
                  color={theme.success}
                />
              </View>
              <Text style={[styles.rhythmLabel, { color: theme.text }]}>Presence</Text>
              <Text style={[styles.rhythmValue, { color: theme.textSecondary }]}>
                {overview?.meditation?.total_minutes || 0}
              </Text>
              <Text style={[styles.rhythmUnit, { color: theme.textSecondary }]}>min</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rhythmCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('[HomeScreen] User tapped Reflection');
                router.push('/(tabs)/(history)/');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.rhythmIcon, { backgroundColor: theme.primary + '20' }]}>
                <IconSymbol
                  ios_icon_name="book"
                  android_material_icon_name="book"
                  size={24}
                  color={theme.primary}
                />
              </View>
              <Text style={[styles.rhythmLabel, { color: theme.text }]}>Reflection</Text>
              <Text style={[styles.rhythmValue, { color: theme.textSecondary }]}>Journal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroBackground: {
    width: '100%',
    minHeight: 320,
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    width: '100%',
    minHeight: 320,
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  quoteContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  quoteLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '500',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  movementScroll: {
    paddingRight: 24,
    gap: 16,
  },
  movementCard: {
    width: 240,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  movementImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  movementImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  movementGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  movementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  videoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  videoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  rhythmGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rhythmCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  rhythmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  rhythmLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rhythmValue: {
    fontSize: 13,
  },
  rhythmUnit: {
    fontSize: 13,
  },
});
