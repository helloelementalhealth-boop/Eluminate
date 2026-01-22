
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
import * as Haptics from 'expo-haptics';
import { useTheme, useAdminAuth } from '@/contexts/WidgetContext';

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme } = useTheme();
  const router = useRouter();
  const { isAdmin, login, logout } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const success = await login(username, password);
      if (success) {
        Alert.alert('Success', 'Logged in as admin');
        setUsername('');
        setPassword('');
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      console.error('[AdminDashboard] Login failed:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('[AdminDashboard] Logging out');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await logout();
    Alert.alert('Success', 'Logged out successfully');
  };

  const adminSections = [
    {
      title: 'Content Management',
      items: [
        {
          icon: 'category',
          label: 'Categories',
          description: 'Manage app categories',
          route: '/admin/categories',
        },
        {
          icon: 'description',
          label: 'Pages',
          description: 'Edit privacy, terms, help pages',
          route: '/admin/pages-manager',
        },
        {
          icon: 'palette',
          label: 'Visuals',
          description: 'Manage themes and visuals',
          route: '/admin/visuals',
        },
      ],
    },
    {
      title: 'Premium Features',
      items: [
        {
          icon: 'star',
          label: 'Subscriptions',
          description: 'Manage subscription plans',
          route: '/admin/subscriptions',
        },
        {
          icon: 'spa',
          label: 'Wellness Programs',
          description: 'Manage wellness programs and premium content',
          route: '/admin/wellness-programs',
        },
      ],
    },
    {
      title: 'User Engagement',
      items: [
        {
          icon: 'notifications',
          label: 'Notifications',
          description: 'Manage push notifications',
          route: '/admin/notifications-manager',
        },
      ],
    },
  ];

  const loginTitle = 'Admin Login';
  const usernameLabel = 'Username';
  const passwordLabel = 'Password';
  const loginButtonText = 'Login';
  const dashboardTitle = 'Admin Dashboard';
  const logoutButtonText = 'Logout';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isAdmin ? 'Admin' : 'Login',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!isAdmin ? (
          // Login Form
          <View style={[styles.loginContainer, Platform.OS === 'android' && { paddingTop: 48 }]}>
            <View style={[styles.loginCard, { backgroundColor: theme.card }]}>
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                <IconSymbol
                  ios_icon_name="lock"
                  android_material_icon_name="lock"
                  size={48}
                  color={theme.primary}
                />
              </View>
              <Text style={[styles.loginTitle, { color: theme.text }]}>
                {loginTitle}
              </Text>
              <Text style={[styles.loginSubtitle, { color: theme.textSecondary }]}>
                Enter your credentials to access admin features
              </Text>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  {usernameLabel}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  {passwordLabel}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: theme.primary }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <IconSymbol
                      ios_icon_name="login"
                      android_material_icon_name="login"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.loginButtonText}>{loginButtonText}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Admin Dashboard
          <View style={[Platform.OS === 'android' && { paddingTop: 48 }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>
                {dashboardTitle}
              </Text>
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: theme.error + '20' }]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <IconSymbol
                  ios_icon_name="logout"
                  android_material_icon_name="logout"
                  size={18}
                  color={theme.error}
                />
                <Text style={[styles.logoutButtonText, { color: theme.error }]}>
                  {logoutButtonText}
                </Text>
              </TouchableOpacity>
            </View>

            {adminSections.map((section, sectionIndex) => (
              <View key={section.title} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {section.title}
                </Text>
                <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
                  {section.items.map((item, itemIndex) => (
                    <React.Fragment key={item.route}>
                      <Animated.View
                        entering={FadeInDown.delay((sectionIndex * 100) + (itemIndex * 50)).duration(300)}
                      >
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => handleNavigate(item.route)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: theme.primary + '20' }]}>
                              <IconSymbol
                                ios_icon_name={item.icon}
                                android_material_icon_name={item.icon}
                                size={24}
                                color={theme.primary}
                              />
                            </View>
                            <View style={styles.menuTextContainer}>
                              <Text style={[styles.menuLabel, { color: theme.text }]}>
                                {item.label}
                              </Text>
                              <Text style={[styles.menuDescription, { color: theme.textSecondary }]}>
                                {item.description}
                              </Text>
                            </View>
                          </View>
                          <IconSymbol
                            ios_icon_name="chevron-right"
                            android_material_icon_name="chevron-right"
                            size={20}
                            color={theme.textSecondary}
                          />
                        </TouchableOpacity>
                      </Animated.View>
                      {itemIndex < section.items.length - 1 && (
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

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
  loginContainer: {
    paddingTop: 60,
  },
  loginCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    width: '100%',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    marginTop: 8,
    gap: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
