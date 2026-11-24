import { createClassified, fetchPostById, fetchPosts, PAGE_SIZE } from '@/api/posts';

// A fake Supabase query builder: every method call is recorded and returns the
// builder again (so chaining works), and awaiting it resolves to `mockResult`.
const mockCalls: [string, unknown[]][] = [];
let mockResult: { data: unknown; error: { message: string } | null } = { data: [], error: null };
const mockBuilder: Record<string, unknown> = new Proxy(
  {},
  {
    get: (_target, method: string) =>
      method === 'then'
        ? (resolve: (value: unknown) => void) => resolve(mockResult)
        : (...args: unknown[]) => {
            mockCalls.push([method, args]);
            return mockBuilder;
          },
  },
);
jest.mock('@/lib/supabase', () => ({ supabase: { from: () => mockBuilder } }));

const called = (method: string) => mockCalls.filter(([name]) => name === method).map(([, args]) => args);

function row(n: number) {
  return {
    id: `00000000-0000-4000-8000-0000000000${String(n).padStart(2, '0')}`,
    type: 'classified',
    district: 'hyderabad',
    title: `Post ${n}`,
    body: 'Body',
    price: 100,
    image_url: null,
    author_name: 'Ravi',
    created_at: `2026-11-24T10:${String(59 - n).padStart(2, '0')}:00.123456+00:00`,
  };
}

beforeEach(() => {
  mockCalls.length = 0;
  mockResult = { data: [], error: null };
});

describe('fetchPosts', () => {
  it('asks for one more row than a page, newest first, without a type filter for "All"', async () => {
    await fetchPosts({ district: 'hyderabad', filter: 'all' });

    expect(called('eq')).toEqual([['district', 'hyderabad']]);
    expect(called('order')).toEqual([
      ['created_at', { ascending: false }],
      ['id', { ascending: false }],
    ]);
    expect(called('limit')).toEqual([[PAGE_SIZE + 1]]);
    expect(called('or')).toEqual([]); // first page: no cursor
  });

  it('maps snake_case rows to Post objects and reports no next page when the extra row is missing', async () => {
    mockResult = { data: [row(1)], error: null };

    const page = await fetchPosts({ district: 'hyderabad', filter: 'all' });

    expect(page.posts[0]).toEqual({
      id: row(1).id,
      type: 'classified',
      district: 'hyderabad',
      title: 'Post 1',
      body: 'Body',
      price: 100,
      imageUrl: null,
      authorName: 'Ravi',
      createdAt: row(1).created_at,
    });
    expect(page.nextCursor).toBeNull();
  });

  it('returns a full page and a cursor at its last post when the extra row comes back', async () => {
    mockResult = { data: Array.from({ length: PAGE_SIZE + 1 }, (_, i) => row(i + 1)), error: null };

    const page = await fetchPosts({ district: 'hyderabad', filter: 'all' });

    expect(page.posts).toHaveLength(PAGE_SIZE);
    expect(page.nextCursor).toEqual({ createdAt: row(PAGE_SIZE).created_at, id: row(PAGE_SIZE).id });
  });

  it('filters by type and continues strictly after the cursor', async () => {
    const cursor = { createdAt: '2026-11-24T10:00:00.123456+00:00', id: row(5).id };

    await fetchPosts({ district: 'vijayawada', filter: 'news', cursor });

    expect(called('eq')).toEqual([
      ['district', 'vijayawada'],
      ['type', 'news'],
    ]);
    expect(called('lte')).toEqual([['created_at', cursor.createdAt]]);
    expect(called('or')).toEqual([
      [`created_at.lt."${cursor.createdAt}",and(created_at.eq."${cursor.createdAt}",id.lt."${cursor.id}")`],
    ]);
  });

  it('throws when Supabase returns an error', async () => {
    mockResult = { data: null, error: { message: 'permission denied' } };
    await expect(fetchPosts({ district: 'hyderabad', filter: 'all' })).rejects.toThrow('permission denied');
  });
});

describe('fetchPostById', () => {
  it('returns null for an id that is not a UUID without querying', async () => {
    expect(await fetchPostById('not-a-uuid')).toBeNull();
    expect(mockCalls).toEqual([]);
  });

  it('returns null when the post does not exist', async () => {
    mockResult = { data: null, error: null };
    expect(await fetchPostById(row(1).id)).toBeNull();
  });
});

describe('createClassified', () => {
  it('inserts a classified in snake_case and returns the saved post', async () => {
    mockResult = { data: row(3), error: null };

    const saved = await createClassified({
      district: 'hyderabad',
      title: 'Post 3',
      body: 'Body',
      price: 100,
      imageUrl: null,
      authorName: 'Ravi',
    });

    expect(called('insert')).toEqual([
      [
        {
          type: 'classified',
          district: 'hyderabad',
          title: 'Post 3',
          body: 'Body',
          price: 100,
          image_url: null,
          author_name: 'Ravi',
        },
      ],
    ]);
    expect(saved.id).toBe(row(3).id);
  });
});
