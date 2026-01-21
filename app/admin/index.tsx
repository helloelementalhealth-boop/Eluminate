
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme, useAdminAuth } from '@/contexts/WidgetContext';
import * as Haptics from 'expo-haptics';

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme } = useTheme();
  const router = useRouter();
  const { isAdmin, isLoading, login, logout } = useAdminAuth();
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

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

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    console.log('[AdminDashboard] Attempting login');
    setLoggingIn(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const success = await login(username, password);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Welcome, Admin!');
        setUsername('');
        setPassword('');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('[AdminDashboard] Login error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            console.log('[AdminDashboard] Logging out');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await logout();
            Alert.alert('Success', 'You have been logged out');
          },
        },
      ]
    );
  };

  // Show loading state while checking authentication
  if (isLoading) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Checking authentication...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show login form if not authenticated
  if (!isAdmin) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Login',
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            headerShadowVisible: false,
          }}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.loginContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.loginCard, { backgroundColor: theme.card }]}>
            <View style={[styles.lockIcon, { backgroundColor: theme.primary + '20' }]}>
              <IconSymbol
                ios_icon_name="lock"
                android_material_icon_name="lock"
                size={48}
                color={theme.primary}
              />
            </View>
            <Text style={[styles.loginTitle, { color: theme.text }]}>Admin Access Required</Text>
            <Text style={[styles.loginSubtitle, { color: theme.textSecondary }]}>
              Please login with your admin credentials to access the control panel
            </Text>

            <View style={styles.loginForm}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Username</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={[styles.inputLabel, { color: theme.text }]}>Password</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: theme.primary }]}
                onPress={handleLogin}
                disabled={loggingIn}
                activeOpacity={0.8}
              >
                {loggingIn ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <IconSymbol
                      ios_icon_name="login"
                      android_material_icon_name="login"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.loginButtonText}>Login</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
              <IconSymbol
                ios_icon_name="info"
                android_material_icon_name="info"
                size={16}
                color={theme.primary}
              />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                Default credentials: admin / admin123
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Admin Control',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 16 }}
            >
              <IconSymbol
                ios_icon_name="logout"
                android_material_icon_name="logout"
                size={24}
                color={theme.error}
              />
            </TouchableOpacity>
          ),
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  loginContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  loginCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lockIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginForm: {
    width: '100%',
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: -8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
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
