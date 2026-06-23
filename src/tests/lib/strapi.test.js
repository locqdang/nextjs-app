import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFromStrapi } from '../../lib/data/strapi';

describe('fetchFromStrapi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('supports raw nested Strapi query params', async () => {
    const mockJson = { data: { id: 1, title: 'Home' } };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockJson),
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchFromStrapi('homepage', {
      queryParams: {
        'populate[hero][populate]': '*',
        'populate[project0][populate]': '*',
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = fetchMock.mock.calls[0];
    expect(calledUrl).toContain('/api/homepage');
    expect(calledUrl).toContain('populate%5Bhero%5D%5Bpopulate%5D=*');
    expect(calledUrl).toContain('populate%5Bproject0%5D%5Bpopulate%5D=*');
    expect(calledOptions.method).toBe('GET');
    expect(result).toEqual(mockJson);
  });

  it('throws when the Strapi request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchFromStrapi('homepage')).rejects.toThrow(
      'Strapi API error: 500 Internal Server Error'
    );
  });
});
