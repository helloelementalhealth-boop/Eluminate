
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
import { colors, practiceColors } from '@/styles/commonStyles';
import { meditationApi, PracticeType, MeditationSession } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';

export default function MindfulnessScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [practiceType, setPracticeType] = useState<PracticeType>('mindfulness');
  const [duration, setDuration] = useState('');
  const [moodBefore, setMoodBefore] = useState('');
  const [moodAfter, setMoodAfter] = useState('');
  const [notes, setNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const loadData = async () => {
    console.log('[MindfulnessScreen] Loading meditation data');
    setRefreshing(true);
    try {
      const [sessionsData, statsData] = await Promise.all([
        meditationApi.getSessions(today),
        meditationApi.getStats(),
      ]);
      setSessions(sessionsData);
      setStats(statsData);
      console.log('[MindfulnessScreen] Data loaded');
    } catch (error) {
      console.error('[MindfulnessScreen] Failed to load data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSession = async () => {
    if (!duration) {
      Alert.alert('Missing Info', 'Please enter session duration');
      return;
    }

    console.log('[MindfulnessScreen] Adding session:', { practiceType, duration });
    try {
      await meditationApi.createSession({
        date: today,
        practice_type: practiceType,
        duration_minutes: parseInt(duration),
        mood_before: moodBefore || undefined,
        mood_after: moodAfter || undefined,
        notes: notes || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      setDuration('');
      setMoodBefore('');
      setMoodAfter('');
      setNotes('');
      loadData();
    } catch (error) {
      console.error('[MindfulnessScreen] Failed to add session:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to log session');
    }
  };

  const handleDeleteSession = (id: string) => {
    Alert.alert('Delete Session', 'Remove this meditation session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          console.log('[MindfulnessScreen] Deleting session:', id);
          try {
            await meditationApi.deleteSession(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            loadData();
          } catch (error) {
            console.error('[MindfulnessScreen] Failed to delete session:', error);
            Alert.alert('Error', 'Failed to delete session');
          }
        },
      },
    ]);
  };

  const practiceTypes: PracticeType[] = [
    'breathwork',
    'mindfulness',
    'body_scan',
    'loving_kindness',
    'gratitude',
  ];

  const todayMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <Text style={[styles.title, { color: theme.text }]}>Mindfulness</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={theme.primary} />
        }
      >
        {/* Stats Card */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.statsCard, { backgroundColor: theme.card }]}
        >
          <Text style={[styles.statsTitle, { color: theme.text }]}>Your Practice</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {todayMinutes}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Today (min)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.success }]}>
                {stats?.total_minutes || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total (min)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.warning }]}>
                {stats?.current_streak || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
            </View>
          </View>
        </Animated.View>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="self-improvement"
              android_material_icon_name="self-improvement"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No sessions today
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Take a moment to breathe and center yourself
            </Text>
          </View>
        ) : (
          sessions.map((session, index) => (
            <Animated.View
              key={session.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
              style={[styles.sessionCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <View
                    style={[
                      styles.practiceBadge,
                      {
                        backgroundColor:
                          (practiceColors[session.practice_type] || theme.primary) + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.practiceBadgeText,
                        { color: practiceColors[session.practice_type] || theme.primary },
                      ]}
                    >
                      {session.practice_type.replace(/_/g, ' ')}
                    </Text>
                  </View>
                  <View style={styles.durationRow}>
                    <IconSymbol
                      ios_icon_name="schedule"
                      android_material_icon_name="schedule"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.durationText, { color: theme.text }]}>
                      {session.duration_minutes} minutes
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteSession(session.id)} activeOpacity={0.7}>
                  <IconSymbol
                    ios_icon_name="delete"
                    android_material_icon_name="delete"
                    size={20}
                    color={theme.error}
                  />
                </TouchableOpacity>
              </View>
              {(session.mood_before || session.mood_after) && (
                <View style={styles.moodRow}>
                  {session.mood_before && (
                    <Text style={[styles.moodText, { color: theme.textSecondary }]}>
                      Before: {session.mood_before}
                    </Text>
                  )}
                  {session.mood_after && (
                    <Text style={[styles.moodText, { color: theme.textSecondary }]}>
                      After: {session.mood_after}
                    </Text>
                  )}
                </View>
              )}
              {session.notes && (
                <Text style={[styles.sessionNotes, { color: theme.textSecondary }]}>
                  {session.notes}
                </Text>
              )}
            </Animated.View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Session Modal */}
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
            <Text style={[styles.modalTitle, { color: theme.text }]}>Log Session</Text>
            <TouchableOpacity onPress={handleAddSession}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: theme.text }]}>Practice Type</Text>
            <View style={styles.practiceGrid}>
              {practiceTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setPracticeType(type)}
                  style={[
                    styles.practiceButton,
                    {
                      backgroundColor: practiceType === type ? theme.primary : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.practiceText,
                      { color: practiceType === type ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {type.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Duration (minutes) *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g., 10"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.text }]}>How did you feel before?</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={moodBefore}
              onChangeText={setMoodBefore}
              placeholder="e.g., Anxious, restless"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>How do you feel after?</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={moodAfter}
              onChangeText={setMoodAfter}
              placeholder="e.g., Calm, centered"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any insights or observations?"
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
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
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
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
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  sessionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
    gap: 8,
  },
  practiceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  practiceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 15,
    fontWeight: '500',
  },
  moodRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  moodText: {
    fontSize: 13,
  },
  sessionNotes: {
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
  practiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  practiceButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  practiceText: {
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
