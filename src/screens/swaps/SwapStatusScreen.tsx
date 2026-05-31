import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Avatar } from '../../components/ui/Avatar';
import { SectionLabel } from '../../components/ui/SectionLabel';

type Props = NativeStackScreenProps<AppStackParamList, 'SwapStatus'>;

const STEPS = [
  { label: 'Request dibuat', sub: 'Kamu · 14 Jun 14:32', done: true },
  { label: 'Target menyetujui', sub: '✓ disetujui · 14 Jun 16:10', done: true },
  { label: 'Ketua approve final', sub: 'Menunggu approval', current: true },
  { label: 'Urutan ter-update', sub: 'Otomatis setelah approve' },
];

export function SwapStatusScreen({ navigation, route }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Status Tukar" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Card tint accent pad={18}>
            <View style={styles.swapRow}>
              <View style={styles.swapParty}>
                <Avatar name="Rina" size={50} mint />
                <Text style={styles.partyName}>Rina (kamu)</Text>
                <Pill tone="neutral" style={styles.partyPill}>P8 → P9</Pill>
              </View>
              <Icon name="swap" size={28} color={Colors.primaryInk} />
              <View style={styles.swapParty}>
                <Avatar name="Doni" size={50} />
                <Text style={styles.partyName}>Doni</Text>
                <Pill tone="neutral" style={styles.partyPill}>P9 → P8</Pill>
              </View>
            </View>
          </Card>

          <View style={styles.stepsSection}>
            <SectionLabel>Progress 3 langkah</SectionLabel>
            <View style={styles.steps}>
              <View style={styles.stepsLine} />
              {STEPS.map((st, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepCircle, st.done && styles.stepDone, st.current && styles.stepCurrent]}>
                    {st.done ? (
                      <Icon name="check" size={14} color={Colors.white} strokeWidth={3} />
                    ) : st.current ? (
                      <Icon name="clock" size={14} color={Colors.amberInk} />
                    ) : (
                      <Text style={styles.stepNum}>{i + 1}</Text>
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, (st.done || st.current) && styles.stepLabelActive, st.current && styles.stepLabelCurrent]}>
                      {st.label}
                    </Text>
                    <Text style={styles.stepSub}>{st.sub}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.btnRow}>
          <Btn variant="outline" size="lg" onPress={() => navigation.goBack()} style={styles.flex}>
            Batalkan
          </Btn>
          <Btn size="lg" icon="check" onPress={() => navigation.goBack()} style={[styles.flex, styles.flex2]}>
            Approve sebagai ketua
          </Btn>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  flex2: { flex: 2 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24, justifyContent: 'space-between' },
  swapRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  swapParty: { alignItems: 'center', gap: 6 },
  partyName: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.ink, fontWeight: '600' },
  partyPill: { marginTop: 4 },
  stepsSection: { marginTop: 22 },
  steps: { position: 'relative', paddingLeft: 4, gap: 16 },
  stepsLine: { position: 'absolute', left: 16, top: 16, bottom: 16, width: 2, backgroundColor: Colors.border },
  stepRow: { flexDirection: 'row', gap: 14, position: 'relative' },
  stepCircle: { width: 26, height: 26, borderRadius: 13, flexShrink: 0, alignItems: 'center', justifyContent: 'center', zIndex: 1, borderWidth: 1.5, borderColor: Colors.borderStrong, backgroundColor: Colors.card },
  stepDone: { backgroundColor: Colors.primary, borderWidth: 0 },
  stepCurrent: { backgroundColor: Colors.amberTint, borderColor: Colors.amber },
  stepNum: { fontFamily: Fonts.displaySemiBold, fontSize: 12, color: Colors.muted, fontWeight: '600' },
  stepContent: { flex: 1, paddingTop: 2 },
  stepLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 14.5, color: Colors.muted, fontWeight: '600' },
  stepLabelActive: { color: Colors.ink },
  stepLabelCurrent: { fontFamily: Fonts.bodyBold, fontWeight: '700' },
  stepSub: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted, marginTop: 1 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 22 },
});
