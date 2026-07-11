import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('../../lib/data/haro', () => ({
  findOne: vi.fn(),
  findMany: vi.fn(),
  countDocuments: vi.fn(),
  insertOne: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock('../../lib/data/mongodb', () => ({
  findOne: vi.fn(),
}));

import {
  countDocuments,
  findMany,
  findOne as findHaroOne,
  updateOne,
} from '../../lib/data/haro';
import { findOne as findAuthUser } from '../../lib/data/mongodb';

async function loadHandlers() {
  vi.resetModules();
  return {
    authSessionHandler: (await import('../../pages/api/auth/session')).default,
    authLogoutHandler: (await import('../../pages/api/auth/logout')).default,
    haroProfileHandler: (await import('../../pages/api/haro/profile')).default,
    haroPitchesHandler: (await import('../../pages/api/haro/pitches')).default,
  };
}

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function createSessionCookie(user) {
  const token = jwt.sign(
    {
      id: user._id?.toString?.() || user.id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: '604800s' }
  );

  return `vp_session=${encodeURIComponent(token)}`;
}

describe('security API integration', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.AUTH_COOKIE_NAME = 'vp_session';
    vi.clearAllMocks();
  });

  it('reads auth session from HttpOnly cookie without bearer fallback', async () => {
    const { authSessionHandler } = await loadHandlers();
    const cookie = createSessionCookie({
      id: 'user-123',
      email: 'person@example.com',
      name: 'Person',
    });

    const req = { method: 'GET', headers: { cookie } };
    const res = createMockRes();

    authSessionHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      authenticated: true,
      user: {
        id: 'user-123',
        email: 'person@example.com',
        name: 'Person',
      },
    });
    expect(res.headers['Cache-Control']).toBe('no-store, no-cache, must-revalidate');
    expect(res.headers.Pragma).toBe('no-cache');
  });

  it('clears the session cookie on logout', async () => {
    const { authLogoutHandler } = await loadHandlers();
    const req = { method: 'POST', headers: {} };
    const res = createMockRes();

    authLogoutHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(res.headers['Set-Cookie']).toContain('vp_session=');
    expect(res.headers['Set-Cookie']).toContain('HttpOnly');
    expect(res.headers['Set-Cookie']).toContain('Max-Age=0');
    expect(res.headers['Set-Cookie']).toContain('SameSite=Lax');
  });

  it('rejects HARO profile access without a cookie-backed session', async () => {
    const { haroProfileHandler } = await loadHandlers();
    const req = { method: 'GET', headers: {} };
    const res = createMockRes();

    await haroProfileHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Missing token' });
    expect(res.headers['Cache-Control']).toBe('no-store, no-cache, must-revalidate');
    expect(findHaroOne).not.toHaveBeenCalled();
  });

  it('returns the signed-in user HARO profile from the session cookie', async () => {
    const { haroProfileHandler } = await loadHandlers();
    const cookie = createSessionCookie({
      id: 'user-1',
      email: 'writer@example.com',
      name: 'Writer',
    });

    findHaroOne
      .mockResolvedValueOnce({
        expert_email: 'writer@example.com',
        expert_f_name: 'Writer',
        expert_l_name: 'Example',
        expert_company: 'Vietpolyglots',
        expert_company_niche: 'Education',
        expert_company_website: 'https://vietpolyglots.com',
        expert_job_title: 'Founder',
        expert_experience: '<script>alert(1)</script>',
        expert_expertise: ['SEO', 'SEO', 'Nope'],
        expert_linkedin_url: 'https://linkedin.com/in/writer',
        expert_headshot_url: 'https://example.com/headshot.jpg',
        expert_signature: '<img src=x onerror=alert(1)>',
        expert_status: 'active',
      })
      .mockResolvedValueOnce({
        owner_email: 'writer@example.com',
        provider: 'google',
        status: 'connected',
        connected_email: 'mailbox@example.com',
        connected_at: '2026-07-07T00:00:00.000Z',
      });

    const req = { method: 'GET', headers: { cookie } };
    const res = createMockRes();

    await haroProfileHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.profile).toMatchObject({
      firstName: 'Writer',
      email: 'writer@example.com',
      bio: '<script>alert(1)</script>',
      signature: '<img src=x onerror=alert(1)>',
      expertise: ['SEO'],
      status: 'active',
    });
    expect(res.body.mailbox).toMatchObject({
      status: 'connected',
      connectedEmail: 'mailbox@example.com',
    });
    expect(res.body.allowedExpertise).toContain('SEO');
  });

  it('returns only the signed-in user pitches and keeps the response non-cacheable', async () => {
    const { haroPitchesHandler } = await loadHandlers();
    const cookie = createSessionCookie({
      id: 'user-2',
      email: 'expert@example.com',
      name: 'Expert',
    });

    findAuthUser.mockResolvedValue({
      email: 'expert@example.com',
      role: 'user',
    });

    findHaroOne.mockResolvedValue({
      _id: { toString: () => 'profile-123' },
      expert_email: 'expert@example.com',
      expert_signature: '<svg/onload=alert(1)>',
      createdAt: new Date('2026-07-07T00:00:00.000Z'),
      updatedAt: new Date('2026-07-07T00:00:00.000Z'),
    });

    findMany
      .mockResolvedValueOnce([{ query_id: 'query-1' }])
      .mockResolvedValueOnce([{ _id: 'query-1', query_source: 'haro' }])
      .mockResolvedValueOnce([
        {
          profile_id: 'profile-123',
          query_id: 'query-1',
          pitch_time: '2026-07-07T12:00:00.000Z',
          proposed_pitch: '<script>alert(1)</script>',
        },
      ]);

    countDocuments.mockResolvedValue(1);

    const req = {
      method: 'GET',
      headers: { cookie },
      query: { page: '1', limit: '10', source: '' },
    };
    const res = createMockRes();

    await haroPitchesHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers['Cache-Control']).toBe('no-store, no-cache, must-revalidate');
    expect(res.body.success).toBe(true);
    expect(res.body.isAdmin).toBe(false);
    expect(res.body.sources).toEqual(['haro']);
    expect(res.body.pitches).toHaveLength(1);
    expect(res.body.pitches[0]).toMatchObject({
      profile_id: 'profile-123',
      proposed_pitch: '<script>alert(1)</script>',
      expert_signature: '<svg/onload=alert(1)>',
      isAdminView: false,
    });
    expect(countDocuments).toHaveBeenCalledWith(
      'matches',
      expect.objectContaining({ profile_id: 'profile-123' })
    );
    expect(updateOne).not.toHaveBeenCalled();
  });
});
