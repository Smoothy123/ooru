// The ONLY module that talks to Supabase. Screens and hooks call these typed
// functions and get plain `Post` objects back; they never see the database shape.
import type { DistrictId } from '@/constants/districts';
import { supabase } from '@/lib/supabase';
import type { FeedCursor, FeedFilter, FeedPage, Post, PostType } from '@/types/post';

export const PAGE_SIZE = 10;

const POST_COLUMNS = 'id, type, district, title, body, price, image_url, author_name, created_at';

/** A row exactly as Postgres stores it (snake_case). */
interface PostRow {
  id: string;
  type: PostType;
  district: DistrictId;
  title: string;
  body: string;
  price: number | null;
  image_url: string | null;
  author_name: string;
  created_at: string;
}

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    type: row.type,
    district: row.district,
    title: row.title,
    body: row.body,
    price: row.price,
    imageUrl: row.image_url,
    authorName: row.author_name,
    createdAt: row.created_at,
  };
}

export interface FetchPostsParams {
  district: DistrictId;
  filter: FeedFilter;
  cursor?: FeedCursor | null;
}

/**
 * One page of the feed, newest first, using keyset ("cursor") pagination:
 * instead of "skip 40 rows" we ask for "rows older than the last one I showed".
 * That stays fast at millions of rows (the index jumps straight there) and never
 * duplicates or skips posts when new ones are added while the user scrolls.
 */
export async function fetchPosts({ district, filter, cursor = null }: FetchPostsParams): Promise<FeedPage> {
  let query = supabase.from('posts').select(POST_COLUMNS).eq('district', district);

  if (filter !== 'all') {
    query = query.eq('type', filter);
  }

  if (cursor) {
    // We want (created_at, id) < (cursor.createdAt, cursor.id); the id breaks ties
    // between posts created in the same instant.
    // 1. `lte` lets Postgres jump straight to the cursor in the index (an "Index Cond").
    // 2. The `or` then drops the few rows at exactly that timestamp we've already shown.
    // Values are quoted because timestamps contain ':' and '.', which PostgREST would
    // otherwise read as syntax. The cursor keeps Postgres' original timestamp string
    // (microseconds), never a JS Date (milliseconds), so no precision is lost.
    query = query
      .lte('created_at', cursor.createdAt)
      .or(`created_at.lt."${cursor.createdAt}",and(created_at.eq."${cursor.createdAt}",id.lt."${cursor.id}")`);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    // Ask for one extra row: if it comes back, there is another page.
    .limit(PAGE_SIZE + 1);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as PostRow[];
  const posts = rows.slice(0, PAGE_SIZE).map(toPost);
  const last = posts[posts.length - 1];
  const hasMore = rows.length > PAGE_SIZE;

  return { posts, nextCursor: hasMore && last ? { createdAt: last.createdAt, id: last.id } : null };
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns null when the post doesn't exist (or the id isn't even a valid UUID). */
export async function fetchPostById(id: string): Promise<Post | null> {
  if (!UUID_PATTERN.test(id)) return null;

  const { data, error } = await supabase.from('posts').select(POST_COLUMNS).eq('id', id).maybeSingle();

  if (error) throw new Error(error.message);
  return data ? toPost(data as PostRow) : null;
}
