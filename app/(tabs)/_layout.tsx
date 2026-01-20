
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'nutrition',
      route: '/(tabs)/nutrition',
      icon: 'restaurant',
      label: 'Nutrition',
    },
    {
      name: 'fitness',
      route: '/(tabs)/fitness',
      icon: 'fitness-center',
      label: 'Fitness',
    },
    {
      name: 'mindfulness',
      route: '/(tabs)/mindfulness',
      icon: 'self-improvement',
      label: 'Mindfulness',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="history" name="(history)" />
        <Stack.Screen key="nutrition" name="nutrition" />
        <Stack.Screen key="fitness" name="fitness" />
        <Stack.Screen key="mindfulness" name="mindfulness" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
