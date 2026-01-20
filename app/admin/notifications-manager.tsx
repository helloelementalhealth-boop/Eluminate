
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
import { useTheme } from '@/contexts/WidgetContext';
import * as Haptics from 'expo-haptics';

// TODO: Backend Integration - GET /api/admin/notifications to fetch notification templates
// TODO: Backend Integration - POST /api/admin/notifications to create notification
// TODO: Backend Integration - PUT /api/admin/notifications/:id to update notification
// TODO: Backend Integration - DELETE /api/admin/notifications/:id to delete notification

interface NotificationTemplate {
  id: string;
  notificationTitle: string;
  notificationBody: string;
  category?: string;
  scheduleType?: string;
  scheduleTime?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotificationsManager() {
  const { currentTheme: theme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationTemplate | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [scheduleTime, setScheduleTime] = useState('09:00');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    console.log('[NotificationsManager] Loading notification templates');
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await fetch('/api/admin/notifications').then(r => r.json());
      const data: NotificationTemplate[] = [
        {
          id: '1',
          notificationTitle: 'Morning Motivation',
          notificationBody: 'Start your day with intention and purpose',
          category: 'wellness',
          scheduleType: 'daily',
          scheduleTime: '08:00',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setNotifications(data);
    } catch (error) {
      console.error('[NotificationsManager] Failed to load notifications:', error);
      Alert.alert('Error', 'Failed to load notification templates');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotification = () => {
    console.log('[NotificationsManager] User tapped Add Notification');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingNotification(null);
    setTitle('');
    setBody('');
    setCategory('');
    setScheduleType('daily');
    setScheduleTime('09:00');
    setModalVisible(true);
  };

  const handleEditNotification = (notification: NotificationTemplate) => {
    console.log('[NotificationsManager] Editing notification:', notification.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingNotification(notification);
    setTitle(notification.notificationTitle);
    setBody(notification.notificationBody);
    setCategory(notification.category || '');
    setScheduleType((notification.scheduleType as any) || 'daily');
    setScheduleTime(notification.scheduleTime || '09:00');
    setModalVisible(true);
  };

  const handleSaveNotification = async () => {
    if (!title || !body) {
      Alert.alert('Error', 'Please fill in title and body');
      return;
    }

    console.log('[NotificationsManager] Saving notification');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // TODO: Replace with actual API call
      Alert.alert('Success', `Notification ${editingNotification ? 'updated' : 'created'} successfully`);
      setModalVisible(false);
      loadNotifications();
    } catch (error) {
      console.error('[NotificationsManager] Failed to save notification:', error);
      Alert.alert('Error', 'Failed to save notification');
    }
  };

  const handleDeleteNotification = (notification: NotificationTemplate) => {
    Alert.alert(
      'Delete Notification',
      `Are you sure you want to delete "${notification.notificationTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('[NotificationsManager] Deleting notification:', notification.id);
            try {
              // TODO: Replace with actual API call
              Alert.alert('Success', 'Notification deleted successfully');
              loadNotifications();
            } catch (error) {
              console.error('[NotificationsManager] Failed to delete notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Notifications',
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
          title: 'Notifications',
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
            Manage push notification templates and schedules
          </Text>
        </View>

        {notifications.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <IconSymbol
              ios_icon_name="notifications"
              android_material_icon_name="notifications"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No notification templates yet. Create your first one.
            </Text>
          </View>
        ) : (
          notifications.map((notification, index) => (
            <Animated.View
              key={notification.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
              style={[styles.notificationCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.notificationInfo}>
                  <Text style={[styles.notificationTitle, { color: theme.text }]}>
                    {notification.notificationTitle}
                  </Text>
                  <View style={styles.badges}>
                    {notification.category && (
                      <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
                        <Text style={[styles.badgeText, { color: theme.primary }]}>
                          {notification.category}
                        </Text>
                      </View>
                    )}
                    <View style={[styles.badge, { backgroundColor: theme.secondary + '20' }]}>
                      <Text style={[styles.badgeText, { color: theme.secondary }]}>
                        {notification.scheduleType}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.notificationActions}>
                  <TouchableOpacity
                    onPress={() => handleEditNotification(notification)}
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
                    onPress={() => handleDeleteNotification(notification)}
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
              <Text style={[styles.notificationBody, { color: theme.textSecondary }]}>
                {notification.notificationBody}
              </Text>
              {notification.scheduleTime && (
                <Text style={[styles.scheduleTime, { color: theme.textSecondary }]}>
                  Scheduled: {notification.scheduleTime}
                </Text>
              )}
            </Animated.View>
          ))
        )}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddNotification}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="add"
            android_material_icon_name="add"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.addButtonText}>Add Notification Template</Text>
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
              {editingNotification ? 'Edit Notification' : 'New Notification'}
            </Text>
            <TouchableOpacity onPress={handleSaveNotification}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: theme.text }]}>Notification Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Morning Motivation"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Notification Body</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
              value={body}
              onChangeText={setBody}
              placeholder="The message users will see"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
            />

            <Text style={[styles.label, { color: theme.text }]}>Category (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., wellness, fitness, mindfulness"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Schedule Type</Text>
            <View style={styles.scheduleButtons}>
              <TouchableOpacity
                style={[
                  styles.scheduleButton,
                  { backgroundColor: scheduleType === 'daily' ? theme.primary : theme.card },
                ]}
                onPress={() => setScheduleType('daily')}
              >
                <Text
                  style={[
                    styles.scheduleButtonText,
                    { color: scheduleType === 'daily' ? '#FFFFFF' : theme.text },
                  ]}
                >
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.scheduleButton,
                  { backgroundColor: scheduleType === 'weekly' ? theme.primary : theme.card },
                ]}
                onPress={() => setScheduleType('weekly')}
              >
                <Text
                  style={[
                    styles.scheduleButtonText,
                    { color: scheduleType === 'weekly' ? '#FFFFFF' : theme.text },
                  ]}
                >
                  Weekly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.scheduleButton,
                  { backgroundColor: scheduleType === 'custom' ? theme.primary : theme.card },
                ]}
                onPress={() => setScheduleType('custom')}
              >
                <Text
                  style={[
                    styles.scheduleButtonText,
                    { color: scheduleType === 'custom' ? '#FFFFFF' : theme.text },
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Schedule Time</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={scheduleTime}
              onChangeText={setScheduleTime}
              placeholder="e.g., 09:00"
              placeholderTextColor={theme.textSecondary}
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
  notificationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  notificationActions: {
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
  notificationBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  scheduleTime: {
    fontSize: 12,
    fontStyle: 'italic',
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
    height: 100,
    textAlignVertical: 'top',
  },
  scheduleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  scheduleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
