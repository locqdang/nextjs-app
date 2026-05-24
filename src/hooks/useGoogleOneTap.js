'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { usePathname, useRouter } from 'next/navigation';

export function renderGoogleLoginButton() {
  // Skip rendering until Google Identity script is available on window.
  if (!window.google) {
    return false;
  }

  // Render into the dedicated login button container when present.
  const el = document.getElementById('google-signin-button');
  if (!el) {
    return false;
  }

  // Clear previous renders to avoid duplicate buttons after route changes.
  el.innerHTML = '';
  window.google.accounts.id.renderButton(el, {
    theme: 'outline',
    size: 'large',
  });
  return true;
}

export function useGoogleOneTap(googleReady) {
  const { user, login, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const oneTapInitialized = useRef(false);

  // Initialize One Tap once after Google script loads and user is unauthenticated.
  useEffect(() => {
    // Guard against initializing too early or more than once.
    if (!googleReady || user || loading || !window.google || oneTapInitialized.current) {
      return;
    }

    // Exchange Google credential with backend to create our app session.
    const handleGoogleLogin = async (response) => {
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error('Google login error:', data?.error || 'Unknown error');
          return;
        }

        // Persist session client-side, then continue to intended destination.
        login(data.token, data.user);
        const redirectPath =
          new URLSearchParams(window.location.search).get('redirect') ||
          window.location.pathname ||
          '/';
        router.push(redirectPath);
      } catch (err) {
        console.error('Google login error:', err);
      }
    };

    // Register Google client + callback for credential responses.
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });
    // Remember initialization so we do not re-register callbacks on rerender.
    oneTapInitialized.current = true;
  }, [googleReady, user, loading, login, router]);

  useEffect(() => {
    // Only prompt when One Tap is ready and no user session exists yet.
    if (!googleReady || user || loading || !window.google || !oneTapInitialized.current) {
      return;
    }

    // Re-prompt on route changes so eligible pages can show One Tap.
    window.google.accounts.id.prompt();
  }, [googleReady, user, loading, pathname]);
}
