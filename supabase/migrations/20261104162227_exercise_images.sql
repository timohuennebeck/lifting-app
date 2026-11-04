-- Every exercise gets its photo; its thumbnail sits next to it in the bucket, with `-thumb` added
-- to the name. Devices keep the images they have downloaded, so a replaced image gets the next
-- version in its name and a new path here.
update public.exercises set image_path = 'exercises/' || id || '-v1.webp';
