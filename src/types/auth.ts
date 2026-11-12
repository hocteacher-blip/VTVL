import { SchoolLevel } from './scheme';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  schoolName: string;
  schoolLevel: SchoolLevel;
  role: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  schoolName: string;
  schoolLevel: SchoolLevel;
  role: string;
  phoneNumber?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface AuthApiResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  testOtp?: string;
  needsVerification?: boolean;
  email?: string;
  sentTo?: string;
}
