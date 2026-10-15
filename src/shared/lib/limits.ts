// Longest texts the app lets people type, one value per kind wherever it is entered or renamed.
// The database checks the same limits (supabase/migrations), and the fields show how much is left.

/** First name: onboarding and the profile. */
export const FIRST_NAME_MAX = 24;
/** The description on the profile ("Über dich"). */
export const BIO_MAX = 150;
/** A plan: creating, renaming, the import review. The plan import cuts to it too. */
export const PLAN_NAME_MAX = 30;
/** A routine: creating, renaming, its title. */
export const ROUTINE_NAME_MAX = 40;
/** A custom exercise's name. */
export const CUSTOM_EXERCISE_NAME_MAX = 60;
/** A support message; a ticket's subject is its first line, cut to TICKET_SUBJECT_MAX. */
export const TICKET_MESSAGE_MAX = 5000;
export const TICKET_SUBJECT_MAX = 120;
