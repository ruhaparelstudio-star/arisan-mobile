import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { Pill } from './ui/Pill';

interface GrupCardProps {
  name: string;
  initial: string;
  members: number;
  nominal: string;
  periode: string;
  due: number | 'paid';
  role?: string;
  onPress?: () => void;
}

export const GrupCard = React.memo(function GrupCard({
  name,
  initial,
  members,
  nominal,
  periode,
  due,
  role,
  onPress,
}: GrupCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {role && (
              <Pill tone="solid" style={styles.rolePill}>
                {role}
              </Pill>
            )}
          </View>
          <Text style={styles.sub}>
            {members} anggota · {nominal}/periode
          </Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.periode}>{periode}</Text>
        {due === 'paid' ? (
          <Pill tone="mint" dot>
            Lunas
          </Pill>
        ) : (
          <Pill tone={due <= 3 ? 'amber' : 'neutral'} dot>
            Bayar H-{due}
          </Pill>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: Colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 20,
    color: Colors.primaryInk,
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  name: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 16.5,
    color: Colors.ink,
    fontWeight: '600',
  },
  rolePill: {
    fontSize: 10.5,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  sub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.muted,
    marginTop: 2,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  periode: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13.5,
    color: Colors.ink,
    fontWeight: '600',
  },
});
