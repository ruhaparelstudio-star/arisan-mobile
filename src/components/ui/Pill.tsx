import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

type Tone = 'neutral' | 'mint' | 'solid' | 'amber' | 'danger' | 'dark';

const tones: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: Colors.surface, fg: Colors.mutedStrong },
  mint: { bg: Colors.primaryTint, fg: Colors.primaryInk },
  solid: { bg: Colors.primary, fg: Colors.white },
  amber: { bg: Colors.amberTint, fg: Colors.amberInk },
  danger: { bg: Colors.dangerTint, fg: Colors.danger },
  dark: { bg: Colors.ink, fg: Colors.white },
};

interface PillProps {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  style?: ViewStyle;
}

export function Pill({ children, tone = 'neutral', dot, style }: PillProps) {
  const t = tones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: t.fg }]} />}
      <Text style={[styles.text, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  text: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
  },
});
