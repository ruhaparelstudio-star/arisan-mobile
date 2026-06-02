import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { setSlotOrder } from '../../api/groups';

type Props = NativeStackScreenProps<AppStackParamList, 'SetGiliran'>;

type SlotMember = { id: string; name: string; slot_order: number | null };

export function SetGiliranScreen({ navigation, route }: Props) {
  const { groupId, members: initialMembers, isLocked = false } = route.params;
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

  const sortedForLocked = useMemo(() => [...initialMembers].sort((a, b) => {
    if (a.slot_order == null && b.slot_order == null) return 0;
    if (a.slot_order == null) return 1;
    if (b.slot_order == null) return -1;
    return a.slot_order - b.slot_order;
  }), [initialMembers]);

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

  const renderItem = ({ item, getIndex, drag, isActive }: RenderItemParams<SlotMember>) => {
    const index = getIndex() ?? 0;
    return (
      <ScaleDecorator activeScale={1.03}>
        <View style={[styles.row, isActive && styles.rowActive]}>
          <View style={[styles.orderBadge, isActive && styles.orderBadgeActive]}>
            <Text style={styles.orderNum}>{index + 1}</Text>
          </View>
          <Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.dragHandle} onTouchStart={drag}>
            <Icon name="grip" size={20} color={isActive ? Colors.primaryInk : Colors.muted} strokeWidth={2} />
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  // Locked view — arisan sudah berjalan, urutan tidak bisa diubah
  if (isLocked) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Urutan Giliran" onBack={() => navigation.goBack()} />
        <View style={styles.header}>
          <Text style={styles.h2}>Urutan sudah dikunci</Text>
          <Text style={styles.sub}>Arisan sedang berjalan — urutan giliran tidak bisa diubah.</Text>
        </View>
        <View style={styles.listContent}>
          {sortedForLocked.map((item, index) => (
            <View key={item.id}>
              <View style={[styles.row, { opacity: 1 }]}>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderNum}>{item.slot_order ?? index + 1}</Text>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
                <View style={[styles.dragHandle, { opacity: 0.3 }]}>
                  <Icon name="lock" size={18} color={Colors.muted} strokeWidth={2} />
                </View>
              </View>
              {index < sortedForLocked.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Set Giliran" onBack={() => navigation.goBack()} />

      <View style={styles.header}>
        <Text style={styles.h2}>Atur urutan giliran</Text>
        <Text style={styles.sub}>Tekan dan tahan lalu geser untuk mengubah posisi.</Text>
      </View>

      <DraggableFlatList
        data={members}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => setMembers(data)}
        renderItem={renderItem}
        containerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}
        <Btn full size="lg" icon="check" onPress={handleSave} loading={loading} disabled={loading}>
          Simpan Urutan
        </Btn>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 14 },
  h2: { fontFamily: Fonts.displaySemiBold, fontSize: 22, color: Colors.ink, letterSpacing: -0.4, marginBottom: 4, fontWeight: '600' },
  sub: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted, lineHeight: 21 },
  listContainer: { flex: 1 },
  listContent: { paddingHorizontal: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  rowActive: {
    backgroundColor: Colors.primaryTint,
    borderColor: Colors.primary,
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  orderBadgeActive: { backgroundColor: Colors.primary },
  orderNum: { fontFamily: Fonts.displaySemiBold, fontSize: 14, color: Colors.primaryInk, fontWeight: '600' },
  memberName: { flex: 1, fontFamily: Fonts.bodyMedium, fontSize: 14.5, color: Colors.ink, fontWeight: '500' },
  dragHandle: { padding: 6 },
  separator: { height: 8 },
  footer: { paddingHorizontal: 22, paddingBottom: 24, paddingTop: 12, gap: 10 },
  error: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.danger, textAlign: 'center', fontWeight: '600' },
});
