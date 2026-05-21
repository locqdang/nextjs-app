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
  status: 'inactive',
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

function formatConnectionTime(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString();
}

export default function HaroProfileClient() {
  const { user } = useAuth();

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [profileEmail, setProfileEmail] = useState('');
  const [exists, setExists] = useState(false);
  const [allowedExpertise, setAllowedExpertise] = useState<string[]>([
    ...DEFAULT_ALLOWED_EXPERTISE,
  ]);
  const [mailbox, setMailbox] = useState<MailboxState>({ status: 'disconnected' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectingMailbox, setConnectingMailbox] = useState(false);
  const [disconnectingMailbox, setDisconnectingMailbox] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const userEmail = useMemo(() => getUserEmail(user), [user]);
  const fallbackName = useMemo(() => getUserNameParts(user), [user]);
  const connectedAtLabel = useMemo(
    () => formatConnectionTime(mailbox.connectedAt),
    [mailbox.connectedAt]
  );

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
      const nextMessage =
        caughtError instanceof Error ? caughtError.message : 'Something went wrong';
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
        expertise: existsInForm
          ? prev.expertise.filter((item) => item !== value)
          : [...prev.expertise, value],
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

      const data = (await response.json().catch(() => null)) as {
        message?: string;
        url?: string;
      } | null;

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
    return <main className="haro-profile haro-profile--loading">Loading HARO profile...</main>;
  }

  return (
    <main className="haro-profile">
      <section className="haro-profile__hero">
        <p className="haro-profile__eyebrow">HARO Workspace</p>
        <h1>Profile</h1>
        <p className="haro-profile__intro">
          Manage your expert profile and Gmail mailbox connection in one place.
        </p>
      </section>

      {error !== '' && (
        <div className="haro-profile__state haro-profile__state--error" role="alert">
          {error}
        </div>
      )}

      {message !== '' && (
        <div className="haro-profile__state haro-profile__state--success">{message}</div>
      )}

      {!exists && (
        <div className="haro-profile__state haro-profile__state--warning">
          No HARO profile exists yet for your email. Fill out the form below to create one.
        </div>
      )}

      <section className="haro-profile__grid">
        <article className="haro-profile__panel haro-profile__panel--mailbox">
          <div className="haro-profile__panel-header">
            <div>
              <p className="haro-profile__kicker">Mail delivery</p>
              <h2>Mailbox connection</h2>
            </div>
            <span
              className={`haro-profile__badge ${
                mailbox.status === 'connected'
                  ? 'haro-profile__badge--connected'
                  : 'haro-profile__badge--disconnected'
              }`}
            >
              {mailbox.status === 'connected' ? 'Connected' : 'Not connected'}
            </span>
          </div>

          {mailbox.status === 'connected' ? (
            <>
              <dl className="haro-profile__details">
                <div>
                  <dt>Connected Gmail</dt>
                  <dd>{mailbox.connectedEmail || 'Unknown account'}</dd>
                </div>
                {connectedAtLabel ? (
                  <div>
                    <dt>Connected at</dt>
                    <dd>{connectedAtLabel}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="haro-profile__actions">
                <button
                  type="button"
                  onClick={connectGmail}
                  disabled={connectingMailbox}
                  className="btn"
                >
                  {connectingMailbox ? 'Opening Google...' : 'Reconnect Gmail'}
                </button>
                <button
                  type="button"
                  onClick={disconnectGmail}
                  disabled={disconnectingMailbox}
                  className="btn btn--ghost haro-profile__danger-button"
                >
                  {disconnectingMailbox ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="haro-profile__muted">
                No Gmail mailbox is connected yet. Connect one so HARO workflows can send from the
                right account.
              </p>
              <div className="haro-profile__actions">
                <button
                  type="button"
                  onClick={connectGmail}
                  disabled={connectingMailbox}
                  className="btn"
                >
                  {connectingMailbox ? 'Opening Google...' : 'Connect Gmail'}
                </button>
              </div>
            </>
          )}
        </article>

        <article className="haro-profile__panel haro-profile__panel--summary">
          <div className="haro-profile__panel-header">
            <div>
              <p className="haro-profile__kicker">Account</p>
              <h2>Profile summary</h2>
            </div>
          </div>

          <dl className="haro-profile__details">
            <div>
              <dt>Signed-in email</dt>
              <dd>{profileEmail || userEmail || 'Not available'}</dd>
            </div>
            <div>
              <dt>Record status</dt>
              <dd>{exists ? 'Existing profile' : 'New profile draft'}</dd>
            </div>
            <div>
              <dt>Expertise tags</dt>
              <dd>
                {form.expertise.length > 0
                  ? `${form.expertise.length} selected`
                  : 'None selected yet'}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <form onSubmit={saveProfile} className="haro-profile__panel haro-profile__form">
        <div className="haro-profile__panel-header">
          <div>
            <p className="haro-profile__kicker">Expert profile</p>
            <h2>{exists ? 'Edit profile' : 'Create profile'}</h2>
            <p className="haro-profile__muted">
              Email is locked to the signed-in account, and expertise can only be selected from
              approved database values.
            </p>
          </div>
        </div>

        <div className="haro-profile__fields">
          <Field
            label="First name"
            value={form.firstName}
            onChange={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
          />
          <Field
            label="Last name"
            value={form.lastName}
            onChange={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
          />
          <Field
            label="Email"
            value={profileEmail}
            readOnly
            helperText="Controlled by your signed-in account and cannot be changed here."
          />
          <Field
            label="Job title"
            value={form.jobTitle}
            onChange={(value) => setForm((prev) => ({ ...prev, jobTitle: value }))}
          />
          <Field
            label="Company"
            value={form.company}
            onChange={(value) => setForm((prev) => ({ ...prev, company: value }))}
          />
          <Field
            label="Company niche"
            value={form.companyNiche}
            onChange={(value) => setForm((prev) => ({ ...prev, companyNiche: value }))}
          />
          <Field
            label="Company website"
            value={form.website}
            onChange={(value) => setForm((prev) => ({ ...prev, website: value }))}
          />
          <Field
            label="LinkedIn URL"
            value={form.linkedinUrl}
            onChange={(value) => setForm((prev) => ({ ...prev, linkedinUrl: value }))}
          />
          <Field
            label="Headshot URL"
            value={form.headshotUrl}
            onChange={(value) => setForm((prev) => ({ ...prev, headshotUrl: value }))}
          />
          <Field
            label="Status"
            value={form.status}
            readOnly
            helperText="Status is managed elsewhere and cannot be edited on this page."
          />
        </div>

        <div className="haro-profile__field-group">
          <div className="haro-profile__field-heading">
            <h3>Expertise</h3>
            <p>Only existing expertise values from the database can be selected.</p>
          </div>
          <div className="haro-profile__expertise-grid">
            {allowedExpertise.map((item) => {
              const checked = form.expertise.includes(item);
              return (
                <label
                  key={item}
                  className={`haro-profile__expertise-option ${checked ? 'haro-profile__expertise-option--checked' : ''}`}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleExpertise(item)} />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <label className="haro-profile__field-group">
          <div className="haro-profile__field-heading">
            <h3>Experience / Bio</h3>
          </div>
          <textarea
            value={form.bio}
            onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
            className="haro-profile__textarea"
          />
        </label>

        <label className="haro-profile__field-group">
          <div className="haro-profile__field-heading">
            <h3>Signature</h3>
          </div>
          <textarea
            value={form.signature}
            onChange={(event) => setForm((prev) => ({ ...prev, signature: event.target.value }))}
            className="haro-profile__textarea haro-profile__textarea--signature"
          />
        </label>

        <div className="haro-profile__actions">
          <button type="submit" disabled={saving} className="btn">
            {saving ? 'Saving...' : exists ? 'Save changes' : 'Create profile'}
          </button>
        </div>
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
    <label className="haro-profile__field">
      <span className="haro-profile__field-label">{label}</span>
      <input
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="haro-profile__input"
      />
      {helperText ? <span className="haro-profile__helper">{helperText}</span> : null}
    </label>
  );
}
