
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, workoutColors } from '@/styles/commonStyles';
import { workoutApi, WorkoutType, Workout } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';

export default function FitnessScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const [refreshing, setRefreshing] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutType, setWorkoutType] = useState<WorkoutType>('strength');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [notes, setNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const loadWorkouts = async () => {
    console.log('[FitnessScreen] Loading workouts');
    setRefreshing(true);
    try {
      const data = await workoutApi.getWorkouts(today);
      setWorkouts(data);
      console.log('[FitnessScreen] Workouts loaded:', data.length);
    } catch (error) {
      console.error('[FitnessScreen] Failed to load workouts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleAddWorkout = async () => {
    if (!title || !duration) {
      Alert.alert('Missing Info', 'Please enter workout title and duration');
      return;
    }

    console.log('[FitnessScreen] Adding workout:', { title, duration });
    try {
      await workoutApi.createWorkout({
        date: today,
        workout_type: workoutType,
        title,
        duration_minutes: parseInt(duration),
        calories_burned: caloriesBurned ? parseInt(caloriesBurned) : undefined,
        notes,
        exercises: [],
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      setTitle('');
      setDuration('');
      setCaloriesBurned('');
      setNotes('');
      loadWorkouts();
    } catch (error) {
      console.error('[FitnessScreen] Failed to add workout:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to log workout');
    }
  };

  const handleDeleteWorkout = (id: string) => {
    Alert.alert('Delete Workout', 'Remove this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          console.log('[FitnessScreen] Deleting workout:', id);
          try {
            await workoutApi.deleteWorkout(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            loadWorkouts();
          } catch (error) {
            console.error('[FitnessScreen] Failed to delete workout:', error);
            Alert.alert('Error', 'Failed to delete workout');
          }
        },
      },
    ]);
  };

  const workoutTypes: WorkoutType[] = ['strength', 'cardio', 'flexibility', 'sports'];

  const totalDuration = workouts.reduce((sum, w) => sum + w.duration_minutes, 0);
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Movement</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Track your active sessions
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadWorkouts} tintColor={theme.primary} />
        }
      >
        {/* Daily Summary */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.summaryCard, { backgroundColor: theme.card }]}
        >
          <Text style={[styles.summaryTitle, { color: theme.text }]}>Today&apos;s Activity</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.primary }]}>
                {workouts.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Workouts</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.success }]}>
                {totalDuration}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Minutes</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.error }]}>
                {totalCalories}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Calories</Text>
            </View>
          </View>
        </Animated.View>

        {/* Workout List */}
        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="fitness-center"
              android_material_icon_name="fitness-center"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No workouts logged today
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap + to log your first workout
            </Text>
          </View>
        ) : (
          workouts.map((workout, index) => (
            <Animated.View
              key={workout.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
              style={[styles.workoutCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.workoutHeader}>
                <View style={styles.workoutInfo}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: (workoutColors[workout.workout_type] || theme.primary) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        { color: workoutColors[workout.workout_type] || theme.primary },
                      ]}
                    >
                      {workout.workout_type}
                    </Text>
                  </View>
                  <Text style={[styles.workoutTitle, { color: theme.text }]}>{workout.title}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteWorkout(workout.id)} activeOpacity={0.7}>
                  <IconSymbol
                    ios_icon_name="delete"
                    android_material_icon_name="delete"
                    size={20}
                    color={theme.error}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.workoutStats}>
                <View style={styles.statItem}>
                  <IconSymbol
                    ios_icon_name="schedule"
                    android_material_icon_name="schedule"
                    size={16}
                    color={theme.textSecondary}
                  />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>
                    {workout.duration_minutes} min
                  </Text>
                </View>
                {workout.calories_burned && (
                  <View style={styles.statItem}>
                    <IconSymbol
                      ios_icon_name="local-fire-department"
                      android_material_icon_name="local-fire-department"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.statText, { color: theme.textSecondary }]}>
                      {workout.calories_burned} cal
                    </Text>
                  </View>
                )}
              </View>
              {workout.notes && (
                <Text style={[styles.workoutNotes, { color: theme.textSecondary }]}>
                  {workout.notes}
                </Text>
              )}
            </Animated.View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Workout Modal */}
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
            <Text style={[styles.modalTitle, { color: theme.text }]}>Log Workout</Text>
            <TouchableOpacity onPress={handleAddWorkout}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: theme.text }]}>Workout Type</Text>
            <View style={styles.typeGrid}>
              {workoutTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setWorkoutType(type)}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: workoutType === type ? theme.primary : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: workoutType === type ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Morning run"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Duration (minutes) *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g., 30"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.text }]}>Calories Burned</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={caloriesBurned}
              onChangeText={setCaloriesBurned}
              placeholder="Optional"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.text }]}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="How did it feel?"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

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
    alignItems: 'flex-start',
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
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  workoutCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
    gap: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
  },
  workoutNotes: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
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
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  input: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
});
