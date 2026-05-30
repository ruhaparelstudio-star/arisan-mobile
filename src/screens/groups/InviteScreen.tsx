import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Share, Clipboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Btn } from '../../components/ui/Button';
import { Pill } from '../../components/ui/Pill';
import { Avatar } from '../../components/ui/Avatar';
import { ListRow } from '../../components/ui/ListRow';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { Icon } from '../../components/ui/Icon';

type Props = NativeStackScreenProps<AppStackParamList, 'Invite'>;

export function InviteScreen({ navigation, route }: Props) {
  const { groupId, inviteCode, groupName } = route.params;

  const handleCopy = () => {
    Clipboard.setString(inviteCode);
  };

  const handleShare = async () => {
    await Share.share({
      message: `Gabung arisan "${groupName}" pakai kode: ${inviteCode}\n\nDownload Arisan App di Play Store.`,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar title="Invite Anggota" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sub}>
          Bagikan kode ini — anggota gabung dengan memasukkannya di app.
        </Text>

        <Card accent tint pad={22} style={styles.codeCard}>
          <Text style={styles.codeLabel}>KODE INVITE</Text>
          <Text style={styles.code}>{inviteCode}</Text>
          <Text style={styles.codeExpiry}>Berlaku sampai grup penuh atau periode 1 dimulai</Text>
        </Card>

        <View style={styles.actionRow}>
          <Btn variant="outline" size="md" icon="copy" onPress={handleCopy} style={styles.flex}>
            Salin kode
          </Btn>
          <Btn size="md" icon="share" onPress={handleShare} style={styles.flex}>
            Share WhatsApp
          </Btn>
        </View>

        <View style={styles.memberSection}>
          <SectionLabel right={<Pill tone="neutral">1 / 12</Pill>}>
            Sudah bergabung
          </SectionLabel>
          <Card pad={6}>
            <ListRow
              leading={<Avatar name="Kamu" size={40} mint />}
              title="Kamu"
              sub="Ketua"
              lastChild
              right={<Pill tone="solid">Ketua</Pill>}
            />
          </Card>
        </View>

        <View style={styles.flex} />
        <Btn
          full
          size="lg"
          variant="dark"
          onPress={() => navigation.navigate('GroupDetail', { groupId, groupName })}
          style={styles.cta}
        >
          Selesai → Lihat Grup
        </Btn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24 },
  sub: { fontFamily: Fonts.bodyRegular, fontSize: 14.5, color: Colors.muted, lineHeight: 22, marginTop: 4 },
  codeCard: { marginTop: 18, alignItems: 'center' },
  codeLabel: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.muted, letterSpacing: 2, fontWeight: '700' },
  code: { fontFamily: Fonts.displaySemiBold, fontSize: 42, color: Colors.ink, letterSpacing: 6, marginVertical: 10, fontWeight: '600' },
  codeExpiry: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, textAlign: 'center' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  memberSection: { marginTop: 24 },
  cta: { marginTop: 24 },
});
