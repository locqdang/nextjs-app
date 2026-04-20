import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from './data';
import { findMany, fetchStrapiEntries } from '../../lib/data/index.js';

vi.mock('../../lib/data/index.js', () => ({
  findMany: vi.fn(),
  fetchStrapiEntries: vi.fn(),
}));

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

describe('GET /api/data integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns combined Strapi and Mongo data', async () => {
    const strapiPosts = [{ id: 1, title: 'Hello from Strapi' }];
    const mongoItems = [{ _id: 'abc123', name: 'Mongo item' }];

    fetchStrapiEntries.mockResolvedValue(strapiPosts);
    findMany.mockResolvedValue(mongoItems);

    const req = { method: 'GET' };
    const res = createMockRes();

    await handler(req, res);

    expect(fetchStrapiEntries).toHaveBeenCalledWith('posts', {
      populate: '*',
      pagination: { pageSize: 5 },
    });
    expect(findMany).toHaveBeenCalledWith('items', {}, { limit: 10 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: {
        strapiPosts,
        mongoItems,
      },
    });
  });
});
