
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { activityApi, goalsApi } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/WidgetContext';
import { Stack } from 'expo-router';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activityData, setActivityData] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const loadData = React.useCallback(async () => {
    console.log('[ProfileScreen] Loading activity data and goals');
    setRefreshing(true);
    try {
      const [summary, goalsData] = await Promise.all([
        activityApi.getSummary(today),
        goalsApi.getGoals(),
      ]);
      setActivityData(summary);
      setGoals(goalsData);
      console.log('[ProfileScreen] Data loaded successfully');
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
    console.log('[ProfileScreen] User tapped Upgrade to Premium');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Premium Features',
      'Unlock advanced tools, personalized insights, and exclusive content with Eluminate Premium.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Learn More', onPress: () => console.log('Navigate to premium info') },
      ]
    );
  };

  const handleThemeSettings = () => {
    console.log('[ProfileScreen] User tapped Theme Settings');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/theme-settings' as any);
  };

  const handlePrivacy = () => {
    console.log('[ProfileScreen] User tapped Privacy Policy');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/privacy-policy' as any);
  };

  const handleTerms = () => {
    console.log('[ProfileScreen] User tapped Terms of Service');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/terms-of-service' as any);
  };

  const handleHelp = () => {
    console.log('[ProfileScreen] User tapped Help & Support');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/help-support' as any);
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
  }) => {
    const displayValue = value.toString();
    const displayUnit = unit;
    
    return (
      <View style={[styles.activityCard, { backgroundColor: theme.card }]}>
        <View style={[styles.activityIcon, { backgroundColor: color + '20' }]}>
          <IconSymbol
            ios_icon_name={icon}
            android_material_icon_name={icon}
            size={24}
            color={color}
          />
        </View>
        <Text style={[styles.activityLabel, { color: theme.textSecondary }]}>
          {label}
        </Text>
        <View style={styles.activityValueRow}>
          <Text style={[styles.activityValue, { color: theme.text }]}>
            {displayValue}
          </Text>
          <Text style={[styles.activityUnit, { color: theme.textSecondary }]}>
            {displayUnit}
          </Text>
        </View>
      </View>
    );
  };

  const greetingText = 'Your Wellness Profile';
  const premiumBadgeText = 'Premium';
  const upgradeButtonText = 'Upgrade to Premium';
  const todayActivityTitle = 'Today\'s Activity';
  const settingsTitle = 'Settings';
  const themeText = 'Visual Themes';
  const themeDescriptionText = 'Customize your color palette';
  const privacyText = 'Privacy Policy';
  const privacyDescriptionText = 'How we protect your data';
  const termsText = 'Terms of Service';
  const termsDescriptionText = 'Our terms and conditions';
  const helpText = 'Help & Support';
  const helpDescriptionText = 'Get assistance and answers';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Profile',
          headerLargeTitle: true,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={loadData} 
              tintColor={theme.primary} 
            />
          }
        >
          {/* Premium Card */}
          <Animated.View entering={FadeInDown.delay(0).duration(400)}>
            <View style={[styles.premiumCard, { backgroundColor: theme.primary }]}>
              <View style={styles.premiumContent}>
                <View style={styles.premiumBadge}>
                  <IconSymbol
                    ios_icon_name="star"
                    android_material_icon_name="star"
                    size={16}
                    color="#FFD700"
                  />
                  <Text style={styles.premiumBadgeText}>{premiumBadgeText}</Text>
                </View>
                <Text style={styles.premiumTitle}>
                  Unlock Your Full Potential
                </Text>
                <Text style={styles.premiumDescription}>
                  Access advanced tools, personalized insights, and exclusive wellness content
                </Text>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={handleUpgrade}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.upgradeButtonText, { color: theme.primary }]}>
                    {upgradeButtonText}
                  </Text>
                  <IconSymbol
                    ios_icon_name="arrow-forward"
                    android_material_icon_name="arrow-forward"
                    size={20}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Today's Activity */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {todayActivityTitle}
            </Text>
            <View style={styles.activityGrid}>
              <ActivityCard
                icon="directions-walk"
                label="Steps"
                value={activityData?.steps || 0}
                unit="steps"
                color={theme.success}
              />
              <ActivityCard
                icon="bedtime"
                label="Sleep"
                value={activityData?.sleep || 0}
                unit="hrs"
                color={theme.primary}
              />
              <ActivityCard
                icon="water-drop"
                label="Water"
                value={activityData?.water || 0}
                unit="cups"
                color={theme.info}
              />
              <ActivityCard
                icon="mood"
                label="Mood"
                value={activityData?.mood_check || 0}
                unit="checks"
                color={theme.warning}
              />
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {settingsTitle}
            </Text>
            <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleThemeSettings}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                    <IconSymbol
                      ios_icon_name="palette"
                      android_material_icon_name="palette"
                      size={20}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {themeText}
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      {themeDescriptionText}
                    </Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron-right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <TouchableOpacity
                style={styles.settingItem}
                onPress={handlePrivacy}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.info + '20' }]}>
                    <IconSymbol
                      ios_icon_name="lock"
                      android_material_icon_name="lock"
                      size={20}
                      color={theme.info}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {privacyText}
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      {privacyDescriptionText}
                    </Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron-right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleTerms}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.warning + '20' }]}>
                    <IconSymbol
                      ios_icon_name="description"
                      android_material_icon_name="description"
                      size={20}
                      color={theme.warning}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {termsText}
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      {termsDescriptionText}
                    </Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron-right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleHelp}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.success + '20' }]}>
                    <IconSymbol
                      ios_icon_name="help"
                      android_material_icon_name="help"
                      size={20}
                      color={theme.success}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {helpText}
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      {helpDescriptionText}
                    </Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron-right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
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
    borderRadius: 12,
    gap: 6,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  premiumDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  activityLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  activityValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  activityValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  activityUnit: {
    fontSize: 13,
  },
  settingsCard: {
    borderRadius: 16,
    padding: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
