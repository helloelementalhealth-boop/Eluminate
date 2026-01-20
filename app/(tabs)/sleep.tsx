
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
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/WidgetContext';

type SleepTool = 'breathwork' | 'body_scan' | 'sleep_story' | 'ambient_sounds' | 'gratitude' | 'wind_down';

interface SleepSession {
  id: string;
  tool: SleepTool;
  duration: number;
  date: string;
}

const sleepTools = [
  {
    id: 'breathwork' as SleepTool,
    name: 'Sleep Breathwork',
    description: '4-7-8 breathing to calm your nervous system',
    icon: 'air',
    color: '#7A8B9B',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  },
  {
    id: 'body_scan' as SleepTool,
    name: 'Body Scan',
    description: 'Progressive relaxation from head to toe',
    icon: 'self-improvement',
    color: '#8B7A9B',
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
  },
  {
    id: 'sleep_story' as SleepTool,
    name: 'Sleep Stories',
    description: 'Calming narratives to ease you into rest',
    icon: 'menu-book',
    color: '#8B9B7F',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
  },
  {
    id: 'ambient_sounds' as SleepTool,
    name: 'Ambient Sounds',
    description: 'Rain, ocean waves, and nature soundscapes',
    icon: 'music-note',
    color: '#9B8B7A',
    image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80',
  },
  {
    id: 'gratitude' as SleepTool,
    name: 'Evening Gratitude',
    description: 'Reflect on three things from your day',
    icon: 'favorite',
    color: '#C4A876',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
  },
  {
    id: 'wind_down' as SleepTool,
    name: 'Wind Down Routine',
    description: 'Gentle stretches and movements for rest',
    icon: 'nightlight',
    color: '#B88B7B',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  },
];

export default function SleepScreen() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState<SleepTool>('breathwork');
  const [duration, setDuration] = useState('10');

  const today = new Date().toISOString().split('T')[0];

  const loadSessions = async () => {
    console.log('[SleepScreen] Loading sleep sessions');
    setRefreshing(true);
    // TODO: Backend Integration - GET /api/sleep/sessions?date=${today} → [{ id, tool, duration, date }]
    // For now, using mock data
    setSessions([]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleStartTool = (tool: SleepTool) => {
    console.log('[SleepScreen] User started tool:', tool);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTool(tool);
    setModalVisible(true);
  };

  const handleLogSession = async () => {
    if (!duration || parseInt(duration) <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid duration');
      return;
    }

    console.log('[SleepScreen] Logging session:', { tool: selectedTool, duration });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // TODO: Backend Integration - POST /api/sleep/sessions with { tool, duration, date }
    
    setModalVisible(false);
    setDuration('10');
    loadSessions();
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Sleep & Rest</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tools for nighttime and deep rest
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadSessions} tintColor={theme.primary} />
        }
      >
        {/* Evening Summary */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.summaryCard, { backgroundColor: theme.card }]}
        >
          <View style={styles.summaryHeader}>
            <IconSymbol
              ios_icon_name="bedtime"
              android_material_icon_name="bedtime"
              size={32}
              color={theme.primary}
            />
            <View style={styles.summaryText}>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>Tonight&apos;s Practice</Text>
              <Text style={[styles.summaryValue, { color: theme.textSecondary }]}>
                {totalMinutes} minutes of rest
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Sleep Tools Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Evening Tools</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Choose what helps you unwind and prepare for rest
          </Text>

          <View style={styles.toolsGrid}>
            {sleepTools.map((tool, index) => (
              <Animated.View
                key={tool.id}
                entering={FadeInDown.delay(index * 80).duration(400)}
                style={styles.toolCardContainer}
              >
                <TouchableOpacity
                  style={[styles.toolCard, { backgroundColor: theme.card }]}
                  onPress={() => handleStartTool(tool.id)}
                  activeOpacity={0.8}
                >
                  <ImageBackground
                    source={{ uri: tool.image }}
                    style={styles.toolImage}
                    imageStyle={styles.toolImageStyle}
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                      style={styles.toolGradient}
                    >
                      <View style={[styles.toolIconContainer, { backgroundColor: tool.color + '30' }]}>
                        <IconSymbol
                          ios_icon_name={tool.icon}
                          android_material_icon_name={tool.icon}
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <Text style={styles.toolName}>{tool.name}</Text>
                      <Text style={styles.toolDescription}>{tool.description}</Text>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Sleep Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sleep Hygiene</Text>
          <View style={[styles.tipsCard, { backgroundColor: theme.card }]}>
            <View style={styles.tipRow}>
              <Text style={styles.tipEmoji}>🌙</Text>
              <Text style={[styles.tipText, { color: theme.text }]}>
                Dim lights 1 hour before bed
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipEmoji}>📱</Text>
              <Text style={[styles.tipText, { color: theme.text }]}>
                Avoid screens 30 minutes before sleep
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipEmoji}>🌡️</Text>
              <Text style={[styles.tipText, { color: theme.text }]}>
                Keep your room cool (60-67°F)
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipEmoji}>☕</Text>
              <Text style={[styles.tipText, { color: theme.text }]}>
                No caffeine after 2 PM
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Log Session Modal */}
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
            <TouchableOpacity onPress={handleLogSession}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={[styles.selectedToolCard, { backgroundColor: theme.card }]}>
              <IconSymbol
                ios_icon_name={sleepTools.find(t => t.id === selectedTool)?.icon || 'bedtime'}
                android_material_icon_name={sleepTools.find(t => t.id === selectedTool)?.icon || 'bedtime'}
                size={48}
                color={sleepTools.find(t => t.id === selectedTool)?.color || theme.primary}
              />
              <Text style={[styles.selectedToolName, { color: theme.text }]}>
                {sleepTools.find(t => t.id === selectedTool)?.name}
              </Text>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Duration (minutes)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g., 10"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
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
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
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
  toolsGrid: {
    gap: 16,
  },
  toolCardContainer: {
    marginBottom: 0,
  },
  toolCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 180,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  toolImage: {
    width: '100%',
    height: '100%',
  },
  toolImageStyle: {
    resizeMode: 'cover',
  },
  toolGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toolName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  tipsCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipText: {
    fontSize: 15,
    flex: 1,
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
    paddingTop: 20,
  },
  selectedToolCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  selectedToolName: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
});
