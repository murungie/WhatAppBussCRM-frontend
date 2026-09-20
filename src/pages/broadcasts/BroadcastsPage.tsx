import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Megaphone,
  Plus,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react';
import {
  useEffect,
  useState,
} from 'react';

import {
  cancelBroadcast,
  getBroadcastAnalytics,
  getBroadcasts,
  retryBroadcast,
  sendBroadcast,
  type Broadcast,
  type BroadcastAnalytics,
  type BroadcastStatus,
} from '../../api/broadcasts';

import CreateBroadcastModal from '../../components/broadcasts/CreateBroadcastModal';
const statusOptions: Array<
  { label: string; value: BroadcastStatus | '' }
> = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Queued', value: 'QUEUED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

function formatDate(value: string | null) {
  if (!value) return '—';

  return new Date(value).toLocaleString(
    [],
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

function getStatusClass(
  status: BroadcastStatus,
) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700';

    case 'FAILED':
      return 'bg-red-50 text-red-700';

    case 'QUEUED':
      return 'bg-blue-50 text-blue-700';

    case 'PROCESSING':
      return 'bg-violet-50 text-violet-700';

    case 'CANCELLED':
      return 'bg-slate-100 text-slate-600';

    default:
      return 'bg-amber-50 text-amber-700';
  }
}

