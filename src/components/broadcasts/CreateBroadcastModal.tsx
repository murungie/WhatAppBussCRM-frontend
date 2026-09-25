import {
  CalendarClock,
  Loader2,
  Megaphone,
  Search,
  Users,
  X,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  addBroadcastRecipients,
  createBroadcast,
  type BroadcastType,
} from '../../api/broadcasts';

import {
  getCustomers,
  type Customer,
} from '../../api/customers';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateBroadcastModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [type, setType] =
    useState<BroadcastType>('TEXT');

  const [message, setMessage] =
    useState('');

  const [templateName, setTemplateName] =
    useState(
      'jaspers_market_order_confirmation_v1',
    );

  const [templateLanguage, setTemplateLanguage] =
    useState('en_US');

  const [templateParameters, setTemplateParameters] =
    useState(
      '{{customer.name}}\n{{broadcast.id}}\n{{date}}',
    );

  const [scheduledAt, setScheduledAt] =
    useState('');

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [search, setSearch] =
    useState('');

  const [loadingCustomers, setLoadingCustomers] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!open) return;

    async function loadCustomers() {
      try {
        setLoadingCustomers(true);
        setError('');

        const response =
          await getCustomers(1, 100);

        setCustomers(
          response.data,
        );
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            'Unable to load customers.',
        );
      } finally {
        setLoadingCustomers(false);
      }
    }

    void loadCustomers();
  }, [open]);

  const filteredCustomers =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return customers;
      }

      return customers.filter(
        (customer) =>
          customer.name
            ?.toLowerCase()
            .includes(value) ||
          customer.phoneNumber
            .toLowerCase()
            .includes(value),
      );
    }, [customers, search]);

  function resetForm() {
    setType('TEXT');
    setMessage('');
    setTemplateName(
      'jaspers_market_order_confirmation_v1',
    );
    setTemplateLanguage('en_US');
    setTemplateParameters(
      '{{customer.name}}\n{{broadcast.id}}\n{{date}}',
    );
    setScheduledAt('');
    setSelectedIds([]);
    setSearch('');
    setError('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function toggleCustomer(
    customerId: string,
  ) {
    setSelectedIds((current) =>
      current.includes(customerId)
        ? current.filter(
            (id) =>
              id !== customerId,
          )
        : [
            ...current,
            customerId,
          ],
    );
  }

  function toggleAll() {
    const ids =
      filteredCustomers.map(
        (customer) =>
          customer.id,
      );

    const allSelected =
      ids.length > 0 &&
      ids.every((id) =>
        selectedIds.includes(id),
      );

    setSelectedIds((current) =>
      allSelected
        ? current.filter(
            (id) => !ids.includes(id),
          )
        : Array.from(
            new Set([
              ...current,
              ...ids,
            ]),
          ),
    );
  }
 function convertLocalDateTimeToUtc(
  value: string,
) {
  if (!value) {
    return undefined;
  }

  const localDate = new Date(value);

  if (Number.isNaN(localDate.getTime())) {
    throw new Error(
      'Invalid scheduled date and time.',
    );
  }

  return localDate.toISOString();
}
const normalizedScheduledAt =
  convertLocalDateTimeToUtc(scheduledAt);
  async function handleCreate() {
    if (selectedIds.length === 0) {
      setError(
        'Select at least one customer.',
      );
      return;
    }

    if (
      type === 'TEXT' &&
      !message.trim()
    ) {
      setError(
        'Please enter a broadcast message.',
      );
      return;
    }

    if (
      type === 'TEMPLATE' &&
      !templateName.trim()
    ) {
      setError(
        'Please enter a template name.',
      );
      return;
    }

    if (
      type === 'TEMPLATE' &&
      !templateLanguage.trim()
    ) {
      setError(
        'Please enter a template language.',
      );
      return;
    }

    try {
      setSaving(true);
      setError('');

      const parameters =
        templateParameters
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean);
      
      const broadcast =
        await createBroadcast({
          type,
          message:
            type === 'TEXT'
              ? message.trim()
              : undefined,
          templateName:
            type === 'TEMPLATE'
              ? templateName.trim()
              : undefined,
          templateLanguage:
            type === 'TEMPLATE'
              ? templateLanguage.trim()
              : undefined,
          templateParameters:
            type === 'TEMPLATE'
              ? parameters
              : undefined,
          segment: 'CUSTOM',
          scheduledAt:normalizedScheduledAt,
        });

      await addBroadcastRecipients(
        broadcast.id,
        selectedIds,
      );

      onCreated();

      resetForm();
      onClose();
    } catch (err: any) {
      setError(
        Array.isArray(
          err?.response?.data?.message,
        )
          ? err.response.data.message.join(
              ', ',
            )
          : err?.response?.data?.message ??
              'Unable to create broadcast.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Megaphone className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                New broadcast
              </h2>

              <p className="text-xs text-slate-500">
                Create a WhatsApp text or template campaign.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-2">
            <div className="border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
              <h3 className="text-sm font-semibold text-slate-900">
                Message type
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setType('TEXT')
                  }
                  className={[
                    'rounded-xl border px-4 py-3 text-left transition',
                    type === 'TEXT'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <p className="text-sm font-semibold">
                    Text
                  </p>

                  <p
                    className={
                      type === 'TEXT'
                        ? 'mt-1 text-xs text-slate-300'
                        : 'mt-1 text-xs text-slate-500'
                    }
                  >
                    24-hour window
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setType('TEMPLATE')
                  }
                  className={[
                    'rounded-xl border px-4 py-3 text-left transition',
                    type === 'TEMPLATE'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <p className="text-sm font-semibold">
                    Template
                  </p>

                  <p
                    className={
                      type === 'TEMPLATE'
                        ? 'mt-1 text-xs text-slate-300'
                        : 'mt-1 text-xs text-slate-500'
                    }
                  >
                    Outside 24h window
                  </p>
                </button>
              </div>

              {type === 'TEXT' ? (
                <div className="mt-6">
                  <label className="text-sm font-semibold text-slate-900">
                    Message
                  </label>

                  <textarea
                    value={message}
                    onChange={(event) =>
                      setMessage(
                        event.target.value,
                      )
                    }
                    rows={7}
                    placeholder="Write your WhatsApp broadcast message..."
                    className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-slate-900">
                      Template name
                    </label>

                    <input
                      value={templateName}
                      onChange={(event) =>
                        setTemplateName(
                          event.target.value,
                        )
                      }
                      placeholder="template_name"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900">
                      Language
                    </label>

                    <input
                      value={
                        templateLanguage
                      }
                      onChange={(event) =>
                        setTemplateLanguage(
                          event.target.value,
                        )
                      }
                      placeholder="en_US"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900">
                      Parameters
                    </label>

                    <p className="mt-1 text-xs text-slate-500">
                      One parameter per line. Supported placeholders include customer.name, customer.phone, customer.id, broadcast.id and date.
                    </p>

                    <textarea
                      value={
                        templateParameters
                      }
                      onChange={(event) =>
                        setTemplateParameters(
                          event.target.value,
                        )
                      }
                      rows={6}
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-sm outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <CalendarClock className="h-4 w-4" />
                  Schedule
                </label>

                <p className="mt-1 text-xs text-slate-500">
                  Leave empty to queue immediately.
                </p>

                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) =>
                    setScheduledAt(
                      event.target.value,
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="min-h-0 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Recipients
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedIds.length} selected
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-950"
                >
                  Select all
                </button>
              </div>

              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search customers..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="mt-4 max-h-[430px] overflow-y-auto rounded-xl border border-slate-200">
                {loadingCustomers ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : filteredCustomers.length ===
                  0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No customers found.
                  </div>
                ) : (
                  filteredCustomers.map(
                    (customer) => {
                      const selected =
                        selectedIds.includes(
                          customer.id,
                        );

                      return (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() =>
                            toggleCustomer(
                              customer.id,
                            )
                          }
                          className={[
                            'flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left last:border-b-0',
                            selected
                              ? 'bg-slate-50'
                              : 'hover:bg-slate-50',
                          ].join(' ')}
                        >
                          <div
                            className={[
                              'flex h-5 w-5 items-center justify-center rounded border text-xs',
                              selected
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-300',
                            ].join(' ')}
                          >
                            {selected
                              ? '✓'
                              : ''}
                          </div>

                          <Users className="h-4 w-4 text-slate-400" />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {customer.name ??
                                'Unnamed customer'}
                            </p>

                            <p className="text-xs text-slate-500">
                              {
                                customer.phoneNumber
                              }
                            </p>
                          </div>
                        </button>
                      );
                    },
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <footer className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            {scheduledAt
              ? 'This broadcast will be scheduled.'
              : 'This broadcast will be ready to send immediately.'}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                void handleCreate()
              }
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              Create broadcast
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}