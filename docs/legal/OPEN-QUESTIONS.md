# Open questions for the German legal drafts

This file lists everything the owner must supply or decide before `docs/legal/de/datenschutz.md` (DS) and `docs/legal/de/nutzungsbedingungen.md` (NB) can be published. Each item quotes the matching placeholder (if there is one) and says where it appears and why it matters.

The drafts are not legal advice. Have a lawyer review both documents before release.

Every placeholder must be resolved before publication. Beyond filling in facts, these items need a product or code change, or a firm decision, before the texts can be true and compliant (marked "blocker" below): 26, 29, 32, 33, 37, 38, 39, 47, 50, 56.

## A. Company and contacts

1. **Legal entity name and form.** Placeholder „Name des Unternehmens mit Rechtsform“ (DS §1, NB §1). Why: Art. 13(1)(a) GDPR requires the controller's identity and the terms need a contracting party. Do not derive it from the bundle id `com.horizonalpha.forge`.
2. **Postal address.** Placeholder „Straße, Hausnummer, PLZ, Ort, Land“ (DS §1, NB §1). Why: mandatory controller contact data; it also determines the competent supervisory authority (item 8).
3. **Legal representative(s).** Placeholder „Geschäftsführung bzw. vertretungsberechtigte Person“ (DS §1, NB §1). Why: identifies who acts for the controller/provider.
4. **Commercial register.** Placeholder „Registergericht und Registernummer, falls vorhanden“ (NB §1). Why: provider identification; also needed for the Impressum (item 9).
5. **Privacy contact email.** Placeholder „Kontakt-E-Mail für Datenschutzanfragen“ (DS §1, §10, §11, §12). Why: every data subject request (access, deletion, export, withdrawal) is routed to this address.
6. **General/support contact email.** Placeholder „Kontakt-E-Mail für allgemeine Anfragen und Support“ (NB §1, §13). Why: the terms offer it for contact and for account deletion requests; it may be the same as item 5.
7. **Data protection officer.** Placeholder „Name und Kontaktdaten des Datenschutzbeauftragten oder Hinweis, dass keiner benannt werden muss“ (DS §2). Why: § 38 BDSG requires a DPO from 20 people regularly processing personal data, or regardless of headcount when a DPIA is required (likely, see item 28).
8. **Competent supervisory authority.** Placeholder „Zuständige Datenschutz-Aufsichtsbehörde mit Anschrift und Website“ (DS §13). Why: Art. 13(2)(d) GDPR; depends on the federal state of the company's seat.
9. **Impressum (not drafted here).** No placeholder. Why: § 5 DDG requires provider identification that is easy to reach in the app and in the store listings; neither document replaces it.

## B. Document metadata

10. **Version and date.** Placeholders „Versionsnummer“ and „Datum“ (top of DS and NB). Why: the app also shows `legal_documents.version` and `effective_at` from the database (`legal.meta`), so the text and the row must match.
11. **Draft notice.** Placeholder „Diesen Entwurfshinweis vor der Veröffentlichung entfernen“ (top of DS and NB). Why: the quote marks the text as an unreviewed draft and must not ship.

## C. Hosting, processors and transfers

