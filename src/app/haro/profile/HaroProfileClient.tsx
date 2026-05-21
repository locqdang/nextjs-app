'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../lib/auth';

type ProfileForm = {
  firstName: string;
  lastName: string;
  company: string;
  companyNiche: string;
  website: string;
  jobTitle: string;
  bio: string;
  expertise: string[];
  linkedinUrl: string;
  headshotUrl: string;
  signature: string;
  status: 'active' | 'inactive';
};

type ProfileResponse = ProfileForm & {
  email: string;
};

type ProfileApiResponse = {
  profile?: ProfileResponse | null;
  mailbox?: MailboxState | null;
  message?: string;
  allowedExpertise?: string[];
};

type MailboxState = {
  status: 'connected' | 'disconnected';
  connectedEmail?: string;
  connectedAt?: string;
};

const EMPTY_FORM: ProfileForm = {
  firstName: '',
  lastName: '',
  company: '',
  companyNiche: '',
  website: '',
  jobTitle: '',
  bio: '',
  expertise: [],
  linkedinUrl: '',
  headshotUrl: '',
  signature: '',
  status: 'active',
};

const DEFAULT_ALLOWED_EXPERTISE = [
  'Analytics',
  'Advertising',
  'Artificial Intelligence / Data / Tech',
  'B2B',
  'Content Marketing',
  'CRO',
  'Customer Support + Experience',
  'DTC',
  'Ecommerce',
  'Education',
  'Email',
  'Entrepreneurship',
  'Finance',
  'HR',
  'Insurance',
  'Legal',
  'Logistics',
  'Management + Operations',
  'Marketing (General)',
  'Media: Photography + Videography',
  'Retail',
  'SaaS',
  'Sales',
  'SEO',
  'Social Media',
  'Engineering / Manufacturing',
] as const;

function getStringProperty(user: unknown, key: 'name' | 'email'): string {
  if (!user || typeof user !== 'object' || !(key in user)) {
    return '';
  }

  const value = user[key];
  return typeof value === 'string' ? value : '';
}

function splitDisplayName(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }

  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
}

function getUserNameParts(user: unknown) {
  return splitDisplayName(getStringProperty(user, 'name'));
}

function getUserEmail(user: unknown): string {
  return getStringProperty(user, 'email').trim().toLowerCase();
}

