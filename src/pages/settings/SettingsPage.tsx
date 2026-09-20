import { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';

import {
  getSettings,
  updateSettings,
} from '../../api/settings';

import type { BusinessSettings } from '../../api/settings';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<BusinessSettings | null>(null);

  const [businessName, setBusinessName] =
    useState('');

  const [ownerEmail, setOwnerEmail] =
    useState('');

  const [whatsappPhoneId, setWhatsappPhoneId] =
    useState('');

  const [whatsappToken, setWhatsappToken] =
    useState('');

  const [showTokenField, setShowTokenField] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] =
    useState(false);
  const [savingWhatsapp, setSavingWhatsapp] =
    useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadSettings() {
    try {
      setLoading(true);
      setError('');

      const data = await getSettings();

      setSettings(data);
      setBusinessName(data.businessName);
      setOwnerEmail(data.ownerEmail);
      setWhatsappPhoneId(
        data.whatsappPhoneId ?? '',
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to load settings.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSaveProfile(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!businessName.trim()) {
      setError('Business name is required.');
      return;
    }

    if (!ownerEmail.trim()) {
      setError('Owner email is required.');
      return;
    }

    try {
      setSavingProfile(true);
      setError('');
      setSuccess('');

      const updated = await updateSettings({
        businessName: businessName.trim(),
        ownerEmail: ownerEmail.trim(),
      });

      setSettings(updated);
      setBusinessName(updated.businessName);
      setOwnerEmail(updated.ownerEmail);

      setSuccess(
        'Business profile updated successfully.',
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to update business profile.',
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveWhatsapp(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!whatsappPhoneId.trim()) {
      setError('WhatsApp Phone Number ID is required.');
      return;
    }

    try {
      setSavingWhatsapp(true);
      setError('');
      setSuccess('');

      const payload: {
        whatsappPhoneId: string;
        whatsappToken?: string;
      } = {
        whatsappPhoneId:
          whatsappPhoneId.trim(),
      };

      if (whatsappToken.trim()) {
        payload.whatsappToken =
          whatsappToken.trim();
      }

      const updated =
        await updateSettings(payload);

      setSettings(updated);
      setWhatsappPhoneId(
        updated.whatsappPhoneId ?? '',
      );
      setWhatsappToken('');
      setShowTokenField(false);

      setSuccess(
        'WhatsApp configuration updated successfully.',
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to update WhatsApp configuration.',
      );
    } finally {
      setSavingWhatsapp(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2.5 text-white">
              <Building2 size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Settings
              </h1>

              <p className="text-sm text-slate-500">
                Manage business and WhatsApp configuration.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            size={16}
            className={
              loading ? 'animate-spin' : ''
            }
          />
          Refresh
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-20 text-sm text-slate-500">
          Loading settings...
        </div>
      ) : settings ? (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                    <UserRound size={18} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Business Profile
                    </h2>

                    <p className="text-sm text-slate-500">
                      General account information.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSaveProfile}
                className="space-y-5 px-6 py-6"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Business Name
                  </label>

                  <input
                    value={businessName}
                    onChange={(event) =>
                      setBusinessName(
                        event.target.value,
                      )
                    }
                    maxLength={150}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Owner Email
                  </label>

                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(event) =>
                      setOwnerEmail(
                        event.target.value,
                      )
                    }
                    maxLength={255}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    This is the email associated with the CRM account.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  <Save size={16} />
                  {savingProfile
                    ? 'Saving...'
                    : 'Save Profile'}
                </button>
              </form>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                    <KeyRound size={18} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      WhatsApp Business
                    </h2>

                    <p className="text-sm text-slate-500">
                      Configure your Meta WhatsApp connection.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSaveWhatsapp}
                className="space-y-5 px-6 py-6"
              >
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Connection Status
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {settings.whatsappConfigured
                        ? 'WhatsApp credentials are configured.'
                        : 'WhatsApp credentials are incomplete.'}
                    </p>
                  </div>

                  {settings.whatsappConfigured ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 size={14} />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                      <XCircle size={14} />
                      Not Configured
                    </span>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    WhatsApp Phone Number ID
                  </label>

                  <input
                    value={whatsappPhoneId}
                    onChange={(event) =>
                      setWhatsappPhoneId(
                        event.target.value,
                      )
                    }
                    maxLength={100}
                    placeholder="Meta WhatsApp Phone Number ID"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Access Token
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {settings.whatsappTokenConfigured
                          ? `Configured: ${settings.whatsappTokenMasked}`
                          : 'No access token configured.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowTokenField(
                          (current) => !current,
                        )
                      }
                      className="text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
                    >
                      {showTokenField
                        ? 'Hide'
                        : 'Update token'}
                    </button>
                  </div>

                  {showTokenField && (
                    <div className="mt-4">
                      <input
                        type="password"
                        value={whatsappToken}
                        onChange={(event) =>
                          setWhatsappToken(
                            event.target.value,
                          )
                        }
                        maxLength={1000}
                        autoComplete="new-password"
                        placeholder="Paste a new WhatsApp access token"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      />

                      <p className="mt-1.5 text-xs text-slate-400">
                        The current token is never displayed.
                        Leave this blank to keep the existing token.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />

                  <p className="text-xs leading-5 text-amber-800">
                    WhatsApp access tokens are sensitive credentials.
                    They are stored on the server and are never
                    returned to the frontend in plain text.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={savingWhatsapp}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  <Save size={16} />
                  {savingWhatsapp
                    ? 'Saving...'
                    : 'Save WhatsApp Configuration'}
                </button>
              </form>
            </section>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="font-semibold text-slate-900">
                Account Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Business ID
                </p>
                <p className="mt-2 break-all text-sm text-slate-700">
                  {settings.id}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Created
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {formatDate(settings.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Last Updated
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {formatDate(settings.updatedAt)}
                </p>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
