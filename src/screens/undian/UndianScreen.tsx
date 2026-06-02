import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
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
import { LoadingView } from '../../components/ui/LoadingView';
import { StateView } from '../../components/ui/StateView';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getGroupDetail, setSlotOrder } from '../../api/groups';
import { undianApi, Winner } from '../../api/undian';
import { sendMessage } from '../../api/chat';

type Props = NativeStackScreenProps<AppStackParamList, 'UndianPre'>;

const ANIM_MIN_MS: Record<string, number> = {
  random: 3000,
  fixed: 2000,
  manual: 1200,
};

interface Candidate {
  id: string;
  name: string;
  slotOrder: number | null;
  hasWon: boolean;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function UndianScreen({ navigation, route }: Props) {
  const { groupId, periodId, periodNumber, isKetua } = route.params;
  const { token } = useAuth();
  const isOnline = useNetworkStatus();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [drawMode, setDrawMode] = useState<'fixed' | 'random' | 'manual'>('random');
  const [ketuaId, setKetuaId] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [running, setRunning] = useState(false);
  const [slotOrderMissing, setSlotOrderMissing] = useState(false);

  // Undian sudah pernah dilakukan untuk periode ini
  const [undianAlreadyDone, setUndianAlreadyDone] = useState(false);
  const [existingWinner, setExistingWinner] = useState<Winner | null>(null);

  // Mode 3 (manual/offline): drag-drop ordering
  const [manualMembers, setManualMembers] = useState<Candidate[]>([]);
  const [manualOrderSaved, setManualOrderSaved] = useState(false);
  const [savingManual, setSavingManual] = useState(false);

  // Anggota: poll setiap 3 detik untuk deteksi ketika ketua selesai mengundi (live view)
  const livePollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [liveWaiting, setLiveWaiting] = useState(false);

  const load = useCallback(async (showLoading = true) => {
    if (!token) return;
    if (showLoading) setLoadingData(true);
    if (showLoading) setLoadError(null);
    try {
      const [group, historyRes] = await Promise.all([
        getGroupDetail(token, groupId),
        undianApi.getHistory(groupId, token),
      ]);

      const wonIds = new Set(historyRes.winners.map((w) => w.user_id));
      const mode = (group.draw_mode ?? 'random') as 'fixed' | 'random' | 'manual';
      setDrawMode(mode);
      setKetuaId(group.created_by ?? '');

      // Cek apakah undian sudah dilakukan untuk periode ini (Mode 1 & 2)
      const periodWinner = historyRes.winners.find((w) => w.period_number === periodNumber);
      setUndianAlreadyDone(!!periodWinner);
      setExistingWinner(periodWinner ?? null);

      if (mode === 'manual') {
        // Mode 3 – Undian Offline: tampilkan SEMUA anggota untuk drag-drop urutan
        const allMembers = group.members.map((m) => ({
          id: m.user_id,
          name: m.user.name ?? m.user.phone,
          slotOrder: m.slot_order,
          hasWon: wonIds.has(m.user_id),
        }));

        // Order sudah disimpan jika SEMUA anggota memiliki slot_order
        const alreadySaved = allMembers.length > 0 && allMembers.every((m) => m.slotOrder !== null);
        setManualOrderSaved(alreadySaved);

        const sorted = [...allMembers].sort((a, b) => {
          if (a.slotOrder == null && b.slotOrder == null) return 0;
          if (a.slotOrder == null) return 1;
          if (b.slotOrder == null) return -1;
          return a.slotOrder - b.slotOrder;
        });
        setManualMembers(sorted);
        setCandidates(sorted);
        setSlotOrderMissing(false);
      } else if (mode === 'fixed') {
        const allMembers = group.members
          .map((m) => ({
            id: m.user_id,
            name: m.user.name ?? m.user.phone,
            slotOrder: m.slot_order,
            hasWon: wonIds.has(m.user_id),
          }))
          .sort((a, b) => {
            if (a.slotOrder == null && b.slotOrder == null) return 0;
            if (a.slotOrder == null) return 1;
            if (b.slotOrder == null) return -1;
            return a.slotOrder - b.slotOrder;
          });

        setCandidates(allMembers);
        setSlotOrderMissing(allMembers.some((m) => m.slotOrder == null));
      } else {
        // Mode 2 (random): hanya yang belum pernah menang
        const cands = group.members
          .filter((m) => !wonIds.has(m.user_id))
          .map((m) => ({
            id: m.user_id,
            name: m.user.name ?? m.user.phone,
            slotOrder: m.slot_order,
            hasWon: false,
          }));
        setCandidates(cands);
        setSlotOrderMissing(false);
      }
    } catch (e: any) {
      if (showLoading) setLoadError(e.message ?? 'Gagal memuat data undian. Coba lagi.');
    } finally {
      if (showLoading) setLoadingData(false);
    }
  }, [groupId, token, periodNumber]);

  useEffect(() => { load(); }, [load]);

  // Anggota: polling live saat halaman ini dibuka sebelum undian selesai
  useEffect(() => {
    if (isKetua || loadingData || undianAlreadyDone) return;
    // Mulai poll setiap 3 detik untuk deteksi undian baru selesai
    setLiveWaiting(true);
    livePollingRef.current = setInterval(() => { load(false); }, 8000);
    return () => {
      if (livePollingRef.current) clearInterval(livePollingRef.current);
      setLiveWaiting(false);
    };
  }, [isKetua, loadingData, undianAlreadyDone, load]);

  // Hentikan polling jika undian sudah selesai
  useEffect(() => {
    if (undianAlreadyDone && livePollingRef.current) {
      clearInterval(livePollingRef.current);
      livePollingRef.current = null;
      setLiveWaiting(false);
    }
  }, [undianAlreadyDone]);

  const fixedWinner = drawMode === 'fixed'
    ? candidates.find((c) => c.slotOrder === periodNumber)
    : null;

  // --- Handle undian (Mode 1 & 2) ---
  const handleStart = async () => {
    if (!isOnline || !token) return;

    if (!periodId) {
      Alert.alert('Undian Gagal', 'Tidak ada periode aktif saat ini. Pastikan grup sudah aktif dan memiliki periode berjalan.');
      return;
    }

    if (drawMode === 'fixed' && !fixedWinner) {
      Alert.alert(
        'Urutan Belum Diatur',
        `Tidak ada anggota dengan slot urutan ${periodNumber}. Pastikan ketua sudah mengatur giliran melalui menu "Set Giliran" sebelum melakukan undian.`,
      );
      return;
    }

    setRunning(true);
    try {
      const [result] = await Promise.all([
        undianApi.start(groupId, drawMode, periodId, undefined, token),
        new Promise<void>((resolve) => setTimeout(resolve, ANIM_MIN_MS[drawMode] ?? 2000)),
      ]);

      // Broadcast ke chat grup — await agar pesan terkirim sebelum navigate
      const winnerDisplay = result.winner.name || `anggota`;
      const broadcastMsg = drawMode === 'fixed'
        ? `🎉 Pemenang periode ${result.periode_ke} adalah *${winnerDisplay}* (urutan tetap).`
        : `🎉 Hasil undian periode ${result.periode_ke}: *${winnerDisplay}* terpilih sebagai pemenang! Selamat! 🏆`;
      try { await sendMessage(token, groupId, broadcastMsg); } catch { /* broadcast gagal — tidak block navigasi */ }

      navigation.replace('UndianResult', {
        groupId,
        periodId,
        winnerName: result.winner.name,
        winnerAmount: 0,
        periodeKe: result.periode_ke,
        ketuaId,
      });
    } catch (e: any) {
      Alert.alert('Undian Gagal', e.message ?? 'Gagal menjalankan undian. Coba lagi.');
    } finally {
      setRunning(false);
    }
  };

  // --- Handle simpan urutan (Mode 3) ---
  const handleSaveManualOrder = async () => {
    if (!isOnline || !token) return;
    setSavingManual(true);
    try {
      await setSlotOrder(token, groupId, manualMembers.map((m) => m.id));
      // Broadcast urutan ke chat — await agar pesan terkirim sebelum load ulang
      const orderText = manualMembers.map((m, i) => `${i + 1}. ${m.name}`).join(', ');
      try { await sendMessage(token, groupId, `📋 Ketua telah mengunci urutan undian: ${orderText}`); } catch { /* broadcast gagal */ }
      await load();
    } catch (e: any) {
      Alert.alert('Gagal Menyimpan', e.message ?? 'Gagal menyimpan urutan. Coba lagi.');
    } finally {
      setSavingManual(false);
    }
  };

  const cycleNames = candidates.map((c) => c.name);

  // --- Loading / running states ---
  if (running) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <LoadingView
          icon="sparkles"
          title={drawMode === 'fixed' ? 'Mengonfirmasi pemenang...' : 'Sedang mengundi...'}
          sub={drawMode === 'fixed'
            ? 'Pemenang ditentukan berdasarkan urutan yang sudah ditetapkan'
            : 'Hasil acak & adil — disiarkan ke semua anggota'}
          cycle={cycleNames}
        />
      </SafeAreaView>
    );
  }

  if (loadingData) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title={`Undian Periode ${periodNumber}`} onBack={() => navigation.goBack()} />
        <LoadingView icon="sparkles" title="Memuat data undian..." />
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title={`Undian Periode ${periodNumber}`} onBack={() => navigation.goBack()} />
        <StateView
          icon="sparkles"
          tone="danger"
          title="Gagal memuat"
          body={loadError}
          primary="Coba Lagi"
          onPrimary={load}
        />
      </SafeAreaView>
    );
  }

  // --- Mode 3: Drag-drop ordering UI (belum disimpan) ---
  if (drawMode === 'manual' && !manualOrderSaved) {
    const renderManualItem = ({ item, getIndex, drag, isActive }: RenderItemParams<Candidate>) => {
      const idx = getIndex() ?? 0;
      return (
        <ScaleDecorator activeScale={1.03}>
          <View style={[styles.manualRow, isActive && styles.manualRowActive]}>
            <View style={[styles.slotBadge, isActive && styles.slotBadgeCurrent]}>
              <Text style={[styles.slotNum, isActive && styles.slotNumCurrent]}>{idx + 1}</Text>
            </View>
            <Avatar name={item.name} size={36} />
            <Text style={styles.fixedName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.dragHandle} onTouchStart={drag}>
              <Icon name="grip" size={20} color={isActive ? Colors.primaryInk : Colors.muted} strokeWidth={2} />
            </View>
          </View>
        </ScaleDecorator>
      );
    };

    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Undian Offline — Atur Urutan" onBack={() => navigation.goBack()} />
        <View style={styles.manualHeader}>
          <Text style={styles.h1}>Tentukan urutan pemenang</Text>
          <Text style={styles.sub}>
            Tekan dan tahan lalu geser untuk mengatur urutan. Posisi 1 = pemenang periode 1, dst. Urutan hanya bisa disimpan satu kali.
          </Text>
        </View>
        <DraggableFlatList
          data={manualMembers}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => setManualMembers(data)}
          renderItem={renderManualItem}
          containerStyle={styles.manualList}
          ItemSeparatorComponent={() => <View style={styles.manualSep} />}
          contentContainerStyle={styles.manualListContent}
        />
        <View style={styles.manualFooter}>
          {!isOnline && (
            <Text style={styles.offlineNote}>Butuh koneksi internet untuk melakukan aksi ini</Text>
          )}
          {isKetua && (
            <Btn
              full size="lg" icon="check"
              onPress={handleSaveManualOrder}
              loading={savingManual}
              disabled={!isOnline || savingManual || manualMembers.length === 0}
            >
              Simpan Urutan Pemenang
            </Btn>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // --- Mode 3: Urutan sudah disimpan ---
  if (drawMode === 'manual' && manualOrderSaved) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Undian Offline" onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.doneBox}>
            <Icon name="checkCircle" size={36} color={Colors.primary} />
            <Text style={styles.doneTitle}>Urutan undian sudah dikunci</Text>
            <Text style={styles.doneSub}>
              Urutan pemenang telah disimpan dan tidak bisa diubah. Setiap periode, pemenang ditentukan sesuai urutan ini.
            </Text>
          </View>
          <Card style={styles.candidatesCard}>
            <SectionLabel>Urutan pemenang · {manualMembers.length} anggota</SectionLabel>
            {manualMembers.map((c) => (
              <View key={c.id} style={[styles.fixedRow, c.hasWon && styles.fixedRowDone]}>
                <View style={[styles.slotBadge, c.hasWon && styles.slotBadgeDone]}>
                  <Text style={styles.slotNum}>{c.slotOrder ?? '—'}</Text>
                </View>
                <Avatar name={c.name} size={36} />
                <Text style={[styles.fixedName, c.hasWon && styles.fixedNameDone]} numberOfLines={1}>
                  {c.name}
                </Text>
                {c.hasWon && <Icon name="checkCircle" size={18} color={Colors.primary} />}
              </View>
            ))}
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Mode 1 & 2: Undian sudah dilakukan untuk periode ini ---
  if (undianAlreadyDone && existingWinner) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title={`Undian Periode ${periodNumber}`} onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.doneBox}>
            <Icon name="trophy" size={36} color={Colors.primary} />
            <Text style={styles.doneTitle}>Undian periode {periodNumber} selesai</Text>
            <Text style={styles.doneSub}>
              Undian untuk periode ini sudah dilakukan pada {formatDate(existingWinner.drawn_at)} dan tidak bisa diulang.
            </Text>
          </View>
          <Card style={styles.candidatesCard}>
            <SectionLabel>Pemenang periode {periodNumber}</SectionLabel>
            <View style={styles.winnerRow}>
              <Avatar name={existingWinner.winner_name} size={44} />
              <View style={styles.winnerInfo}>
                <Text style={styles.winnerName}>{existingWinner.winner_name}</Text>
                <Text style={styles.winnerDate}>Diundi {formatDate(existingWinner.drawn_at)}</Text>
              </View>
              <Pill tone="solid">Pemenang</Pill>
            </View>
          </Card>
          <Btn
            full size="md" variant="outline" icon="trophy"
            onPress={() => navigation.navigate('RiwayatPemenang', { groupId, groupName: 'Grup' })}
            style={styles.cta}
          >
            Lihat Semua Pemenang
          </Btn>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Normal undian UI (Mode 1 & 2, belum diundi) ---
  const randomCandidateCount = candidates.filter((c) => !c.hasWon).length;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title={`Undian Periode ${periodNumber}`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          {isKetua && (
            <Pill tone="mint" dot style={styles.livePill}>
              Live · anggota akan menonton
            </Pill>
          )}
          {!isKetua && liveWaiting && (
            <Pill tone="amber" dot style={styles.livePill}>
              Menunggu ketua memulai undian...
            </Pill>
          )}

          <Text style={styles.h1}>
            {isKetua
              ? drawMode === 'fixed'
                ? `Konfirmasi pemenang periode ${periodNumber}`
                : `Siap mengundi pemenang periode ${periodNumber}?`
              : `Undian Periode ${periodNumber}`}
          </Text>
          <Text style={styles.sub}>
            {drawMode === 'fixed'
              ? 'Pemenang ditentukan dari urutan yang sudah ditetapkan di awal.'
              : isKetua
              ? 'Hanya anggota yang belum pernah menang yang diundi. Hasil diproses server — adil & tidak bisa diubah.'
              : 'Berikut anggota yang belum mendapat giliran menerima arisan.'}
          </Text>

          {drawMode === 'fixed' && slotOrderMissing && isKetua && (
            <View style={styles.warnBox}>
              <Icon name="alert" size={18} color={Colors.danger} />
              <Text style={styles.warnText}>
                Beberapa anggota belum memiliki nomor urutan. Atur giliran via menu "Set Giliran" agar undian bisa berjalan.
              </Text>
            </View>
          )}

          {drawMode === 'fixed' && (
            <Card style={styles.candidatesCard}>
              <SectionLabel>Urutan giliran · {candidates.length} anggota</SectionLabel>
              {candidates.length === 0 ? (
                <View style={styles.emptyRow}>
                  <Icon name="alert" size={20} color={Colors.muted} />
                  <Text style={styles.emptyText}>Belum ada anggota</Text>
                </View>
              ) : (
                candidates.map((c) => {
                  const isCurrent = c.slotOrder === periodNumber;
                  return (
                    <View
                      key={c.id}
                      style={[
                        styles.fixedRow,
                        isCurrent && styles.fixedRowCurrent,
                        c.hasWon && !isCurrent && styles.fixedRowDone,
                      ]}
                    >
                      <View style={[styles.slotBadge, isCurrent && styles.slotBadgeCurrent, c.slotOrder == null && styles.slotBadgeEmpty]}>
                        <Text style={[styles.slotNum, isCurrent && styles.slotNumCurrent]}>
                          {c.slotOrder ?? '—'}
                        </Text>
                      </View>
                      <Avatar name={c.name} size={36} />
                      <Text style={[styles.fixedName, c.hasWon && !isCurrent && styles.fixedNameDone]} numberOfLines={1}>
                        {c.name}
                      </Text>
                      {isCurrent && <Pill tone="solid">Periode ini</Pill>}
                      {c.hasWon && !isCurrent && <Icon name="checkCircle" size={18} color={Colors.primary} />}
                    </View>
                  );
                })
              )}
            </Card>
          )}

          {drawMode === 'random' && (
            <Card style={styles.candidatesCard}>
              <SectionLabel>
                {candidates.length > 0
                  ? `Belum mendapat giliran · ${randomCandidateCount} orang`
                  : 'Semua anggota sudah mendapat giliran'}
              </SectionLabel>
              {candidates.length === 0 ? (
                <View style={styles.emptyRow}>
                  <Icon name="checkCircle" size={20} color={Colors.primary} />
                  <Text style={styles.emptyText}>Semua anggota sudah pernah menang</Text>
                </View>
              ) : (
                <View style={styles.grid}>
                  {candidates.map((c) => (
                    <View key={c.id} style={styles.candidateCard}>
                      <Avatar name={c.name} size={40} />
                      <Text style={styles.candidateName} numberOfLines={1}>{c.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          )}

          {isKetua && (
            <View style={styles.infoBox}>
              <Icon name="shield" size={20} color={Colors.primaryInk} />
              <Text style={styles.infoText}>
                {drawMode === 'fixed'
                  ? `Pemenang periode ${periodNumber} adalah anggota dengan slot urutan ke-${periodNumber}.`
                  : 'Hasil otomatis disiarkan ke chat grup & semua anggota dapat notifikasi.'}
              </Text>
            </View>
          )}
        </View>

        {isKetua && (
          <View>
            <Btn
              full size="lg"
              icon={drawMode === 'fixed' ? 'check' : 'sparkles'}
              onPress={handleStart}
              disabled={
                !isOnline ||
                (drawMode === 'fixed' && !fixedWinner) ||
                (drawMode === 'random' && candidates.length === 0)
              }
              style={styles.cta}
            >
              {drawMode === 'fixed' ? 'Konfirmasi Pemenang' : 'Mulai Undian'}
            </Btn>
            {!isOnline && (
              <Text style={styles.offlineNote}>Butuh koneksi internet untuk melakukan aksi ini</Text>
            )}
            {drawMode === 'fixed' && !fixedWinner && isOnline && (
              <Text style={styles.offlineNote}>
                Tidak ada anggota dengan urutan slot ke-{periodNumber}. Atur giliran terlebih dahulu.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24, justifyContent: 'space-between' },
  livePill: { marginBottom: 14 },
  h1: { fontFamily: Fonts.displaySemiBold, fontSize: 25, lineHeight: 29, color: Colors.ink, letterSpacing: -0.5, fontWeight: '600' },
  sub: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted, lineHeight: 21, marginTop: 10 },
  warnBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.dangerTint, borderRadius: 12, padding: 12, marginTop: 14 },
  warnText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.danger, lineHeight: 18 },
  candidatesCard: { marginTop: 20 },

  // Fixed mode rows
  fixedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10, marginBottom: 2 },
  fixedRowCurrent: { backgroundColor: Colors.primaryTint, paddingHorizontal: 10, marginHorizontal: -6 },
  fixedRowDone: { opacity: 0.45 },
  slotBadge: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  slotBadgeCurrent: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotBadgeEmpty: { borderStyle: 'dashed' },
  slotBadgeDone: { backgroundColor: Colors.primaryTint, borderColor: Colors.primary },
  slotNum: { fontFamily: Fonts.displaySemiBold, fontSize: 14, color: Colors.mutedStrong, fontWeight: '600' },
  slotNumCurrent: { color: Colors.white },
  fixedName: { flex: 1, fontFamily: Fonts.bodySemiBold, fontSize: 14.5, color: Colors.ink, fontWeight: '600' },
  fixedNameDone: { color: Colors.muted },

  // Random mode grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  candidateCard: { width: '30%', aspectRatio: 3 / 4, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', gap: 8 },
  candidateName: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.ink, fontWeight: '600', textAlign: 'center', paddingHorizontal: 4 },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  emptyText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: Colors.primaryTint, borderRadius: 16, padding: 14, marginTop: 14 },
  infoText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.primaryInk, lineHeight: 19 },
  cta: { marginTop: 24 },
  offlineNote: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 8 },

  // Done / already undian state
  doneBox: { alignItems: 'center', paddingVertical: 28, gap: 10 },
  doneTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 20, color: Colors.ink, fontWeight: '600', textAlign: 'center' },
  doneSub: { fontFamily: Fonts.bodyRegular, fontSize: 13.5, color: Colors.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 },
  winnerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  winnerInfo: { flex: 1 },
  winnerName: { fontFamily: Fonts.displaySemiBold, fontSize: 16, color: Colors.ink, fontWeight: '600' },
  winnerDate: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, marginTop: 2 },

  // Manual mode drag-drop
  manualHeader: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 14 },
  manualList: { flex: 1 },
  manualListContent: { paddingHorizontal: 22 },
  manualRow: {
    flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, paddingHorizontal: 14,
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
  },
  manualRowActive: {
    backgroundColor: Colors.primaryTint, borderColor: Colors.primary,
    shadowColor: Colors.primaryShadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.9, shadowRadius: 12, elevation: 8,
  },
  manualSep: { height: 8 },
  manualFooter: { paddingHorizontal: 22, paddingBottom: 24, paddingTop: 12, gap: 8 },
  dragHandle: { padding: 6 },
});
