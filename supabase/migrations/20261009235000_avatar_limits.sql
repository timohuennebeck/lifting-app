-- Profile photos are 512px JPEGs (well under 1 MB); the bucket takes nothing else.
update storage.buckets
set file_size_limit = 2097152, allowed_mime_types = array['image/jpeg']
where id = 'avatars';
