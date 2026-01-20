
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
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme, useAdminAuth } from '@/contexts/WidgetContext';
import * as Haptics from 'expo-haptics';
import { adminContentApi, adminAiApi } from '@/utils/adminApi';
import { useRouter } from 'expo-router';

interface AppPage {
  id: string;
  pageType: 'privacy' | 'terms' | 'help' | 'about';
  pageTitle: string;
  pageContent: string;
  lastUpdated: string;
  updatedBy?: string;
}

export default function PagesManager() {
  const { currentTheme: theme } = useTheme();
  const { isAdmin, isLoading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [pages, setPages] = useState<AppPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPage, setEditingPage] = useState<AppPage | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form state
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    console.log('[PagesManager] Loading pages');
    setLoading(true);
    try {
      // Fetch all content from backend
      const allContent = await adminContentApi.getAllContent();
      console.log('[PagesManager] Loaded content:', allContent);
      
      // Group content by page name and convert to AppPage format
      const pageMap = new Map<string, AppPage>();
      
      allContent.forEach(content => {
        const pageType = content.pageName.toLowerCase() as 'privacy' | 'terms' | 'help' | 'about';
        
        if (!pageMap.has(content.pageName)) {
          pageMap.set(content.pageName, {
            id: content.id,
            pageType: pageType,
            pageTitle: content.pageName.charAt(0).toUpperCase() + content.pageName.slice(1),
            pageContent: '',
            lastUpdated: content.updatedAt,
          });
        }
        
        const page = pageMap.get(content.pageName)!;
        // Concatenate all content values for the page
        if (content.contentType === 'text') {
          page.pageContent += (page.pageContent ? '\n\n' : '') + content.contentValue;
        }
      });
      
      const pagesArray = Array.from(pageMap.values());
      
      // If no pages exist, create default pages
      if (pagesArray.length === 0) {
        console.log('[PagesManager] No pages found, creating defaults');
        const defaultPages: AppPage[] = [
          {
            id: '1',
            pageType: 'privacy',
            pageTitle: 'Privacy Policy',
            pageContent: 'Your privacy is important to us...',
            lastUpdated: new Date().toISOString(),
          },
          {
            id: '2',
            pageType: 'terms',
            pageTitle: 'Terms of Service',
            pageContent: 'By using this app, you agree to...',
            lastUpdated: new Date().toISOString(),
          },
          {
            id: '3',
            pageType: 'help',
            pageTitle: 'Help & Support',
            pageContent: 'Need help? Here are some common questions...',
            lastUpdated: new Date().toISOString(),
          },
        ];
        setPages(defaultPages);
      } else {
        setPages(pagesArray);
      }
    } catch (error) {
      console.error('[PagesManager] Failed to load pages:', error);
      Alert.alert('Error', 'Failed to load pages. Using default data.');
      // Fallback to default pages on error
      const defaultPages: AppPage[] = [
        {
          id: '1',
          pageType: 'privacy',
          pageTitle: 'Privacy Policy',
          pageContent: 'Your privacy is important to us...',
          lastUpdated: new Date().toISOString(),
        },
        {
          id: '2',
          pageType: 'terms',
          pageTitle: 'Terms of Service',
          pageContent: 'By using this app, you agree to...',
          lastUpdated: new Date().toISOString(),
        },
        {
          id: '3',
          pageType: 'help',
          pageTitle: 'Help & Support',
          pageContent: 'Need help? Here are some common questions...',
          lastUpdated: new Date().toISOString(),
        },
      ];
      setPages(defaultPages);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPage = (page: AppPage) => {
    console.log('[PagesManager] Editing page:', page.pageType);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingPage(page);
    setPageTitle(page.pageTitle);
    setPageContent(page.pageContent);
    setModalVisible(true);
  };

  const handleSavePage = async () => {
    if (!pageTitle || !pageContent) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!editingPage) {
      Alert.alert('Error', 'No page selected for editing');
      return;
    }

    console.log('[PagesManager] Saving page:', editingPage.pageType);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Check if content already exists for this page
      const existingContent = await adminContentApi.getContentByPage(editingPage.pageType);
      
      if (existingContent.length > 0) {
        // Update existing content
        console.log('[PagesManager] Updating existing content:', existingContent[0].id);
        await adminContentApi.updateContent(existingContent[0].id, {
          contentValue: pageContent,
          isActive: true,
        });
      } else {
        // Create new content
        console.log('[PagesManager] Creating new content for page:', editingPage.pageType);
        await adminContentApi.createContent({
          pageName: editingPage.pageType,
          contentType: 'text',
          contentKey: 'main_content',
          contentValue: pageContent,
          displayOrder: 0,
          isActive: true,
        });
      }
      
      Alert.alert('Success', 'Page updated successfully');
      setModalVisible(false);
      loadPages();
    } catch (error) {
      console.error('[PagesManager] Failed to save page:', error);
      Alert.alert('Error', 'Failed to save page. Please try again.');
    }
  };

  const handleGenerateWithAI = async () => {
    if (!editingPage) return;

    console.log('[PagesManager] Generating content with AI for:', editingPage.pageType);
    setAiGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Generate content using AI API
      const prompt = `Generate a comprehensive ${editingPage.pageType} page for FlōWell, a wellness app that helps users track fitness, nutrition, mindfulness, and sleep.`;
      const result = await adminAiApi.generateContent(prompt, 'text', `Page type: ${editingPage.pageType}`);
      
      setPageContent(result.generatedContent);
      Alert.alert('Success', 'Content generated by AI! Review and edit as needed.');
    } catch (error) {
      console.error('[PagesManager] Failed to generate content:', error);
      Alert.alert('Error', 'Failed to generate content with AI. Using fallback content.');
      
      // Fallback to placeholder content if AI generation fails
      const placeholderContent = {
        privacy: 'Privacy Policy\n\nLast updated: [Date]\n\n1. Information We Collect\nWe collect information you provide directly to us, including when you create an account, use our services, or communicate with us.\n\n2. How We Use Your Information\nWe use the information we collect to provide, maintain, and improve our services, and to communicate with you.\n\n3. Information Sharing\nWe do not share your personal information with third parties except as described in this policy.\n\n4. Data Security\nWe implement appropriate security measures to protect your information.\n\n5. Your Rights\nYou have the right to access, update, or delete your personal information.\n\n6. Contact Us\nIf you have questions about this Privacy Policy, please contact us.',
        terms: 'Terms of Service\n\nLast updated: [Date]\n\n1. Acceptance of Terms\nBy accessing and using this app, you accept and agree to be bound by these Terms of Service.\n\n2. Use of Service\nYou agree to use the service only for lawful purposes and in accordance with these Terms.\n\n3. User Accounts\nYou are responsible for maintaining the confidentiality of your account credentials.\n\n4. Intellectual Property\nAll content and materials available through the service are protected by intellectual property rights.\n\n5. Limitation of Liability\nThe service is provided "as is" without warranties of any kind.\n\n6. Changes to Terms\nWe reserve the right to modify these terms at any time.\n\n7. Contact Information\nFor questions about these Terms, please contact us.',
        help: 'Help & Support\n\nWelcome to our Help Center! Find answers to common questions below.\n\n## Getting Started\n\nQ: How do I create an account?\nA: Tap the "Sign Up" button and follow the prompts to create your account.\n\nQ: How do I reset my password?\nA: Go to Settings > Account > Reset Password.\n\n## Using the App\n\nQ: How do I track my wellness activities?\nA: Navigate to the relevant section (Fitness, Nutrition, Mindfulness, or Sleep) and tap the "+" button to log an activity.\n\nQ: Can I customize my experience?\nA: Yes! Go to Settings > Theme to choose your preferred color theme.\n\n## Subscriptions\n\nQ: What features are included in the premium plan?\nA: Premium includes unlimited tracking, advanced analytics, personalized recommendations, and ad-free experience.\n\nQ: How do I cancel my subscription?\nA: Go to Settings > Subscription > Manage Subscription.\n\n## Contact Support\n\nStill need help? Contact us at support@hellowellness.app',
        about: 'About FlōWell\n\nFlōWell is your companion for holistic wellbeing, designed to support your journey toward balance and vitality.\n\nOur Mission\nWe believe wellness should be accessible, personalized, and rooted in real-life rhythms. Our app combines movement, nutrition, mindfulness, and rest into one seamless experience.\n\nWhat Makes Us Different\n- Holistic approach to wellness\n- AI-powered personalization\n- Beautiful, intuitive design\n- Non-clinical, supportive language\n- Community-driven features\n\nOur Team\nWe\'re a team of wellness enthusiasts, designers, and developers passionate about creating tools that truly support your wellbeing.\n\nVersion 1.0.0\n© 2026 FlōWell. All rights reserved.',
      };

      const generatedContent = placeholderContent[editingPage.pageType] || pageContent;
      setPageContent(generatedContent);
    } finally {
      setAiGenerating(false);
    }
  };

  const getPageIcon = (pageType: string) => {
    switch (pageType) {
      case 'privacy': return 'lock';
      case 'terms': return 'description';
      case 'help': return 'help';
      case 'about': return 'info';
      default: return 'description';
    }
  };

  // Redirect to admin login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      console.log('[PagesManager] Not authenticated, redirecting to admin login');
      Alert.alert('Access Denied', 'Please login as admin to access this page');
      router.replace('/admin/');
    }
  }, [authLoading, isAdmin]);

  if (loading || authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Content Pages',
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

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Content Pages',
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
            Manage Privacy Policy, Terms, Help & Support pages
          </Text>
        </View>

        {pages.map((page, index) => (
          <Animated.View
            key={page.id}
            entering={FadeInDown.delay(index * 50).duration(300)}
            style={[styles.pageCard, { backgroundColor: theme.card }]}
          >
            <View style={styles.pageHeader}>
              <View style={styles.pageInfo}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                  <IconSymbol
                    ios_icon_name={getPageIcon(page.pageType)}
                    android_material_icon_name={getPageIcon(page.pageType)}
                    size={24}
                    color={theme.primary}
                  />
                </View>
                <View style={styles.pageDetails}>
                  <Text style={[styles.pageTitle, { color: theme.text }]}>{page.pageTitle}</Text>
                  <Text style={[styles.pageType, { color: theme.textSecondary }]}>
                    {page.pageType.charAt(0).toUpperCase() + page.pageType.slice(1)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleEditPage(page)}
                style={[styles.editButton, { backgroundColor: theme.primary }]}
              >
                <IconSymbol
                  ios_icon_name="edit"
                  android_material_icon_name="edit"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.pagePreview, { color: theme.textSecondary }]} numberOfLines={2}>
              {page.pageContent}
            </Text>
            <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>
              Last updated: {new Date(page.lastUpdated).toLocaleDateString()}
            </Text>
          </Animated.View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Modal */}
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
              Edit {editingPage?.pageType}
            </Text>
            <TouchableOpacity onPress={handleSavePage}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.aiHeader}>
              <Text style={[styles.label, { color: theme.text }]}>Page Title</Text>
              <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: theme.primary + '20' }]}
                onPress={handleGenerateWithAI}
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
                    <Text style={[styles.aiButtonText, { color: theme.primary }]}>
                      Generate with AI
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={pageTitle}
              onChangeText={setPageTitle}
              placeholder="Page title"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Page Content</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
              value={pageContent}
              onChangeText={setPageContent}
              placeholder="Enter page content..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={20}
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
  pageCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pageInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageDetails: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pageType: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pagePreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    fontStyle: 'italic',
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
    textTransform: 'capitalize',
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
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
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
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 400,
    textAlignVertical: 'top',
  },
});
