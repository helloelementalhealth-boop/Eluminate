
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
import { adminSubscriptionsApi, adminAiApi, SubscriptionPlan } from '@/utils/adminApi';

export default function AdminSubscriptions() {
  const { currentTheme: theme } = useTheme();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form state
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [price, setPrice] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    console.log('[AdminSubscriptions] Loading subscription plans');
    setLoading(true);
    try {
      const data = await adminSubscriptionsApi.getPlans();
      setPlans(data.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      console.error('[AdminSubscriptions] Failed to load plans:', error);
      Alert.alert('Error', 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    console.log('[AdminSubscriptions] User tapped Add Plan');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingPlan(null);
    setPlanName('');
    setPlanDescription('');
    setPrice('');
    setBillingPeriod('monthly');
    setFeatures([]);
    setModalVisible(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    console.log('[AdminSubscriptions] Editing plan:', plan.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingPlan(plan);
    setPlanName(plan.planName);
    setPlanDescription(plan.planDescription || '');
    setPrice(plan.price);
    setBillingPeriod(plan.billingPeriod);
    setFeatures(plan.features);
    setModalVisible(true);
  };

  const handleSavePlan = async () => {
    if (!planName || !price) {
      Alert.alert('Error', 'Please fill in plan name and price');
      return;
    }

    console.log('[AdminSubscriptions] Saving plan');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const planData = {
        planName,
        planDescription,
        price,
        billingPeriod,
        features,
        displayOrder: editingPlan?.displayOrder || plans.length,
        isActive: true,
      };

      if (editingPlan) {
        await adminSubscriptionsApi.updatePlan(editingPlan.id, planData);
      } else {
        await adminSubscriptionsApi.createPlan(planData);
      }

      setModalVisible(false);
      loadPlans();
      Alert.alert('Success', `Plan ${editingPlan ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('[AdminSubscriptions] Failed to save plan:', error);
      Alert.alert('Error', 'Failed to save plan');
    }
  };

  const handleDeletePlan = (plan: SubscriptionPlan) => {
    Alert.alert(
      'Delete Plan',
      `Are you sure you want to delete "${plan.planName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('[AdminSubscriptions] Deleting plan:', plan.id);
            try {
              await adminSubscriptionsApi.deletePlan(plan.id);
              loadPlans();
              Alert.alert('Success', 'Plan deleted successfully');
            } catch (error) {
              console.error('[AdminSubscriptions] Failed to delete plan:', error);
              Alert.alert('Error', 'Failed to delete plan');
            }
          },
        },
      ]
    );
  };

  const handleGenerateFeatures = async () => {
    if (!planName) {
      Alert.alert('Error', 'Please enter a plan name first');
      return;
    }

    console.log('[AdminSubscriptions] Generating features with AI');
    setAiGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const planType = planName.toLowerCase().includes('premium') ? 'premium' :
                       planName.toLowerCase().includes('enterprise') ? 'enterprise' : 'basic';
      const result = await adminAiApi.generateFeatures(planName, planType);
      setFeatures(result.features);
      Alert.alert('Success', 'Features generated by AI!');
    } catch (error) {
      console.error('[AdminSubscriptions] Failed to generate features:', error);
      Alert.alert('Error', 'Failed to generate features');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Subscriptions',
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
          title: 'Subscriptions',
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
            Manage subscription plans and pricing
          </Text>
        </View>

        {plans.map((plan, index) => (
          <Animated.View
            key={plan.id}
            entering={FadeInDown.delay(index * 50).duration(300)}
            style={[styles.planCard, { backgroundColor: theme.card }]}
          >
            <View style={styles.planHeader}>
              <View style={styles.planInfo}>
                <Text style={[styles.planName, { color: theme.text }]}>{plan.planName}</Text>
                <Text style={[styles.planPrice, { color: theme.primary }]}>
                  {plan.price} / {plan.billingPeriod}
                </Text>
              </View>
              <View style={styles.planActions}>
                <TouchableOpacity
                  onPress={() => handleEditPlan(plan)}
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
                  onPress={() => handleDeletePlan(plan)}
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
            {plan.planDescription && (
              <Text style={[styles.planDescription, { color: theme.textSecondary }]}>
                {plan.planDescription}
              </Text>
            )}
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <IconSymbol
                    ios_icon_name="check-circle"
                    android_material_icon_name="check-circle"
                    size={16}
                    color={theme.success}
                  />
                  <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        ))}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddPlan}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="add"
            android_material_icon_name="add"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.addButtonText}>Add New Plan</Text>
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
              {editingPlan ? 'Edit Plan' : 'New Plan'}
            </Text>
            <TouchableOpacity onPress={handleSavePlan}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: theme.text }]}>Plan Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={planName}
              onChangeText={setPlanName}
              placeholder="e.g., Premium Plan"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
              value={planDescription}
              onChangeText={setPlanDescription}
              placeholder="Brief description of the plan"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.label, { color: theme.text }]}>Price</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={price}
              onChangeText={setPrice}
              placeholder="e.g., $9.99"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Billing Period</Text>
            <View style={styles.periodButtons}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  { backgroundColor: billingPeriod === 'monthly' ? theme.primary : theme.card },
                ]}
                onPress={() => setBillingPeriod('monthly')}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    { color: billingPeriod === 'monthly' ? '#FFFFFF' : theme.text },
                  ]}
                >
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  { backgroundColor: billingPeriod === 'yearly' ? theme.primary : theme.card },
                ]}
                onPress={() => setBillingPeriod('yearly')}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    { color: billingPeriod === 'yearly' ? '#FFFFFF' : theme.text },
                  ]}
                >
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.featuresHeader}>
              <Text style={[styles.label, { color: theme.text }]}>Features</Text>
              <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: theme.primary + '20' }]}
                onPress={handleGenerateFeatures}
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
            </View>

            {features.map((feature, index) => (
              <View key={index} style={[styles.featureItem, { backgroundColor: theme.card }]}>
                <Text style={[styles.featureItemText, { color: theme.text }]}>{feature}</Text>
                <TouchableOpacity onPress={() => handleRemoveFeature(index)}>
                  <IconSymbol
                    ios_icon_name="close"
                    android_material_icon_name="close"
                    size={20}
                    color={theme.error}
                  />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addFeatureRow}>
              <TextInput
                style={[styles.featureInput, { backgroundColor: theme.card, color: theme.text }]}
                value={newFeature}
                onChangeText={setNewFeature}
                placeholder="Add a feature"
                placeholderTextColor={theme.textSecondary}
                onSubmitEditing={handleAddFeature}
              />
              <TouchableOpacity
                style={[styles.addFeatureButton, { backgroundColor: theme.primary }]}
                onPress={handleAddFeature}
              >
                <IconSymbol
                  ios_icon_name="add"
                  android_material_icon_name="add"
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

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
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  planActions: {
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
  planDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
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
    height: 80,
    textAlignVertical: 'top',
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  featuresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
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
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  featureItemText: {
    fontSize: 14,
    flex: 1,
  },
  addFeatureRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  featureInput: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  addFeatureButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
