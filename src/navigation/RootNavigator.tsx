import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { Colors } from '../theme/colors';
import { AppStackParamList } from './types';

// Map notification type → navigasi screen yang relevan
function handleNotificationTap(
  data: Record<string, unknown>,
  type: string,
  navRef: NavigationContainerRef<AppStackParamList>
) {
  const groupId = data?.group_id as string | undefined;

  switch (type) {
    case 'payment_confirmed':
    case 'payment_late':
      // Navigate ke GroupDetail — period_number tidak tersedia di payload notifikasi
      // user masuk ke PaymentStatus dari GroupDetail yang sudah punya context period yang benar
      if (groupId)
        navRef.navigate('GroupDetail', { groupId, groupName: '' });
      break;
    case 'undian_done':
      if (groupId)
        navRef.navigate('RiwayatPemenang', { groupId, groupName: '' });
      break;
    case 'swap_request':
      navRef.navigate('SwapInbox', undefined);
      break;
    case 'swap_approved':
      // Ketua mendapat notif ini — arahkan ke approval screen jika ada groupId
      if (groupId) navRef.navigate('SwapApproval', { groupId, groupName: '' });
      else navRef.navigate('SwapInbox', undefined);
      break;
    default:
      if (groupId)
        navRef.navigate('GroupDetail', { groupId, groupName: '' });
      else
        navRef.navigate('Main', { screen: 'Notifikasi' });
  }
}

export function RootNavigator() {
  const { token, isLoading } = useAuth();
  const navRef = useRef<NavigationContainerRef<AppStackParamList>>(null);

  // Deep-link dari tap push notification
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      if (!navRef.current || !token) return;
      const data = (response.notification.request.content.data ?? {}) as Record<string, unknown>;
      const type = (data.type as string) ?? '';
      handleNotificationTap(data, type, navRef.current);
    });
    return () => sub.remove();
  }, [token]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navRef}>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
