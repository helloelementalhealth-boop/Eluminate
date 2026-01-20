
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
import { Stack, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@/contexts/WidgetContext';
import * as Haptics from 'expo-haptics';
import { adminContentApi, adminAiApi, AdminContent } from '@/utils/adminApi';

export default function ContentEditor() {
  const { currentTheme: theme } = useTheme();
  const params = useLocalSearchParams();
  const pageName = params.page as string;
  
  const [content, setContent] = useState<AdminContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<AdminContent | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form state
  const [contentKey, setContentKey] = useState('');
  const [contentValue, setContentValue] = useState('');
  const [contentType, setContentType] = useState<'text' | 'image' | 'video'>('text');

  const pageTitle = pageName === 'notifications' ? 'Notifications' :
                    pageName === 'privacy' ? 'Privacy Policy' :
                    pageName === 'help-support' ? 'Help & Support' : 'Content';

  useEffect(() => {
    if (pageName) {
      loadContent();
    }
  }, [pageName]);

  const loadContent = async () => {
    console.log('[ContentEditor] Loading content for:', pageName);
    setLoading(true);
    try {
      const data = await adminContentApi.getContentByPage(pageName);
      setContent(data.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      console.error('[ContentEditor] Failed to load content:', error);
      Alert.alert('Error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = () => {
    console.log('[ContentEditor] User tapped Add Content');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingContent(null);
    setContentKey('');
    setContentValue('');
    setContentType('text');
    setModalVisible(true);
  };

  const handleEditContent = (item: AdminContent) => {
    console.log('[ContentEditor] Editing content:', item.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingContent(item);
    setContentKey(item.contentKey);
    setContentValue(item.contentValue);
    setContentType(item.contentType);
    setModalVisible(true);
  };

  const handleSaveContent = async () => {
    if (!contentKey || !contentValue) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    console.log('[ContentEditor] Saving content');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const contentData = {
        pageName,
        contentType,
        contentKey,
        contentValue,
        displayOrder: editingContent?.displayOrder || content.length,
        isActive: true,
      };

      if (editingContent) {
        await adminContentApi.updateContent(editingContent.id, contentData);
      } else {
        await adminContentApi.createContent(contentData);
      }

      setModalVisible(false);
      loadContent();
      Alert.alert('Success', `Content ${editingContent ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('[ContentEditor] Failed to save content:', error);
      Alert.alert('Error', 'Failed to save content');
    }
  };

  const handleDeleteContent = (item: AdminContent) => {
    Alert.alert(
      'Delete Content',
      `Are you sure you want to delete "${item.contentKey}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('[ContentEditor] Deleting content:', item.id);
            try {
              await adminContentApi.deleteContent(item.id);
              loadContent();
              Alert.alert('Success', 'Content deleted successfully');
            } catch (error) {
              console.error('[ContentEditor] Failed to delete content:', error);
              Alert.alert('Error', 'Failed to delete content');
            }
          },
        },
      ]
    );
  };

  const handleImproveWithAI = async (improvementType: 'clarity' | 'tone' | 'length' | 'engagement') => {
    if (!contentValue) {
      Alert.alert('Error', 'Please enter some content first');
      return;
    }

    console.log('[ContentEditor] Improving content with AI:', improvementType);
    setAiGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await adminAiApi.improveContent(contentValue, improvementType);
      setContentValue(result.improvedContent);
      Alert.alert('Success', 'Content improved by AI!');
    } catch (error) {
      console.error('[ContentEditor] Failed to improve content:', error);
      Alert.alert('Error', 'Failed to improve content');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!contentKey) {
      Alert.alert('Error', 'Please enter a content key first');
      return;
    }

    console.log('[ContentEditor] Generating content with AI');
    setAiGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const prompt = `Write ${contentKey} content for ${pageTitle} page`;
      const result = await adminAiApi.generateContent(prompt, 'text', pageTitle);
      setContentValue(result.generatedContent);
      Alert.alert('Success', 'Content generated by AI!');
    } catch (error) {
      console.error('[ContentEditor] Failed to generate content:', error);
      Alert.alert('Error', 'Failed to generate content');
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: pageTitle,
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
          }}
        />
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
          title: pageTitle,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 16 }]}>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Manage content for {pageTitle}
          </Text>
        </View>

        {content.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <IconSymbol
              ios_icon_name="description"
              android_material_icon_name="description"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No content yet. Add your first content item.
            </Text>
          </View>
        ) : (
          content.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
              style={[styles.contentCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.contentHeader}>
                <View style={styles.contentInfo}>
                  <Text style={[styles.contentKey, { color: theme.text }]}>{item.contentKey}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.typeText, { color: theme.primary }]}>{item.contentType}</Text>
                  </View>
                </View>
                <View style={styles.contentActions}>
                  <TouchableOpacity
                    onPress={() => handleEditContent(item)}
                    style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
                  >
                    <IconSymbol
                      ios_icon_name="edit"
                      android_material_icon_name="edit"
                      size={18}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteContent(item)}
                    style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
                  >
                    <IconSymbol
                      ios_icon_name="delete"
                      android_material_icon_name="delete"
                      size={18}
                      color={theme.error}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.contentValue, { color: theme.textSecondary }]} numberOfLines={3}>
                {item.contentValue}
              </Text>
            </Animated.View>
          ))
        )}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddContent}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="add"
            android_material_icon_name="add"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.addButtonText}>Add Content</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit/Add Modal */}
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
              {editingContent ? 'Edit Content' : 'New Content'}
            </Text>
            <TouchableOpacity onPress={handleSaveContent}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: theme.text }]}>Content Key</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={contentKey}
              onChangeText={setContentKey}
              placeholder="e.g., introduction, faq_1, policy_section"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Content Type</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { backgroundColor: contentType === 'text' ? theme.primary : theme.card },
                ]}
                onPress={() => setContentType('text')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: contentType === 'text' ? '#FFFFFF' : theme.text },
                  ]}
                >
                  Text
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { backgroundColor: contentType === 'image' ? theme.primary : theme.card },
                ]}
                onPress={() => setContentType('image')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: contentType === 'image' ? '#FFFFFF' : theme.text },
                  ]}
                >
                  Image
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { backgroundColor: contentType === 'video' ? theme.primary : theme.card },
                ]}
                onPress={() => setContentType('video')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: contentType === 'video' ? '#FFFFFF' : theme.text },
                  ]}
                >
                  Video
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contentHeader}>
              <Text style={[styles.label, { color: theme.text }]}>Content Value</Text>
              {contentType === 'text' && (
                <TouchableOpacity
                  style={[styles.aiButton, { backgroundColor: theme.primary + '20' }]}
                  onPress={handleGenerateContent}
                  disabled={aiGenerating}
                >
                  {aiGenerating ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <>
                      <IconSymbol
                        ios_icon_name="auto-awesome"
                        android_material_icon_name="auto-awesome"
                        size={16}
                        color={theme.primary}
                      />
                      <Text style={[styles.aiButtonText, { color: theme.primary }]}>AI Generate</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
              value={contentValue}
              onChangeText={setContentValue}
              placeholder={
                contentType === 'text' ? 'Enter your content here...' :
                contentType === 'image' ? 'Enter image URL' :
                'Enter video URL'
              }
              placeholderTextColor={theme.textSecondary}
              multiline={contentType === 'text'}
              numberOfLines={contentType === 'text' ? 8 : 1}
            />

            {contentType === 'text' && contentValue && (
              <View style={styles.aiActions}>
                <Text style={[styles.aiActionsTitle, { color: theme.text }]}>Improve with AI:</Text>
                <View style={styles.aiActionButtons}>
                  <TouchableOpacity
                    style={[styles.aiActionButton, { backgroundColor: theme.card }]}
                    onPress={() => handleImproveWithAI('clarity')}
                    disabled={aiGenerating}
                  >
                    <Text style={[styles.aiActionButtonText, { color: theme.text }]}>Clarity</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.aiActionButton, { backgroundColor: theme.card }]}
                    onPress={() => handleImproveWithAI('tone')}
                    disabled={aiGenerating}
                  >
                    <Text style={[styles.aiActionButtonText, { color: theme.text }]}>Tone</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.aiActionButton, { backgroundColor: theme.card }]}
                    onPress={() => handleImproveWithAI('length')}
                    disabled={aiGenerating}
                  >
                    <Text style={[styles.aiActionButtonText, { color: theme.text }]}>Length</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.aiActionButton, { backgroundColor: theme.card }]}
                    onPress={() => handleImproveWithAI('engagement')}
                    disabled={aiGenerating}
                  >
                    <Text style={[styles.aiActionButtonText, { color: theme.text }]}>Engagement</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
  },
  contentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentKey: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  aiActions: {
    marginTop: 16,
  },
  aiActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  aiActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  aiActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  aiActionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
