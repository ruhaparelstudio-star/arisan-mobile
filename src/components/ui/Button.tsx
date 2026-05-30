import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { Icon } from './Icon';

type Variant = 'primary' | 'dark' | 'soft' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface BtnProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  full?: boolean;
  icon?: string;
  iconRight?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
}

const sizeConfig = {
  sm: { paddingV: 8, paddingH: 14, fontSize: 13.5, gap: 6, radius: 12, iconSize: 17 },
  md: { paddingV: 13, paddingH: 20, fontSize: 15.5, gap: 8, radius: 15, iconSize: 19 },
  lg: { paddingV: 16, paddingH: 22, fontSize: 16.5, gap: 9, radius: 17, iconSize: 19 },
};

const variantConfig: Record<Variant, { bg: string; fg: string; border?: string; shadow?: object }> = {
  primary: {
    bg: Colors.primary,
    fg: Colors.white,
    shadow: {
      shadowColor: Colors.primaryShadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 6,
    },
  },
  dark: { bg: Colors.ink, fg: Colors.white },
  soft: { bg: Colors.primaryTint, fg: Colors.primaryInk },
  outline: { bg: 'transparent', fg: Colors.ink, border: Colors.borderStrong },
  ghost: { bg: 'transparent', fg: Colors.primaryInk },
};

export function Btn({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  full,
  icon,
  iconRight,
  style,
  textStyle,
  disabled,
  loading,
}: BtnProps) {
  const s = sizeConfig[size];
  const v = variantConfig[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.base,
        {
          paddingVertical: s.paddingV,
          paddingHorizontal: s.paddingH,
          borderRadius: s.radius,
          backgroundColor: v.bg,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border,
          width: full ? '100%' : undefined,
          opacity: disabled ? 0.45 : 1,
          gap: s.gap,
        },
        v.shadow as ViewStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={s.iconSize} color={v.fg} strokeWidth={2} />}
          <Text style={[styles.text, { fontSize: s.fontSize, color: v.fg }, textStyle]}>
            {children}
          </Text>
          {iconRight && <Icon name={iconRight} size={s.iconSize} color={v.fg} strokeWidth={2} />}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.bodySemiBold,
    fontWeight: '600',
  },
});
