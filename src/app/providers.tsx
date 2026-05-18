'use client';

import type { ReactNode } from 'react';
import { AuthProvider, RequireAuth } from '../lib/auth';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <RequireAuth>{children}</RequireAuth>
    </AuthProvider>
  );
}