12. **Supabase production region.** Placeholder „Supabase-Region des Produktivprojekts“ (DS §7). Why: the repo only contains local development config (`supabase/config.toml`, `.env.example` on 127.0.0.1); the EU storage claim depends on it.
13. **Supabase contracting entity and DPA.** Placeholder „Vertragspartner und Anschrift von Supabase laut Auftragsverarbeitungsvertrag“ (DS §7). Why: Art. 28 GDPR requires a signed DPA; name the exact entity from it.
14. **Supabase third-country transfer.** Placeholder „Drittlandübermittlung bei Supabase und Garantie“ (DS §8). Why: Supabase is a US company; support or sub-processor access can be a transfer even with an EU region, so check DPF certification or SCCs.
15. **PowerSync deployment.** Placeholder „PowerSync Cloud oder selbst betrieben; Vertragspartner bzw. Hosting-Anbieter mit Anschrift“ (DS §7). Why: the repo has a self-hosted setup (`powersync/` with MongoDB bucket storage); production may be PowerSync Cloud or self-hosted, which changes who the processor is and where the data copy lives.
16. **PowerSync region.** Placeholder „Region des PowerSync-Dienstes“ (DS §7). Why: PowerSync keeps a copy of every synced row, including profile, complaints and body-check results (`powersync/sync-config.yaml`).
17. **PowerSync third-country transfer.** Placeholder „Drittlandübermittlung bei PowerSync und Garantie“ (DS §8). Why: same reasoning as item 14 for the PowerSync provider or the hoster of a self-hosted instance.
18. **Email delivery provider.** Placeholders „E-Mail-Versanddienst“ (DS §4.2, §7) and „Drittlandübermittlung beim E-Mail-Versanddienst und Garantie“ (DS §8). Why: `[auth.email.smtp]` is commented out in `config.toml`; Supabase's built-in mailer is not meant for production, and the chosen SMTP service is a processor that sees email addresses and reset codes.
19. **EU storage for every service.** Placeholder „Für jeden Dienst bestätigen, dass die Daten in der EU gespeichert werden“ (DS §8). Why: the owner says "all hosted in EU", but nothing in the repo proves it, and the policy must not claim it unverified.
20. **Server log retention.** Placeholder „Speicherdauer der Server-Protokolle bei Supabase und PowerSync“ (DS §4.11, §9). Why: Art. 13(2)(a) GDPR requires retention periods, and IP addresses are logged on every request, also before sign-up.
21. **Backups.** Placeholder „Ob und wie lange Datenbank- und Speicher-Backups aufbewahrt werden“ (DS §9). Why: deleted accounts survive in backups until they expire, and users must be told.
22. **Team access.** Placeholder „Kreis der zugriffsberechtigten Personen im Team bestätigen“ (DS §7). Why: the README shows the team works directly with the service role, which bypasses RLS; limit and document access (Art. 32 GDPR).
23. **HTTPS in production.** Placeholder „Bestätigen, dass im Produktivbetrieb ausschließlich HTTPS genutzt wird“ (DS §17). Why: the local URLs are `http://`; the TLS statement is only true if production URLs are `https://`.
24. **Apple/Google developer diagnostics.** No placeholder. Why: if you use crash or usage statistics from App Store Connect or the Play Console (shared by users who opt in on their device), DS should mention them; the drafts currently don't.
25. **DPAs and records of processing.** No placeholder. Why: sign a DPA with every processor (Supabase, PowerSync or its hoster, email provider, later PostHog and RevenueCat) and keep an Art. 30 record; the policy states processors act under Art. 28.

## D. Health data and consent (Art. 9 GDPR)

26. **Explicit consent flow (blocker).** Placeholder „Beschreibung, wie und an welcher Stelle der App die Einwilligung für Gesundheitsdaten eingeholt wird“ (DS §4.4). Why: the app has no consent step. The only legal line is on Create Account („Mit der Erstellung akzeptierst du … die Datenschutzerklärung“), which is not a valid explicit consent, and complaints are collected in onboarding before any legal text is shown (`src/app/(onboarding)/complaints.tsx`).
27. **Weight and height as health data (decision).** No placeholder; DS §4.3 and §4.4 currently treat them as health data. Why: this is the conservative reading, but weight and height are mandatory onboarding steps with prefilled defaults (78 kg / 178 cm, `onboarding-store.ts`), so keeping it requires a way to decline; if you drop it, edit DS §4.3, §4.4 and the summary.
28. **DPIA (decision).** No placeholder. Why: systematic processing of health data, including body photos in underwear, likely requires a data protection impact assessment (Art. 35 GDPR), which in Germany also triggers the DPO duty (item 7).
29. **Withdrawal path in the app (blocker).** Placeholder „Ort in der App, an dem die Einwilligung für Gesundheitsdaten widerrufen werden kann“ (DS §12). Why: complaints can't be changed after onboarding, and the refactored settings screen no longer edits sex, age, weight or height; withdrawing must be as easy as consenting (Art. 7(3) GDPR).
30. **Correcting profile data (decision).** No placeholder. Why: Art. 16 GDPR; right now users can only edit name, bio, avatar and units in the app (`profile-screen.tsx`, `settings-screen.tsx`). DS §4.3 says "a part" is editable, which stays true, but body data needs a correction path.
31. **Team access to body photos.** Placeholder „Festlegen und beschreiben, wer im Team unter welchen Umständen auf Körpercheck-Fotos zugreifen kann“ (DS §4.6). Why: the app promises „Fotos bleiben privat – nur für dich“, but the service role can read the private `body-checks` bucket.
32. **Minors and health data consent (blocker).** Placeholder „Regelung für Minderjährige, insbesondere zur Einwilligung in die Verarbeitung von Gesundheitsdaten“ (DS §16). Why: the app accepts age 14 (`AGE_RANGE` in `src/shared/data/profile.ts`; the DB check even allows 13), while Germany sets the Art. 8 GDPR consent age at 16.

