import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { Avatar } from './ui/Avatar';
import { Icon } from './ui/Icon';

type Status = 'lunas' | 'belum' | 'terlambat';

interface AnggotaItemProps {
  name: string;
  status: Status;
  isMe?: boolean;
}

const statusDotColor: Record<Status, string> = {
  lunas: Colors.primary,
  belum: Colors.borderStrong,
  terlambat: Colors.danger,
};

export const AnggotaItem = React.memo(function AnggotaItem({ name, status, isMe }: AnggotaItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <Avatar name={name} size={44} mint={isMe} />
        <View style={[styles.dot, { backgroundColor: statusDotColor[status] }]}>
          {status === 'lunas' && (
            <Icon name="check" size={9} color={Colors.white} strokeWidth={3.5} />
          )}
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
        {isMe ? ' (kamu)' : ''}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 52,
  },
  avatarWrap: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 11,
    color: Colors.mutedStrong,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
});
