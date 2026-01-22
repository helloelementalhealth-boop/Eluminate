
import React from 'react';
import { Stack } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
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
        <Stack.Screen key="renewal" name="renewal" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      
      <NativeTabs>
        <NativeTabs.Trigger name="(home)">
          <Label>Home</Label>
          <Icon sf={{ default: 'house', selected: 'house.fill' }} drawable="home" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="nourishment">
          <Label>Nourishment</Label>
          <Icon sf={{ default: 'drop', selected: 'drop.fill' }} drawable="water-drop" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="movement">
          <Label>Movement</Label>
          <Icon sf={{ default: 'arrow.triangle.2.circlepath', selected: 'arrow.triangle.2.circlepath.circle.fill' }} drawable="autorenew" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="mindfulness">
          <Label>Mindfulness</Label>
          <Icon sf={{ default: 'brain.head.profile', selected: 'brain.head.profile.fill' }} drawable="self-improvement" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="renewal">
          <Label>Renewal</Label>
          <Icon sf={{ default: 'sparkles', selected: 'sparkles' }} drawable="spa" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Label>Profile</Label>
          <Icon sf={{ default: 'person', selected: 'person.fill' }} drawable="person" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </>
  );
}