## E. Code that is mocked or differs from what the UI says

33. **Body-check analysis (blocker).** Placeholder „Falls eine automatisierte Auswertung der Fotos eingeführt wird, hier Verfahren, Ort der Verarbeitung und beteiligte Dienstleister beschreiben“ (DS §4.6). Why: `analyzeBodyCheck` is mocked: scores come from the profile and the previous check, and the photos are not used (`src/features/body-check/lib/body-check-service.ts`). DS describes this truthfully. A planned Edge Function or AI service would change DS, the DPIA and the processor list, and shipping the analysis UI („Körperform erfassen“) on top of a mock is a consumer-protection risk.
34. **Plan-import recognition.** Placeholder „Sobald die Erkennung live ist: wohin Fotos und Dateien übertragen werden, ob ein externer Texterkennungs- oder KI-Dienst beteiligt ist, wo er seinen Sitz hat und wann die Dateien gelöscht werden“ (DS §4.7). Why: `analyzePlan` returns a fixed sample plan, and a call to `supabase.functions.invoke('analyze-plan')` is only a TODO (`plan-import-service.ts`). No external AI/OCR service is in the code yet; once one is chosen, DS must name it and its location.
35. **Voice input (decision).** No placeholder. Why: voice import is scripted (`voice-scripts.ts`) and the microphone permission is disabled in `app.json`. A real feature needs microphone permission, a speech provider and a DS update, and the "listening" UI is currently misleading.
36. **Social sign-in (decision).** No placeholder; DS §4.2 says the buttons are not functional. Why: Google and Facebook buttons are shown but not wired up (`social-sign-in.tsx`). Adding them needs new DS sections; also check App Store review guideline 4.8 on offering an equivalent login option.
37. **Recording legal acceptance (blocker).** Placeholder „Bestätigen, dass die App die Zustimmung bei der Registrierung tatsächlich speichert“ (DS §4.9). Why: the README says the app doesn't write `legal_acceptances` yet; without it there is no proof of acceptance or consent (Art. 7(1) GDPR).
38. **Trial reminder (blocker).** Placeholder „Ob und wie wir vor dem Ende des Testzeitraums erinnern“ (NB §6). Why: the trial screen promises a reminder two days before billing (`REMINDER_DAYS_BEFORE` in `trial-screen.tsx`), but the app has no notification or email mechanism, and DS §6 says the app sends no push notifications.
39. **Body-check deletion in storage (blocker).** Placeholder „Bestätigen, dass die Löschung im Speicher auch bei fehlender Internetverbindung zuverlässig nachgeholt wird“ (DS §4.6). Why: `deleteBodyCheck` removes the bucket files fire-and-forget, so offline or on error the photos stay until account deletion. The same pattern applies to replaced or removed avatars (`src/features/profile/lib/avatar.ts`).
40. **Device backups.** Placeholder „Entscheidung, ob Körpercheck-Fotos und Screenshots von Gerätebackups ausgeschlossen werden“ (DS §5). Why: photos are stored in the app's documents directory, which iCloud/Google backups can include (a comment in `use-auth-listener.ts` already notes this).
41. **Local data at rest (decision).** No placeholder. Why: the local SQLite file (`forge.db`) and MMKV aren't encrypted by the app. DS makes no such claim, but consider encryption for health data.
42. **Keys left after sign-out (minor).** No placeholder. Why: MMKV keeps `account.language.<userId>`, `account.metadataLanguage.<userId>` and the mock purchase receipt after sign-out, while DS §5 says only settings like the language remain.
43. **Age range mismatch.** No placeholder. Why: the DB allows 13–100 and the app 14–99; align both with the minimum age (item 47).
44. **Coach video persona (decision).** No placeholder. Why: the paywall welcome shows „Max Krüger, Head Coach bei Forge“ with a demo photo (`coach-video.ts`); if he isn't a real person, this may be misleading advertising (UWG).
45. **Support response time.** Placeholder „Ob die in der App genannte Antwortzeit von 24 bis 48 Stunden verbindlich zugesagt wird“ (NB §9). Why: the auto-reply states „Unser Team antwortet dir innerhalb von 24–48 Stunden“ as a firm promise.
46. **Support retention.** Placeholder „Gegebenenfalls kürzere Löschfrist für abgeschlossene Support-Anfragen“ (DS §4.8). Why: tickets and messages can't be deleted by users (RLS) and live until account deletion; storage limitation (Art. 5(1)(e) GDPR) may call for a shorter period.

