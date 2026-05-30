import { apiCall } from './client';

export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpResponse {
  token: string;
  user: {
    id: string;
    phone: string;
    name: string | null;
  };
}

export const authApi = {
  sendOTP: (phone: string): Promise<SendOtpResponse> =>
    apiCall('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOTP: (phone: string, code: string): Promise<VerifyOtpResponse> =>
    apiCall('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),
};

export const sendOtp = authApi.sendOTP;
export const verifyOtp = (phone: string, code: string) => authApi.verifyOTP(phone, code);

export interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  push_token: string | null;
  created_at: string;
}

export function getMe(token: string): Promise<UserProfile> {
  return apiCall('/api/users/me', { token });
}

export function updateMe(token: string, data: { name?: string }): Promise<UserProfile> {
  return apiCall('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

export function updatePushToken(token: string, pushToken: string): Promise<{ message: string }> {
  return apiCall('/api/users/push-token', {
    method: 'PUT',
    body: JSON.stringify({ push_token: pushToken }),
    token,
  });
}
