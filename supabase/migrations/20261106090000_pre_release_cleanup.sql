-- Drops columns nothing reads or writes: a plan's blocks always repeat from its first week
-- (`plans.block_start_week`), and the catalog has photos only (`exercises.video_path`).
-- The exercise-media bucket takes only the WebP photos and thumbnails it holds.
alter table public.plans drop column block_start_week;
alter table public.exercises drop column video_path;

update storage.buckets set allowed_mime_types = array['image/webp'] where id = 'exercise-media';