## F. Minimum age and minors

47. **Minimum age (blocker).** Placeholder „Mindestalter“ (DS §16, NB §2). Why: it drives consent validity (Art. 8 GDPR, 16 in Germany) and contractual capacity (§§ 106 ff. BGB).
48. **Rules for minors in the terms.** Placeholder „Regelung für Minderjährige, z. B. Zustimmung der Erziehungsberechtigten, insbesondere für Käufe“ (NB §2). Why: subscriptions by minors generally need parental consent.
49. **Under-age accounts.** Placeholder „Vorgehen, wenn uns ein Konto einer Person unter dem Mindestalter bekannt wird“ (DS §16). Why: you need a defined process (e.g. deletion) once you learn of one.

## G. Subscriptions, purchases and RevenueCat

50. **Purchase data flows (blocker).** Placeholder „Die Kaufabwicklung ist im aktuellen Code eine Testversion; vor dem Livegang ergänzen, welche Kaufdaten auf unseren Servern oder bei RevenueCat gespeichert werden“ (DS §4.10). Why: purchases are a deterministic mock (`createMockPurchases` in `purchases-service.ts`), so the real data flows are unknown until RevenueCat is integrated.
51. **Free vs. Pro features.** Placeholder „Abgrenzung zwischen kostenlosen Funktionen und Forge Pro festlegen“ (NB §4). Why: the paywall advertises plan import, history and records, and weight suggestions as Pro benefits; the terms must match what is actually gated.
52. **Plans and prices.** Placeholder „Angebotene Abos mit Preisen und Laufzeiten“ (NB §6). Why: the values in code (daily 0,99 €, monthly 9,99 €) are mock data.
53. **Trial length.** Placeholder „Länge des Testzeitraums“ (NB §6). Why: `TRIAL_DAYS = 7` is mock; the real value comes from the store configuration.
54. **Trial eligibility scope.** Placeholder „Store-Konto oder Forge-Konto“ (NB §6). Why: introductory-offer eligibility is decided by the stores, not by the app.
55. **Cancellation deadline.** Placeholder „Kündigungsfrist laut Store, z. B. 24 Stunden vor Ablauf der Laufzeit“ (NB §6). Why: it must match each store's actual auto-renewal rules.
56. **Contracting party for in-app purchases (blocker).** Placeholder „Bestätigen, wer bei In-App-Käufen Vertragspartner ist (Apple bzw. Google oder wir)“ (NB §6). Why: it decides who owes the withdrawal notice, invoices and refunds (items 57, 61).
57. **Withdrawal notice.** Placeholder „Vollständige Widerrufsbelehrung, soweit wir selbst Vertragspartner sind, einschließlich Regelungen zum vorzeitigen Erlöschen des Widerrufsrechts bzw. zum Wertersatz“ (NB §7). Why: it is mandatory if you are the seller, and early expiry for digital products needs express consent and acknowledgement at purchase.
58. **Entitlement binding.** Placeholder „Ob Forge Pro an das Store-Konto oder an das Forge-Konto gebunden ist und auf welchen Geräten es gilt“ (NB §6). Why: the code resets Pro on sign-out and restores it from the store account; the RevenueCat app-user-ID design decides this.
59. **Price changes.** Placeholder „Regelung für Preisänderungen bei laufenden Abos“ (NB §6). Why: price changes need a valid mechanism; the stores run their own consent flows.
60. **§ 312k BGB cancellation button (lawyer).** No placeholder. Why: check whether the statutory cancellation-button duty for online consumer subscriptions applies to store-sold subscriptions.
61. **Purchase record retention.** Placeholder „Konkrete Aufbewahrungsfrist und betroffene Kaufdaten“ (DS §9). Why: HGB/AO retention only applies to records you keep yourself, which depends on item 56.
62. **RevenueCat app user ID.** Placeholder „Welche Kennung an RevenueCat übermittelt wird, z. B. eine pseudonyme Nutzer-ID“ (DS §4.13). Why: sending the Supabase user id links purchases to the account; an anonymous id sends less data.
63. **RevenueCat data list.** Placeholder „Endgültige Liste der an RevenueCat übermittelten Daten bestätigen“ (DS §4.13). Why: check the SDK defaults (device data, IP, subscriber attributes) against its documentation.
64. **RevenueCat entity.** Placeholder „Vertragspartner und Anschrift von RevenueCat laut Auftragsverarbeitungsvertrag“ (DS §4.13). Why: Art. 28 GDPR DPA.
65. **RevenueCat role.** Placeholder „Rolle von RevenueCat laut Vertrag bestätigen, z. B. Auftragsverarbeiter“ (DS §4.13). Why: processor and controller roles are described differently.
66. **RevenueCat region.** Placeholder „Region der Datenverarbeitung bei RevenueCat“ (DS §4.13). Why: I could not verify that RevenueCat offers EU data residency, so don't claim EU hosting until RevenueCat confirms it in writing.
67. **RevenueCat transfer.** Placeholder „Drittlandübermittlung bei RevenueCat und Garantie, z. B. EU-US Data Privacy Framework oder Standardvertragsklauseln“ (DS §4.13). Why: RevenueCat is US-based, so a transfer is likely; confirm DPF certification or SCCs.
68. **RevenueCat retention.** Placeholder „Speicherdauer der Kaufdaten bei RevenueCat“ (DS §4.13). Why: Art. 13(2)(a) GDPR.

