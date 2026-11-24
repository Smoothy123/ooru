import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { hyderabadBike, hyderabadFlat, hyderabadNews } from '../test-utils/helpers';

import { fetchPosts } from '@/api/posts';
import { readFeedCache, saveFeedCache } from '@/cache/feedCache';
import { useFeed } from '@/hooks/useFeed';
import type { FeedFilter, FeedPage } from '@/types/post';

jest.mock('@/api/posts', () => ({ fetchPosts: jest.fn() }));
const mockFetchPosts = jest.mocked(fetchPosts);

const cursor = { createdAt: hyderabadBike.createdAt, id: hyderabadBike.id };

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('useFeed', () => {
  it('loads page 1, then appends page 2 using the cursor', async () => {
    mockFetchPosts
      .mockResolvedValueOnce({ posts: [hyderabadNews, hyderabadBike], nextCursor: cursor })
      .mockResolvedValueOnce({ posts: [hyderabadFlat], nextCursor: null });

    const { result } = await renderHook(() => useFeed('hyderabad', 'all'));
    await waitFor(() => expect(result.current.status).toBe('idle'));
    expect(result.current.posts).toEqual([hyderabadNews, hyderabadBike]);

    await act(async () => result.current.loadMore());

    expect(mockFetchPosts).toHaveBeenLastCalledWith({ district: 'hyderabad', filter: 'all', cursor });
    expect(result.current.posts).toEqual([hyderabadNews, hyderabadBike, hyderabadFlat]);
    expect(result.current.nextCursor).toBeNull();
  });

  it('requests the next page only once even if FlatList fires onEndReached twice', async () => {
    mockFetchPosts
      .mockResolvedValueOnce({ posts: [hyderabadNews], nextCursor: cursor })
      .mockResolvedValue({ posts: [hyderabadFlat], nextCursor: null });

    const { result } = await renderHook(() => useFeed('hyderabad', 'all'));
    await waitFor(() => expect(result.current.status).toBe('idle'));

    await act(async () => {
      result.current.loadMore();
      result.current.loadMore();
    });

    expect(mockFetchPosts).toHaveBeenCalledTimes(2); // page 1 + page 2, no duplicate
  });

  it('ignores a slow response from a filter the user already left', async () => {
    let resolveAllRequest: (page: FeedPage) => void = () => {};
    mockFetchPosts
      .mockImplementationOnce(() => new Promise<FeedPage>((resolve) => (resolveAllRequest = resolve)))
      .mockResolvedValueOnce({ posts: [hyderabadNews], nextCursor: null });

    const { result, rerender } = await renderHook(
      ({ filter }: { filter: FeedFilter }) => useFeed('hyderabad', filter),
      {
        initialProps: { filter: 'all' },
      },
    );
    await rerender({ filter: 'news' });
    await waitFor(() => expect(result.current.posts).toEqual([hyderabadNews]));

    // The old "All" request finishes late: it must not replace the News list.
    await act(async () => resolveAllRequest({ posts: [hyderabadBike], nextCursor: null }));
    expect(result.current.posts).toEqual([hyderabadNews]);
  });

  it('saves page 1 for offline use after a successful load', async () => {
    mockFetchPosts.mockResolvedValue({ posts: [hyderabadNews], nextCursor: null });

    const { result } = await renderHook(() => useFeed('hyderabad', 'news'));
    await waitFor(() => expect(result.current.status).toBe('idle'));

    expect((await readFeedCache('hyderabad', 'news'))?.posts).toEqual([hyderabadNews]);
  });

  it('falls back to the saved feed when the network fails', async () => {
    await saveFeedCache('hyderabad', 'all', [hyderabadBike]);
    mockFetchPosts.mockRejectedValue(new Error('Network request failed'));

    const { result } = await renderHook(() => useFeed('hyderabad', 'all'));
    await waitFor(() => expect(result.current.isOffline).toBe(true));

    expect(result.current.posts).toEqual([hyderabadBike]);
    expect(result.current.savedAt).toEqual(expect.any(String));
    expect(result.current.nextCursor).toBeNull(); // no paging while offline
  });

  it('reports an error when the network fails and nothing is saved', async () => {
    mockFetchPosts.mockRejectedValue(new Error('Network request failed'));

    const { result } = await renderHook(() => useFeed('vijayawada', 'all'));
    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.isOffline).toBe(false);
    expect(result.current.posts).toEqual([]);
  });

  it('keeps the posts on screen when only "load more" fails', async () => {
    mockFetchPosts
      .mockResolvedValueOnce({ posts: [hyderabadNews], nextCursor: cursor })
      .mockRejectedValueOnce(new Error('timeout'));

    const { result } = await renderHook(() => useFeed('hyderabad', 'all'));
    await waitFor(() => expect(result.current.status).toBe('idle'));
    await act(async () => result.current.loadMore());

    expect(result.current.posts).toEqual([hyderabadNews]);
    expect(result.current.loadMoreFailed).toBe(true);
  });
});
