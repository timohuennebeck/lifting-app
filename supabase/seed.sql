-- Local development only (`supabase db reset` runs this; `db push` never does).
-- Placeholder legal documents so the legal pages have something to show. Publish the real
-- texts in the hosted project as new rows; documents can't be edited once inserted.

insert into public.legal_documents (kind, locale, version, content_md, effective_at) values
  ('terms', 'en', '0.1-dev', $md$# Terms of Use

> Placeholder for local development. Replace it with the real terms before release.

## 1. Scope

These terms apply to the use of the **Forge** app.

## 2. Your account

- Keep your login details private.
- You can delete your account at any time.

Questions? Write to [support@example.com](mailto:support@example.com).
$md$, '2026-10-01'),
  ('privacy', 'en', '0.1-dev', $md$# Privacy Policy

> Placeholder for local development. Replace it with the real policy before release.

## 1. What we store

1. Your profile and training data
2. Body check photos, only if you take them

## 2. Your rights

You can request a copy of your data or its deletion. More at [example.com](https://example.com).
$md$, '2026-10-01'),
  ('terms', 'de', '0.1-dev', $md$# Nutzungsbedingungen

> Platzhalter für die lokale Entwicklung. Vor dem Release durch den echten Text ersetzen.

## 1. Geltungsbereich

Diese Bedingungen gelten für die Nutzung der App **Forge**.

## 2. Dein Konto

- Halte deine Zugangsdaten geheim.
- Du kannst dein Konto jederzeit löschen.

Fragen? Schreib an [support@example.com](mailto:support@example.com).
$md$, '2026-10-01'),
  ('privacy', 'de', '0.1-dev', $md$# Datenschutzerklärung

> Platzhalter für die lokale Entwicklung. Vor dem Release durch den echten Text ersetzen.

## 1. Was wir speichern

1. Dein Profil und deine Trainingsdaten
2. Fotos vom Körpercheck, nur wenn du welche machst

## 2. Deine Rechte

Du kannst eine Kopie deiner Daten oder ihre Löschung verlangen. Mehr unter [example.com](https://example.com).
$md$, '2026-10-01');
