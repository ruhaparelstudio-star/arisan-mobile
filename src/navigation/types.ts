import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  PhoneInput: undefined;
  OTPVerify: { phone: string };
  LoginSuccess: {
    name: string | null;
    phone: string;
    token: string;
    user: { id: string; phone: string; name: string | null };
  };
  JoinGrup: undefined;
  JoinConfirm: { code: string };
};

export type MainTabParamList = {
  Beranda: undefined;
  Grup: undefined;
  Notifikasi: undefined;
  Profil: undefined;
};

export type AppStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  GroupDetail: { groupId: string; groupName: string };
  Chat: { groupId: string; groupName: string; memberCount: number; ketuaId: string };
  BuatGrupStep1: undefined;
  BuatGrupStep2: { name: string };
  BuatGrupStep3: { name: string; nominal: number; frequency: string; periods: number };
  Invite: { groupId: string; inviteCode: string; groupName: string };
  UndianPre: { groupId: string; periodId: string; periodNumber: number; isKetua: boolean };
  UndianResult: { groupId: string; periodId: string; winnerName: string; winnerAmount: number; periodeKe: number };
  RiwayatPemenang: { groupId: string; groupName: string };
  Bayar: { groupId: string; periodId: string; periodNumber: number };
  BayarDone: { confirmedNames: string[]; amount: number };
  JoinGrup: undefined;
  JoinConfirm: { code: string };
  RequestSwap: { groupId: string; myPeriod: number };
  SwapStatus: { requestId: string };
  SwapInbox: undefined;
  SwapApproval: { groupId: string; groupName: string };
  ActivityLog: { groupId: string; groupName: string };
  PaymentHistory: { groupId: string; groupName: string };
  SetGiliran: { groupId: string; members: Array<{ id: string; name: string; slot_order: number | null }> };
};
