import { useCallback, useEffect, useReducer, useRef } from 'react';

import { fetchPosts } from '@/api/posts';
import { readFeedCache, saveFeedCache } from '@/cache/feedCache';
import type { DistrictId } from '@/constants/districts';
import type { FeedCursor, FeedFilter, FeedPage, Post } from '@/types/post';

/**
 * initial  = first load (or district/filter changed): clear the list, show a spinner
 * refresh  = pull-to-refresh: keep the list visible while page 1 reloads
 * more     = infinite scroll: append the next page
 */
type LoadMode = 'initial' | 'refresh' | 'more';

export type FeedStatus = 'loading' | 'refreshing' | 'loadingMore' | 'idle' | 'error';

export interface FeedState {
  posts: Post[];
  nextCursor: FeedCursor | null;
  status: FeedStatus;
  /** Loading the *next* page failed; the posts already shown stay. */
  loadMoreFailed: boolean;
  /** The network failed and `posts` is the saved snapshot from `savedAt`. */
  isOffline: boolean;
  savedAt: string | null;
}

type FeedAction =
  | { type: 'request'; mode: LoadMode }
  | { type: 'success'; page: FeedPage; append: boolean }
  | { type: 'offline'; posts: Post[]; savedAt: string }
  | { type: 'failure' }
  | { type: 'loadMoreFailure' };

export const initialFeedState: FeedState = {
  posts: [],
  nextCursor: null,
  status: 'loading',
  loadMoreFailed: false,
  isOffline: false,
  savedAt: null,
};

// A reducer keeps every state transition in one pure, testable function
// instead of several useState calls that can drift out of sync.
export function feedReducer(state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case 'request':
      if (action.mode === 'initial') return initialFeedState;
      if (action.mode === 'refresh') return { ...state, status: 'refreshing', loadMoreFailed: false };
      return { ...state, status: 'loadingMore', loadMoreFailed: false };
    case 'success':
      return {
        posts: action.append ? [...state.posts, ...action.page.posts] : action.page.posts,
        nextCursor: action.page.nextCursor,
        status: 'idle',
        loadMoreFailed: false,
        isOffline: false,
        savedAt: null,
      };
    case 'offline':
      // No cursor: we can't page further without the network.
      return {
        posts: action.posts,
        nextCursor: null,
        status: 'idle',
        loadMoreFailed: false,
        isOffline: true,
        savedAt: action.savedAt,
      };
    case 'failure':
      return { ...state, status: 'error' };
    case 'loadMoreFailure':
      return { ...state, status: 'idle', loadMoreFailed: true };
  }
}

/**
 * Loads the feed for a district + filter with pagination, pull-to-refresh and an
 * offline fallback. Strategy: network first; on success save page 1 to the cache;
 * on failure show the last saved page 1 with an offline banner.
 */
export function useFeed(district: DistrictId, filter: FeedFilter) {
  const [state, dispatch] = useReducer(feedReducer, initialFeedState);

  // Every request gets a number. When a response arrives, we ignore it unless
  // it belongs to the latest request, so a slow "News" response can't overwrite
  // the "All" list the user switched to in the meantime.
  const latestRequestId = useRef(0);
  // A ref (not state) because FlatList can fire onEndReached several times
  // before React re-renders with status 'loadingMore'.
  const isFetching = useRef(false);

  const load = useCallback(
    async (mode: LoadMode, cursor: FeedCursor | null = null) => {
      const requestId = ++latestRequestId.current;
      const isLatest = () => requestId === latestRequestId.current;
      isFetching.current = true;
      dispatch({ type: 'request', mode });

      try {
        const page = await fetchPosts({ district, filter, cursor });
        if (!isLatest()) return;
        dispatch({ type: 'success', page, append: mode === 'more' });
        if (mode !== 'more') saveFeedCache(district, filter, page.posts);
      } catch {
        if (!isLatest()) return;
        if (mode === 'more') {
          dispatch({ type: 'loadMoreFailure' });
          return;
        }
        const cached = await readFeedCache(district, filter);
        if (!isLatest()) return;
        dispatch(cached ? { type: 'offline', posts: cached.posts, savedAt: cached.savedAt } : { type: 'failure' });
      } finally {
        if (isLatest()) isFetching.current = false;
      }
    },
    [district, filter],
  );

  // Runs on mount and whenever district or filter changes (because `load` changes).
  useEffect(() => {
    load('initial');
  }, [load]);

  const refresh = useCallback(() => load('refresh'), [load]);
  const retry = useCallback(() => load('initial'), [load]);

  const { nextCursor } = state;
  const loadMore = useCallback(() => {
    if (isFetching.current || !nextCursor) return;
    load('more', nextCursor);
  }, [load, nextCursor]);

  return { ...state, refresh, retry, loadMore };
}
