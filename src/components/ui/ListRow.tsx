import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { Icon } from './Icon';

interface ListRowProps {
  icon?: string;
  iconColor?: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  lastChild?: boolean;
  leading?: React.ReactNode;
}

export function ListRow({
  icon,
  iconColor,
  title,
  sub,
  right,
  onPress,
  lastChild,
  leading,
}: ListRowProps) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.row, !lastChild && styles.border]}
    >
      {leading}
      {icon && (
        <View style={styles.iconTile}>
          <Icon name={icon} size={20} color={iconColor ?? Colors.ink} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {sub && <Text style={styles.sub}>{sub}</Text>}
      </View>
      {right}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 2,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.ink,
    fontWeight: '600',
  },
  sub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12.5,
    color: Colors.muted,
    marginTop: 1,
  },
});
