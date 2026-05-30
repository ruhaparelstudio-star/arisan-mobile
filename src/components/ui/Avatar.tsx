import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, getAvatarColor } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

interface AvatarProps {
  name?: string;
  size?: number;
  ring?: boolean;
  mint?: boolean;
}

export function Avatar({ name = '?', size = 40, ring, mint }: AvatarProps) {
  const initial = name.trim()[0]?.toUpperCase() ?? '?';
  const [bg, fg] = mint ? [Colors.primaryTint, Colors.primaryInk] : getAvatarColor(name);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth: ring ? 2 : 0,
          borderColor: Colors.card,
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.38, color: fg }]}>{initial}</Text>
    </View>
  );
}

interface AvatarStackProps {
  names: string[];
  size?: number;
  max?: number;
}

export function AvatarStack({ names, size = 30, max = 4 }: AvatarStackProps) {
  const shown = names.slice(0, max);
  const extra = names.length - max;
  return (
    <View style={styles.stack}>
      {shown.map((n, i) => (
        <View key={i} style={{ marginLeft: i === 0 ? 0 : -(size * 0.32) }}>
          <Avatar name={n} size={size} ring />
        </View>
      ))}
      {extra > 0 && (
        <View
          style={[
            styles.extraBadge,
            {
              marginLeft: -(size * 0.32),
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <Text style={[styles.extraText, { fontSize: size * 0.34 }]}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  initial: {
    fontFamily: Fonts.displaySemiBold,
    fontWeight: '600',
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  extraBadge: {
    backgroundColor: Colors.ink,
    borderWidth: 2,
    borderColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraText: {
    fontFamily: Fonts.displaySemiBold,
    color: Colors.white,
    fontWeight: '600',
  },
});
