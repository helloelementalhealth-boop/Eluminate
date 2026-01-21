
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
import { sleepApi, SleepTool } from '@/utils/api';
import { useRouter } from 'expo-router';

export default function SleepScreen() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [tools, setTools] = useState<SleepTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<SleepTool | null>(null);
  const [toolContent, setToolContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const loadTools = async () => {
    console.log('[SleepScreen] Loading sleep tools');
    setRefreshing(true);
    try {
      const data = await sleepApi.getTools();
      setTools(data);
      console.log('[SleepScreen] Sleep tools loaded:', data.length, 'tools');
    } catch (error) {
      console.error('[SleepScreen] Failed to load sleep tools:', error);
      setTools([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  const handleToolPress = async (tool: SleepTool) => {
    console.log('[SleepScreen] User tapped tool:', tool.title, 'Premium:', tool.is_premium);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (tool.is_premium) {
      Alert.alert(
        'Premium Feature',
        `${tool.title} is a premium feature. Upgrade to access advanced sleep tools and guided content.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => {
              console.log('[SleepScreen] User tapped Upgrade');
              router.push('/(tabs)/profile');
            },
          },
        ]
      );
      return;
    }

    setSelectedTool(tool);
    setLoadingContent(true);
    setModalVisible(true);

    try {
      const fullTool = await sleepApi.getTool(tool.id);
      setToolContent(fullTool.content || 'Content not available');
      console.log('[SleepScreen] Tool content loaded');
    } catch (error) {
      console.error('[SleepScreen] Failed to load tool content:', error);
      setToolContent('Unable to load content. Please try again.');
    } finally {
      setLoadingContent(false);
    }
  };

  const getToolIcon = (toolType: string): string => {
    const iconMap: Record<string, string> = {
      breathwork: 'air',
      body_scan: 'self-improvement',
      sleep_story: 'menu-book',
      ambient_sounds: 'music-note',
      gratitude: 'favorite',
      wind_down: 'nightlight',
    };
    return iconMap[toolType] || 'bedtime';
  };

  const getToolColor = (toolType: string): string => {
    const colorMap: Record<string, string> = {
      breathwork: '#7A8B9B',
      body_scan: '#8B7A9B',
      sleep_story: '#8B9B7F',
      ambient_sounds: '#9B8B7A',
      gratitude: '#C4A876',
      wind_down: '#B88B7B',
    };
    return colorMap[toolType] || theme.primary;
  };

  const getToolImage = (toolType: string): string => {
    const imageMap: Record<string, string> = {
      breathwork: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      body_scan: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
      sleep_story: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
      ambient_sounds: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80',
      gratitude: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
      wind_down: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    };
    return imageMap[toolType] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';
  };

  const durationText = selectedTool ? `${selectedTool.duration_minutes} min` : '';

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
          <RefreshControl refreshing={refreshing} onRefresh={loadTools} tintColor={theme.primary} />
        }
      >
        {/* Sleep Tools Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Evening Tools</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Choose what helps you unwind and prepare for rest
          </Text>

          <View style={styles.toolsGrid}>
            {tools.map((tool, index) => {
              const toolIcon = getToolIcon(tool.tool_type);
              const toolColor = getToolColor(tool.tool_type);
              const toolImage = getToolImage(tool.tool_type);

              return (
                <Animated.View
                  key={tool.id}
                  entering={FadeInDown.delay(index * 80).duration(400)}
                  style={styles.toolCardContainer}
                >
                  <TouchableOpacity
                    style={[styles.toolCard, { backgroundColor: theme.card }]}
                    onPress={() => handleToolPress(tool)}
                    activeOpacity={0.8}
                  >
                    <ImageBackground
                      source={{ uri: toolImage }}
                      style={styles.toolImage}
                      imageStyle={styles.toolImageStyle}
                    >
                      <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                        style={styles.toolGradient}
                      >
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
                        <View style={[styles.toolIconContainer, { backgroundColor: toolColor + '30' }]}>
                          <IconSymbol
                            ios_icon_name={toolIcon}
                            android_material_icon_name={toolIcon}
                            size={24}
                            color="#FFFFFF"
                          />
                        </View>
                        <Text style={styles.toolName}>{tool.title}</Text>
                        <Text style={styles.toolDescription}>{tool.description}</Text>
                        <View style={styles.toolFooter}>
                          <View style={styles.durationBadge}>
                            <IconSymbol
                              ios_icon_name="schedule"
                              android_material_icon_name="schedule"
                              size={14}
                              color="rgba(255, 255, 255, 0.9)"
                            />
                            <Text style={styles.durationText}>{tool.duration_minutes} min</Text>
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

      {/* Tool Content Modal */}
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
              {selectedTool?.title}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedTool && (
              <>
                <View style={[styles.modalToolCard, { backgroundColor: theme.card }]}>
                  <View style={[styles.modalIconContainer, { backgroundColor: getToolColor(selectedTool.tool_type) + '30' }]}>
                    <IconSymbol
                      ios_icon_name={getToolIcon(selectedTool.tool_type)}
                      android_material_icon_name={getToolIcon(selectedTool.tool_type)}
                      size={48}
                      color={getToolColor(selectedTool.tool_type)}
                    />
                  </View>
                  <Text style={[styles.modalToolDescription, { color: theme.textSecondary }]}>
                    {selectedTool.description}
                  </Text>
                  <View style={styles.modalDurationRow}>
                    <IconSymbol
                      ios_icon_name="schedule"
                      android_material_icon_name="schedule"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.modalDuration, { color: theme.textSecondary }]}>
                      {durationText}
                    </Text>
                  </View>
                </View>

                {loadingContent ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                      Loading content...
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.contentCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.contentTitle, { color: theme.text }]}>Guide</Text>
                    <Text style={[styles.contentText, { color: theme.text }]}>
                      {toolContent}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.startButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    console.log('[SleepScreen] User started tool:', selectedTool.title);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert('Tool Started', `Enjoy your ${selectedTool.title} session`);
                  }}
                  activeOpacity={0.8}
                >
                  <IconSymbol
                    ios_icon_name="play-arrow"
                    android_material_icon_name="play-arrow"
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={styles.startButtonText}>Begin Session</Text>
                </TouchableOpacity>
              </>
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
  toolsGrid: {
    gap: 16,
  },
  toolCardContainer: {
    marginBottom: 0,
  },
  toolCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 220,
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
  premiumBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
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
    marginBottom: 6,
  },
  toolDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 12,
  },
  toolFooter: {
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
  modalToolCard: {
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
  modalToolDescription: {
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  contentCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 40,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
