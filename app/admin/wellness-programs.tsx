
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { useTheme, useAdminAuth } from '@/contexts/WidgetContext';
import { BACKEND_URL, WellnessProgram, ProgramType, DailyActivity } from '@/utils/api';

export default function WellnessProgramsManager() {
  const router = useRouter();
  const { currentTheme: theme } = useTheme();
  const { isAdmin, authLoading } = useAdminAuth();
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProgram, setEditingProgram] = useState<WellnessProgram | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [programType, setProgramType] = useState<ProgramType>('stress_relief');
  const [durationDays, setDurationDays] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [dailyActivitiesJson, setDailyActivitiesJson] = useState('');

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      console.log('[WellnessProgramsManager] Not admin, redirecting');
      router.replace('/admin');
    }
  }, [authLoading, isAdmin, router]);

  const loadPrograms = async () => {
    console.log('[WellnessProgramsManager] Loading wellness programs');
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/wellness/programs`);
      if (!response.ok) {
        throw new Error(`Failed to load programs: ${response.status}`);
      }
      const data = await response.json();
      setPrograms(data);
      console.log('[WellnessProgramsManager] Loaded programs:', data.length);
    } catch (error) {
      console.error('[WellnessProgramsManager] Failed to load programs:', error);
      Alert.alert('Error', 'Failed to load wellness programs');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgram = () => {
    console.log('[WellnessProgramsManager] Adding new program');
    setEditingProgram(null);
    setTitle('');
    setDescription('');
    setProgramType('stress_relief');
    setDurationDays('');
    setIsPremium(false);
    setDailyActivitiesJson('[]');
    setModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEditProgram = (program: WellnessProgram) => {
    console.log('[WellnessProgramsManager] Editing program:', program.id);
    setEditingProgram(program);
    setTitle(program.title);
    setDescription(program.description);
    setProgramType(program.program_type);
    setDurationDays(program.duration_days.toString());
    setIsPremium(program.is_premium);
    setDailyActivitiesJson(JSON.stringify(program.daily_activities || [], null, 2));
    setModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveProgram = async () => {
    if (!title || !description || !durationDays) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    let parsedActivities: DailyActivity[] = [];
    try {
      parsedActivities = JSON.parse(dailyActivitiesJson);
      if (!Array.isArray(parsedActivities)) {
        throw new Error('Daily activities must be an array');
      }
    } catch (error) {
      Alert.alert('Invalid JSON', 'Please enter valid JSON for daily activities');
      return;
    }

    console.log('[WellnessProgramsManager] Saving program');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const programData = {
        title,
        description,
        program_type: programType,
        duration_days: parseInt(durationDays),
        is_premium: isPremium,
        daily_activities: parsedActivities,
      };

      const url = editingProgram
        ? `${BACKEND_URL}/api/wellness/programs/${editingProgram.id}`
        : `${BACKEND_URL}/api/wellness/programs`;

      const response = await fetch(url, {
        method: editingProgram ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save program: ${response.status} - ${errorText}`);
      }

      Alert.alert('Success', editingProgram ? 'Program updated successfully' : 'Program created successfully');
      setModalVisible(false);
      loadPrograms();
    } catch (error) {
      console.error('[WellnessProgramsManager] Failed to save program:', error);
      Alert.alert('Error', 'Failed to save wellness program');
    }
  };

  const handleDeleteProgram = (program: WellnessProgram) => {
    Alert.alert(
      'Delete Program',
      `Are you sure you want to delete "${program.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('[WellnessProgramsManager] Deleting program:', program.id);
            try {
              const response = await fetch(`${BACKEND_URL}/api/wellness/programs/${program.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
              });

              if (!response.ok) {
                throw new Error(`Failed to delete program: ${response.status}`);
              }

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              loadPrograms();
            } catch (error) {
              console.error('[WellnessProgramsManager] Failed to delete program:', error);
              Alert.alert('Error', 'Failed to delete wellness program');
            }
          },
        },
      ]
    );
  };

  const getProgramIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      stress_relief: 'self-improvement',
      energy_boost: 'bolt',
      mindful_living: 'spa',
      better_sleep: 'bedtime',
      gratitude_journey: 'favorite',
      self_compassion: 'favorite-border',
    };
    return iconMap[type] || 'star';
  };

  const programTypes: ProgramType[] = [
    'stress_relief',
    'energy_boost',
    'mindful_living',
    'better_sleep',
    'gratitude_journey',
    'self_compassion',
  ];

  const modalTitle = editingProgram ? 'Edit Wellness Program' : 'Add Wellness Program';
  const saveButtonText = editingProgram ? 'Update' : 'Create';

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Wellness Programs',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />

      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Wellness Programs</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Manage wellness programs and premium content
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAddProgram}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          activeOpacity={0.8}
        >
          <IconSymbol ios_icon_name="add" android_material_icon_name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading programs...
            </Text>
          </View>
        ) : programs.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <IconSymbol
              ios_icon_name="spa"
              android_material_icon_name="spa"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Wellness Programs
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Create your first wellness program to help users on their journey
            </Text>
          </View>
        ) : (
          programs.map((program, index) => (
            <Animated.View
              key={program.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
              style={[styles.programCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.programHeader}>
                <View style={styles.programInfo}>
                  <View style={[styles.programIconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <IconSymbol
                      ios_icon_name={getProgramIcon(program.program_type)}
                      android_material_icon_name={getProgramIcon(program.program_type)}
                      size={24}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.programTextContainer}>
                    <View style={styles.programTitleRow}>
                      <Text style={[styles.programTitle, { color: theme.text }]}>
                        {program.title}
                      </Text>
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
                    </View>
                    <Text style={[styles.programDescription, { color: theme.textSecondary }]}>
                      {program.description}
                    </Text>
                    <View style={styles.programMeta}>
                      <View style={styles.metaItem}>
                        <IconSymbol
                          ios_icon_name="calendar-today"
                          android_material_icon_name="calendar-today"
                          size={14}
                          color={theme.textSecondary}
                        />
                        <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                          {program.duration_days} days
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <IconSymbol
                          ios_icon_name="category"
                          android_material_icon_name="category"
                          size={14}
                          color={theme.textSecondary}
                        />
                        <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                          {program.program_type.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.programActions}>
                <TouchableOpacity
                  onPress={() => handleEditProgram(program)}
                  style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="edit"
                    android_material_icon_name="edit"
                    size={18}
                    color={theme.primary}
                  />
                  <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteProgram(program)}
                  style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="delete"
                    android_material_icon_name="delete"
                    size={18}
                    color={theme.error}
                  />
                  <Text style={[styles.actionButtonText, { color: theme.error }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalCancel, { color: theme.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {modalTitle}
            </Text>
            <TouchableOpacity onPress={handleSaveProgram}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>
                {saveButtonText}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., 7-Day Stress Relief"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description of the program"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={[styles.label, { color: theme.text }]}>Program Type *</Text>
            <View style={styles.typeGrid}>
              {programTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setProgramType(type)}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: programType === type ? theme.primary : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name={getProgramIcon(type)}
                    android_material_icon_name={getProgramIcon(type)}
                    size={20}
                    color={programType === type ? '#FFFFFF' : theme.text}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      { color: programType === type ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {type.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Duration (days) *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={durationDays}
              onChangeText={setDurationDays}
              placeholder="e.g., 7"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.text }]}>Daily Activities (JSON) *</Text>
            <Text style={[styles.helpText, { color: theme.textSecondary }]}>
              Format: {`[{"day": 1, "title": "...", "activity": "..."}]`}
            </Text>
            <TextInput
              style={[styles.input, styles.jsonArea, { backgroundColor: theme.card, color: theme.text }]}
              value={dailyActivitiesJson}
              onChangeText={setDailyActivitiesJson}
              placeholder='[{"day": 1, "title": "Day 1", "activity": "..."}]'
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />

            <TouchableOpacity
              onPress={() => setIsPremium(!isPremium)}
              style={styles.premiumToggle}
              activeOpacity={0.7}
            >
              <View style={styles.premiumToggleLeft}>
                <IconSymbol
                  ios_icon_name="star"
                  android_material_icon_name="star"
                  size={20}
                  color={isPremium ? '#FFD700' : theme.textSecondary}
                />
                <Text style={[styles.premiumToggleText, { color: theme.text }]}>
                  Premium Program
                </Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: isPremium ? theme.primary : theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      transform: [{ translateX: isPremium ? 20 : 0 }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  programCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  programHeader: {
    marginBottom: 16,
  },
  programInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  programIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programTextContainer: {
    flex: 1,
  },
  programTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  programTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
  },
  programDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  programMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  programActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
  },
  helpText: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  jsonArea: {
    minHeight: 200,
    paddingTop: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  premiumToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 20,
  },
  premiumToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumToggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
});
