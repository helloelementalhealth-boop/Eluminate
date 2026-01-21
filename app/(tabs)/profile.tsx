
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { activityApi, goalsApi } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTheme, useAdminAuth } from '@/contexts/WidgetContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme } = useTheme();
  const { isAdmin } = useAdminAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const loadData = React.useCallback(async () => {
    console.log('[ProfileScreen] Loading profile data');
    setRefreshing(true);
    try {
      const [activitiesData, goalsData] = await Promise.all([
        activityApi.getSummary(today),
        goalsApi.getGoals(),
      ]);
      setActivities(activitiesData);
      setGoals(goalsData);
      console.log('[ProfileScreen] Data loaded');
    } catch (error) {
      console.error('[ProfileScreen] Failed to load data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpgrade = () => {
    Alert.alert(
      'FlōWell Premium',
      'Unlock advanced features:\n\n- Personalized wellness plans\n- Advanced analytics & insights\n- Guided meditation library\n- Custom workout programs\n- Nutrition meal planning\n- Priority support',
      [
        { text: 'Maybe Later', style: 'cancel' },
        {
          text: 'Upgrade Now',
          onPress: () => {
            console.log('[ProfileScreen] User tapped Upgrade Now');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Coming Soon', 'Premium subscriptions will be available soon!');
          },
        },
      ]
    );
  };

  const ActivityCard = ({
    icon,
    label,
    value,
    unit,
    color,
  }: {
    icon: string;
    label: string;
    value: number;
    unit: string;
    color: string;
  }) => (
    <View style={[styles.activityCard, { backgroundColor: theme.card }]}>
      <View style={[styles.activityIcon, { backgroundColor: color + '20' }]}>
        <IconSymbol ios_icon_name={icon} android_material_icon_name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.activityValue, { color: theme.text }]}>
        {value}
        <Text style={[styles.activityUnit, { color: theme.textSecondary }]}> {unit}</Text>
      </Text>
      <Text style={[styles.activityLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        {isAdmin && (
          <TouchableOpacity
            onPress={() => {
              console.log('[ProfileScreen] Admin tapped Admin Control');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/admin/');
            }}
            style={[styles.adminButton, { backgroundColor: theme.success + '20' }]}
          >
            <IconSymbol
              ios_icon_name="settings"
              android_material_icon_name="settings"
              size={20}
              color={theme.success}
            />
            <View style={[styles.adminBadge, { backgroundColor: theme.success }]}>
              <Text style={styles.adminBadgeText}>✓</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={theme.primary} />
        }
      >
        {/* Premium Card */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.premiumCard, { backgroundColor: theme.primary }]}
        >
          <View style={styles.premiumContent}>
            <View style={styles.premiumBadge}>
              <IconSymbol ios_icon_name="star" android_material_icon_name="star" size={16} color="#FFFFFF" />
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
            <Text style={styles.premiumTitle}>Unlock Your Full Potential</Text>
            <Text style={styles.premiumSubtitle}>
              Get personalized insights, advanced tracking, and exclusive content
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
              activeOpacity={0.8}
            >
              <Text style={[styles.upgradeButtonText, { color: theme.primary }]}>
                Upgrade to Premium
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Daily Activity */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today&apos;s Activity</Text>
          <View style={styles.activityGrid}>
            <ActivityCard
              icon="directions-walk"
              label="Steps"
              value={activities?.steps || 0}
              unit="steps"
              color={theme.primary}
            />
            <ActivityCard
              icon="bedtime"
              label="Sleep"
              value={activities?.sleep_hours || 0}
              unit="hours"
              color={theme.success}
            />
            <ActivityCard
              icon="water-drop"
              label="Water"
              value={activities?.water_glasses || 0}
              unit="glasses"
              color={theme.warning}
            />
            <ActivityCard
              icon="mood"
              label="Mood"
              value={activities?.mood_rating || 0}
              unit="/10"
              color={theme.error}
            />
          </View>
        </Animated.View>

        {/* Wellness Goals */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Wellness Goals</Text>
          {goals.length === 0 ? (
            <View style={[styles.goalsCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.emptyGoalsText, { color: theme.textSecondary }]}>
                No goals set yet. Set your first wellness goal to start tracking progress.
              </Text>
            </View>
          ) : (
            goals.slice(0, 5).map((goal, index) => (
              <View key={goal.id} style={[styles.goalCard, { backgroundColor: theme.card }]}>
                <View style={styles.goalHeader}>
                  <Text style={[styles.goalTitle, { color: theme.text }]}>
                    {goal.goal_type.replace(/_/g, ' ')}
                  </Text>
                  <Text style={[styles.goalStreak, { color: theme.primary }]}>
                    {goal.current_streak} day streak
                  </Text>
                </View>
                <Text style={[styles.goalTarget, { color: theme.textSecondary }]}>
                  Target: {goal.target_value}
                </Text>
              </View>
            ))
          )}
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
            <TouchableOpacity 
              style={styles.settingItem} 
              activeOpacity={0.7}
              onPress={() => {
                console.log('[ProfileScreen] User tapped Visual Themes');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/theme-settings');
              }}
            >
              <View style={styles.settingLeft}>
                <IconSymbol
                  ios_icon_name="palette"
                  android_material_icon_name="palette"
                  size={20}
                  color={theme.text}
                />
                <Text style={[styles.settingText, { color: theme.text }]}>Visual Themes</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron-right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <IconSymbol
                  ios_icon_name="notifications"
                  android_material_icon_name="notifications"
                  size={20}
                  color={theme.text}
                />
                <Text style={[styles.settingText, { color: theme.text }]}>Notifications</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron-right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <IconSymbol
                  ios_icon_name="lock"
                  android_material_icon_name="lock"
                  size={20}
                  color={theme.text}
                />
                <Text style={[styles.settingText, { color: theme.text }]}>Privacy</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron-right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <IconSymbol
                  ios_icon_name="help"
                  android_material_icon_name="help"
                  size={20}
                  color={theme.text}
                />
                <Text style={[styles.settingText, { color: theme.text }]}>Help & Support</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron-right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  adminButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  adminBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  premiumCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  premiumContent: {
    gap: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  premiumSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    lineHeight: 22,
  },
  upgradeButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  activityCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  activityValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  activityUnit: {
    fontSize: 14,
    fontWeight: '400',
  },
  activityLabel: {
    fontSize: 13,
  },
  goalsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyGoalsText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  goalCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  goalStreak: {
    fontSize: 13,
    fontWeight: '500',
  },
  goalTarget: {
    fontSize: 13,
  },
  settingsCard: {
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  settingDivider: {
    height: 1,
    marginHorizontal: 16,
  },
});
