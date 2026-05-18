import VerifyLoginClient from './verify-login-client';

type VerifyLoginPageProps = {
  searchParams?: Promise<{ token?: string; redirect?: string }>;
};

export default async function VerifyLoginPage({ searchParams }: VerifyLoginPageProps) {
  const params = (await searchParams) || {};

  return (
    <VerifyLoginClient token={params.token || null} redirectPath={params.redirect || '/'} />
  );
}
