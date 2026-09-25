import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Plus,
  RefreshCw,
  XCircle,
  X,
} from 'lucide-react';

import {
  cancelOrder,
  createOrder,
  getOrders,
  markOrderPaid,
} from '../../api/orders';

import type { Order } from '../../api/orders';

import { getCustomers } from '../../api/customers';

import type { Customer } from '../../api/customers';

function formatMoney(value: string | number) {
  return `KES ${Number(value).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function statusClasses(status: Order['status']) {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-100 text-emerald-700';

    case 'CANCELLED':
      return 'bg-red-100 text-red-700';

    default:
      return 'bg-amber-100 text-amber-700';
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [customerId, setCustomerId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const [paymentMethod, setPaymentMethod] =
    useState('mpesa');

  const [paymentReference, setPaymentReference] =
    useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [ordersData, customersData] =
        await Promise.all([
          getOrders(),
          getCustomers(1, 100),
        ]);

      setOrders(ordersData);
      setCustomers(customersData.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to load orders.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function closeCreateModal() {
    if (saving) return;

    setShowCreateModal(false);
    setCustomerId('');
    setDescription('');
    setAmount('');
    setError('');
  }

  function openCreateModal() {
    setCustomerId('');
    setDescription('');
    setAmount('');
    setError('');
    setShowCreateModal(true);
  }

  async function handleCreateOrder(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!customerId) {
      setError('Please select a customer.');
      return;
    }

    if (!description.trim()) {
      setError('Order description is required.');
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid positive amount.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const created = await createOrder({
        customerId,
        description: description.trim(),
        amount: numericAmount,
      });

      setOrders((current) => [
        created,
        ...current,
      ]);

      setSuccess('Order created successfully.');
      closeCreateModal();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to create order.',
      );
    } finally {
      setSaving(false);
    }
  }

  function openPaymentModal(order: Order) {
    setSelectedOrder(order);
    setPaymentMethod(
      order.payment?.method || 'mpesa',
    );
    setPaymentReference('');
    setError('');
    setShowPaymentModal(true);
  }

  function closePaymentModal() {
    if (saving) return;

    setShowPaymentModal(false);
    setSelectedOrder(null);
    setPaymentReference('');
    setError('');
  }

  async function handleMarkPaid(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!selectedOrder) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updated = await markOrderPaid(
        selectedOrder.id,
        {
          method: paymentMethod.trim() || 'mpesa',
          reference:
            paymentReference.trim() || undefined,
        },
      );

      setOrders((current) =>
        current.map((order) =>
          order.id === updated.id
            ? updated
            : order,
        ),
      );

      setSuccess('Order marked as paid.');
      closePaymentModal();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to mark order as paid.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(order: Order) {
    const confirmed = window.confirm(
      `Cancel the order "${order.description}"?`,
    );

    if (!confirmed) return;

    try {
      setProcessingId(order.id);
      setError('');
      setSuccess('');

      const updated = await cancelOrder(order.id);

      setOrders((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item,
        ),
      );

      setSuccess('Order cancelled successfully.');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to cancel order.',
      );
    } finally {
      setProcessingId(null);
    }
  }

  const pendingCount = orders.filter(
    (order) => order.status === 'PENDING',
  ).length;

  const paidCount = orders.filter(
    (order) => order.status === 'PAID',
  ).length;

  const cancelledCount = orders.filter(
    (order) => order.status === 'CANCELLED',
  ).length;

  const paidValue = orders
    .filter((order) => order.status === 'PAID')
    .reduce(
      (total, order) =>
        total + Number(order.amount),
      0,
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2.5 text-white">
              <ClipboardList size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Orders
              </h1>

              <p className="text-sm text-slate-500">
                Manage customer orders and payments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading ? 'animate-spin' : ''
              }
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={16} />
            New Order
          </button>
        </div>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {error &&
        !showCreateModal &&
        !showPaymentModal && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {orders.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-600">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Paid
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {paidCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Paid Value
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatMoney(paidValue)}
          </p>

          {cancelledCount > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              {cancelledCount} cancelled
            </p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Customer Orders
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-6 py-16 text-sm text-slate-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <ClipboardList
                size={28}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No orders yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create the first customer order to
              get started.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={16} />
              Create Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">
                    Customer
                  </th>

                  <th className="px-6 py-4">
                    Order
                  </th>

                  <th className="px-6 py-4">
                    Amount
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Payment
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {order.customer?.name ||
                            'Unnamed customer'}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {order.customer?.phoneNumber}
                        </p>
                      </div>
                    </td>

                    <td className="max-w-xs px-6 py-4">
                      <p className="truncate text-sm text-slate-700">
                        {order.description}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {formatMoney(order.amount)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {order.payment ? (
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {order.payment.method}
                          </p>

                          {order.payment.reference && (
                            <p className="mt-1 text-xs text-slate-500">
                              {
                                order.payment
                                  .reference
                              }
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not paid
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      {order.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openPaymentModal(order)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                          >
                            <CheckCircle2
                              size={15}
                            />
                            Mark Paid
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleCancel(order)
                            }
                            disabled={
                              processingId ===
                              order.id
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle size={15} />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  New Order
                </h2>

                <p className="text-sm text-slate-500">
                  Create an order for a customer.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="space-y-5 px-6 py-6">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Customer
                  </label>

                  <select
                    value={customerId}
                    onChange={(event) =>
                      setCustomerId(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">
                      Select customer
                    </option>

                    {customers.map(
                      (customer) => (
                        <option
                          key={customer.id}
                          value={customer.id}
                        >
                          {customer.name ||
                            'Unnamed customer'}{' '}
                          � {customer.phoneNumber}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Order Description
                  </label>

                  <input
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. 2x T-shirts"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Amount (KES)
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(
                        event.target.value,
                      )
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving
                    ? 'Creating...'
                    : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal &&
        selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Mark Order as Paid
                  </h2>

                  <p className="text-sm text-slate-500">
                    {selectedOrder.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePaymentModal}
                  disabled={saving}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleMarkPaid}>
                <div className="space-y-5 px-6 py-6">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Amount
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {formatMoney(
                        selectedOrder.amount,
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Payment Method
                    </label>

                    <select
                      value={paymentMethod}
                      onChange={(event) =>
                        setPaymentMethod(
                          event.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="mpesa">
                        M-Pesa
                      </option>

                      <option value="cash">
                        Cash
                      </option>

                      <option value="card">
                        Card
                      </option>

                      <option value="bank">
                        Bank
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Reference
                    </label>

                    <input
                      value={paymentReference}
                      onChange={(event) =>
                        setPaymentReference(
                          event.target.value,
                        )
                      }
                      placeholder="e.g. M-Pesa transaction code"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                  <button
                    type="button"
                    onClick={closePaymentModal}
                    disabled={saving}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving
                      ? 'Processing...'
                      : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
