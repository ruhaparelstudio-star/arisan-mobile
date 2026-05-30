import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { Icon } from './Icon';

interface AppBarProps {
  title?: string;
  sub?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  large?: boolean;
  dark?: boolean;
}

export function AppBar({ title, sub, onBack, right, large, dark }: AppBarProps) {
  const color = dark ? Colors.white : Colors.ink;
  return (
    <View
      style={[
        styles.bar,
        large ? styles.barLarge : styles.barNormal,
      ]}
    >
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backBtn, dark && styles.backBtnDark]}
          activeOpacity={0.7}
        >
          <Icon name="chevronLeft" size={22} color={color} strokeWidth={2.2} />
        </TouchableOpacity>
      )}
      <View style={styles.titleWrap}>
        {title && (
          <Text
            style={[
              styles.title,
              large ? styles.titleLarge : styles.titleNormal,
              { color },
            ]}
          >
            {title}
          </Text>
        )}
        {sub && <Text style={[styles.sub, { color: Colors.muted }]}>{sub}</Text>}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 10,
  },
  barNormal: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 4,
  },
  barLarge: {
    paddingHorizontal: 22,
    paddingBottom: 8,
    paddingTop: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backBtnDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: Fonts.displaySemiBold,
    fontWeight: '600',
    lineHeight: undefined,
    letterSpacing: -0.4,
  },
  titleNormal: {
    fontSize: 18,
  },
  titleLarge: {
    fontFamily: Fonts.bodyBold,
    fontWeight: '700',
    fontSize: 30,
    letterSpacing: -0.6,
  },
  sub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    marginTop: 2,
  },
});
