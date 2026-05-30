import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

interface SectionLabelProps {
  children: React.ReactNode;
  right?: React.ReactNode;
}

export function SectionLabel({ children, right }: SectionLabelProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{children}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  text: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.ink,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
