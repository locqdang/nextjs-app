import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchHomepage } from './homepage';

describe('fetchHomepage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed JSON when the Strapi request succeeds', async () => {
    const mockJson = { data: { id: 1, title: 'Home' } };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockJson),
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchHomepage();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = fetchMock.mock.calls[0];
    expect(calledUrl).toContain('/api/homepage');
    expect(calledUrl).toContain('populate%5Bhero%5D%5Bpopulate%5D=*');
    expect(calledOptions.method).toBe('GET');
    expect(result).toEqual(mockJson);
  });

  it('returns null when the Strapi request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    vi.stubGlobal('fetch', fetchMock);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await fetchHomepage();

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
