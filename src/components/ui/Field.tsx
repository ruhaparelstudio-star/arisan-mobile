import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { Icon } from './Icon';

interface FieldProps {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  prefix?: string;
  icon?: string;
  big?: boolean;
  style?: ViewStyle;
  keyboardType?: TextInput['props']['keyboardType'];
  autoFocus?: boolean;
  maxLength?: number;
  editable?: boolean;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  prefix,
  icon,
  big,
  style,
  keyboardType,
  autoFocus,
  maxLength,
  editable = true,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.input,
          { padding: big ? 14 : 12 },
          focused && styles.inputFocused,
        ]}
      >
        {icon && <Icon name={icon} size={19} color={Colors.muted} />}
        {prefix && (
          <Text style={[styles.prefix, { fontSize: big ? 18 : 15 }]}>{prefix}</Text>
        )}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.muted}
          style={[styles.textInput, { fontSize: big ? 18 : 15 }]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          maxLength={maxLength}
          editable={editable}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12.5,
    color: Colors.mutedStrong,
    marginBottom: 7,
    letterSpacing: 0.1,
    fontWeight: '600',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
    borderRadius: 14,
    gap: 9,
  },
  inputFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primaryRing,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 0,
  },
  prefix: {
    fontFamily: Fonts.displaySemiBold,
    color: Colors.ink,
    fontWeight: '600',
  },
  textInput: {
    flex: 1,
    fontFamily: Fonts.bodyMedium,
    color: Colors.ink,
    fontWeight: '500',
    padding: 0,
  },
});
