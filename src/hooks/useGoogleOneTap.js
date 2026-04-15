import { useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';

export function useGoogleOneTap(googleReady) {
  const { user, login, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't show if user is already logged in or google SDK is not ready
    if (!googleReady || user || loading || !window.google) {
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
          console.error('Google login error:', err);
          return;
        }

        login(data.token, data.user);
        const redirectPath =
          typeof router.query.redirect === 'string' ? router.query.redirect : router.asPath;
        router.push(redirectPath);
      } catch (err) {
        console.error('Google login error:', err);
      }
    };

    const triggerOneTap = () => {
      // Initialize Google One Tap
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });
      console.log(`Google Login Initialized`);

      // Render Google SSO button
      const googleBtnId = 'google-signin-button'; // This is hardcoded
      const el = document.getElementById(googleBtnId);
      if (el) {
        window.google.accounts.id.renderButton(el, {
          theme: 'outline',
          size: 'large',
        });
      }

      // Show prompt
      window.google.accounts.id.prompt();
    };

    triggerOneTap();
  }, [googleReady, user, loading, router, login]);
}
