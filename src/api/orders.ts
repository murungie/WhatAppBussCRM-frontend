import apiClient from './client';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface OrderCustomer {
  id: string;
  name: string | null;
  phoneNumber: string;
  totalSpent: string;
  lastOrderAt: string | null;
}

export interface OrderPayment {
  id: string;
  orderId: string;
  method: string;
  reference: string | null;
  paidAt: string;
}

export interface Order {
  id: string;
  businessId: string;
  customerId: string;
  description: string;
  amount: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  customer: OrderCustomer;
  payment: OrderPayment | null;
}

export interface CreateOrderPayload {
  customerId: string;
  description: string;
  amount: number;
}

export interface MarkPaidPayload {
  method?: string;
  reference?: string;
}

export async function getOrders(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>('/orders');
  return response.data;
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<Order> {
  const response = await apiClient.post<Order>(
    '/orders',
    payload,
  );

  return response.data;
}

export async function markOrderPaid(
  id: string,
  payload: MarkPaidPayload,
): Promise<Order> {
  const response = await apiClient.patch<Order>(
    `/orders/${id}/mark-paid`,
    payload,
  );

  return response.data;
}

export async function cancelOrder(
  id: string,
): Promise<Order> {
  const response = await apiClient.patch<Order>(
    `/orders/${id}/cancel`,
  );

  return response.data;
}
