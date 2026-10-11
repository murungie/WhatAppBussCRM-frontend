
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

type MetaSignupData = {
  waba_id?: string;
  phone_number_id?: string;
};

type MetaLoginResponse = {
  authResponse?: {
    code?: string;
  };
};

declare global {
  interface Window {
    FB?: {
      init: (options: {
        appId: string;
        autoLogAppEvents: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: MetaLoginResponse) => void,
        options: {
          config_id: string;
          response_type: string;
          override_default_response_type: boolean;
          extras: { setup: Record<string, never> };
        },
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export default function WhatsAppOnboardingPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [connecting, setConnecting] = useState(false);

  const codeRef = useRef<string | null>(null);
  const signupRef = useRef<MetaSignupData | null>(null);
  const submittedRef = useRef(false);

  const tryCompleteSignup = useCallback(async () => {
    const code = codeRef.current;
    const signup = signupRef.current;

    if (
      !code ||
      !signup?.waba_id ||
      !signup.phone_number_id ||
      submittedRef.current
    ) {
      return;
    }

    submittedRef.current = true;
    setConnecting(true);
    setStatus('Verifying your WhatsApp account with Meta...');

    try {
      await api.post('/settings/whatsapp/connect', {
        code,
        wabaId: signup.waba_id,
        phoneNumberId: signup.phone_number_id,
      });

      setStatus('WhatsApp connected successfully.');
      navigate('/dashboard');
    } catch (error: unknown) {
      submittedRef.current = false;
      codeRef.current = null;
      signupRef.current = null;

      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error
          ? (
              error as {
                response?: {
                  data?: { message?: string };
                };
              }
            ).response?.data?.message
          : undefined;

      setStatus(
        typeof message === 'string'
          ? message
          : 'Could not connect WhatsApp. Please try again.',
      );
    } finally {
      setConnecting(false);
    }
  }, [navigate]);

  useEffect(() => {
    const appId = import.meta.env.VITE_META_APP_ID;

    if (!appId) {
      setStatus('Meta App ID is missing from frontend configuration.');
      return;
    }

    let initialized = false;

    window.fbAsyncInit = () => {
      if (initialized || !window.FB) return;

      window.FB.init({
        appId,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v26.0',
      });

      initialized = true;
    };

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    } else if (window.FB) {
      window.fbAsyncInit();
    }

    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== 'https://www.facebook.com' &&
        event.origin !== 'https://web.facebook.com'
      ) {
        return;
      }

      if (typeof event.data !== 'string') return;

      let message: {
        type?: string;
        event?: string;
        data?: MetaSignupData;
      };

      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      if (message.type !== 'WA_EMBEDDED_SIGNUP') return;

      if (message.event === 'CANCEL') {
        setStatus('WhatsApp signup was cancelled.');
        return;
      }

      if (message.event === 'ERROR') {
        setStatus('Meta reported an error during signup. Please try again.');
        return;
      }

      if (message.event === 'FINISH') {
        signupRef.current = {
          waba_id: message.data?.waba_id,
          phone_number_id: message.data?.phone_number_id,
        };

        void tryCompleteSignup();
      }
    };

    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, [tryCompleteSignup]);

  const launchSignup = () => {
    const configId = import.meta.env.VITE_META_CONFIG_ID;

    if (!window.FB) {
      setStatus('Meta SDK is still loading. Please try again in a moment.');
      return;
    }

    if (!configId) {
      setStatus('Meta configuration ID is missing from frontend configuration.');
      return;
    }

    codeRef.current = null;
    signupRef.current = null;
    submittedRef.current = false;
    setStatus('');

    window.FB.login(
      (response) => {
        const code = response.authResponse?.code;

        if (!code) {
          setStatus(
            'Meta did not return an authorization code. Please try again.',
          );
          return;
        }

        codeRef.current = code;
        void tryCompleteSignup();
      },
      {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-sm">
        <div className="mb-3 text-sm font-medium text-gray-500">
          Step 2 of 2
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Connect WhatsApp
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Connect your WhatsApp Business account securely through Meta.
          You will not need to enter an access token or Phone Number ID.
        </p>

        <button
          type="button"
          disabled={connecting}
          className="mt-8 w-full rounded-lg bg-[#1877F2] px-4 py-3 font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={launchSignup}
        >
          {connecting
            ? 'Connecting WhatsApp...'
            : 'Connect WhatsApp with Meta'}
        </button>

        {status && (
          <p role="status" className="mt-4 text-sm text-gray-700">
            {status}
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-sm text-gray-500 hover:text-gray-900"
        >
          I'll do this later
        </button>
      </div>
    </div>
  );
}
