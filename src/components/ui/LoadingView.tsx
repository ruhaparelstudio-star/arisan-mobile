import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { Icon } from './Icon';

interface LoadingRingProps {
  icon: string;
  size?: number;
}

export function LoadingRing({ icon, size = 96 }: LoadingRingProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const innerSize = size - 28;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Animated.View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2, transform: [{ rotate }] },
        ]}
      />
      <View
        style={[
          styles.inner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            top: 14,
            left: 14,
          },
        ]}
      >
        <Icon name={icon} size={size * 0.34} color={Colors.primaryInk} strokeWidth={1.9} />
      </View>
    </View>
  );
}

interface LoadingViewProps {
  icon: string;
  title: string;
  sub?: string;
  cycle?: string[];
}

export function LoadingView({ icon, title, sub, cycle }: LoadingViewProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!cycle) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % cycle.length), 130);
    return () => clearInterval(t);
  }, [cycle]);

  return (
    <View style={styles.container}>
      <LoadingRing icon={icon} />
      {cycle && (
        <View style={styles.cycleWrap}>
          <Text style={styles.cycleText}>{cycle[idx]}</Text>
        </View>
      )}
      <Text style={[styles.title, cycle && { marginTop: 4 }]}>{title}</Text>
      {sub && <Text style={styles.sub}>{sub}</Text>}
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <PulsingDot key={i} delay={i * 150} />
        ))}
      </View>
    </View>
  );
}

function PulsingDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.dot, { opacity }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  ring: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: Colors.primaryTint,
    borderTopColor: Colors.primary,
  },
  inner: {
    position: 'absolute',
    backgroundColor: Colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleWrap: {
    height: 38,
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleText: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 26,
    color: Colors.ink,
    letterSpacing: -0.4,
    fontWeight: '600',
  },
  title: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 20,
    color: Colors.ink,
    letterSpacing: -0.3,
    marginTop: 26,
    fontWeight: '600',
    textAlign: 'center',
  },
  sub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 260,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 22,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
});
