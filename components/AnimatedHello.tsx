
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedHelloProps {
  color: string;
  secondaryColor: string;
}

const acronym = [
  { letter: 'H', word: 'Hold' },
  { letter: 'E', word: 'Exhale' },
  { letter: 'L', word: 'Listen' },
  { letter: 'L', word: 'Lighten' },
  { letter: 'O', word: 'Open' },
];

export default function AnimatedHello({ color, secondaryColor }: AnimatedHelloProps) {
  // Create all animated values at the component level (not in callbacks)
  const letterOpacity0 = useSharedValue(0);
  const letterOpacity1 = useSharedValue(0);
  const letterOpacity2 = useSharedValue(0);
  const letterOpacity3 = useSharedValue(0);
  const letterOpacity4 = useSharedValue(0);

  const letterScale0 = useSharedValue(0);
  const letterScale1 = useSharedValue(0);
  const letterScale2 = useSharedValue(0);
  const letterScale3 = useSharedValue(0);
  const letterScale4 = useSharedValue(0);

  const wordOpacity0 = useSharedValue(0);
  const wordOpacity1 = useSharedValue(0);
  const wordOpacity2 = useSharedValue(0);
  const wordOpacity3 = useSharedValue(0);
  const wordOpacity4 = useSharedValue(0);

  const wordTranslateX0 = useSharedValue(-20);
  const wordTranslateX1 = useSharedValue(-20);
  const wordTranslateX2 = useSharedValue(-20);
  const wordTranslateX3 = useSharedValue(-20);
  const wordTranslateX4 = useSharedValue(-20);

  const letterOpacities = [letterOpacity0, letterOpacity1, letterOpacity2, letterOpacity3, letterOpacity4];
  const letterScales = [letterScale0, letterScale1, letterScale2, letterScale3, letterScale4];
  const wordOpacities = [wordOpacity0, wordOpacity1, wordOpacity2, wordOpacity3, wordOpacity4];
  const wordTranslateXs = [wordTranslateX0, wordTranslateX1, wordTranslateX2, wordTranslateX3, wordTranslateX4];

  useEffect(() => {
    // Animate letters first
    letterOpacities.forEach((opacity, index) => {
      opacity.value = withDelay(
        index * 150,
        withSequence(
          withSpring(1, {
            damping: 12,
            stiffness: 100,
          }),
          withSpring(1, { damping: 8 })
        )
      );
    });

    letterScales.forEach((scale, index) => {
      scale.value = withDelay(
        index * 150,
        withSequence(
          withSpring(1, {
            damping: 12,
            stiffness: 100,
          }),
          withSpring(1.1, { damping: 8 }),
          withSpring(1, { damping: 10 })
        )
      );
    });

    // Then animate words
    wordOpacities.forEach((opacity, index) => {
      opacity.value = withDelay(
        index * 150 + 300,
        withTiming(1, { duration: 600 })
      );
    });

    wordTranslateXs.forEach((translateX, index) => {
      translateX.value = withDelay(
        index * 150 + 300,
        withTiming(0, { duration: 600 })
      );
    });
  }, []);

  // Create animated styles at component level
  const letterStyle0 = useAnimatedStyle(() => ({
    opacity: letterOpacity0.value,
    transform: [
      { scale: letterScale0.value },
      { translateY: (1 - letterOpacity0.value) * 20 },
    ],
  }));

  const letterStyle1 = useAnimatedStyle(() => ({
    opacity: letterOpacity1.value,
    transform: [
      { scale: letterScale1.value },
      { translateY: (1 - letterOpacity1.value) * 20 },
    ],
  }));

  const letterStyle2 = useAnimatedStyle(() => ({
    opacity: letterOpacity2.value,
    transform: [
      { scale: letterScale2.value },
      { translateY: (1 - letterOpacity2.value) * 20 },
    ],
  }));

  const letterStyle3 = useAnimatedStyle(() => ({
    opacity: letterOpacity3.value,
    transform: [
      { scale: letterScale3.value },
      { translateY: (1 - letterOpacity3.value) * 20 },
    ],
  }));

  const letterStyle4 = useAnimatedStyle(() => ({
    opacity: letterOpacity4.value,
    transform: [
      { scale: letterScale4.value },
      { translateY: (1 - letterOpacity4.value) * 20 },
    ],
  }));

  const wordStyle0 = useAnimatedStyle(() => ({
    opacity: wordOpacity0.value,
    transform: [{ translateX: wordTranslateX0.value }],
  }));

  const wordStyle1 = useAnimatedStyle(() => ({
    opacity: wordOpacity1.value,
    transform: [{ translateX: wordTranslateX1.value }],
  }));

  const wordStyle2 = useAnimatedStyle(() => ({
    opacity: wordOpacity2.value,
    transform: [{ translateX: wordTranslateX2.value }],
  }));

  const wordStyle3 = useAnimatedStyle(() => ({
    opacity: wordOpacity3.value,
    transform: [{ translateX: wordTranslateX3.value }],
  }));

  const wordStyle4 = useAnimatedStyle(() => ({
    opacity: wordOpacity4.value,
    transform: [{ translateX: wordTranslateX4.value }],
  }));

  const letterStyles = [letterStyle0, letterStyle1, letterStyle2, letterStyle3, letterStyle4];
  const wordStyles = [wordStyle0, wordStyle1, wordStyle2, wordStyle3, wordStyle4];

  return (
    <View style={styles.container}>
      <View style={styles.helloContainer}>
        {acronym.map((item, index) => (
          <View key={index} style={styles.row}>
            <Animated.Text style={[styles.letter, { color }, letterStyles[index]]}>
              {item.letter}
            </Animated.Text>
            <Animated.Text style={[styles.word, { color: secondaryColor }, wordStyles[index]]}>
              {item.word}
            </Animated.Text>
          </View>
        ))}
      </View>
      <Text style={[styles.subtitle, { color: secondaryColor }]}>
        Begin your wellness journey
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  helloContainer: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  letter: {
    fontSize: 48,
    fontWeight: '700',
    width: 60,
    letterSpacing: -1,
  },
  word: {
    fontSize: 24,
    fontWeight: '500',
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 8,
  },
});
