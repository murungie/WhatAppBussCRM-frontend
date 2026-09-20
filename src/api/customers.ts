import api from './client';

export interface Customer {
  id: string;
  name: string | null;
  phoneNumber: string;
  lastOrderAt: string | null;
  lastInboundAt: string | null;
  totalSpent: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    messages: number;
    orders: number;
  };
}

export interface CustomersResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ConversationStatusResponse {
  customer: {
    id: string;
    name: string | null;
    phoneNumber: string;
  };
  conversation: {
    isOpen: boolean;
    lastInboundAt: string | null;
    expiresAt: string | null;
    remainingMs: number;
  };
}

export async function getCustomers(
  page = 1,
  limit = 20,
  search = '',
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) {
    params.set('search', search.trim());
  }

  const response =
    await api.get<CustomersResponse>(
      `/customers?${params.toString()}`,
    );

  return response.data;
}

export async function getCustomer(
  customerId: string,
) {
  const response =
    await api.get<Customer>(
      `/customers/${customerId}`,
    );

  return response.data;
}

export async function getConversationStatus(
  customerId: string,
) {
  const response =
    await api.get<ConversationStatusResponse>(
      `/customers/${customerId}/conversation-status`,
    );

  return response.data;
}