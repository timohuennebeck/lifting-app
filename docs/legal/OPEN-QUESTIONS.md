# Legal texts: what is still open

Version 1.1 of the privacy policy (DS) and the terms of use (NB) is published (October 2026,
`docs/legal/<locale>/`, migration `20261024120000_legal_documents_v1_1`; Korean followed in
`20261025120100_legal_documents_v1_1_ko`). Version 1.2 of the privacy policy adds the device
info of support requests, the OpenAI translation of support messages and what the support desk
shows (`20261102120000_privacy_policy_v1_2`). Version 1.3 of the privacy policy and 1.2 of the
terms add the AI coach (5 November 2026, `20261105120000_privacy_policy_v1_3` and
`20261105120100_terms_v1_2`). DS 1.3 also covers voice
input: exercises said out loud (the operating system's speech recognition, then OpenAI matches
the text; DS §4.7) and questions to the coach said out loud (the recording goes to OpenAI to be
written down and isn't stored; DS §4.8), messages to support said out loud the same way (§4.9),
and it names the microphone among the permissions (§6), which 1.2 wrongly said the app doesn't ask
for. NB 1.2 also names Korean among its languages. Spanish and French come with DS 1.3 and NB 1.3;
NB 1.3 only adds them to its languages. Version 1.4 of both (5 November 2026, 18:00 UTC,
`20261105180000_legal_documents_v1_4`) describes the Sätze tab, the sets per muscle over a chosen
range, in place of the removed muscle levels (DS §4.3, §4.5 and §15, NB §4), without re-acceptance.
German is the binding version; `en`, `pt-PT`, `pt-BR`, `ko`, `es` and `fr` are translations.

The texts are not legal advice. A lawyer should review them, above all the health data, body
photos and AI parts.

## Accepted risks (owner's decision)

1. **PostHog without consent.** The SDK stores an id on the device and sends events without an
   opt-in. § 25(1) TDDDG requires consent for that in Germany; DS §4.14 names Art. 6(1)(f) GDPR and
   the right to object. Fix: an opt-in prompt before the SDK starts, or a mode without device
   storage.
2. **Body data consent without a checkbox.** The line above the sign-up buttons (`createAccount.terms`)
   states the explicit consent (DS §4.4). A separate checkbox would be the safer form of explicit
   consent (Art. 9(2)(a) GDPR).
3. **Progress check consent without its own step.** One line below the camera's "Done"
   (`camera.consent`) names OpenAI and the USA; DS §4.6 and §8 rely on it, also for Art. 49(1)(a)
   GDPR.
4. **Coach consent by signing up, without a notice in the app.** The first release has no notice
   before the first question and no switch in Settings. DS §4.4 says that creating the account and
   accepting the policy is the consent to the coach sending training and body data to OpenAI in
   the USA, and DS §4.8 and §8 rely on it, also for Art. 49(1)(a) GDPR. The sentence above the
   sign-up button names this (item 27). TestFlight accounts from earlier builds saw a sentence
   that only named body data for tailoring the training, and keep the consent they gave by signing
   up. `profiles.coach_consent_at` is set at sign-up, and for an account without it, with its first
   question (the app always sends `consent: true`). Whether this is an explicit, informed consent
   is for the lawyer; a notice in the app or a separate confirmation step would be the safer form.

## Before launch

5. **DPAs.** Sign one with every processor: Supabase (dashboard), OpenAI (DPA form), RevenueCat,
   PostHog, PowerSync (email dpo@powersync.com). DS §8 relies on the SCCs in them.
6. **Imprint on useloqqa.com** (§ 5 DDG) and in the store listings. NB §1 covers the app. The site
   also needs the terms and privacy policy for the store listings and Google's consent screen.
7. **Data protection officer.** DS §2 says none is required. If a DPIA is required (health data,
   body photos, AI), § 38 BDSG requires one; check with the lawyer.
8. **Effective date of DS 1.4 and NB 1.4.** Done: both are published, in effect from 5 November
   2026 (18:00 UTC), before version 1.0 goes live. A pushed migration takes effect at once (the app
   shows the version with the latest `effective_at` that has passed), and its rows can't be
   changed. The app orders by `effective_at`, not by version number, so a new version needs a later
   one than the last: NB 1.3 is in effect from 12:00 UTC that day.
9. **Coach from 16 (for the lawyer).** The coach sends health data (weight entries, body check
   scores) to OpenAI in the USA on the user's own consent from 16, also where the minimum age is
   lower (DS §4.8, §16; NB §2); the body check stays 18+. Check whether a 16-year-old's own consent
   is enough for that, under Art. 9(2)(a) and Art. 49(1)(a) GDPR. Also check that chats may stay
   after the consent is withdrawn until the user deletes them (DS §12).
10. **Voice questions and the coach consent (for the lawyer).** The recording of a spoken question
    goes to OpenAI to be written down without `coach-transcribe` looking at the coach consent. DS
    §4.8 bases that on Art. 6(1)(b) GDPR, as the user starts it. A spoken question can hold health
    data ("I weigh 82 kg"): check whether that needs the consent too (Art. 9(2)(a), Art.
    49(1)(a)), e.g. DS §4.4 naming spoken questions and coach-transcribe checking it, as
    coach-chat does.

## Manual processes the texts promise

11. Withdrawing the body data consent (DS §12): delete `height_cm` and the weight entries on
    request.
12. Data export within one month as JSON (DS §11).
13. Deleting PostHog persons and RevenueCat customers on request (DS §10, §4.14).
14. Deleting progress-check photos left in storage after an offline delete (DS §4.6).
15. Deleting closed support tickets on request (DS §4.9).
16. Withdrawing the coach consent (DS §12): the request comes by email, as the app has no switch.
    Clear `profiles.coach_consent_at` and delete the chats if asked to. A new question sets it
    again (the app always sends `consent: true`), which DS §12 tells the user; nothing stops the
    question. Also deleting coach chats on request at any other time.

## Keep in sync with the app

17. **Backups.** DS §9 says there are none (Supabase Free). Upgrading to Pro adds daily backups
    kept 7 days: update DS §9 then.
18. **Minimum ages** per country (`src/features/onboarding/lib/minimum-age.ts`) match DS §16 and
    NB §2, as do the coach's 16 (`coach-chat`) and the body check's 18 (`assess-progress`). Spain
    and Norway have pending bills to raise theirs.
19. **Brazil:** the ECA Digital (Law 15.211/2025, in force since 17 March 2026) asks apps likely used
    by minors for real age checks; a self-declared birth date may not be enough there.
20. **Support reply time.** The chat says "24–48 hours"; NB §9 calls it a guideline.
21. **Coach screens.** The app has no notice above the first question and no switch in Settings:
    DS §4.4 and §12 describe consent at sign-up and withdrawal by email. If either comes back, or
    the sign-up sentence changes, change the texts with it. With the notice gone, nothing in the
    coach's screens names OpenAI: check with the lawyer that its name shows the coach is an AI
    (Art. 50(1) AI Act), and that it can't be taken for the paywall's head coach: the coach is called
    "Kai · KI-Coach" everywhere (card, screen, Settings, DS §4.8, NB), and Kai is also the head
    coach's first name (Kai Brooks, `paywall.json`). Asked, the coach says it is an AI. DS §4.8 and NB §4
    also name the limits (`COACH_DAILY_LIMIT`, `COACH_MONTHLY_LIMIT`) and what goes to OpenAI
    (`supabase/functions/_shared/coach/prompt.ts` and `tools.ts`).
22. **Coach logs.** `coach_runs` keeps time, status, model, tokens and duration until the account
    is deleted, also after its chat is deleted (DS §4.8, §9). The limits only need the last 30
    days: decide how long the cost overview needs them, delete older rows and update DS §9.
23. Every change to the app's data flows (new service, new data sent to OpenAI or PostHog) needs a
    new version of DS: `node scripts/legal-migration.mjs <version> <date> <name>`.

## Korean

24. **Review.** The Korean 1.1 was translated from the English one and has not been read by a native
    speaker or a lawyer; neither have the coach parts of DS 1.3 and NB 1.2.
25. **Korean law.** The texts follow the GDPR. Korea's PIPA has its own rules for privacy policies
    (for example a named privacy officer and details of transfers abroad); check whether they apply
    to users in Korea.
26. **Website.** Done: useloqqa.com/ko shows the Korean texts.

## First release

27. **Name the coach in the sign-up sentence.** Done: `auth.json` in every language ends: "…to
    tailor your training, and to Kai, the AI coach, sending your training and body data to OpenAI
    in the USA." That makes what DS §4.4 says visible at the moment of the consent (item 4). The
    owner took version 1.0 out of review on 5 November 2026 to ship this and Spanish and French in
    the first release, so it reaches every account made with the App Store version.

## Spanish and French

28. **Review.** The Spanish and French DS 1.3 and NB 1.3 were translated from the English and
    checked by AI against the German. Neither has been read by a native speaker or a lawyer.
29. **Local law.** The texts follow German law and the GDPR, and name German as the binding version.
    Whether that holds for consumers in France and Spain, and whether local rules need anything
    further, is for the lawyer.
