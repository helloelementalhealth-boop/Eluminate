
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
  Modal,
  Platform,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/WidgetContext';
import { wellnessApi, WellnessProgram, ProgramEnrollment } from '@/utils/api';
import { useRouter } from 'expo-router';

export default function WellnessProgramsScreen() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<WellnessProgram | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    console.log('[WellnessPrograms] Loading programs and enrollments');
    setRefreshing(true);
    try {
      const [programsData, enrollmentsData] = await Promise.all([
        wellnessApi.getPrograms(),
        wellnessApi.getEnrollments(),
      ]);
      setPrograms(programsData);
      setEnrollments(enrollmentsData);
      console.log('[WellnessPrograms] Loaded:', programsData.length, 'programs,', enrollmentsData.length, 'enrollments');
    } catch (error) {
      console.error('[WellnessPrograms] Failed to load data:', error);
      setPrograms([]);
      setEnrollments([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isEnrolled = (programId: string) => {
    return enrollments.some(e => e.program_id === programId && !e.is_completed);
  };

  const getEnrollment = (programId: string) => {
    return enrollments.find(e => e.program_id === programId && !e.is_completed);
  };

  const handleProgramPress = async (program: WellnessProgram) => {
    console.log('[WellnessPrograms] User tapped program:', program.title, 'Premium:', program.is_premium);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (program.is_premium) {
      Alert.alert(
        'Premium Program',
        `${program.title} is a premium program. Upgrade to access comprehensive wellness journeys with daily guidance.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => {
              console.log('[WellnessPrograms] User tapped Upgrade');
              router.push('/(tabs)/profile');
            },
          },
        ]
      );
      return;
    }

    setSelectedProgram(program);
    setModalVisible(true);
  };

  const handleEnroll = async () => {
    if (!selectedProgram) return;

    console.log('[WellnessPrograms] User enrolling in program:', selectedProgram.title);
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await wellnessApi.enrollInProgram(selectedProgram.id);
      Alert.alert('Enrolled!', `You've started the ${selectedProgram.title} program. Check back daily for your next activity.`);
      setModalVisible(false);
      await loadData();
    } catch (error) {
      console.error('[WellnessPrograms] Failed to enroll:', error);
      Alert.alert('Error', 'Failed to enroll in program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProgramIcon = (programType: string): string => {
    const iconMap: Record<string, string> = {
      stress_relief: 'self-improvement',
      energy_boost: 'bolt',
      mindful_living: 'spa',
      better_sleep: 'bedtime',
      gratitude_journey: 'favorite',
      self_compassion: 'favorite-border',
    };
    return iconMap[programType] || 'star';
  };

  const getProgramColor = (programType: string): string => {
    const colorMap: Record<string, string> = {
      stress_relief: '#7A9B8B',
      energy_boost: '#E8A87C',
      mindful_living: '#9B8BA7',
      better_sleep: '#7A8B9B',
      gratitude_journey: '#C4A876',
      self_compassion: '#B88B9B',
    };
    return colorMap[programType] || theme.primary;
  };

  const getProgramImage = (programType: string): string => {
    const imageMap: Record<string, string> = {
      stress_relief: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      energy_boost: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80',
      mindful_living: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
      better_sleep: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      gratitude_journey: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
      self_compassion: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    };
    return imageMap[programType] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';
  };

  const durationText = selectedProgram ? `${selectedProgram.duration_days} days` : '';
  const enrolledText = selectedProgram && isEnrolled(selectedProgram.id) ? 'Enrolled' : '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Wellness Programs</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Guided journeys for lasting change
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={theme.primary} />
        }
      >
        {/* Active Programs */}
        {enrollments.filter(e => !e.is_completed).length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Active Programs</Text>
            {enrollments.filter(e => !e.is_completed).map((enrollment, index) => {
              const program = programs.find(p => p.id === enrollment.program_id);
              if (!program) return null;

              const progressPercent = (enrollment.completed_days.length / program.duration_days) * 100;
              const progressText = `Day ${enrollment.current_day} of ${program.duration_days}`;
              const percentText = `${Math.round(progressPercent)}%`;

              return (
                <Animated.View
                  key={enrollment.id}
                  entering={FadeInDown.delay(index * 80).duration(400)}
                  style={styles.activeCard}
                >
                  <TouchableOpacity
                    style={[styles.activeCardInner, { backgroundColor: theme.card }]}
                    onPress={() => handleProgramPress(program)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.activeCardHeader}>
                      <View style={[styles.activeIconContainer, { backgroundColor: getProgramColor(program.program_type) + '30' }]}>
                        <IconSymbol
                          ios_icon_name={getProgramIcon(program.program_type)}
                          android_material_icon_name={getProgramIcon(program.program_type)}
                          size={24}
                          color={getProgramColor(program.program_type)}
                        />
                      </View>
                      <View style={styles.activeCardInfo}>
                        <Text style={[styles.activeCardTitle, { color: theme.text }]}>{program.title}</Text>
                        <Text style={[styles.activeCardProgress, { color: theme.textSecondary }]}>
                          {progressText}
                        </Text>
                      </View>
                      <Text style={[styles.activeCardPercent, { color: theme.primary }]}>{percentText}</Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.textSecondary + '20' }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { backgroundColor: getProgramColor(program.program_type), width: `${progressPercent}%` },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* Available Programs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Available Programs</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Choose a program to begin your wellness journey
          </Text>

          {programs.length === 0 && !refreshing ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <IconSymbol
                ios_icon_name="spa"
                android_material_icon_name="spa"
                size={48}
                color={theme.textSecondary}
              />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No Programs Available
              </Text>
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                Pull down to refresh and load wellness programs
              </Text>
            </View>
          ) : null}

          <View style={styles.programsGrid}>
            {programs.map((program, index) => {
              const programIcon = getProgramIcon(program.program_type);
              const programColor = getProgramColor(program.program_type);
              const programImage = getProgramImage(program.program_type);
              const enrolled = isEnrolled(program.id);

              return (
                <Animated.View
                  key={program.id}
                  entering={FadeInDown.delay(index * 80).duration(400)}
                  style={styles.programCardContainer}
                >
                  <TouchableOpacity
                    style={[styles.programCard, { backgroundColor: theme.card }]}
                    onPress={() => handleProgramPress(program)}
                    activeOpacity={0.8}
                  >
                    <ImageBackground
                      source={{ uri: programImage }}
                      style={styles.programImage}
                      imageStyle={styles.programImageStyle}
                    >
                      <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                        style={styles.programGradient}
                      >
                        <View style={styles.programBadges}>
                          {program.is_premium && (
                            <View style={styles.premiumBadge}>
                              <IconSymbol
                                ios_icon_name="star"
                                android_material_icon_name="star"
                                size={12}
                                color="#FFD700"
                              />
                              <Text style={styles.premiumText}>Premium</Text>
                            </View>
                          )}
                          {enrolled && (
                            <View style={styles.enrolledBadge}>
                              <IconSymbol
                                ios_icon_name="check"
                                android_material_icon_name="check"
                                size={12}
                                color="#4CAF50"
                              />
                              <Text style={styles.enrolledText}>Active</Text>
                            </View>
                          )}
                        </View>
                        <View style={[styles.programIconContainer, { backgroundColor: programColor + '30' }]}>
                          <IconSymbol
                            ios_icon_name={programIcon}
                            android_material_icon_name={programIcon}
                            size={24}
                            color="#FFFFFF"
                          />
                        </View>
                        <Text style={styles.programName}>{program.title}</Text>
                        <Text style={styles.programDescription}>{program.description}</Text>
                        <View style={styles.programFooter}>
                          <View style={styles.durationBadge}>
                            <IconSymbol
                              ios_icon_name="calendar-today"
                              android_material_icon_name="calendar-today"
                              size={14}
                              color="rgba(255, 255, 255, 0.9)"
                            />
                            <Text style={styles.durationText}>{program.duration_days} days</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Program Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <IconSymbol
                ios_icon_name="close"
                android_material_icon_name="close"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {selectedProgram?.title}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedProgram && (
              <React.Fragment>
                <View style={[styles.modalProgramCard, { backgroundColor: theme.card }]}>
                  <View style={[styles.modalIconContainer, { backgroundColor: getProgramColor(selectedProgram.program_type) + '30' }]}>
                    <IconSymbol
                      ios_icon_name={getProgramIcon(selectedProgram.program_type)}
                      android_material_icon_name={getProgramIcon(selectedProgram.program_type)}
                      size={48}
                      color={getProgramColor(selectedProgram.program_type)}
                    />
                  </View>
                  <Text style={[styles.modalProgramDescription, { color: theme.textSecondary }]}>
                    {selectedProgram.description}
                  </Text>
                  <View style={styles.modalDurationRow}>
                    <IconSymbol
                      ios_icon_name="calendar-today"
                      android_material_icon_name="calendar-today"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.modalDuration, { color: theme.textSecondary }]}>
                      {durationText}
                    </Text>
                  </View>
                  {enrolledText && (
                    <View style={styles.modalEnrolledBadge}>
                      <IconSymbol
                        ios_icon_name="check-circle"
                        android_material_icon_name="check-circle"
                        size={16}
                        color="#4CAF50"
                      />
                      <Text style={[styles.modalEnrolledText, { color: '#4CAF50' }]}>
                        {enrolledText}
                      </Text>
                    </View>
                  )}
                </View>

                {selectedProgram.daily_activities && selectedProgram.daily_activities.length > 0 && (
                  <View style={[styles.activitiesCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.activitiesTitle, { color: theme.text }]}>Daily Activities</Text>
                    {selectedProgram.daily_activities.slice(0, 5).map((activity, index) => {
                      const dayText = `Day ${activity.day}`;
                      return (
                        <View key={index} style={styles.activityRow}>
                          <View style={[styles.dayBadge, { backgroundColor: theme.primary + '20' }]}>
                            <Text style={[styles.dayText, { color: theme.primary }]}>{dayText}</Text>
                          </View>
                          <View style={styles.activityInfo}>
                            <Text style={[styles.activityTitle, { color: theme.text }]}>{activity.title}</Text>
                            <Text style={[styles.activityDescription, { color: theme.textSecondary }]}>
                              {activity.activity}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                    {selectedProgram.daily_activities.length > 5 && (
                      <Text style={[styles.moreActivities, { color: theme.textSecondary }]}>
                        + {selectedProgram.daily_activities.length - 5} more days
                      </Text>
                    )}
                  </View>
                )}

                {!isEnrolled(selectedProgram.id) && (
                  <TouchableOpacity
                    style={[styles.enrollButton, { backgroundColor: theme.primary }]}
                    onPress={handleEnroll}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <React.Fragment>
                        <IconSymbol
                          ios_icon_name="play-arrow"
                          android_material_icon_name="play-arrow"
                          size={24}
                          color="#FFFFFF"
                        />
                        <Text style={styles.enrollButtonText}>Start Program</Text>
                      </React.Fragment>
                    )}
                  </TouchableOpacity>
                )}
              </React.Fragment>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  section: {
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
  activeCard: {
    marginBottom: 16,
  },
  activeCardInner: {
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  activeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeCardInfo: {
    flex: 1,
  },
  activeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activeCardProgress: {
    fontSize: 14,
  },
  activeCardPercent: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  programsGrid: {
    gap: 16,
  },
  programCardContainer: {
    marginBottom: 0,
  },
  programCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 220,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  programImage: {
    width: '100%',
    height: '100%',
  },
  programImageStyle: {
    resizeMode: 'cover',
  },
  programGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  programBadges: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  enrolledText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  programIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  programName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  programDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 12,
  },
  programFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  modalProgramCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalProgramDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  modalDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalDuration: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalEnrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  modalEnrolledText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activitiesCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  moreActivities: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 40,
    gap: 8,
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
