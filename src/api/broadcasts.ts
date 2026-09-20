import api from './client';

export type BroadcastStatus =
  | 'DRAFT'
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type BroadcastType =
  | 'TEXT'
  | 'TEMPLATE';

export interface BroadcastRecipient {
  id: string;
  broadcastId: string;
  customerId: string;
  status:
    | 'PENDING'
    | 'SENT'
    | 'FAILED'
    | 'WINDOW_EXPIRED';
  deliveryStatus:
    | 'PENDING'
    | 'SENT'
    | 'DELIVERED'
    | 'READ'
    | 'FAILED'
    | null;
  waMessageId: string | null;
  error: string | null;
  sentAt: string | null;
}

export interface Broadcast {
  id: string;
  businessId: string;
  type: BroadcastType;
  message: string | null;
  templateName: string | null;
  templateLanguage: string | null;
  templateParameters: unknown;
  segment: string;
  status: BroadcastStatus;
  queueJobId: string | null;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    recipients: number;
  };
  recipients?: BroadcastRecipient[];
}

export interface BroadcastListResponse {
  data: Broadcast[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface BroadcastAnalytics {
  broadcast: {
    id: string;
    status: BroadcastStatus;
    type: BroadcastType;
    message: string | null;
    templateName: string | null;
    segment: string;
    scheduledAt: string | null;
    sentAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  summary: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    pending: number;
    windowExpired: number;
  };
  rates: {
    sentRate: number;
    deliveryRate: number;
    readRate: number;
    failureRate: number;
  };
}

export async function getBroadcasts(
  page = 1,
  limit = 10,
  status?: BroadcastStatus,
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) {
    params.set('status', status);
  }

  const response =
    await api.get<BroadcastListResponse>(
      `/broadcasts?${params.toString()}`,
    );

  return response.data;
}

export async function getBroadcast(
  broadcastId: string,
) {
  const response =
    await api.get<Broadcast>(
      `/broadcasts/${broadcastId}`,
    );

  return response.data;
}

export async function getBroadcastAnalytics(
  broadcastId: string,
) {
  const response =
    await api.get<BroadcastAnalytics>(
      `/broadcasts/${broadcastId}/analytics`,
    );

  return response.data;
}

export async function createBroadcast(
  payload: {
    type: BroadcastType;
    message?: string;
    templateName?: string;
    templateLanguage?: string;
    templateParameters?: string[];
    segment?: string;
    scheduledAt?: string;
  },
) {
  const response =
    await api.post<Broadcast>(
      '/broadcasts',
      payload,
    );

  return response.data;
}

export async function addBroadcastRecipients(
  broadcastId: string,
  customerIds: string[],
) {
  const response =
    await api.post<Broadcast>(
      `/broadcasts/${broadcastId}/recipients`,
      {
        customerIds,
      },
    );

  return response.data;
}

export async function sendBroadcast(
  broadcastId: string,
) {
  const response =
    await api.post(
      `/broadcasts/${broadcastId}/send`,
    );

  return response.data;
}

export async function retryBroadcast(
  broadcastId: string,
) {
  const response =
    await api.post(
      `/broadcasts/${broadcastId}/retry`,
    );

  return response.data;
}

export async function cancelBroadcast(
  broadcastId: string,
) {
  const response =
    await api.patch(
      `/broadcasts/${broadcastId}/cancel`,
    );

  return response.data;
}