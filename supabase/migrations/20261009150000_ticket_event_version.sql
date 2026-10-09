-- The app turns a version into a localized line ("Erscheint mit Update 1.4.3", "Coming in
-- update 1.4.3"), so the team doesn't have to write notes in each user's language.
-- `note` stays for rare custom text and is shown exactly as written.
alter table public.ticket_events add column version text;
