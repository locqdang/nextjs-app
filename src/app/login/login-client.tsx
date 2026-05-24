'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { renderGoogleLoginButton } from '../../hooks/useGoogleOneTap';

type EmailLoginResponse = {
  message?: string;
  error?: string;
};

type LoginClientProps = {
  redirectPath: string;
};

export default function LoginClient({ redirectPath }: LoginClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [buttonText, setButtonText] = useState<string>('Send login link');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Skip login screen for users who already have an active app session.
    if (user) {
      router.push(redirectPath);
    }
  }, [user, router, redirectPath]);

  useEffect(() => {
    let timeoutId: number | undefined;

    const tryRenderGoogleButton = () => {
      // Retry until Google script + container are ready, then render once.
      if (renderGoogleLoginButton()) {
        return;
      }

      timeoutId = window.setTimeout(tryRenderGoogleButton, 50);
    };

    tryRenderGoogleButton();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Reset UI feedback and lock submit while request is in flight.
    setError('');
    setLoading(true);

    try {
      // Request a magic login link email for the entered address.
      const response = await fetch('/api/auth/email-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectPath }),
      });

      const data = (await response.json()) as EmailLoginResponse;

      if (!response.ok) {
        // Show backend-provided reason so user can correct input/state.
        setError(data.error || 'Login failed');
        return;
      }

      // Replace CTA text with confirmation that link dispatch was accepted.
      setButtonText(data.message || 'Login link sent');
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-6 flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Login</h2>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6 flex justify-center">
          {/* Placeholder container used by Google SDK to inject the sign-in button. */}
          <div id="google-signin-button"></div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Getting Login Link...' : buttonText}
          </button>
        </form>
      </div>
    </div>
  );
}
