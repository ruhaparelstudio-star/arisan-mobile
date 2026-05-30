import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  pad?: number;
  onPress?: () => void;
  tint?: boolean;
  accent?: boolean;
}

export function Card({ children, style, pad = 16, onPress, tint, accent }: CardProps) {
  const containerStyle = [
    styles.card,
    {
      backgroundColor: tint ? Colors.primaryTint : Colors.card,
      borderColor: accent ? Colors.primary : Colors.border,
      borderWidth: accent ? 1.5 : 1,
      padding: pad,
    },
    !tint && styles.shadow,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={containerStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  shadow: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
