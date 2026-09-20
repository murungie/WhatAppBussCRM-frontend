import {
  useState,
  type FormEvent,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { login } from '../../api/auth';
import { useAuth } from '../../auth/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: saveToken } =
    useAuth();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response =
        await login({
          email,
          password,
        });

      saveToken(
        response.accessToken,
      );

      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err?.response?.data
          ?.message ??
          'Unable to sign in. Please check your credentials.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            WhatsApp Business CRM
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your customer conversations and broadcasts.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {Array.isArray(error)
                ? error.join(', ')
                : error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? 'Signing in...'
              : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}