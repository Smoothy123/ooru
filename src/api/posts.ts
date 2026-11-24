// The ONLY module screens call to get posts. Phase 1 serves mock data with the
// exact signatures the Supabase version will have, so swapping the backend
// later doesn't touch any screen.
import type { DistrictId } from '@/constants/districts';
import { MOCK_POSTS } from '@/mocks/posts';
import type { FeedCursor, FeedFilter, FeedPage, Post } from '@/types/post';

export const PAGE_SIZE = 10;

export interface FetchPostsParams {
  district: DistrictId;
  filter: FeedFilter;
  cursor?: FeedCursor | null;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Newest first; id breaks ties so the order is always stable. */
function compareNewestFirst(a: Post, b: Post): number {
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
  return a.id < b.id ? 1 : -1;
}

function isOlderThanCursor(post: Post, cursor: FeedCursor): boolean {
  return post.createdAt < cursor.createdAt || (post.createdAt === cursor.createdAt && post.id < cursor.id);
}

export async function fetchPosts({ district, filter, cursor = null }: FetchPostsParams): Promise<FeedPage> {
  await delay(400);
  const matching = MOCK_POSTS.filter(
    (post) =>
      post.district === district &&
      (filter === 'all' || post.type === filter) &&
      (!cursor || isOlderThanCursor(post, cursor)),
  ).sort(compareNewestFirst);

  const posts = matching.slice(0, PAGE_SIZE);
  const last = posts[posts.length - 1];
  const hasMore = matching.length > PAGE_SIZE;
  return { posts, nextCursor: hasMore && last ? { createdAt: last.createdAt, id: last.id } : null };
}

export async function fetchPostById(id: string): Promise<Post | null> {
  await delay(200);
  return MOCK_POSTS.find((post) => post.id === id) ?? null;
}
