import { RegisterPayload, LoginPayload, VerifyOtpPayload, AuthApiResponse } from '../types/auth';

export async function apiRegister(payload: RegisterPayload): Promise<AuthApiResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiVerifyOtp(payload: VerifyOtpPayload): Promise<AuthApiResponse> {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiLogin(payload: LoginPayload): Promise<AuthApiResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiResendOtp(email: string): Promise<AuthApiResponse> {
  const res = await fetch('/api/auth/resend-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function apiGetMe(email: string): Promise<AuthApiResponse> {
  const res = await fetch(`/api/auth/me?email=${encodeURIComponent(email)}`);
  return res.json();
}