function StatusIcon({
  status,
}: {
  status: BroadcastStatus;
}) {
  if (status === 'COMPLETED') {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }

  if (status === 'FAILED') {
    return <XCircle className="h-3.5 w-3.5" />;
  }

  if (
    status === 'QUEUED' ||
    status === 'PROCESSING'
  ) {
    return <Clock3 className="h-3.5 w-3.5" />;
  }

  return null;
}

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] =
    useState<Broadcast[]>([]);

  const [status, setStatus] =
    useState<BroadcastStatus | ''>('');

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [analytics, setAnalytics] =
    useState<BroadcastAnalytics | null>(
      null,
    );
  
    const [createModalOpen, setCreateModalOpen] =
  useState(false);
  const [analyticsLoading, setAnalyticsLoading] =
    useState(false);

  const limit = 10;

  async function loadBroadcasts() {
    try {
      setLoading(true);
      setError('');

      const response =
        await getBroadcasts(
          page,
          limit,
          status || undefined,
        );

      setBroadcasts(
        response.data,
      );

      setTotal(
        response.pagination.total,
      );

      setTotalPages(
        response.pagination.totalPages,
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
              'Unable to load broadcasts.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBroadcasts();
  }, [page, status]);

  async function openAnalytics(
    broadcastId: string,
  ) {
    try {
      setAnalyticsLoading(true);
      setError('');

      const result =
        await getBroadcastAnalytics(
          broadcastId,
        );

      setAnalytics(result);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Unable to load analytics.',
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function handleSend(
    broadcastId: string,
  ) {
    try {
      setError('');

      await sendBroadcast(
        broadcastId,
      );

      await loadBroadcasts();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Unable to queue broadcast.',
      );
    }
  }

  async function handleRetry(
    broadcastId: string,
  ) {
    try {
      setError('');

      await retryBroadcast(
        broadcastId,
      );

      await loadBroadcasts();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Unable to retry broadcast.',
      );
    }
  }

  async function handleCancel(
    broadcastId: string,
  ) {
    try {
      setError('');

      await cancelBroadcast(
        broadcastId,
      );

      await loadBroadcasts();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Unable to cancel broadcast.',
      );
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-slate-500">
          Campaigns
        </p>

        <div className="mt-1 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Broadcasts
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage WhatsApp campaigns, scheduling and delivery.
            </p>
          </div>

         <button
  type="button"
  onClick={() => setCreateModalOpen(true)}
  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
>
  <Plus className="h-4 w-4" />
  New broadcast
</button>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Megaphone className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Total
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {total}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Completed
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {
              broadcasts.filter(
                (item) =>
                  item.status ===
                  'COMPLETED',
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Failed
          </p>

          <p className="mt-1 text-2xl font-bold text-red-600">
            {
              broadcasts.filter(
                (item) =>
                  item.status === 'FAILED',
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Current page
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-950">
            {broadcasts.length}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 p-4">
          {statusOptions.map(
            (option) => {
              const active =
                status === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setStatus(
                      option.value,
                    );
                  }}
                  className={[
                    'rounded-lg px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100',
                  ].join(' ')}
                >
                  {option.label}
                </button>
              );
            },
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">
                  Broadcast
                </th>
                <th className="px-5 py-3">
                  Type
                </th>
                <th className="px-5 py-3">
                  Recipients
                </th>
                <th className="px-5 py-3">
                  Delivery
                </th>
                <th className="px-5 py-3">
                  Read
                </th>
                <th className="px-5 py-3">
                  Status
                </th>
                <th className="px-5 py-3">
                  Created
                </th>
                <th className="px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading broadcasts...
                  </td>
                </tr>
              ) : broadcasts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center"
                  >
                    <Megaphone className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No broadcasts found
                    </p>
                  </td>
                </tr>
              ) : (
                broadcasts.map(
                  (broadcast) => (
                    <tr
                      key={broadcast.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="max-w-xs">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {broadcast.type ===
                            'TEMPLATE'
                              ? broadcast.templateName
                              : broadcast.message}
                          </p>

                          {broadcast
                            .scheduledAt && (
                            <p className="mt-1 text-xs text-slate-400">
                              Scheduled{' '}
                              {formatDate(
                                broadcast.scheduledAt,
                              )}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {broadcast.type}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {broadcast.totalRecipients}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {broadcast.deliveredCount}/
                        {broadcast.sentCount}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {broadcast.readCount}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                            getStatusClass(
                              broadcast.status,
                            ),
                          ].join(' ')}
                        >
                          <StatusIcon
                            status={
                              broadcast.status
                            }
                          />
                          {broadcast.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(
                          broadcast.createdAt,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {broadcast.status ===
                            'DRAFT' && (
                            <button
                              type="button"
                              onClick={() =>
                                void handleSend(
                                  broadcast.id,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                              title="Send"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}

                          {broadcast.status ===
                            'FAILED' && (
                            <button
                              type="button"
                              onClick={() =>
                                void handleRetry(
                                  broadcast.id,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                              title="Retry"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}

                          {(
                            [
                              'DRAFT',
                              'QUEUED',
                            ] as BroadcastStatus[]
                          ).includes(
                            broadcast.status,
                          ) && (
                            <button
                              type="button"
                              onClick={() =>
                                void handleCancel(
                                  broadcast.id,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                              title="Cancel"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              void openAnalytics(
                                broadcast.id,
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="Analytics"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>
                        </div>
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
                    Math.max(
                      1,
                      current - 1,
                    ),
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

      {analytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Broadcast analytics
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {analytics.broadcast.type}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setAnalytics(null)
                }
                className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              {analyticsLoading ? (
                <p className="text-sm text-slate-500">
                  Loading analytics...
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    [
                      'Recipients',
                      analytics.summary.totalRecipients,
                    ],
                    [
                      'Sent',
                      analytics.summary.sent,
                    ],
                    [
                      'Delivered',
                      analytics.summary.delivered,
                    ],
                    [
                      'Read',
                      analytics.summary.read,
                    ],
                    [
                      'Failed',
                      analytics.summary.failed,
                    ],
                    [
                      'Pending',
                      analytics.summary.pending,
                    ],
                    [
                      'Delivery rate',
                      `${analytics.rates.deliveryRate}%`,
                    ],
                    [
                      'Read rate',
                      `${analytics.rates.readRate}%`,
                    ],
                  ].map(
                    ([label, value]) => (
                      <div
                        key={String(label)}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          {label}
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-950">
                          {value}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateBroadcastModal
  open={createModalOpen}
  onClose={() =>
    setCreateModalOpen(false)
  }
  onCreated={() => {
    setCreateModalOpen(false);
    setPage(1);
    void loadBroadcasts();
  }}
/>
    </div>
  );

  
}