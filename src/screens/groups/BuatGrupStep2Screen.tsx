import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Segmented } from '../../components/ui/Segmented';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

type Props = NativeStackScreenProps<AppStackParamList, 'BuatGrupStep2'>;

function WizardProgress({ step }: { step: number }) {
  return (
    <View style={styles.progress}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.progressBar, i < step && styles.progressBarFilled]} />
      ))}
    </View>
  );
}

const NOMINAL_OPTIONS = [100000, 200000, 300000, 500000, 1000000, 2000000];
const FREQ_OPTIONS = ['Mingguan', '2 Minggu', 'Bulanan'];

export function BuatGrupStep2Screen({ navigation, route }: Props) {
  const { name } = route.params;
  const [nominal, setNominal] = useState(500000);
  const [frequency, setFrequency] = useState('Bulanan');
  const [periods, setPeriods] = useState(12);

  const totalPot = nominal * periods;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Buat Grup" sub="Langkah 2 dari 3" onBack={() => navigation.goBack()} />
      <WizardProgress step={2} />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text style={styles.h1}>Berapa & seberapa{'\n'}sering?</Text>

          {/* Nominal */}
          <Text style={styles.sectionLabel}>NOMINAL / PERIODE</Text>
          <View style={styles.nominalDisplay}>
            <Text style={styles.nominalRp}>Rp</Text>
            <Text style={styles.nominalVal}>{nominal.toLocaleString('id')}</Text>
          </View>
          <View style={styles.nominalGrid}>
            {NOMINAL_OPTIONS.map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setNominal(n)}
                style={[styles.nominalChip, nominal === n && styles.nominalChipActive]}
              >
                <Text style={[styles.nominalChipText, nominal === n && styles.nominalChipTextActive]}>
                  {n >= 1000000 ? `${n / 1000000}jt` : `${n / 1000}rb`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Frequency */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>FREKUENSI</Text>
          <Segmented options={FREQ_OPTIONS} value={frequency} onChange={setFrequency} />

          {/* Periods */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>JUMLAH PERIODE</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() => setPeriods((p) => Math.max(2, p - 1))}
              style={styles.stepBtn}
              testID="btn_period_dec"
            >
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.stepVal}>
              <Text style={styles.stepValText}>{periods}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setPeriods((p) => Math.min(60, p + 1))}
              style={[styles.stepBtn, styles.stepBtnPlus]}
              testID="btn_period_inc"
            >
              <Icon name="plus" size={22} color={Colors.white} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
          <Text style={styles.totalPot}>
            Total pot: <Text style={styles.totalPotVal}>Rp {totalPot.toLocaleString('id')}</Text> per pemenang
          </Text>
        </View>

        <Btn
          full size="lg" iconRight="arrowRight"
          onPress={() => navigation.navigate('BuatGrupStep3', { name, nominal, frequency, periods })}
          style={styles.cta}
        >
          Lanjut
        </Btn>
      </ScrollView>
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
  h1: { fontFamily: Fonts.displaySemiBold, fontSize: 26, lineHeight: 29, color: Colors.ink, letterSpacing: -0.5, marginTop: 14, marginBottom: 22, fontWeight: '600' },
  sectionLabel: { fontFamily: Fonts.bodyBold, fontSize: 12.5, color: Colors.mutedStrong, marginBottom: 7, letterSpacing: 0.3, fontWeight: '700' },
  nominalDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: Colors.card, borderRadius: 16, padding: 16, shadowColor: Colors.primaryRing, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4 },
  nominalRp: { fontFamily: Fonts.displaySemiBold, fontSize: 20, color: Colors.muted, fontWeight: '600' },
  nominalVal: { fontFamily: Fonts.displaySemiBold, fontSize: 28, color: Colors.ink, letterSpacing: -0.5, fontWeight: '600' },
  nominalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  nominalChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.borderStrong, backgroundColor: Colors.card },
  nominalChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryTint },
  nominalChipText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.ink, fontWeight: '600' },
  nominalChipTextActive: { color: Colors.primaryInk },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 52, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.borderStrong, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 26, color: Colors.ink, fontFamily: Fonts.displaySemiBold, marginTop: -4 },
  stepBtnPlus: { backgroundColor: Colors.primary, borderWidth: 0 },
  stepVal: { flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  stepValText: { fontFamily: Fonts.displaySemiBold, fontSize: 22, color: Colors.ink, fontWeight: '600' },
  totalPot: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted, marginTop: 10, textAlign: 'center' },
  totalPotVal: { fontFamily: Fonts.bodySemiBold, color: Colors.ink, fontWeight: '600' },
  cta: { marginTop: 24 },
});
