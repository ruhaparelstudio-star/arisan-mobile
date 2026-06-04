import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Field } from '../../components/ui/Field';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

type Props = NativeStackScreenProps<AppStackParamList, 'BuatGrupStep1'>;

function WizardProgress({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <View style={styles.progress}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.progressBar, i < step && styles.progressBarFilled]} />
      ))}
    </View>
  );
}

export function BuatGrupStep1Screen({ navigation }: Props) {
  const [name, setName] = useState('');

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Buat Grup" sub="Langkah 1 dari 3" onBack={() => navigation.goBack()} />
      <WizardProgress step={1} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View>
            <Text style={styles.h1}>Mau kasih nama apa{'\n'}grup kamu?</Text>
            <Text style={styles.sub}>Bisa diubah nanti sebelum periode 1 dimulai.</Text>
            <Field
              value={name}
              onChangeText={setName}
              placeholder="contoh: Arisan Geng SMA"
              style={styles.field}
              big
              autoFocus
              testID="input_nama_grup"
            />
            <View style={styles.hint}>
              <Icon name="info" size={18} color={Colors.muted} />
              <Text style={styles.hintText}>Pakai nama yang mudah dikenali semua anggota.</Text>
            </View>
          </View>
          <Btn
            full size="lg" iconRight="arrowRight"
            onPress={() => navigation.navigate('BuatGrupStep2', { name })}
            disabled={!name.trim()}
            style={styles.cta}
          >
            Lanjut
          </Btn>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  progress: { flexDirection: 'row', gap: 6, paddingHorizontal: 22, paddingBottom: 4 },
  progressBar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: Colors.borderStrong },
  progressBarFilled: { backgroundColor: Colors.primary },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24, justifyContent: 'space-between' },
  h1: { fontFamily: Fonts.displaySemiBold, fontSize: 26, lineHeight: 29, color: Colors.ink, letterSpacing: -0.5, marginTop: 14, fontWeight: '600' },
  sub: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted, marginTop: 10 },
  field: { marginTop: 26 },
  hint: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.surface, borderRadius: 14, padding: 13, marginTop: 14 },
  hintText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted, lineHeight: 19 },
  cta: { marginTop: 24 },
});
