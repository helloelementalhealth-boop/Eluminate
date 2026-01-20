
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
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { dashboardApi } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<any>(null);

  const today = new Date().toISOString().split('T')[0];

  const loadOverview = async () => {
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
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const QuickStatCard = ({ 
    icon, 
    label, 
    value, 
    unit, 
    color,
    onPress 
  }: { 
    icon: string; 
    label: string; 
    value: string | number; 
    unit?: string; 
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.statCard, { backgroundColor: theme.card }]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <IconSymbol
          ios_icon_name={icon}
          android_material_icon_name={icon}
          size={24}
          color={color}
        />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>
        {value}
        {unit && <Text style={[styles.statUnit, { color: theme.textSecondary }]}> {unit}</Text>}
      </Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );

  const SectionCard = ({
    title,
    icon,
    children,
    onPress,
  }: {
    title: string;
    icon: string;
    children: React.ReactNode;
    onPress?: () => void;
  }) => (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[styles.sectionCard, { backgroundColor: theme.card }]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <IconSymbol
              ios_icon_name={icon}
              android_material_icon_name={icon}
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
          </View>
          <IconSymbol
            ios_icon_name="chevron-right"
            android_material_icon_name="chevron-right"
            size={20}
            color={theme.textSecondary}
          />
        </View>
      </TouchableOpacity>
      {children}
    </Animated.View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>Your Wellness</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadOverview} tintColor={theme.primary} />
          }
        >
          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <QuickStatCard
              icon="local-fire-department"
              label="Calories"
              value={overview?.nutrition?.total_calories || 0}
              unit="kcal"
              color={theme.warning}
              onPress={() => router.push('/(tabs)/nutrition')}
            />
            <QuickStatCard
              icon="fitness-center"
              label="Workouts"
              value={overview?.workouts?.count || 0}
              color={theme.error}
              onPress={() => router.push('/(tabs)/fitness')}
            />
            <QuickStatCard
              icon="self-improvement"
              label="Meditation"
              value={overview?.meditation?.total_minutes || 0}
              unit="min"
              color={theme.success}
              onPress={() => router.push('/(tabs)/mindfulness')}
            />
            <QuickStatCard
              icon="directions-walk"
              label="Steps"
              value={overview?.activities?.steps || 0}
              color={theme.primary}
              onPress={() => router.push('/(tabs)/profile')}
            />
          </View>

          {/* Journal Section */}
          <SectionCard
            title="Reflections"
            icon="book"
            onPress={() => router.push('/(tabs)/(history)/')}
          >
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/(tabs)/(home)/')}
              activeOpacity={0.8}
            >
              <IconSymbol
                ios_icon_name="add"
                android_material_icon_name="add"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>New Entry</Text>
            </TouchableOpacity>
          </SectionCard>

          {/* Today's Progress */}
          <SectionCard title="Today's Progress" icon="trending-up">
            <View style={styles.progressList}>
              {overview?.goals_progress?.slice(0, 3).map((goal: any, index: number) => (
                <View key={index} style={styles.progressItem}>
                  <View style={styles.progressInfo}>
                    <Text style={[styles.progressLabel, { color: theme.text }]}>
                      {goal.goal_type.replace(/_/g, ' ')}
                    </Text>
                    <Text style={[styles.progressValue, { color: theme.textSecondary }]}>
                      {goal.current} / {goal.target}
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.highlight }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(goal.percentage, 100)}%`,
                          backgroundColor: goal.on_track ? theme.success : theme.warning,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </SectionCard>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: theme.card }]}
              onPress={() => router.push('/(tabs)/nutrition')}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="restaurant"
                android_material_icon_name="restaurant"
                size={28}
                color={theme.primary}
              />
              <Text style={[styles.quickActionText, { color: theme.text }]}>Log Meal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: theme.card }]}
              onPress={() => router.push('/(tabs)/fitness')}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="fitness-center"
                android_material_icon_name="fitness-center"
                size={28}
                color={theme.primary}
              />
              <Text style={[styles.quickActionText, { color: theme.text }]}>Start Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: theme.card }]}
              onPress={() => router.push('/(tabs)/mindfulness')}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="self-improvement"
                android_material_icon_name="self-improvement"
                size={28}
                color={theme.primary}
              />
              <Text style={[styles.quickActionText, { color: theme.text }]}>Meditate</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 16,
    fontWeight: '400',
  },
  statLabel: {
    fontSize: 13,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressList: {
    gap: 16,
  },
  progressItem: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  progressValue: {
    fontSize: 13,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
