import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

interface SegmentedProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

export function Segmented({ options, value, onChange }: SegmentedProps) {
  return (
    <View style={styles.container}>
      {options.map((o) => {
        const active = o === value;
        return (
          <TouchableOpacity
            key={o}
            onPress={() => onChange(o)}
            style={[styles.option, active && styles.optionActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, active && styles.textActive]}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 13,
    padding: 4,
    gap: 2,
  },
  option: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: Colors.card,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.muted,
    fontWeight: '500',
  },
  textActive: {
    fontFamily: Fonts.bodyBold,
    color: Colors.ink,
    fontWeight: '700',
  },
});
