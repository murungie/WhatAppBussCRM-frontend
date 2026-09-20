import {
  ArrowUp,
  Check,
  CheckCheck,
  Clock3,
  Loader2,
  MessageCircle,
  Search,
  User,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getConversation,
  getInbox,
  sendMessage,
  type InboxCustomer,
  type InboxMessagePreview,
} from '../../api/messages';

import { useSearchParams } from 'react-router-dom';

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    [],
    {
      month: 'short',
      day: 'numeric',
    },
  );
}

function MessageStatusIcon({
  status,
}: {
  status: InboxMessagePreview['status'];
}) {
  if (status === 'READ') {
    return (
      <CheckCheck className="h-3.5 w-3.5 text-slate-500" />
    );
  }

  if (status === 'DELIVERED') {
    return (
      <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
    );
  }

  if (status === 'SENT') {
    return (
      <Check className="h-3.5 w-3.5 text-slate-400" />
    );
  }

  if (status === 'PENDING') {
    return (
      <Clock3 className="h-3 w-3 text-slate-400" />
    );
  }

  return null;
}

export default function InboxPage() {
  const [searchParams] =
    useSearchParams();

  const requestedCustomerId =
    searchParams.get('customerId');

  const [customers, setCustomers] =
    useState<InboxCustomer[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] =
    useState<string | null>(null);

  const [conversation, setConversation] =
    useState<Awaited<
      ReturnType<typeof getConversation>
    > | null>(null);

  const [search, setSearch] =
    useState('');

  const [message, setMessage] =
    useState('');

  const [loadingInbox, setLoadingInbox] =
    useState(true);

  const [loadingConversation, setLoadingConversation] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState('');

  async function loadInbox() {
    try {
      setLoadingInbox(true);
      setError('');

      const data =
        await getInbox();

      setCustomers(data);

      if (data.length > 0) {
  const requestedCustomer =
    requestedCustomerId
      ? data.find(
          (customer) =>
            customer.id ===
            requestedCustomerId,
        )
      : undefined;

  setSelectedCustomerId(
    requestedCustomer?.id ??
      selectedCustomerId ??
      data[0].id,
  );
}
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Unable to load conversations.',
      );
    } finally {
      setLoadingInbox(false);
    }
  }

  async function loadConversation(
    customerId: string,
  ) {
    try {
      setLoadingConversation(true);
      setError('');

      const data =
        await getConversation(
          customerId,
        );

      setConversation(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Unable to load conversation.',
      );
    } finally {
      setLoadingConversation(false);
    }
  }

  useEffect(() => {
  void loadInbox();
}, [requestedCustomerId]);

  useEffect(() => {
    if (selectedCustomerId) {
      void loadConversation(
        selectedCustomerId,
      );
    }
  }, [selectedCustomerId]);

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

  async function handleSend() {
    const content =
      message.trim();

    if (
      !content ||
      !conversation ||
      !conversation.conversation
        .canSendFreeForm ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError('');

      await sendMessage(
        conversation.customer.id,
        content,
      );

      setMessage('');

      await loadConversation(
        conversation.customer.id,
      );

      await loadInbox();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Unable to send message.',
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[600px] flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Communications
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-950">
          Inbox
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your WhatsApp customer conversations.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {Array.isArray(error)
            ? error.join(', ')
            : error}
        </div>
      )}

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[330px_minmax(0,1fr)]">
        {/* Conversation list */}

        <section className="flex min-h-0 flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search conversations"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingInbox ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  No conversations found
                </p>
              </div>
            ) : (
              filteredCustomers.map(
                (customer) => {
                  const lastMessage =
                    customer.messages[0];

                  const active =
                    customer.id ===
                    selectedCustomerId;

                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() =>
                        setSelectedCustomerId(
                          customer.id,
                        )
                      }
                      className={[
                        'w-full border-b border-slate-100 p-4 text-left transition',
                        active
                          ? 'bg-slate-50'
                          : 'hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          {customer.name
                            ? customer.name
                                .charAt(0)
                                .toUpperCase()
                            : (
                              <User className="h-4 w-4" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {customer.name ??
                                customer.phoneNumber}
                            </p>

                            {lastMessage && (
                              <span className="shrink-0 text-[11px] text-slate-400">
                                {formatDate(
                                  lastMessage.createdAt,
                                )}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {lastMessage?.content ??
                              customer.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                },
              )
            )}
          </div>
        </section>

        {/* Conversation */}

        <section className="flex min-h-0 flex-col">
          {!selectedCustomerId ||
          !conversation ||
          loadingConversation ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-7 w-7 animate-spin text-slate-400" />

                <p className="mt-3 text-sm text-slate-500">
                  Loading conversation...
                </p>
              </div>
            </div>
          ) : (
            <>
              <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    {conversation.customer.name
                      ? conversation.customer.name
                          .charAt(0)
                          .toUpperCase()
                      : (
                        <User className="h-4 w-4" />
                      )}
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      {conversation.customer
                        .name ??
                        conversation.customer
                          .phoneNumber}
                    </h2>

                    <p className="text-xs text-slate-500">
                      {conversation.customer
                        .phoneNumber}
                    </p>
                  </div>
                </div>

                <div>
                  {conversation.conversation
                    .isOpen ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      24h window open
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      Template required
                    </span>
                  )}
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
                {conversation.messages.map(
                  (item) => {
                    const outbound =
                      item.direction ===
                      'OUTBOUND';

                    return (
                      <div
                        key={item.id}
                        className={[
                          'flex',
                          outbound
                            ? 'justify-end'
                            : 'justify-start',
                        ].join(' ')}
                      >
                        <div
                          className={[
                            'max-w-[78%] rounded-2xl px-4 py-3 shadow-sm',
                            outbound
                              ? 'rounded-br-md bg-slate-900 text-white'
                              : 'rounded-bl-md bg-white text-slate-900',
                          ].join(' ')}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {item.content}
                          </p>

                          <div
                            className={[
                              'mt-2 flex items-center justify-end gap-1 text-[10px]',
                              outbound
                                ? 'text-slate-300'
                                : 'text-slate-400',
                            ].join(' ')}
                          >
                            <span>
                              {formatTime(
                                item.createdAt,
                              )}
                            </span>

                            {outbound && (
                              <MessageStatusIcon
                                status={
                                  item.status
                                }
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              <div className="border-t border-slate-200 bg-white p-4">
                {!conversation.conversation
                  .canSendFreeForm ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    The 24-hour customer conversation window is closed. A WhatsApp template is required for the next outbound message.
                  </div>
                ) : (
                  <div className="flex items-end gap-3">
                    <textarea
                      value={message}
                      onChange={(event) =>
                        setMessage(
                          event.target.value,
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                            'Enter' &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();
                          void handleSend();
                        }
                      }}
                      rows={2}
                      placeholder="Type a message..."
                      className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                    />

                    <button
                      type="button"
                      disabled={
                        sending ||
                        !message.trim()
                      }
                      onClick={() =>
                        void handleSend()
                      }
                      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowUp className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}