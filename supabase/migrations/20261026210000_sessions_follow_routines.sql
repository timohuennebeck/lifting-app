-- A plan has a workout a week per routine. Adding or removing a routine on Training (or adding
-- one in the plan editor of a plan whose count had drifted) left `sessions_per_week` as it was;
-- the app now keeps it at the number of routines (2 to 6), and plans changed so far follow again.
-- Plans without routines keep theirs.
update public.plans p
set sessions_per_week = least(greatest(r.routines, 2), 6)
from (
  select plan_id, count(*)::int as routines
  from public.routines
  where plan_id is not null
  group by plan_id
) r
where r.plan_id = p.id
  and p.sessions_per_week <> least(greatest(r.routines, 2), 6);
