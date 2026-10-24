# Legal texts: what is still open

Version 1.1 of the privacy policy (DS) and the terms of use (NB) is published (October 2026,
`docs/legal/<locale>/`, migration `20261024120000_legal_documents_v1_1`). German is the binding
version; `en`, `pt-PT` and `pt-BR` are translations, and Korean users see English.

The texts are not legal advice. A lawyer should review them, above all the health data, body
photos and AI parts.

## Accepted risks (owner's decision)

1. **PostHog without consent.** The SDK stores an id on the device and sends events without an
   opt-in. § 25(1) TDDDG requires consent for that in Germany; DS §4.13 names Art. 6(1)(f) GDPR and
   the right to object. Fix: an opt-in prompt before the SDK starts, or a mode without device
   storage.
2. **Body data consent without a checkbox.** The line above "Create account" (`createAccount.terms`)
   states the explicit consent (DS §4.4). A separate checkbox would be the safer form of explicit
   consent (Art. 9(2)(a) GDPR).
3. **Progress check consent without its own step.** One line above the camera's "Done"
   (`camera.consent`) names OpenAI and the USA; DS §4.6 and §8 rely on it, also for Art. 49(1)(a)
   GDPR.

## Before launch

4. **DPAs.** Sign one with every processor: Supabase (dashboard), OpenAI (DPA form), RevenueCat,
   PostHog, PowerSync (email dpo@powersync.com). DS §8 relies on the SCCs in them.
5. **Imprint on useloqqa.com** (§ 5 DDG) and in the store listings. NB §1 covers the app. The site
   also needs the terms and privacy policy for the store listings and Google's consent screen.
6. **Data protection officer.** DS §2 says none is required. If a DPIA is required (health data,
   body photos, AI), § 38 BDSG requires one; check with the lawyer.

## Manual processes the texts promise

7. Withdrawing the body data consent (DS §12): delete `weight_kg`/`height_cm` and the weight entries
   on request.
8. Data export within one month as JSON (DS §11).
9. Deleting PostHog persons and RevenueCat customers on request (DS §10, §4.13).
10. Deleting progress-check photos left in storage after an offline delete (DS §4.6).
11. Deleting closed support tickets on request (DS §4.8).

## Keep in sync with the app

12. **Backups.** DS §9 says there are none (Supabase Free). Upgrading to Pro adds daily backups
    kept 7 days: update DS §9 then.
13. **Minimum ages** per country (`src/features/onboarding/lib/minimum-age.ts`) match DS §16 and
    NB §2. Spain and Norway have pending bills to raise theirs.
14. **Brazil:** the ECA Digital (Law 15.211/2025, in force since 17 March 2026) asks apps likely used
    by minors for real age checks; a self-declared birth date may not be enough there.
15. **Support reply time.** The chat says "24–48 hours"; NB §9 calls it a guideline.
16. Every change to the app's data flows (new service, new data sent to OpenAI or PostHog) needs a
    new version of DS: `node scripts/legal-migration.mjs <version> <date> <name>`.
