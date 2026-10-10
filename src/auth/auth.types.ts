export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  businessName: string;
  email: string;
  password: string;
}

export type OnboardingStatus =
  | 'PROFILE_PENDING'
  | 'WHATSAPP_PENDING'
  | 'COMPLETED';

export interface AuthResponse {
  accessToken: string;
  onboardingStatus: OnboardingStatus;
}

export interface AuthUser {
  businessId: string;
  email: string;
  name?: string;
  businessPhone?: string | null;
  industry?: string | null;
  whatsappPhoneId?: string | null;
  onboardingStatus: OnboardingStatus;
  accountStatus?: 'ACTIVE' | 'SUSPENDED';
}