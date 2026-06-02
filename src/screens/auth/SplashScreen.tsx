import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? '';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { Btn } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Icon } from '../../components/ui/Icon';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

const AVATARS = [
  { x: 0, y: -78, n: 'B' },
  { x: 74, y: -24, n: 'M' },
  { x: 46, y: 66, n: 'S' },
  { x: -46, y: 66, n: 'A' },
  { x: -74, y: -24, n: 'R' },
];

export function SplashScreen({ navigation }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.skip}>
        <TouchableOpacity onPress={() => navigation.navigate('PhoneInput')}>
          <Text style={styles.skipText}>Lewati</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Illustration */}
        <View style={styles.illustration}>
          <View style={styles.outerRing} />
          <View style={styles.innerRing} />
          {AVATARS.map((p, i) => (
            <View
              key={i}
              style={[styles.avatarPos, { transform: [{ translateX: p.x }, { translateY: p.y }] }]}
            >
              <Avatar name={p.n} size={i === 0 ? 56 : 46} ring />
            </View>
          ))}
          <View style={styles.logoBox}>
            <Icon name="trophy" size={34} color={Colors.white} strokeWidth={2} />
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.h1}>Arisan grup,{'\n'}tanpa ribet WA</Text>
          <Text style={styles.sub}>
            Lacak siapa sudah bayar, undian yang adil & transparan, dan semua histori tersimpan
            rapi otomatis.
          </Text>
        </View>

        {/* Dots */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.flex} />

        <Btn
          full
          size="lg"
          iconRight="arrowRight"
          onPress={() => navigation.navigate('PhoneInput')}
          style={styles.cta}
          testID="btn_mulai"
        >
          Mulai
        </Btn>

        <Text style={styles.privacyNote}>
          Dengan melanjutkan, kamu setuju dengan{' '}
          <Text
            style={styles.privacyLink}
            onPress={() => PRIVACY_POLICY_URL && Linking.openURL(PRIVACY_POLICY_URL)}
          >
            Kebijakan Privasi
          </Text>{' '}
          kami.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  skip: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 22 },
  skipText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.muted,
    padding: 8,
    fontWeight: '600',
  },
  body: { flex: 1, paddingHorizontal: 28, paddingBottom: 18 },
  illustration: {
    height: 300,
    borderRadius: 28,
    backgroundColor: Colors.primaryTint,
    overflow: 'hidden',
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    opacity: 0.35,
  },
  innerRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    opacity: 0.5,
  },
  avatarPos: { position: 'absolute' },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  headline: { marginTop: 32 },
  h1: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 32,
    lineHeight: 35,
    color: Colors.ink,
    letterSpacing: -0.8,
    fontWeight: '600',
  },
  sub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15.5,
    color: Colors.muted,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 300,
  },
  dots: { flexDirection: 'row', gap: 7, marginTop: 22 },
  dot: { width: 8, height: 6, borderRadius: 3, backgroundColor: Colors.borderStrong },
  dotActive: { width: 26, backgroundColor: Colors.primary },
  flex: { flex: 1 },
  cta: { marginTop: 24 },
  privacyNote: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  privacyLink: {
    color: Colors.primary,
    fontFamily: Fonts.bodySemiBold,
    fontWeight: '600',
  },
});
