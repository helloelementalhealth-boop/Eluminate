
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AnimatedHelloProps {
  color: string;
  secondaryColor: string;
}

export default function AnimatedHello({ color, secondaryColor }: AnimatedHelloProps) {
  // Winding pathway animation values
  const pathProgress = useSharedValue(0);
  const pathOpacity = useSharedValue(0);
  
  // Text animation values
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.8);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    console.log('AnimatedHello: Starting Eluminate winding pathway animation');
    
    // Pathway draws in with smooth winding motion (1200ms)
    pathOpacity.value = withTiming(1, { duration: 300 });
    pathProgress.value = withTiming(1, { 
      duration: 1200,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });

    // Text fades in as pathway completes (1200ms delay)
    textOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 600 })
    );

    textScale.value = withDelay(
      1200,
      withSpring(1, { damping: 12, stiffness: 100 })
    );

    // Subtitle appears last (1800ms delay)
    subtitleOpacity.value = withDelay(
      1800,
      withTiming(1, { duration: 600 })
    );
  }, []);

  // Pathway animated styles
  const pathStyle = useAnimatedStyle(() => ({
    opacity: pathOpacity.value,
    transform: [
      { scaleX: pathProgress.value },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Winding pathway above text */}
      <Animated.View style={[styles.pathwayContainer, pathStyle]}>
        <View style={styles.pathway}>
          {/* Curved path segments */}
          <View style={[styles.pathSegment, styles.segment1, { backgroundColor: color }]} />
          <View style={[styles.pathSegment, styles.segment2, { backgroundColor: color }]} />
          <View style={[styles.pathSegment, styles.segment3, { backgroundColor: color }]} />
          <View style={[styles.pathSegment, styles.segment4, { backgroundColor: color }]} />
          <View style={[styles.pathSegment, styles.segment5, { backgroundColor: color }]} />
        </View>
      </Animated.View>

      {/* Eluminate text */}
      <View style={styles.logoContainer}>
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={[styles.nameText, { color }]}>Eluminate</Text>
        </Animated.View>
      </View>

      <Animated.Text style={[styles.subtitle, { color: secondaryColor }, subtitleStyle]}>
        Illuminate your wellness journey
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  pathwayContainer: {
    marginBottom: 32,
    height: 80,
    width: 200,
  },
  pathway: {
    flex: 1,
    position: 'relative',
  },
  pathSegment: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
  },
  segment1: {
    width: 40,
    left: 0,
    top: 40,
    transform: [{ rotate: '-15deg' }],
  },
  segment2: {
    width: 45,
    left: 35,
    top: 25,
    transform: [{ rotate: '20deg' }],
  },
  segment3: {
    width: 50,
    left: 75,
    top: 35,
    transform: [{ rotate: '-10deg' }],
  },
  segment4: {
    width: 40,
    left: 120,
    top: 20,
    transform: [{ rotate: '25deg' }],
  },
  segment5: {
    width: 45,
    left: 155,
    top: 35,
    transform: [{ rotate: '-5deg' }],
  },
  logoContainer: {
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
  },
  nameText: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 8,
  },
});
