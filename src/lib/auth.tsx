import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/router';

type User = Record<string, unknown>;

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (newToken: string, newUser: User) => void;
  logout: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

type RequireAuthProps = {
  children: ReactNode;
  privatePages?: string[];
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hydrate auth state from localStorage once on client mount.
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(storedToken);
      setUser(JSON.parse(storedUser) as User);
    }

    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Memoize context value to avoid unnecessary child re-renders.
  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export function RequireAuth({ children, privatePages = [] }: RequireAuthProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isPrivatePage = privatePages.includes(router.pathname);

  // Redirect anonymous users trying to open protected routes.
  useEffect(() => {
    if (!loading && !user && isPrivatePage) {
      const redirect = encodeURIComponent(router.asPath || '/');
      void router.replace(`/login?redirect=${redirect}`);
    }
  }, [loading, user, router, isPrivatePage]);

  if (loading) {
    return null;
  }

  if (isPrivatePage && !user) {
    return null;
  }

  return <>{children}</>;
}
