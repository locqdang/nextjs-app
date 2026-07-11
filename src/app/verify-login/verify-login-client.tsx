'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

type VerifyLoginClientProps = {
  token: string | null;
  redirectPath: string;
};

export default function VerifyLoginClient({ token, redirectPath }: VerifyLoginClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.error);
          return;
        }

        setStatus('success');
        setMessage('Login successful. Redirecting...');
        login(null, data.user);

        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Verification failed');
      }
    };

    void verifyToken();
  }, [login, redirectPath, router, token]);

  return (
    <div className="py-12 text-center">
      <h1>Logging in...</h1>
      {status !== '' && <p>{status}</p>}
      {message !== '' && <p>{message}</p>}
    </div>
  );
}
