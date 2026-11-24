import type { DistrictId } from '@/constants/districts';

export type PostType = 'news' | 'classified';

/** What the feed's filter tabs can select. */
export type FeedFilter = 'all' | PostType;

/**
 * A post as the app uses it (camelCase). The API layer converts the
 * database's snake_case rows into this shape, so screens never see the DB format.
 */
export interface Post {
  id: string;
  type: PostType;
  district: DistrictId;
  title: string;
  body: string;
  /** Whole rupees. 0 means free; null means no price (news). */
  price: number | null;
  imageUrl: string | null;
  authorName: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

/** Points at the last post of a page. The next page starts strictly after it. */
export interface FeedCursor {
  createdAt: string;
  id: string;
}

export interface FeedPage {
  posts: Post[];
  /** null means there are no more pages. */
  nextCursor: FeedCursor | null;
}
