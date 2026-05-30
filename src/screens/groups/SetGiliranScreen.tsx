import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { setSlotOrder } from '../../api/groups';

type Props = NativeStackScreenProps<AppStackParamList, 'SetGiliran'>;

type SlotMember = { id: string; name: string; slot_order: number | null };

export function SetGiliranScreen({ navigation, route }: Props) {
  const { groupId, members: initialMembers } = route.params;
  const { token } = useAuth();
  const [members, setMembers] = useState<SlotMember[]>(
    [...initialMembers].sort((a, b) => {
      if (a.slot_order == null && b.slot_order == null) return 0;
      if (a.slot_order == null) return 1;
      if (b.slot_order == null) return -1;
      return a.slot_order - b.slot_order;
    }),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const moveUp = (index: number) => {
    if (index === 0) return;
    setMembers((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === members.length - 1) return;
    setMembers((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      await setSlotOrder(token, groupId, members.map((m) => m.id));
      navigation.goBack();
    } catch (e: any) {
      setError(e.message ?? 'Gagal menyimpan urutan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar title="Set Giliran" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.h2}>Atur urutan giliran</Text>
        <Text style={styles.sub}>Gunakan panah untuk mengubah posisi anggota.</Text>

        <Card pad={0} style={styles.listCard}>
          {members.map((m, i) => (
            <View key={m.id} style={[styles.row, i < members.length - 1 && styles.rowBorder]}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderNum}>{i + 1}</Text>
              </View>
              <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>
              <View style={styles.arrowBtns}>
                <TouchableOpacity
                  onPress={() => moveUp(i)}
                  disabled={i === 0}
                  style={[styles.arrowBtn, i === 0 && styles.arrowBtnDisabled]}
                >
                  <Icon name="arrowUp" size={18} color={i === 0 ? Colors.borderStrong : Colors.ink} strokeWidth={2.2} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => moveDown(i)}
                  disabled={i === members.length - 1}
                  style={[styles.arrowBtn, i === members.length - 1 && styles.arrowBtnDisabled]}
                >
                  <Icon name="arrowDown" size={18} color={i === members.length - 1 ? Colors.borderStrong : Colors.ink} strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.noteRow}>
          <Icon name="info" size={14} color={Colors.muted} />
          <Text style={styles.note}>
            Drag & drop akan tersedia setelah library dikonfirmasi.
          </Text>
        </View>

        <Btn full size="lg" icon="check" onPress={handleSave} loading={loading} style={styles.cta}>
          Simpan Urutan
        </Btn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 32 },
  h2: { fontFamily: Fonts.displaySemiBold, fontSize: 22, color: Colors.ink, letterSpacing: -0.4, marginTop: 4, marginBottom: 6, fontWeight: '600' },
  sub: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted, lineHeight: 21, marginBottom: 20 },
  listCard: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, paddingHorizontal: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  orderBadge: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.primaryTint, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  orderNum: { fontFamily: Fonts.displaySemiBold, fontSize: 14, color: Colors.primaryInk, fontWeight: '600' },
  memberName: { flex: 1, fontFamily: Fonts.bodyMedium, fontSize: 14.5, color: Colors.ink, fontWeight: '500' },
  arrowBtns: { flexDirection: 'row', gap: 4 },
  arrowBtn: { width: 34, height: 34, borderRadius: 9, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  arrowBtnDisabled: { opacity: 0.35 },
  error: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.danger, marginTop: 14, textAlign: 'center', fontWeight: '600' },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 14, marginBottom: 6 },
  note: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, lineHeight: 18 },
  cta: { marginTop: 16 },
});
