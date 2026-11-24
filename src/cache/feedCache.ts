import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DistrictId } from '@/constants/districts';
import type { FeedFilter, Post } from '@/types/post';

// Bump the version whenever the Post shape changes: old entries are then simply
// ignored instead of feeding the UI data in the wrong shape.
const CACHE_VERSION = 1;
const KEY_PREFIX = `ooru:feed:v${CACHE_VERSION}:`;

export interface CachedFeed {
  posts: Post[];
  /** ISO time the snapshot was taken, shown in the offline banner. */
  savedAt: string;
}

const cacheKey = (district: DistrictId, filter: FeedFilter) => `${KEY_PREFIX}${district}:${filter}`;

/**
 * Saves the first page of a feed. One small snapshot per district + filter (at most
 * 9 keys of ~10 posts each), so storage never grows without bound.
 * Best effort: if saving fails, the app still works; it just has nothing to show offline.
 */
export async function saveFeedCache(district: DistrictId, filter: FeedFilter, posts: Post[]): Promise<void> {
  const entry: CachedFeed = { posts, savedAt: new Date().toISOString() };
  try {
    await AsyncStorage.setItem(cacheKey(district, filter), JSON.stringify(entry));
  } catch {
    // ignore
  }
}

function parseEntry(raw: string | null): CachedFeed | null {
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as Partial<CachedFeed>;
    return Array.isArray(entry.posts) && typeof entry.savedAt === 'string'
      ? { posts: entry.posts, savedAt: entry.savedAt }
      : null;
  } catch {
    return null; // corrupted entry
  }
}

export async function readFeedCache(district: DistrictId, filter: FeedFilter): Promise<CachedFeed | null> {
  try {
    return parseEntry(await AsyncStorage.getItem(cacheKey(district, filter)));
  } catch {
    return null;
  }
}

/** For the detail screen when offline: look for the post in every saved feed. */
export async function findCachedPost(id: string): Promise<Post | null> {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(KEY_PREFIX));
    const entries = await AsyncStorage.multiGet(keys);
    for (const [, raw] of entries) {
      const post = parseEntry(raw)?.posts.find((candidate) => candidate.id === id);
      if (post) return post;
    }
  } catch {
    // fall through
  }
  return null;
}
