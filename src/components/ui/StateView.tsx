import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { Icon } from './Icon';
import { Btn } from './Button';

type Tone = 'mint' | 'amber' | 'danger' | 'neutral';

const toneMap: Record<Tone, [string, string]> = {
  mint: [Colors.primaryTint, Colors.primaryInk],
  amber: [Colors.amberTint, Colors.amberInk],
  danger: [Colors.dangerTint, Colors.danger],
  neutral: [Colors.surface, Colors.mutedStrong],
};

interface StateViewProps {
  icon: string;
  tone?: Tone;
  title: string;
  body?: string;
  primary?: string;
  secondary?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export function StateView({
  icon,
  tone = 'mint',
  title,
  body,
  primary,
  secondary,
  onPrimary,
  onSecondary,
}: StateViewProps) {
  const [bg, fg] = toneMap[tone];
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <Icon name={icon} size={42} color={fg} strokeWidth={1.7} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {body && <Text style={styles.body}>{body}</Text>}
      {(primary || secondary) && (
        <View style={styles.actions}>
          {primary && (
            <Btn full size="lg" onPress={onPrimary}>
              {primary}
            </Btn>
          )}
          {secondary && (
            <Btn full size="md" variant="ghost" onPress={onSecondary}>
              {secondary}
            </Btn>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    paddingHorizontal: 36,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 23,
    color: Colors.ink,
    letterSpacing: -0.4,
    marginTop: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  body: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14.5,
    color: Colors.muted,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 280,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    marginTop: 28,
    gap: 10,
  },
});
