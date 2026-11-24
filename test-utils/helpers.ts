import { MOCK_POSTS } from '@/mocks/posts';
import type { FeedFilter, FeedPage } from '@/types/post';

/** A fake fetchPosts that filters the mock posts like the real query would. */
export async function fakeFetchPosts({
  district,
  filter,
}: {
  district: string;
  filter: FeedFilter;
}): Promise<FeedPage> {
  const posts = MOCK_POSTS.filter((post) => post.district === district && (filter === 'all' || post.type === filter));
  return { posts, nextCursor: null };
}

export const hyderabadNews = MOCK_POSTS[0]; // "Metro Red Line ..."
export const hyderabadBike = MOCK_POSTS[1]; // "Royal Enfield ..." ₹1,35,000
export const hyderabadFlat = MOCK_POSTS[2]; // Telugu classified
export const vijayawadaScooter = MOCK_POSTS[4]; // "Honda Activa ..."
