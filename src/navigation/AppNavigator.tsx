import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStackParamList, MainTabParamList } from './types';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { Icon } from '../components/ui/Icon';

import { HomeScreen } from '../screens/home/HomeScreen';
import { GroupsScreen } from '../screens/groups/GroupsScreen';
import { NotificationsScreen } from '../screens/home/NotificationsScreen';
import { ProfileScreen } from '../screens/home/ProfileScreen';
import { DetailGrupScreen } from '../screens/groups/DetailGrupScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { BuatGrupStep1Screen } from '../screens/groups/BuatGrupStep1Screen';
import { BuatGrupStep2Screen } from '../screens/groups/BuatGrupStep2Screen';
import { BuatGrupStep3Screen } from '../screens/groups/BuatGrupStep3Screen';
import { InviteScreen } from '../screens/groups/InviteScreen';
import { JoinGrupScreen } from '../screens/groups/JoinGrupScreen';
import { JoinConfirmScreen } from '../screens/groups/JoinConfirmScreen';
import { UndianScreen } from '../screens/undian/UndianScreen';
import { UndianResultScreen } from '../screens/undian/UndianResultScreen';
import { RiwayatPemenangScreen } from '../screens/undian/RiwayatPemenangScreen';
import { PaymentStatusScreen } from '../screens/payments/PaymentStatusScreen';
import { PaymentHistoryScreen } from '../screens/payments/PaymentHistoryScreen';
import { RequestSwapScreen } from '../screens/swaps/RequestSwapScreen';
import { SwapStatusScreen } from '../screens/swaps/SwapStatusScreen';
import { SwapInboxScreen } from '../screens/swaps/SwapInboxScreen';
import { SwapApprovalScreen } from '../screens/swaps/SwapApprovalScreen';
import { SwapByKetuaScreen } from '../screens/swaps/SwapByKetuaScreen';
import { ActivityLogScreen } from '../screens/chat/ActivityLogScreen';
import { SetGiliranScreen } from '../screens/groups/SetGiliranScreen';
import { BukuArisanScreen } from '../screens/groups/BukuArisanScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

const TABS = [
  { key: 'Beranda', icon: 'home', label: 'Beranda' },
  { key: 'Grup', icon: 'users', label: 'Grup' },
  { key: 'Notifikasi', icon: 'bell', label: 'Notifikasi' },
  { key: 'Profil', icon: 'user', label: 'Profil' },
] as const;

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <View style={[tabStyles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {TABS.map((t, i) => {
            const active = state.index === i;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => navigation.navigate(t.key)}
                style={tabStyles.tab}
                activeOpacity={0.7}
              >
                <Icon
                  name={t.icon}
                  size={24}
                  color={active ? Colors.primary : Colors.muted}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <Text style={[tabStyles.label, active && tabStyles.labelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Grup" component={GroupsScreen} />
      <Tab.Screen name="Notifikasi" component={NotificationsScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="GroupDetail" component={DetailGrupScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="BuatGrupStep1" component={BuatGrupStep1Screen} />
      <Stack.Screen name="BuatGrupStep2" component={BuatGrupStep2Screen} />
      <Stack.Screen name="BuatGrupStep3" component={BuatGrupStep3Screen} />
      <Stack.Screen name="Invite" component={InviteScreen} />
      <Stack.Screen name="JoinGrup" component={JoinGrupScreen} />
      <Stack.Screen name="JoinConfirm" component={JoinConfirmScreen} />
      <Stack.Screen name="UndianPre" component={UndianScreen} />
      <Stack.Screen name="UndianResult" component={UndianResultScreen} />
      <Stack.Screen name="RiwayatPemenang" component={RiwayatPemenangScreen} />
      <Stack.Screen name="Bayar" component={PaymentStatusScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="RequestSwap" component={RequestSwapScreen} />
      <Stack.Screen name="SwapStatus" component={SwapStatusScreen} />
      <Stack.Screen name="SwapInbox" component={SwapInboxScreen} />
      <Stack.Screen name="SwapApproval" component={SwapApprovalScreen} />
      <Stack.Screen name="ActivityLog" component={ActivityLogScreen} />
      <Stack.Screen name="SetGiliran" component={SetGiliranScreen} />
      <Stack.Screen name="SwapByKetua" component={SwapByKetuaScreen} />
      <Stack.Screen name="BukuArisan" component={BukuArisanScreen} />
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
    paddingTop: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 10.5,
    color: Colors.muted,
    fontWeight: '500',
  },
  labelActive: {
    fontFamily: Fonts.bodyBold,
    color: Colors.primary,
    fontWeight: '700',
  },
});
