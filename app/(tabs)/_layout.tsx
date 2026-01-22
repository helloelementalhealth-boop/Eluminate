
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
      name: 'nourishment',
      route: '/(tabs)/nourishment',
      icon: 'water-drop',
      label: 'Nourishment',
    },
    {
      name: 'movement',
      route: '/(tabs)/movement',
      icon: 'autorenew',
      label: 'Movement',
    },
    {
      name: 'mindfulness',
      route: '/(tabs)/mindfulness',
      icon: 'self-improvement',
      label: 'Mindfulness',
    },
    {
      name: 'sleep',
      route: '/(tabs)/sleep',
      icon: 'spa',
      label: 'Wellness',
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
        <Stack.Screen key="nourishment" name="nourishment" />
        <Stack.Screen key="movement" name="movement" />
        <Stack.Screen key="mindfulness" name="mindfulness" />
        <Stack.Screen key="sleep" name="sleep" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
