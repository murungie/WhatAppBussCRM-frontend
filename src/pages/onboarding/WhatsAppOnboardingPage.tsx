import {
  useNavigate,
} from 'react-router-dom';

export default function WhatsAppOnboardingPage() {
  const navigate =
    useNavigate();

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
          Connect your WhatsApp Business account
          securely through Meta. You will not need
          to enter an access token or Phone Number ID.
        </p>

        <button
          type="button"
          className="mt-8 w-full rounded-lg bg-[#1877F2] px-4 py-3 font-medium text-white hover:opacity-90"
          onClick={() => {
            // Meta Embedded Signup will be added here.
          }}
        >
          Connect WhatsApp with Meta
        </button>

        <button
          type="button"
          onClick={() =>
            navigate('/dashboard')
          }
          className="mt-4 text-sm text-gray-500 hover:text-gray-900"
        >
          I'll do this later
        </button>
      </div>
    </div>
  );
}