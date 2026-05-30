import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Pill } from '../../components/ui/Pill';
import { OtpBoxes } from '../../components/ui/OtpBoxes';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { verifyOtp, sendOtp } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerify'>;

const RESEND_SECONDS = 30;
const EXPIRY_SECONDS = 5 * 60;

export function OTPVerifyScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const { login } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp);
      await login(res.token, res.user);
      navigation.navigate('LoginSuccess', { name: res.user.name, phone: res.user.phone });
    } catch (e: any) {
      setError(e.message ?? 'Kode salah atau sudah kedaluwarsa.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await sendOtp(phone);
      setResendCooldown(RESEND_SECONDS);
      setError('');
      setOtp('');
    } catch (e: any) {
      setError(e.message ?? 'Gagal kirim ulang kode.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Pill tone="mint" style={styles.step}>
            Langkah 2 dari 2
          </Pill>
          <Text style={styles.h1}>Masukkan kode dari{'\n'}WhatsApp</Text>
          <Text style={styles.sub}>
            Dikirim ke {phone} ·{' '}
            <Text style={styles.link} onPress={() => navigation.goBack()}>
              ubah
            </Text>
          </Text>

          <View style={styles.otpWrap}>
            <OtpBoxes value={otp} onChange={setOtp} error={!!error} />
          </View>

          {error ? (
            <View style={styles.errorRow}>
              <Icon name="alert" size={17} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.resendRow}>
            Belum diterima?{' '}
            {resendCooldown > 0 ? (
              <Text style={styles.resendDisabled}>Kirim ulang dalam {formatTime(resendCooldown)}</Text>
            ) : (
              <Text style={styles.resendActive} onPress={handleResend}>
                Kirim ulang kode
              </Text>
            )}
          </Text>

          <View style={styles.infoBox}>
            <Icon name="info" size={20} color={Colors.muted} />
            <Text style={styles.infoText}>
              Setelah 3× gagal, kamu bisa hubungi dukungan untuk verifikasi manual.
            </Text>
          </View>

          {countdown > 0 && (
            <Text style={styles.expiry}>Kode berlaku {formatTime(countdown)}</Text>
          )}

          <View style={styles.flex} />
          <Btn
            full
            size="lg"
            onPress={handleVerify}
            loading={loading}
            disabled={otp.length !== 6}
            style={styles.cta}
          >
            Verifikasi
          </Btn>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24 },
  step: { marginBottom: 14 },
  h1: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 27,
    lineHeight: 30,
    color: Colors.ink,
    letterSpacing: -0.6,
    fontWeight: '600',
  },
  sub: { fontFamily: Fonts.bodyRegular, fontSize: 14.5, color: Colors.muted, lineHeight: 22, marginTop: 12 },
  link: { fontFamily: Fonts.bodySemiBold, color: Colors.primaryInk, fontWeight: '600' },
  otpWrap: { marginTop: 30 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  errorText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.danger, flex: 1, fontWeight: '600' },
  resendRow: { textAlign: 'center', marginTop: 22, fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted },
  resendDisabled: { fontFamily: Fonts.bodySemiBold, color: Colors.mutedStrong, fontWeight: '600' },
  resendActive: { fontFamily: Fonts.bodySemiBold, color: Colors.primaryInk, fontWeight: '600' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },
  infoText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted, lineHeight: 18 },
  expiry: { textAlign: 'center', marginTop: 14, fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted },
  cta: { marginTop: 24 },
});