## H. Product analytics (PostHog)

69. **PostHog region.** Placeholder „Hosting-Region bei PostHog bestätigen, z. B. PostHog Cloud EU“ (DS §4.12). Why: PostHog Cloud EU exists, but US and EU are separate instances, so confirm the project was created in the EU one.
70. **PostHog entity and DPA.** Placeholder „Vertragspartner und Anschrift von PostHog laut Auftragsverarbeitungsvertrag“ (DS §4.12). Why: Art. 28 GDPR DPA.
71. **PostHog transfer.** Placeholder „Drittlandübermittlung bei PostHog und Garantie, z. B. EU-US Data Privacy Framework oder Standardvertragsklauseln“ (DS §4.12). Why: PostHog is a US company; support access can be a transfer even with EU hosting.
72. **Data collected.** Placeholder „Endgültige Liste der an PostHog übermittelten Daten, insbesondere ob IP-Adressen gespeichert, ob Sitzungsaufzeichnungen genutzt und ob Ereignisse mit deinem Konto verknüpft werden“ (DS §4.12). Why: autocapture and session replay can capture screens with health data and body photos.
73. **No health data or photos to PostHog.** No placeholder; DS §4.12 promises it. Why: the implementation must guarantee it (event properties, replay off or fully masked).
74. **Consent UI.** Placeholder „Ort in der App, an dem die Einwilligung in die Analyse widerrufen werden kann“ (DS §4.12). Why: § 25(1) TDDDG requires opt-in before the SDK initializes or stores identifiers, and withdrawal must be easy.
75. **PostHog retention.** Placeholder „Speicherdauer der Analysedaten bei PostHog“ (DS §4.12). Why: Art. 13(2)(a) GDPR.
76. **Summary line.** No placeholder. Why: DS „Kurz zusammengefasst“ says the app has no analytics trackers „derzeit“; update it when PostHog ships.

