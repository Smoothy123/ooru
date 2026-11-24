// The ONLY module that talks to Supabase. Screens and hooks call these typed
// functions and get plain `Post` objects back; they never see the database shape.
import type { DistrictId } from '@/constants/districts';
import { supabase } from '@/lib/supabase';
import type { FeedCursor, FeedFilter, FeedPage, NewClassified, PickedPhoto, Post, PostType } from '@/types/post';

export const PAGE_SIZE = 10;
const IMAGE_BUCKET = 'post-images';

// React Native's fetch never gives up on its own. Without a timeout, a phone on
// Wi-Fi with no internet would show a spinner forever instead of falling back
// to the offline cache. (Uploads get no timeout: big photos on 3G can be slow.)
const READ_TIMEOUT_MS = 10_000;

/** Runs a query that is cancelled after READ_TIMEOUT_MS; the timer is cleared as soon as it settles. */
async function withTimeout<T>(runQuery: (signal: AbortSignal) => PromiseLike<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), READ_TIMEOUT_MS);
  try {
    return await runQuery(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

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

  const { data, error } = await withTimeout((signal) =>
    query
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      // Ask for one extra row: if it comes back, there is another page.
      .limit(PAGE_SIZE + 1)
      .abortSignal(signal),
  );

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

  const { data, error } = await withTimeout((signal) =>
    supabase.from('posts').select(POST_COLUMNS).eq('id', id).abortSignal(signal).maybeSingle(),
  );

  if (error) throw new Error(error.message);
  return data ? toPost(data as PostRow) : null;
}

/**
 * Uploads a picked photo to Supabase Storage and returns its public URL.
 * fetch() can read a local file:// URI; we send the raw bytes, which is what
 * Supabase recommends for React Native.
 */
export async function uploadPostImage(photo: PickedPhoto): Promise<string> {
  const response = await fetch(photo.uri);
  const bytes = await response.arrayBuffer();

  const extension = photo.mimeType === 'image/png' ? 'png' : photo.mimeType === 'image/webp' ? 'webp' : 'jpg';
  // A unique name, so two people uploading "photo.jpg" never collide.
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, bytes, { contentType: photo.mimeType, upsert: false });
  if (error) throw new Error(error.message);

  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Inserts a classified and returns it as saved (with its server-generated id and time). */
export async function createClassified(input: NewClassified): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      type: 'classified',
      district: input.district,
      title: input.title,
      body: input.body,
      price: input.price,
      image_url: input.imageUrl,
      author_name: input.authorName,
    })
    .select(POST_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return toPost(data as PostRow);
}
