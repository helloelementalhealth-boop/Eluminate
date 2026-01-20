
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@/contexts/WidgetContext';
import * as Haptics from 'expo-haptics';

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme } = useTheme();
  const router = useRouter();

  const adminSections = [
    {
      title: 'Content Management',
      items: [
        {
          name: 'Content Pages',
          icon: 'description',
          route: '/admin/pages-manager',
          description: 'Edit Privacy, Terms, Help & Support pages',
        },
        {
          name: 'Subscriptions',
          icon: 'card-membership',
          route: '/admin/subscriptions',
          description: 'Manage subscription plans and pricing',
        },
        {
          name: 'Notifications',
          icon: 'notifications',
          route: '/admin/notifications-manager',
          description: 'Create and schedule push notifications',
        },
        {
          name: 'Visual Content',
          icon: 'image',
          route: '/admin/visuals',
          description: 'Upload and manage images/videos',
        },
      ],
    },
    {
      title: 'App Configuration',
      items: [
        {
          name: 'Tab Bar Categories',
          icon: 'category',
          route: '/admin/categories',
          description: 'Add or edit navigation tabs',
        },
      ],
    },
  ];

  const handleNavigate = (route: string) => {
    console.log('[AdminDashboard] Navigating to:', route);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Admin Control',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 16 }]}>
          <Text style={[styles.title, { color: theme.text }]}>Admin Control</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Manage your app content with AI assistance
          </Text>
        </View>

        {adminSections.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(sectionIndex * 100).duration(300)}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={item.name}>
                  {itemIndex > 0 && (
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                  )}
                  <TouchableOpacity
                    style={styles.adminItem}
                    onPress={() => handleNavigate(item.route)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                      <IconSymbol
                        ios_icon_name={item.icon}
                        android_material_icon_name={item.icon}
                        size={24}
                        color={theme.primary}
                      />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                      <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>
                        {item.description}
                      </Text>
                    </View>
                    <IconSymbol
                      ios_icon_name="chevron-right"
                      android_material_icon_name="chevron-right"
                      size={20}
                      color={theme.textSecondary}
                    />
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </Animated.View>
        ))}

        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <IconSymbol
            ios_icon_name="info"
            android_material_icon_name="info"
            size={24}
            color={theme.primary}
          />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>AI-Powered Editing</Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Use AI assistance to generate and improve content throughout the admin panel. Look for the ✨ icon.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  adminItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginTop: 8,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
