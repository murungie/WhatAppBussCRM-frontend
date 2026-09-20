export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface AuthUser {
  businessId: string;
  email: string;
}