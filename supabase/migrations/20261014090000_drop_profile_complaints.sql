-- Onboarding no longer asks about complaints (sore knees, shoulders, …): they are health data
-- (Art. 9 GDPR), and the plan is made without them. Answers stored so far go with the column.
alter table public.profiles drop column complaints;
