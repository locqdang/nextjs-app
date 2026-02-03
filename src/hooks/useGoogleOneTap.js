import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

/**
 * Custom hook for Google One Tap authentication
 * Handles initialization of Google One Tap, rendering the button, and processing login responses
 *
 * @param {Object} options - Configuration options
 * @param {string} options.buttonId - The DOM element ID where the Google button will be rendered (default: 'google-signin-button')
 * @param {Object} options.buttonConfig - Configuration for the Google sign-in button (default: { theme: 'outline', size: 'large', width: 320 })
 * @param {boolean} options.showPrompt - Whether to show the One Tap prompt (default: true)
 * @param {Function} options.onSuccess - Callback function on successful login
 * @param {Function} options.onError - Callback function on error
 *
 * @returns {Object} Object containing error and loading states
 */
export function useGoogleOneTap({
  buttonId = 'google-signin-button',
  buttonConfig = { theme: 'outline', size: 'large', width: 320 },
  showPrompt = true,
  onSuccess,
  onError,
} = {}) {
  const router = useRouter();
  const { login } = useAuth();

  const handleGoogleLogin = useCallback(async (response) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || 'Google login failed';
        if (onError) {
          onError(errorMessage);
        }
        return;
      }

      // Store token via auth context
      login(data.token, data.user);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data);
      }

      // Redirect to original page if provided
      const redirectPath = typeof router.query.redirect === 'string'
        ? router.query.redirect
        : '/';
      router.push(redirectPath);
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      console.error('Google login error:', err);
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [router, login, onSuccess, onError]);

  useEffect(() => {
    // Check if Google SDK is loaded
    if (!window.google) {
      console.error('Google SDK not loaded');
      return;
    }

    // Initialize Google One Tap
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });

    // Render button if the button container exists
    const buttonElement = document.getElementById(buttonId);
    if (buttonElement) {
      window.google.accounts.id.renderButton(buttonElement, buttonConfig);
    }

    // Show One Tap prompt if enabled
    if (showPrompt) {
      window.google.accounts.id.prompt();
    }
  }, [buttonId, buttonConfig, showPrompt, handleGoogleLogin]);
}
