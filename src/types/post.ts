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

/** A photo picked from the camera or gallery, before upload. */
export interface PickedPhoto {
  /** Local file:// URI on the device. */
  uri: string;
  mimeType: string;
  fileSize?: number;
}

/** What the create screen sends to the API. The server fills in id and createdAt. */
export interface NewClassified {
  district: DistrictId;
  title: string;
  body: string;
  price: number;
  imageUrl: string | null;
  authorName: string;
}

export interface FeedPage {
  posts: Post[];
  /** null means there are no more pages. */
  nextCursor: FeedCursor | null;
}
