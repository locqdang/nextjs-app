'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { usePathname, useRouter } from 'next/navigation';

export function renderGoogleLoginButton() {
  if (!window.google) {
    return false;
  }

  const el = document.getElementById('google-signin-button');
  if (!el) {
    return false;
  }

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

  // Initialize Google Login
  useEffect(() => {
    if (!googleReady || user || loading || !window.google || oneTapInitialized.current) {
      return;
    }

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

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });
    oneTapInitialized.current = true;
  }, [googleReady, user, loading, login, router]);

  useEffect(() => {
    if (!googleReady || user || loading || !window.google || !oneTapInitialized.current) {
      return;
    }

    window.google.accounts.id.prompt();
  }, [googleReady, user, loading, pathname]);
}
