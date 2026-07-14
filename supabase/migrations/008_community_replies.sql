-- 008_community_replies.sql — threaded replies for the community board.
-- Replies are community_posts rows pointing at their parent. One level of
-- nesting (replies to replies attach to the same parent client-side).
-- Idempotent / re-runnable.
alter table public.community_posts
  add column if not exists parent_post_id uuid references public.community_posts(id) on delete cascade;
create index if not exists community_posts_parent_idx on public.community_posts(parent_post_id);
