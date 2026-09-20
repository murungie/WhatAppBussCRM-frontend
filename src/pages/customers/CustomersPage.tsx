import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Search,
  ShoppingBag,
  User,
  Users,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getConversationStatus,
  getCustomers,
  type Customer,
} from '../../api/customers';

function formatDate(
  value: string | null,
) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString(
    [],
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  );
}

function formatMoney(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 'KSh 0.00';
  }

  return new Intl.NumberFormat(
    'en-KE',
    {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    },
  ).format(amount);
}

export default function CustomersPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState('');

  const [inputSearch, setInputSearch] =
    useState('');

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [openCustomerIds, setOpenCustomerIds] =
    useState<Record<string, boolean>>({});

  const limit = 10;

  async function loadCustomers() {
    try {
      setLoading(true);
      setError('');

      const response =
        await getCustomers(
          page,
          limit,
          search,
        );

      setCustomers(
        response.data,
      );

      setTotal(
        response.pagination.total,
      );

      setTotalPages(
        response.pagination.totalPages,
      );

      const statuses =
        await Promise.all(
          response.data.map(
            async (customer) => {
              try {
                const result =
                  await getConversationStatus(
                    customer.id,
                  );

                return [
                  customer.id,
                  result.conversation.isOpen,
                ] as const;
              } catch {
                return [
                  customer.id,
                  false,
                ] as const;
              }
            },
          ),
        );

      setOpenCustomerIds(
        Object.fromEntries(statuses),
      );
    } catch (err: any) {
      setError(
        Array.isArray(
          err?.response?.data?.message,
        )
          ? err.response.data.message.join(
              ', ',
            )
          : err?.response?.data?.message ??
              'Unable to load customers.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, [page, search]);

  function handleSearchSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setPage(1);
    setSearch(inputSearch.trim());
  }

  function clearSearch() {
    setInputSearch('');
    setSearch('');
    setPage(1);
  }

  const summary = useMemo(() => {
    const messageCount =
      customers.reduce(
        (sum, customer) =>
          sum + customer._count.messages,
        0,
      );

    const orderCount =
      customers.reduce(
        (sum, customer) =>
          sum + customer._count.orders,
        0,
      );

    return {
      messageCount,
      orderCount,
    };
  }, [customers]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-slate-500">
          CRM
        </p>

        <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Customers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Search and manage your WhatsApp customers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="h-4 w-4" />
            {total} total customers
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Current page
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {customers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <MessageCircle className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Messages
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {summary.messageCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Orders
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {summary.orderCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full max-w-xl gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={inputSearch}
                onChange={(event) =>
                  setInputSearch(
                    event.target.value,
                  )
                }
                placeholder="Search by name or phone number..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Search
            </button>

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">
                  Customer
                </th>
                <th className="px-5 py-3">
                  Phone
                </th>
                <th className="px-5 py-3">
                  Conversation
                </th>
                <th className="px-5 py-3">
                  Messages
                </th>
                <th className="px-5 py-3">
                  Orders
                </th>
                <th className="px-5 py-3">
                  Total spent
                </th>
                <th className="px-5 py-3">
                  Last inbound
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center"
                  >
                    <User className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No customers found
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map(
                  (customer) => (
                    <tr
                      key={customer.id}
                      className="cursor-pointer transition hover:bg-slate-50"
                      onClick={() =>
                        navigate(
                          `/inbox?customerId=${customer.id}`,
                        )
                      }
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                            {customer.name
                              ? customer.name
                                  .charAt(0)
                                  .toUpperCase()
                              : (
                                <User className="h-4 w-4" />
                              )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {customer.name ??
                                'Unnamed customer'}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Joined{' '}
                              {formatDate(
                                customer.createdAt,
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {customer.phoneNumber}
                      </td>

                      <td className="px-5 py-4">
                        {openCustomerIds[
                          customer.id
                        ] ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            24h open
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            Template required
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {customer._count.messages}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {customer._count.orders}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {formatMoney(
                          customer.totalSpent,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(
                          customer.lastInboundAt,
                        )}
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage(
                  (current) =>
                    Math.max(1, current - 1),
                )
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              disabled={
                page >= totalPages
              }
              onClick={() =>
                setPage(
                  (current) =>
                    Math.min(
                      totalPages,
                      current + 1,
                    ),
                )
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}