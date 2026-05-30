import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { PhoneInputScreen } from '../screens/auth/PhoneInputScreen';
import { OTPVerifyScreen } from '../screens/auth/OTPVerifyScreen';
import { LoginSuccessScreen } from '../screens/auth/LoginSuccessScreen';
import { JoinGrupScreen } from '../screens/groups/JoinGrupScreen';
import { JoinConfirmScreen } from '../screens/groups/JoinConfirmScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="PhoneInput" component={PhoneInputScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
      <Stack.Screen name="LoginSuccess" component={LoginSuccessScreen} />
      <Stack.Screen name="JoinGrup" component={JoinGrupScreen} />
      <Stack.Screen name="JoinConfirm" component={JoinConfirmScreen} />
    </Stack.Navigator>
  );
}
