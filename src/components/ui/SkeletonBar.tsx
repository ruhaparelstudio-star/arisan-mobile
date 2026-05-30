import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';

interface SkeletonBarProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBar({ width = '100%', height = 14, borderRadius = 7, style }: SkeletonBarProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: false,
      }),
    ).start();
  }, []);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [Colors.surface, '#EDF1EF', Colors.surface],
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        { width, height, borderRadius, backgroundColor },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  bar: {},
});
