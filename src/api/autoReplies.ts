import apiClient from './client';

export interface AutoReply {
  id: string;
  businessId: string;
  keyword: string;
  response: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  customerId?: string | null;
}

export interface CreateAutoReplyPayload {
  keyword: string;
  response: string;
  isActive?: boolean;
}

export interface UpdateAutoReplyPayload {
  keyword?: string;
  response?: string;
  isActive?: boolean;
}

export async function getAutoReplies(): Promise<AutoReply[]> {
  const response = await apiClient.get<AutoReply[]>('/auto-replies');
  return response.data;
}

export async function createAutoReply(
  payload: CreateAutoReplyPayload,
): Promise<AutoReply> {
  const response = await apiClient.post<AutoReply>(
    '/auto-replies',
    payload,
  );

  return response.data;
}

export async function updateAutoReply(
  id: string,
  payload: UpdateAutoReplyPayload,
): Promise<AutoReply> {
  const response = await apiClient.patch<AutoReply>(
    `/auto-replies/${id}`,
    payload,
  );

  return response.data;
}

export async function getAutoReply(
  id: string,
): Promise<AutoReply> {
  const response = await apiClient.get<AutoReply>(
    `/auto-replies/${id}`,
  );

  return response.data;
}

export async function deleteAutoReply(
  id: string,
): Promise<AutoReply> {
  const response = await apiClient.delete<AutoReply>(
    `/auto-replies/${id}`,
  );

  return response.data;
}
