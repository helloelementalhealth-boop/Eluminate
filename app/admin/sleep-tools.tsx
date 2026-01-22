
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
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { useTheme, useAdminAuth } from '@/contexts/WidgetContext';
import { sleepApi, SleepTool } from '@/utils/api';

type ToolType = 'breathwork' | 'body_scan' | 'sleep_story' | 'ambient_sounds' | 'gratitude' | 'wind_down';

export default function SleepToolsManager() {
  const router = useRouter();
  const { currentTheme: theme } = useTheme();
  const { isAdmin, authLoading } = useAdminAuth();
  const [tools, setTools] = useState<SleepTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTool, setEditingTool] = useState<SleepTool | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [toolType, setToolType] = useState<ToolType>('breathwork');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [content, setContent] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      console.log('[SleepToolsManager] Not admin, redirecting');
      router.replace('/admin');
    }
  }, [authLoading, isAdmin, router]);

  const loadTools = async () => {
    console.log('[SleepToolsManager] Loading sleep tools');
    setLoading(true);
    try {
      const data = await sleepApi.getTools();
      setTools(data);
      console.log('[SleepToolsManager] Loaded tools:', data.length);
    } catch (error) {
      console.error('[SleepToolsManager] Failed to load tools:', error);
      Alert.alert('Error', 'Failed to load sleep tools');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTool = () => {
    console.log('[SleepToolsManager] Adding new tool');
    setEditingTool(null);
    setTitle('');
    setDescription('');
    setToolType('breathwork');
    setDurationMinutes('');
    setContent('');
    setIsPremium(false);
    setModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEditTool = (tool: SleepTool) => {
    console.log('[SleepToolsManager] Editing tool:', tool.id);
    setEditingTool(tool);
    setTitle(tool.title);
    setDescription(tool.description);
    setToolType(tool.tool_type as ToolType);
    setDurationMinutes(tool.duration_minutes.toString());
    setContent(tool.content || '');
    setIsPremium(tool.is_premium);
    setModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveTool = async () => {
    if (!title || !description || !durationMinutes) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    console.log('[SleepToolsManager] Saving tool');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const toolData = {
        title,
        description,
        tool_type: toolType,
        duration_minutes: parseInt(durationMinutes),
        content: content || undefined,
        is_premium: isPremium,
      };

      if (editingTool) {
        // Update existing tool
        await sleepApi.updateTool(editingTool.id, toolData);
        Alert.alert('Success', 'Sleep tool updated successfully');
      } else {
        // Create new tool
        await sleepApi.createTool(toolData);
        Alert.alert('Success', 'Sleep tool created successfully');
      }

      setModalVisible(false);
      loadTools();
    } catch (error) {
      console.error('[SleepToolsManager] Failed to save tool:', error);
      Alert.alert('Error', 'Failed to save sleep tool');
    }
  };

  const handleDeleteTool = (tool: SleepTool) => {
    Alert.alert(
      'Delete Tool',
      `Are you sure you want to delete "${tool.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('[SleepToolsManager] Deleting tool:', tool.id);
            try {
              await sleepApi.deleteTool(tool.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              loadTools();
            } catch (error) {
              console.error('[SleepToolsManager] Failed to delete tool:', error);
              Alert.alert('Error', 'Failed to delete sleep tool');
            }
          },
        },
      ]
    );
  };

  const getToolIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      breathwork: 'air',
      body_scan: 'self-improvement',
      sleep_story: 'menu-book',
      ambient_sounds: 'music-note',
      gratitude: 'favorite',
      wind_down: 'nightlight',
    };
    return iconMap[type] || 'bedtime';
  };

  const toolTypes: ToolType[] = ['breathwork', 'body_scan', 'sleep_story', 'ambient_sounds', 'gratitude', 'wind_down'];

  const modalTitle = editingTool ? 'Edit Sleep Tool' : 'Add Sleep Tool';
  const saveButtonText = editingTool ? 'Update' : 'Create';

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
          title: 'Sleep Tools',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />

      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Sleep Tools</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Manage sleep and rest tools
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAddTool}
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
              Loading tools...
            </Text>
          </View>
        ) : tools.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <IconSymbol
              ios_icon_name="bedtime"
              android_material_icon_name="bedtime"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Sleep Tools
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Create your first sleep tool to help users rest better
            </Text>
          </View>
        ) : (
          tools.map((tool, index) => (
            <Animated.View
              key={tool.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
              style={[styles.toolCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.toolHeader}>
                <View style={styles.toolInfo}>
                  <View style={[styles.toolIconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <IconSymbol
                      ios_icon_name={getToolIcon(tool.tool_type)}
                      android_material_icon_name={getToolIcon(tool.tool_type)}
                      size={24}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.toolTextContainer}>
                    <View style={styles.toolTitleRow}>
                      <Text style={[styles.toolTitle, { color: theme.text }]}>
                        {tool.title}
                      </Text>
                      {tool.is_premium && (
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
                    <Text style={[styles.toolDescription, { color: theme.textSecondary }]}>
                      {tool.description}
                    </Text>
                    <View style={styles.toolMeta}>
                      <View style={styles.metaItem}>
                        <IconSymbol
                          ios_icon_name="schedule"
                          android_material_icon_name="schedule"
                          size={14}
                          color={theme.textSecondary}
                        />
                        <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                          {tool.duration_minutes} min
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
                          {tool.tool_type.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.toolActions}>
                <TouchableOpacity
                  onPress={() => handleEditTool(tool)}
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
                  onPress={() => handleDeleteTool(tool)}
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
            <TouchableOpacity onPress={handleSaveTool}>
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
              placeholder="e.g., Deep Breathing Exercise"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description of the tool"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={[styles.label, { color: theme.text }]}>Tool Type *</Text>
            <View style={styles.typeGrid}>
              {toolTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setToolType(type)}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: toolType === type ? theme.primary : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name={getToolIcon(type)}
                    android_material_icon_name={getToolIcon(type)}
                    size={20}
                    color={toolType === type ? '#FFFFFF' : theme.text}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      { color: toolType === type ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {type.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Duration (minutes) *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              placeholder="e.g., 10"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.text }]}>Content / Guide</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
              value={content}
              onChangeText={setContent}
              placeholder="Detailed instructions or script for the tool"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={8}
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
                  Premium Tool
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
  toolCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  toolHeader: {
    marginBottom: 16,
  },
  toolInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTextContainer: {
    flex: 1,
  },
  toolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  toolTitle: {
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
  toolDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  toolMeta: {
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
  toolActions: {
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
