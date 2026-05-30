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

export function sendOtp(phone: string): Promise<SendOtpResponse> {
  return apiCall('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function verifyOtp(phone: string, code: string): Promise<VerifyOtpResponse> {
  return apiCall('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
}

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
