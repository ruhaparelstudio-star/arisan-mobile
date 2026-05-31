import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { createGroup } from '../../api/groups';

type Props = NativeStackScreenProps<AppStackParamList, 'BuatGrupStep3'>;

function WizardProgress({ step }: { step: number }) {
  return (
    <View style={styles.progress}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.progressBar, i < step && styles.progressBarFilled]} />
      ))}
    </View>
  );
}

// GAP-007: backend menggunakan 'manual' bukan 'offline'
const DRAW_MODES = [
  { id: 'fixed', icon: 'users', title: 'Urutan tetap', sub: 'Aku atur urutan giliran dari awal' },
  { id: 'random', icon: 'sparkles', title: 'Undian per periode', sub: 'Server acak tiap periode — transparan & adil' },
  { id: 'manual', icon: 'edit', title: 'Undian offline', sub: 'Aku input manual setelah undian fisik' },
];

const FREQ_MAP: Record<string, string> = { 'Mingguan': 'weekly', '2 Minggu': 'biweekly', 'Bulanan': 'monthly' };

export function BuatGrupStep3Screen({ navigation, route }: Props) {
  const { name, nominal, frequency, periods } = route.params;
  const { token } = useAuth();
  const [drawMode, setDrawMode] = useState('random');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const group = await createGroup(token, {
        name, nominal, frequency: FREQ_MAP[frequency] ?? 'monthly', total_periods: periods, draw_mode: drawMode,
      });
      navigation.navigate('Invite', { groupId: group.id, inviteCode: group.invite_code, groupName: group.name });
    } catch (e: any) {
      if (e.status === 403 || e.message?.includes('3')) {
        setError('Kamu sudah punya 3 grup aktif. Selesaikan atau bubarkan salah satu dulu.');
      } else {
        setError(e.message ?? 'Gagal membuat grup. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Buat Grup" sub="Langkah 3 dari 3" onBack={() => navigation.goBack()} />
      <WizardProgress step={3} />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text style={styles.h1}>Bagaimana giliran{'\n'}ditentukan?</Text>
          <View style={styles.modeList}>
            {DRAW_MODES.map((m) => {
              const on = drawMode === m.id;
              return (
                <Card key={m.id} accent={on} tint={on} pad={15} onPress={() => setDrawMode(m.id)} style={styles.modeCard}>
                  <View style={styles.modeRow}>
                    <View style={[styles.modeIcon, { backgroundColor: on ? Colors.primary : Colors.surface }]}>
                      <Icon name={m.icon} size={21} color={on ? Colors.white : Colors.ink} strokeWidth={1.9} />
                    </View>
                    <View style={styles.modeInfo}>
                      <Text style={styles.modeTitle}>{m.title}</Text>
                      <Text style={styles.modeSub}>{m.sub}</Text>
                    </View>
                    <View style={[styles.radio, on && styles.radioActive]}>
                      {on && <View style={styles.radioDot} />}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <Btn full size="lg" icon="check" onPress={handleCreate} loading={loading} style={styles.cta}>
          Buat & Invite Anggota
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
  h1: { fontFamily: Fonts.displaySemiBold, fontSize: 26, lineHeight: 29, color: Colors.ink, letterSpacing: -0.5, marginTop: 14, marginBottom: 20, fontWeight: '600' },
  modeList: { gap: 12 },
  modeCard: {},
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  modeIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  modeInfo: { flex: 1 },
  modeTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 15.5, color: Colors.ink, fontWeight: '600' },
  modeSub: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted, marginTop: 2, lineHeight: 18 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.borderStrong, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white },
  error: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.danger, marginTop: 12, fontWeight: '600' },
  cta: { marginTop: 24 },
});
