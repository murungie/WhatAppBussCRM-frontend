import {
  useState,
  type SubmitEvent,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  completeProfile,
} from '../../api/auth';

export default function OnboardingPage() {
  const navigate =
    useNavigate();

  const [businessName, setBusinessName] =
    useState('');

  const [businessPhone, setBusinessPhone] =
    useState('');

  const [industry, setIndustry] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
  event: SubmitEvent<HTMLFormElement>,
) {
  event.preventDefault();


    setError('');
    setLoading(true);

    try {
      await completeProfile({
        businessName:
          businessName.trim() || undefined,

        businessPhone:
          businessPhone.trim(),

        industry:
          industry.trim() || undefined,
      });

      navigate(
        '/onboarding/whatsapp',
        { replace: true },
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message ||
              'Unable to save your business profile.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <div className="mb-3 text-sm font-medium text-gray-500">
            Step 1 of 2
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Tell us about your business
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            We need a few details before connecting
            your WhatsApp Business account.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="businessName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Business name
            </label>

            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(event) =>
                setBusinessName(
                  event.target.value,
                )
              }
              maxLength={150}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-500"
              placeholder="Your business name"
            />
          </div>

          <div>
            <label
              htmlFor="businessPhone"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Business phone
            </label>

            <input
              id="businessPhone"
              type="tel"
              value={businessPhone}
              onChange={(event) =>
                setBusinessPhone(
                  event.target.value,
                )
              }
              required
              maxLength={30}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-500"
              placeholder="+254..."
            />
          </div>

          <div>
            <label
              htmlFor="industry"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Industry
            </label>

            <input
              id="industry"
              type="text"
              value={industry}
              onChange={(event) =>
                setIndustry(
                  event.target.value,
                )
              }
              maxLength={100}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-500"
              placeholder="e.g. Retail, Restaurant, Education"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Saving...'
              : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}