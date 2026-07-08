import LoginClient from './login-client';
import { normalizeRedirectPath } from '../../lib/security';

type LoginPageProps = {
  searchParams?: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Read optional post-login redirect target and default to home.
  const params = (await searchParams) || {};
  return <LoginClient redirectPath={normalizeRedirectPath(params.redirect)} />;
}
