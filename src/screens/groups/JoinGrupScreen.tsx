import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { OtpBoxes } from '../../components/ui/OtpBoxes';

type Props = NativeStackScreenProps<AppStackParamList, 'JoinGrup'>;

export function JoinGrupScreen({ navigation }: Props) {
  const [code, setCode] = useState('');

  const handleSearch = () => {
    if (code.length < 8) return;
    (navigation as any).navigate('JoinConfirm', { code: code.toUpperCase() });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Gabung Grup" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View>
            <Text style={styles.h2}>Punya kode undangan?</Text>
            <Text style={styles.sub}>Minta kode ke ketua grup, lalu masukkan di sini.</Text>

            <View style={styles.otpWrap}>
              <OtpBoxes value={code} onChange={setCode} alphanumeric length={8} />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            <Btn full size="md" variant="outline" icon="qr">
              Scan QR Code
            </Btn>
          </View>

          <Btn
            full size="lg"
            onPress={handleSearch}
            disabled={code.length < 8}
            style={styles.cta}
          >
            Cari Grup
          </Btn>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24, justifyContent: 'space-between' },
  h2: { fontFamily: Fonts.displaySemiBold, fontSize: 22, color: Colors.ink, letterSpacing: -0.4, marginTop: 4, marginBottom: 6, fontWeight: '600' },
  sub: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted, lineHeight: 21 },
  otpWrap: { marginTop: 24 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted },
  cta: { marginTop: 24 },
});
