
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
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
  
  // Individual letter animation values - each letter pans in from left
  const letterE = useSharedValue(-50);
  const letterL = useSharedValue(-50);
  const letterU = useSharedValue(-50);
  const letterM = useSharedValue(-50);
  const letterI = useSharedValue(-50);
  const letterN = useSharedValue(-50);
  const letterA = useSharedValue(-50);
  const letterT = useSharedValue(-50);
  const letterE2 = useSharedValue(-50);
  
  const letterOpacityE = useSharedValue(0);
  const letterOpacityL = useSharedValue(0);
  const letterOpacityU = useSharedValue(0);
  const letterOpacityM = useSharedValue(0);
  const letterOpacityI = useSharedValue(0);
  const letterOpacityN = useSharedValue(0);
  const letterOpacityA = useSharedValue(0);
  const letterOpacityT = useSharedValue(0);
  const letterOpacityE2 = useSharedValue(0);
  
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    console.log('AnimatedHello: Starting Eluminate letter pan-in animation');
    
    // Pathway draws in with smooth winding motion (2000ms)
    pathOpacity.value = withTiming(1, { duration: 500 });
    pathProgress.value = withTiming(1, { 
      duration: 2000,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });

    // Each letter pans in smoothly from left with staggered timing
    const letterDelay = 80; // Delay between each letter
    const letterDuration = 400; // Duration for each letter animation
    const startDelay = 2000; // Start after pathway completes
    
    // E
    letterOpacityE.value = withDelay(startDelay, withTiming(1, { duration: letterDuration }));
    letterE.value = withDelay(startDelay, withTiming(0, { duration: letterDuration, easing: Easing.out(Easing.cubic) }));
    
    // L
    letterOpacityL.value = withDelay(startDelay + letterDelay, withTiming(1, { duration: letterDuration }));
    letterL.value = withDelay(startDelay + letterDelay, withTiming(0, { duration: letterDuration, easing: Easing.out(Easing.cubic) }));
    
    // U
    letterOpacityU.value = withDelay(startDelay + letterDelay * 2, withTiming(1, { duration: letterDuration }));
    letterU.value = withDelay(startDelay + letterDelay * 2, withTiming(0, { duration: letterDuration, easing: Easing.out(Easing.cubic) }));
    
    // M
    letterOpacityM.value = withDelay(startDelay + letterDelay * 3, withTiming(1, { duration: letterDuration }));
    letterM.value = withDelay(startDelay + letterDelay * 3, withTiming(0, { duration: letterDuration, easing: Easing.out(Easing.cubic) }));
    
    // I
    letterOpacityI.value = withDelay(startDelay + letterDelay * 4, withTiming(1, { duration: letterDuration }));
    letterI.value = withDelay(startDelay + letterDelay * 4, withTiming(0, { duration: letterDuration, easing: Easing.out(Easing.cubic) }));
    
    // N
    letterOpacityN.value = withDelay(startDelay + letterDelay * 5, withTiming(1, { duration: letterDuration }));
    letterN.value = withDelay(startDelay + letterDelay * 5, withTiming(0, { duration: letterDuration, easing: Easing.out(Easing.cubic) }));
    
    // A
    letterOpacityA.value = withDelay(startDelay + letterDelay * 6, withTiming(1, { duration: letterDuration }));
    letterA.value = withDelay(startDelay + letterDelay * 6, withTiming(0, { duration: letterDuration, easing: Easing.out(Easing.cubic) }));
    
    // T
    letterOpacityT.value = withDelay(startDelay + letterDelay * 7, withTiming(1, { duration: letterDuration }));
    letterT.value = withDelay(startDelay + letterDelay * 7, withTiming(0, { duration: letterDuration, easing: Easing.out(Easing.cubic) }));
    
    // E
    letterOpacityE2.value = withDelay(startDelay + letterDelay * 8, withTiming(1, { duration: letterDuration }));
    letterE2.value = withDelay(startDelay + letterDelay * 8, withTiming(0, { duration: letterDuration, easing: Easing.out(Easing.cubic) }));

    // Subtitle appears after all letters (3640ms total)
    subtitleOpacity.value = withDelay(3640, withTiming(1, { duration: 600 }));
  }, [
    pathProgress,
    pathOpacity,
    letterE,
    letterL,
    letterU,
    letterM,
    letterI,
    letterN,
    letterA,
    letterT,
    letterE2,
    letterOpacityE,
    letterOpacityL,
    letterOpacityU,
    letterOpacityM,
    letterOpacityI,
    letterOpacityN,
    letterOpacityA,
    letterOpacityT,
    letterOpacityE2,
    subtitleOpacity,
  ]);

  // Pathway animated styles
  const pathStyle = useAnimatedStyle(() => ({
    opacity: pathOpacity.value,
    transform: [
      { scaleX: pathProgress.value },
    ],
  }));

  // Individual letter styles
  const letterStyleE = useAnimatedStyle(() => ({
    opacity: letterOpacityE.value,
    transform: [{ translateX: letterE.value }],
  }));
  
  const letterStyleL = useAnimatedStyle(() => ({
    opacity: letterOpacityL.value,
    transform: [{ translateX: letterL.value }],
  }));
  
  const letterStyleU = useAnimatedStyle(() => ({
    opacity: letterOpacityU.value,
    transform: [{ translateX: letterU.value }],
  }));
  
  const letterStyleM = useAnimatedStyle(() => ({
    opacity: letterOpacityM.value,
    transform: [{ translateX: letterM.value }],
  }));
  
  const letterStyleI = useAnimatedStyle(() => ({
    opacity: letterOpacityI.value,
    transform: [{ translateX: letterI.value }],
  }));
  
  const letterStyleN = useAnimatedStyle(() => ({
    opacity: letterOpacityN.value,
    transform: [{ translateX: letterN.value }],
  }));
  
  const letterStyleA = useAnimatedStyle(() => ({
    opacity: letterOpacityA.value,
    transform: [{ translateX: letterA.value }],
  }));
  
  const letterStyleT = useAnimatedStyle(() => ({
    opacity: letterOpacityT.value,
    transform: [{ translateX: letterT.value }],
  }));
  
  const letterStyleE2 = useAnimatedStyle(() => ({
    opacity: letterOpacityE2.value,
    transform: [{ translateX: letterE2.value }],
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

      {/* Eluminate text - each letter pans in individually */}
      <View style={styles.logoContainer}>
        <View style={styles.textContainer}>
          <View style={styles.letterRow}>
            <Animated.Text style={[styles.letter, { color }, letterStyleE]}>E</Animated.Text>
            <Animated.Text style={[styles.letter, { color }, letterStyleL]}>l</Animated.Text>
            <Animated.Text style={[styles.letter, { color }, letterStyleU]}>u</Animated.Text>
            <Animated.Text style={[styles.letter, { color }, letterStyleM]}>m</Animated.Text>
            <Animated.Text style={[styles.letter, { color }, letterStyleI]}>i</Animated.Text>
            <Animated.Text style={[styles.letter, { color }, letterStyleN]}>n</Animated.Text>
            <Animated.Text style={[styles.letter, { color }, letterStyleA]}>a</Animated.Text>
            <Animated.Text style={[styles.letter, { color }, letterStyleT]}>t</Animated.Text>
            <Animated.Text style={[styles.letter, { color }, letterStyleE2]}>e</Animated.Text>
          </View>
        </View>
      </View>

      <Animated.Text style={[styles.subtitle, { color: secondaryColor }, subtitleStyle]}>
        Begin with you.
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
  letterRow: {
    flexDirection: 'row',
  },
  letter: {
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
