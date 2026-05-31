import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Pill } from '../../components/ui/Pill';
import { Field } from '../../components/ui/Field';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { authApi } from '../../api/auth';
import { ApiError } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneInput'>;

function mapSendOtpError(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 429) return 'Terlalu banyak percobaan. Coba lagi dalam 1 jam.';
    if (e.status === 503) return 'Gagal mengirim OTP. Tunggu 30 detik lalu coba lagi.';
    if (e.message) return e.message;
  }
  return 'Gagal mengirim kode. Coba lagi.';
}

export function PhoneInputScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatted = phone.replace(/\D/g, '');
  const isValid = formatted.length >= 9 && formatted.length <= 13;

  const handleSend = async () => {
    if (!isValid) {
      setError('Nomor tidak valid. Masukkan 9–13 digit setelah +62.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fullPhone = `+62${formatted}`;
      await authApi.sendOTP(fullPhone);
      navigation.navigate('OTPVerify', { phone: fullPhone });
    } catch (e) {
      setError(mapSendOtpError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Pill tone="mint" style={styles.step}>
              Langkah 1 dari 2
            </Pill>
            <Text style={styles.h1}>Halo! Boleh tahu{'\n'}nomor WhatsApp kamu?</Text>
            <Text style={styles.sub}>
              Kami kirim kode verifikasi 6 digit lewat WhatsApp dalam ±30 detik.
            </Text>

            <Field
              label="NOMOR WHATSAPP"
              prefix="🇮🇩  +62"
              value={phone}
              onChangeText={setPhone}
              placeholder="812 3456 7890"
              keyboardType="number-pad"
              style={styles.field}
              autoFocus
            />

            {error ? (
              <View style={styles.errorRow}>
                <Icon name="alert" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.hint}>
              <Icon name="message" size={20} color={Colors.primaryInk} />
              <Text style={styles.hintText}>
                Pakai nomor yang aktif di WhatsApp ya — kode dikirim ke sana.
              </Text>
            </View>
          </View>

          <View>
            <Btn
              full
              size="lg"
              onPress={handleSend}
              loading={loading}
              disabled={!isValid || loading}
              style={styles.cta}
            >
              Kirim Kode
            </Btn>
            <Text style={styles.terms}>
              Lanjut berarti setuju{' '}
              <Text style={styles.termsLink}>Ketentuan</Text> &{' '}
              <Text style={styles.termsLink}>Privasi</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24, justifyContent: 'space-between' },
  step: { marginBottom: 14 },
  h1: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 27,
    lineHeight: 30,
    color: Colors.ink,
    letterSpacing: -0.6,
    fontWeight: '600',
  },
  sub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14.5,
    color: Colors.muted,
    lineHeight: 22,
    marginTop: 12,
  },
  field: { marginTop: 26 },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  errorText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.danger,
    flex: 1,
    fontWeight: '600',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    backgroundColor: Colors.primaryTint,
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  hintText: {
    flex: 1,
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.primaryInk,
    lineHeight: 19,
  },
  cta: { marginTop: 24 },
  terms: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  termsLink: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.primaryInk,
    fontWeight: '600',
  },
});
