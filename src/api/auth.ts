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

// GAP-001: backend tidak mengembalikan push_token
export interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  created_at: string;
}

// GAP-001: unwrap { user: data }
export function getMe(token: string): Promise<UserProfile> {
  return apiCall<{ user: UserProfile }>('/api/users/me', { token }).then((r) => r.user);
}

// GAP-002: backend hanya mengembalikan { message }
export function updateMe(token: string, data: { name?: string }): Promise<{ message: string }> {
  return apiCall('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

// GAP-003: field name expo_push_token bukan push_token
export function updatePushToken(token: string, pushToken: string): Promise<{ message: string }> {
  return apiCall('/api/users/push-token', {
    method: 'PUT',
    body: JSON.stringify({ expo_push_token: pushToken }),
    token,
  });
}
