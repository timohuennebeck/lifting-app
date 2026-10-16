-- The split the user last made a plan with ("Welchen Split möchtest du?"), so the next plan starts
-- from it. Null until a plan was made from the answers.
alter table public.profiles
  add column split text
  constraint profiles_split_check
  check (split in ('full_body', 'upper_lower', 'ppl', 'ppl_upper_lower', 'bro', 'arnold'));
