import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

// Read auth data once during initial state creation (client only).
function getStoredAuth() {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!storedToken || !storedUser) {
    return { token: null, user: null };
  }

  try {
    return { token: storedToken, user: JSON.parse(storedUser) };
  } catch {
    // Clear corrupted auth payloads to avoid JSON parse crashes on next load.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    getStoredAuth.user;
  });
  const [token, setToken] = useState(() => {
    getStoredAuth.token;
  });

  // No async bootstrapping now; values are ready at initial render.
  const loading = false;

  const login = (newToken, newUser) => {
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function RequireAuth({ children, privatePages = [] }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isPrivatePage = privatePages.includes(router.pathname);

  useEffect(() => {
    if (!loading && !user && isPrivatePage) {
      const redirect = encodeURIComponent(router.asPath || '/');
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [loading, user, router, isPrivatePage]);

  if (loading) {
    return null;
  }

  if (isPrivatePage && !user) {
    return null;
  }

  return children;
}
