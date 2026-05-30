import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

interface OtpBoxesProps {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}

export function OtpBoxes({ value, onChange, error }: OtpBoxesProps) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [focused, setFocused] = useState(0);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newVal = value.split('');
    newVal[index] = digit;
    const result = newVal.join('').slice(0, 6);
    onChange(result);
    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const filled = !!value[i];
        const active = i === value.length && i === focused;
        return (
          <TextInput
            key={i}
            ref={(r) => { inputs.current[i] = r; }}
            style={[
              styles.box,
              error && styles.boxError,
              filled && !error && styles.boxFilled,
              active && !error && styles.boxActive,
            ]}
            value={value[i] ?? ''}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            onFocus={() => setFocused(i)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectionColor={Colors.primary}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'space-between',
  },
  box: {
    flex: 1,
    height: 58,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
    fontFamily: Fonts.displaySemiBold,
    fontSize: 24,
    color: Colors.ink,
    fontWeight: '600',
  },
  boxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTint,
  },
  boxActive: {
    borderColor: Colors.primary,
    shadowColor: Colors.primaryRing,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 0,
  },
  boxError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerTint,
    color: Colors.danger,
  },
});
