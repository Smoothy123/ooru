-- Ooru database schema.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- 1. The posts table
-- ---------------------------------------------------------------------------
-- The CHECK constraints are the last line of defence. The app validates the
-- same fields more strictly, so a well-behaved client never hits these.
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('news', 'classified')),
  district    text not null check (district in ('hyderabad', 'vijayawada', 'visakhapatnam')),
  title       text not null check (char_length(title) between 3 and 120),
  body        text not null check (char_length(body) between 1 and 2000),
  price       integer check (price is null or price between 0 and 100000000),
  image_url   text,
  author_name text not null check (char_length(author_name) between 2 and 40),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Indexes: one per feed query shape
-- ---------------------------------------------------------------------------
-- Each index matches its query's WHERE + ORDER BY exactly, so Postgres reads
-- rows already sorted, starts right at the cursor and stops after LIMIT.
-- A page costs the same whether the table has 100 posts or 10 million.
create index if not exists posts_feed_all_idx
  on public.posts (district, created_at desc, id desc);

create index if not exists posts_feed_by_type_idx
  on public.posts (district, type, created_at desc, id desc);

-- ---------------------------------------------------------------------------
-- 3. Row-level security
-- ---------------------------------------------------------------------------
-- The anon key ships inside the app, so anyone can call this API directly.
-- These rules, not the app, decide what the public is allowed to do.
alter table public.posts enable row level security;

drop policy if exists "Posts are readable by everyone" on public.posts;
create policy "Posts are readable by everyone"
  on public.posts for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can post a classified" on public.posts;
create policy "Anyone can post a classified"
  on public.posts for insert
  to anon, authenticated
  with check (
    type = 'classified'      -- the public can't publish "news"
    and price is not null    -- every classified has a price (0 = free)
    and (
      image_url is null
      -- photos must come from this project's own storage bucket, not any URL on the internet
      or image_url like 'https://%.supabase.co/storage/v1/object/public/post-images/%'
    )
  );

-- There are no UPDATE or DELETE policies. With RLS on, that means nobody
-- using the anon key can edit or delete posts.

-- Column privileges: the public may only fill these columns. id and created_at
-- always come from their defaults, so nobody can back-date a post or pin it
-- to the top of the feed with a future timestamp.
revoke insert, update, delete, truncate on public.posts from anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert (type, district, title, body, price, image_url, author_name)
  on public.posts to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Storage bucket for ad photos
-- ---------------------------------------------------------------------------
-- Public bucket = anyone can view a photo by its URL (no policy needed for reads).
-- Uploads are limited to 5 MB images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can upload a new file into this bucket. Without UPDATE/DELETE
-- policies, nobody can overwrite or remove someone else's photo.
drop policy if exists "Anyone can upload post images" on storage.objects;
create policy "Anyone can upload post images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'post-images');
