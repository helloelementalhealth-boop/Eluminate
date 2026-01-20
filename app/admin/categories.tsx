
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
import { adminCategoriesApi, AdminCategory } from '@/utils/adminApi';
import { useRouter } from 'expo-router';

export default function AdminCategories() {
  const { currentTheme: theme } = useTheme();
  const { isAdmin, isLoading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);

  // Form state
  const [categoryName, setCategoryName] = useState('');
  const [iconName, setIconName] = useState('');
  const [routePath, setRoutePath] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    console.log('[AdminCategories] Loading categories');
    setLoading(true);
    try {
      const data = await adminCategoriesApi.getCategories();
      setCategories(data.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      console.error('[AdminCategories] Failed to load categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    console.log('[AdminCategories] User tapped Add Category');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingCategory(null);
    setCategoryName('');
    setIconName('');
    setRoutePath('');
    setModalVisible(true);
  };

  const handleEditCategory = (category: AdminCategory) => {
    console.log('[AdminCategories] Editing category:', category.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingCategory(category);
    setCategoryName(category.categoryName);
    setIconName(category.iconName);
    setRoutePath(category.routePath);
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName || !iconName || !routePath) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    console.log('[AdminCategories] Saving category');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const categoryData = {
        categoryName,
        iconName,
        routePath,
        displayOrder: editingCategory?.displayOrder || categories.length,
        isActive: true,
      };

      if (editingCategory) {
        await adminCategoriesApi.updateCategory(editingCategory.id, categoryData);
      } else {
        await adminCategoriesApi.createCategory(categoryData);
      }

      setModalVisible(false);
      loadCategories();
      Alert.alert('Success', `Category ${editingCategory ? 'updated' : 'created'} successfully. Restart the app to see changes in the tab bar.`);
    } catch (error) {
      console.error('[AdminCategories] Failed to save category:', error);
      Alert.alert('Error', 'Failed to save category');
    }
  };

  const handleDeleteCategory = (category: AdminCategory) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.categoryName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('[AdminCategories] Deleting category:', category.id);
            try {
              await adminCategoriesApi.deleteCategory(category.id);
              loadCategories();
              Alert.alert('Success', 'Category deleted successfully. Restart the app to see changes.');
            } catch (error) {
              console.error('[AdminCategories] Failed to delete category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const commonIcons = [
    'home', 'person', 'settings', 'notifications', 'favorite', 'search',
    'restaurant', 'fitness-center', 'self-improvement', 'bedtime',
    'calendar-today', 'chat', 'photo', 'music-note', 'shopping-cart',
  ];

  // Redirect to admin login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      console.log('[AdminCategories] Not authenticated, redirecting to admin login');
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
            title: 'Tab Bar Categories',
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
          title: 'Tab Bar Categories',
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
            Add or edit navigation tabs. Changes require app restart.
          </Text>
        </View>

        {categories.map((category, index) => (
          <Animated.View
            key={category.id}
            entering={FadeInDown.delay(index * 50).duration(300)}
            style={[styles.categoryCard, { backgroundColor: theme.card }]}
          >
            <View style={styles.categoryHeader}>
              <View style={styles.categoryInfo}>
                <View style={[styles.iconPreview, { backgroundColor: theme.primary + '20' }]}>
                  <IconSymbol
                    ios_icon_name={category.iconName}
                    android_material_icon_name={category.iconName}
                    size={24}
                    color={theme.primary}
                  />
                </View>
                <View style={styles.categoryDetails}>
                  <Text style={[styles.categoryName, { color: theme.text }]}>
                    {category.categoryName}
                  </Text>
                  <Text style={[styles.categoryRoute, { color: theme.textSecondary }]}>
                    {category.routePath}
                  </Text>
                </View>
              </View>
              <View style={styles.categoryActions}>
                <TouchableOpacity
                  onPress={() => handleEditCategory(category)}
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
                  onPress={() => handleDeleteCategory(category)}
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
          </Animated.View>
        ))}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddCategory}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="add"
            android_material_icon_name="add"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.addButtonText}>Add Category</Text>
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
              {editingCategory ? 'Edit Category' : 'New Category'}
            </Text>
            <TouchableOpacity onPress={handleSaveCategory}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: theme.text }]}>Category Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="e.g., Wellness, Goals"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Icon Name (Material Icons)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={iconName}
              onChangeText={setIconName}
              placeholder="e.g., favorite, home, person"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.iconHelp, { color: theme.textSecondary }]}>
              Common icons:
            </Text>
            <View style={styles.iconGrid}>
              {commonIcons.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconOption, { backgroundColor: iconName === icon ? theme.primary + '20' : theme.card }]}
                  onPress={() => setIconName(icon)}
                >
                  <IconSymbol
                    ios_icon_name={icon}
                    android_material_icon_name={icon}
                    size={20}
                    color={iconName === icon ? theme.primary : theme.text}
                  />
                  <Text style={[styles.iconOptionText, { color: iconName === icon ? theme.primary : theme.textSecondary }]}>
                    {icon}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Route Path</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={routePath}
              onChangeText={setRoutePath}
              placeholder="e.g., /(tabs)/wellness"
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
  categoryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryRoute: {
    fontSize: 13,
  },
  categoryActions: {
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
  iconHelp: {
    fontSize: 13,
    marginTop: 12,
    marginBottom: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: '31%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  iconOptionText: {
    fontSize: 10,
    textAlign: 'center',
  },
});
