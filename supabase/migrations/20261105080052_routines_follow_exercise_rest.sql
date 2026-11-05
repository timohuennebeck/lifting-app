-- A routine exercise's rest_seconds is the user's own choice; without one the app gives the
-- exercise's catalog rest, longer for heavy sets. Generated plans and the coach's workouts no
-- longer store one, so this clears every stored rest: those already saved follow the catalog too.
-- A rest set by hand can't be told apart and is cleared as well.
update public.routine_exercises set rest_seconds = null where rest_seconds is not null;
