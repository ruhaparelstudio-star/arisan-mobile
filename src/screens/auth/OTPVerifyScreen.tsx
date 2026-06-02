import React, { useState, useEffect, useCallback } from 'react';
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
import { OtpBoxes } from '../../components/ui/OtpBoxes';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { authApi } from '../../api/auth';
import { ApiError } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerify'>;

const RESEND_SECONDS = 30;
const EXPIRY_SECONDS = 5 * 60;

function mapVerifyError(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 410) return 'OTP sudah expired. Kirim ulang OTP.';
    if (e.status === 401 || e.status === 400) {
      const match = e.message?.match(/(\d+)\s*percobaan/i);
      if (match) return `OTP salah. Sisa ${match[1]} percobaan sebelum kode di-reset.`;
      return e.message ?? 'OTP salah. Periksa kembali kodenya.';
    }
    if (e.message) return e.message;
  }
  return 'OTP salah atau sudah kedaluwarsa.';
}

function mapResendError(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 429) return 'Terlalu banyak percobaan. Coba lagi dalam 1 jam.';
    if (e.status === 503) return 'Gagal mengirim OTP. Tunggu 30 detik lalu coba lagi.';
    if (e.message) return e.message;
  }
  return 'Gagal kirim ulang kode.';
}

const MAX_FAILS_BEFORE_SUPPORT = 3;
const SUPPORT_WA_NUM = process.env.EXPO_PUBLIC_SUPPORT_WA ?? '6281234567890';
const SUPPORT_WA = `https://wa.me/${SUPPORT_WA_NUM}?text=Halo%2C+saya+butuh+bantuan+verifikasi+akun+Arisan+App.`;

export function OTPVerifyScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_SECONDS);
  const [failCount, setFailCount] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleVerify = useCallback(async (code: string) => {
    if (code.length !== 6 || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyOTP(phone, code);
      // Pass token+user to LoginSuccess; login() is called there
      navigation.navigate('LoginSuccess', {
        name: res.user.name,
        phone: res.user.phone,
        token: res.token,
        user: res.user,
      });
    } catch (e) {
      setError(mapVerifyError(e));
      setOtp('');
      setFailCount((c) => c + 1);
    } finally {
      setLoading(false);
    }
  }, [phone, loading, navigation]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify(otp);
    }
  }, [otp, handleVerify]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authApi.sendOTP(phone);
      setResendCooldown(RESEND_SECONDS);
      setCountdown(EXPIRY_SECONDS);
      setError('');
      setOtp('');
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (e) {
      setError(mapResendError(e));
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View>
            <Pill tone="mint" style={styles.step}>
              Langkah 2 dari 2
            </Pill>
            <Text style={styles.h1}>Masukkan kode dari{'\n'}WhatsApp</Text>
            <Text style={styles.sub}>
              OTP dikirim ke {phone}. Biasanya tiba dalam 30 detik.{' '}
              <Text style={styles.link} onPress={() => navigation.goBack()}>
                Ubah nomor
              </Text>
            </Text>

            {resendSuccess && (
              <View style={styles.successBox}>
                <Icon name="check" size={16} color={Colors.primaryInk} />
                <Text style={styles.successText}>Kode baru dikirim! Biasanya tiba dalam 30 detik.</Text>
              </View>
            )}

            <View style={styles.otpWrap}>
              <OtpBoxes value={otp} onChange={setOtp} error={!!error} testID="otp_input" />
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
                <Text style={styles.resendDisabled}>
                  Kirim ulang dalam {formatTime(resendCooldown)}
                </Text>
              ) : (
                <Text style={styles.resendActive} onPress={handleResend}>
                  Kirim ulang kode
                </Text>
              )}
            </Text>

            {failCount >= MAX_FAILS_BEFORE_SUPPORT ? (
              <View style={styles.supportBox}>
                <Icon name="alert" size={20} color={Colors.danger} />
                <View style={styles.flex}>
                  <Text style={styles.supportText}>
                    Sudah {failCount}× gagal. Butuh bantuan?{' '}
                  </Text>
                  <Text style={styles.supportLink} onPress={() => { const { Linking } = require('react-native'); Linking.openURL(SUPPORT_WA); }}>
                    Hubungi dukungan via WhatsApp →
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.infoBox}>
                <Icon name="info" size={20} color={Colors.muted} />
                <Text style={styles.infoText}>
                  Setelah {MAX_FAILS_BEFORE_SUPPORT}× gagal, kamu bisa hubungi dukungan untuk verifikasi manual.
                </Text>
              </View>
            )}

            {countdown > 0 && (
              <Text style={styles.expiry}>Kode berlaku {formatTime(countdown)}</Text>
            )}
            {countdown === 0 && (
              <Text style={[styles.expiry, styles.expiryDanger]}>
                OTP sudah expired. Kirim ulang OTP.
              </Text>
            )}
          </View>

          <Btn
            full
            size="lg"
            onPress={() => handleVerify(otp)}
            loading={loading}
            disabled={otp.length !== 6 || loading}
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
  link: { fontFamily: Fonts.bodySemiBold, color: Colors.primaryInk, fontWeight: '600' },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryTint,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
  },
  successText: {
    flex: 1,
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.primaryInk,
    lineHeight: 18,
  },
  otpWrap: { marginTop: 30 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  errorText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.danger,
    flex: 1,
    fontWeight: '600',
  },
  resendRow: {
    textAlign: 'center',
    marginTop: 22,
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.muted,
  },
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
  infoText: {
    flex: 1,
    fontFamily: Fonts.bodyRegular,
    fontSize: 12.5,
    color: Colors.muted,
    lineHeight: 18,
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerTint,
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },
  supportText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12.5,
    color: Colors.danger,
    lineHeight: 18,
  },
  supportLink: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12.5,
    color: Colors.danger,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  expiry: {
    textAlign: 'center',
    marginTop: 14,
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.muted,
  },
  expiryDanger: { color: Colors.danger, fontFamily: Fonts.bodySemiBold, fontWeight: '600' },
  cta: { marginTop: 32 },
});
