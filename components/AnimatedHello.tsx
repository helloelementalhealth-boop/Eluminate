
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
  const letterAnimations = useMemo(
    () => acronym.map(() => ({ opacity: useSharedValue(0), scale: useSharedValue(0) })),
    []
  );
  const wordAnimations = useMemo(
    () => acronym.map(() => ({ opacity: useSharedValue(0), translateX: useSharedValue(-20) })),
    []
  );

  useEffect(() => {
    // Animate letters first
    letterAnimations.forEach((anim, index) => {
      anim.opacity.value = withDelay(
        index * 150,
        withSequence(
          withSpring(1, {
            damping: 12,
            stiffness: 100,
          }),
          withSpring(1, { damping: 8 })
        )
      );
      anim.scale.value = withDelay(
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
    wordAnimations.forEach((anim, index) => {
      anim.opacity.value = withDelay(
        index * 150 + 300,
        withTiming(1, { duration: 600 })
      );
      anim.translateX.value = withDelay(
        index * 150 + 300,
        withTiming(0, { duration: 600 })
      );
    });
  }, [letterAnimations, wordAnimations]);

  return (
    <View style={styles.container}>
      <View style={styles.helloContainer}>
        {acronym.map((item, index) => {
          const letterStyle = useAnimatedStyle(() => ({
            opacity: letterAnimations[index].opacity.value,
            transform: [
              { scale: letterAnimations[index].scale.value },
              { translateY: (1 - letterAnimations[index].opacity.value) * 20 },
            ],
          }));

          const wordStyle = useAnimatedStyle(() => ({
            opacity: wordAnimations[index].opacity.value,
            transform: [
              { translateX: wordAnimations[index].translateX.value },
            ],
          }));

          return (
            <View key={index} style={styles.row}>
              <Animated.Text style={[styles.letter, { color }, letterStyle]}>
                {item.letter}
              </Animated.Text>
              <Animated.Text style={[styles.word, { color: secondaryColor }, wordStyle]}>
                {item.word}
              </Animated.Text>
            </View>
          );
        })}
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
