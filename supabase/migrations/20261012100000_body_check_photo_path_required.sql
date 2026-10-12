-- The analysis uploads a check's photos before the check is saved, so every photo row has its
-- storage path.
alter table public.body_check_photos alter column storage_path set not null;