export default function HaroProfileClient() {
  const { user } = useAuth();

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [profileEmail, setProfileEmail] = useState('');
  const [exists, setExists] = useState(false);
  const [allowedExpertise, setAllowedExpertise] = useState<string[]>([...DEFAULT_ALLOWED_EXPERTISE]);
  const [mailbox, setMailbox] = useState<MailboxState>({ status: 'disconnected' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectingMailbox, setConnectingMailbox] = useState(false);
  const [disconnectingMailbox, setDisconnectingMailbox] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const userEmail = useMemo(() => getUserEmail(user), [user]);
  const fallbackName = useMemo(() => getUserNameParts(user), [user]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (!userEmail) {
        setExists(false);
        setMailbox({ status: 'disconnected' });
        setProfileEmail('');
        setForm({
          ...EMPTY_FORM,
          firstName: fallbackName.firstName,
          lastName: fallbackName.lastName,
        });
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/haro/profile', {
        cache: 'no-store',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = (await response.json().catch(() => null)) as ProfileApiResponse | null;

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load HARO profile');
      }

      if (Array.isArray(data?.allowedExpertise) && data.allowedExpertise.length > 0) {
        setAllowedExpertise(data.allowedExpertise);
      }

      setExists(Boolean(data?.profile));
      setProfileEmail(data?.profile?.email || userEmail);
      setForm({
        ...EMPTY_FORM,
        firstName: data?.profile?.firstName || fallbackName.firstName,
        lastName: data?.profile?.lastName || fallbackName.lastName,
        company: data?.profile?.company || '',
        companyNiche: data?.profile?.companyNiche || '',
        website: data?.profile?.website || '',
        jobTitle: data?.profile?.jobTitle || '',
        bio: data?.profile?.bio || '',
        expertise: Array.isArray(data?.profile?.expertise) ? data.profile.expertise : [],
        linkedinUrl: data?.profile?.linkedinUrl || '',
        headshotUrl: data?.profile?.headshotUrl || '',
        signature: data?.profile?.signature || '',
        status: data?.profile?.status === 'inactive' ? 'inactive' : 'active',
      });

      setMailbox(data?.mailbox || { status: 'disconnected' });
    } catch (caughtError: unknown) {
      const nextMessage = caughtError instanceof Error ? caughtError.message : 'Something went wrong';
      setError(nextMessage);
      setExists(false);
      setMailbox({ status: 'disconnected' });
    } finally {
      setLoading(false);
    }
  }, [fallbackName.firstName, fallbackName.lastName, userEmail]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function toggleExpertise(value: string) {
    setForm((prev) => {
      const existsInForm = prev.expertise.includes(value);
      return {
        ...prev,
        expertise: existsInForm ? prev.expertise.filter((item) => item !== value) : [...prev.expertise, value],
      };
    });
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/haro/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json().catch(() => null)) as ProfileApiResponse | null;

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to save profile');
      }

      if (Array.isArray(data?.allowedExpertise) && data.allowedExpertise.length > 0) {
        setAllowedExpertise(data.allowedExpertise);
      }

      setExists(true);
      setProfileEmail(data?.profile?.email || userEmail);
      if (data?.profile) {
        setForm({
          firstName: data.profile.firstName || '',
          lastName: data.profile.lastName || '',
          company: data.profile.company || '',
          companyNiche: data.profile.companyNiche || '',
          website: data.profile.website || '',
          jobTitle: data.profile.jobTitle || '',
          bio: data.profile.bio || '',
          expertise: Array.isArray(data.profile.expertise) ? data.profile.expertise : [],
          linkedinUrl: data.profile.linkedinUrl || '',
          headshotUrl: data.profile.headshotUrl || '',
          signature: data.profile.signature || '',
          status: data.profile.status === 'inactive' ? 'inactive' : 'active',
        });
      }
      setMailbox(data?.mailbox || { status: 'disconnected' });
      setMessage(data?.message || 'Profile saved successfully.');
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function connectGmail() {
    setConnectingMailbox(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/haro/mailbox/google/start', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = (await response.json().catch(() => null)) as { message?: string; url?: string } | null;

      if (!response.ok || !data?.url) {
        throw new Error(data?.message || 'Failed to start Gmail connection');
      }

      window.location.href = data.url;
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : 'Something went wrong');
      setConnectingMailbox(false);
    }
  }

  async function disconnectGmail() {
    setDisconnectingMailbox(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/haro/mailbox/disconnect', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to disconnect mailbox');
      }

      setMailbox({ status: 'disconnected' });
      setMessage(data?.message || 'Mailbox disconnected.');
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : 'Something went wrong');
    } finally {
      setDisconnectingMailbox(false);
    }
  }

  if (loading) {
    return <main className="p-8">Loading HARO profile...</main>;
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-wide text-gray-500">HARO</p>
        <h1 className="text-3xl font-semibold">Profile</h1>
        <p className="mt-2 text-gray-600">Manage your expert profile and Gmail mailbox connection in one place.</p>
      </header>

      {error !== '' && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {message !== '' && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>
      )}

      {!exists && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          No HARO profile exists yet for your email. Fill out the form below to create one.
        </div>
      )}

      <section className="mb-8 rounded-xl border p-5">
        <h2 className="mb-3 text-xl font-medium">Mailbox connection</h2>

        {mailbox.status === 'connected' ? (
          <div>
            <p className="text-green-700">Connected as {mailbox.connectedEmail}</p>
            {mailbox.connectedAt && (
              <p className="text-sm text-gray-500">Connected at {new Date(mailbox.connectedAt).toLocaleString()}</p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={connectGmail}
                disabled={connectingMailbox}
                className="rounded-lg border px-4 py-2 disabled:opacity-60"
              >
                {connectingMailbox ? 'Opening Google...' : 'Reconnect Gmail'}
              </button>

              <button
                type="button"
                onClick={disconnectGmail}
                disabled={disconnectingMailbox}
                className="rounded-lg border border-red-300 px-4 py-2 text-red-700 disabled:opacity-60"
              >
                {disconnectingMailbox ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600">No Gmail mailbox is connected yet.</p>
            <button
              type="button"
              onClick={connectGmail}
              disabled={connectingMailbox}
              className="mt-4 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
            >
              {connectingMailbox ? 'Opening Google...' : 'Connect Gmail'}
            </button>
          </div>
        )}
      </section>

      <form onSubmit={saveProfile} className="space-y-6 rounded-xl border p-5">
        <div>
          <h2 className="text-xl font-medium">Expert profile</h2>
          <p className="mt-1 text-sm text-gray-500">Email is locked to the signed-in account, and expertise can only be selected from approved database values.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="First name" value={form.firstName} onChange={(value) => setForm((prev) => ({ ...prev, firstName: value }))} />
          <Field label="Last name" value={form.lastName} onChange={(value) => setForm((prev) => ({ ...prev, lastName: value }))} />
          <Field label="Email" value={profileEmail} readOnly helperText="Controlled by your signed-in account and cannot be changed here." />
          <Field label="Job title" value={form.jobTitle} onChange={(value) => setForm((prev) => ({ ...prev, jobTitle: value }))} />
          <Field label="Company" value={form.company} onChange={(value) => setForm((prev) => ({ ...prev, company: value }))} />
          <Field label="Company niche" value={form.companyNiche} onChange={(value) => setForm((prev) => ({ ...prev, companyNiche: value }))} />
          <Field label="Company website" value={form.website} onChange={(value) => setForm((prev) => ({ ...prev, website: value }))} />
          <Field label="LinkedIn URL" value={form.linkedinUrl} onChange={(value) => setForm((prev) => ({ ...prev, linkedinUrl: value }))} />
          <Field label="Headshot URL" value={form.headshotUrl} onChange={(value) => setForm((prev) => ({ ...prev, headshotUrl: value }))} />
          <Field
            label="Status"
            value={form.status}
            readOnly
            helperText="Status is managed elsewhere and cannot be edited on this page."
          />
        </div>

        <div>
          <div className="mb-1 block text-sm font-medium">Expertise</div>
          <div className="rounded-lg border p-4">
            <p className="mb-3 text-xs text-gray-500">Only existing expertise values from the database can be selected.</p>
            <div className="grid gap-2 md:grid-cols-2">
              {allowedExpertise.map((item) => {
                const checked = form.expertise.includes(item);
                return (
                  <label key={item} className="flex items-start gap-3 rounded-md border p-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleExpertise(item)}
                      className="mt-1"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Experience / Bio</span>
          <textarea
            value={form.bio}
            onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
            className="min-h-40 w-full rounded-lg border p-3"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Signature</span>
          <textarea
            value={form.signature}
            onChange={(event) => setForm((prev) => ({ ...prev, signature: event.target.value }))}
            className="min-h-32 w-full rounded-lg border p-3"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-black px-5 py-2 text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : exists ? 'Save changes' : 'Create profile'}
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly = false,
  helperText,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  helperText?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="w-full rounded-lg border p-3 read-only:bg-gray-50 read-only:text-gray-500"
      />
      {helperText ? <span className="mt-1 block text-xs text-gray-500">{helperText}</span> : null}
    </label>
  );
}
