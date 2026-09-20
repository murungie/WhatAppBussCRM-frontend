import apiClient from './client';

export interface BusinessSettings {
  id: string;
  businessName: string;
  ownerEmail: string;
  whatsappPhoneId: string | null;
  whatsappConfigured: boolean;
  whatsappTokenConfigured: boolean;
  whatsappTokenMasked: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsPayload {
  businessName?: string;
  ownerEmail?: string;
  whatsappPhoneId?: string;
  whatsappToken?: string;
}

export async function getSettings(): Promise<BusinessSettings> {
  const response =
    await apiClient.get<BusinessSettings>('/settings');

  return response.data;
}

export async function updateSettings(
  payload: UpdateSettingsPayload,
): Promise<BusinessSettings> {
  const response =
    await apiClient.patch<BusinessSettings>(
      '/settings',
      payload,
    );

  return response.data;
}
