import { useEffect, useState } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  RefreshCw,
  MessageSquareText,
  X,
  Pencil,
  Power,
} from 'lucide-react';

import {
  createAutoReply,
  deleteAutoReply,
  getAutoReplies,
  updateAutoReply,
} from '../../api/autoReplies';

import type { AutoReply } from '../../api/autoReplies';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function AutoRepliesPage() {
  const [rules, setRules] = useState<AutoReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReply | null>(null);

  const [keyword, setKeyword] = useState('');
  const [response, setResponse] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadRules() {
    try {
      setLoading(true);
      setError('');

      const data = await getAutoReplies();
      setRules(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to load auto-reply rules.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRules();
  }, []);

  function resetForm() {
    setKeyword('');
    setResponse('');
    setIsActive(true);
    setEditingRule(null);
    setError('');
  }

  function openCreateModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(rule: AutoReply) {
    setEditingRule(rule);
    setKeyword(rule.keyword);
    setResponse(rule.response);
    setIsActive(rule.isActive);
    setError('');
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    resetForm();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();
    const trimmedResponse = response.trim();

    if (!trimmedKeyword) {
      setError('Keyword is required.');
      return;
    }

    if (trimmedKeyword.length > 100) {
      setError('Keyword must not exceed 100 characters.');
      return;
    }

    if (!trimmedResponse) {
      setError('Response is required.');
      return;
    }

    if (trimmedResponse.length > 4096) {
      setError('Response must not exceed 4096 characters.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (editingRule) {
        const updated = await updateAutoReply(
          editingRule.id,
          {
            keyword: trimmedKeyword,
            response: trimmedResponse,
            isActive,
          },
        );

        setRules((current) =>
          current.map((rule) =>
            rule.id === updated.id ? updated : rule,
          ),
        );

        setSuccess('Auto-reply rule updated successfully.');
      } else {
        const created = await createAutoReply({
          keyword: trimmedKeyword,
          response: trimmedResponse,
          isActive,
        });

        setRules((current) => [created, ...current]);

        setSuccess('Auto-reply rule created successfully.');
      }

      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to save auto-reply rule.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(rule: AutoReply) {
    try {
      setTogglingId(rule.id);
      setError('');
      setSuccess('');

      const updated = await updateAutoReply(
        rule.id,
        {
          isActive: !rule.isActive,
        },
      );

      setRules((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      );

      setSuccess(
        updated.isActive
          ? `"${updated.keyword}" is now active.`
          : `"${updated.keyword}" is now inactive.`,
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to update rule status.',
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(rule: AutoReply) {
    const confirmed = window.confirm(
      `Delete the auto-reply rule for "${rule.keyword}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(rule.id);
      setError('');
      setSuccess('');

      await deleteAutoReply(rule.id);

      setRules((current) =>
        current.filter((item) => item.id !== rule.id),
      );

      setSuccess('Auto-reply rule deleted successfully.');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to delete auto-reply rule.',
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2.5 text-white">
              <Bot size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Auto Replies
              </h1>

              <p className="text-sm text-slate-500">
                Automatically respond to matching customer messages.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadRules}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={16} />
            New Auto Reply
          </button>
        </div>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {error && !showModal && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Rules</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {rules.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {rules.filter((rule) => rule.isActive).length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Inactive</p>
          <p className="mt-2 text-2xl font-bold text-slate-500">
            {rules.filter((rule) => !rule.isActive).length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Auto-Reply Rules
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-6 py-16 text-sm text-slate-500">
            Loading auto-reply rules...
          </div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <MessageSquareText
                size={28}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No auto-reply rules yet
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Create a rule that automatically responds when an
              incoming message contains a matching keyword.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={16} />
              Create First Rule
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-800">
                      {rule.keyword}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        rule.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {rule.response}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Updated {formatDate(rule.updatedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(rule)}
                    disabled={togglingId === rule.id}
                    title={rule.isActive ? 'Deactivate' : 'Activate'}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50 ${
                      rule.isActive
                        ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <Power size={16} />
                    {togglingId === rule.id
                      ? 'Updating...'
                      : rule.isActive
                        ? 'Disable'
                        : 'Enable'}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(rule)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(rule)}
                    disabled={deletingId === rule.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {deletingId === rule.id
                      ? 'Deleting...'
                      : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingRule
                    ? 'Edit Auto Reply'
                    : 'New Auto Reply'}
                </h2>

                <p className="text-sm text-slate-500">
                  Configure an automatic response rule.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Keyword
                  </label>

                  <input
                    value={keyword}
                    onChange={(event) =>
                      setKeyword(event.target.value)
                    }
                    maxLength={100}
                    placeholder="e.g. products"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    {keyword.length}/100 characters
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Automatic Response
                  </label>

                  <textarea
                    value={response}
                    onChange={(event) =>
                      setResponse(event.target.value)
                    }
                    maxLength={4096}
                    rows={6}
                    placeholder="Enter the message customers should receive..."
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    {response.length}/4096 characters
                  </p>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) =>
                      setIsActive(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  <span>
                    <span className="block text-sm font-medium text-slate-800">
                      Active rule
                    </span>

                    <span className="block text-xs text-slate-500">
                      Matching incoming messages can trigger this
                      rule when active.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingRule
                      ? 'Save Changes'
                      : 'Create Auto Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
