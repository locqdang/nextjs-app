import VerifyLoginClient from './verify-login-client';
import { normalizeRedirectPath } from '../../lib/security';

type VerifyLoginPageProps = {
  searchParams?: Promise<{ token?: string; redirect?: string }>;
};

export default async function VerifyLoginPage({ searchParams }: VerifyLoginPageProps) {
  // Normalize query params once, then pass plain values to client verifier.
  const params = (await searchParams) || {};

  return (
    <VerifyLoginClient
      token={params.token || null}
      redirectPath={normalizeRedirectPath(params.redirect)}
    />
  );
}
