
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, moodColors } from '@/styles/commonStyles';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { journalApi, JournalEntry } from '@/utils/api';
import * as Haptics from 'expo-haptics';
import AnimatedHello from '@/components/AnimatedHello';

const moods: { [key: string]: { label: string; emoji: string } } = {
  calm: { label: 'Calm', emoji: '🌊' },
  energized: { label: 'Energized', emoji: '⚡' },
  reflective: { label: 'Reflective', emoji: '🌙' },
  restless: { label: 'Restless', emoji: '🌪️' },
  grateful: { label: 'Grateful', emoji: '🌸' },
  uncertain: { label: 'Uncertain', emoji: '🌫️' },
};

export default function HistoryScreen() {
  console.log('HistoryScreen: Rendering journal history');
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadEntries = useCallback(async (isRefresh = false) => {
    console.log('Loading journal entries...');
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await journalApi.getEntries();
      console.log('Loaded entries:', data.length);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load entries:', error);
      Alert.alert('Error', 'Failed to load journal entries. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleDelete = async (id: string) => {
    console.log('Deleting entry:', id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await journalApi.deleteEntry(id);
              console.log('Entry deleted successfully');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              // Remove from local state
              setEntries(prev => prev.filter(entry => entry.id !== id));
            } catch (error) {
              console.error('Failed to delete entry:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to delete entry. Please try again.');
            }
          },
        },
      ]
    );
  };

  const toggleExpand = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Loading your journal...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (entries.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <AnimatedHello color={theme.text} secondaryColor={theme.textSecondary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadEntries(true)}
            tintColor={theme.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Your Journal
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </Text>
        </View>

        {/* Entries List */}
        {entries.map((entry, index) => {
          const isExpanded = expandedId === entry.id;
          const mood = entry.mood ? moods[entry.mood] : null;

          return (
            <Animated.View
              key={entry.id}
              entering={FadeInDown.delay(index * 50).duration(400)}
              style={styles.entryContainer}
            >
              <TouchableOpacity
                onPress={() => toggleExpand(entry.id)}
                style={[
                  styles.entryCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
              >
                {/* Entry Header */}
                <View style={styles.entryHeader}>
                  <View style={styles.entryHeaderLeft}>
                    {mood && (
                      <View
                        style={[
                          styles.moodBadge,
                          { backgroundColor: moodColors[entry.mood!] },
                        ]}
                      >
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                      </View>
                    )}
                    <View>
                      <Text style={[styles.entryDate, { color: theme.text }]}>
                        {formatDate(entry.createdAt)}
                      </Text>
                      {mood && (
                        <Text style={[styles.moodLabel, { color: theme.textSecondary }]}>
                          {mood.label}
                        </Text>
                      )}
                    </View>
                  </View>
                  {entry.energy && (
                    <View style={styles.energyBadge}>
                      <Text style={[styles.energyText, { color: theme.textSecondary }]}>
                        Energy: {entry.energy}/5
                      </Text>
                    </View>
                  )}
                </View>

                {/* Entry Content Preview */}
                <Text
                  style={[styles.entryContent, { color: theme.text }]}
                  numberOfLines={isExpanded ? undefined : 3}
                >
                  {entry.content}
                </Text>

                {/* Intention */}
                {entry.intention && (
                  <View style={[styles.intentionContainer, { backgroundColor: theme.background }]}>
                    <Text style={[styles.intentionLabel, { color: theme.textSecondary }]}>
                      Intention:
                    </Text>
                    <Text style={[styles.intentionText, { color: theme.text }]}>
                      {entry.intention}
                    </Text>
                  </View>
                )}

                {/* Expand/Collapse Indicator */}
                {entry.content.length > 150 && (
                  <Text style={[styles.expandText, { color: theme.primary }]}>
                    {isExpanded ? 'Show less' : 'Read more'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity
                onPress={() => handleDelete(entry.id)}
                style={[styles.deleteButton, { backgroundColor: theme.card }]}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  entryContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  entryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  moodBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 20,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  moodLabel: {
    fontSize: 13,
  },
  energyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  energyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  entryContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  intentionContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  intentionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  intentionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  expandText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },
});
