import { fetchSearchPullRequests, fetchSearchCommits, fetchSearchIssues } from '../search-api';

const mockFetch = (data: any, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: async () => data,
  });
};

const mockFetchRejection = () => {
  global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('fetchSearchPullRequests', () => {
  test('Search APIからPRを取得できる', async () => {
    const items = [{ title: 'Test PR', number: 1, state: 'open' }];
    mockFetch({ total_count: 1, incomplete_results: false, items });

    const result = await fetchSearchPullRequests('testuser', '2024-01-01');
    expect(result).toEqual(items);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/search/issues?q=author:testuser+type:pr+created:>2024-01-01'),
    );
  });

  test('APIエラー時は空配列を返す', async () => {
    mockFetch({}, false);

    const result = await fetchSearchPullRequests('testuser', '2024-01-01');
    expect(result).toEqual([]);
  });

  test('fetchが例外を投げても空配列を返す', async () => {
    mockFetchRejection();

    await expect(fetchSearchPullRequests('testuser', '2024-01-01')).resolves.toEqual([]);
  });
});

describe('fetchSearchCommits', () => {
  test('Search APIからCommitを取得できる', async () => {
    const items = [{ sha: 'abc123', commit: { message: 'test' } }];
    mockFetch({ total_count: 1, incomplete_results: false, items });

    const result = await fetchSearchCommits('testuser', '2024-01-01');
    expect(result).toEqual(items);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/search/commits?q=author:testuser+author-date:>2024-01-01'),
    );
  });

  test('APIエラー時は空配列を返す', async () => {
    mockFetch({}, false);

    const result = await fetchSearchCommits('testuser', '2024-01-01');
    expect(result).toEqual([]);
  });

  test('fetchが例外を投げても空配列を返す', async () => {
    mockFetchRejection();

    await expect(fetchSearchCommits('testuser', '2024-01-01')).resolves.toEqual([]);
  });
});

describe('fetchSearchIssues', () => {
  test('Search APIからIssueを取得できる', async () => {
    const items = [{ title: 'Test Issue', number: 1, state: 'open' }];
    mockFetch({ total_count: 1, incomplete_results: false, items });

    const result = await fetchSearchIssues('testuser', '2024-01-01');
    expect(result).toEqual(items);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/search/issues?q=author:testuser+type:issue+created:>2024-01-01'),
    );
  });

  test('APIエラー時は空配列を返す', async () => {
    mockFetch({}, false);

    const result = await fetchSearchIssues('testuser', '2024-01-01');
    expect(result).toEqual([]);
  });

  test('fetchが例外を投げても空配列を返す', async () => {
    mockFetchRejection();

    await expect(fetchSearchIssues('testuser', '2024-01-01')).resolves.toEqual([]);
  });
});
