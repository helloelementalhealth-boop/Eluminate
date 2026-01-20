
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <Label>Home</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} drawable="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="nutrition">
        <Label>Nutrition</Label>
        <Icon sf={{ default: 'fork.knife', selected: 'fork.knife.circle.fill' }} drawable="restaurant" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="fitness">
        <Label>Fitness</Label>
        <Icon sf={{ default: 'figure.walk', selected: 'figure.run' }} drawable="fitness-center" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="mindfulness">
        <Label>Mindfulness</Label>
        <Icon sf={{ default: 'brain.head.profile', selected: 'brain.head.profile.fill' }} drawable="self-improvement" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon sf={{ default: 'person', selected: 'person.fill' }} drawable="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
