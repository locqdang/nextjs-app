import LoginClient from './login-client';

type LoginPageProps = {
  searchParams?: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) || {};
  return <LoginClient redirectPath={params.redirect || '/'} />;
}
