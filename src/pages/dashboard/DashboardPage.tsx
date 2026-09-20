import {
  MessageCircle,
  MessageSquare,
  Megaphone,
  Users,
} from 'lucide-react';
import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/client';

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface Customer {
  id: string;
  name: string | null;
  phoneNumber: string;
  _count: {
    messages: number;
    orders: number;
  };
}

interface InboxCustomer {
  id: string;
  messages: {
    createdAt: string;
  }[];
}

interface Broadcast {
  id: string;
  status: string;
}

interface DashboardStats {
  customers: number;
  conversations: number;
  broadcasts: number;
  messages: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: number | string;
  icon: typeof Users;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats>({
      customers: 0,
      conversations: 0,
      broadcasts: 0,
      messages: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const [
          customersResponse,
          inboxResponse,
          broadcastsResponse,
        ] = await Promise.all([
          api.get<
            PaginatedResponse<Customer>
          >('/customers?page=1&limit=100'),

          api.get<InboxCustomer[]>(
            '/messages/inbox',
          ),

          api.get<
            PaginatedResponse<Broadcast>
          >('/broadcasts?page=1&limit=1'),
        ]);

        const customerData =
          customersResponse.data.data;

        const messageCount =
          customerData.reduce(
            (total, customer) =>
              total +
              customer._count.messages,
            0,
          );

        setStats({
          customers:
            customersResponse.data.pagination.total,

          conversations:
            inboxResponse.data.length,

          broadcasts:
            broadcastsResponse.data.pagination.total,

          messages: messageCount,
        });
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            'Unable to load dashboard data.',
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-slate-500">
          Overview
        </p>

        <div className="mt-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor your customers, conversations and WhatsApp campaigns.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Customers"
          value={
            loading ? '—' : stats.customers
          }
          subtitle="Registered customers"
          icon={Users}
        />

        <StatCard
          title="Conversations"
          value={
            loading
              ? '—'
              : stats.conversations
          }
          subtitle="Customers with message history"
          icon={MessageCircle}
        />

        <StatCard
          title="Broadcasts"
          value={
            loading
              ? '—'
              : stats.broadcasts
          }
          subtitle="Campaigns created"
          icon={Megaphone}
        />

        <StatCard
          title="Messages"
          value={
            loading ? '—' : stats.messages
          }
          subtitle="Tracked message records"
          icon={MessageSquare}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Recent activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your CRM activity will appear here as we connect the remaining modules.
            </p>
          </div>

          <div className="mt-8 flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
            <div className="text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                Activity timeline
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Inbox and broadcast activity will appear here.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">
            Quick actions
          </h2>

          <div className="mt-5 space-y-3">
            <a
              href="/inbox"
              className="block rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">
                Open Inbox
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Manage WhatsApp conversations.
              </p>
            </a>

            <a
              href="/customers"
              className="block rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">
                View Customers
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Search and manage customers.
              </p>
            </a>

            <a
              href="/broadcasts"
              className="block rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">
                Broadcasts
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Create and monitor campaigns.
              </p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}