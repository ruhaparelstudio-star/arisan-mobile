import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { ListRow } from '../../components/ui/ListRow';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginSuccess'>;

const NEXT_STEPS = [
  { icon: 'wallet', title: 'Lengkapi nomor rekening' },
  { icon: 'calendar', title: 'Tunggu jadwal periode 1' },
  { icon: 'trophy', title: 'Pantau giliranmu di tab Grup' },
];

export function LoginSuccessScreen({ navigation, route }: Props) {
  const { name, phone } = route.params;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Splash' }] }),
      );
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <View style={styles.checkOuter}>
          <View style={styles.checkInner}>
            <Icon name="check" size={34} color={Colors.white} strokeWidth={3} />
          </View>
        </View>

        <Text style={styles.h1}>Selamat datang!</Text>
        <Text style={styles.sub}>
          Halo, <Text style={styles.bold}>{name ?? phone}</Text>!{'\n'}
          Kamu berhasil masuk ke Arisan App.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Langkah selanjutnya</Text>
          {NEXT_STEPS.map((s, i) => (
            <ListRow
              key={i}
              icon={s.icon}
              iconColor={Colors.primaryInk}
              title={s.title}
              lastChild={i === NEXT_STEPS.length - 1}
              right={<Icon name="chevronRight" size={18} color={Colors.muted} />}
            />
          ))}
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { flex: 1, paddingHorizontal: 22, paddingTop: 60, alignItems: 'center', textAlign: 'center' },
  checkOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: Colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  h1: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 26,
    color: Colors.ink,
    letterSpacing: -0.5,
    marginTop: 24,
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  sub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    color: Colors.muted,
    lineHeight: 22,
    maxWidth: 280,
    textAlign: 'center',
  },
  bold: { fontFamily: Fonts.bodySemiBold, color: Colors.ink, fontWeight: '600' },
  card: { marginTop: 26, width: '100%' },
  sectionLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12.5,
    color: Colors.mutedStrong,
    letterSpacing: 0.3,
    marginBottom: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
