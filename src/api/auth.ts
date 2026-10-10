import api from './client';

import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../auth/auth.types';

export async function login(
  payload: LoginPayload,
) {
  const response =
    await api.post<AuthResponse>(
      '/auth/login',
      payload,
    );

  return response.data;
}

export async function register(
  payload: RegisterPayload,
) {
  const response =
    await api.post<AuthResponse>(
      '/auth/register',
      payload,
    );

  return response.data;
}

export async function getMe() {
  const response =
    await api.get<AuthUser>(
      '/auth/me',
    );

  return response.data;
}

export async function completeProfile(
  payload: {
    businessName?: string;
    businessPhone: string;
    industry?: string;
  },
) {
  const response =
    await api.post(
      '/auth/onboarding/profile',
      payload,
    );

  return response.data;
}