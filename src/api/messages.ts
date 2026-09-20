import api from './client';

export interface InboxMessagePreview {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  waMessageId: string | null;
  status:
    | 'PENDING'
    | 'SENT'
    | 'DELIVERED'
    | 'READ'
    | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface InboxCustomer {
  id: string;
  businessId: string;
  phoneNumber: string;
  name: string | null;
  lastOrderAt: string | null;
  lastInboundAt: string | null;
  totalSpent: string;
  createdAt: string;
  updatedAt: string;
  messages: InboxMessagePreview[];
}

export interface ConversationResponse {
  customer: {
    id: string;
    name: string | null;
    phoneNumber: string;
    lastInboundAt: string | null;
    createdAt: string;
    updatedAt: string;
  };

  conversation: {
    isOpen: boolean;
    lastInboundAt: string | null;
    expiresAt: string | null;
    remainingMs: number;
    canSendFreeForm: boolean;
    requiresTemplate: boolean;
  };

  messages: InboxMessagePreview[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getInbox() {
  const response =
    await api.get<InboxCustomer[]>(
      '/messages/inbox',
    );

  return response.data;
}

export async function getConversation(
  customerId: string,
  page = 1,
  limit = 50,
) {
  const response =
    await api.get<ConversationResponse>(
      `/messages/customer/${customerId}?page=${page}&limit=${limit}`,
    );

  return response.data;
}

export async function sendMessage(
  customerId: string,
  content: string,
) {
  const response =
    await api.post<InboxMessagePreview>(
      '/messages/send',
      {
        customerId,
        content,
      },
    );

  return response.data;
}