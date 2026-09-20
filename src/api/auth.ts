import api from './client';

import type {
  AuthResponse,
  LoginPayload,
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