-- Body checks take three photos: front, side and back. A left-side photo becomes the side one;
-- right-side photos are dropped (their files stay in storage).
alter table public.body_check_photos drop constraint body_check_photos_pose_check;

delete from public.body_check_photos where pose = 'right';
update public.body_check_photos set pose = 'side' where pose = 'left';

alter table public.body_check_photos
  add constraint body_check_photos_pose_check check (pose in ('front', 'side', 'back'));