## I. Retention and deletion

77. **Inactive accounts.** Placeholder „Entscheidung, ob und wann inaktive Konten gelöscht werden“ (DS §9). Why: storage limitation; without a rule, data of abandoned accounts is kept forever.
78. **Deletion beyond the database.** Placeholder „Beschreiben, wie gelöschte Daten aus Backups, aus dem Zwischenspeicher von PowerSync sowie bei PostHog und RevenueCat entfernt werden“ (DS §10). Why: `delete_own_account` only deletes the `auth.users` row (cascading to every table) after the app removes the storage files; PowerSync bucket storage, PostHog persons and RevenueCat customers need their own deletion steps.
79. **Legal acceptances deleted with the account (decision).** No placeholder. Why: the cascade also deletes `legal_acceptances`, i.e. the proof of acceptance and consent; consider keeping minimal proof to defend legal claims (Art. 17(3)(e) GDPR).
80. **Data export.** Placeholder „Verfahren für den Datenexport, z. B. per E-Mail-Anfrage“ (DS §11). Why: Art. 20 GDPR; the app has no export function.
81. **Verify final account deletion.** No placeholder. Why: `src/features/settings/lib/delete-account.ts` and `supabase/migrations/20261010120000_delete_own_account.sql` were added while these drafts were written. Re-check that the final flow matches DS §10 (storage files, then the RPC, then a local sign-out; a failure shows „Dein Konto konnte nicht gelöscht werden …“).

## J. Terms of use decisions

82. **Medical device status.** Placeholder „Bestätigen, dass Forge nach seiner Zweckbestimmung kein Medizinprodukt ist“ (NB §5). Why: complaint-based exercise exclusion and body-fat estimates could be read as a medical purpose under the MDR; marketing claims must stay consistent with the intended purpose.
83. **Ideas and feedback.** Placeholder „Regelung, ob und wie wir Ideen und Feedback aus dem Support nutzen dürfen“ (NB §8). Why: without a clause, rights to implement user suggestions are unclear.
84. **Commercial use.** Placeholder „Ob eine gewerbliche Nutzung, z. B. durch Trainer für ihre Kunden, erlaubt ist“ (NB §10). Why: it defines the user group and affects consumer-law assumptions.
85. **Notice period for free accounts.** Placeholder „Kündigungsfrist für kostenlose Konten“ (NB §13). Why: ordinary termination by the provider needs a reasonable notice period.
86. **Refusing changed terms.** Placeholder „Regelung, was gilt, wenn du einer geänderten Fassung nicht zustimmst“ (NB §14). Why: the app can block use until re-acceptance (`requires_reacceptance`), and German case law (BGH 2021) rejects deemed-consent clauses, so define the outcome explicitly.
87. **Governing law.** Placeholder „Anwendbares Recht, z. B. das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts“ (NB §15). Why: a choice of law must not deprive consumers of their mandatory home-country protection (Art. 6 Rome I).
88. **Place of jurisdiction.** Placeholder „Gerichtsstand für Kaufleute, juristische Personen des öffentlichen Rechts und öffentlich-rechtliche Sondervermögen“ (NB §15). Why: it can only be agreed with merchants, not with consumers.
89. **Consumer dispute resolution.** Placeholder „Erklärung nach § 36 VSBG, ob wir bereit oder verpflichtet sind, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen“ (NB §15). Why: required for traders using standard terms unless they had 10 or fewer employees on 31 Dec of the prior year. The EU ODR platform link is no longer needed since the platform closed in July 2025.
90. **Contract language.** Placeholder „Vertragssprache festlegen“ (NB §15). Why: the app ships in en, de, pt-PT and pt-BR with per-locale documents; decide which version governs.

---

Note: after these drafts were written, the settings lost the email and password sheets (password only via „Passwort vergessen“) and „Käufe wiederherstellen“ moved to the paywall; DS §4.2 and NB §3, §6 were updated to match.

Count: 90 items (73 tied to placeholders in the drafts, 17 further decisions or checks), of which 10 are marked as blockers.
