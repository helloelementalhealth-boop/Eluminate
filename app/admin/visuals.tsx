
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme, useAdminAuth } from '@/contexts/WidgetContext';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { adminUploadApi } from '@/utils/adminApi';
import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';

export default function AdminVisuals() {
  const { currentTheme: theme } = useTheme();
  const { isAdmin, isLoading: authLoading } = useAdminAuth();
  const router = useRouter();

  // Redirect to admin login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      console.log('[AdminVisuals] Not authenticated, redirecting to admin login');
      Alert.alert('Access Denied', 'Please login as admin to access this page');
      router.replace('/admin/');
    }
  }, [authLoading, isAdmin]);

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Visual Content',
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
          }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  const handlePickImage = async () => {
    console.log('[AdminVisuals] User tapped upload image');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('[AdminVisuals] Image selected, uploading...');
      try {
        const uploadResult = await adminUploadApi.uploadImage(result.assets[0].uri);
        Alert.alert(
          'Upload Successful',
          `Image uploaded!\n\nURL: ${uploadResult.url}\n\nYou can now use this URL in your content.`,
          [
            {
              text: 'Copy URL',
              onPress: () => {
                // In a real app, you'd copy to clipboard here
                console.log('[AdminVisuals] URL copied:', uploadResult.url);
              },
            },
            { text: 'OK' },
          ]
        );
      } catch (error) {
        console.error('[AdminVisuals] Upload failed:', error);
        Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Visual Content',
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
            Upload images and videos to use in your app content
          </Text>
        </View>

        <View style={[styles.uploadCard, { backgroundColor: theme.card }]}>
          <IconSymbol
            ios_icon_name="cloud-upload"
            android_material_icon_name="cloud-upload"
            size={64}
            color={theme.primary}
          />
          <Text style={[styles.uploadTitle, { color: theme.text }]}>Upload Media</Text>
          <Text style={[styles.uploadDescription, { color: theme.textSecondary }]}>
            Upload images to get a URL that you can use in your content
          </Text>
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: theme.primary }]}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name="image"
              android_material_icon_name="image"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.uploadButtonText}>Choose Image</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <IconSymbol
            ios_icon_name="info"
            android_material_icon_name="info"
            size={24}
            color={theme.primary}
          />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>How to use</Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              1. Upload an image using the button above{'\n'}
              2. Copy the URL from the success message{'\n'}
              3. Use the URL in your content editor{'\n'}
              4. The image will be displayed in your app
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
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  uploadCard: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
