
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
import { colors } from '@/styles/commonStyles';
import { nutritionApi, MealType, NutritionLog } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';

export default function NutritionScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const loadData = React.useCallback(async () => {
    console.log('[NutritionScreen] Loading nutrition data');
    setRefreshing(true);
    try {
      const [logsData, summaryData] = await Promise.all([
        nutritionApi.getLogs(today),
        nutritionApi.getSummary(today),
      ]);
      setLogs(logsData);
      setSummary(summaryData);
      console.log('[NutritionScreen] Data loaded');
    } catch (error) {
      console.error('[NutritionScreen] Failed to load data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddMeal = async () => {
    if (!foodName || !calories) {
      Alert.alert('Missing Info', 'Please enter food name and calories');
      return;
    }

    console.log('[NutritionScreen] Adding meal:', { foodName, calories });
    try {
      await nutritionApi.createLog({
        date: today,
        meal_type: selectedMealType,
        food_name: foodName,
        calories: parseInt(calories),
        protein: protein ? parseInt(protein) : undefined,
        carbs: carbs ? parseInt(carbs) : undefined,
        fats: fats ? parseInt(fats) : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      setFoodName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
      loadData();
    } catch (error) {
      console.error('[NutritionScreen] Failed to add meal:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to log meal');
    }
  };

  const handleDeleteLog = (id: string) => {
    Alert.alert('Delete Entry', 'Remove this meal log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          console.log('[NutritionScreen] Deleting log:', id);
          try {
            await nutritionApi.deleteLog(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            loadData();
          } catch (error) {
            console.error('[NutritionScreen] Failed to delete log:', error);
            Alert.alert('Error', 'Failed to delete entry');
          }
        },
      },
    ]);
  };

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <Text style={[styles.title, { color: theme.text }]}>Nutrition</Text>
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
        {/* Daily Summary */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.summaryCard, { backgroundColor: theme.card }]}
        >
          <Text style={[styles.summaryTitle, { color: theme.text }]}>Today&apos;s Intake</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.primary }]}>
                {summary?.total_calories || 0}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Calories</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.success }]}>
                {summary?.total_protein || 0}g
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Protein</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.warning }]}>
                {summary?.total_carbs || 0}g
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Carbs</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.error }]}>
                {summary?.total_fats || 0}g
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Fats</Text>
            </View>
          </View>
        </Animated.View>

        {/* Meal Logs */}
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="restaurant"
              android_material_icon_name="restaurant"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No meals logged today
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap + to log your first meal
            </Text>
          </View>
        ) : (
          logs.map((log, index) => (
            <Animated.View
              key={log.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
              style={[styles.logCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.logHeader}>
                <View style={styles.logInfo}>
                  <View style={[styles.mealBadge, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.mealBadgeText, { color: theme.primary }]}>
                      {log.meal_type}
                    </Text>
                  </View>
                  <Text style={[styles.foodName, { color: theme.text }]}>{log.food_name}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteLog(log.id)} activeOpacity={0.7}>
                  <IconSymbol
                    ios_icon_name="delete"
                    android_material_icon_name="delete"
                    size={20}
                    color={theme.error}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.macroRow}>
                <Text style={[styles.macroText, { color: theme.textSecondary }]}>
                  {log.calories} cal
                </Text>
                {log.protein && (
                  <Text style={[styles.macroText, { color: theme.textSecondary }]}>
                    {log.protein}g protein
                  </Text>
                )}
                {log.carbs && (
                  <Text style={[styles.macroText, { color: theme.textSecondary }]}>
                    {log.carbs}g carbs
                  </Text>
                )}
                {log.fats && (
                  <Text style={[styles.macroText, { color: theme.textSecondary }]}>
                    {log.fats}g fats
                  </Text>
                )}
              </View>
            </Animated.View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Meal Modal */}
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
            <Text style={[styles.modalTitle, { color: theme.text }]}>Log Meal</Text>
            <TouchableOpacity onPress={handleAddMeal}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: theme.text }]}>Meal Type</Text>
            <View style={styles.mealTypeGrid}>
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedMealType(type)}
                  style={[
                    styles.mealTypeButton,
                    {
                      backgroundColor:
                        selectedMealType === type ? theme.primary : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.mealTypeText,
                      {
                        color: selectedMealType === type ? '#FFFFFF' : theme.text,
                      },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Food Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={foodName}
              onChangeText={setFoodName}
              placeholder="e.g., Grilled chicken salad"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Calories *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={calories}
              onChangeText={setCalories}
              placeholder="e.g., 350"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.text }]}>Protein (g)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={protein}
              onChangeText={setProtein}
              placeholder="Optional"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.text }]}>Carbs (g)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={carbs}
              onChangeText={setCarbs}
              placeholder="Optional"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.text }]}>Fats (g)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={fats}
              onChangeText={setFats}
              placeholder="Optional"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
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
    justifyContent: 'space-between',
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
  logCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logInfo: {
    flex: 1,
    gap: 8,
  },
  mealBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroText: {
    fontSize: 13,
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
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  mealTypeText: {
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
});
