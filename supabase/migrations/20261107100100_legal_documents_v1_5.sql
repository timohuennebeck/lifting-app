-- The legal texts of version 1.5 (docs/legal), in effect from 2026-11-07 10:00:00+00; written by
-- scripts/legal-migration.mjs. Documents can't be changed once inserted: publish a new version.
-- No re-acceptance: the version in effect covers users who accepted an older one.
insert into public.legal_documents (kind, locale, version, content_md, effective_at, requires_reacceptance) values
  ('terms', 'de', '1.5', $md$# Nutzungsbedingungen

Version: 1.5

Stand: 6. November 2026

Diese Nutzungsbedingungen regeln, wie du die App Loqqa nutzen kannst. Bitte lies sie aufmerksam. Wie wir mit deinen Daten umgehen, erklären wir in unserer Datenschutzerklärung.

## 1. Anbieter und Geltungsbereich

Anbieter der App Loqqa ist:

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 München, Deutschland
- E-Mail: support@useloqqa.com
- Website: [useloqqa.com](https://useloqqa.com)

Im Folgenden nennen wir uns „wir“. Diese Bedingungen gelten für alle Funktionen der App. Für Käufe über den App Store von Apple oder über Google Play gelten zusätzlich die Bedingungen des jeweiligen Stores.

## 2. Mindestalter

Du musst mindestens so alt sein, dass du in deinem Land selbst in die Verarbeitung deiner Daten einwilligen darfst: in Deutschland 16 Jahre, in anderen Ländern je nach Recht dort 13 bis 16 Jahre. Die App fragt bei der Einrichtung nach deinem Geburtsdatum und lässt dich erst ab diesem Alter weiter.

Bist du noch nicht volljährig, brauchst du für den Kauf von Loqqa Pro die Zustimmung deiner Erziehungsberechtigten. Der Coach ist erst ab 16 Jahren verfügbar, der Körpercheck erst ab 18 Jahren.

## 3. Dein Konto

- Um Loqqa nach der Einrichtung zu nutzen, brauchst du ein Konto. Du erstellst es am Ende der Einrichtung mit deinem Google-Konto oder, auf Apple-Geräten, mit deinem Apple Account. Der Vertrag über die Nutzung von Loqqa kommt zustande, wenn du dein Konto erstellst.
- Mache bei der Einrichtung wahre Angaben.
- Schütze den Zugang zu deinem Google-Konto bzw. Apple Account. Wenn du vermutest, dass jemand anderes dein Konto nutzt, informiere uns.
- Dein Konto ist persönlich und nicht übertragbar.

## 4. Was Loqqa bietet

Loqqa unterstützt dich beim Krafttraining. Dazu gehören insbesondere:

- ein Trainingsplan, den ein KI-Modell aus deinen Angaben erstellt, zum Beispiel aus Ziel, Erfahrung, Ausstattung und Trainings pro Woche
- der Import deines Trainingsplans und deiner bisherigen Trainings aus einer Datei, zum Beispiel dem Export einer anderen App
- das Protokollieren deiner Trainings mit Gewichten, Wiederholungen und Zeiten, deine Historie, Bestwerte, deine Sätze je Muskel in einem Zeitraum deiner Wahl und Vorschläge für deine Sätze
- das Erfassen deines Körpergewichts
- der Körpercheck mit Fotos und geschätzten Werten (ab 18 Jahren)
- Kai, der KI-Coach: ein KI-Modell, das deine Fragen zu deinem Training beantwortet, meist mit einem Diagramm aus deinen Daten, und auf Wunsch Trainings zusammenstellt und den Austausch von Übungen vorschlägt (ab 16 Jahren)
- ein Übungskatalog mit Anleitungen, Bildern und Videos
- ein Support-Chat für Fehlermeldungen und Ideen

Die Einrichtung, einschließlich der Planerstellung oder des Imports, kannst du kostenlos durchlaufen. Danach setzt die Nutzung von Loqqa ein Abo voraus (Loqqa Pro, Abschnitt 6). Ohne aktives Abo bleiben dein Konto und deine Daten erhalten, und du kannst weiterhin die Einstellungen, den Support und die Kontolöschung nutzen; die übrigen Funktionen sind dann gesperrt.

Die Erkennung beim Import kann Fehler machen. Prüfe den erkannten Plan und die Zuordnung deiner Übungen deshalb, bevor du sie übernimmst; Übungen, bei denen die Erkennung unsicher ist, legt dir die App zur Prüfung vor. Auch ein Plan, den die App für dich erstellt, ist ein Vorschlag: Sieh ihn dir an und pass ihn bei Bedarf an. Die Antworten des Coachs können ebenfalls falsch sein, zum Beispiel wenn das Modell eine Frage missversteht. Damit der Coach nicht missbraucht wird, kannst du ihm höchstens 20 Fragen in 24 Stunden und 150 Fragen in 30 Tagen stellen. Für Planerstellung, Import, Körpercheck und Coach braucht die App eine Internetverbindung.

Viele Funktionen von Loqqa funktionieren auch ohne Internetverbindung. Deine Daten werden synchronisiert, sobald du online bist. Änderungen, die bei einer Abmeldung noch nicht synchronisiert sind, gehen verloren; die App warnt dich vorher.

Loqqa ist ein Hilfsmittel für dein Training. Einen bestimmten Trainingserfolg schulden wir nicht.

## 5. Gesundheitshinweise

> Loqqa ersetzt keine ärztliche Beratung, Diagnose oder Behandlung.

- Loqqa gibt allgemeine Trainingsempfehlungen. Die App bietet keine medizinische, physiotherapeutische oder ernährungsbezogene Beratung. Loqqa ist kein Medizinprodukt und nicht dafür bestimmt, Krankheiten zu erkennen, zu überwachen oder zu behandeln.
- Lass dich vor Beginn eines Trainingsprogramms ärztlich beraten, besonders bei Vorerkrankungen (zum Beispiel des Herz-Kreislauf-Systems), bei Beschwerden oder Verletzungen, nach Operationen, in der Schwangerschaft oder Stillzeit und wenn du lange nicht trainiert hast.
- Die Werte des Körperchecks, zum Beispiel der geschätzte Körperfettanteil, sind grobe Schätzungen eines KI-Modells. Sie sind keine medizinische Messung und keine Diagnose.
- Die Antworten des Coachs sind allgemeine Informationen und Empfehlungen für dein Training, erstellt von einem KI-Modell. Sie können falsch sein und ersetzen keine ärztliche oder physiotherapeutische Beratung. Bei Schmerzen oder Verletzungen stellt der Coach keine Diagnose; lass Beschwerden, die bleiben, ärztlich abklären.
- Pläne und Vorschläge sind eine Orientierung. Wähle Gewichte und Wiederholungen so, dass du sie mit sauberer Technik sicher schaffst. Nutze bei schweren Gewichten Sicherungen oder eine Hilfestellung.
- Hör sofort auf, wenn du Schmerzen, Schwindel, Atemnot oder Druck in der Brust spürst, und hol bei Bedarf ärztliche Hilfe.

## 6. Loqqa Pro, Testzeitraum und Abo

- **Kauf:** Loqqa Pro kaufst du in der App über den App Store von Apple oder über Google Play. Den Kaufvertrag schließt du mit Apple bzw. Google. Zahlung, Abrechnung, Verlängerung, Kündigung und Erstattung richten sich nach den Bedingungen des jeweiligen Stores.
- **Preise und Laufzeiten:** Loqqa Pro gibt es als Monatsabo und als Jahresabo. Die aktuellen Preise in deiner Währung siehst du vor dem Kauf in der App und im Store.
- **Testzeitraum:** Loqqa Pro kann mit einem kostenlosen Testzeitraum von 7 Tagen beginnen. Ob du ihn nutzen kannst, entscheidet der Store, in der Regel einmal pro Store-Konto. Kündigst du nicht rechtzeitig vor dem Ende des Tests, geht er automatisch in ein kostenpflichtiges Abo über. Die App zeigt dir vor dem Kauf, an welchem Tag das bezahlte Abo beginnt. Wir erinnern dich vor dem Ende des Testzeitraums nicht gesondert.
- **Verlängerung:** Dein Abo verlängert sich automatisch um die gewählte Laufzeit, wenn du es nicht rechtzeitig kündigst: im App Store spätestens 24 Stunden vor Ablauf der Laufzeit, bei Google Play vor dem Verlängerungsdatum.
- **Kündigung:** Du kündigst in den Abo-Einstellungen deines Store-Kontos. In der App findest du den Link dazu unter „Abo verwalten“. Nach der Kündigung bleibt Loqqa Pro bis zum Ende der bezahlten Laufzeit aktiv.
- **Wichtig:** Wenn du die App oder dein Konto löschst, wird dein Abo nicht gekündigt.
- **Käufe wiederherstellen:** Loqqa Pro gilt für das Loqqa-Konto, mit dem du es gekauft hast, auf allen Geräten, auf denen du damit angemeldet bist. Über „Käufe wiederherstellen“ auf der Loqqa-Pro-Seite der App kannst du einen Kauf deines Store-Kontos erneut aktivieren; tust du das mit einem anderen Loqqa-Konto, geht Loqqa Pro auf dieses Konto über.
- **Erstattungen:** Erstattungen richten sich nach den Bedingungen des jeweiligen Stores. Wende dich dafür an Apple bzw. Google.
- **Preisänderungen:** Preise laufender Abos können sich nur nach den Verfahren des jeweiligen Stores ändern. Der Store informiert dich vorher und holt, wo es vorgeschrieben ist, deine Zustimmung ein. Bist du mit einem neuen Preis nicht einverstanden, kannst du dein Abo zum Ende der Laufzeit kündigen.

## 7. Widerrufsrecht

Als Verbraucher hast du bei Verträgen über digitale Inhalte und digitale Dienstleistungen grundsätzlich ein gesetzliches Widerrufsrecht. Da du Loqqa Pro bei Apple bzw. Google kaufst, belehren dich die Stores über dieses Recht, und Ausübung und Abwicklung des Widerrufs richten sich nach ihren Verfahren.

## 8. Deine Inhalte

Inhalte, die du in Loqqa einstellst, bleiben deine, zum Beispiel Pläne, Trainingsdaten, Fotos, dein Text „Über dich“, deine Support-Nachrichten und deine Fragen an den Coach. Du räumst uns daran nur die einfachen, nicht übertragbaren Rechte ein, die wir brauchen, um die App für dich bereitzustellen: deine Inhalte speichern, synchronisieren, verarbeiten und dir anzeigen sowie deine Support-Anfragen bearbeiten. Diese Rechte enden, wenn du die Inhalte oder dein Konto löschst.

- Lade nur Inhalte hoch, an denen du die nötigen Rechte hast. Trainingspläne von Trainern, aus Büchern oder Apps darfst du nur importieren, soweit du sie für dein eigenes Training nutzen darfst.
- Auf deinen Fotos und Screenshots dürfen keine anderen Personen zu sehen sein, die nicht eingewilligt haben.
- Rechtswidrige, beleidigende oder anstößige Inhalte sind nicht erlaubt, auch nicht im Support-Chat oder in Fragen an den Coach.

Ideen und Vorschläge, die du uns schickst, dürfen wir unentgeltlich nutzen, um Loqqa zu verbessern. Einen Anspruch auf Umsetzung oder Vergütung gibt es nicht.

## 9. Support

Im Support-Chat der App kannst du Fehler melden und Funktionen vorschlagen. Wir antworten dir dort, in der Regel innerhalb weniger Tage. Die in der App genannten Antwortzeiten sind Richtwerte, keine verbindliche Zusage. Du erreichst uns außerdem per E-Mail an support@useloqqa.com.

## 10. Erlaubte Nutzung

Du darfst Loqqa nur privat für dein eigenes Training nutzen. Eine gewerbliche Nutzung, zum Beispiel durch Trainer für ihre Kunden, ist nur mit unserer vorherigen Zustimmung erlaubt. Nicht erlaubt ist insbesondere:

- technische Schutzmaßnahmen oder die Abo-Abfrage zu umgehen
- automatisiert auf die App oder unsere Server zuzugreifen, Inhalte massenhaft auszulesen oder unsere Server übermäßig zu belasten
- zu versuchen, auf Daten anderer Nutzer zuzugreifen
- die App zu dekompilieren oder zu verändern, soweit das Gesetz es nicht ausdrücklich erlaubt (§§ 69d, 69e UrhG)

Die App, der Übungskatalog mit Texten, Bildern und Videos sowie Marken und Designs sind rechtlich geschützt. Du erhältst ein einfaches, nicht übertragbares Recht, sie im Rahmen dieser Bedingungen zu nutzen.

## 11. Verfügbarkeit, Updates und Änderungen der App

- Wir bemühen uns, dass Loqqa zuverlässig funktioniert. Eine ununterbrochene Verfügbarkeit unserer Server können wir aber nicht zusagen, etwa bei Wartung oder bei Störungen unserer Dienstleister. Viele Funktionen kannst du auch dann offline nutzen.
- Wir stellen dir Updates bereit, die nötig sind, damit Loqqa vertragsgemäß funktioniert, insbesondere Sicherheitsupdates (§ 327f BGB). Bitte installiere sie zeitnah.
- Wir dürfen Loqqa ändern und weiterentwickeln, wenn dafür ein triftiger Grund besteht (zum Beispiel neue technische Anforderungen, Sicherheit, Weiterentwicklung der App oder eine geänderte Rechtslage), dir dadurch keine zusätzlichen Kosten entstehen und wir dich klar und verständlich informieren. Beeinträchtigt eine Änderung deinen Zugang zu Loqqa oder die Nutzbarkeit mehr als nur unerheblich, informieren wir dich vorab. Du kannst den Vertrag dann nach Maßgabe von § 327r BGB unentgeltlich beenden.
- Den Übungskatalog aktualisieren wir laufend.

## 12. Haftung

- Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit, nach dem Produkthaftungsgesetz und im Umfang einer von uns übernommenen Garantie.
- Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht haften wir nur für den vertragstypischen, vorhersehbaren Schaden. Wesentliche Vertragspflichten sind Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung du regelmäßig vertrauen darfst.
- Im Übrigen haften wir nicht für leichte Fahrlässigkeit.
- Diese Regeln gelten auch für die persönliche Haftung unserer Vertreter und Erfüllungsgehilfen.
- Deine gesetzlichen Rechte bei Mängeln digitaler Produkte (§§ 327 ff. BGB) bleiben unberührt.

## 13. Laufzeit, Kündigung und Kontolöschung

- Der Vertrag über die Nutzung von Loqqa läuft auf unbestimmte Zeit.
- Du kannst ihn jederzeit beenden, indem du dein Konto in der App löschst: in den Einstellungen unter „Konto löschen“. Du kannst die Löschung auch per E-Mail an support@useloqqa.com verlangen.
- Wir können den Vertrag mit einer Frist von vier Wochen kündigen, wenn du kein aktives Abo hast. Ein bezahltes Abo bleibt bis zum Ende der bezahlten Laufzeit unberührt.
- Das Recht beider Seiten, aus wichtigem Grund fristlos zu kündigen, bleibt unberührt. Ein wichtiger Grund liegt für uns insbesondere bei schweren oder wiederholten Verstößen gegen diese Bedingungen vor.
- Mit der Löschung deines Kontos löschen wir deine Daten, wie in der Datenschutzerklärung beschrieben. Gelöschte Daten können wir nicht wiederherstellen.
- Dein Abo kündigst du über den Store (Abschnitt 6).

## 14. Änderungen dieser Bedingungen

Wir können diese Bedingungen ändern, zum Beispiel wenn wir neue Funktionen einführen oder sich die Rechtslage ändert. Die neue Fassung zeigen wir dir in der App, mit den Änderungen hervorgehoben. Änderungen, die deine Rechte oder Pflichten wesentlich betreffen, werden für dich erst wirksam, wenn du ihnen in der App zustimmst. Bis dahin kannst du in der App nur die Einstellungen, den Support und die Kontolöschung nutzen. Stimmst du nicht zu, kannst du den Vertrag jederzeit beenden, indem du dein Konto löschst; dein Abo kündigst du im Store.

## 15. Schlussbestimmungen

- **Anwendbares Recht:** Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Als Verbraucher behältst du den Schutz der zwingenden Vorschriften des Staates, in dem du deinen gewöhnlichen Aufenthalt hast.
- **Gerichtsstand:** Für Kaufleute, juristische Personen des öffentlichen Rechts und öffentlich-rechtliche Sondervermögen ist München Gerichtsstand. Für Verbraucher gelten die gesetzlichen Gerichtsstände.
- **Verbraucherstreitbeilegung:** Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
- **Sprache:** Diese Bedingungen gibt es auf Deutsch, Englisch, Portugiesisch, Koreanisch, Spanisch und Französisch. Maßgeblich ist die deutsche Fassung; die anderen sind Übersetzungen.
- **Unwirksame Bestimmungen:** Ist eine Bestimmung dieser Bedingungen unwirksam, bleibt der Vertrag im Übrigen wirksam. An die Stelle der unwirksamen Bestimmung treten die gesetzlichen Vorschriften.
$md$, '2026-11-07 10:00:00+00', false),
  ('privacy', 'de', '1.5', $md$# Datenschutzerklärung

Version: 1.5

Stand: 6. November 2026

Hier erfährst du, welche personenbezogenen Daten wir verarbeiten, wenn du die App Loqqa nutzt, wofür wir das tun und welche Rechte du hast. Grundlage sind die Datenschutz-Grundverordnung (DSGVO), das Bundesdatenschutzgesetz (BDSG) und das Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG).

## Kurz zusammengefasst

- Loqqa speichert deine Pläne und Trainings zuerst auf deinem Gerät und gleicht sie mit deinem Konto ab, sobald du online bist. Unsere Datenbank liegt in Frankfurt am Main.
- Andere Nutzer können dein Profil, deine Trainings und deine Fotos nicht sehen.
- Dein Gewicht, deine Größe und deine Körpercheck-Fotos behandeln wir als Gesundheitsdaten. Wir verarbeiten sie nur mit deiner ausdrücklichen Einwilligung.
- Für die Planerstellung, den Import deiner Trainings, die Spracheingabe, den Körpercheck, den Coach und die Übersetzung von Support-Nachrichten nutzen wir ein KI-Modell von OpenAI. Dafür übermitteln wir die nötigen Daten an OpenAI, das sie in den USA verarbeitet.
- Um die App zu verbessern, messen wir mit PostHog, wie sie genutzt wird. Gesundheitsdaten und Fotos gehen nicht an PostHog. Die App enthält keine Werbung.
- Du kannst dein Konto jederzeit in der App löschen. Damit löschen wir auch deine Fotos und alle Daten deines Kontos.

## 1. Wer ist verantwortlich?

Verantwortlich für die Verarbeitung deiner Daten ist:

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 München, Deutschland
- E-Mail: support@useloqqa.com

Im Folgenden nennen wir uns „wir“.

## 2. Datenschutzbeauftragter

Einen Datenschutzbeauftragten haben wir nicht benannt, weil wir dazu nicht verpflichtet sind. Mit allen Fragen zum Datenschutz kannst du dich direkt an support@useloqqa.com wenden.

## 3. So funktioniert Loqqa

Loqqa ist eine Trainings-App. Du kannst dir einen Trainingsplan erstellen lassen oder deinen Plan und deine bisherigen Trainings aus einer anderen App oder einer Tabelle importieren, deine Trainings und dein Körpergewicht protokollieren, dem Coach Fragen zu deinem Training stellen und ab 18 Jahren Körperchecks mit Fotos machen.

Die App arbeitet „offline first“: Deine Daten liegen in einer Datenbank auf deinem Gerät, damit du auch ohne Internet trainieren kannst. Bist du angemeldet und online, gleicht die App diese Daten mit deinem Konto auf unseren Servern ab. So sind dein Plan und deine Historie gesichert und auf all deinen Geräten verfügbar. Für die Server nutzen wir Dienstleister (Abschnitt 7).

Alle Daten in unserer Datenbank sind deinem Konto zugeordnet. Technische Zugriffsregeln sorgen dafür, dass nur du deine eigenen Daten lesen und ändern kannst. Loqqa hat keine Funktionen, mit denen andere Nutzer dein Profil, deine Trainings oder deine Fotos sehen.

## 4. Welche Daten wir wofür verarbeiten

### 4.1 Einrichtung ohne Konto

Die Einrichtung durchläufst du ohne Konto. Dabei lädt die App den Übungskatalog (Namen, Anleitungen, Bilder und Videos der Übungen) und diese Rechtstexte von unseren Servern. Den Übungskatalog prüft sie beim Start und danach stündlich auf Änderungen. Dabei fallen nur technisch notwendige Verbindungsdaten an (Abschnitt 4.13).

Deine Antworten in der Einrichtung (zum Beispiel Vorname, Geschlecht, Geburtsdatum, Gewicht, Größe, Ziel und der erstellte oder importierte Plan) speichert die App zunächst nur auf deinem Gerät. An uns gehen diese Angaben erst, wenn du ein Konto erstellst (Abschnitte 4.3 und 4.4). Ausnahmen: Lässt du dir einen Plan erstellen, überträgt die App schon vorher deine Antworten zu Ziel, Fokus, Ausstattung, Trainings pro Woche, Trainingsdauer und Erfahrung, damit der Plan erstellt werden kann; aus einer Datei, die du importierst, überträgt sie Auszüge, die Namen der Übungen und deinen Plan, damit sie erkannt werden können (beides Abschnitt 4.7). Einen importierten Trainingsverlauf überträgt sie erst, wenn du ein Konto erstellst.

Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung der App, die du nutzen möchtest).

### 4.2 Dein Konto

Am Ende der Einrichtung erstellst du ein Konto, indem du dich mit deinem Google-Konto oder, auf Apple-Geräten, mit deinem Apple Account anmeldest. Ein Passwort für Loqqa gibt es nicht. Dabei verarbeiten wir:

- die Angaben, die Google bzw. Apple uns bei der Anmeldung übermitteln, darunter deine E-Mail-Adresse (siehe unten)
- deinen Vornamen, damit die App ihn nach einer Anmeldung auf einem neuen Gerät wieder eintragen kann
- technische Kontodaten wie den Zeitpunkt der Registrierung und der letzten Anmeldung sowie Anmelde-Tokens

Damit du angemeldet bleibst, speichert die App deine Anmeldesitzung auf deinem Gerät.

**Anmeldung mit Google:** Wenn du dich mit Google anmeldest, öffnet sich die Anmeldung von Google auf deinem Gerät. Google bestätigt uns danach deine Anmeldung und übermittelt uns deine E-Mail-Adresse, deinen Namen, die Adresse deines Google-Profilbilds und eine Kennung deines Google-Kontos. Diese Angaben speichern wir zu deinem Konto. Google erfährt dabei, dass du dich bei Loqqa anmeldest. Für die Anmeldung über dein Google-Konto ist Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland, eigenständig verantwortlich; es gilt die [Datenschutzerklärung von Google](https://policies.google.com/privacy?hl=de).

**Anmeldung mit Apple** (nur auf Apple-Geräten): Wenn du dich mit Apple anmeldest, öffnet sich die Anmeldung von Apple auf deinem Gerät. Apple bestätigt uns danach deine Anmeldung und übermittelt uns eine Kennung deines Apple Accounts und deine E-Mail-Adresse. Du kannst stattdessen eine von Apple erzeugte Adresse wählen, die E-Mails an dich weiterleitet („E-Mail-Adresse verbergen“). Bei der ersten Anmeldung übermittelt Apple auch deinen Namen, wenn du ihn freigibst. Diese Angaben speichern wir zu deinem Konto. Für die Anmeldung über deinen Apple Account ist Apple Distribution International Limited, Hollyhill Industrial Estate, Hollyhill, Cork, Irland, eigenständig verantwortlich; es gilt die [Datenschutzrichtlinie von Apple](https://www.apple.com/legal/privacy/de-ww/).

Konten entstehen nur am Ende der Einrichtung. Würde eine Anmeldung über „Anmelden“ auf dem Startbildschirm ein neues Konto anlegen, löscht die App es sofort wieder und weist dich darauf hin, dass es noch kein Konto gibt.

Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.

### 4.3 Profil und Trainingsplanung

Wenn du ein Konto erstellst, speichern wir deine Angaben aus der Einrichtung als dein Profil. Einen Teil davon kannst du später in den Einstellungen und in deinem Profil ändern.

- Vorname, biologisches Geschlecht (auch „Keine Angabe“ ist möglich) und Geburtsdatum
- Körpergewicht, Körpergröße und deine bevorzugten Einheiten (metrisch oder imperial)
- Trainingserfahrung, Trainingsziel, Muskelgruppen mit Fokus, verfügbare Ausstattung, Trainings pro Woche und gewünschte Trainingsdauer
- deine App-Sprache, damit unser Support dir in deiner Sprache antworten kann
- freiwillig: ein Profilfoto (die App speichert es als quadratisches Bild mit 512 × 512 Pixeln) und einen kurzen Text „Über dich“ mit bis zu 150 Zeichen

Wofür: Dein Geburtsdatum brauchen wir, um das Mindestalter (Abschnitt 16) und die Altersgrenzen von Coach und Körpercheck zu prüfen. Aus Trainingsziel, Fokus, Ausstattung, Trainings pro Woche, Trainingsdauer und Erfahrung erstellt ein KI-Modell von OpenAI deinen Trainingsplan, wenn du dir einen erstellen lässt (Abschnitt 4.7). Ziel, Erfahrung, Ausstattung, Fokus und deine Einheiten nutzt auch der Coach für seine Antworten (Abschnitt 4.8). Geschlecht, Alter, Gewicht und Größe nutzt die App für den Körpercheck (Abschnitt 4.6). Profilfoto und „Über dich“ werden nur dir in deinem Profil angezeigt.

Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO; für Körpergewicht und Körpergröße deine Einwilligung (Abschnitt 4.4).

### 4.4 Gesundheitsdaten und deine Einwilligung

Einige Angaben können Rückschlüsse auf deine Gesundheit zulassen. Wir behandeln sie deshalb als Gesundheitsdaten im Sinne von Art. 9 DSGVO:

- **Körpermaße:** dein Körpergewicht, deine Gewichtseinträge und deine Körpergröße (Abschnitte 4.3 und 4.5).
- **Körpercheck:** deine Körpercheck-Fotos und die Werte, die daraus entstehen, zum Beispiel ein geschätzter Körperfettanteil (Abschnitt 4.6).

Diese Daten verarbeiten wir nur mit deiner ausdrücklichen Einwilligung (Art. 9 Abs. 2 lit. a in Verbindung mit Art. 6 Abs. 1 lit. a DSGVO):

- **Körpermaße:** Wenn du dein Konto erstellst, willigst du mit dem Hinweis direkt über der Schaltfläche ausdrücklich ein, dass wir deine Körperdaten verarbeiten, um dein Training anzupassen. Vorher bleiben Gewicht und Größe auf deinem Gerät.
- **Körpercheck:** Bevor die App deine Fotos zur Auswertung sendet, weist sie dich darauf hin, dass Fotos und Körperdaten dafür an OpenAI in den USA übermittelt werden. Mit „Fertig“ willigst du darin ein.
- **Coach:** Der Coach nutzt für seine Antworten auch deine Gewichtseinträge und die Gesamtwerte deiner Körperchecks, und unser Server übermittelt dafür deine Trainings- und Körperdaten an OpenAI in den USA (Abschnitt 4.8). Mit dem Erstellen deines Kontos und der Annahme dieser Datenschutzerklärung willigst du darin ein. Den Zeitpunkt deiner Einwilligung speichern wir. Diese Daten übermitteln wir nur, wenn du dem Coach eine Frage stellst.

Körpercheck und Coach sind freiwillig. Deine Einwilligungen kannst du jederzeit mit Wirkung für die Zukunft widerrufen (Abschnitt 12).

### 4.5 Trainingsdaten und Körpergewicht

Wenn du Loqqa nutzt, speichern wir:

- **Pläne:** Name, Trainings pro Woche, Blöcke mit Deload-Woche, Trainings in ihrer Reihenfolge (auch Trainings ohne Plan), Übungen, Sätze mit Zielwerten (Wiederholungen oder Sekunden), Wiederholungen in Reserve (RIR) und Pausenzeiten
- **Absolvierte Trainings,** auch solche, die du importierst: Beginn und Ende, zu welchem Plan und welcher Planwoche sie zählen, Übungen, Gewicht und Wiederholungen oder Sekunden je Satz, der Zeitpunkt jedes erledigten Satzes und persönliche Bestleistungen
- **Eigene Übungen**, die du anlegst oder die beim Import entstehen
- **Körpergewicht:** die Gewichtseinträge, die du erfasst, je Tag ein Wert

Wofür: damit du deine Trainings und dein Gewicht protokollieren und deine Historie, Bestwerte, deine Sätze je Muskel in einem Zeitraum deiner Wahl und deine Aktivität sehen kannst. Vorschläge für deine Sätze und die Zahl deiner Sätze je Muskel berechnet die App auf deinem Gerät. Fragst du den Coach, beantwortet er deine Frage aus diesen Daten (Abschnitt 4.8).

Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO; für die Gewichtseinträge deine Einwilligung (Abschnitt 4.4).

### 4.6 Körpercheck

Der Körpercheck ist freiwillig und erst ab 18 Jahren verfügbar. Dafür nimmst du mit der Kamera drei Fotos auf: von vorne, von der Seite und von hinten. Die App empfiehlt, dafür Unterwäsche oder eng anliegende Sportkleidung zu tragen. Auf den Fotos kann dein Gesicht zu sehen sein.

Die App verkleinert die Fotos auf höchstens 1080 Pixel Breite und speichert sie auf deinem Gerät. Wenn du die Auswertung startest, lädt sie die Fotos in einen nicht öffentlichen Speicherbereich deines Kontos hoch. Dort bleiben sie, damit du sie auch auf deinen anderen Geräten siehst. Für die Auswertung brauchst du eine Internetverbindung.

**Auswertung durch ein KI-Modell von OpenAI:** Die Werte deines Checks ermittelt ein KI-Modell von OpenAI. Dafür übermittelt unser Server an OpenAI:

- die drei Fotos dieses Checks und, falls vorhanden, die Fotos deines vorherigen Checks, damit das Modell Veränderungen direkt vergleichen kann
- Geschlecht, Alter (aus deinem Geburtsdatum berechnet), Größe, Gewicht und Trainingserfahrung aus deinem Profil
- die Werte deines vorherigen Checks, damit die Werte von Check zu Check vergleichbar bleiben

Deinen Namen, deine E-Mail-Adresse und deine Konto-ID übermitteln wir nicht. OpenAI verarbeitet die Daten in den USA (Abschnitt 8). Wir haben eingestellt, dass OpenAI die Anfrage nicht für einen späteren Abruf speichert. OpenAI nutzt Daten aus seiner API nicht zum Training seiner Modelle und bewahrt sie bis zu 30 Tage auf, um Missbrauch zu erkennen; danach werden sie gelöscht.

Das Modell prüft zuerst, ob die Fotos auswertbar sind, zum Beispiel ob sie hell genug sind und dein Körper mindestens vom Kopf bis zu den Knien zu sehen ist. Ist ein Foto nicht auswertbar, bittet dich die App, es neu aufzunehmen. Sonst liefert das Modell Werte für sechs Muskelgruppen (Schultern, Brust, Arme, Rücken, Bauch, Beine), einen geschätzten Körperfettanteil sowie Werte für Proportionen und Definition. Daraus berechnet unser Server den Gesamtwert. Diese Werte speichern wir zu deinem Check.

Bevor unser Server einen Check auswertet, prüft er bei RevenueCat, ob dein Konto Loqqa Pro hat (Abschnitt 4.12). Jede Auswertung protokollieren wir mit Zeitpunkt und Ergebnis. So begrenzen wir die Zahl der Auswertungen pro Tag und stellen sicher, dass gespeicherte Werte aus einer Auswertung stammen. Das Protokoll löschen wir mit deinem Konto.

Die Werte sind grobe Schätzungen und keine medizinische Messung oder Diagnose.

**Wer Zugriff hat:** Technisch kann nur der Betreiber von Loqqa, Jan Timo Hünnebeck, auf den Speicherbereich zugreifen. Er sieht sich Körpercheck-Fotos nur an, wenn du im Support darum bittest, wenn es nötig ist, um einen Fehler zu beheben, den du meldest, oder wenn wir gesetzlich dazu verpflichtet sind.

Du kannst einzelne Checks in der App löschen. Dann löscht die App die Fotos auf deinem Gerät und in unserem Speicher. Ist dein Gerät dabei offline, kann es sein, dass Fotos in unserem Speicher bleiben, bis du dein Konto löschst; schreib uns in diesem Fall, dann löschen wir sie.

Rechtsgrundlage: deine ausdrückliche Einwilligung (Abschnitt 4.4), auch für die Übermittlung an OpenAI in die USA (Art. 49 Abs. 1 lit. a DSGVO, ergänzend zu den Garantien in Abschnitt 8).

### 4.7 Import, Planerstellung und Übungen per Sprache

Du kannst deine Trainings aus einer anderen App oder einer Tabelle importieren: als Datei im Format CSV, TSV, Excel oder OpenDocument, zum Beispiel den Export von Hevy oder Strong. Die Datei kann deinen Trainingsverlauf, deinen Trainingsplan oder beides enthalten. Bitte achte darauf, dass in der Datei keine Daten anderer Personen stehen.

**Lesen auf deinem Gerät:** Die App öffnet die Datei und liest ihre Zeilen auf deinem Gerät. Deinen ganzen Trainingsverlauf überträgt sie dafür nicht an unseren Server.

**Erkennung durch ein KI-Modell von OpenAI:** Damit die App versteht, wie deine Datei aufgebaut ist und welche Übungen gemeint sind, überträgt sie mit deiner App-Sprache an unseren Server: den Dateinamen und die Namen der Tabellenblätter, je Blatt die Kopfzeile, eine Auswahl von höchstens 150 Zeilen (vom Anfang, aus der Mitte und vom Ende) und Angaben zu jeder Spalte (zum Beispiel wie viele Zellen gefüllt sind und häufige Werte), die Namen der Übungen in deinem Verlauf mit der Zahl ihrer Sätze und einem typischen Gewicht sowie die Zeilen deines Plans, falls die Datei einen enthält. Der Server gibt sie zusammen mit unserem Übungskatalog an ein KI-Modell von OpenAI weiter. Es erkennt, welche Spalten zum Beispiel Datum, Übung, Gewicht und Wiederholungen enthalten, ordnet die Namen der Übungen unserem Katalog zu und liest Trainings, Übungen, Sätze, Wiederholungen und Pausen deines Plans aus. Enthält die Datei keinen Plan, stellt die App aus deinen Trainings der letzten sechs Wochen einen zusammen; für Trainings ohne Namen schlägt das Modell einen vor und erhält dafür nur ihre Übungen und wie oft du sie trainiert hast. Weitere Daten übermitteln wir dabei nicht: Die Anfragen enthalten weder dein Konto noch deinen Namen. OpenAI verarbeitet die Daten in den USA (Abschnitt 8). Wir haben eingestellt, dass OpenAI die Anfrage nicht für einen späteren Abruf speichert. OpenAI nutzt Daten aus seiner API nicht zum Training seiner Modelle und bewahrt sie bis zu 30 Tage auf, um Missbrauch zu erkennen.

Unser Server speichert deine Datei und die übermittelten Auszüge nicht; er gibt nur das Ergebnis an die App zurück. Gespeichert wird, was du am Ende übernimmst: die Trainings deines Verlaufs als absolvierte Trainings und der Plan, den du bestätigst (Abschnitt 4.5). Trainings, die zur selben Zeit beginnen wie ein Training in deinem Konto, übernimmt die App nicht noch einmal. Übungen, die unser Katalog nicht kennt, legt die App als eigene Übungen in deinem Konto an. Importierst du deinen Verlauf in der Einrichtung, bleibt er bis zur Erstellung deines Kontos auf deinem Gerät und wird danach in dein Konto übertragen.

**Planerstellung durch ein KI-Modell von OpenAI:** Lässt du dir einen Plan erstellen, überträgt die App deine Antworten zu Trainingsziel, Muskelgruppen mit Fokus, Ausstattung, Trainings pro Woche, Trainingsdauer und Trainingserfahrung sowie deine App-Sprache an unseren Server. Der gibt sie zusammen mit den Übungen unseres Katalogs, die zu deiner Ausstattung passen, an ein KI-Modell von OpenAI weiter, das daraus deinen Plan zusammenstellt. Deinen Namen, dein Geburtsdatum, Geschlecht, Gewicht und deine Größe übermitteln wir dabei nicht, und die Anfrage enthält dein Konto nicht. Für die Verarbeitung bei OpenAI gilt dasselbe wie beim Import. Unser Server speichert deine Antworten dabei nicht; er gibt nur den Plan an die App zurück, wo du ihn ändern kannst.

**Übungen per Sprache:** Beim Einrichten eines Plans, beim Bearbeiten eines Trainings und beim Zusammenstellen eines freien Trainings kannst du Übungen mit Sätzen und Wiederholungen einsprechen, statt sie einzeln zu suchen. Das Gesprochene wandelt die Spracherkennung deines Betriebssystems in Text um: auf dem iPhone die von Apple, auf Android-Geräten die von Google. Je nach Gerät geschieht das auf dem Gerät selbst oder auf Servern von Apple oder Google; dafür gelten deren Datenschutzbestimmungen. Die Aufnahme selbst erhalten wir nicht. Den Text, den du vor dem Hinzufügen noch ändern kannst, überträgt die App mit deiner App-Sprache an unseren Server. Der gibt ihn zusammen mit unserem Übungskatalog an ein KI-Modell von OpenAI weiter, das daraus die Übungen mit ihren Sätzen und Wiederholungen erkennt. Die Anfrage enthält weder dein Konto noch deinen Namen. Für die Verarbeitung bei OpenAI gilt dasselbe wie beim Import. Unser Server speichert den Text nicht.

**Begrenzung der Anfragen:** Damit Import, Planerstellung und Übungen per Sprache nicht missbraucht werden, begrenzen wir, wie oft sie pro Netzwerk und insgesamt am Tag genutzt werden können. Dafür speichert unser Server zu jeder Anfrage den Zeitpunkt, welche dieser Funktionen sie betraf, und einen Hashwert deiner IP-Adresse, den er mit einem geheimen Schlüssel bildet; die IP-Adresse selbst speichern wir nicht. Einträge, die älter als zwei Tage sind, löschen wir bei jeder neuen Anfrage.

Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO für den Import, die Planerstellung und die Übungen per Sprache, die du startest, auch für die Übermittlung an OpenAI in die USA. Für die Begrenzung der Anfragen Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse ist es, Missbrauch und unnötige Kosten zu verhindern.

### 4.8 Kai · KI-Coach

Mit Loqqa Pro kannst du Kai, dem KI-Coach der App, Fragen zu deinem eigenen Training stellen, zum Beispiel „Wie hat sich mein Gewicht entwickelt?“. Der Coach antwortet in wenigen Sätzen, meist mit einem Diagramm aus deinen Daten. Allgemeine Trainingsfragen beantwortet er auch, etwa wie oft du Beine trainieren solltest oder welche Übung du machen kannst, wenn dir etwas wehtut. Auf Wunsch stellt er auch ein Training zusammen, zeigt dir eines deiner gespeicherten Trainings oder schlägt vor, Übungen in deinem Plan zu ersetzen; dein Plan ändert sich erst, wenn du das in der App bestätigst. Eine Diagnose stellt er nicht. Kai ist eine KI, kein Mensch. Der Coach ist freiwillig und erst ab 16 Jahren verfügbar. Für ihn brauchst du eine Internetverbindung.

**Antworten durch ein KI-Modell von OpenAI:** Die App überträgt deine Frage mit deiner App-Sprache und der Zeitzone deines Geräts an unseren Server. Der gibt die Frage an ein KI-Modell von OpenAI weiter. Braucht das Modell Daten, fragt es sie bei unserem Server an: Der berechnet die Werte aus deinen gespeicherten Daten und übermittelt die Ergebnisse an OpenAI. Daraus schreibt das Modell die Antwort. Zu jeder Frage übermittelt unser Server an OpenAI:

- deine Frage und die letzten bis zu sechs Fragen dieses Chats mit ihren Antworten und den Daten, die dafür abgefragt wurden
- das heutige Datum, deine Einheiten und deine App-Sprache
- Trainingsziel, Trainingserfahrung, Ausstattung und Muskelgruppen mit Fokus aus deinem Profil sowie Name und Trainings pro Woche deines aktiven Plans
- die Trainings deines aktiven Plans mit ihren Übungen und ihrem Stand in dieser Woche (erledigt, als Nächstes oder offen) sowie die Namen deiner übrigen gespeicherten Trainings
- die Zahl deiner Trainings mit dem Datum des ersten und des letzten, die Zahl deiner Gewichtseinträge mit dem Datum des ersten und die Zahl deiner Körperchecks
- die Übungen, die du gemacht hast, auch eigene Übungen: Name, wie du sie protokollierst, in wie vielen Trainings du sie gemacht hast und wann zuletzt

Je nach Frage übermittelt unser Server außerdem, was er dafür aus deinen Daten berechnet:

- Trainings mit Datum, Name, Dauer, Übungen und Sätzen (Gewicht, Wiederholungen, Sekunden und RIR)
- Werte je Training, zum Beispiel das geschätzte Maximalgewicht für eine Wiederholung (1RM), das schwerste Gewicht, Wiederholungen, Haltezeit, Volumen und Bestwerte
- deine Gewichtseinträge und einen geglätteten Gewichtsverlauf
- die Gesamtwerte deiner Körperchecks, ohne Fotos und ohne Einzelwerte wie den Körperfettanteil
- Trainings, Sätze, Volumen und Trainingszeit pro Woche oder Monat, Trainingspausen und die Wochentage deiner Trainings
- Sätze pro Muskelgruppe und pro Übung
- die Übungen, Sätze und Zielwerte eines gespeicherten Trainings, wenn der Coach es dir zeigt oder eine Änderung daran vorschlägt
- Übungen aus dem Katalog der App, wenn der Coach ein Training zusammenstellt oder einen Austausch vorschlägt; die Übungen, die du am häufigsten gemacht hast, stehen zuerst

Deinen Namen, deine E-Mail-Adresse, deine Konto-ID, dein Geburtsdatum und Alter, dein Geschlecht, deine Größe, dein Profilfoto, deinen Text „Über dich“, deine Körpercheck-Fotos und deine Support-Nachrichten übermitteln wir nicht. Bitte schreib in deine Fragen keine Daten anderer Personen. OpenAI verarbeitet die Daten in den USA (Abschnitt 8). Wir haben eingestellt, dass OpenAI die Anfrage nicht für einen späteren Abruf speichert. OpenAI nutzt Daten aus seiner API nicht zum Training seiner Modelle und bewahrt sie bis zu 30 Tage auf, um Missbrauch zu erkennen; danach werden sie gelöscht.

Die Antworten schreibt ein KI-Modell. Sie können falsch sein. Sie sind Informationen und Empfehlungen für dein Training, keine medizinische Beratung und keine Diagnose.

Bevor unser Server eine Frage beantwortet, prüft er dein Alter anhand des Geburtsdatums in deinem Profil, deine Einwilligung (Abschnitt 4.4) und bei RevenueCat, ob dein Konto Loqqa Pro hat (Abschnitt 4.12).

**Fragen per Sprache:** Du kannst deine Frage auch einsprechen. Dann nimmt die App über das Mikrofon auf, bis du die Aufnahme beendest, höchstens zwei Minuten lang, und überträgt die Aufnahme mit deiner App-Sprache an unseren Server. Der gibt sie an ein Spracherkennungsmodell von OpenAI weiter, das sie in Text umwandelt. Damit Begriffe wie „Bankdrücken“ richtig erkannt werden, schickt er einen kurzen Hinweis auf das Thema mit (Fragen an einen Trainings-Coach und typische Begriffe). Den Text zeigt die App im Eingabefeld, wo du ihn ändern kannst; erst wenn du ihn sendest, wird er zu deiner Frage. Deine Aufnahme speichern wir nicht: Unser Server leitet sie nur weiter, und die App löscht sie auf deinem Gerät, sobald der Text da ist oder du die Aufnahme verwirfst. Bitte nimm dabei keine anderen Personen auf. Für die Verarbeitung bei OpenAI gilt dasselbe wie bei den Antworten (USA, keine Nutzung zum Training, Aufbewahrung bis zu 30 Tage zur Erkennung von Missbrauch). Auch hierfür prüft unser Server dein Alter und ob dein Konto Loqqa Pro hat. Damit die Umwandlung nicht missbraucht wird, kannst du sie höchstens 100-mal in 24 Stunden nutzen. Dafür speichert unser Server zu jeder Umwandlung den Zeitpunkt und einen Hashwert deiner Konto-ID, den er mit einem geheimen Schlüssel bildet; Einträge, die älter als zwei Tage sind, löschen wir bei jeder neuen Umwandlung.

**Was wir speichern:** Deine Chats mit den Fragen, den Antworten und den Diagrammen unter den Antworten speichern wir in unserer Datenbank. Die App synchronisiert sie auf deine Geräte, damit du deine Chats dort siehst (Abschnitt 5). Zu jeder Frage speichern wir außerdem ein Protokoll, das die App nicht anzeigt: Zeitpunkt, Status (zum Beispiel ob eine Antwort zustande kam), das verwendete Modell, die Zahl der Tokens (Textbausteine, nach denen OpenAI abrechnet) und die Dauer, dazu die Abfragen des Modells mit den abgefragten Daten. Die Abfragen brauchen wir, damit der Coach Nachfragen zu einer Antwort beantworten kann.

**Begrenzung der Fragen:** Damit der Coach nicht missbraucht wird und keine unnötigen Kosten entstehen, kannst du höchstens 20 Fragen in 24 Stunden und 150 Fragen in 30 Tagen stellen. Dafür zählt unser Server die Protokolle.

Du kannst Chats in der App löschen, auch mehrere auf einmal. Dann löschen wir ihre Fragen, Antworten und Diagramme und die abgefragten Daten in ihren Protokollen. Zeitpunkt, Status, Modell, Tokens und Dauer bleiben, damit die Begrenzung weiter gilt und wir die Kosten des Coachs im Blick behalten. Sonst bewahren wir deine Chats auf, bis du sie oder dein Konto löschst. Mit deinem Konto löschen wir alle Chats und Protokolle (Abschnitt 10).

Rechtsgrundlage: deine ausdrückliche Einwilligung (Abschnitt 4.4), auch für die Übermittlung an OpenAI in die USA (Art. 49 Abs. 1 lit. a DSGVO, ergänzend zu den Garantien in Abschnitt 8). Für die Umwandlung einer eingesprochenen Frage in Text Art. 6 Abs. 1 lit. b DSGVO, weil du sie startest, auch für die Übermittlung an OpenAI in die USA. Für die Begrenzung der Fragen und der Umwandlungen und die Angaben zu Zeitpunkt, Status, Modell, Tokens und Dauer Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse ist es, Missbrauch und unnötige Kosten zu verhindern.

### 4.9 Support

Über „Fehler melden“ und „Funktion wünschen“ kannst du uns direkt in der App schreiben, oder du schreibst an support@useloqqa.com. In der App verarbeiten wir dabei:

- die Art deiner Anfrage (Fehler oder Idee), bei Ideen die Wichtigkeit von 1 bis 5, deine Nachrichten und den Betreff (die erste Zeile deiner ersten Nachricht)
- bis zu fünf Screenshots pro Nachricht, die du aus deiner Mediathek auswählst; die App verkleinert sie (längste Seite höchstens 1600 Pixel) und speichert sie als JPEG
- den Verlauf deiner Anfrage, zum Beispiel Statusänderungen, unsere Antworten und ob du eine Anfrage wieder geöffnet hast
- das Gerät, von dem aus du eine Anfrage stellst: Plattform (iOS oder Android), Version des Betriebssystems, Gerätemodell und App-Version, damit wir Fehler nachvollziehen können
- deine App-Sprache, damit wir unsere Antworten in deine Sprache übersetzen können
- die erkannte Sprache jeder Nachricht und ihre Übersetzungen (siehe unten)

**Übersetzung durch ein KI-Modell von OpenAI:** Damit wir dich verstehen und du unsere Antworten in deiner Sprache liest, übersetzt ein KI-Modell von OpenAI die Support-Nachrichten. Dafür übermittelt unser Server jede Nachricht mit Text zusammen mit der Sprache, in die sie übersetzt werden soll, an OpenAI: deine Nachrichten, um ihre Sprache zu erkennen und sie in die Sprache unseres Supports zu übersetzen, und unsere Antworten, um sie in deine App-Sprache zu übersetzen. Änderst du deine App-Sprache, übersetzen wir unsere bisherigen Antworten in die neue Sprache. Deinen Namen, deine E-Mail-Adresse, deine Konto-ID und deine Screenshots übermitteln wir nicht. Die Übersetzungen speichern wir zu den Nachrichten; in der App kannst du jederzeit das Original anzeigen. OpenAI verarbeitet die Daten in den USA (Abschnitt 8). Wir haben eingestellt, dass OpenAI die Anfrage nicht für einen späteren Abruf speichert. OpenAI nutzt Daten aus seiner API nicht zum Training seiner Modelle und bewahrt sie bis zu 30 Tage auf, um Missbrauch zu erkennen; danach werden sie gelöscht.

**Nachrichten per Sprache:** Du kannst deine Nachricht auch einsprechen. Das funktioniert wie bei den Fragen an den Coach (Abschnitt 4.8): Die App nimmt auf, bis du die Aufnahme beendest, höchstens zwei Minuten lang. Unser Server gibt die Aufnahme mit einem kurzen Hinweis auf das Thema an ein Spracherkennungsmodell von OpenAI weiter. Den Text zeigt die App im Eingabefeld, wo du ihn ändern kannst; erst wenn du ihn sendest, wird er zu deiner Nachricht. Deine Aufnahme speichern wir nicht. Auch hierfür prüft unser Server dein Alter und ob dein Konto Loqqa Pro hat, und es gilt dieselbe Begrenzung.

**Wer deine Anfrage sieht:** Wir bearbeiten Anfragen in einem internen Support-Bereich im Browser, auf den nur Jan Timo Hünnebeck mit einem eigenen Zugang zugreifen kann. Der Support-Bereich zeigt zu deiner Anfrage auch deine E-Mail-Adresse, ob du dich mit Apple oder Google anmeldest, deine Konto-ID, wann du dein Konto erstellt hast und zuletzt aktiv warst, deine App-Sprache und deine früheren Anfragen.

Screenshots speichert die App zuerst auf deinem Gerät und lädt sie dann im Hintergrund hoch. Nachrichten und Anfragen kannst du nicht selbst löschen, damit der Verlauf nachvollziehbar bleibt. Sie werden mit deinem Konto gelöscht; auf Wunsch löschen wir abgeschlossene Anfragen auch vorher. E-Mails bewahren wir so lange auf, wie wir sie für dein Anliegen brauchen.

Bitte schick uns in Nachrichten und Screenshots keine Gesundheitsdaten und keine Daten anderer Personen, wenn sie für dein Anliegen nicht nötig sind. Nachrichten übermitteln wir zur Übersetzung auch an OpenAI.

Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO, soweit deine Anfrage die Nutzung der App betrifft, zum Beispiel bei Fehlern. Bei Ideen und sonstigem Feedback Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse ist es, deine Anfrage zu beantworten und Loqqa zu verbessern. Das gilt auch für die Übersetzung und die Übermittlung an OpenAI in die USA (Abschnitt 8).

### 4.10 Rechtstexte und Zustimmungen

Die App lädt die jeweils gültige Fassung der Nutzungsbedingungen und dieser Datenschutzerklärung in deiner Sprache. Wenn du einer Fassung zustimmst, bei der Registrierung oder später bei einer geänderten Fassung, speichern wir, welcher Fassung du zugestimmt hast, den Zeitpunkt (vom Server gesetzt), die App-Version und die Plattform (iOS oder Android). So können wir nachweisen, welche Fassung für dich gilt, und dich bei wesentlichen Änderungen erneut um Zustimmung bitten.

Rechtsgrundlage: Art. 6 Abs. 1 lit. c in Verbindung mit Art. 7 Abs. 1 DSGVO (Nachweis von Einwilligungen) und Art. 6 Abs. 1 lit. f DSGVO (unser berechtigtes Interesse, nachweisen zu können, welche Bedingungen gelten).

### 4.11 Loqqa Pro: Abos und Käufe

Loqqa Pro kaufst du über den App Store von Apple oder über Google Play. Den Kauf und die Zahlung wickeln Apple bzw. Google ab. Sie sind dafür selbst verantwortlich und verarbeiten deine Zahlungsdaten nach ihren eigenen Datenschutzbestimmungen: [Apple](https://www.apple.com/legal/privacy/de-ww/) und [Google](https://policies.google.com/privacy?hl=de). Zahlungsdaten wie Kreditkartennummern erhalten wir nicht.

Damit wir Loqqa Pro freischalten können, erfahren wir über RevenueCat (Abschnitt 4.12), welches Abo du gekauft hast, ob ein Testzeitraum läuft, wann du gekauft hast und ob das Abo aktiv ist. Die App speichert diesen Status auf deinem Gerät und fragt ihn beim Start und bei jeder Anmeldung erneut ab. Kaufdaten speichern wir nicht selbst in unserer Datenbank.

Dein Abo verwaltest und kündigst du in den Einstellungen deines Store-Kontos. Die App verlinkt unter „Abo verwalten“ dorthin.

Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.

### 4.12 Abo-Verwaltung mit RevenueCat

Käufe und Abos verwalten wir über RevenueCat. RevenueCat prüft für uns die Kaufbelege des Stores und teilt der App mit, ob Loqqa Pro aktiv ist. Bevor unser Server einen Körpercheck auswertet oder eine Frage an den Coach beantwortet, fragt er bei RevenueCat nach, ob dein Konto Loqqa Pro hat.

Damit RevenueCat deine Käufe deinem Konto zuordnen kann, übermitteln wir deine Konto-ID, eine zufällige Kennung ohne Namen oder E-Mail-Adresse. Kaufst du vor dem Erstellen deines Kontos, vergibt RevenueCat zunächst eine eigene zufällige Kennung und ordnet den Kauf danach deinem Konto zu. Außerdem verarbeitet RevenueCat Kauf- und Abo-Informationen aus dem Store (zum Beispiel Produkt, Preis, Währung, Kauf-, Verlängerungs- und Ablaufdaten, Testzeitraum und Transaktionskennungen) sowie technische Angaben wie Plattform, Gerätetyp, App-Version und IP-Adresse.

RevenueCat sendet außerdem Ereignisse zu deinem Abo an PostHog (Abschnitt 4.14), zum Beispiel einen begonnenen oder umgewandelten Testzeitraum, Verlängerungen und Kündigungen, jeweils mit dem Umsatz. Dafür gibt die App RevenueCat deine PostHog-Kennung: vor dem Erstellen deines Kontos eine zufällige Kennung, danach deine Konto-ID.

- Anbieter: RevenueCat, Inc., 1032 E Brandon Blvd #3003, Brandon, FL 33511, USA, als unser Auftragsverarbeiter
- Speicherort: USA (Amazon Web Services); Garantie siehe Abschnitt 8
- Speicherdauer: solange unser Vertrag mit RevenueCat besteht; Daten zu deinem Konto lassen wir löschen, wenn du dein Konto löschst und keine gesetzlichen Pflichten entgegenstehen

Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.

### 4.13 Technisch notwendige Verbindungsdaten

Immer wenn die App mit unseren Servern verbunden ist (zum Beispiel bei Anmeldung, Synchronisation, Uploads oder beim Laden von Übungskatalog und Rechtstexten), werden technisch notwendige Daten verarbeitet: deine IP-Adresse, Datum und Uhrzeit, die aufgerufene Schnittstelle sowie technische Angaben wie Statuscodes und, soweit übermittelt, Angaben zu App und Betriebssystem. Unsere Hosting-Dienstleister protokollieren diese Daten, um Betrieb und Sicherheit zu gewährleisten. Bei Supabase werden die Protokolle nach einem Tag gelöscht, bei PowerSync, sobald sie für Betrieb und Sicherheit nicht mehr nötig sind.

Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse ist ein stabiler und sicherer Betrieb.

### 4.14 Produktanalyse und Fehlerberichte mit PostHog

Um zu verstehen, wie Loqqa genutzt wird, und um Fehler zu finden, nutzen wir PostHog. Die App sendet dafür:

- **Nutzungsereignisse:** welche Bildschirme du aufrufst und bestimmte Schritte, zum Beispiel Beginn der Einrichtung, erstellte oder importierte Pläne, importierte Trainingsverläufe (nur deren Umfang, nie die Inhalte), Aufrufe der Loqqa-Pro-Seite, Käufe, Registrierung und Anmeldung, Beginn, Ende oder Abbruch eines Trainings, dass du dem Coach eine Frage gestellt hast und ob er geantwortet hat (nie der Text), die Auswertung eines Körperchecks (nie die Werte), das Speichern eines Gewichtseintrags (nie das Gewicht), per Sprache hinzugefügte Übungen, die Bitte um eine Bewertung im Store, jeweils mit Zeitpunkt und Kennzahlen wie Anzahl der Übungen oder Sätze, Dauer oder Fehlercode
- **Abo-Ereignisse:** begonnene oder umgewandelte Testzeiträume, Verlängerungen und Kündigungen mit dem Umsatz, die RevenueCat sendet (Abschnitt 4.12)
- **App-Ereignisse:** Öffnen und Schließen der App, App-Version, Gerätetyp, Betriebssystem und Sprache
- **Fehlerberichte:** Absturz- und Fehlermeldungen mit technischen Details
- **Profilangaben:** nach der Registrierung Ziel, Erfahrung, Trainings pro Woche, Split, Ausstattung, Sprache, Einheiten, eine Altersgruppe (zum Beispiel „25–34“) und ob du Loqqa Pro hast
- **eine pseudonyme Kennung:** vor der Registrierung eine zufällige Kennung, die die App auf deinem Gerät speichert, danach deine Konto-ID, damit Ereignisse vor und nach der Registrierung zusammengeführt werden

Nicht an PostHog gehen dein Name, deine E-Mail-Adresse, Gewicht, Größe, dein Geburtsdatum, Körpercheck-Fotos und -Werte sowie Freitexte. Deine IP-Adresse speichert PostHog nicht, und Sitzungsaufzeichnungen nutzen wir nicht. Wenn du dich abmeldest, setzt die App die Kennung zurück.

- Anbieter: PostHog, Inc., 2261 Market St. #4008, San Francisco, CA 94114, USA, als unser Auftragsverarbeiter
- Speicherort: PostHog Cloud EU (Frankfurt am Main); PostHog ist unter dem EU-US Data Privacy Framework zertifiziert (Abschnitt 8)
- Speicherdauer: Ereignisse werden nach einem Jahr gelöscht

Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse ist es, Loqqa zu verbessern und Fehler zu beheben. Du kannst dem jederzeit widersprechen (Abschnitt 11), zum Beispiel per E-Mail an support@useloqqa.com; dann löschen wir die Analysedaten zu deinem Konto.

## 5. Speicherung auf deinem Gerät

Damit Loqqa auch offline funktioniert, speichert die App Daten auf deinem Gerät:

- eine lokale Datenbank mit deinem Profil, deinen Plänen und Trainings, deinen Gewichtseinträgen, deinen Körpercheck-Werten, deinen Coach-Chats, deinen Support-Anfragen und deinen Zustimmungen
- Körpercheck-Fotos, die du auf diesem Gerät aufgenommen hast, und Kopien deiner Support-Screenshots
- deine Anmeldesitzung, deine Antworten aus der Einrichtung, einen in der Einrichtung importierten Trainingsverlauf, bis er in deinem Konto ist, deinen Abo-Status, Einstellungen wie die App-Sprache sowie Listen der Dateien, die noch hochgeladen werden müssen
- den Übungskatalog
- die Kennung und noch nicht gesendete Ereignisse für PostHog (Abschnitt 4.14)

Bis auf die Daten für PostHog ist diese Speicherung für die Dienste, die du nutzen möchtest, unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG).

Wenn du dich abmeldest, löscht die App die lokale Datenbank sowie deine Körpercheck-Fotos und Screenshot-Kopien auf diesem Gerät und setzt Einrichtung, Abo-Status, laufende Trainings und einen noch nicht übertragenen Import zurück. Noch nicht synchronisierte Änderungen gehen dabei verloren; die App warnt dich vorher. Einstellungen wie die App-Sprache bleiben erhalten. Wenn du die App löschst, entfernt dein Betriebssystem in der Regel alle Daten der App.

Je nach Einstellungen deines Geräts können Dateien der App, auch Körpercheck-Fotos, in Backups deines Geräts enthalten sein (zum Beispiel bei iCloud oder Google). Für diese Backups sind Apple bzw. Google verantwortlich.

## 6. Berechtigungen auf deinem Gerät

Loqqa fragt nur dann nach einer Berechtigung, wenn du eine Funktion nutzt, die sie braucht:

- **Kamera:** für Körpercheck-Fotos und für dein Profilfoto
- **Fotos:** um Bilder für Support-Screenshots und für dein Profilfoto auszuwählen. Dafür nutzt die App die Bildauswahl deines Betriebssystems und erhält nur die Bilder, die du auswählst.
- **Dateien:** um eine Datei mit deinen Trainings über die Dateiauswahl deines Betriebssystems auszuwählen (Abschnitt 4.7)
- **Mikrofon:** um Übungen (Abschnitt 4.7), Fragen an den Coach (Abschnitt 4.8) und Nachrichten an den Support (Abschnitt 4.9) einzusprechen. Die App nimmt nur auf, während du die Spracheingabe nutzt.
- **Spracherkennung (iPhone):** damit die Spracherkennung von Apple eingesprochene Übungen in Text umwandeln kann (Abschnitt 4.7)

Loqqa fragt nicht nach Zugriff auf Standort, Kontakte oder Gesundheits-Apps wie Apple Health oder Health Connect und sendet keine Push-Mitteilungen. Berechtigungen kannst du jederzeit in den Einstellungen deines Geräts entziehen.

## 7. Empfänger und Auftragsverarbeiter

Wir geben deine Daten nur weiter, wenn das für die genannten Zwecke nötig ist, du eingewilligt hast oder wir gesetzlich dazu verpflichtet sind. Unsere Dienstleister verarbeiten Daten in unserem Auftrag und nach unseren Weisungen (Art. 28 DSGVO):

- **Supabase, Inc.** (Datenbank, Anmeldung, Dateispeicher und Serverfunktionen): Server in Frankfurt am Main (Amazon Web Services)
- **PowerSync** von Journey Mobile, Inc. (Synchronisation zwischen App und Datenbank; der Dienst hält dafür eine Kopie deiner synchronisierten Daten vor): Server in der EU
- **OpenAI Ireland Ltd.**, 117–126 Sheriff Street Upper, Dublin 1, Irland (KI-Erstellung von Plänen, Erkennung importierter Trainingsdateien und eingesprochener Übungen, Auswertung der Körpercheck-Fotos, Antworten des Coachs, Umwandlung eingesprochener Fragen in Text und Übersetzung von Support-Nachrichten, Abschnitte 4.6 bis 4.9): Verarbeitung in den USA durch OpenAI OpCo, LLC
- **RevenueCat, Inc.** (Abo-Verwaltung, Abschnitt 4.12)
- **PostHog, Inc.** (Produktanalyse und Fehlerberichte, Abschnitt 4.14)

Apple und Google erhalten bei App-Downloads und Käufen Daten als eigenständig Verantwortliche (Abschnitt 4.11), ebenso bei der Anmeldung über ihr Konto (Abschnitt 4.2) und bei der Spracherkennung ihres Betriebssystems (Abschnitt 4.7).

Loqqa wird von einer Person betrieben: Zugriff auf deine Daten hat nur Jan Timo Hünnebeck, soweit er ihn für Betrieb und Support braucht.

Behörden und Gerichten geben wir Daten nur, wenn wir gesetzlich dazu verpflichtet sind.

## 8. Übermittlung in Drittländer

Dein Konto, deine Trainings und deine Fotos speichern wir in Rechenzentren in der EU (Supabase in Frankfurt am Main, PowerSync in der EU). Einige unserer Dienstleister haben ihren Sitz in den USA. Deshalb können Daten auch in die USA übermittelt werden, etwa bei Wartung oder Support durch den Dienstleister. Für die Planerstellung, den Import deiner Trainings, eingesprochene Übungen und Fragen, die Auswertung des Körperchecks, die Antworten des Coachs und die Übersetzung von Support-Nachrichten übermitteln wir Daten bei jeder Anfrage an OpenAI in den USA (Abschnitte 4.6 bis 4.9), und RevenueCat verarbeitet die Abo-Daten in den USA (Abschnitt 4.12).

Wir stützen diese Übermittlungen auf folgende Garantien:

- **PostHog:** Angemessenheitsbeschluss der EU-Kommission für das EU-US Data Privacy Framework, unter dem PostHog zertifiziert ist (Art. 45 DSGVO)
- **Supabase, PowerSync, OpenAI und RevenueCat:** Standardvertragsklauseln der EU-Kommission (Art. 46 Abs. 2 lit. c DSGVO), die Teil unserer Auftragsverarbeitungsverträge sind
- **Körpercheck und Coach:** zusätzlich deine ausdrückliche Einwilligung (Art. 49 Abs. 1 lit. a DSGVO). In den USA können Behörden unter Umständen auf Daten zugreifen, ohne dass dir dagegen dieselben Rechtsbehelfe wie in der EU zustehen.

Eine Kopie der Standardvertragsklauseln kannst du bei uns anfordern.

## 9. Wie lange wir deine Daten speichern

- **Konto, Profil, Pläne, Trainings, Gewichtseinträge, Körperchecks, Coach-Chats, Support-Anfragen und Zustimmungen:** solange dein Konto besteht. Einzelne Inhalte, zum Beispiel Pläne, Gewichtseinträge, Körperchecks oder Coach-Chats, kannst du vorher selbst löschen. Mit deinem Konto löschen wir sie vollständig (Abschnitt 10). Konten, die nicht mehr genutzt werden, löschen wir nicht automatisch; du kannst die Löschung jederzeit in der App oder per E-Mail verlangen.
- **Antworten aus der Einrichtung ohne Konto:** nur auf deinem Gerät, bis du ein Konto erstellst oder die App löschst.
- **Daten auf deinem Gerät:** bis du dich abmeldest oder die App löschst (Abschnitt 5).
- **Server-Protokolle:** ein Tag bei Supabase; bei PowerSync, solange sie für Betrieb und Sicherheit nötig sind (Abschnitt 4.13).
- **Begrenzung von Import, Planerstellung und Spracheingabe:** zwei Tage (Abschnitte 4.7 und 4.8).
- **Aufnahmen eingesprochener Fragen:** speichern wir nicht; die App löscht sie nach der Umwandlung (Abschnitt 4.8).
- **Protokolle des Coachs:** solange dein Konto besteht; die abgefragten Daten darin löschen wir mit dem jeweiligen Chat (Abschnitt 4.8).
- **Bei OpenAI:** bis zu 30 Tage (Abschnitte 4.6 bis 4.9).
- **Analysedaten bei PostHog:** ein Jahr (Abschnitt 4.14).
- **Abo-Daten bei RevenueCat:** siehe Abschnitt 4.12.
- **Backups:** Wir erstellen derzeit keine Backups unserer Datenbank und unseres Speichers. Ändert sich das, ergänzen wir hier, wie lange Backups aufbewahrt werden.

## 10. Konto löschen

Du kannst dein Konto jederzeit in der App löschen: in den Einstellungen unter „Konto löschen“. Dabei passiert Folgendes:

1. Hast du dich mit Apple angemeldet, bestätigst du das auf einem Apple-Gerät noch einmal bei Apple. Damit beenden wir die Verbindung zwischen deinem Apple Account und Loqqa: Unser Server tauscht die Bestätigung bei Apple gegen deine Anmeldeschlüssel und lässt sie sofort ungültig machen. Gespeichert wird dabei nichts.
2. Die App löscht dein Profilfoto, deine Körpercheck-Fotos und deine Support-Screenshots aus unserem Speicher.
3. Danach wird dein Konto gelöscht. Damit werden automatisch alle zugehörigen Daten in unserer Datenbank gelöscht: Profil, Pläne, Trainings, Gewichtseinträge, Körperchecks, Coach-Chats mit ihren Protokollen, Support-Anfragen mit allen Nachrichten und deine gespeicherten Zustimmungen. Die Kopie bei PowerSync wird dabei ebenfalls entfernt.
4. Zum Schluss meldet die App dich auf diesem Gerät ab und löscht die dort gespeicherten Daten.

**Ein laufendes Abo endet dadurch nicht.** Kündige es im App Store oder bei Google Play.

Auf anderen Geräten, auf denen du angemeldet warst, können lokal gespeicherte Daten bleiben, bis du dich dort abmeldest oder die App löschst. Analysedaten bei PostHog und Abo-Daten bei RevenueCat werden nicht automatisch mitgelöscht; schreib uns, wenn wir sie sofort löschen lassen sollen, sonst gelten die Fristen aus Abschnitt 9.

Klappt die Löschung nicht, zum Beispiel ohne Internetverbindung, zeigt die App einen Hinweis und du kannst es erneut versuchen. Du kannst die Löschung auch per E-Mail an support@useloqqa.com verlangen.

## 11. Deine Rechte

Du hast gegenüber uns folgende Rechte:

- **Auskunft** über die Daten, die wir über dich verarbeiten (Art. 15 DSGVO)
- **Berichtigung** falscher Daten (Art. 16 DSGVO); viele Angaben kannst du direkt in der App ändern, alle anderen ändern wir auf deine Nachricht hin
- **Löschung** deiner Daten (Art. 17 DSGVO); dein Konto kannst du direkt in der App löschen (Abschnitt 10)
- **Einschränkung** der Verarbeitung (Art. 18 DSGVO)
- **Datenübertragbarkeit** (Art. 20 DSGVO): Auf deine Anfrage per E-Mail schicken wir dir die Daten, die du uns bereitgestellt hast, innerhalb eines Monats als JSON-Datei.
- **Widerruf** erteilter Einwilligungen (Abschnitt 12)

**Widerspruchsrecht (Art. 21 DSGVO):** Wenn wir Daten auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO verarbeiten (berechtigte Interessen), zum Beispiel für die Produktanalyse mit PostHog, kannst du dieser Verarbeitung aus Gründen, die sich aus deiner besonderen Situation ergeben, jederzeit widersprechen. Wir verarbeiten die Daten dann nicht mehr, es sei denn, wir können zwingende schutzwürdige Gründe nachweisen, die deine Interessen überwiegen, oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.

Für alle Anliegen genügt eine E-Mail an support@useloqqa.com. Damit wir dein Konto zuordnen können, nenn uns bitte die E-Mail-Adresse, die die App in den Einstellungen anzeigt.

## 12. Einwilligungen widerrufen

Eine Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO). Die Verarbeitung bis zum Widerruf bleibt rechtmäßig.

- **Körpermaße:** per E-Mail an support@useloqqa.com. Wir löschen dann dein Gewicht, deine Größe und deine Gewichtseinträge. Ohne diese Angaben kann die App dein Training nur eingeschränkt anpassen; du kannst stattdessen auch dein Konto löschen (Abschnitt 10).
- **Körpercheck:** Lösche deine Checks in der App und mache keine neuen, oder schreib uns; dann löschen wir alle Körpercheck-Fotos und -Werte.
- **Coach:** per E-Mail an support@useloqqa.com. Wir vermerken dann deinen Widerruf. Für den Coach übermitteln wir Daten an OpenAI nur, wenn du ihm eine Frage stellst; stelle nach dem Widerruf also keine Fragen mehr, denn eine neue Frage gilt als erneute Einwilligung. Deine bisherigen Chats kannst du in der App löschen, oder schreib uns; dann löschen wir sie.

## 13. Beschwerde bei einer Aufsichtsbehörde

Du kannst dich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO), insbesondere in dem EU-Mitgliedstaat, in dem du wohnst oder arbeitest oder in dem der mutmaßliche Verstoß stattfand. Für uns zuständig ist das Bayerische Landesamt für Datenschutzaufsicht, Promenade 18, 91522 Ansbach, [www.lda.bayern.de](https://www.lda.bayern.de).

## 14. Musst du uns Daten geben?

Für ein Konto brauchen wir dein Google-Konto oder deinen Apple Account. Ohne Konto kannst du Loqqa nach der Einrichtung nicht nutzen. Die Angaben in der Einrichtung braucht die App, um dein Alter zu prüfen und deinen Plan zu erstellen und anzupassen. Freiwillig sind insbesondere dein Geschlecht (du kannst „Keine Angabe“ wählen), der Körpercheck, der Coach, Gewichtseinträge, ein Profilfoto und der Text „Über dich“.

## 15. Keine automatisierten Entscheidungen

Die App erstellt Pläne, Vorschläge, Auswertungen wie deine Sätze je Muskel, Körpercheck-Werte und die Antworten des Coachs automatisch; Pläne, die du dir erstellen lässt, die Körpercheck-Werte und die Antworten des Coachs stammen von einem KI-Modell von OpenAI (Abschnitte 4.6 bis 4.8). Das sind Informationen, Empfehlungen und Schätzungen für dein Training. Die Antworten des Coachs können falsch sein und sind keine medizinische Beratung. Entscheidungen, die dir gegenüber rechtliche Wirkung entfalten oder dich in ähnlicher Weise erheblich beeinträchtigen (Art. 22 DSGVO), treffen wir nicht.

## 16. Kinder und Jugendliche

Loqqa richtet sich an Personen ab dem Alter, ab dem sie in ihrem Land selbst in die Verarbeitung ihrer Daten einwilligen dürfen: in Deutschland ab 16 Jahren, in anderen Ländern je nach Recht dort ab 13 bis 16 Jahren. Die App fragt bei der Einrichtung nach deinem Geburtsdatum und lässt dich erst ab diesem Alter weiter; maßgeblich ist das Land, das in deinem Gerät eingestellt ist. Der Coach ist erst ab 16 Jahren verfügbar, auch in Ländern mit einem niedrigeren Mindestalter. Der Körpercheck ist erst ab 18 Jahren verfügbar. Beides prüft unser Server anhand des Geburtsdatums in deinem Profil.

Erfahren wir, dass ein Konto einer Person unter dem Mindestalter gehört, löschen wir es.

## 17. Sicherheit

Wir schützen deine Daten mit technischen und organisatorischen Maßnahmen, unter anderem mit:

- verschlüsselter Übertragung zwischen App und Servern (HTTPS/TLS)
- Zugriffsregeln in der Datenbank, durch die jedes Konto nur seine eigenen Daten lesen und ändern kann
- nicht öffentlichen Speicherbereichen für Profilfotos, Körpercheck-Fotos und Screenshots, in denen jedes Konto nur auf seinen eigenen Ordner zugreifen kann
- zeitlich begrenzten Links zur Anzeige von Fotos: eine Stunde für Körpercheck-Fotos und Screenshots, 24 Stunden für Profilfotos
- der Anmeldung über Google oder Apple, sodass wir keine Passwörter speichern

Kein System ist vollkommen sicher. Da die App Daten auf deinem Gerät speichert, schütze dein Gerät bitte mit einer Bildschirmsperre.

## 18. Änderungen dieser Datenschutzerklärung

Wir passen diese Datenschutzerklärung an, wenn sich die App oder die Rechtslage ändert. Die jeweils gültige Fassung findest du in der App in den Einstellungen und auf [useloqqa.com](https://useloqqa.com). Über wesentliche Änderungen informieren wir dich in der App und bitten dich, wo nötig, um deine Einwilligung.
$md$, '2026-11-07 10:00:00+00', false),
  ('terms', 'en', '1.5', $md$# Terms of Use

Version: 1.5

Last updated: 6 November 2026

This is a translation. The German version is legally binding.

These Terms of Use govern how you can use the Loqqa app. Please read them carefully. We explain how we handle your data in our Privacy Policy.

## 1. Provider and scope

The provider of the Loqqa app is:

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 Munich, Germany
- Email: support@useloqqa.com
- Website: [useloqqa.com](https://useloqqa.com)

Below, we refer to ourselves as “we”. These terms apply to all features of the app. For purchases via Apple’s App Store or via Google Play, the terms of the respective store also apply.

## 2. Minimum age

You must be at least old enough to consent to the processing of your data yourself in your country: in Germany 16 years, in other countries 13 to 16 years depending on local law. During setup, the app asks for your date of birth and only lets you continue from this age.

If you are not yet of legal age, you need the consent of your parents or legal guardians to buy Loqqa Pro. The coach is only available from age 16, the body check only from age 18.

## 3. Your account

- To use Loqqa after setup, you need an account. You create it at the end of setup with your Google account or, on Apple devices, your Apple Account. The contract for the use of Loqqa is concluded when you create your account.
- Provide truthful information during setup.
- Protect access to your Google account or Apple Account. If you suspect that someone else is using your account, let us know.
- Your account is personal and not transferable.

## 4. What Loqqa offers

Loqqa supports you with strength training. This includes in particular:

- a training plan that an AI model creates from your information, for example from goal, experience, equipment and workouts per week
- importing your training plan and your past workouts from a file, for example the export from another app
- logging your workouts with weights, reps and times, your history, records, your sets per muscle over a period you choose and suggestions for your sets
- recording your body weight
- the body check with photos and estimated values (from age 18)
- Kai, the AI coach: an AI model that answers your questions about your training, usually with a chart from your data, and on request puts together workouts and suggests replacing exercises (from age 16)
- an exercise catalog with instructions, images and videos
- a support chat for bug reports and ideas

You can go through setup, including plan creation or import, free of charge. After that, using Loqqa requires a subscription (Loqqa Pro, section 6). Without an active subscription, your account and your data are kept and you can still use the settings, support and account deletion; the other features are then locked.

Recognition during import can make mistakes. So check the recognized plan and the matching of your exercises before you accept them; the app asks you to review exercises for which the recognition is uncertain. A plan the app creates for you is also a suggestion: look it over and adjust it if needed. The coach’s answers can also be wrong, for example if the model misunderstands a question. So that the coach is not misused, you can ask it at most 20 questions in 24 hours and 150 questions in 30 days. For plan creation, import, the body check and the coach, the app needs an internet connection.

Many of Loqqa’s features also work without an internet connection. Your data is synced as soon as you are online. Changes that have not yet been synced when you sign out are lost; the app warns you beforehand.

Loqqa is a tool for your training. We do not owe you any particular training success.

## 5. Health notices

> Loqqa does not replace medical advice, diagnosis or treatment.

- Loqqa gives general training recommendations. The app does not offer medical, physiotherapeutic or nutritional advice. Loqqa is not a medical device and is not intended to detect, monitor or treat diseases.
- Get medical advice before starting a training program, especially if you have pre-existing conditions (for example of the cardiovascular system), complaints or injuries, after surgery, during pregnancy or breastfeeding and if you have not trained for a long time.
- The body check values, for example the estimated body fat percentage, are rough estimates by an AI model. They are not a medical measurement and not a diagnosis.
- The coach’s answers are general information and recommendations for your training, created by an AI model. They can be wrong and do not replace advice from a doctor or physiotherapist. The coach does not diagnose pain or injuries; have complaints that persist checked by a doctor.
- Plans and suggestions are a guide. Choose weights and reps so that you can complete them safely with clean technique. Use safety bars or a spotter for heavy weights.
- Stop immediately if you feel pain, dizziness, shortness of breath or pressure in your chest, and get medical help if needed.

## 6. Loqqa Pro, trial period and subscription

- **Purchase:** You buy Loqqa Pro in the app via Apple’s App Store or via Google Play. You conclude the purchase contract with Apple or Google, respectively. Payment, billing, renewal, cancellation and refunds are governed by the terms of the respective store.
- **Prices and terms:** Loqqa Pro is available as a monthly subscription and as an annual subscription. You can see the current prices in your currency before purchase in the app and in the store.
- **Trial period:** Loqqa Pro may start with a free trial period of 7 days. The store decides whether you can use it, usually once per store account. If you do not cancel in good time before the end of the trial, it automatically turns into a paid subscription. Before purchase, the app shows you on which day the paid subscription begins. We do not send you a separate reminder before the end of the trial period.
- **Renewal:** Your subscription automatically renews for the selected term if you do not cancel it in good time: in the App Store at least 24 hours before the end of the term, on Google Play before the renewal date.
- **Cancellation:** You cancel in the subscription settings of your store account. In the app, you can find the link to this under “Manage subscription”. After cancellation, Loqqa Pro remains active until the end of the paid term.
- **Important:** Deleting the app or your account does not cancel your subscription.
- **Restore purchases:** Loqqa Pro applies to the Loqqa account with which you bought it, on all devices on which you are signed in with it. Via “Restore purchases” on the Loqqa Pro screen of the app, you can reactivate a purchase from your store account; if you do this with a different Loqqa account, Loqqa Pro transfers to that account.
- **Refunds:** Refunds are governed by the terms of the respective store. Please contact Apple or Google, respectively.
- **Price changes:** Prices of active subscriptions can only change in accordance with the procedures of the respective store. The store informs you beforehand and, where required, obtains your consent. If you do not agree with a new price, you can cancel your subscription at the end of the term.

## 7. Right of withdrawal

As a consumer, you generally have a statutory right of withdrawal for contracts for digital content and digital services. Since you buy Loqqa Pro from Apple or Google, the stores inform you about this right, and exercising and processing the withdrawal are governed by their procedures.

## 8. Your content

Content that you put into Loqqa remains yours, for example plans, workout data, photos, your “About you” text, your support messages and your questions to the coach. You only grant us the non-exclusive, non-transferable rights we need to provide the app for you: storing, syncing, processing and displaying your content to you, and handling your support requests. These rights end when you delete the content or your account.

- Only upload content for which you have the necessary rights. You may only import training plans from coaches, books or apps to the extent that you are allowed to use them for your own training.
- Your photos and screenshots must not show any other people who have not consented.
- Unlawful, offensive or objectionable content is not allowed, including in the support chat or in questions to the coach.

We may use ideas and suggestions that you send us free of charge to improve Loqqa. There is no entitlement to implementation or compensation.

## 9. Support

In the app’s support chat, you can report bugs and suggest features. We reply to you there, usually within a few days. The response times stated in the app are guidelines, not a binding commitment. You can also reach us by email at support@useloqqa.com.

## 10. Permitted use

You may only use Loqqa privately for your own training. Commercial use, for example by coaches for their clients, is only permitted with our prior consent. In particular, it is not permitted:

- to circumvent technical protection measures or the subscription check
- to access the app or our servers in an automated way, to read out content on a large scale or to put excessive load on our servers
- to try to access other users’ data
- to decompile or modify the app, unless the law expressly permits it (§§ 69d, 69e of the German Copyright Act (UrhG))

The app, the exercise catalog with texts, images and videos, as well as trademarks and designs are legally protected. You receive a non-exclusive, non-transferable right to use them within the scope of these terms.

## 11. Availability, updates and changes to the app

- We strive to make Loqqa work reliably. However, we cannot promise uninterrupted availability of our servers, for example during maintenance or in the event of disruptions at our service providers. You can still use many features offline in that case.
- We provide you with updates that are necessary for Loqqa to function in accordance with the contract, in particular security updates (§ 327f of the German Civil Code (BGB)). Please install them promptly.
- We may change and further develop Loqqa if there is a valid reason for this (for example new technical requirements, security, further development of the app or a change in the legal situation), this does not cause you any additional costs and we inform you clearly and comprehensibly. If a change affects your access to Loqqa or its usability more than only insignificantly, we will inform you in advance. You can then terminate the contract free of charge in accordance with § 327r BGB.
- We update the exercise catalog on an ongoing basis.

## 12. Liability

- We are liable without limitation for intent and gross negligence, for injury to life, body or health, under the German Product Liability Act (ProdHaftG) and to the extent of a guarantee we have given.
- In the event of a slightly negligent breach of an essential contractual obligation, we are only liable for the foreseeable damage typical of the contract. Essential contractual obligations are obligations whose fulfillment makes the proper performance of the contract possible in the first place and on whose compliance you may regularly rely.
- Otherwise, we are not liable for slight negligence.
- These rules also apply to the personal liability of our representatives and vicarious agents.
- Your statutory rights in the event of defects in digital products (§§ 327 et seq. BGB) remain unaffected.

## 13. Term, termination and account deletion

- The contract for the use of Loqqa runs for an indefinite period.
- You can end it at any time by deleting your account in the app: in the settings under “Delete account”. You can also request deletion by email to support@useloqqa.com.
- We can terminate the contract with four weeks’ notice if you do not have an active subscription. A paid subscription remains unaffected until the end of the paid term.
- The right of both parties to terminate without notice for good cause remains unaffected. For us, good cause exists in particular in the case of serious or repeated violations of these terms.
- When your account is deleted, we delete your data as described in the Privacy Policy. We cannot restore deleted data.
- You cancel your subscription via the store (section 6).

## 14. Changes to these terms

We may change these terms, for example when we introduce new features or the legal situation changes. We show you the new version in the app, with the changes highlighted. Changes that materially affect your rights or obligations only take effect for you once you agree to them in the app. Until then, you can only use the settings, support and account deletion in the app. If you do not agree, you can end the contract at any time by deleting your account; you cancel your subscription in the store.

## 15. Final provisions

- **Applicable law:** The law of the Federal Republic of Germany applies, excluding the UN Convention on Contracts for the International Sale of Goods (CISG). As a consumer, you retain the protection of the mandatory provisions of the country in which you have your habitual residence.
- **Place of jurisdiction:** For merchants, legal entities under public law and special funds under public law, Munich is the place of jurisdiction. For consumers, the statutory places of jurisdiction apply.
- **Consumer dispute resolution:** We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.
- **Language:** These terms are available in German, English, Portuguese, Korean, Spanish and French. The German version is authoritative; the others are translations.
- **Invalid provisions:** If a provision of these terms is invalid, the rest of the contract remains valid. The statutory provisions take the place of the invalid provision.
$md$, '2026-11-07 10:00:00+00', false),
  ('privacy', 'en', '1.5', $md$# Privacy Policy

Version: 1.5

Last updated: 6 November 2026

This is a translation. The German version is legally binding.

Here you can find out which personal data we process when you use the Loqqa app, why we do so and what rights you have. This is based on the General Data Protection Regulation (GDPR), the German Federal Data Protection Act (BDSG) and the German Telecommunications Digital Services Data Protection Act (TDDDG).

## In short

- Loqqa first stores your plans and workouts on your device and syncs them with your account as soon as you are online. Our database is located in Frankfurt am Main.
- Other users cannot see your profile, your workouts or your photos.
- We treat your weight, your height and your body check photos as health data. We only process them with your explicit consent.
- For plan creation, importing your workouts, voice input, the body check, the coach and the translation of support messages, we use an AI model from OpenAI. For this, we transfer the necessary data to OpenAI, which processes it in the USA.
- To improve the app, we use PostHog to measure how it is used. Health data and photos are not sent to PostHog. The app contains no advertising.
- You can delete your account in the app at any time. This also deletes your photos and all data in your account.

## 1. Who is responsible?

The controller responsible for processing your data is:

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 Munich, Germany
- Email: support@useloqqa.com

Below, we refer to ourselves as “we”.

## 2. Data protection officer

We have not appointed a data protection officer because we are not required to do so. You can contact us directly at support@useloqqa.com with any questions about data protection.

## 3. How Loqqa works

Loqqa is a training app. You can have a training plan created for you or import your plan and your past workouts from another app or a spreadsheet, log your workouts and your body weight, ask the coach questions about your training and, from age 18, do body checks with photos.

The app works “offline first”: your data is kept in a database on your device so that you can train even without internet. When you are signed in and online, the app syncs this data with your account on our servers. This way, your plan and your history are backed up and available on all your devices. For the servers, we use service providers (section 7).

All data in our database is assigned to your account. Technical access rules ensure that only you can read and change your own data. Loqqa has no features that let other users see your profile, your workouts or your photos.

## 4. Which data we process and why

### 4.1 Setup without an account

You go through setup without an account. During setup, the app loads the exercise catalog (names, instructions, images and videos of the exercises) and these legal texts from our servers. It checks the exercise catalog for changes at startup and every hour after that. Only technically necessary connection data is generated in the process (section 4.13).

The app initially stores your answers during setup (for example first name, sex, date of birth, weight, height, goal and the created or imported plan) only on your device. This information is only sent to us when you create an account (sections 4.3 and 4.4). Exceptions: if you have a plan created for you, the app transfers your answers on goal, focus, equipment, workouts per week, workout duration and experience beforehand so that the plan can be created; from a file you import, it transfers excerpts, the names of the exercises and your plan so that they can be recognized (both section 4.7). It only transfers an imported workout history when you create an account.

Legal basis: Art. 6(1)(b) GDPR (providing the app you want to use).

### 4.2 Your account

At the end of setup, you create an account by signing in with your Google account or, on Apple devices, your Apple Account. There is no Loqqa password. In doing so, we process:

- the information Google or Apple transfers to us when you sign in, including your email address (see below)
- your first name, so that the app can fill it in again after you sign in on a new device
- technical account data such as the time of registration and of the last sign-in, as well as sign-in tokens

To keep you signed in, the app stores your sign-in session on your device.

**Sign in with Google:** When you sign in with Google, Google’s sign-in opens on your device. Google then confirms your sign-in to us and transfers your email address, your name, the address of your Google profile picture and an identifier of your Google account to us. We store this information with your account. Google learns in the process that you are signing in to Loqqa. Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland, is independently responsible for signing in via your Google account; [Google’s Privacy Policy](https://policies.google.com/privacy?hl=en) applies.

**Sign in with Apple** (only on Apple devices): When you sign in with Apple, Apple’s sign-in opens on your device. Apple then confirms your sign-in to us and transfers an identifier of your Apple Account and your email address to us. Instead, you can choose an address generated by Apple that forwards emails to you (“Hide My Email”). On the first sign-in, Apple also transfers your name if you share it. We store this information with your account. Apple Distribution International Limited, Hollyhill Industrial Estate, Hollyhill, Cork, Ireland, is independently responsible for signing in via your Apple Account; [Apple’s Privacy Policy](https://www.apple.com/legal/privacy/en-ww/) applies.

Accounts are only created at the end of setup. If signing in via “Sign in” on the welcome screen would create a new account, the app deletes it again immediately and tells you that there is no account yet.

Legal basis: Art. 6(1)(b) GDPR.

### 4.3 Profile and training planning

When you create an account, we store your information from setup as your profile. You can change some of it later in the settings and in your profile.

- first name, biological sex (“Prefer not to say” is also possible) and date of birth
- body weight, height and your preferred units (metric or imperial)
- training experience, training goal, focus muscle groups, available equipment, workouts per week and desired workout duration
- your app language, so that our support can reply to you in your language
- optional: a profile photo (the app stores it as a square image of 512 × 512 pixels) and a short “About you” text of up to 150 characters

Why: We need your date of birth to check the minimum age (section 16) and the age limits for the coach and the body check. If you have a training plan created for you, an AI model from OpenAI creates it from your training goal, focus, equipment, workouts per week, workout duration and experience (section 4.7). The coach also uses your goal, experience, equipment, focus and units for its answers (section 4.8). The app uses sex, age, weight and height for the body check (section 4.6). Your profile photo and “About you” are only shown to you in your profile.

Legal basis: Art. 6(1)(b) GDPR; for body weight and height, your consent (section 4.4).

### 4.4 Health data and your consent

Some information may allow conclusions to be drawn about your health. We therefore treat it as health data within the meaning of Art. 9 GDPR:

- **Body measurements:** your body weight, your weight entries and your height (sections 4.3 and 4.5).
- **Body check:** your body check photos and the values derived from them, for example an estimated body fat percentage (section 4.6).

We only process this data with your explicit consent (Art. 9(2)(a) in conjunction with Art. 6(1)(a) GDPR):

- **Body measurements:** When you create your account, you explicitly consent, via the notice directly above the button, to us processing your body data to tailor your training. Before that, weight and height stay on your device.
- **Body check:** Before the app sends your photos for assessment, it informs you that photos and body data will be transferred to OpenAI in the USA for this purpose. By tapping “Done”, you consent to this.
- **Coach:** For its answers, the coach also uses your weight entries and the overall scores of your body checks, and our server transfers your training and body data to OpenAI in the USA for this (section 4.8). By creating your account and accepting this Privacy Policy, you consent to this. We store the time of your consent. We only transfer this data when you ask the coach a question.

The body check and the coach are optional. You can withdraw your consent at any time with effect for the future (section 12).

### 4.5 Workout data and body weight

When you use Loqqa, we store:

- **Plans:** name, workouts per week, blocks with a deload week, workouts in their order (including workouts without a plan), exercises, sets with target values (reps or seconds), reps in reserve (RIR) and rest times
- **Completed workouts,** including ones you import: start and end, which plan and which plan week they count towards, exercises, weight and reps or seconds per set, the time of each completed set and personal records
- **Custom exercises** that you create or that are created during import
- **Body weight:** the weight entries you record, one value per day

Why: so that you can log your workouts and your weight and see your history, records, your sets per muscle over a period you choose and your activity. The app calculates suggestions for your sets and the number of your sets per muscle on your device. If you ask the coach, it answers your question from this data (section 4.8).

Legal basis: Art. 6(1)(b) GDPR; for the weight entries, your consent (section 4.4).

### 4.6 Body check

The body check is optional and only available from age 18. For it, you take three photos with the camera: from the front, from the side and from behind. The app recommends wearing underwear or tight-fitting sportswear for this. Your face may be visible in the photos.

The app reduces the photos to a maximum width of 1080 pixels and stores them on your device. When you start the assessment, it uploads the photos to a non-public storage area of your account. They stay there so that you can also see them on your other devices. You need an internet connection for the assessment.

**Assessment by an AI model from OpenAI:** An AI model from OpenAI determines the values of your check. For this, our server transfers to OpenAI:

- the three photos of this check and, if available, the photos of your previous check, so that the model can compare changes directly
- sex, age (calculated from your date of birth), height, weight and training experience from your profile
- the values of your previous check, so that the values remain comparable from check to check

We do not transfer your name, your email address or your account ID. OpenAI processes the data in the USA (section 8). We have configured OpenAI not to store the request for later retrieval. OpenAI does not use data from its API to train its models and retains it for up to 30 days to detect abuse; after that, it is deleted.

The model first checks whether the photos can be assessed, for example whether they are bright enough and your body is visible at least from head to knees. If a photo cannot be assessed, the app asks you to retake it. Otherwise, the model provides values for six muscle groups (shoulders, chest, arms, back, abs, legs), an estimated body fat percentage and values for proportions and definition. From these, our server calculates the overall score. We store these values with your check.

Before our server assesses a check, it checks with RevenueCat whether your account has Loqqa Pro (section 4.12). We log every assessment with its time and result. This way, we limit the number of assessments per day and ensure that stored values come from an assessment. We delete the log together with your account.

The values are rough estimates and not a medical measurement or diagnosis.

**Who has access:** Technically, only the operator of Loqqa, Jan Timo Hünnebeck, can access the storage area. He only looks at body check photos if you ask for this in support, if it is necessary to fix a bug you report, or if we are legally required to do so.

You can delete individual checks in the app. The app then deletes the photos on your device and in our storage. If your device is offline at the time, photos may remain in our storage until you delete your account; in that case, write to us and we will delete them.

Legal basis: your explicit consent (section 4.4), including for the transfer to OpenAI in the USA (Art. 49(1)(a) GDPR, in addition to the safeguards in section 8).

### 4.7 Import, plan creation and exercises by voice

You can import your workouts from another app or a spreadsheet: as a CSV, TSV, Excel or OpenDocument file, for example the export from Hevy or Strong. The file can contain your workout history, your training plan or both. Please make sure that the file contains no data of other people.

**Reading on your device:** The app opens the file and reads its rows on your device. It does not transfer your entire workout history to our server for this.

**Recognition by an AI model from OpenAI:** So that the app understands how your file is structured and which exercises are meant, it transfers to our server, together with your app language: the file name and the names of the sheets, for each sheet the header row, a selection of at most 150 rows (from the beginning, the middle and the end) and information on each column (for example how many cells are filled and frequent values), the names of the exercises in your history with the number of their sets and a typical weight, and the rows of your plan if the file contains one. The server passes them, together with our exercise catalog, to an AI model from OpenAI. It recognizes which columns contain, for example, the date, exercise, weight and reps, matches the names of the exercises to our catalog and reads out the workouts, exercises, sets, reps and rest times of your plan. If the file does not contain a plan, the app puts one together from your workouts of the last six weeks; for workouts without a name, the model suggests one and, for this, only receives their exercises and how often you did them. We do not transfer any other data in the process: the requests contain neither your account nor your name. OpenAI processes the data in the USA (section 8). We have configured OpenAI not to store the request for later retrieval. OpenAI does not use data from its API to train its models and retains it for up to 30 days to detect abuse.

Our server does not store your file or the excerpts transferred; it only returns the result to the app. What you accept at the end is stored: the workouts from your history as completed workouts and the plan you confirm (section 4.5). If a workout starts at the same time as a workout in your account, the app does not add it again. The app creates exercises that our catalog does not know as custom exercises in your account. If you import your history during setup, it stays on your device until you create your account and is then transferred to your account.

**Plan creation by an AI model from OpenAI:** If you have a plan created for you, the app transfers your answers on training goal, focus muscle groups, equipment, workouts per week, workout duration and training experience, as well as your app language, to our server. The server passes them, together with the exercises from our catalog that match your equipment, to an AI model from OpenAI, which puts together your plan from them. We do not transfer your name, your date of birth, sex, weight or height in the process, and the request does not contain your account. The same applies to the processing at OpenAI as for the import. Our server does not store your answers in the process; it only returns the plan to the app, where you can change it.

**Exercises by voice:** When setting up a plan, editing a workout and putting together a free workout, you can say exercises with their sets and reps instead of looking them up one by one. Your operating system’s speech recognition turns what you say into text: Apple’s on the iPhone, Google’s on Android devices. Depending on the device, this happens on the device itself or on Apple’s or Google’s servers; their privacy policies apply to it. We do not receive the recording itself. The app transfers the text, which you can still change before adding the exercises, together with your app language to our server. The server passes it, together with our exercise catalog, to an AI model from OpenAI, which recognizes the exercises with their sets and reps. The request contains neither your account nor your name. The same applies to the processing at OpenAI as for the import. Our server does not store the text.

**Request limits:** To prevent import, plan creation and exercises by voice from being misused, we limit how often they can be used per network and in total per day. For this, our server stores for each request the time, which of these features it concerned, and a hash of your IP address, which it generates with a secret key; we do not store the IP address itself. We delete entries older than two days with every new request.

Legal basis: Art. 6(1)(b) GDPR for the import, plan creation and exercises by voice you start, including for the transfer to OpenAI in the USA. For the request limits, Art. 6(1)(f) GDPR; our legitimate interest is to prevent misuse and unnecessary costs.

### 4.8 Kai · AI coach

With Loqqa Pro, you can ask Kai, the app's AI coach, questions about your own training, for example “How has my weight developed?”. The coach answers in a few sentences, usually with a chart from your data. It also answers general training questions, such as how often you should train legs or which exercise you can do if something hurts. If you ask, it can also put together a workout, show one of your saved workouts or suggest replacing exercises in your plan; your plan only changes once you confirm this in the app. It does not make a diagnosis. Kai is an AI, not a person. The coach is optional and only available from age 16. You need an internet connection for it.

**Answers by an AI model from OpenAI:** The app transfers your question, together with your app language and your device’s time zone, to our server. The server passes the question to an AI model from OpenAI. If the model needs data, it requests it from our server: the server calculates the values from your stored data and transfers the results to OpenAI. From these, the model writes the answer. With every question, our server transfers to OpenAI:

- your question and the last up to six questions of this chat with their answers and the data looked up for them
- today’s date, your units and your app language
- training goal, training experience, equipment and focus muscle groups from your profile, as well as the name and workouts per week of your active plan
- the workouts of your active plan with their exercises and where they stand this week (done, next or open), and the names of your other saved workouts
- the number of your workouts with the date of the first and the last one, the number of your weight entries with the date of the first one, and the number of your body checks
- the exercises you have done, including custom exercises: name, how you log them, in how many workouts you did them and when you last did them

Depending on the question, our server also transfers what it calculates from your data for it:

- workouts with date, name, duration, exercises and sets (weight, reps, seconds and RIR)
- values per workout, for example the estimated one-rep max (1RM), the heaviest weight, reps, hold time, volume and records
- your weight entries and a smoothed weight trend
- the overall scores of your body checks, without photos and without individual values such as the body fat percentage
- workouts, sets, volume and training time per week or month, training breaks and the weekdays of your workouts
- sets per muscle group and per exercise
- the exercises, sets and targets of a saved workout, when the coach shows it to you or suggests a change to it
- exercises from the app’s catalog, when the coach puts together a workout or suggests a replacement, with the ones you have done most first

We do not transfer your name, your email address, your account ID, your date of birth and age, your sex, your height, your profile photo, your “About you” text, your body check photos or your support messages. Please do not write data of other people in your questions. OpenAI processes the data in the USA (section 8). We have configured OpenAI not to store the request for later retrieval. OpenAI does not use data from its API to train its models and retains it for up to 30 days to detect abuse; after that, it is deleted.

The answers are written by an AI model. They can be wrong. They are information and recommendations for your training, not medical advice and not a diagnosis.

Before our server answers a question, it checks your age using the date of birth in your profile, your consent (section 4.4) and, with RevenueCat, whether your account has Loqqa Pro (section 4.12).

**Questions by voice:** You can also say your question. The app then records via the microphone until you end the recording, for at most two minutes, and transfers the recording together with your app language to our server. The server passes it to a speech recognition model from OpenAI, which turns it into text. So that terms like “bench press” are recognized correctly, it sends a short note on the topic along with it (questions to a training coach and typical terms). The app shows the text in the input field, where you can change it; it only becomes your question when you send it. We do not store your recording: our server only passes it on, and the app deletes it on your device as soon as the text is there or you discard the recording. Please do not record other people. The same applies to the processing at OpenAI as for the answers (USA, no use for training, retention of up to 30 days to detect misuse). For this, too, our server checks your age and whether your account has Loqqa Pro. To prevent the conversion from being misused, you can use it at most 100 times in 24 hours. For this, our server stores for each conversion the time and a hash of your account ID, which it generates with a secret key; we delete entries older than two days with every new conversion.

**What we store:** We store your chats with the questions, the answers and the charts below the answers in our database. The app syncs them to your devices so that you can see your chats there (section 5). For each question, we also store a log that the app does not show: time, status (for example whether an answer was given), the model used, the number of tokens (text units that OpenAI bills by) and the duration, plus the model’s lookups with the data looked up. We need these lookups so that the coach can answer follow-up questions about an answer.

**Question limits:** To prevent the coach from being misused and to avoid unnecessary costs, you can ask at most 20 questions in 24 hours and 150 questions in 30 days. For this, our server counts the logs.

You can delete chats in the app, including several at once. We then delete their questions, answers and charts and the looked-up data in their logs. Time, status, model, tokens and duration are kept so that the limits continue to apply and we can keep track of the coach’s costs. Otherwise, we keep your chats until you delete them or your account. When you delete your account, we delete all chats and logs (section 10).

Legal basis: your explicit consent (section 4.4), including for the transfer to OpenAI in the USA (Art. 49(1)(a) GDPR, in addition to the safeguards in section 8). For turning a spoken question into text, Art. 6(1)(b) GDPR, as you start it, including for the transfer to OpenAI in the USA. For the limits on questions and conversions and the information on time, status, model, tokens and duration, Art. 6(1)(f) GDPR; our legitimate interest is to prevent misuse and unnecessary costs.

### 4.9 Support

You can write to us directly in the app via “Report a bug” and “Request a feature”, or you can write to support@useloqqa.com. In the app, we process:

- the type of your request (bug or idea), for ideas the importance from 1 to 5, your messages and the subject (the first line of your first message)
- up to five screenshots per message that you select from your photo library; the app reduces them (longest side at most 1600 pixels) and saves them as JPEG
- the history of your request, for example status changes, our replies and whether you reopened a request
- the device you send a request from: platform (iOS or Android), operating system version, device model and app version, so that we can trace errors
- your app language, so that we can translate our replies into your language
- the detected language of each message and its translations (see below)

**Translation by an AI model from OpenAI:** So that we understand you and you can read our replies in your language, an AI model from OpenAI translates support messages. For this, our server transfers every message containing text to OpenAI, together with the language to translate it into: your messages, to detect their language and translate them into the language of our support, and our replies, to translate them into your app language. If you change your app language, we translate our earlier replies into the new language. We do not transfer your name, your email address, your account ID or your screenshots. We store the translations with the messages; in the app, you can show the original at any time. OpenAI processes the data in the USA (section 8). We have configured OpenAI not to store the request for later retrieval. OpenAI does not use data from its API to train its models and retains it for up to 30 days to detect abuse; after that, it is deleted.

**Messages by voice:** You can also say your message out loud. This works like questions to the coach (section 4.8): the app records until you end the recording, for at most two minutes. Our server passes the recording with a short note on the topic to a speech recognition model from OpenAI. The app shows the text in the input field, where you can change it; it only becomes your message once you send it. We don't store your recording. Here too, our server checks your age and whether your account has Loqqa Pro, and the same limit applies.

**Who sees your request:** We handle requests in an internal support area in the browser that only Jan Timo Hünnebeck can access, with a separate login. For your request, the support area also shows your email address, whether you sign in with Apple or Google, your account ID, when you created your account and were last active, your app language and your earlier requests.

The app first stores screenshots on your device and then uploads them in the background. You cannot delete messages and requests yourself, so that the history remains traceable. They are deleted together with your account; on request, we also delete closed requests earlier. We keep emails for as long as we need them for your request.

Please do not send us health data or data of other people in messages and screenshots if they are not necessary for your request. We also transfer messages to OpenAI for translation.

Legal basis: Art. 6(1)(b) GDPR, insofar as your request concerns the use of the app, for example in the case of bugs. For ideas and other feedback, Art. 6(1)(f) GDPR; our legitimate interest is to answer your request and improve Loqqa. This also applies to the translation and the transfer to OpenAI in the USA (section 8).

### 4.10 Legal texts and agreements

The app loads the currently valid version of the Terms of Use and of this Privacy Policy in your language. When you agree to a version, at registration or later to a changed version, we store which version you agreed to, the time (set by the server), the app version and the platform (iOS or Android). This allows us to prove which version applies to you and to ask you again for your agreement in the event of material changes.

Legal basis: Art. 6(1)(c) in conjunction with Art. 7(1) GDPR (proof of consent) and Art. 6(1)(f) GDPR (our legitimate interest in being able to prove which terms apply).

### 4.11 Loqqa Pro: subscriptions and purchases

You buy Loqqa Pro via Apple’s App Store or via Google Play. Apple or Google, respectively, handle the purchase and payment. They are responsible for this themselves and process your payment data in accordance with their own privacy policies: [Apple](https://www.apple.com/legal/privacy/en-ww/) and [Google](https://policies.google.com/privacy?hl=en). We do not receive payment data such as credit card numbers.

So that we can unlock Loqqa Pro, we learn via RevenueCat (section 4.12) which subscription you bought, whether a trial period is running, when you bought it and whether the subscription is active. The app stores this status on your device and queries it again at startup and every time you sign in. We do not store purchase data in our own database.

You manage and cancel your subscription in the settings of your store account. The app links there under “Manage subscription”.

Legal basis: Art. 6(1)(b) GDPR.

### 4.12 Subscription management with RevenueCat

We manage purchases and subscriptions via RevenueCat. On our behalf, RevenueCat checks the store’s purchase receipts and tells the app whether Loqqa Pro is active. Before our server assesses a body check or answers a question to the coach, it asks RevenueCat whether your account has Loqqa Pro.

So that RevenueCat can assign your purchases to your account, we transfer your account ID, a random identifier without a name or email address. If you buy before creating your account, RevenueCat first assigns its own random identifier and then assigns the purchase to your account. RevenueCat also processes purchase and subscription information from the store (for example product, price, currency, purchase, renewal and expiry dates, trial period and transaction identifiers) as well as technical information such as platform, device type, app version and IP address.

RevenueCat also sends events about your subscription to PostHog (section 4.14), for example a started or converted trial, renewals and cancellations, each with the revenue. For this, the app gives RevenueCat your PostHog identifier: a random identifier before you create your account, your account ID after that.

- Provider: RevenueCat, Inc., 1032 E Brandon Blvd #3003, Brandon, FL 33511, USA, as our processor
- Storage location: USA (Amazon Web Services); for the safeguard, see section 8
- Storage period: as long as our contract with RevenueCat exists; we have data relating to your account deleted when you delete your account, unless legal obligations prevent this

Legal basis: Art. 6(1)(b) GDPR.

### 4.13 Technically necessary connection data

Whenever the app is connected to our servers (for example when signing in, syncing, uploading or loading the exercise catalog and legal texts), technically necessary data is processed: your IP address, date and time, the interface accessed and technical information such as status codes and, where transmitted, information about the app and operating system. Our hosting providers log this data to ensure operation and security. At Supabase, the logs are deleted after one day; at PowerSync, as soon as they are no longer needed for operation and security.

Legal basis: Art. 6(1)(f) GDPR; our legitimate interest is stable and secure operation.

### 4.14 Product analytics and error reports with PostHog

To understand how Loqqa is used and to find bugs, we use PostHog. For this, the app sends:

- **Usage events:** which screens you open and certain steps, for example the start of setup, created or imported plans, imported workout histories (only their size, never their content), views of the Loqqa Pro screen, purchases, registration and sign-in, the start, end or cancellation of a workout, that you asked the coach a question and whether it answered (never the text), the assessment of a body check (never the values), saving a weight entry (never the weight), exercises added by voice, requests for a store rating, each with the time and metrics such as the number of exercises or sets, duration or error code
- **Subscription events:** started or converted trials, renewals and cancellations with the revenue, sent by RevenueCat (section 4.12)
- **App events:** opening and closing the app, app version, device type, operating system and language
- **Error reports:** crash and error messages with technical details
- **Profile information:** after registration, goal, experience, workouts per week, split, equipment, language, units, an age group (for example “25–34”) and whether you have Loqqa Pro
- **a pseudonymous identifier:** before registration, a random identifier that the app stores on your device, after that your account ID, so that events before and after registration are merged

Your name, your email address, weight, height, your date of birth, body check photos and values, and free text are not sent to PostHog. PostHog does not store your IP address, and we do not use session recordings. When you sign out, the app resets the identifier.

- Provider: PostHog, Inc., 2261 Market St. #4008, San Francisco, CA 94114, USA, as our processor
- Storage location: PostHog Cloud EU (Frankfurt am Main); PostHog is certified under the EU-US Data Privacy Framework (section 8)
- Storage period: events are deleted after one year

Legal basis: Art. 6(1)(f) GDPR; our legitimate interest is to improve Loqqa and fix bugs. You can object to this at any time (section 11), for example by email to support@useloqqa.com; we will then delete the analytics data relating to your account.

## 5. Storage on your device

So that Loqqa also works offline, the app stores data on your device:

- a local database with your profile, your plans and workouts, your weight entries, your body check values, your coach chats, your support requests and your agreements
- body check photos that you took on this device, and copies of your support screenshots
- your sign-in session, your answers from setup, a workout history imported during setup until it is in your account, your subscription status, settings such as the app language, and lists of files that still need to be uploaded
- the exercise catalog
- the identifier and not yet sent events for PostHog (section 4.14)

Except for the data for PostHog, this storage is strictly necessary for the services you want to use (§ 25(2) no. 2 TDDDG).

When you sign out, the app deletes the local database as well as your body check photos and screenshot copies on this device and resets setup, subscription status, ongoing workouts and an import that has not yet been transferred. Changes not yet synced are lost in the process; the app warns you beforehand. Settings such as the app language are kept. When you delete the app, your operating system usually removes all of the app’s data.

Depending on your device settings, the app’s files, including body check photos, may be included in backups of your device (for example with iCloud or Google). Apple or Google, respectively, are responsible for these backups.

## 6. Permissions on your device

Loqqa only asks for a permission when you use a feature that needs it:

- **Camera:** for body check photos and for your profile photo
- **Photos:** to select images for support screenshots and for your profile photo. For this, the app uses your operating system’s image picker and only receives the images you select.
- **Files:** to select a file with your workouts via your operating system’s file picker (section 4.7)
- **Microphone:** to say exercises (section 4.7), questions to the coach (section 4.8) and messages to support (section 4.9). The app only records while you use voice input.
- **Speech recognition (iPhone):** so that Apple’s speech recognition can turn spoken exercises into text (section 4.7)

Loqqa does not ask for access to location, contacts or health apps such as Apple Health or Health Connect, and does not send push notifications. You can revoke permissions at any time in your device settings.

## 7. Recipients and processors

We only pass on your data if this is necessary for the purposes stated, you have consented or we are legally required to do so. Our service providers process data on our behalf and in accordance with our instructions (Art. 28 GDPR):

- **Supabase, Inc.** (database, sign-in, file storage and server functions): servers in Frankfurt am Main (Amazon Web Services)
- **PowerSync** by Journey Mobile, Inc. (syncing between the app and the database; for this, the service keeps a copy of your synced data): servers in the EU
- **OpenAI Ireland Ltd.**, 117–126 Sheriff Street Upper, Dublin 1, Ireland (AI creation of plans, recognition of imported workout files and spoken exercises, assessment of body check photos, the coach’s answers, turning spoken questions into text and translation of support messages, sections 4.6 to 4.9): processing in the USA by OpenAI OpCo, LLC
- **RevenueCat, Inc.** (subscription management, section 4.12)
- **PostHog, Inc.** (product analytics and error reports, section 4.14)

Apple and Google receive data as independent controllers for app downloads and purchases (section 4.11), as well as for signing in via their account (section 4.2) and for their operating system’s speech recognition (section 4.7).

Loqqa is run by one person: only Jan Timo Hünnebeck has access to your data, to the extent he needs it for operation and support.

We only provide data to authorities and courts if we are legally required to do so.

## 8. Transfers to third countries

We store your account, your workouts and your photos in data centers in the EU (Supabase in Frankfurt am Main, PowerSync in the EU). Some of our service providers are based in the USA. Data may therefore also be transferred to the USA, for example during maintenance or support by the service provider. For plan creation, importing your workouts, spoken exercises and questions, the assessment of the body check, the coach’s answers and the translation of support messages, we transfer data to OpenAI in the USA with every request (sections 4.6 to 4.9), and RevenueCat processes the subscription data in the USA (section 4.12).

We base these transfers on the following safeguards:

- **PostHog:** adequacy decision of the EU Commission for the EU-US Data Privacy Framework, under which PostHog is certified (Art. 45 GDPR)
- **Supabase, PowerSync, OpenAI and RevenueCat:** standard contractual clauses of the EU Commission (Art. 46(2)(c) GDPR), which are part of our data processing agreements
- **Body check and coach:** additionally your explicit consent (Art. 49(1)(a) GDPR). In the USA, authorities may under certain circumstances access data without you having the same legal remedies against this as in the EU.

You can request a copy of the standard contractual clauses from us.

## 9. How long we store your data

- **Account, profile, plans, workouts, weight entries, body checks, coach chats, support requests and agreements:** as long as your account exists. You can delete individual content yourself beforehand, for example plans, weight entries, body checks or coach chats. When you delete your account, we delete them completely (section 10). We do not automatically delete accounts that are no longer used; you can request deletion at any time in the app or by email.
- **Answers from setup without an account:** only on your device, until you create an account or delete the app.
- **Data on your device:** until you sign out or delete the app (section 5).
- **Server logs:** one day at Supabase; at PowerSync, as long as they are needed for operation and security (section 4.13).
- **Limits on import, plan creation and voice input:** two days (sections 4.7 and 4.8).
- **Recordings of spoken questions:** we do not store them; the app deletes them after the conversion (section 4.8).
- **Coach logs:** as long as your account exists; we delete the looked-up data in them together with the respective chat (section 4.8).
- **At OpenAI:** up to 30 days (sections 4.6 to 4.9).
- **Analytics data at PostHog:** one year (section 4.14).
- **Subscription data at RevenueCat:** see section 4.12.
- **Backups:** We currently do not create backups of our database and our storage. If this changes, we will add here how long backups are kept.

## 10. Deleting your account

You can delete your account in the app at any time: in the settings under “Delete account”. The following then happens:

1. If you signed in with Apple, you confirm this once more with Apple on an Apple device. This ends the connection between your Apple Account and Loqqa: our server exchanges the confirmation with Apple for your sign-in keys and has them revoked immediately. Nothing is stored in the process.
2. The app deletes your profile photo, your body check photos and your support screenshots from our storage.
3. Your account is then deleted. This automatically deletes all associated data in our database: profile, plans, workouts, weight entries, body checks, coach chats with their logs, support requests with all messages and your stored agreements. The copy at PowerSync is also removed in the process.
4. Finally, the app signs you out on this device and deletes the data stored there.

**This does not end an active subscription.** Cancel it in the App Store or on Google Play.

On other devices on which you were signed in, locally stored data may remain until you sign out there or delete the app. Analytics data at PostHog and subscription data at RevenueCat are not automatically deleted as well; write to us if you want us to have them deleted immediately, otherwise the periods from section 9 apply.

If deletion does not work, for example without an internet connection, the app shows a notice and you can try again. You can also request deletion by email to support@useloqqa.com.

## 11. Your rights

You have the following rights with respect to us:

- **Access** to the data we process about you (Art. 15 GDPR)
- **Rectification** of incorrect data (Art. 16 GDPR); you can change much of the information directly in the app, we change everything else when you message us
- **Erasure** of your data (Art. 17 GDPR); you can delete your account directly in the app (section 10)
- **Restriction** of processing (Art. 18 GDPR)
- **Data portability** (Art. 20 GDPR): on your request by email, we will send you the data you provided to us as a JSON file within one month.
- **Withdrawal** of consent given (section 12)

**Right to object (Art. 21 GDPR):** If we process data on the basis of Art. 6(1)(f) GDPR (legitimate interests), for example for product analytics with PostHog, you can object to this processing at any time on grounds relating to your particular situation. We will then no longer process the data, unless we can demonstrate compelling legitimate grounds that override your interests, or the processing serves the establishment, exercise or defense of legal claims.

For all requests, an email to support@useloqqa.com is enough. So that we can identify your account, please tell us the email address the app shows in its settings.

## 12. Withdrawing consent

You can withdraw consent at any time with effect for the future (Art. 7(3) GDPR). Processing carried out before the withdrawal remains lawful.

- **Body measurements:** by email to support@useloqqa.com. We will then delete your weight, your height and your weight entries. Without this information, the app can only tailor your training to a limited extent; alternatively, you can also delete your account (section 10).
- **Body check:** Delete your checks in the app and do not do any new ones, or write to us; we will then delete all body check photos and values.
- **Coach:** by email to support@useloqqa.com. We will then record your withdrawal. For the coach, we only transfer data to OpenAI when you ask it a question, so ask no more questions after withdrawing: a new question counts as consenting again. You can delete your earlier chats in the app, or write to us; we will then delete them.

## 13. Complaint to a supervisory authority

You can lodge a complaint with a data protection supervisory authority (Art. 77 GDPR), in particular in the EU member state in which you live or work or in which the alleged infringement took place. The authority responsible for us is the Bayerisches Landesamt für Datenschutzaufsicht (Bavarian Data Protection Authority), Promenade 18, 91522 Ansbach, Germany, [www.lda.bayern.de](https://www.lda.bayern.de).

## 14. Do you have to give us data?

For an account, we need your Google account or your Apple Account. Without an account, you cannot use Loqqa after setup. The app needs the information from setup to check your age and to create and adapt your plan. In particular, your sex (you can choose “Prefer not to say”), the body check, the coach, weight entries, a profile photo and the “About you” text are optional.

## 15. No automated decisions

The app creates plans, suggestions, evaluations such as your sets per muscle, body check values and the coach’s answers automatically; plans you have created for you, the body check values and the coach’s answers come from an AI model from OpenAI (sections 4.6 to 4.8). These are information, recommendations and estimates for your training. The coach’s answers can be wrong and are not medical advice. We do not make decisions that produce legal effects concerning you or similarly significantly affect you (Art. 22 GDPR).

## 16. Children and teenagers

Loqqa is aimed at people who have reached the age at which they may consent to the processing of their data themselves in their country: in Germany from age 16, in other countries from age 13 to 16 depending on local law. During setup, the app asks for your date of birth and only lets you continue from this age; the country set on your device is decisive. The coach is only available from age 16, even in countries with a lower minimum age. The body check is only available from age 18. Our server checks both using the date of birth in your profile.

If we learn that an account belongs to a person under the minimum age, we will delete it.

## 17. Security

We protect your data with technical and organizational measures, including:

- encrypted transmission between the app and servers (HTTPS/TLS)
- access rules in the database through which each account can only read and change its own data
- non-public storage areas for profile photos, body check photos and screenshots, in which each account can only access its own folder
- time-limited links for displaying photos: one hour for body check photos and screenshots, 24 hours for profile photos
- signing in via Google or Apple, so that we store no passwords

No system is completely secure. As the app stores data on your device, please protect your device with a screen lock.

## 18. Changes to this Privacy Policy

We adapt this Privacy Policy when the app or the legal situation changes. You can find the currently valid version in the app in the settings and at [useloqqa.com](https://useloqqa.com). We will inform you about material changes in the app and, where necessary, ask for your consent.
$md$, '2026-11-07 10:00:00+00', false),
  ('terms', 'pt-PT', '1.5', $md$# Termos de Utilização

Versão: 1.5

Última atualização: 6 de novembro de 2026

Esta é uma tradução. A versão alemã é a juridicamente vinculativa.

Estes Termos de Utilização regulam a forma como podes utilizar a app Loqqa. Lê-os com atenção, por favor. A forma como tratamos os teus dados é explicada na nossa Política de Privacidade.

## 1. Fornecedor e âmbito de aplicação

O fornecedor da app Loqqa é:

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 Munique, Alemanha
- E-mail: support@useloqqa.com
- Website: [useloqqa.com](https://useloqqa.com)

Daqui em diante, designamo-nos por “nós”. Estes termos aplicam-se a todas as funções da app. Às compras efetuadas através da App Store da Apple ou do Google Play aplicam-se, adicionalmente, os termos da respetiva loja.

## 2. Idade mínima

Tens de ter, pelo menos, a idade a partir da qual, no teu país, podes consentir tu próprio no tratamento dos teus dados: na Alemanha, 16 anos; noutros países, consoante a lei local, entre 13 e 16 anos. Na configuração inicial, a app pergunta a tua data de nascimento e só te deixa avançar a partir dessa idade.

Se ainda não fores maior de idade, precisas do consentimento dos teus pais ou representantes legais para comprar o Loqqa Pro. O coach só está disponível a partir dos 16 anos e o check corporal só a partir dos 18 anos.

## 3. A tua conta

- Para utilizares o Loqqa depois da configuração inicial, precisas de uma conta. Crias a conta no final da configuração inicial com a tua Conta Google ou, em dispositivos Apple, com a tua Conta Apple. O contrato de utilização do Loqqa é celebrado quando crias a tua conta.
- Fornece dados verdadeiros na configuração inicial.
- Protege o acesso à tua Conta Google ou Conta Apple. Se suspeitares que outra pessoa está a utilizar a tua conta, informa-nos.
- A tua conta é pessoal e intransmissível.

## 4. O que o Loqqa oferece

O Loqqa apoia-te no treino de força. Isto inclui, em especial:

- um plano de treino criado por um modelo de IA a partir dos teus dados, por exemplo a partir do objetivo, da experiência, do equipamento e dos treinos por semana
- a importação do teu plano de treino e dos teus treinos anteriores a partir de um ficheiro, por exemplo da exportação de outra app
- o registo dos teus treinos com pesos, repetições e tempos, o teu histórico, os teus melhores valores, as tuas séries por músculo num período à tua escolha e sugestões para as tuas séries
- o registo do teu peso corporal
- o check corporal com fotos e valores estimados (a partir dos 18 anos)
- o Kai, o coach de IA: um modelo de IA que responde às tuas perguntas sobre o teu treino, geralmente com um gráfico feito a partir dos teus dados, e que, a teu pedido, monta treinos e sugere a substituição de exercícios (a partir dos 16 anos)
- um catálogo de exercícios com instruções, imagens e vídeos
- um chat de suporte para comunicar erros e enviar ideias

Podes fazer gratuitamente a configuração inicial, incluindo a criação de um plano ou a importação. Depois disso, a utilização do Loqqa pressupõe uma subscrição (Loqqa Pro, secção 6). Sem uma subscrição ativa, a tua conta e os teus dados mantêm-se e continuas a poder utilizar as definições, o suporte e a eliminação da conta; as restantes funções ficam então bloqueadas.

O reconhecimento na importação pode cometer erros. Por isso, verifica o plano reconhecido e a associação dos teus exercícios antes de os adotares; a app apresenta-te para verificação os exercícios cujo reconhecimento é incerto. Também um plano que a app cria para ti é uma sugestão: revê-o e ajusta-o, se necessário. Também as respostas do coach podem estar erradas, por exemplo se o modelo compreender mal uma pergunta. Para que o coach não seja utilizado de forma abusiva, podes fazer-lhe, no máximo, 20 perguntas em 24 horas e 150 perguntas em 30 dias. Para a criação de planos, a importação, o check corporal e o coach, a app precisa de ligação à internet.

Muitas funções do Loqqa funcionam também sem ligação à internet. Os teus dados são sincronizados assim que estiveres online. As alterações que ainda não estejam sincronizadas quando terminas sessão perdem-se; a app avisa-te antes disso.

O Loqqa é uma ferramenta de apoio ao teu treino. Não garantimos nenhum resultado de treino específico.

## 5. Avisos de saúde

> O Loqqa não substitui o aconselhamento, o diagnóstico nem o tratamento médicos.

- O Loqqa dá recomendações gerais de treino. A app não presta aconselhamento médico, fisioterapêutico nem nutricional. O Loqqa não é um dispositivo médico e não se destina a detetar, monitorizar ou tratar doenças.
- Antes de começares um programa de treino, procura aconselhamento médico, sobretudo se tiveres doenças preexistentes (por exemplo, do sistema cardiovascular), queixas ou lesões, depois de cirurgias, durante a gravidez ou a amamentação e se não treinas há muito tempo.
- Os valores do check corporal, por exemplo a percentagem estimada de gordura corporal, são estimativas aproximadas de um modelo de IA. Não são uma medição médica nem um diagnóstico.
- As respostas do coach são informações e recomendações gerais para o teu treino, criadas por um modelo de IA. Podem estar erradas e não substituem o aconselhamento de um médico ou fisioterapeuta. Em caso de dor ou lesão, o coach não faz diagnósticos; se as queixas persistirem, procura um médico.
- Os planos e as sugestões servem de orientação. Escolhe pesos e repetições que consigas fazer em segurança e com uma técnica correta. Com pesos elevados, utiliza sistemas de segurança ou pede a alguém que te ajude.
- Para de imediato se sentires dor, tonturas, falta de ar ou pressão no peito e, se necessário, procura ajuda médica.

## 6. Loqqa Pro, período experimental e subscrição

- **Compra:** compras o Loqqa Pro na app, através da App Store da Apple ou do Google Play. Celebras o contrato de compra com a Apple ou com a Google, respetivamente. O pagamento, a faturação, a renovação, o cancelamento e o reembolso regem-se pelos termos da respetiva loja.
- **Preços e durações:** o Loqqa Pro está disponível como subscrição mensal e como subscrição anual. Vês os preços atuais na tua moeda antes da compra, na app e na loja.
- **Período experimental:** o Loqqa Pro pode começar com um período experimental gratuito de 7 dias. É a loja que decide se o podes utilizar, regra geral uma vez por conta da loja. Se não cancelares atempadamente antes do fim do período experimental, este passa automaticamente a uma subscrição paga. Antes da compra, a app mostra-te em que dia começa a subscrição paga. Não te enviamos nenhum lembrete específico antes do fim do período experimental.
- **Renovação:** a tua subscrição renova-se automaticamente pela duração escolhida se não a cancelares atempadamente: na App Store, até 24 horas antes do fim do período, e no Google Play, antes da data de renovação.
- **Cancelamento:** cancelas a subscrição nas definições de subscrição da tua conta da loja. Na app, encontras a ligação para lá em “Gerir subscrição”. Após o cancelamento, o Loqqa Pro mantém-se ativo até ao fim do período pago.
- **Importante:** se eliminares a app ou a tua conta, a tua subscrição não é cancelada.
- **Restaurar compras:** o Loqqa Pro é válido para a conta Loqqa com que o compraste, em todos os dispositivos em que tenhas sessão iniciada com essa conta. Através de “Restaurar compras”, na página do Loqqa Pro da app, podes voltar a ativar uma compra da tua conta da loja; se o fizeres com outra conta Loqqa, o Loqqa Pro passa para essa conta.
- **Reembolsos:** os reembolsos regem-se pelos termos da respetiva loja. Para isso, contacta a Apple ou a Google, respetivamente.
- **Alterações de preço:** os preços das subscrições em curso só podem ser alterados de acordo com os procedimentos da respetiva loja. A loja informa-te previamente e, quando tal for obrigatório, pede o teu consentimento. Se não concordares com um novo preço, podes cancelar a tua subscrição no fim do período.

## 7. Direito de livre resolução

Enquanto consumidor, tens, em princípio, um direito legal de livre resolução nos contratos de fornecimento de conteúdos digitais e de serviços digitais. Como compras o Loqqa Pro à Apple ou à Google, são as lojas que te informam sobre este direito, e o exercício e o processamento da livre resolução regem-se pelos procedimentos delas.

## 8. Os teus conteúdos

Os conteúdos que colocas no Loqqa continuam a ser teus, por exemplo planos, dados de treino, fotos, o teu texto “Sobre ti”, as tuas mensagens de suporte e as tuas perguntas ao coach. Concedes-nos sobre eles apenas os direitos não exclusivos e intransmissíveis de que precisamos para te disponibilizar a app: guardar, sincronizar, tratar e mostrar-te os teus conteúdos, bem como tratar os teus pedidos de suporte. Estes direitos terminam quando eliminas os conteúdos ou a tua conta.

- Carrega apenas conteúdos sobre os quais tenhas os direitos necessários. Só podes importar planos de treino de treinadores, de livros ou de apps na medida em que os possas utilizar para o teu próprio treino.
- As tuas fotos e capturas de ecrã não podem mostrar outras pessoas que não tenham dado o seu consentimento.
- Não são permitidos conteúdos ilegais, ofensivos ou impróprios, nem mesmo no chat de suporte ou nas perguntas ao coach.

Podemos utilizar gratuitamente as ideias e sugestões que nos envias para melhorar o Loqqa. Não existe qualquer direito à sua implementação nem a uma remuneração.

## 9. Suporte

No chat de suporte da app, podes comunicar erros e sugerir funcionalidades. Respondemos-te lá, regra geral no prazo de poucos dias. Os tempos de resposta indicados na app são valores de referência e não um compromisso vinculativo. Também nos podes contactar por e-mail para support@useloqqa.com.

## 10. Utilização permitida

Só podes utilizar o Loqqa a título privado, para o teu próprio treino. A utilização comercial, por exemplo por treinadores para os seus clientes, só é permitida com o nosso consentimento prévio. Em especial, não é permitido:

- contornar medidas técnicas de proteção ou a verificação da subscrição
- aceder de forma automatizada à app ou aos nossos servidores, extrair conteúdos em massa ou sobrecarregar excessivamente os nossos servidores
- tentar aceder a dados de outros utilizadores
- descompilar ou modificar a app, salvo na medida em que a lei o permita expressamente (§§ 69d e 69e da Lei alemã dos Direitos de Autor (UrhG))

A app, o catálogo de exercícios com textos, imagens e vídeos, bem como as marcas e os designs, estão legalmente protegidos. Recebes um direito não exclusivo e intransmissível de os utilizar no âmbito destes termos.

## 11. Disponibilidade, atualizações e alterações da app

- Esforçamo-nos para que o Loqqa funcione de forma fiável. No entanto, não podemos garantir uma disponibilidade ininterrupta dos nossos servidores, por exemplo em caso de manutenção ou de falhas dos nossos prestadores de serviços. Mesmo nesses casos, podes utilizar muitas funções offline.
- Disponibilizamos-te as atualizações necessárias para que o Loqqa funcione em conformidade com o contrato, em especial atualizações de segurança (§ 327f do Código Civil alemão (BGB)). Instala-as, por favor, com brevidade.
- Podemos alterar e desenvolver o Loqqa se houver uma razão válida para tal (por exemplo, novos requisitos técnicos, segurança, desenvolvimento da app ou uma alteração da situação jurídica), se isso não te causar custos adicionais e se te informarmos de forma clara e compreensível. Se uma alteração afetar o teu acesso ao Loqqa ou a sua utilidade de forma mais do que insignificante, informamos-te previamente. Nesse caso, podes pôr termo ao contrato gratuitamente, nos termos do § 327r do BGB.
- Atualizamos continuamente o catálogo de exercícios.

## 12. Responsabilidade

- Respondemos sem limitação em caso de dolo e de negligência grosseira, em caso de ofensa à vida, à integridade física ou à saúde, nos termos da Lei alemã da Responsabilidade pelo Produto (Produkthaftungsgesetz) e na medida de uma garantia por nós assumida.
- Em caso de violação, por negligência leve, de uma obrigação contratual essencial, só respondemos pelos danos típicos do contrato e previsíveis. Obrigações contratuais essenciais são obrigações cujo cumprimento é condição indispensável para a boa execução do contrato e em cujo cumprimento podes normalmente confiar.
- De resto, não respondemos por negligência leve.
- Estas regras aplicam-se também à responsabilidade pessoal dos nossos representantes e auxiliares de cumprimento.
- Os teus direitos legais em caso de defeitos de produtos digitais (§§ 327 e seguintes do BGB) não são afetados.

## 13. Duração, cessação e eliminação da conta

- O contrato de utilização do Loqqa é celebrado por tempo indeterminado.
- Podes pôr-lhe termo a qualquer momento, eliminando a tua conta na app: nas definições, em “Eliminar conta”. Também podes pedir a eliminação por e-mail para support@useloqqa.com.
- Podemos denunciar o contrato com um pré-aviso de quatro semanas se não tiveres uma subscrição ativa. Uma subscrição paga não é afetada até ao fim do período pago.
- O direito de ambas as partes de resolver o contrato sem pré-aviso por justa causa não é afetado. Existe justa causa, para nós, em especial em caso de violações graves ou repetidas destes termos.
- Com a eliminação da tua conta, eliminamos os teus dados conforme descrito na Política de Privacidade. Não podemos recuperar dados eliminados.
- Cancelas a tua subscrição através da loja (secção 6).

## 14. Alterações destes termos

Podemos alterar estes termos, por exemplo quando introduzimos novas funções ou quando a situação jurídica se altera. Mostramos-te a nova versão na app, com as alterações destacadas. As alterações que afetem de forma substancial os teus direitos ou obrigações só produzem efeitos para ti quando as aceitares na app. Até lá, só podes utilizar na app as definições, o suporte e a eliminação da conta. Se não aceitares, podes pôr termo ao contrato a qualquer momento, eliminando a tua conta; cancelas a tua subscrição na loja.

## 15. Disposições finais

- **Lei aplicável:** aplica-se o direito da República Federal da Alemanha, com exclusão da Convenção das Nações Unidas sobre os Contratos de Compra e Venda Internacional de Mercadorias. Enquanto consumidor, manténs a proteção das disposições imperativas do Estado em que tens a tua residência habitual.
- **Foro competente:** para comerciantes, pessoas coletivas de direito público e patrimónios autónomos de direito público, o foro competente é Munique. Para os consumidores, aplicam-se os foros legalmente previstos.
- **Resolução de litígios de consumo:** não estamos dispostos nem obrigados a participar em procedimentos de resolução de litígios perante uma entidade de resolução alternativa de litígios de consumo.
- **Idioma:** estes termos existem em alemão, inglês, português, coreano, espanhol e francês. A versão determinante é a alemã; as outras são traduções.
- **Disposições inválidas:** se uma disposição destes termos for inválida, o resto do contrato mantém-se válido. A disposição inválida é substituída pelas disposições legais.
$md$, '2026-11-07 10:00:00+00', false),
  ('privacy', 'pt-PT', '1.5', $md$# Política de Privacidade

Versão: 1.5

Última atualização: 6 de novembro de 2026

Esta é uma tradução. A versão alemã é a juridicamente vinculativa.

Aqui ficas a saber que dados pessoais tratamos quando utilizas a app Loqqa, para que fins o fazemos e que direitos tens. A base são o Regulamento Geral sobre a Proteção de Dados (RGPD), a Lei Federal alemã de Proteção de Dados (BDSG) e a lei alemã TDDDG sobre proteção de dados nas telecomunicações e serviços digitais.

## Em resumo

- O Loqqa guarda os teus planos e treinos primeiro no teu dispositivo e sincroniza-os com a tua conta assim que estiveres online. A nossa base de dados está em Frankfurt am Main.
- Os outros utilizadores não podem ver o teu perfil, os teus treinos nem as tuas fotos.
- Tratamos o teu peso, a tua altura e as fotos do teu check corporal como dados de saúde. Só os tratamos com o teu consentimento explícito.
- Para a criação de planos, a importação dos teus treinos, a introdução por voz, o check corporal, o coach e a tradução das mensagens de suporte, utilizamos um modelo de IA da OpenAI. Para isso, transmitimos os dados necessários à OpenAI, que os trata nos EUA.
- Para melhorar a app, medimos com o PostHog a forma como é utilizada. Os dados de saúde e as fotos não são enviados ao PostHog. A app não contém publicidade.
- Podes eliminar a tua conta na app a qualquer momento. Ao fazê-lo, eliminamos também as tuas fotos e todos os dados da tua conta.

## 1. Quem é o responsável?

O responsável pelo tratamento dos teus dados é:

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 Munique, Alemanha
- E-mail: support@useloqqa.com

Daqui em diante, designamo-nos por “nós”.

## 2. Encarregado da proteção de dados

Não designámos um encarregado da proteção de dados, porque não somos obrigados a fazê-lo. Para qualquer questão sobre proteção de dados, podes contactar-nos diretamente através de support@useloqqa.com.

## 3. Como funciona o Loqqa

O Loqqa é uma app de treino. Podes pedir que te seja criado um plano de treino ou importar o teu plano e os teus treinos anteriores de outra app ou de uma folha de cálculo, registar os teus treinos e o teu peso corporal, fazer perguntas ao coach sobre o teu treino e, a partir dos 18 anos, fazer checks corporais com fotos.

A app funciona segundo o princípio “offline first”: os teus dados ficam numa base de dados no teu dispositivo, para que possas treinar mesmo sem internet. Se tiveres sessão iniciada e estiveres online, a app sincroniza esses dados com a tua conta nos nossos servidores. Assim, o teu plano e o teu histórico ficam salvaguardados e disponíveis em todos os teus dispositivos. Para os servidores, recorremos a prestadores de serviços (secção 7).

Todos os dados da nossa base de dados estão associados à tua conta. Regras técnicas de acesso garantem que só tu podes ler e alterar os teus próprios dados. O Loqqa não tem funções através das quais outros utilizadores possam ver o teu perfil, os teus treinos ou as tuas fotos.

## 4. Que dados tratamos e para que fins

### 4.1 Configuração inicial sem conta

Fazes a configuração inicial sem conta. Durante a mesma, a app descarrega dos nossos servidores o catálogo de exercícios (nomes, instruções, imagens e vídeos dos exercícios) e estes textos jurídicos. A app verifica se há alterações no catálogo de exercícios ao arrancar e, depois, de hora a hora. Nessa altura, só são gerados os dados de ligação tecnicamente necessários (secção 4.13).

As tuas respostas na configuração inicial (por exemplo, nome próprio, sexo, data de nascimento, peso, altura, objetivo e o plano criado ou importado) são, numa primeira fase, guardadas pela app apenas no teu dispositivo. Estes dados só nos são enviados quando crias uma conta (secções 4.3 e 4.4). Exceções: se pedires que te seja criado um plano, a app transmite já antes disso as tuas respostas sobre objetivo, foco, equipamento, treinos por semana, duração do treino e experiência, para que o plano possa ser criado; de um ficheiro que importas, a app transmite excertos, os nomes dos exercícios e o teu plano, para que possam ser reconhecidos (ambos na secção 4.7). A app só transmite um histórico de treinos importado quando crias uma conta.

Fundamento jurídico: art. 6.º, n.º 1, alínea b), do RGPD (disponibilização da app que pretendes utilizar).

### 4.2 A tua conta

No final da configuração inicial, crias uma conta ao iniciares sessão com a tua Conta Google ou, em dispositivos Apple, com a tua Conta Apple. Não existe palavra-passe do Loqqa. Nesse contexto, tratamos:

- os dados que a Google ou a Apple nos transmitem no início de sessão, incluindo o teu endereço de e-mail (ver abaixo)
- o teu nome próprio, para que a app o possa voltar a preencher depois de iniciares sessão num novo dispositivo
- dados técnicos da conta, como a data e hora do registo e do último início de sessão, bem como tokens de início de sessão

Para que a tua sessão se mantenha iniciada, a app guarda a tua sessão no teu dispositivo.

**Início de sessão com a Google:** se iniciares sessão com a Google, abre-se no teu dispositivo o início de sessão da Google. Depois, a Google confirma-nos o teu início de sessão e transmite-nos o teu endereço de e-mail, o teu nome, o endereço da tua foto de perfil da Google e um identificador da tua Conta Google. Guardamos estes dados na tua conta. A Google fica assim a saber que estás a iniciar sessão no Loqqa. A Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlanda, é responsável autónoma pelo tratamento no início de sessão através da tua Conta Google; aplica-se a [Política de Privacidade da Google](https://policies.google.com/privacy?hl=pt-PT).

**Início de sessão com a Apple** (apenas em dispositivos Apple): se iniciares sessão com a Apple, abre-se no teu dispositivo o início de sessão da Apple. Depois, a Apple confirma-nos o teu início de sessão e transmite-nos um identificador da tua Conta Apple e o teu endereço de e-mail. Em alternativa, podes escolher um endereço gerado pela Apple que te reencaminha os e-mails (“Ocultar o meu e-mail”). No primeiro início de sessão, a Apple transmite-nos também o teu nome, se o partilhares. Guardamos estes dados na tua conta. A Apple Distribution International Limited, Hollyhill Industrial Estate, Hollyhill, Cork, Irlanda, é responsável autónoma pelo tratamento no início de sessão através da tua Conta Apple; aplica-se a [Política de Privacidade da Apple](https://www.apple.com/legal/privacy/pt-ww/).

As contas só são criadas no final da configuração inicial. Se um início de sessão através de “Iniciar sessão” no ecrã inicial fosse criar uma nova conta, a app elimina-a de imediato e informa-te de que ainda não existe nenhuma conta.

Fundamento jurídico: art. 6.º, n.º 1, alínea b), do RGPD.

### 4.3 Perfil e planeamento do treino

Quando crias uma conta, guardamos os teus dados da configuração inicial como o teu perfil. Podes alterar posteriormente parte deles nas definições e no teu perfil.

- nome próprio, sexo biológico (também é possível escolher “Prefiro não dizer”) e data de nascimento
- peso corporal, altura e as tuas unidades preferidas (métricas ou imperiais)
- experiência de treino, objetivo de treino, grupos musculares em foco, equipamento disponível, treinos por semana e duração pretendida do treino
- o idioma da tua app, para que o nosso suporte te possa responder no teu idioma
- facultativamente: uma foto de perfil (a app guarda-a como imagem quadrada de 512 × 512 píxeis) e um pequeno texto “Sobre ti” com até 150 caracteres

Para que fins: precisamos da tua data de nascimento para verificar a idade mínima (secção 16) e os limites de idade do coach e do check corporal. A partir do objetivo de treino, do foco, do equipamento, dos treinos por semana, da duração do treino e da experiência, um modelo de IA da OpenAI cria o teu plano de treino, se pedires que te seja criado um (secção 4.7). O coach também utiliza o teu objetivo, a tua experiência, o teu equipamento, o teu foco e as tuas unidades para as suas respostas (secção 4.8). A app utiliza o sexo, a idade, o peso e a altura para o check corporal (secção 4.6). A foto de perfil e o texto “Sobre ti” só te são mostrados a ti, no teu perfil.

Fundamento jurídico: art. 6.º, n.º 1, alínea b), do RGPD; para o peso corporal e a altura, o teu consentimento (secção 4.4).

### 4.4 Dados de saúde e o teu consentimento

Alguns dados podem permitir tirar conclusões sobre a tua saúde. Por isso, tratamo-los como dados de saúde na aceção do art. 9.º do RGPD:

- **Medidas corporais:** o teu peso corporal, os teus registos de peso e a tua altura (secções 4.3 e 4.5).
- **Check corporal:** as fotos do teu check corporal e os valores que delas resultam, por exemplo uma percentagem estimada de gordura corporal (secção 4.6).

Só tratamos estes dados com o teu consentimento explícito (art. 9.º, n.º 2, alínea a), em conjugação com o art. 6.º, n.º 1, alínea a), do RGPD):

- **Medidas corporais:** quando crias a tua conta, consentes explicitamente, através da indicação que se encontra diretamente acima do botão, que tratemos os teus dados corporais para adaptar o teu treino. Até lá, o peso e a altura ficam no teu dispositivo.
- **Check corporal:** antes de a app enviar as tuas fotos para avaliação, informa-te de que as fotos e os dados corporais são transmitidos para esse efeito à OpenAI, nos EUA. Ao tocares em “Concluído”, dás o teu consentimento para isso.
- **Coach:** para as suas respostas, o coach utiliza também os teus registos de peso e os valores globais dos teus checks corporais, e o nosso servidor transmite para isso os teus dados de treino e corporais à OpenAI, nos EUA (secção 4.8). Ao criares a tua conta e aceitares esta Política de Privacidade, dás o teu consentimento para isso. Guardamos a data e hora do teu consentimento. Só transmitimos estes dados quando fazes uma pergunta ao coach.

O check corporal e o coach são facultativos. Podes retirar os teus consentimentos a qualquer momento, com efeitos para o futuro (secção 12).

### 4.5 Dados de treino e peso corporal

Quando utilizas o Loqqa, guardamos:

- **Planos:** nome, treinos por semana, blocos com semana de deload, treinos pela respetiva ordem (incluindo treinos sem plano), exercícios, séries com valores-alvo (repetições ou segundos), repetições em reserva (RIR) e tempos de descanso
- **Treinos realizados,** incluindo os que importas: início e fim, a que plano e a que semana do plano pertencem, exercícios, peso e repetições ou segundos por série, a data e hora de cada série concluída e recordes pessoais
- **Exercícios próprios** que crias ou que surgem na importação
- **Peso corporal:** os registos de peso que introduzes, um valor por dia

Para que fins: para que possas registar os teus treinos e o teu peso e ver o teu histórico, os teus melhores valores, as tuas séries por músculo num período à tua escolha e a tua atividade. A app calcula no teu dispositivo as sugestões para as tuas séries e o número das tuas séries por músculo. Se fizeres uma pergunta ao coach, ele responde-lhe a partir destes dados (secção 4.8).

Fundamento jurídico: art. 6.º, n.º 1, alínea b), do RGPD; para os registos de peso, o teu consentimento (secção 4.4).

### 4.6 Check corporal

O check corporal é facultativo e só está disponível a partir dos 18 anos. Para o fazeres, tiras três fotos com a câmara: de frente, de lado e de costas. A app recomenda que uses roupa interior ou roupa desportiva justa. O teu rosto pode ser visível nas fotos.

A app reduz as fotos para uma largura máxima de 1080 píxeis e guarda-as no teu dispositivo. Quando inicias a avaliação, a app carrega as fotos para uma área de armazenamento não pública da tua conta. Ficam lá guardadas para que também as possas ver nos teus outros dispositivos. Para a avaliação, precisas de ligação à internet.

**Avaliação por um modelo de IA da OpenAI:** os valores do teu check são determinados por um modelo de IA da OpenAI. Para isso, o nosso servidor transmite à OpenAI:

- as três fotos deste check e, se existirem, as fotos do teu check anterior, para que o modelo possa comparar diretamente as alterações
- o sexo, a idade (calculada a partir da tua data de nascimento), a altura, o peso e a experiência de treino do teu perfil
- os valores do teu check anterior, para que os valores se mantenham comparáveis de check para check

Não transmitimos o teu nome, o teu endereço de e-mail nem o ID da tua conta. A OpenAI trata os dados nos EUA (secção 8). Configurámos as definições de modo que a OpenAI não guarde o pedido para consulta posterior. A OpenAI não utiliza dados provenientes da sua API para treinar os seus modelos e conserva-os até 30 dias para detetar abusos; depois disso, são eliminados.

O modelo verifica primeiro se as fotos podem ser avaliadas, por exemplo se têm luz suficiente e se o teu corpo está visível pelo menos da cabeça aos joelhos. Se uma foto não puder ser avaliada, a app pede-te que a voltes a tirar. Caso contrário, o modelo fornece valores para seis grupos musculares (ombros, peito, braços, costas, abdómen, pernas), uma percentagem estimada de gordura corporal, bem como valores de proporções e definição. A partir destes, o nosso servidor calcula o valor global. Guardamos estes valores no teu check.

Antes de avaliar um check, o nosso servidor verifica junto da RevenueCat se a tua conta tem Loqqa Pro (secção 4.12). Registamos cada avaliação com a data e hora e o resultado. Assim, limitamos o número de avaliações por dia e garantimos que os valores guardados provêm de uma avaliação. Eliminamos este registo juntamente com a tua conta.

Os valores são estimativas aproximadas e não constituem uma medição nem um diagnóstico médico.

**Quem tem acesso:** tecnicamente, só o operador do Loqqa, Jan Timo Hünnebeck, pode aceder à área de armazenamento. Ele só vê as fotos do check corporal se o pedires no suporte, se for necessário para corrigir um erro que tenhas comunicado ou se a lei nos obrigar a isso.

Podes eliminar checks individuais na app. Nesse caso, a app elimina as fotos no teu dispositivo e no nosso armazenamento. Se o teu dispositivo estiver offline nesse momento, é possível que as fotos permaneçam no nosso armazenamento até eliminares a tua conta; nesse caso, escreve-nos e nós eliminamo-las.

Fundamento jurídico: o teu consentimento explícito (secção 4.4), também para a transmissão à OpenAI, nos EUA (art. 49.º, n.º 1, alínea a), do RGPD, em complemento das garantias referidas na secção 8).

### 4.7 Importação, criação de planos e exercícios por voz

Podes importar os teus treinos de outra app ou de uma folha de cálculo: como ficheiro no formato CSV, TSV, Excel ou OpenDocument, por exemplo a exportação do Hevy ou do Strong. O ficheiro pode conter o teu histórico de treinos, o teu plano de treino ou ambos. Certifica-te de que o ficheiro não contém dados de outras pessoas.

**Leitura no teu dispositivo:** a app abre o ficheiro e lê as respetivas linhas no teu dispositivo. Para isso, não transmite todo o teu histórico de treinos ao nosso servidor.

**Reconhecimento por um modelo de IA da OpenAI:** para perceber como o teu ficheiro está estruturado e que exercícios estão em causa, a app transmite ao nosso servidor, juntamente com o idioma da tua app: o nome do ficheiro e os nomes das folhas, a linha de cabeçalho de cada folha, uma seleção de, no máximo, 150 linhas (do início, do meio e do fim) e informações sobre cada coluna (por exemplo, quantas células estão preenchidas e valores frequentes), os nomes dos exercícios do teu histórico com o respetivo número de séries e um peso típico, bem como as linhas do teu plano, caso o ficheiro contenha um. O servidor reencaminha-os, juntamente com o nosso catálogo de exercícios, para um modelo de IA da OpenAI. O modelo reconhece que colunas contêm, por exemplo, a data, o exercício, o peso e as repetições, associa os nomes dos exercícios ao nosso catálogo e extrai os treinos, exercícios, séries, repetições e tempos de descanso do teu plano. Se o ficheiro não contiver nenhum plano, a app compõe um a partir dos teus treinos das últimas seis semanas; para os treinos sem nome, o modelo sugere um e, para isso, recebe apenas os respetivos exercícios e quantas vezes os fizeste. Nesse contexto, não transmitimos outros dados: os pedidos não contêm a tua conta nem o teu nome. A OpenAI trata os dados nos EUA (secção 8). Configurámos as definições de modo que a OpenAI não guarde o pedido para consulta posterior. A OpenAI não utiliza dados provenientes da sua API para treinar os seus modelos e conserva-os até 30 dias para detetar abusos.

O nosso servidor não guarda o teu ficheiro nem os excertos transmitidos; limita-se a devolver o resultado à app. É guardado o que adotas no final: os treinos do teu histórico, como treinos realizados, e o plano que confirmas (secção 4.5). A app não volta a adotar os treinos que começam à mesma hora que um treino da tua conta. A app cria na tua conta, como exercícios próprios, os exercícios que o nosso catálogo não conhece. Se importares o teu histórico na configuração inicial, este fica no teu dispositivo até criares a tua conta e é depois transferido para a tua conta.

**Criação de planos por um modelo de IA da OpenAI:** se pedires que te seja criado um plano, a app transmite ao nosso servidor as tuas respostas sobre objetivo de treino, grupos musculares em foco, equipamento, treinos por semana, duração do treino e experiência de treino, bem como o idioma da tua app. Este reencaminha-as, juntamente com os exercícios do nosso catálogo adequados ao teu equipamento, para um modelo de IA da OpenAI, que compõe o teu plano a partir delas. Nesse contexto, não transmitimos o teu nome, a tua data de nascimento, o sexo, o peso nem a tua altura, e o pedido não contém a tua conta. Ao tratamento pela OpenAI aplica-se o mesmo que na importação. O nosso servidor não guarda as tuas respostas; limita-se a devolver o plano à app, onde o podes alterar.

**Exercícios por voz:** ao configurares um plano, ao editares um treino e ao montares um treino livre, podes dizer os exercícios com as séries e repetições em vez de os procurares um a um. O reconhecimento de voz do teu sistema operativo transforma o que dizes em texto: o da Apple no iPhone e o da Google nos dispositivos Android. Consoante o dispositivo, isto acontece no próprio dispositivo ou em servidores da Apple ou da Google; aplicam-se as respetivas políticas de privacidade. Não recebemos a gravação em si. A app transmite ao nosso servidor o texto, que ainda podes alterar antes de adicionares os exercícios, juntamente com o idioma da app. O servidor envia-o, juntamente com o nosso catálogo de exercícios, a um modelo de IA da OpenAI, que reconhece os exercícios com as séries e repetições. O pedido não contém a tua conta nem o teu nome. Ao tratamento pela OpenAI aplica-se o mesmo que na importação. O nosso servidor não guarda o texto.

**Limitação dos pedidos:** para que a importação, a criação de planos e os exercícios por voz não sejam utilizados de forma abusiva, limitamos o número de vezes que podem ser utilizadas por dia, por rede e no total. Para isso, o nosso servidor guarda, para cada pedido, a data e hora, a qual destas funções se referiu e um valor de hash do teu endereço IP, que gera com uma chave secreta; não guardamos o próprio endereço IP. Eliminamos as entradas com mais de dois dias a cada novo pedido.

Fundamento jurídico: art. 6.º, n.º 1, alínea b), do RGPD para a importação, a criação de planos e os exercícios por voz que inicias, também para a transmissão à OpenAI, nos EUA. Para a limitação dos pedidos, art. 6.º, n.º 1, alínea f), do RGPD; o nosso interesse legítimo é evitar abusos e custos desnecessários.

### 4.8 Kai · Coach IA

Com o Loqqa Pro, podes fazer perguntas ao Kai, o coach de IA da app, sobre o teu próprio treino, por exemplo “Como evoluiu o meu peso?”. O coach responde em poucas frases, geralmente com um gráfico feito a partir dos teus dados. Também responde a perguntas gerais sobre treino, por exemplo com que frequência deves treinar pernas ou que exercício podes fazer se algo te doer. A teu pedido, também monta um treino, mostra um dos teus treinos guardados ou sugere substituir exercícios do teu plano; o teu plano só muda quando o confirmares na app. Não faz diagnósticos. O Kai é uma IA, não uma pessoa. O coach é facultativo e só está disponível a partir dos 16 anos. Para o utilizares, precisas de ligação à internet.

**Respostas por um modelo de IA da OpenAI:** a app transmite a tua pergunta, juntamente com o idioma da tua app e o fuso horário do teu dispositivo, ao nosso servidor. Este reencaminha a pergunta para um modelo de IA da OpenAI. Se o modelo precisar de dados, pede-os ao nosso servidor: este calcula os valores a partir dos teus dados guardados e transmite os resultados à OpenAI. A partir deles, o modelo escreve a resposta. Em cada pergunta, o nosso servidor transmite à OpenAI:

- a tua pergunta e as últimas perguntas deste chat, até seis, com as respetivas respostas e os dados consultados para elas
- a data de hoje, as tuas unidades e o idioma da tua app
- o objetivo de treino, a experiência de treino, o equipamento e os grupos musculares em foco do teu perfil, bem como o nome e os treinos por semana do teu plano ativo
- os treinos do teu plano ativo com os respetivos exercícios e o seu estado nesta semana (feito, a seguir ou por fazer), bem como os nomes dos teus outros treinos guardados
- o número dos teus treinos com a data do primeiro e do último, o número dos teus registos de peso com a data do primeiro e o número dos teus checks corporais
- os exercícios que fizeste, incluindo exercícios próprios: nome, como os registas, em quantos treinos os fizeste e quando os fizeste pela última vez

Consoante a pergunta, o nosso servidor transmite ainda o que calcula para ela a partir dos teus dados:

- treinos com data, nome, duração, exercícios e séries (peso, repetições, segundos e RIR)
- valores por treino, por exemplo o peso máximo estimado para uma repetição (1RM), o peso mais elevado, repetições, tempo de sustentação, volume e melhores valores
- os teus registos de peso e uma evolução do peso suavizada
- os valores globais dos teus checks corporais, sem fotos e sem valores individuais como a percentagem de gordura corporal
- treinos, séries, volume e tempo de treino por semana ou por mês, pausas no treino e os dias da semana dos teus treinos
- séries por grupo muscular e por exercício
- os exercícios, as séries e os objetivos de um treino guardado, quando o coach to mostra ou sugere uma alteração
- exercícios do catálogo da app, quando o coach monta um treino ou sugere uma substituição, aparecendo primeiro os que fizeste mais vezes

Não transmitimos o teu nome, o teu endereço de e-mail, o ID da tua conta, a tua data de nascimento e idade, o teu sexo, a tua altura, a tua foto de perfil, o teu texto “Sobre ti”, as fotos do teu check corporal nem as tuas mensagens de suporte. Por favor, não escrevas dados de outras pessoas nas tuas perguntas. A OpenAI trata os dados nos EUA (secção 8). Configurámos as definições de modo que a OpenAI não guarde o pedido para consulta posterior. A OpenAI não utiliza dados provenientes da sua API para treinar os seus modelos e conserva-os até 30 dias para detetar abusos; depois disso, são eliminados.

As respostas são escritas por um modelo de IA. Podem estar erradas. São informações e recomendações para o teu treino e não constituem aconselhamento médico nem um diagnóstico.

Antes de responder a uma pergunta, o nosso servidor verifica a tua idade com base na data de nascimento do teu perfil, o teu consentimento (secção 4.4) e, junto da RevenueCat, se a tua conta tem Loqqa Pro (secção 4.12).

**Perguntas por voz:** também podes dizer a tua pergunta. Nesse caso, a app grava através do microfone até terminares a gravação, no máximo durante dois minutos, e transmite a gravação ao nosso servidor juntamente com o idioma da app. O servidor envia-a a um modelo de reconhecimento de voz da OpenAI, que a transforma em texto. Para que termos como “supino” sejam reconhecidos corretamente, envia também uma breve indicação sobre o tema (perguntas a um treinador e termos típicos). A app mostra o texto no campo de introdução, onde o podes alterar; só se torna a tua pergunta quando o envias. Não guardamos a tua gravação: o nosso servidor apenas a reencaminha, e a app elimina-a no teu dispositivo assim que o texto estiver disponível ou descartares a gravação. Por favor, não graves outras pessoas. Ao tratamento pela OpenAI aplica-se o mesmo que às respostas (EUA, sem utilização para treino de modelos, conservação até 30 dias para detetar abusos). Também aqui o nosso servidor verifica a tua idade e se a tua conta tem o Loqqa Pro. Para que a conversão não seja utilizada de forma abusiva, podes utilizá-la no máximo 100 vezes em 24 horas. Para isso, o nosso servidor guarda, para cada conversão, a data e hora e um valor de hash do ID da tua conta, que gera com uma chave secreta; eliminamos as entradas com mais de dois dias a cada nova conversão.

**O que guardamos:** guardamos na nossa base de dados os teus chats com as perguntas, as respostas e os gráficos apresentados por baixo das respostas. A app sincroniza-os com os teus dispositivos, para que possas ver lá os teus chats (secção 5). Para cada pergunta, guardamos ainda um registo que a app não mostra: data e hora, estado (por exemplo, se foi dada uma resposta), o modelo utilizado, o número de tokens (unidades de texto pelas quais a OpenAI fatura) e a duração, bem como as consultas do modelo com os dados consultados. Precisamos destas consultas para que o coach possa responder a perguntas de seguimento sobre uma resposta.

**Limitação das perguntas:** para que o coach não seja utilizado de forma abusiva e para evitar custos desnecessários, podes fazer, no máximo, 20 perguntas em 24 horas e 150 perguntas em 30 dias. Para isso, o nosso servidor conta os registos.

Podes eliminar chats na app, também vários de uma vez. Nesse caso, eliminamos as respetivas perguntas, respostas e gráficos, bem como os dados consultados nos respetivos registos. A data e hora, o estado, o modelo, os tokens e a duração mantêm-se, para que a limitação continue a aplicar-se e possamos acompanhar os custos do coach. De resto, conservamos os teus chats até os eliminares ou eliminares a tua conta. Com a tua conta, eliminamos todos os chats e registos (secção 10).

Fundamento jurídico: o teu consentimento explícito (secção 4.4), também para a transmissão à OpenAI, nos EUA (art. 49.º, n.º 1, alínea a), do RGPD, em complemento das garantias referidas na secção 8). Para a conversão de uma pergunta dita em texto, art. 6.º, n.º 1, alínea b), do RGPD, porque és tu que a inicias, também para a transmissão à OpenAI, nos EUA. Para a limitação das perguntas e das conversões e os dados sobre data e hora, estado, modelo, tokens e duração, art. 6.º, n.º 1, alínea f), do RGPD; o nosso interesse legítimo é evitar abusos e custos desnecessários.

### 4.9 Suporte

Através de “Reportar erro” e “Sugerir funcionalidade”, podes escrever-nos diretamente na app, ou podes escrever para support@useloqqa.com. Na app, tratamos nesse contexto:

- o tipo do teu pedido (erro ou ideia), no caso de ideias a importância de 1 a 5, as tuas mensagens e o assunto (a primeira linha da tua primeira mensagem)
- até cinco capturas de ecrã por mensagem, que escolhes da tua galeria; a app reduz-as (lado mais comprido com um máximo de 1600 píxeis) e guarda-as como JPEG
- o histórico do teu pedido, por exemplo alterações de estado, as nossas respostas e se voltaste a abrir um pedido
- o dispositivo a partir do qual envias um pedido: plataforma (iOS ou Android), versão do sistema operativo, modelo do dispositivo e versão da app, para que possamos reproduzir erros
- o idioma da tua app, para que possamos traduzir as nossas respostas para o teu idioma
- o idioma detetado de cada mensagem e as respetivas traduções (ver abaixo)

**Tradução por um modelo de IA da OpenAI:** para que te possamos compreender e leias as nossas respostas no teu idioma, um modelo de IA da OpenAI traduz as mensagens de suporte. Para isso, o nosso servidor transmite à OpenAI cada mensagem com texto, juntamente com o idioma para o qual deve ser traduzida: as tuas mensagens, para detetar o seu idioma e traduzi-las para o idioma do nosso suporte, e as nossas respostas, para traduzi-las para o idioma da tua app. Se alterares o idioma da tua app, traduzimos as nossas respostas anteriores para o novo idioma. Não transmitimos o teu nome, o teu endereço de e-mail, o ID da tua conta nem as tuas capturas de ecrã. Guardamos as traduções juntamente com as mensagens; na app, podes ver o original a qualquer momento. A OpenAI trata os dados nos EUA (secção 8). Configurámos as definições de modo que a OpenAI não guarde o pedido para consulta posterior. A OpenAI não utiliza dados provenientes da sua API para treinar os seus modelos e conserva-os até 30 dias para detetar abusos; depois disso, são eliminados.

**Mensagens por voz:** Também podes dizer a tua mensagem em voz alta. Funciona como nas perguntas ao coach (secção 4.8): a app grava até terminares a gravação, no máximo durante dois minutos. O nosso servidor transmite a gravação, com uma breve indicação do tema, a um modelo de reconhecimento de voz da OpenAI. A app mostra o texto no campo de introdução, onde o podes alterar; só se torna a tua mensagem quando a enviares. Não guardamos a tua gravação. Também aqui o nosso servidor verifica a tua idade e se a tua conta tem Loqqa Pro, e aplica-se o mesmo limite.

**Quem vê o teu pedido:** tratamos os pedidos numa área de suporte interna no navegador, à qual só Jan Timo Hünnebeck tem acesso, com um acesso próprio. Junto ao teu pedido, essa área mostra também o teu endereço de e-mail, se inicias sessão com a Apple ou com a Google, o ID da tua conta, a data de criação da tua conta e da tua última atividade, o idioma da tua app e os teus pedidos anteriores.

A app guarda primeiro as capturas de ecrã no teu dispositivo e depois carrega-as em segundo plano. Não podes eliminar tu próprio as mensagens e os pedidos, para que o histórico se mantenha rastreável. São eliminados juntamente com a tua conta; a teu pedido, eliminamos também antes disso os pedidos já encerrados. Conservamos os e-mails enquanto deles precisarmos para tratar do teu assunto.

Por favor, não nos envies dados de saúde nem dados de outras pessoas nas mensagens e capturas de ecrã, se não forem necessários para o teu assunto. As mensagens são também transmitidas à OpenAI para tradução.

Fundamento jurídico: art. 6.º, n.º 1, alínea b), do RGPD, na medida em que o teu pedido diga respeito à utilização da app, por exemplo no caso de erros. No caso de ideias e de outro feedback, art. 6.º, n.º 1, alínea f), do RGPD; o nosso interesse legítimo é responder ao teu pedido e melhorar o Loqqa. O mesmo se aplica à tradução e à transferência para a OpenAI nos EUA (secção 8).

### 4.10 Textos jurídicos e aceitações

A app carrega a versão em vigor dos Termos de Utilização e desta Política de Privacidade no teu idioma. Quando aceitas uma versão, no registo ou mais tarde, no caso de uma versão alterada, guardamos a versão que aceitaste, a data e hora (definidas pelo servidor), a versão da app e a plataforma (iOS ou Android). Assim, podemos comprovar que versão se aplica a ti e voltar a pedir a tua aceitação em caso de alterações substanciais.

Fundamento jurídico: art. 6.º, n.º 1, alínea c), em conjugação com o art. 7.º, n.º 1, do RGPD (prova dos consentimentos) e art. 6.º, n.º 1, alínea f), do RGPD (o nosso interesse legítimo em poder comprovar que condições se aplicam).

### 4.11 Loqqa Pro: subscrições e compras

Compras o Loqqa Pro através da App Store da Apple ou do Google Play. A compra e o pagamento são processados pela Apple ou pela Google, respetivamente. Estas são elas próprias responsáveis por isso e tratam os teus dados de pagamento de acordo com as suas próprias políticas de privacidade: [Apple](https://www.apple.com/legal/privacy/pt-ww/) e [Google](https://policies.google.com/privacy?hl=pt-PT). Não recebemos dados de pagamento, como números de cartão de crédito.

Para podermos desbloquear o Loqqa Pro, ficamos a saber, através da RevenueCat (secção 4.12), que subscrição compraste, se está a decorrer um período experimental, quando fizeste a compra e se a subscrição está ativa. A app guarda este estado no teu dispositivo e volta a consultá-lo ao arrancar e em cada início de sessão. Não guardamos nós próprios dados de compra na nossa base de dados.

Geres e cancelas a tua subscrição nas definições da tua conta da loja. Na app, encontras uma ligação para lá em “Gerir subscrição”.

Fundamento jurídico: art. 6.º, n.º 1, alínea b), do RGPD.

### 4.12 Gestão de subscrições com a RevenueCat

Gerimos as compras e as subscrições através da RevenueCat. A RevenueCat verifica por nós os recibos de compra da loja e comunica à app se o Loqqa Pro está ativo. Antes de avaliar um check corporal ou de responder a uma pergunta ao coach, o nosso servidor pergunta à RevenueCat se a tua conta tem Loqqa Pro.

Para que a RevenueCat possa associar as tuas compras à tua conta, transmitimos o ID da tua conta, um identificador aleatório sem nome nem endereço de e-mail. Se fizeres uma compra antes de criares a tua conta, a RevenueCat atribui primeiro um identificador aleatório próprio e associa depois a compra à tua conta. Além disso, a RevenueCat trata informações de compra e de subscrição provenientes da loja (por exemplo, produto, preço, moeda, datas de compra, de renovação e de expiração, período experimental e identificadores de transação), bem como dados técnicos, como a plataforma, o tipo de dispositivo, a versão da app e o endereço IP.

Além disso, a RevenueCat envia eventos sobre a tua subscrição à PostHog (secção 4.14), por exemplo um período experimental iniciado ou convertido, renovações e cancelamentos, cada um com a respetiva receita. Para isso, a app dá à RevenueCat o teu identificador da PostHog: antes de criares a conta, um identificador aleatório; depois, o ID da tua conta.

- Fornecedor: RevenueCat, Inc., 1032 E Brandon Blvd #3003, Brandon, FL 33511, EUA, na qualidade de nosso subcontratante
- Local de armazenamento: EUA (Amazon Web Services); garantia: ver secção 8
- Prazo de conservação: enquanto durar o nosso contrato com a RevenueCat; mandamos eliminar os dados relativos à tua conta quando eliminas a tua conta e não existam obrigações legais em contrário

Fundamento jurídico: art. 6.º, n.º 1, alínea b), do RGPD.

### 4.13 Dados de ligação tecnicamente necessários

Sempre que a app está ligada aos nossos servidores (por exemplo, no início de sessão, na sincronização, em carregamentos ou ao descarregar o catálogo de exercícios e os textos jurídicos), são tratados dados tecnicamente necessários: o teu endereço IP, a data e a hora, a interface acedida, bem como dados técnicos, como códigos de estado e, na medida em que sejam transmitidos, dados sobre a app e o sistema operativo. Os nossos prestadores de serviços de alojamento registam estes dados para garantir o funcionamento e a segurança. Na Supabase, os registos são eliminados ao fim de um dia; na PowerSync, assim que deixem de ser necessários para o funcionamento e a segurança.

Fundamento jurídico: art. 6.º, n.º 1, alínea f), do RGPD; o nosso interesse legítimo é um funcionamento estável e seguro.

### 4.14 Análise do produto e relatórios de erros com o PostHog

Para compreender como o Loqqa é utilizado e para encontrar erros, utilizamos o PostHog. Para isso, a app envia:

- **Eventos de utilização:** que ecrãs abres e determinados passos, por exemplo o início da configuração inicial, planos criados ou importados, históricos de treinos importados (apenas a respetiva dimensão, nunca o conteúdo), visitas à página do Loqqa Pro, compras, registo e início de sessão, início, fim ou interrupção de um treino, o facto de teres feito uma pergunta ao coach e de ele ter respondido ou não (nunca o texto), a avaliação de um check corporal (nunca os valores), a gravação de um registo de peso (nunca o peso), exercícios adicionados por voz, pedidos de avaliação na loja, cada um com a data e hora e indicadores como o número de exercícios ou séries, a duração ou o código de erro
- **Eventos de subscrição:** períodos experimentais iniciados ou convertidos, renovações e cancelamentos com a respetiva receita, enviados pela RevenueCat (secção 4.12)
- **Eventos da app:** abertura e fecho da app, versão da app, tipo de dispositivo, sistema operativo e idioma
- **Relatórios de erros:** mensagens de falhas e de erros com detalhes técnicos
- **Dados do perfil:** após o registo, objetivo, experiência, treinos por semana, split, equipamento, idioma, unidades, uma faixa etária (por exemplo, “25–34”) e se tens Loqqa Pro
- **um identificador pseudonimizado:** antes do registo, um identificador aleatório que a app guarda no teu dispositivo e, depois, o ID da tua conta, para que os eventos anteriores e posteriores ao registo sejam agregados

Não são enviados ao PostHog o teu nome, o teu endereço de e-mail, o peso, a altura, a tua data de nascimento, as fotos e os valores do check corporal, nem textos livres. O PostHog não guarda o teu endereço IP, e não utilizamos gravações de sessões. Quando terminas sessão, a app repõe o identificador.

- Fornecedor: PostHog, Inc., 2261 Market St. #4008, San Francisco, CA 94114, EUA, na qualidade de nosso subcontratante
- Local de armazenamento: PostHog Cloud EU (Frankfurt am Main); o PostHog está certificado ao abrigo do EU-US Data Privacy Framework (Quadro de Privacidade de Dados UE-EUA) (secção 8)
- Prazo de conservação: os eventos são eliminados ao fim de um ano

Fundamento jurídico: art. 6.º, n.º 1, alínea f), do RGPD; o nosso interesse legítimo é melhorar o Loqqa e corrigir erros. Podes opor-te a isso a qualquer momento (secção 11), por exemplo por e-mail para support@useloqqa.com; nesse caso, eliminamos os dados de análise relativos à tua conta.

## 5. Armazenamento no teu dispositivo

Para que o Loqqa funcione também offline, a app guarda dados no teu dispositivo:

- uma base de dados local com o teu perfil, os teus planos e treinos, os teus registos de peso, os valores dos teus checks corporais, os teus chats do coach, os teus pedidos de suporte e as tuas aceitações
- as fotos do check corporal que tiraste neste dispositivo e cópias das tuas capturas de ecrã do suporte
- a tua sessão, as tuas respostas da configuração inicial, um histórico de treinos importado na configuração inicial, até estar na tua conta, o estado da tua subscrição, definições como o idioma da app, bem como listas dos ficheiros que ainda têm de ser carregados
- o catálogo de exercícios
- o identificador e os eventos ainda não enviados para o PostHog (secção 4.14)

À exceção dos dados para o PostHog, este armazenamento é estritamente necessário para os serviços que pretendes utilizar (§ 25, n.º 2, ponto 2, da TDDDG).

Quando terminas sessão, a app elimina a base de dados local, bem como as fotos do teu check corporal e as cópias das capturas de ecrã neste dispositivo, e repõe a configuração inicial, o estado da subscrição, os treinos em curso e uma importação ainda não transferida. As alterações ainda não sincronizadas perdem-se; a app avisa-te antes disso. As definições, como o idioma da app, mantêm-se. Quando eliminas a app, o teu sistema operativo remove, regra geral, todos os dados da app.

Consoante as definições do teu dispositivo, os ficheiros da app, incluindo as fotos do check corporal, podem estar contidos em cópias de segurança do teu dispositivo (por exemplo, no iCloud ou na Google). Por essas cópias de segurança são responsáveis a Apple ou a Google, respetivamente.

## 6. Permissões no teu dispositivo

O Loqqa só pede uma permissão quando utilizas uma função que dela precisa:

- **Câmara:** para as fotos do check corporal e para a tua foto de perfil
- **Fotos:** para escolheres imagens para capturas de ecrã do suporte e para a tua foto de perfil. Para isso, a app utiliza o seletor de imagens do teu sistema operativo e só recebe as imagens que escolheres.
- **Ficheiros:** para escolheres um ficheiro com os teus treinos através do seletor de ficheiros do teu sistema operativo (secção 4.7)
- **Microfone:** para dizeres exercícios (secção 4.7), perguntas ao coach (secção 4.8) e mensagens ao suporte (secção 4.9). A app só grava enquanto utilizas a introdução por voz.
- **Reconhecimento de voz (iPhone):** para que o reconhecimento de voz da Apple possa transformar exercícios ditos em texto (secção 4.7)

O Loqqa não pede acesso à localização, aos contactos nem a apps de saúde como o Apple Health ou o Health Connect, e não envia notificações push. Podes retirar as permissões a qualquer momento nas definições do teu dispositivo.

## 7. Destinatários e subcontratantes

Só transmitimos os teus dados se tal for necessário para os fins indicados, se tiveres dado o teu consentimento ou se a lei nos obrigar a isso. Os nossos prestadores de serviços tratam dados por nossa conta e segundo as nossas instruções (art. 28.º do RGPD):

- **Supabase, Inc.** (base de dados, início de sessão, armazenamento de ficheiros, e funções de servidor): servidores em Frankfurt am Main (Amazon Web Services)
- **PowerSync**, da Journey Mobile, Inc. (sincronização entre a app e a base de dados; para isso, o serviço mantém uma cópia dos teus dados sincronizados): servidores na UE
- **OpenAI Ireland Ltd.**, 117–126 Sheriff Street Upper, Dublin 1, Irlanda (criação de planos por IA, reconhecimento de ficheiros de treinos importados e de exercícios ditos, avaliação das fotos do check corporal, respostas do coach, conversão de perguntas ditas em texto e tradução das mensagens de suporte, secções 4.6 a 4.9): tratamento nos EUA pela OpenAI OpCo, LLC
- **RevenueCat, Inc.** (gestão de subscrições, secção 4.12)
- **PostHog, Inc.** (análise do produto e relatórios de erros, secção 4.14)

A Apple e a Google recebem dados, na qualidade de responsáveis autónomos pelo tratamento, quando descarregas a app e fazes compras (secção 4.11), bem como quando inicias sessão através da conta delas (secção 4.2) e no reconhecimento de voz do respetivo sistema operativo (secção 4.7).

O Loqqa é gerido por uma única pessoa: só Jan Timo Hünnebeck tem acesso aos teus dados, na medida em que precise dele para o funcionamento e o suporte.

Só fornecemos dados a autoridades e tribunais se a lei nos obrigar a isso.

## 8. Transferência para países terceiros

Guardamos a tua conta, os teus treinos e as tuas fotos em centros de dados na UE (Supabase em Frankfurt am Main, PowerSync na UE). Alguns dos nossos prestadores de serviços têm sede nos EUA. Por isso, os dados também podem ser transferidos para os EUA, por exemplo em caso de manutenção ou suporte por parte do prestador de serviços. Para a criação de planos, a importação dos teus treinos, os exercícios e as perguntas ditos, a avaliação do check corporal, as respostas do coach e a tradução das mensagens de suporte, transferimos dados para a OpenAI, nos EUA, em cada pedido (secções 4.6 a 4.9), e a RevenueCat trata os dados de subscrição nos EUA (secção 4.12).

Baseamos estas transferências nas seguintes garantias:

- **PostHog:** decisão de adequação da Comissão Europeia relativa ao EU-US Data Privacy Framework, ao abrigo do qual o PostHog está certificado (art. 45.º do RGPD)
- **Supabase, PowerSync, OpenAI e RevenueCat:** cláusulas contratuais-tipo da Comissão Europeia (art. 46.º, n.º 2, alínea c), do RGPD), que fazem parte dos nossos contratos de subcontratação
- **Check corporal e coach:** adicionalmente, o teu consentimento explícito (art. 49.º, n.º 1, alínea a), do RGPD). Nos EUA, as autoridades podem, em determinadas circunstâncias, aceder aos dados sem que disponhas contra isso das mesmas vias de recurso que na UE.

Podes pedir-nos uma cópia das cláusulas contratuais-tipo.

## 9. Durante quanto tempo guardamos os teus dados

- **Conta, perfil, planos, treinos, registos de peso, checks corporais, chats do coach, pedidos de suporte e aceitações:** enquanto a tua conta existir. Podes eliminar tu próprio, antes disso, conteúdos individuais, por exemplo planos, registos de peso, checks corporais ou chats do coach. Com a tua conta, eliminamo-los na totalidade (secção 10). Não eliminamos automaticamente as contas que deixaram de ser utilizadas; podes pedir a eliminação a qualquer momento na app ou por e-mail.
- **Respostas da configuração inicial sem conta:** apenas no teu dispositivo, até criares uma conta ou eliminares a app.
- **Dados no teu dispositivo:** até terminares sessão ou eliminares a app (secção 5).
- **Registos do servidor:** um dia na Supabase; na PowerSync, enquanto forem necessários para o funcionamento e a segurança (secção 4.13).
- **Limitação da importação, da criação de planos e da introdução por voz:** dois dias (secções 4.7 e 4.8).
- **Gravações de perguntas ditas:** não as guardamos; a app elimina-as após a conversão (secção 4.8).
- **Registos do coach:** enquanto a tua conta existir; eliminamos os dados consultados neles juntamente com o respetivo chat (secção 4.8).
- **Na OpenAI:** até 30 dias (secções 4.6 a 4.9).
- **Dados de análise no PostHog:** um ano (secção 4.14).
- **Dados de subscrição na RevenueCat:** ver secção 4.12.
- **Cópias de segurança:** atualmente, não fazemos cópias de segurança da nossa base de dados nem do nosso armazenamento. Se isso mudar, acrescentaremos aqui durante quanto tempo as cópias de segurança são conservadas.

## 10. Eliminar conta

Podes eliminar a tua conta na app a qualquer momento: nas definições, em “Eliminar conta”. Nesse caso, acontece o seguinte:

1. Se iniciaste sessão com a Apple, confirmas isso mais uma vez junto da Apple, num dispositivo Apple. Desta forma, terminamos a ligação entre a tua Conta Apple e o Loqqa: o nosso servidor troca a confirmação junto da Apple pelas tuas chaves de início de sessão e manda invalidá-las de imediato. Nada é guardado nesse processo.
2. A app elimina do nosso armazenamento a tua foto de perfil, as fotos do teu check corporal e as tuas capturas de ecrã do suporte.
3. Em seguida, a tua conta é eliminada. Com isso, são automaticamente eliminados todos os dados associados na nossa base de dados: perfil, planos, treinos, registos de peso, checks corporais, chats do coach com os respetivos registos, pedidos de suporte com todas as mensagens e as tuas aceitações guardadas. A cópia na PowerSync é igualmente removida.
4. Por fim, a app termina a tua sessão neste dispositivo e elimina os dados nele guardados.

**Uma subscrição em curso não termina com isto.** Cancela-a na App Store ou no Google Play.

Noutros dispositivos em que tinhas sessão iniciada, os dados guardados localmente podem permanecer até terminares sessão nesses dispositivos ou eliminares a app. Os dados de análise no PostHog e os dados de subscrição na RevenueCat não são eliminados automaticamente em simultâneo; escreve-nos se quiseres que os mandemos eliminar de imediato; caso contrário, aplicam-se os prazos da secção 9.

Se a eliminação não funcionar, por exemplo por falta de ligação à internet, a app mostra-te um aviso e podes tentar novamente. Também podes pedir a eliminação por e-mail para support@useloqqa.com.

## 11. Os teus direitos

Perante nós, tens os seguintes direitos:

- **Acesso** aos dados que tratamos sobre ti (art. 15.º do RGPD)
- **Retificação** de dados incorretos (art. 16.º do RGPD); podes alterar muitos dados diretamente na app, e todos os outros alteramo-los nós mediante mensagem tua
- **Apagamento** dos teus dados (art. 17.º do RGPD); podes eliminar a tua conta diretamente na app (secção 10)
- **Limitação** do tratamento (art. 18.º do RGPD)
- **Portabilidade dos dados** (art. 20.º do RGPD): mediante pedido teu por e-mail, enviamos-te, no prazo de um mês, os dados que nos forneceste, como ficheiro JSON.
- **Retirada** dos consentimentos dados (secção 12)

**Direito de oposição (art. 21.º do RGPD):** quando tratamos dados com base no art. 6.º, n.º 1, alínea f), do RGPD (interesses legítimos), por exemplo para a análise do produto com o PostHog, podes opor-te a esse tratamento a qualquer momento, por motivos relacionados com a tua situação particular. Nesse caso, deixamos de tratar os dados, a não ser que possamos demonstrar razões imperiosas e legítimas que prevaleçam sobre os teus interesses, ou que o tratamento se destine à declaração, ao exercício ou à defesa de um direito num processo judicial.

Para qualquer assunto, basta um e-mail para support@useloqqa.com. Para podermos identificar a tua conta, indica-nos, por favor, o endereço de e-mail que a app mostra nas definições.

## 12. Retirar consentimentos

Podes retirar um consentimento a qualquer momento, com efeitos para o futuro (art. 7.º, n.º 3, do RGPD). O tratamento efetuado até à retirada mantém-se lícito.

- **Medidas corporais:** por e-mail para support@useloqqa.com. Nesse caso, eliminamos o teu peso, a tua altura e os teus registos de peso. Sem estes dados, a app só consegue adaptar o teu treino de forma limitada; em alternativa, podes também eliminar a tua conta (secção 10).
- **Check corporal:** elimina os teus checks na app e não faças novos, ou escreve-nos; nesse caso, eliminamos todas as fotos e todos os valores do check corporal.
- **Coach:** por e-mail para support@useloqqa.com. Nesse caso, registamos a retirada do teu consentimento. Para o coach, só transmitimos dados à OpenAI quando lhe fazes uma pergunta; por isso, depois de retirares o consentimento, não faças mais perguntas, pois uma nova pergunta conta como novo consentimento. Podes eliminar os teus chats anteriores na app, ou escreve-nos; nesse caso, eliminamo-los.

## 13. Reclamação junto de uma autoridade de controlo

Podes apresentar uma reclamação junto de uma autoridade de controlo da proteção de dados (art. 77.º do RGPD), em especial no Estado-Membro da UE em que resides ou trabalhas ou em que ocorreu a alegada infração. A autoridade competente para nós é o Bayerisches Landesamt für Datenschutzaufsicht (autoridade de proteção de dados da Baviera), Promenade 18, 91522 Ansbach, Alemanha, [www.lda.bayern.de](https://www.lda.bayern.de).

## 14. Tens de nos fornecer dados?

Para uma conta, precisamos da tua Conta Google ou da tua Conta Apple. Sem conta, não podes utilizar o Loqqa depois da configuração inicial. A app precisa dos dados da configuração inicial para verificar a tua idade e para criar e adaptar o teu plano. São facultativos, em especial, o teu sexo (podes escolher “Prefiro não dizer”), o check corporal, o coach, os registos de peso, uma foto de perfil e o texto “Sobre ti”.

## 15. Sem decisões automatizadas

A app cria automaticamente planos, sugestões, análises como as tuas séries por músculo, valores do check corporal e as respostas do coach; os planos que pedes que te sejam criados, os valores do check corporal e as respostas do coach provêm de um modelo de IA da OpenAI (secções 4.6 a 4.8). Trata-se de informações, recomendações e estimativas para o teu treino. As respostas do coach podem estar erradas e não constituem aconselhamento médico. Não tomamos decisões que produzam efeitos jurídicos que te digam respeito ou que te afetem significativamente de forma similar (art. 22.º do RGPD).

## 16. Crianças e adolescentes

O Loqqa destina-se a pessoas a partir da idade em que, no seu país, podem consentir elas próprias no tratamento dos seus dados: na Alemanha, a partir dos 16 anos; noutros países, consoante a lei local, a partir dos 13 a 16 anos. Na configuração inicial, a app pergunta a tua data de nascimento e só te deixa avançar a partir dessa idade; é determinante o país definido no teu dispositivo. O coach só está disponível a partir dos 16 anos, mesmo em países com uma idade mínima inferior. O check corporal só está disponível a partir dos 18 anos. O nosso servidor verifica ambos com base na data de nascimento do teu perfil.

Se tomarmos conhecimento de que uma conta pertence a uma pessoa abaixo da idade mínima, eliminamo-la.

## 17. Segurança

Protegemos os teus dados com medidas técnicas e organizativas, entre outras:

- transmissão encriptada entre a app e os servidores (HTTPS/TLS)
- regras de acesso na base de dados, através das quais cada conta só pode ler e alterar os seus próprios dados
- áreas de armazenamento não públicas para fotos de perfil, fotos do check corporal e capturas de ecrã, nas quais cada conta só pode aceder à sua própria pasta
- ligações com validade limitada para a visualização de fotos: uma hora para fotos do check corporal e capturas de ecrã, 24 horas para fotos de perfil
- o início de sessão através da Google ou da Apple, para que não guardemos palavras-passe

Nenhum sistema é totalmente seguro. Como a app guarda dados no teu dispositivo, protege-o, por favor, com um bloqueio de ecrã.

## 18. Alterações desta Política de Privacidade

Adaptamos esta Política de Privacidade quando a app ou a situação jurídica se alteram. Encontras a versão em vigor na app, nas definições, e em [useloqqa.com](https://useloqqa.com). Informamos-te na app sobre alterações substanciais e, quando necessário, pedimos o teu consentimento.
$md$, '2026-11-07 10:00:00+00', false),
  ('terms', 'pt-BR', '1.5', $md$# Termos de Uso

Versão: 1.5

Última atualização: 6 de novembro de 2026

Esta é uma tradução. A versão em alemão é a juridicamente vinculante.

Estes Termos de Uso regulam como você pode usar o app Loqqa. Leia-os com atenção. Como tratamos seus dados, explicamos na nossa Política de Privacidade.

## 1. Fornecedor e âmbito de aplicação

O fornecedor do app Loqqa é:

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 Munique, Alemanha
- E-mail: support@useloqqa.com
- Site: [useloqqa.com](https://useloqqa.com)

A seguir, nos referimos a nós mesmos como “nós”. Estes termos se aplicam a todas as funções do app. Para compras pela App Store da Apple ou pelo Google Play, aplicam-se adicionalmente os termos da respectiva loja.

## 2. Idade mínima

Você precisa ter pelo menos a idade em que, no seu país, pode consentir por si mesmo com o tratamento dos seus dados: na Alemanha, 16 anos; em outros países, conforme a legislação local, de 13 a 16 anos. O app pergunta sua data de nascimento na configuração inicial e só permite que você continue a partir dessa idade.

Se você ainda não for maior de idade, precisa do consentimento dos seus responsáveis legais para comprar o Loqqa Pro. O coach só está disponível a partir dos 16 anos, e o check corporal só a partir dos 18 anos.

## 3. Sua conta

- Para usar o Loqqa após a configuração inicial, você precisa de uma conta. Você a cria no final da configuração inicial com sua Conta do Google ou, em dispositivos Apple, com sua Conta Apple. O contrato de uso do Loqqa é celebrado quando você cria sua conta.
- Forneça informações verdadeiras na configuração inicial.
- Proteja o acesso à sua Conta do Google ou Conta Apple. Se suspeitar que outra pessoa está usando sua conta, nos informe.
- Sua conta é pessoal e intransferível.

## 4. O que o Loqqa oferece

O Loqqa ajuda você no treino de força. Isso inclui, em especial:

- um plano de treino que um modelo de IA cria a partir das suas informações, por exemplo objetivo, experiência, equipamentos e treinos por semana
- a importação do seu plano de treino e dos seus treinos anteriores a partir de um arquivo, por exemplo a exportação de outro app
- o registro dos seus treinos com cargas, repetições e tempos, seu histórico, recordes, suas séries por músculo em um período de sua escolha e sugestões para as suas séries
- o registro do seu peso corporal
- o check corporal com fotos e valores estimados (a partir dos 18 anos)
- o Kai, o coach de IA: um modelo de IA que responde às suas perguntas sobre o seu treino, geralmente com um gráfico feito a partir dos seus dados, e que, a seu pedido, monta treinos e sugere a substituição de exercícios (a partir dos 16 anos)
- um catálogo de exercícios com instruções, imagens e vídeos
- um chat de suporte para relatos de erro e ideias

Você pode fazer a configuração inicial, incluindo a criação de plano ou a importação, gratuitamente. Depois disso, o uso do Loqqa requer uma assinatura (Loqqa Pro, seção 6). Sem uma assinatura ativa, sua conta e seus dados são mantidos, e você continua podendo usar as configurações, o suporte e a exclusão da conta; as demais funções ficam bloqueadas.

O reconhecimento na importação pode cometer erros. Por isso, verifique o plano reconhecido e a associação dos seus exercícios antes de adotá-los; o app mostra a você, para verificação, os exercícios cujo reconhecimento é incerto. Um plano que o app cria para você também é uma sugestão: dê uma olhada nele e ajuste-o se necessário. As respostas do coach também podem estar erradas, por exemplo se o modelo entender mal uma pergunta. Para que o coach não seja usado de forma abusiva, você pode fazer a ele no máximo 20 perguntas em 24 horas e 150 perguntas em 30 dias. Para a criação de plano, a importação, o check corporal e o coach, o app precisa de conexão com a internet.

Muitas funções do Loqqa funcionam também sem conexão com a internet. Seus dados são sincronizados assim que você estiver on-line. Alterações que ainda não tiverem sido sincronizadas quando você sair da conta são perdidas; o app avisa você antes.

O Loqqa é uma ferramenta de apoio para o seu treino. Não garantimos um determinado resultado de treino.

## 5. Avisos de saúde

> O Loqqa não substitui aconselhamento, diagnóstico ou tratamento médico.

- O Loqqa dá recomendações gerais de treino. O app não oferece aconselhamento médico, fisioterapêutico ou nutricional. O Loqqa não é um dispositivo médico e não se destina a detectar, monitorar ou tratar doenças.
- Consulte um médico antes de iniciar um programa de treino, especialmente em caso de doenças preexistentes (por exemplo, do sistema cardiovascular), de queixas ou lesões, após cirurgias, durante a gravidez ou a amamentação e se você estiver há muito tempo sem treinar.
- Os valores do check corporal, por exemplo o percentual de gordura corporal estimado, são estimativas aproximadas de um modelo de IA. Eles não são uma medição médica nem um diagnóstico.
- As respostas do coach são informações e recomendações gerais para o seu treino, criadas por um modelo de IA. Elas podem estar erradas e não substituem a orientação de um médico ou fisioterapeuta. Em caso de dor ou lesão, o coach não faz diagnósticos; se as queixas persistirem, procure um médico.
- Planos e sugestões são uma orientação. Escolha cargas e repetições que você consiga fazer com segurança e com técnica correta. Com cargas pesadas, use travas de segurança ou peça ajuda a alguém.
- Pare imediatamente se sentir dor, tontura, falta de ar ou pressão no peito e, se necessário, procure ajuda médica.

## 6. Loqqa Pro, período de teste e assinatura

- **Compra:** você compra o Loqqa Pro no app, pela App Store da Apple ou pelo Google Play. Você celebra o contrato de compra com a Apple ou com o Google, respectivamente. Pagamento, cobrança, renovação, cancelamento e reembolso seguem os termos da respectiva loja.
- **Preços e períodos:** o Loqqa Pro está disponível como assinatura mensal e como assinatura anual. Você vê os preços atuais na sua moeda antes da compra, no app e na loja.
- **Período de teste:** o Loqqa Pro pode começar com um período de teste gratuito de 7 dias. A loja decide se você pode usá-lo, normalmente uma vez por conta da loja. Se você não cancelar a tempo antes do fim do teste, ele se converte automaticamente em uma assinatura paga. Antes da compra, o app mostra em que dia começa a assinatura paga. Não enviamos um lembrete separado antes do fim do período de teste.
- **Renovação:** sua assinatura é renovada automaticamente pelo período escolhido se você não a cancelar a tempo: na App Store, até 24 horas antes do fim do período; no Google Play, antes da data de renovação.
- **Cancelamento:** você cancela nas configurações de assinatura da sua conta da loja. No app, você encontra o link para isso em “Gerenciar assinatura”. Após o cancelamento, o Loqqa Pro continua ativo até o fim do período pago.
- **Importante:** excluir o app ou a sua conta não cancela a sua assinatura.
- **Restaurar compras:** o Loqqa Pro vale para a conta Loqqa com a qual você o comprou, em todos os dispositivos em que você estiver logado com ela. Por meio de “Restaurar compras”, na página do Loqqa Pro no app, você pode reativar uma compra da sua conta da loja; se fizer isso com outra conta Loqqa, o Loqqa Pro passa para essa conta.
- **Reembolsos:** os reembolsos seguem os termos da respectiva loja. Para isso, entre em contato com a Apple ou com o Google, respectivamente.
- **Alterações de preço:** os preços de assinaturas em andamento só podem mudar de acordo com os procedimentos da respectiva loja. A loja informa você com antecedência e, quando exigido, pede o seu consentimento. Se você não concordar com um novo preço, pode cancelar sua assinatura para o fim do período.

## 7. Direito de arrependimento

Como consumidor, você tem, em princípio, um direito legal de arrependimento em contratos de conteúdos digitais e serviços digitais. Como você compra o Loqqa Pro com a Apple ou com o Google, são as lojas que informam você sobre esse direito, e o exercício e o processamento do arrependimento seguem os procedimentos delas.

## 8. Seus conteúdos

Os conteúdos que você coloca no Loqqa continuam sendo seus, por exemplo planos, dados de treino, fotos, seu texto “Sobre você”, suas mensagens de suporte e suas perguntas ao coach. Você nos concede sobre eles apenas os direitos simples (não exclusivos) e intransferíveis de que precisamos para disponibilizar o app para você: salvar, sincronizar, tratar e exibir para você seus conteúdos, bem como processar suas solicitações de suporte. Esses direitos terminam quando você exclui os conteúdos ou a sua conta.

- Envie apenas conteúdos sobre os quais você tenha os direitos necessários. Você só pode importar planos de treino de treinadores, de livros ou de apps na medida em que tenha permissão para usá-los no seu próprio treino.
- Nas suas fotos e capturas de tela não podem aparecer outras pessoas que não tenham consentido.
- Conteúdos ilegais, ofensivos ou impróprios não são permitidos, nem mesmo no chat de suporte ou nas perguntas ao coach.

Ideias e sugestões que você nos envia podem ser usadas por nós gratuitamente para melhorar o Loqqa. Não existe direito à implementação nem a remuneração.

## 9. Suporte

No chat de suporte do app, você pode relatar erros e sugerir funções. Respondemos a você por lá, normalmente em poucos dias. Os tempos de resposta informados no app são estimativas, não um compromisso vinculante. Você também pode falar com a gente por e-mail em support@useloqqa.com.

## 10. Uso permitido

Você só pode usar o Loqqa de forma privada, para o seu próprio treino. O uso comercial, por exemplo por treinadores para os seus clientes, só é permitido com a nossa autorização prévia. Em especial, não é permitido:

- contornar medidas técnicas de proteção ou a verificação da assinatura
- acessar o app ou os nossos servidores de forma automatizada, extrair conteúdos em massa ou sobrecarregar excessivamente os nossos servidores
- tentar acessar dados de outros usuários
- descompilar ou modificar o app, salvo na medida em que a lei o permita expressamente (§§ 69d e 69e da Lei alemã de Direitos Autorais (UrhG))

O app, o catálogo de exercícios com textos, imagens e vídeos, bem como marcas e designs, são protegidos por lei. Você recebe um direito simples (não exclusivo) e intransferível de usá-los no âmbito destes termos.

## 11. Disponibilidade, atualizações e alterações do app

- Fazemos o possível para que o Loqqa funcione de forma confiável. No entanto, não podemos garantir uma disponibilidade ininterrupta dos nossos servidores, por exemplo em caso de manutenção ou de falhas dos nossos prestadores de serviços. Mesmo nesses casos, você pode usar muitas funções off-line.
- Disponibilizamos a você as atualizações necessárias para que o Loqqa funcione conforme o contrato, em especial atualizações de segurança (§ 327f do Código Civil alemão (BGB)). Instale-as o quanto antes, por favor.
- Podemos alterar e desenvolver o Loqqa se houver um motivo válido para isso (por exemplo, novos requisitos técnicos, segurança, desenvolvimento do app ou uma mudança na situação jurídica), se isso não gerar custos adicionais para você e se informarmos você de forma clara e compreensível. Se uma alteração prejudicar mais do que de forma insignificante o seu acesso ao Loqqa ou a usabilidade, informaremos você com antecedência. Nesse caso, você pode encerrar o contrato gratuitamente, nos termos do § 327r do BGB.
- Atualizamos o catálogo de exercícios continuamente.

## 12. Responsabilidade

- Respondemos de forma ilimitada em caso de dolo e culpa grave, de lesão à vida, ao corpo ou à saúde, nos termos da Lei alemã de Responsabilidade pelo Produto (ProdHaftG) e na medida de uma garantia que tenhamos assumido.
- Em caso de violação, por culpa leve, de uma obrigação contratual essencial, respondemos apenas pelo dano típico do contrato e previsível. Obrigações contratuais essenciais são aquelas cujo cumprimento é o que torna possível a execução regular do contrato e em cujo cumprimento você pode regularmente confiar.
- No mais, não respondemos por culpa leve.
- Essas regras também se aplicam à responsabilidade pessoal dos nossos representantes e auxiliares de cumprimento.
- Seus direitos legais em caso de defeitos de produtos digitais (§§ 327 e seguintes do BGB) não são afetados.

## 13. Vigência, rescisão e exclusão da conta

- O contrato de uso do Loqqa vigora por prazo indeterminado.
- Você pode encerrá-lo a qualquer momento excluindo sua conta no app: nas configurações, em “Excluir conta”. Você também pode solicitar a exclusão por e-mail para support@useloqqa.com.
- Podemos rescindir o contrato com um aviso prévio de quatro semanas se você não tiver uma assinatura ativa. Uma assinatura paga não é afetada até o fim do período pago.
- O direito de ambas as partes de rescindir o contrato sem aviso prévio por justa causa não é afetado. Para nós, há justa causa em especial no caso de violações graves ou reiteradas destes termos.
- Com a exclusão da sua conta, excluímos seus dados conforme descrito na Política de Privacidade. Não podemos recuperar dados excluídos.
- Você cancela sua assinatura pela loja (seção 6).

## 14. Alterações destes termos

Podemos alterar estes termos, por exemplo quando introduzirmos novas funções ou quando a situação jurídica mudar. Mostramos a nova versão a você no app, com as alterações destacadas. Alterações que afetem de forma relevante os seus direitos ou obrigações só passam a valer para você quando você as aceitar no app. Até lá, você só pode usar no app as configurações, o suporte e a exclusão da conta. Se você não aceitar, pode encerrar o contrato a qualquer momento excluindo sua conta; você cancela sua assinatura na loja.

## 15. Disposições finais

- **Lei aplicável:** aplica-se o direito da República Federal da Alemanha, com exclusão da Convenção das Nações Unidas sobre Contratos de Compra e Venda Internacional de Mercadorias (CISG). Como consumidor, você mantém a proteção das disposições imperativas do país em que tem sua residência habitual.
- **Foro:** para comerciantes, pessoas jurídicas de direito público e patrimônios especiais de direito público, o foro é Munique. Para consumidores, aplicam-se os foros legais.
- **Resolução de litígios de consumo:** não estamos dispostos nem somos obrigados a participar de procedimentos de resolução de litígios perante um órgão de conciliação de consumo.
- **Idioma:** estes termos existem em alemão, inglês, português, coreano, espanhol e francês. Prevalece a versão em alemão; as demais são traduções.
- **Disposições inválidas:** se uma disposição destes termos for inválida, o restante do contrato continua válido. A disposição inválida é substituída pelas disposições legais.
$md$, '2026-11-07 10:00:00+00', false),
  ('privacy', 'pt-BR', '1.5', $md$# Política de Privacidade

Versão: 1.5

Última atualização: 6 de novembro de 2026

Esta é uma tradução. A versão em alemão é a juridicamente vinculante.

Aqui você fica sabendo quais dados pessoais tratamos quando você usa o app Loqqa, para que fazemos isso e quais são os seus direitos. A base é o RGPD (Regulamento Geral sobre a Proteção de Dados da União Europeia), a Lei Federal alemã de Proteção de Dados (BDSG) e a lei alemã de proteção de dados em telecomunicações e serviços digitais (TDDDG).

## Em resumo

- O Loqqa salva seus planos e treinos primeiro no seu dispositivo e os sincroniza com a sua conta assim que você estiver on-line. Nosso banco de dados fica em Frankfurt am Main.
- Outros usuários não podem ver seu perfil, seus treinos nem suas fotos.
- Tratamos seu peso, sua altura e as fotos do seu check corporal como dados de saúde. Só os tratamos com o seu consentimento expresso.
- Para a criação de plano, a importação dos seus treinos, a entrada por voz, o check corporal, o coach e a tradução das mensagens de suporte, usamos um modelo de IA da OpenAI. Para isso, transferimos os dados necessários à OpenAI, que os trata nos EUA.
- Para melhorar o app, medimos com o PostHog como ele é usado. Dados de saúde e fotos não vão para o PostHog. O app não contém publicidade.
- Você pode excluir sua conta a qualquer momento no app. Com isso, excluímos também suas fotos e todos os dados da sua conta.

## 1. Quem é o responsável?

O responsável pelo tratamento dos seus dados (controlador) é:

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 Munique, Alemanha
- E-mail: support@useloqqa.com

A seguir, nos referimos a nós mesmos como “nós”.

## 2. Encarregado de proteção de dados

Não nomeamos um encarregado de proteção de dados, porque não somos obrigados a isso. Você pode enviar todas as suas dúvidas sobre proteção de dados diretamente para support@useloqqa.com.

## 3. Como o Loqqa funciona

O Loqqa é um app de treino. Você pode pedir que um plano de treino seja criado para você ou importar seu plano e seus treinos anteriores de outro app ou de uma planilha, registrar seus treinos e seu peso corporal, fazer perguntas ao coach sobre o seu treino e, a partir dos 18 anos, fazer checks corporais com fotos.

O app funciona no modo “offline first”: seus dados ficam em um banco de dados no seu dispositivo, para que você possa treinar também sem internet. Se você estiver logado e on-line, o app sincroniza esses dados com a sua conta nos nossos servidores. Assim, seu plano e seu histórico ficam protegidos e disponíveis em todos os seus dispositivos. Para os servidores, usamos prestadores de serviços (seção 7).

Todos os dados no nosso banco de dados estão vinculados à sua conta. Regras técnicas de acesso garantem que só você possa ler e alterar os seus próprios dados. O Loqqa não tem funções com as quais outros usuários vejam seu perfil, seus treinos ou suas fotos.

## 4. Quais dados tratamos e para quê

### 4.1 Configuração inicial sem conta

Você faz a configuração inicial sem conta. Durante ela, o app baixa dos nossos servidores o catálogo de exercícios (nomes, instruções, imagens e vídeos dos exercícios) e estes textos legais. O app verifica se há alterações no catálogo de exercícios ao ser aberto e, depois, a cada hora. Nesse processo, surgem apenas dados de conexão tecnicamente necessários (seção 4.13).

Suas respostas na configuração inicial (por exemplo, nome, sexo, data de nascimento, peso, altura, objetivo e o plano criado ou importado) ficam inicialmente salvas apenas no seu dispositivo. Essas informações só chegam até nós quando você cria uma conta (seções 4.3 e 4.4). Exceções: se você pedir que um plano seja criado, o app já transfere antes suas respostas sobre objetivo, foco, equipamentos, treinos por semana, duração do treino e experiência, para que o plano possa ser criado; de um arquivo que você importa, o app transfere trechos, os nomes dos exercícios e o seu plano, para que possam ser reconhecidos (ambos na seção 4.7). Um histórico de treinos importado só é transferido pelo app quando você cria uma conta.

Base legal: art. 6(1)(b) do RGPD (disponibilização do app que você deseja usar).

### 4.2 Sua conta

No final da configuração inicial, você cria uma conta ao entrar com sua Conta do Google ou, em dispositivos Apple, com sua Conta Apple. Não existe senha do Loqqa. Nesse processo, tratamos:

- as informações que o Google ou a Apple nos transmitem no login, incluindo seu endereço de e-mail (veja abaixo)
- seu nome, para que o app possa preenchê-lo novamente depois de um login em um novo dispositivo
- dados técnicos da conta, como a data e a hora do cadastro e do último login, além de tokens de login

Para que você continue logado, o app salva sua sessão de login no seu dispositivo.

**Login com o Google:** quando você entra com o Google, o login do Google é aberto no seu dispositivo. Em seguida, o Google nos confirma seu login e nos transfere seu endereço de e-mail, seu nome, o endereço da sua foto de perfil do Google e um identificador da sua Conta do Google. Salvamos essas informações na sua conta. Com isso, o Google fica sabendo que você está entrando no Loqqa. Pelo login com a sua Conta do Google, a Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlanda, é controladora independente; aplica-se a [Política de Privacidade do Google](https://policies.google.com/privacy?hl=pt-BR).

**Login com a Apple** (somente em dispositivos Apple): quando você entra com a Apple, o login da Apple é aberto no seu dispositivo. Em seguida, a Apple nos confirma seu login e nos transfere um identificador da sua Conta Apple e seu endereço de e-mail. Em vez disso, você pode escolher um endereço gerado pela Apple que encaminha os e-mails para você (“Ocultar Meu E-mail”). No primeiro login, a Apple também transfere seu nome, se você autorizar. Salvamos essas informações na sua conta. Pelo login com a sua Conta Apple, a Apple Distribution International Limited, Hollyhill Industrial Estate, Hollyhill, Cork, Irlanda, é controladora independente; aplica-se a [Política de Privacidade da Apple](https://www.apple.com/br/legal/privacy/).

Contas só são criadas no final da configuração inicial. Se um login por “Entrar” na tela inicial criar uma nova conta, o app a exclui imediatamente e avisa você de que ainda não existe uma conta.

Base legal: art. 6(1)(b) do RGPD.

### 4.3 Perfil e planejamento de treino

Quando você cria uma conta, salvamos suas informações da configuração inicial como o seu perfil. Parte delas você pode alterar depois nas configurações e no seu perfil.

- nome, sexo biológico (também é possível escolher “Prefiro não informar”) e data de nascimento
- peso corporal, altura e suas unidades preferidas (métrico ou imperial)
- experiência de treino, objetivo de treino, grupos musculares em foco, equipamentos disponíveis, treinos por semana e duração de treino desejada
- o idioma do app, para que nosso suporte possa responder a você no seu idioma
- opcionalmente: uma foto de perfil (o app a salva como imagem quadrada de 512 × 512 pixels) e um texto curto “Sobre você” com até 150 caracteres

Para quê: precisamos da sua data de nascimento para verificar a idade mínima (seção 16) e os limites de idade do coach e do check corporal. A partir do objetivo de treino, foco, equipamentos, treinos por semana, duração do treino e experiência, um modelo de IA da OpenAI cria seu plano de treino, se você pedir que um seja criado (seção 4.7). O coach também usa seu objetivo, sua experiência, seus equipamentos, seu foco e suas unidades para as respostas dele (seção 4.8). O app usa sexo, idade, peso e altura para o check corporal (seção 4.6). A foto de perfil e o texto “Sobre você” são exibidos apenas para você, no seu perfil.

Base legal: art. 6(1)(b) do RGPD; para peso corporal e altura, o seu consentimento (seção 4.4).

### 4.4 Dados de saúde e o seu consentimento

Algumas informações podem permitir conclusões sobre a sua saúde. Por isso, nós as tratamos como dados de saúde nos termos do art. 9 do RGPD:

- **Medidas corporais:** seu peso corporal, seus registros de peso e sua altura (seções 4.3 e 4.5).
- **Check corporal:** as fotos do seu check corporal e os valores que resultam delas, por exemplo um percentual de gordura corporal estimado (seção 4.6).

Só tratamos esses dados com o seu consentimento expresso (art. 9(2)(a) em conjunto com o art. 6(1)(a) do RGPD):

- **Medidas corporais:** quando você cria sua conta, você consente expressamente, por meio do aviso logo acima do botão, que tratemos seus dados corporais para adaptar seu treino. Antes disso, peso e altura ficam no seu dispositivo.
- **Check corporal:** antes de enviar suas fotos para avaliação, o app avisa você de que as fotos e os dados corporais serão transferidos para isso à OpenAI, nos EUA. Ao tocar em “Concluído”, você consente com isso.
- **Coach:** para as respostas dele, o coach também usa seus registros de peso e os valores gerais dos seus checks corporais, e nosso servidor transfere para isso seus dados de treino e corporais à OpenAI, nos EUA (seção 4.8). Ao criar sua conta e aceitar esta Política de Privacidade, você consente com isso. Salvamos a data e a hora do seu consentimento. Só transferimos esses dados quando você faz uma pergunta ao coach.

O check corporal e o coach são opcionais. Você pode revogar seus consentimentos a qualquer momento, com efeito para o futuro (seção 12).

### 4.5 Dados de treino e peso corporal

Quando você usa o Loqqa, salvamos:

- **Planos:** nome, treinos por semana, blocos com semana de deload, treinos na sua ordem (inclusive treinos sem plano), exercícios, séries com valores-alvo (repetições ou segundos), repetições em reserva (RIR) e tempos de descanso
- **Treinos concluídos,** inclusive os que você importa: início e fim, a qual plano e a qual semana do plano pertencem, exercícios, peso e repetições ou segundos por série, o momento de cada série concluída e recordes pessoais
- **Exercícios próprios** que você cria ou que surgem na importação
- **Peso corporal:** os registros de peso que você faz, um valor por dia

Para quê: para que você possa registrar seus treinos e seu peso e ver seu histórico, seus recordes, suas séries por músculo em um período de sua escolha e sua atividade. O app calcula as sugestões para as suas séries e o número das suas séries por músculo no seu dispositivo. Se você fizer uma pergunta ao coach, ele a responde a partir desses dados (seção 4.8).

Base legal: art. 6(1)(b) do RGPD; para os registros de peso, o seu consentimento (seção 4.4).

### 4.6 Check corporal

O check corporal é opcional e só está disponível a partir dos 18 anos. Para ele, você tira três fotos com a câmera: de frente, de lado e de costas. O app recomenda usar roupa íntima ou roupa esportiva justa. Seu rosto pode aparecer nas fotos.

O app reduz as fotos para no máximo 1080 pixels de largura e as salva no seu dispositivo. Quando você inicia a avaliação, o app envia as fotos para uma área de armazenamento não pública da sua conta. Elas permanecem lá para que você também possa vê-las nos seus outros dispositivos. Para a avaliação, você precisa de conexão com a internet.

**Avaliação por um modelo de IA da OpenAI:** os valores do seu check são determinados por um modelo de IA da OpenAI. Para isso, nosso servidor transfere à OpenAI:

- as três fotos deste check e, se houver, as fotos do seu check anterior, para que o modelo possa comparar diretamente as mudanças
- sexo, idade (calculada a partir da sua data de nascimento), altura, peso e experiência de treino do seu perfil
- os valores do seu check anterior, para que os valores continuem comparáveis de um check para o outro

Não transferimos seu nome, seu endereço de e-mail nem o ID da sua conta. A OpenAI trata os dados nos EUA (seção 8). Configuramos a OpenAI para não armazenar a solicitação para consulta posterior. A OpenAI não usa dados da sua API para treinar seus modelos e os guarda por até 30 dias para detectar abusos; depois disso, eles são excluídos.

Primeiro, o modelo verifica se as fotos podem ser avaliadas, por exemplo se estão claras o suficiente e se seu corpo aparece pelo menos da cabeça até os joelhos. Se uma foto não puder ser avaliada, o app pede que você a tire de novo. Caso contrário, o modelo fornece valores para seis grupos musculares (ombros, peito, braços, costas, abdômen, pernas), um percentual de gordura corporal estimado e valores de proporções e definição. A partir deles, nosso servidor calcula o valor geral. Salvamos esses valores no seu check.

Antes de nosso servidor avaliar um check, ele verifica com a RevenueCat se a sua conta tem o Loqqa Pro (seção 4.12). Registramos cada avaliação com data, hora e resultado. Assim, limitamos o número de avaliações por dia e garantimos que os valores salvos venham de uma avaliação. Excluímos esse registro junto com a sua conta.

Os valores são estimativas aproximadas, e não uma medição ou um diagnóstico médico.

**Quem tem acesso:** tecnicamente, só o operador do Loqqa, Jan Timo Hünnebeck, pode acessar a área de armazenamento. Ele só olha fotos do check corporal se você pedir isso no suporte, se for necessário para corrigir um erro que você relatou ou se formos legalmente obrigados a isso.

Você pode excluir checks individuais no app. Nesse caso, o app exclui as fotos no seu dispositivo e no nosso armazenamento. Se o seu dispositivo estiver off-line nesse momento, pode ser que fotos permaneçam no nosso armazenamento até você excluir sua conta; nesse caso, escreva para nós e nós as excluiremos.

Base legal: o seu consentimento expresso (seção 4.4), também para a transferência à OpenAI nos EUA (art. 49(1)(a) do RGPD, complementando as garantias da seção 8).

### 4.7 Importação, criação de plano e exercícios por voz

Você pode importar seus treinos de outro app ou de uma planilha: como arquivo no formato CSV, TSV, Excel ou OpenDocument, por exemplo a exportação do Hevy ou do Strong. O arquivo pode conter seu histórico de treinos, seu plano de treino ou ambos. Cuide para que não haja dados de outras pessoas no arquivo.

**Leitura no seu dispositivo:** o app abre o arquivo e lê as linhas dele no seu dispositivo. Para isso, ele não transfere todo o seu histórico de treinos ao nosso servidor.

**Reconhecimento por um modelo de IA da OpenAI:** para que o app entenda como seu arquivo está estruturado e a quais exercícios ele se refere, o app transfere ao nosso servidor, junto com o idioma do app: o nome do arquivo e os nomes das abas da planilha, o cabeçalho de cada aba, uma seleção de no máximo 150 linhas (do início, do meio e do fim) e informações sobre cada coluna (por exemplo, quantas células estão preenchidas e valores frequentes), os nomes dos exercícios do seu histórico com o número de séries de cada um e um peso típico, além das linhas do seu plano, se o arquivo contiver um. O servidor os repassa, junto com o nosso catálogo de exercícios, a um modelo de IA da OpenAI. Ele reconhece quais colunas contêm, por exemplo, data, exercício, peso e repetições, associa os nomes dos exercícios ao nosso catálogo e extrai os treinos, exercícios, séries, repetições e descansos do seu plano. Se o arquivo não contiver um plano, o app monta um a partir dos seus treinos das últimas seis semanas; para treinos sem nome, o modelo sugere um e, para isso, recebe apenas os exercícios desses treinos e quantas vezes você os fez. Não transferimos outros dados nesse processo: as solicitações não contêm nem a sua conta nem o seu nome. A OpenAI trata os dados nos EUA (seção 8). Configuramos a OpenAI para não armazenar a solicitação para consulta posterior. A OpenAI não usa dados da sua API para treinar seus modelos e os guarda por até 30 dias para detectar abusos.

Nosso servidor não salva seu arquivo nem os trechos transferidos; ele apenas devolve o resultado ao app. É salvo o que você adotar no final: os treinos do seu histórico, como treinos concluídos, e o plano que você confirmar (seção 4.5). O app não importa novamente treinos que começam no mesmo horário que um treino da sua conta. Os exercícios que nosso catálogo não conhece são criados pelo app como exercícios próprios na sua conta. Se você importar seu histórico na configuração inicial, ele fica no seu dispositivo até a criação da sua conta e, depois, é transferido para a sua conta.

**Criação de plano por um modelo de IA da OpenAI:** se você pedir que um plano seja criado, o app transfere ao nosso servidor suas respostas sobre objetivo de treino, grupos musculares em foco, equipamentos, treinos por semana, duração do treino e experiência de treino, além do idioma do app. O servidor as repassa, junto com os exercícios do nosso catálogo adequados aos seus equipamentos, a um modelo de IA da OpenAI, que monta seu plano a partir disso. Não transferimos nesse processo seu nome, sua data de nascimento, sexo, peso nem sua altura, e a solicitação não contém a sua conta. Para o tratamento na OpenAI, vale o mesmo que na importação. Nosso servidor não salva suas respostas nesse processo; ele apenas devolve o plano ao app, onde você pode alterá-lo.

**Exercícios por voz:** ao configurar um plano, editar um treino e montar um treino livre, você pode falar os exercícios com séries e repetições em vez de procurá-los um a um. O reconhecimento de fala do seu sistema operacional transforma o que você fala em texto: o da Apple no iPhone e o do Google em dispositivos Android. Dependendo do dispositivo, isso acontece no próprio aparelho ou em servidores da Apple ou do Google; valem as políticas de privacidade deles. Não recebemos a gravação em si. O app transfere ao nosso servidor o texto, que você ainda pode alterar antes de adicionar os exercícios, junto com o idioma do app. O servidor o envia, junto com o nosso catálogo de exercícios, a um modelo de IA da OpenAI, que reconhece os exercícios com séries e repetições. A solicitação não contém sua conta nem seu nome. Para o tratamento pela OpenAI vale o mesmo que na importação. Nosso servidor não salva o texto.

**Limitação das solicitações:** para que a importação, a criação de plano e os exercícios por voz não sejam usados de forma abusiva, limitamos quantas vezes elas podem ser usadas por dia, por rede e no total. Para isso, nosso servidor salva, para cada solicitação, a data e a hora, a qual dessas funções se referiu e um valor de hash do seu endereço IP, gerado com uma chave secreta; não salvamos o endereço IP em si. Registros com mais de dois dias são excluídos a cada nova solicitação.

Base legal: art. 6(1)(b) do RGPD para a importação, a criação de plano e os exercícios por voz que você inicia, também para a transferência à OpenAI nos EUA. Para a limitação das solicitações, art. 6(1)(f) do RGPD; nosso legítimo interesse é evitar abusos e custos desnecessários.

### 4.8 Kai · Coach IA

Com o Loqqa Pro, você pode fazer perguntas ao Kai, o coach de IA do app, sobre o seu próprio treino, por exemplo “Como meu peso evoluiu?”. O coach responde em poucas frases, geralmente com um gráfico feito a partir dos seus dados. Ele também responde a perguntas gerais de treino, por exemplo com que frequência você deve treinar pernas ou que exercício você pode fazer se algo doer. A seu pedido, ele também monta um treino, mostra um dos seus treinos salvos ou sugere substituir exercícios do seu plano; seu plano só muda quando você confirmar no app. Ele não faz diagnósticos. O Kai é uma IA, não uma pessoa. O coach é opcional e só está disponível a partir dos 16 anos. Para usá-lo, você precisa de conexão com a internet.

**Respostas por um modelo de IA da OpenAI:** o app transfere sua pergunta, junto com o idioma do app e o fuso horário do seu dispositivo, para o nosso servidor. O servidor repassa a pergunta a um modelo de IA da OpenAI. Se o modelo precisar de dados, ele os solicita ao nosso servidor: o servidor calcula os valores a partir dos seus dados salvos e transfere os resultados à OpenAI. A partir deles, o modelo escreve a resposta. A cada pergunta, nosso servidor transfere à OpenAI:

- sua pergunta e as últimas perguntas deste chat, até seis, com as respectivas respostas e os dados consultados para elas
- a data de hoje, suas unidades e o idioma do app
- objetivo de treino, experiência de treino, equipamentos e grupos musculares em foco do seu perfil, além do nome e dos treinos por semana do seu plano ativo
- os treinos do seu plano ativo com os respectivos exercícios e a situação deles nesta semana (feito, próximo ou em aberto), além dos nomes dos seus outros treinos salvos
- o número dos seus treinos com a data do primeiro e do último, o número dos seus registros de peso com a data do primeiro e o número dos seus checks corporais
- os exercícios que você fez, inclusive exercícios próprios: nome, como você os registra, em quantos treinos você os fez e quando os fez pela última vez

Dependendo da pergunta, nosso servidor também transfere o que calcula para ela a partir dos seus dados:

- treinos com data, nome, duração, exercícios e séries (peso, repetições, segundos e RIR)
- valores por treino, por exemplo o peso máximo estimado para uma repetição (1RM), o maior peso, repetições, tempo de sustentação, volume e recordes
- seus registros de peso e uma curva de peso suavizada
- os valores gerais dos seus checks corporais, sem fotos e sem valores individuais como o percentual de gordura corporal
- treinos, séries, volume e tempo de treino por semana ou por mês, pausas no treino e os dias da semana dos seus treinos
- séries por grupo muscular e por exercício
- os exercícios, as séries e as metas de um treino salvo, quando o coach o mostra ou sugere uma alteração nele
- exercícios do catálogo do app, quando o coach monta um treino ou sugere uma substituição, com os que você mais fez em primeiro lugar

Não transferimos seu nome, seu endereço de e-mail, o ID da sua conta, sua data de nascimento e idade, seu sexo, sua altura, sua foto de perfil, seu texto “Sobre você”, as fotos do seu check corporal nem suas mensagens de suporte. Por favor, não escreva dados de outras pessoas nas suas perguntas. A OpenAI trata os dados nos EUA (seção 8). Configuramos a OpenAI para não armazenar a solicitação para consulta posterior. A OpenAI não usa dados da sua API para treinar seus modelos e os guarda por até 30 dias para detectar abusos; depois disso, eles são excluídos.

As respostas são escritas por um modelo de IA. Elas podem estar erradas. São informações e recomendações para o seu treino, e não aconselhamento médico ou um diagnóstico.

Antes de responder a uma pergunta, nosso servidor verifica sua idade com base na data de nascimento do seu perfil, o seu consentimento (seção 4.4) e, com a RevenueCat, se a sua conta tem o Loqqa Pro (seção 4.12).

**Perguntas por voz:** você também pode falar sua pergunta. Nesse caso, o app grava pelo microfone até você encerrar a gravação, por no máximo dois minutos, e transfere a gravação ao nosso servidor junto com o idioma do app. O servidor a envia a um modelo de reconhecimento de fala da OpenAI, que a transforma em texto. Para que termos como “supino” sejam reconhecidos corretamente, ele envia também uma breve indicação sobre o tema (perguntas a um treinador e termos típicos). O app mostra o texto no campo de entrada, onde você pode alterá-lo; ele só vira sua pergunta quando você o envia. Não salvamos sua gravação: nosso servidor apenas a repassa, e o app a exclui no seu dispositivo assim que o texto estiver pronto ou você descartar a gravação. Por favor, não grave outras pessoas. Para o tratamento pela OpenAI vale o mesmo que para as respostas (EUA, sem uso para treinamento de modelos, retenção de até 30 dias para detectar abusos). Também aqui nosso servidor verifica sua idade e se sua conta tem o Loqqa Pro. Para que a conversão não seja usada de forma abusiva, você pode usá-la no máximo 100 vezes em 24 horas. Para isso, nosso servidor salva, para cada conversão, a data e a hora e um valor de hash do ID da sua conta, gerado com uma chave secreta; registros com mais de dois dias são excluídos a cada nova conversão.

**O que salvamos:** salvamos no nosso banco de dados seus chats com as perguntas, as respostas e os gráficos exibidos abaixo das respostas. O app os sincroniza com os seus dispositivos, para que você veja seus chats neles (seção 5). Para cada pergunta, salvamos também um registro que o app não mostra: data e hora, status (por exemplo, se uma resposta foi dada), o modelo usado, o número de tokens (unidades de texto pelas quais a OpenAI cobra) e a duração, além das consultas do modelo com os dados consultados. Precisamos dessas consultas para que o coach possa responder a perguntas de acompanhamento sobre uma resposta.

**Limitação das perguntas:** para que o coach não seja usado de forma abusiva e para evitar custos desnecessários, você pode fazer no máximo 20 perguntas em 24 horas e 150 perguntas em 30 dias. Para isso, nosso servidor conta os registros.

Você pode excluir chats no app, inclusive vários de uma vez. Nesse caso, excluímos as perguntas, respostas e gráficos deles e os dados consultados nos registros correspondentes. Data e hora, status, modelo, tokens e duração são mantidos, para que a limitação continue valendo e possamos acompanhar os custos do coach. Fora isso, guardamos seus chats até você excluí-los ou excluir sua conta. Com a sua conta, excluímos todos os chats e registros (seção 10).

Base legal: o seu consentimento expresso (seção 4.4), também para a transferência à OpenAI nos EUA (art. 49(1)(a) do RGPD, complementando as garantias da seção 8). Para a conversão de uma pergunta falada em texto, art. 6(1)(b) do RGPD, porque você a inicia, também para a transferência à OpenAI nos EUA. Para a limitação das perguntas e das conversões e as informações sobre data e hora, status, modelo, tokens e duração, art. 6(1)(f) do RGPD; nosso legítimo interesse é evitar abusos e custos desnecessários.

### 4.9 Suporte

Por meio de “Relatar erro” e “Sugerir recurso”, você pode escrever para nós diretamente no app, ou pode escrever para support@useloqqa.com. No app, tratamos nesse processo:

- o tipo da sua solicitação (erro ou ideia), no caso de ideias a importância de 1 a 5, suas mensagens e o assunto (a primeira linha da sua primeira mensagem)
- até cinco capturas de tela por mensagem, que você seleciona da sua galeria; o app as reduz (lado mais longo com no máximo 1600 pixels) e as salva como JPEG
- o histórico da sua solicitação, por exemplo mudanças de status, nossas respostas e se você reabriu uma solicitação
- o dispositivo a partir do qual você envia uma solicitação: plataforma (iOS ou Android), versão do sistema operacional, modelo do dispositivo e versão do app, para que possamos reproduzir erros
- o idioma do app, para que possamos traduzir nossas respostas para o seu idioma
- o idioma detectado de cada mensagem e as respectivas traduções (veja abaixo)

**Tradução por um modelo de IA da OpenAI:** para que possamos entender você e você leia nossas respostas no seu idioma, um modelo de IA da OpenAI traduz as mensagens de suporte. Para isso, nosso servidor transfere à OpenAI cada mensagem com texto, junto com o idioma para o qual ela deve ser traduzida: suas mensagens, para detectar o idioma delas e traduzi-las para o idioma do nosso suporte, e nossas respostas, para traduzi-las para o idioma do seu app. Se você mudar o idioma do app, traduzimos nossas respostas anteriores para o novo idioma. Não transferimos seu nome, seu endereço de e-mail, o ID da sua conta nem suas capturas de tela. Salvamos as traduções junto com as mensagens; no app, você pode ver o original a qualquer momento. A OpenAI trata os dados nos EUA (seção 8). Configuramos a OpenAI para não armazenar a solicitação para consulta posterior. A OpenAI não usa dados da sua API para treinar seus modelos e os guarda por até 30 dias para detectar abusos; depois disso, eles são excluídos.

**Mensagens por voz:** Você também pode falar sua mensagem. Funciona como nas perguntas ao coach (seção 4.8): o app grava até você encerrar a gravação, por no máximo dois minutos. Nosso servidor repassa a gravação, com uma breve indicação do tema, a um modelo de reconhecimento de fala da OpenAI. O app mostra o texto no campo de entrada, onde você pode alterá-lo; ele só se torna sua mensagem quando você o envia. Não armazenamos sua gravação. Aqui também nosso servidor verifica sua idade e se sua conta tem o Loqqa Pro, e vale o mesmo limite.

**Quem vê sua solicitação:** tratamos as solicitações em uma área de suporte interna no navegador, que só Jan Timo Hünnebeck pode acessar, com um acesso próprio. Junto com a sua solicitação, essa área mostra também seu endereço de e-mail, se você entra com a Apple ou com o Google, o ID da sua conta, a data de criação da sua conta e da sua última atividade, o idioma do app e suas solicitações anteriores.

O app salva as capturas de tela primeiro no seu dispositivo e depois as envia em segundo plano. Você não pode excluir mensagens e solicitações por conta própria, para que o histórico continue rastreável. Elas são excluídas junto com a sua conta; se você quiser, excluímos solicitações encerradas também antes disso. Guardamos e-mails pelo tempo em que precisarmos deles para o seu assunto.

Por favor, não nos envie em mensagens e capturas de tela dados de saúde nem dados de outras pessoas, se não forem necessários para o seu assunto. As mensagens também são transferidas à OpenAI para tradução.

Base legal: art. 6(1)(b) do RGPD, na medida em que sua solicitação diga respeito ao uso do app, por exemplo no caso de erros. No caso de ideias e outros feedbacks, art. 6(1)(f) do RGPD; nosso legítimo interesse é responder à sua solicitação e melhorar o Loqqa. O mesmo vale para a tradução e a transferência à OpenAI nos EUA (seção 8).

### 4.10 Textos legais e aceites

O app carrega, no seu idioma, a versão vigente dos Termos de Uso e desta Política de Privacidade. Quando você aceita uma versão, no cadastro ou depois, no caso de uma versão alterada, salvamos qual versão você aceitou, a data e a hora (definidas pelo servidor), a versão do app e a plataforma (iOS ou Android). Assim, podemos comprovar qual versão se aplica a você e pedir novamente o seu aceite em caso de alterações relevantes.

Base legal: art. 6(1)(c) em conjunto com o art. 7(1) do RGPD (comprovação de consentimentos) e art. 6(1)(f) do RGPD (nosso legítimo interesse em poder comprovar quais condições se aplicam).

### 4.11 Loqqa Pro: assinaturas e compras

Você compra o Loqqa Pro pela App Store da Apple ou pelo Google Play. A compra e o pagamento são processados pela Apple ou pelo Google, respectivamente. Eles são os próprios responsáveis por isso e tratam seus dados de pagamento de acordo com suas próprias políticas de privacidade: [Apple](https://www.apple.com/br/legal/privacy/) e [Google](https://policies.google.com/privacy?hl=pt-BR). Não recebemos dados de pagamento, como números de cartão de crédito.

Para que possamos liberar o Loqqa Pro, ficamos sabendo, por meio da RevenueCat (seção 4.12), qual assinatura você comprou, se há um período de teste em andamento, quando você comprou e se a assinatura está ativa. O app salva esse status no seu dispositivo e o consulta novamente ao ser aberto e a cada login. Não salvamos dados de compra nós mesmos no nosso banco de dados.

Você gerencia e cancela sua assinatura nas configurações da sua conta da loja. O app leva até lá em “Gerenciar assinatura”.

Base legal: art. 6(1)(b) do RGPD.

### 4.12 Gestão de assinaturas com a RevenueCat

Gerenciamos compras e assinaturas por meio da RevenueCat. A RevenueCat verifica para nós os comprovantes de compra da loja e informa ao app se o Loqqa Pro está ativo. Antes de nosso servidor avaliar um check corporal ou responder a uma pergunta ao coach, ele consulta a RevenueCat para saber se a sua conta tem o Loqqa Pro.

Para que a RevenueCat possa vincular suas compras à sua conta, transferimos o ID da sua conta, um identificador aleatório sem nome nem endereço de e-mail. Se você comprar antes de criar sua conta, a RevenueCat atribui primeiro um identificador aleatório próprio e depois vincula a compra à sua conta. Além disso, a RevenueCat trata informações de compra e de assinatura da loja (por exemplo, produto, preço, moeda, datas de compra, renovação e expiração, período de teste e identificadores de transação), bem como informações técnicas como plataforma, tipo de dispositivo, versão do app e endereço IP.

Além disso, a RevenueCat envia eventos sobre a sua assinatura à PostHog (seção 4.14), por exemplo um período de teste iniciado ou convertido, renovações e cancelamentos, cada um com a respectiva receita. Para isso, o app passa à RevenueCat o seu identificador da PostHog: antes de você criar a conta, um identificador aleatório; depois, o ID da sua conta.

- Fornecedor: RevenueCat, Inc., 1032 E Brandon Blvd #3003, Brandon, FL 33511, EUA, como nosso operador
- Local de armazenamento: EUA (Amazon Web Services); garantia, ver seção 8
- Prazo de armazenamento: enquanto durar nosso contrato com a RevenueCat; solicitamos a exclusão dos dados da sua conta quando você exclui sua conta e não houver obrigações legais em contrário

Base legal: art. 6(1)(b) do RGPD.

### 4.13 Dados de conexão tecnicamente necessários

Sempre que o app está conectado aos nossos servidores (por exemplo, no login, na sincronização, em envios de arquivos ou ao carregar o catálogo de exercícios e os textos legais), são tratados dados tecnicamente necessários: seu endereço IP, data e hora, a interface acessada, além de informações técnicas como códigos de status e, quando transferidas, informações sobre o app e o sistema operacional. Nossos prestadores de serviços de hospedagem registram esses dados para garantir o funcionamento e a segurança. Na Supabase, os registros são excluídos após um dia; na PowerSync, assim que deixarem de ser necessários para o funcionamento e a segurança.

Base legal: art. 6(1)(f) do RGPD; nosso legítimo interesse é um funcionamento estável e seguro.

### 4.14 Análise de produto e relatórios de erro com o PostHog

Para entender como o Loqqa é usado e para encontrar erros, usamos o PostHog. Para isso, o app envia:

- **Eventos de uso:** quais telas você abre e determinadas etapas, por exemplo início da configuração inicial, planos criados ou importados, históricos de treinos importados (apenas o tamanho deles, nunca o conteúdo), acessos à página do Loqqa Pro, compras, cadastro e login, início, fim ou interrupção de um treino, o fato de você ter feito uma pergunta ao coach e de ele ter respondido ou não (nunca o texto), a avaliação de um check corporal (nunca os valores), o salvamento de um registro de peso (nunca o peso), exercícios adicionados por voz, pedidos de avaliação na loja, cada um com data e hora e métricas como número de exercícios ou séries, duração ou código de erro
- **Eventos de assinatura:** períodos de teste iniciados ou convertidos, renovações e cancelamentos com a respectiva receita, enviados pela RevenueCat (seção 4.12)
- **Eventos do app:** abertura e fechamento do app, versão do app, tipo de dispositivo, sistema operacional e idioma
- **Relatórios de erro:** mensagens de falha e de erro com detalhes técnicos
- **Informações do perfil:** após o cadastro, objetivo, experiência, treinos por semana, divisão de treino (split), equipamentos, idioma, unidades, uma faixa etária (por exemplo, “25–34”) e se você tem o Loqqa Pro
- **um identificador pseudônimo:** antes do cadastro, um identificador aleatório que o app salva no seu dispositivo; depois, o ID da sua conta, para que eventos de antes e depois do cadastro sejam unificados

Não vão para o PostHog seu nome, seu endereço de e-mail, peso, altura, sua data de nascimento, fotos e valores do check corporal nem textos livres. O PostHog não salva seu endereço IP, e não usamos gravações de sessão. Quando você sai da conta, o app redefine o identificador.

- Fornecedor: PostHog, Inc., 2261 Market St. #4008, San Francisco, CA 94114, EUA, como nosso operador
- Local de armazenamento: PostHog Cloud EU (Frankfurt am Main); o PostHog é certificado no âmbito do EU-US Data Privacy Framework (seção 8)
- Prazo de armazenamento: os eventos são excluídos após um ano

Base legal: art. 6(1)(f) do RGPD; nosso legítimo interesse é melhorar o Loqqa e corrigir erros. Você pode se opor a isso a qualquer momento (seção 11), por exemplo por e-mail para support@useloqqa.com; nesse caso, excluímos os dados de análise da sua conta.

## 5. Armazenamento no seu dispositivo

Para que o Loqqa funcione também off-line, o app salva dados no seu dispositivo:

- um banco de dados local com seu perfil, seus planos e treinos, seus registros de peso, os valores dos seus checks corporais, seus chats com o coach, suas solicitações de suporte e seus aceites
- fotos do check corporal que você tirou neste dispositivo e cópias das suas capturas de tela do suporte
- sua sessão de login, suas respostas da configuração inicial, um histórico de treinos importado na configuração inicial, até que ele esteja na sua conta, o status da sua assinatura, configurações como o idioma do app, além de listas dos arquivos que ainda precisam ser enviados
- o catálogo de exercícios
- o identificador e eventos ainda não enviados para o PostHog (seção 4.14)

Com exceção dos dados para o PostHog, esse armazenamento é estritamente necessário para os serviços que você deseja usar (§ 25(2), n.º 2, da TDDDG).

Quando você sai da conta, o app exclui o banco de dados local, bem como as fotos do seu check corporal e as cópias de capturas de tela neste dispositivo, e redefine a configuração inicial, o status da assinatura, os treinos em andamento e uma importação ainda não transferida. Alterações ainda não sincronizadas são perdidas nesse processo; o app avisa você antes. Configurações como o idioma do app são mantidas. Quando você exclui o app, seu sistema operacional normalmente remove todos os dados do app.

Dependendo das configurações do seu dispositivo, arquivos do app, inclusive fotos do check corporal, podem estar incluídos em backups do seu dispositivo (por exemplo, no iCloud ou no Google). A Apple ou o Google, respectivamente, são responsáveis por esses backups.

## 6. Permissões no seu dispositivo

O Loqqa só pede uma permissão quando você usa uma função que precisa dela:

- **Câmera:** para as fotos do check corporal e para a sua foto de perfil
- **Fotos:** para selecionar imagens para capturas de tela do suporte e para a sua foto de perfil. Para isso, o app usa o seletor de imagens do seu sistema operacional e recebe apenas as imagens que você seleciona.
- **Arquivos:** para selecionar um arquivo com seus treinos pelo seletor de arquivos do seu sistema operacional (seção 4.7)
- **Microfone:** para falar exercícios (seção 4.7), perguntas ao coach (seção 4.8) e mensagens ao suporte (seção 4.9). O app só grava enquanto você usa a entrada por voz.
- **Reconhecimento de fala (iPhone):** para que o reconhecimento de fala da Apple possa transformar exercícios falados em texto (seção 4.7)

O Loqqa não pede acesso à localização, aos contatos nem a apps de saúde como Apple Saúde ou Health Connect, e não envia notificações push. Você pode retirar permissões a qualquer momento nos ajustes do seu dispositivo.

## 7. Destinatários e operadores

Só compartilhamos seus dados quando isso for necessário para as finalidades mencionadas, quando você tiver consentido ou quando formos legalmente obrigados a isso. Nossos prestadores de serviços tratam dados em nosso nome e de acordo com nossas instruções, como operadores (art. 28 do RGPD):

- **Supabase, Inc.** (banco de dados, login, armazenamento de arquivos, e funções de servidor): servidores em Frankfurt am Main (Amazon Web Services)
- **PowerSync**, da Journey Mobile, Inc. (sincronização entre o app e o banco de dados; para isso, o serviço mantém uma cópia dos seus dados sincronizados): servidores na UE
- **OpenAI Ireland Ltd.**, 117–126 Sheriff Street Upper, Dublin 1, Irlanda (criação de planos por IA, reconhecimento de arquivos de treino importados e de exercícios falados, avaliação das fotos do check corporal, respostas do coach, conversão de perguntas faladas em texto e tradução das mensagens de suporte, seções 4.6 a 4.9): tratamento nos EUA pela OpenAI OpCo, LLC
- **RevenueCat, Inc.** (gestão de assinaturas, seção 4.12)
- **PostHog, Inc.** (análise de produto e relatórios de erro, seção 4.14)

A Apple e o Google recebem dados como controladores independentes em downloads do app e em compras (seção 4.11), e também no login com a conta deles (seção 4.2) e no reconhecimento de fala do sistema operacional deles (seção 4.7).

O Loqqa é operado por uma única pessoa: só Jan Timo Hünnebeck tem acesso aos seus dados, na medida em que precisar dele para o funcionamento e o suporte.

Só fornecemos dados a autoridades e tribunais quando formos legalmente obrigados a isso.

## 8. Transferência para países terceiros

Armazenamos sua conta, seus treinos e suas fotos em data centers na UE (Supabase em Frankfurt am Main, PowerSync na UE). Alguns dos nossos prestadores de serviços têm sede nos EUA. Por isso, dados também podem ser transferidos para os EUA, por exemplo em caso de manutenção ou suporte pelo prestador de serviços. Para a criação de plano, a importação dos seus treinos, exercícios e perguntas falados, a avaliação do check corporal, as respostas do coach e a tradução das mensagens de suporte, transferimos dados à OpenAI nos EUA a cada solicitação (seções 4.6 a 4.9), e a RevenueCat trata os dados de assinatura nos EUA (seção 4.12).

Fundamentamos essas transferências nas seguintes garantias:

- **PostHog:** decisão de adequação da Comissão Europeia para o EU-US Data Privacy Framework, no âmbito do qual o PostHog é certificado (art. 45 do RGPD)
- **Supabase, PowerSync, OpenAI e RevenueCat:** cláusulas contratuais-padrão da Comissão Europeia (art. 46(2)(c) do RGPD), que fazem parte dos nossos contratos de tratamento de dados com operadores
- **Check corporal e coach:** adicionalmente, o seu consentimento expresso (art. 49(1)(a) do RGPD). Nos EUA, autoridades podem, em determinadas circunstâncias, acessar dados sem que você disponha contra isso dos mesmos recursos jurídicos que na UE.

Você pode nos solicitar uma cópia das cláusulas contratuais-padrão.

## 9. Por quanto tempo armazenamos seus dados

- **Conta, perfil, planos, treinos, registros de peso, checks corporais, chats com o coach, solicitações de suporte e aceites:** enquanto sua conta existir. Conteúdos individuais, por exemplo planos, registros de peso, checks corporais ou chats com o coach, você mesmo pode excluir antes disso. Com a sua conta, nós os excluímos por completo (seção 10). Não excluímos automaticamente contas que não são mais usadas; você pode solicitar a exclusão a qualquer momento no app ou por e-mail.
- **Respostas da configuração inicial sem conta:** apenas no seu dispositivo, até você criar uma conta ou excluir o app.
- **Dados no seu dispositivo:** até você sair da conta ou excluir o app (seção 5).
- **Registros do servidor:** um dia na Supabase; na PowerSync, enquanto forem necessários para o funcionamento e a segurança (seção 4.13).
- **Limitação da importação, da criação de plano e da entrada por voz:** dois dias (seções 4.7 e 4.8).
- **Gravações de perguntas faladas:** não as salvamos; o app as exclui após a conversão (seção 4.8).
- **Registros do coach:** enquanto sua conta existir; os dados consultados neles são excluídos junto com o respectivo chat (seção 4.8).
- **Na OpenAI:** até 30 dias (seções 4.6 a 4.9).
- **Dados de análise no PostHog:** um ano (seção 4.14).
- **Dados de assinatura na RevenueCat:** ver seção 4.12.
- **Backups:** atualmente, não fazemos backups do nosso banco de dados nem do nosso armazenamento. Se isso mudar, informaremos aqui por quanto tempo os backups são guardados.

## 10. Excluir conta

Você pode excluir sua conta a qualquer momento no app: nas configurações, em “Excluir conta”. Nesse caso, acontece o seguinte:

1. Se você entrou com a Apple, você confirma isso mais uma vez junto à Apple em um dispositivo Apple. Com isso, encerramos a conexão entre a sua Conta Apple e o Loqqa: nosso servidor troca a confirmação junto à Apple pelas suas chaves de login e faz com que sejam invalidadas imediatamente. Nada é salvo nesse processo.
2. O app exclui do nosso armazenamento sua foto de perfil, as fotos do seu check corporal e suas capturas de tela do suporte.
3. Em seguida, sua conta é excluída. Com isso, todos os dados correspondentes no nosso banco de dados são excluídos automaticamente: perfil, planos, treinos, registros de peso, checks corporais, chats com o coach e os registros correspondentes, solicitações de suporte com todas as mensagens e seus aceites salvos. A cópia na PowerSync também é removida nesse processo.
4. Por fim, o app faz seu logout neste dispositivo e exclui os dados salvos nele.

**Uma assinatura em andamento não termina com isso.** Cancele-a na App Store ou no Google Play.

Em outros dispositivos em que você estava logado, dados salvos localmente podem permanecer até você sair da conta neles ou excluir o app. Dados de análise no PostHog e dados de assinatura na RevenueCat não são excluídos automaticamente junto; escreva para nós se quiser que solicitemos a exclusão imediata deles; caso contrário, valem os prazos da seção 9.

Se a exclusão não funcionar, por exemplo sem conexão com a internet, o app mostra um aviso e você pode tentar novamente. Você também pode solicitar a exclusão por e-mail para support@useloqqa.com.

## 11. Seus direitos

Você tem os seguintes direitos em relação a nós:

- **Acesso** aos dados que tratamos sobre você (art. 15 do RGPD)
- **Retificação** de dados incorretos (art. 16 do RGPD); você pode alterar muitas informações diretamente no app; todas as outras nós alteramos mediante mensagem sua
- **Exclusão** dos seus dados (art. 17 do RGPD); você pode excluir sua conta diretamente no app (seção 10)
- **Limitação** do tratamento (art. 18 do RGPD)
- **Portabilidade dos dados** (art. 20 do RGPD): mediante solicitação sua por e-mail, enviamos a você, no prazo de um mês, os dados que você nos forneceu, como arquivo JSON.
- **Revogação** de consentimentos dados (seção 12)

**Direito de oposição (art. 21 do RGPD):** quando tratamos dados com base no art. 6(1)(f) do RGPD (legítimos interesses), por exemplo para a análise de produto com o PostHog, você pode se opor a esse tratamento a qualquer momento, por motivos relacionados à sua situação particular. Nesse caso, deixamos de tratar os dados, a menos que possamos comprovar motivos legítimos imperiosos que prevaleçam sobre os seus interesses, ou que o tratamento sirva para a declaração, o exercício ou a defesa de direitos num processo judicial.

Para qualquer assunto, basta um e-mail para support@useloqqa.com. Para que possamos identificar sua conta, informe, por favor, o endereço de e-mail que o app mostra nas configurações.

## 12. Revogar consentimentos

Você pode revogar um consentimento a qualquer momento, com efeito para o futuro (art. 7(3) do RGPD). O tratamento realizado até a revogação continua lícito.

- **Medidas corporais:** por e-mail para support@useloqqa.com. Nesse caso, excluímos seu peso, sua altura e seus registros de peso. Sem essas informações, o app só consegue adaptar seu treino de forma limitada; em vez disso, você também pode excluir sua conta (seção 10).
- **Check corporal:** exclua seus checks no app e não faça novos, ou escreva para nós; nesse caso, excluímos todas as fotos e todos os valores do check corporal.
- **Coach:** por e-mail para support@useloqqa.com. Nesse caso, registramos a retirada do seu consentimento. Para o coach, só transferimos dados à OpenAI quando você faz uma pergunta a ele; por isso, depois de retirar o consentimento, não faça mais perguntas, pois uma nova pergunta conta como novo consentimento. Você pode excluir seus chats anteriores no app, ou escreva para nós; nesse caso, nós os excluímos.

## 13. Reclamação junto a uma autoridade de controle

Você pode apresentar uma reclamação junto a uma autoridade de controle de proteção de dados (art. 77 do RGPD), em especial no Estado-membro da UE em que você mora ou trabalha ou em que ocorreu a suposta infração. A autoridade competente para nós é o Bayerisches Landesamt für Datenschutzaufsicht (autoridade de proteção de dados da Baviera), Promenade 18, 91522 Ansbach, Alemanha, [www.lda.bayern.de](https://www.lda.bayern.de).

## 14. Você precisa nos fornecer dados?

Para uma conta, precisamos da sua Conta do Google ou da sua Conta Apple. Sem conta, você não pode usar o Loqqa após a configuração inicial. O app precisa das informações da configuração inicial para verificar sua idade e para criar e adaptar seu plano. São opcionais, em especial, seu sexo (você pode escolher “Prefiro não informar”), o check corporal, o coach, os registros de peso, uma foto de perfil e o texto “Sobre você”.

## 15. Nenhuma decisão automatizada

O app cria planos, sugestões, análises como as suas séries por músculo, valores do check corporal e as respostas do coach automaticamente; os planos que você pede que sejam criados, os valores do check corporal e as respostas do coach vêm de um modelo de IA da OpenAI (seções 4.6 a 4.8). Trata-se de informações, recomendações e estimativas para o seu treino. As respostas do coach podem estar erradas e não são aconselhamento médico. Não tomamos decisões que produzam efeitos jurídicos em relação a você ou que o afetem significativamente de forma similar (art. 22 do RGPD).

## 16. Crianças e adolescentes

O Loqqa se destina a pessoas a partir da idade em que, no seu país, podem consentir por si mesmas com o tratamento dos seus dados: na Alemanha, a partir dos 16 anos; em outros países, conforme a legislação local, a partir dos 13 a 16 anos. O app pergunta sua data de nascimento na configuração inicial e só permite que você continue a partir dessa idade; o determinante é o país configurado no seu dispositivo. O coach só está disponível a partir dos 16 anos, mesmo em países com uma idade mínima menor. O check corporal só está disponível a partir dos 18 anos. Nosso servidor verifica as duas coisas com base na data de nascimento do seu perfil.

Se soubermos que uma conta pertence a uma pessoa abaixo da idade mínima, nós a excluiremos.

## 17. Segurança

Protegemos seus dados com medidas técnicas e organizacionais, entre elas:

- transmissão criptografada entre o app e os servidores (HTTPS/TLS)
- regras de acesso no banco de dados, pelas quais cada conta só pode ler e alterar os seus próprios dados
- áreas de armazenamento não públicas para fotos de perfil, fotos do check corporal e capturas de tela, nas quais cada conta só pode acessar a sua própria pasta
- links com validade limitada para exibir fotos: uma hora para fotos do check corporal e capturas de tela, 24 horas para fotos de perfil
- o login pelo Google ou pela Apple, para que não salvemos senhas

Nenhum sistema é totalmente seguro. Como o app salva dados no seu dispositivo, proteja seu dispositivo, por favor, com um bloqueio de tela.

## 18. Alterações desta Política de Privacidade

Ajustamos esta Política de Privacidade quando o app ou a situação jurídica mudam. Você encontra a versão vigente no app, nas configurações, e em [useloqqa.com](https://useloqqa.com). Informamos você no app sobre alterações relevantes e, quando necessário, pedimos o seu consentimento.
$md$, '2026-11-07 10:00:00+00', false),
  ('terms', 'ko', '1.5', $md$# 이용약관

버전: 1.5

최종 업데이트: 2026년 11월 6일

이 문서는 번역본입니다. 법적 구속력은 독일어 버전에 있습니다.

본 이용약관은 귀하가 Loqqa 앱을 이용하는 방법을 규정합니다. 주의 깊게 읽어 주시기 바랍니다. 당사가 귀하의 데이터를 처리하는 방법은 개인정보 처리방침에서 설명합니다.

## 1. 제공자 및 적용 범위

Loqqa 앱의 제공자는 다음과 같습니다.

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 München, 독일
- 이메일: support@useloqqa.com
- 웹사이트: [useloqqa.com](https://useloqqa.com)

이하에서는 제공자를 “당사”라고 합니다. 본 약관은 앱의 모든 기능에 적용됩니다. Apple의 App Store 또는 Google Play를 통한 구매에는 해당 스토어의 약관도 함께 적용됩니다.

## 2. 최소 연령

귀하는 거주 국가에서 본인의 데이터 처리에 스스로 동의할 수 있는 연령 이상이어야 합니다. 이 연령은 독일에서는 만 16세이며, 그 밖의 국가에서는 현지 법률에 따라 만 13세에서 16세입니다. 앱은 초기 설정 중에 생년월일을 묻고, 이 연령 이상인 경우에만 다음 단계로 진행할 수 있게 합니다.

미성년자가 Loqqa Pro를 구매하려면 부모 또는 법정대리인의 동의가 필요합니다. 코치는 만 16세 이상, 바디 체크는 만 18세 이상만 이용할 수 있습니다.

## 3. 계정

- 초기 설정 이후 Loqqa를 이용하려면 계정이 필요합니다. 계정은 초기 설정의 마지막 단계에서 Google 계정으로, Apple 기기에서는 Apple 계정으로 만듭니다. Loqqa 이용 계약은 귀하가 계정을 만드는 시점에 체결됩니다.
- 초기 설정 중에는 사실에 맞는 정보를 입력해 주십시오.
- Google 계정 또는 Apple 계정에 대한 접근을 안전하게 보호하십시오. 다른 사람이 귀하의 계정을 사용하고 있다고 의심되면 당사에 알려 주십시오.
- 계정은 본인 전용이며 양도할 수 없습니다.

## 4. Loqqa가 제공하는 기능

Loqqa는 근력 운동을 지원합니다. 특히 다음 기능이 포함됩니다.

- 목표, 운동 경험, 장비, 주당 운동 횟수 등 귀하가 입력한 정보를 바탕으로 AI 모델이 만드는 운동 플랜
- 파일(예: 다른 앱에서 내보낸 파일)에서 운동 플랜과 지금까지의 운동 기록 가져오기
- 중량, 반복 수, 시간을 포함한 운동 기록, 운동 이력, 개인 기록, 선택한 기간 동안의 근육별 세트 수 및 세트 제안
- 체중 기록
- 사진과 추정값을 이용한 바디 체크(만 18세 이상)
- AI 코치 카이: 귀하의 운동에 관한 질문에 답하는 AI 모델로, 대부분 귀하의 데이터로 만든 차트를 함께 보여 주며, 요청하면 운동을 구성하고 운동 종목 교체를 제안합니다(만 16세 이상)
- 설명, 이미지, 동영상이 포함된 운동 카탈로그
- 버그 신고와 아이디어 제안을 위한 지원 채팅

초기 설정은 플랜 생성이나 가져오기를 포함해 무료로 진행할 수 있습니다. 그 이후 Loqqa를 이용하려면 구독(Loqqa Pro, 제6조)이 필요합니다. 활성 구독이 없어도 계정과 데이터는 유지되며 설정, 지원, 계정 삭제는 계속 이용할 수 있지만, 그 밖의 기능은 잠깁니다.

가져오기의 인식 결과에는 오류가 있을 수 있습니다. 따라서 인식된 플랜과 운동 종목의 연결 결과를 적용하기 전에 확인해 주십시오. 앱은 인식이 불확실한 운동 종목을 확인할 수 있도록 보여 줍니다. 앱이 만들어 준 플랜도 제안이므로 검토하고 필요하면 조정해 주십시오. 코치의 답변에도 오류가 있을 수 있습니다. 예를 들어 모델이 질문을 잘못 이해할 수 있습니다. 코치가 오남용되지 않도록 코치에게는 24시간에 최대 20개, 30일에 최대 150개의 질문을 할 수 있습니다. 플랜 생성, 가져오기, 바디 체크, 코치에는 인터넷 연결이 필요합니다.

Loqqa의 많은 기능은 인터넷 연결 없이도 작동합니다. 데이터는 온라인 상태가 되는 즉시 동기화됩니다. 로그아웃할 때 아직 동기화되지 않은 변경 사항은 사라지며, 앱은 그 전에 이를 경고합니다.

Loqqa는 운동을 위한 도구입니다. 당사는 특정한 운동 성과를 보장하지 않습니다.

## 5. 건강 관련 안내

> Loqqa는 의학적 조언, 진단 또는 치료를 대신하지 않습니다.

- Loqqa는 일반적인 운동 권장 사항을 제공합니다. 앱은 의학, 물리치료 또는 영양 관련 조언을 제공하지 않습니다. Loqqa는 의료기기가 아니며 질병을 발견, 모니터링 또는 치료하기 위한 것이 아닙니다.
- 운동 프로그램을 시작하기 전에 의학적 조언을 받으십시오. 특히 기저 질환(예: 심혈관계 질환), 통증이나 부상이 있는 경우, 수술 후, 임신 또는 수유 중인 경우, 그리고 오랫동안 운동하지 않은 경우에는 반드시 조언을 받으십시오.
- 바디 체크 값(예: 추정 체지방률)은 AI 모델이 산출한 대략적인 추정치입니다. 의학적 측정이나 진단이 아닙니다.
- 코치의 답변은 AI 모델이 만든, 운동에 관한 일반적인 정보와 권장 사항입니다. 답변에는 오류가 있을 수 있으며, 의사나 물리치료사의 조언을 대신하지 않습니다. 코치는 통증이나 부상을 진단하지 않습니다. 증상이 계속되면 의사의 진료를 받으십시오.
- 플랜과 제안은 참고용입니다. 올바른 자세로 안전하게 수행할 수 있는 중량과 반복 수를 선택하십시오. 무거운 중량을 다룰 때는 안전바를 사용하거나 보조자의 도움을 받으십시오.
- 통증, 어지러움, 호흡 곤란 또는 가슴 압박감이 느껴지면 즉시 운동을 중단하고, 필요하면 의료진의 도움을 받으십시오.

## 6. Loqqa Pro, 체험 기간 및 구독

- **구매:** Loqqa Pro는 앱에서 Apple의 App Store 또는 Google Play를 통해 구매합니다. 구매 계약은 각각 Apple 또는 Google과 체결됩니다. 결제, 청구, 갱신, 해지 및 환불에는 해당 스토어의 약관이 적용됩니다.
- **가격 및 조건:** Loqqa Pro는 월간 구독과 연간 구독으로 제공됩니다. 현재 가격은 구매 전에 앱과 스토어에서 귀하의 통화로 확인할 수 있습니다.
- **체험 기간:** Loqqa Pro는 7일 무료 체험 기간으로 시작될 수 있습니다. 체험 기간을 이용할 수 있는지는 스토어가 결정하며, 보통 스토어 계정당 한 번입니다. 체험 기간이 끝나기 전에 제때 해지하지 않으면 자동으로 유료 구독으로 전환됩니다. 앱은 구매 전에 유료 구독이 시작되는 날짜를 보여 줍니다. 당사는 체험 기간 종료 전에 별도의 알림을 보내지 않습니다.
- **갱신:** 구독은 제때 해지하지 않으면 선택한 기간만큼 자동으로 갱신됩니다. App Store에서는 기간 종료 최소 24시간 전까지, Google Play에서는 갱신일 전까지 해지해야 합니다.
- **해지:** 해지는 스토어 계정의 구독 설정에서 합니다. 앱의 “구독 관리”에서 해당 링크를 찾을 수 있습니다. 해지 후에도 Loqqa Pro는 결제한 기간이 끝날 때까지 유지됩니다.
- **중요:** 앱이나 계정을 삭제해도 구독은 해지되지 않습니다.
- **구매 복원:** Loqqa Pro는 구매에 사용한 Loqqa 계정에 적용되며, 그 계정으로 로그인한 모든 기기에서 이용할 수 있습니다. 앱의 Loqqa Pro 화면에서 “구매 복원”을 누르면 스토어 계정의 구매를 다시 활성화할 수 있습니다. 다른 Loqqa 계정으로 복원하면 Loqqa Pro가 그 계정으로 옮겨집니다.
- **환불:** 환불에는 해당 스토어의 약관이 적용됩니다. Apple 또는 Google에 문의해 주십시오.
- **가격 변경:** 활성 구독의 가격은 해당 스토어의 절차에 따라서만 변경될 수 있습니다. 스토어는 사전에 이를 알리고, 필요한 경우 귀하의 동의를 받습니다. 새 가격에 동의하지 않으면 기간 종료 시점에 맞춰 구독을 해지할 수 있습니다.

## 7. 청약철회권

소비자인 귀하는 디지털 콘텐츠 및 디지털 서비스 계약에 대해 원칙적으로 법적 청약철회권을 가집니다. Loqqa Pro는 Apple 또는 Google로부터 구매하므로 이 권리에 대한 안내는 각 스토어가 제공하며, 철회권의 행사와 처리는 각 스토어의 절차를 따릅니다.

## 8. 귀하의 콘텐츠

귀하가 Loqqa에 입력한 콘텐츠(예: 플랜, 운동 데이터, 사진, “자기소개” 문구, 지원 메시지, 코치에게 한 질문)는 귀하의 소유로 남습니다. 귀하는 당사가 귀하에게 앱을 제공하는 데 필요한 비독점적이고 양도 불가능한 권리만 당사에 부여합니다. 즉, 귀하의 콘텐츠를 저장, 동기화, 처리하여 귀하에게 보여 주고 지원 요청을 처리할 권리입니다. 이 권리는 귀하가 해당 콘텐츠나 계정을 삭제하면 소멸합니다.

- 필요한 권리를 가진 콘텐츠만 업로드하십시오. 코치, 책 또는 다른 앱의 운동 플랜은 본인의 운동에 사용하도록 허용된 범위에서만 가져올 수 있습니다.
- 사진과 스크린샷에는 동의하지 않은 다른 사람이 나와서는 안 됩니다.
- 위법하거나 모욕적이거나 불쾌감을 주는 콘텐츠는 지원 채팅과 코치에게 하는 질문을 포함해 허용되지 않습니다.

당사는 귀하가 보낸 아이디어와 제안을 Loqqa 개선을 위해 무상으로 사용할 수 있습니다. 이를 반영하거나 보상할 의무는 없습니다.

## 9. 지원

앱의 지원 채팅에서 버그를 신고하고 기능을 제안할 수 있습니다. 당사는 그곳에서 보통 며칠 이내에 답변합니다. 앱에 표시되는 응답 시간은 기준일 뿐 구속력 있는 약속이 아닙니다. 이메일 support@useloqqa.com으로도 연락할 수 있습니다.

## 10. 허용되는 이용

Loqqa는 본인의 운동을 위해 개인적으로만 이용할 수 있습니다. 코치가 고객을 위해 이용하는 등의 상업적 이용은 당사의 사전 동의가 있는 경우에만 허용됩니다. 특히 다음 행위는 허용되지 않습니다.

- 기술적 보호 조치나 구독 확인을 우회하는 행위
- 자동화된 방식으로 앱이나 당사 서버에 접근하거나, 콘텐츠를 대량으로 추출하거나, 당사 서버에 과도한 부하를 주는 행위
- 다른 이용자의 데이터에 접근하려고 시도하는 행위
- 법률이 명시적으로 허용하는 경우(독일 저작권법(UrhG) 제69d조, 제69e조)를 제외하고 앱을 디컴파일하거나 변경하는 행위

앱, 텍스트·이미지·동영상이 포함된 운동 카탈로그, 상표 및 디자인은 법적으로 보호됩니다. 귀하는 본 약관의 범위 내에서 이를 이용할 수 있는 비독점적이고 양도 불가능한 권리를 받습니다.

## 11. 앱의 가용성, 업데이트 및 변경

- 당사는 Loqqa가 안정적으로 작동하도록 노력합니다. 다만 유지보수 중이거나 서비스 제공업체에 장애가 발생한 경우 등에는 서버를 중단 없이 이용할 수 있다고 약속할 수 없습니다. 이 경우에도 많은 기능은 오프라인으로 계속 이용할 수 있습니다.
- 당사는 Loqqa가 계약에 따라 작동하는 데 필요한 업데이트, 특히 보안 업데이트를 제공합니다(독일 민법(BGB) 제327f조). 업데이트는 신속하게 설치해 주십시오.
- 당사는 정당한 사유(예: 새로운 기술적 요구 사항, 보안, 앱의 발전 또는 법적 상황의 변화)가 있고, 귀하에게 추가 비용이 발생하지 않으며, 당사가 이를 명확하고 이해하기 쉽게 알리는 경우 Loqqa를 변경하고 발전시킬 수 있습니다. 변경으로 인해 귀하의 Loqqa 접근이나 이용 가능성이 경미한 수준을 넘어 영향을 받는 경우에는 사전에 알립니다. 이 경우 귀하는 BGB 제327r조에 따라 계약을 무상으로 해지할 수 있습니다.
- 당사는 운동 카탈로그를 지속적으로 업데이트합니다.

## 12. 책임

- 당사는 고의 및 중과실, 생명·신체·건강의 침해, 독일 제조물책임법(ProdHaftG)에 따른 책임, 그리고 당사가 제공한 보증의 범위에 대해서는 무제한으로 책임을 집니다.
- 본질적인 계약상 의무를 경과실로 위반한 경우, 당사는 계약상 전형적으로 예견할 수 있는 손해에 대해서만 책임을 집니다. 본질적인 계약상 의무란 그 이행이 있어야 비로소 계약의 적절한 수행이 가능하고, 귀하가 그 준수를 통상적으로 신뢰할 수 있는 의무를 말합니다.
- 그 밖의 경우 당사는 경과실에 대해 책임을 지지 않습니다.
- 이 규정은 당사의 대리인 및 이행보조자의 개인적 책임에도 적용됩니다.
- 디지털 제품의 하자에 관한 귀하의 법적 권리(BGB 제327조 이하)는 영향을 받지 않습니다.

## 13. 계약 기간, 해지 및 계정 삭제

- Loqqa 이용 계약은 기간의 정함이 없습니다.
- 귀하는 앱의 설정에서 “계정 삭제”를 통해 계정을 삭제함으로써 언제든지 계약을 종료할 수 있습니다. support@useloqqa.com으로 이메일을 보내 삭제를 요청할 수도 있습니다.
- 귀하에게 활성 구독이 없는 경우 당사는 4주의 기간을 두고 계약을 해지할 수 있습니다. 유료 구독은 결제한 기간이 끝날 때까지 영향을 받지 않습니다.
- 중대한 사유가 있는 경우 양 당사자가 즉시 계약을 해지할 권리는 영향을 받지 않습니다. 당사에게 중대한 사유란 특히 본 약관을 심각하게 또는 반복적으로 위반한 경우를 말합니다.
- 계정이 삭제되면 당사는 개인정보 처리방침에 설명된 대로 귀하의 데이터를 삭제합니다. 삭제된 데이터는 복구할 수 없습니다.
- 구독은 스토어를 통해 해지합니다(제6조).

## 14. 약관의 변경

당사는 새로운 기능을 도입하거나 법적 상황이 변경되는 경우 등에 본 약관을 변경할 수 있습니다. 새 버전은 변경 사항을 표시하여 앱에서 보여 드립니다. 귀하의 권리나 의무에 중대한 영향을 미치는 변경은 귀하가 앱에서 동의한 때부터 귀하에게 효력이 발생합니다. 그때까지 앱에서는 설정, 지원, 계정 삭제만 이용할 수 있습니다. 동의하지 않는 경우 계정을 삭제하여 언제든지 계약을 종료할 수 있으며, 구독은 스토어에서 해지합니다.

## 15. 최종 조항

- **준거법:** 국제물품매매계약에 관한 국제연합 협약(CISG)을 제외하고 독일 연방공화국 법이 적용됩니다. 소비자인 귀하는 일상적으로 거주하는 국가의 강행 규정에 따른 보호를 계속 받습니다.
- **관할 법원:** 상인, 공법상 법인 및 공법상 특별재산에 대해서는 뮌헨을 관할 법원으로 합니다. 소비자에게는 법률상 관할 법원이 적용됩니다.
- **소비자 분쟁 해결:** 당사는 소비자 분쟁 조정 기관의 분쟁 해결 절차에 참여할 의사나 의무가 없습니다.
- **언어:** 본 약관은 독일어, 영어, 포르투갈어, 한국어, 스페인어 및 프랑스어로 제공됩니다. 독일어 버전이 우선하며, 나머지는 번역본입니다.
- **무효 조항:** 본 약관의 일부 조항이 무효인 경우에도 나머지 계약은 유효합니다. 무효인 조항은 법률 규정으로 대체됩니다.
$md$, '2026-11-07 10:00:00+00', false),
  ('privacy', 'ko', '1.5', $md$# 개인정보 처리방침

버전: 1.5

최종 업데이트: 2026년 11월 6일

이 문서는 번역본입니다. 법적 구속력은 독일어 버전에 있습니다.

이 문서에서는 귀하가 Loqqa 앱을 이용할 때 당사가 어떤 개인정보를 처리하는지, 그 이유는 무엇인지, 그리고 귀하에게 어떤 권리가 있는지 설명합니다. 본 방침은 EU 일반개인정보보호규정(GDPR), 독일 연방개인정보보호법(BDSG) 및 독일 전기통신·디지털서비스 개인정보보호법(TDDDG)에 근거합니다.

## 요약

- Loqqa는 플랜과 운동 기록을 먼저 귀하의 기기에 저장하고, 온라인 상태가 되는 즉시 귀하의 계정과 동기화합니다. 당사의 데이터베이스는 프랑크푸르트암마인에 있습니다.
- 다른 이용자는 귀하의 프로필, 운동 기록 또는 사진을 볼 수 없습니다.
- 당사는 귀하의 체중, 키, 바디 체크 사진을 건강 데이터로 취급합니다. 이 데이터는 귀하의 명시적 동의가 있는 경우에만 처리합니다.
- 플랜 생성, 운동 기록 가져오기, 음성 입력, 바디 체크, 코치, 지원 메시지 번역에는 OpenAI의 AI 모델을 사용합니다. 이를 위해 필요한 데이터를 OpenAI에 전송하며, OpenAI는 이를 미국에서 처리합니다.
- 앱을 개선하기 위해 PostHog로 앱 이용 방식을 측정합니다. 건강 데이터와 사진은 PostHog로 전송되지 않습니다. 앱에는 광고가 없습니다.
- 앱에서 언제든지 계정을 삭제할 수 있습니다. 이때 사진과 계정의 모든 데이터도 삭제됩니다.

## 1. 개인정보 처리 책임자

귀하의 데이터 처리에 대한 책임자는 다음과 같습니다.

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 München, 독일
- 이메일: support@useloqqa.com

이하에서는 책임자를 “당사”라고 합니다.

## 2. 데이터 보호 책임자(DPO)

당사는 법적 의무가 없으므로 데이터 보호 책임자(DPO)를 지정하지 않았습니다. 개인정보 보호에 관한 문의는 support@useloqqa.com으로 직접 연락해 주십시오.

## 3. Loqqa의 작동 방식

Loqqa는 운동 앱입니다. 운동 플랜을 만들거나 다른 앱이나 스프레드시트에서 플랜과 지금까지의 운동 기록을 가져오고, 운동과 체중을 기록하고, 코치에게 운동에 관해 질문하며, 만 18세 이상이면 사진으로 바디 체크를 할 수 있습니다.

앱은 “오프라인 우선” 방식으로 작동합니다. 귀하의 데이터는 기기의 데이터베이스에 보관되므로 인터넷이 없어도 운동할 수 있습니다. 로그인한 상태에서 온라인이 되면 앱이 이 데이터를 당사 서버의 귀하 계정과 동기화합니다. 이렇게 하면 플랜과 운동 기록이 백업되고 귀하의 모든 기기에서 이용할 수 있습니다. 서버에는 서비스 제공업체를 이용합니다(7항).

당사 데이터베이스의 모든 데이터는 귀하의 계정에 할당됩니다. 기술적 접근 규칙에 따라 본인만 자신의 데이터를 읽고 변경할 수 있습니다. Loqqa에는 다른 이용자가 귀하의 프로필, 운동 기록 또는 사진을 볼 수 있는 기능이 없습니다.

## 4. 처리하는 데이터와 처리 목적

### 4.1 계정 없이 진행하는 초기 설정

초기 설정은 계정 없이 진행합니다. 초기 설정 중 앱은 당사 서버에서 운동 카탈로그(운동의 이름, 설명, 이미지, 동영상)와 이 법적 문서를 불러옵니다. 앱은 시작할 때와 그 이후 1시간마다 운동 카탈로그의 변경 사항을 확인합니다. 이 과정에서는 기술적으로 필요한 연결 데이터만 생성됩니다(4.13항).

앱은 초기 설정 중 귀하의 답변(예: 이름, 성별, 생년월일, 체중, 키, 목표, 생성하거나 가져온 플랜)을 처음에는 귀하의 기기에만 저장합니다. 이 정보는 귀하가 계정을 만들 때에만 당사에 전송됩니다(4.3항 및 4.4항). 예외: 플랜 생성을 요청하면 플랜을 만들 수 있도록 앱이 목표, 집중 부위, 장비, 주당 운동 횟수, 운동 시간, 운동 경험에 대한 답변을 미리 전송합니다. 귀하가 가져오는 파일의 경우에는 인식할 수 있도록 파일에서 발췌한 내용, 운동 종목의 이름, 귀하의 플랜을 전송합니다(모두 4.7항). 가져온 운동 이력은 귀하가 계정을 만들 때에만 전송합니다.

법적 근거: GDPR 제6조 제1항 (b)(귀하가 이용하려는 앱의 제공).

### 4.2 계정

초기 설정의 마지막 단계에서 Google 계정으로, 또는 Apple 기기에서는 Apple 계정으로 로그인하여 계정을 만듭니다. 별도의 Loqqa 비밀번호는 없습니다. 이때 당사는 다음 정보를 처리합니다.

- 로그인 시 Google 또는 Apple이 당사에 전송하는 정보(이메일 주소 포함, 아래 참조)
- 새 기기에서 로그인한 후 앱이 다시 채워 넣을 수 있도록 귀하의 이름
- 가입 시각과 마지막 로그인 시각, 로그인 토큰 등 기술적 계정 데이터

로그인 상태를 유지하기 위해 앱은 로그인 세션을 기기에 저장합니다.

**Google로 로그인:** Google로 로그인하면 귀하의 기기에서 Google 로그인 화면이 열립니다. 그런 다음 Google이 당사에 로그인을 확인해 주고 귀하의 이메일 주소, 이름, Google 프로필 사진의 주소, Google 계정 식별자를 전송합니다. 당사는 이 정보를 귀하의 계정과 함께 저장합니다. 이 과정에서 Google은 귀하가 Loqqa에 로그인한다는 사실을 알게 됩니다. Google 계정을 통한 로그인에 대해서는 Google Ireland Limited(Gordon House, Barrow Street, Dublin 4, Ireland)가 독자적으로 책임을 지며, [Google 개인정보처리방침](https://policies.google.com/privacy?hl=ko)이 적용됩니다.

**Apple로 로그인**(Apple 기기에서만): Apple로 로그인하면 귀하의 기기에서 Apple 로그인 화면이 열립니다. 그런 다음 Apple이 당사에 로그인을 확인해 주고 Apple 계정 식별자와 이메일 주소를 전송합니다. 이메일 주소 대신 Apple이 생성한, 이메일을 귀하에게 전달해 주는 주소를 선택할 수도 있습니다(“나의 이메일 가리기”). 첫 로그인 시 귀하가 이름을 공유하면 Apple은 이름도 전송합니다. 당사는 이 정보를 귀하의 계정과 함께 저장합니다. Apple 계정을 통한 로그인에 대해서는 Apple Distribution International Limited(Hollyhill Industrial Estate, Hollyhill, Cork, Ireland)가 독자적으로 책임을 지며, [Apple 개인정보 처리방침](https://www.apple.com/kr/legal/privacy/kr/)이 적용됩니다.

계정은 초기 설정의 마지막 단계에서만 만들어집니다. 시작 화면의 “로그인”으로 로그인했을 때 새 계정이 만들어지게 되면, 앱은 그 계정을 즉시 다시 삭제하고 아직 계정이 없다고 알려 줍니다.

법적 근거: GDPR 제6조 제1항 (b).

### 4.3 프로필 및 운동 계획

계정을 만들면 당사는 초기 설정에서 입력한 정보를 귀하의 프로필로 저장합니다. 일부 정보는 나중에 설정과 프로필에서 변경할 수 있습니다.

- 이름, 생물학적 성별(“밝히지 않음”도 선택 가능) 및 생년월일
- 체중, 키 및 선호 단위(미터법 또는 야드파운드법)
- 운동 경험, 운동 목표, 집중 근육 부위, 사용 가능한 장비, 주당 운동 횟수 및 희망 운동 시간
- 지원팀이 귀하의 언어로 답변할 수 있도록 앱 언어
- 선택 사항: 프로필 사진(앱은 512 × 512픽셀 정사각형 이미지로 저장) 및 최대 150자의 짧은 “자기소개” 문구

목적: 최소 연령(16항)과 코치 및 바디 체크의 연령 제한을 확인하려면 생년월일이 필요합니다. 운동 플랜 생성을 요청하면 OpenAI의 AI 모델이 운동 목표, 집중 부위, 장비, 주당 운동 횟수, 운동 시간, 운동 경험을 바탕으로 플랜을 만듭니다(4.7항). 코치도 답변에 목표, 운동 경험, 장비, 집중 부위, 단위를 사용합니다(4.8항). 앱은 성별, 나이, 체중, 키를 바디 체크에 사용합니다(4.6항). 프로필 사진과 “자기소개”는 귀하의 프로필에서 본인에게만 표시됩니다.

법적 근거: GDPR 제6조 제1항 (b). 체중과 키는 귀하의 동의(4.4항).

### 4.4 건강 데이터와 귀하의 동의

일부 정보로는 귀하의 건강 상태를 추론할 수 있습니다. 따라서 당사는 이를 GDPR 제9조에 따른 건강 데이터로 취급합니다.

- **신체 측정값:** 체중, 체중 기록 및 키(4.3항 및 4.5항)
- **바디 체크:** 바디 체크 사진과 이를 바탕으로 산출된 값, 예: 추정 체지방률(4.6항)

당사는 이 데이터를 귀하의 명시적 동의가 있는 경우에만 처리합니다(GDPR 제9조 제2항 (a) 및 제6조 제1항 (a)).

- **신체 측정값:** 귀하는 계정을 만들 때 버튼 바로 위의 안내를 통해, 맞춤 운동을 위해 당사가 귀하의 신체 정보를 처리하는 데 명시적으로 동의합니다. 그 전까지 체중과 키는 귀하의 기기에만 남아 있습니다.
- **바디 체크:** 앱은 사진을 분석용으로 보내기 전에, 이를 위해 사진과 신체 정보가 미국의 OpenAI로 전송된다는 사실을 알려 줍니다. “완료”를 누르면 이에 동의하게 됩니다.
- **코치:** 코치는 답변에 체중 기록과 바디 체크 종합 점수도 사용하며, 이를 위해 당사 서버는 귀하의 운동 데이터와 신체 데이터를 미국의 OpenAI로 전송합니다(4.8항). 계정을 만들고 본 개인정보 처리방침을 수락하면 이에 동의하게 됩니다. 당사는 동의 시각을 저장합니다. 당사는 귀하가 코치에게 질문할 때만 이 데이터를 전송합니다.

바디 체크와 코치는 선택 사항입니다. 동의는 언제든지 장래에 대해 철회할 수 있습니다(12항).

### 4.5 운동 데이터 및 체중

Loqqa를 이용하면 당사는 다음을 저장합니다.

- **플랜:** 이름, 주당 운동 횟수, 디로드 주가 포함된 블록, 순서대로 배열된 루틴(플랜에 속하지 않은 루틴 포함), 운동 종목, 목표값(반복 수 또는 초)이 있는 세트, RIR(남은 반복 수) 및 휴식 시간
- **완료한 운동**(귀하가 가져온 운동 포함): 시작 및 종료 시각, 어느 플랜과 어느 플랜 주차에 해당하는지, 운동 종목, 세트별 중량과 반복 수 또는 초, 각 세트를 완료한 시각 및 개인 기록
- **나만의 운동:** 귀하가 직접 만들었거나 가져오기 중에 만들어진 운동
- **체중:** 귀하가 기록한 체중 기록(하루에 하나의 값)

목적: 운동과 체중을 기록하고 운동 이력, 개인 기록, 선택한 기간 동안의 근육별 세트 수 및 활동을 확인할 수 있도록 하기 위함입니다. 앱은 세트 제안과 근육별 세트 수를 귀하의 기기에서 계산합니다. 코치에게 질문하면 코치가 이 데이터를 바탕으로 답변합니다(4.8항).

법적 근거: GDPR 제6조 제1항 (b). 체중 기록은 귀하의 동의(4.4항).

### 4.6 바디 체크

바디 체크는 선택 사항이며 만 18세 이상만 이용할 수 있습니다. 바디 체크를 하려면 카메라로 정면, 측면, 후면 사진 세 장을 촬영합니다. 앱은 이때 속옷이나 몸에 붙는 운동복을 착용하도록 권장합니다. 사진에 얼굴이 보일 수 있습니다.

앱은 사진의 너비를 최대 1080픽셀로 줄여 귀하의 기기에 저장합니다. 분석을 시작하면 앱은 사진을 귀하 계정의 비공개 저장 공간에 업로드합니다. 사진은 다른 기기에서도 볼 수 있도록 그곳에 보관됩니다. 분석에는 인터넷 연결이 필요합니다.

**OpenAI의 AI 모델을 통한 분석:** OpenAI의 AI 모델이 바디 체크의 값을 산출합니다. 이를 위해 당사 서버는 다음 정보를 OpenAI에 전송합니다.

- 이번 바디 체크의 사진 세 장과, 이전 바디 체크가 있는 경우 모델이 변화를 직접 비교할 수 있도록 이전 사진
- 프로필의 성별, 나이(생년월일로 계산), 키, 체중 및 운동 경험
- 바디 체크마다 값을 비교할 수 있도록 이전 바디 체크의 값

당사는 귀하의 이름, 이메일 주소 또는 계정 ID를 전송하지 않습니다. OpenAI는 데이터를 미국에서 처리합니다(8항). 당사는 OpenAI가 요청을 나중에 조회할 수 있도록 저장하지 않게 설정했습니다. OpenAI는 API를 통해 받은 데이터를 모델 학습에 사용하지 않으며, 오남용 탐지를 위해 최대 30일간 보관한 후 삭제합니다.

모델은 먼저 사진을 분석할 수 있는지 확인합니다. 예를 들어 사진이 충분히 밝은지, 몸이 적어도 머리부터 무릎까지 보이는지 확인합니다. 분석할 수 없는 사진이 있으면 앱이 다시 촬영하도록 요청합니다. 그렇지 않으면 모델은 여섯 개 근육 부위(어깨, 가슴, 팔, 등, 복근, 다리)의 값, 추정 체지방률, 비율과 근육 선명도에 대한 값을 제공합니다. 당사 서버는 이를 바탕으로 종합 점수를 계산합니다. 당사는 이 값들을 해당 바디 체크와 함께 저장합니다.

당사 서버는 바디 체크를 분석하기 전에 RevenueCat을 통해 귀하의 계정에 Loqqa Pro가 있는지 확인합니다(4.12항). 당사는 모든 분석을 시각 및 결과와 함께 기록합니다. 이를 통해 하루 분석 횟수를 제한하고, 저장된 값이 실제 분석에서 나온 것임을 보장합니다. 이 기록은 귀하의 계정과 함께 삭제됩니다.

이 값들은 대략적인 추정치이며 의학적 측정이나 진단이 아닙니다.

**접근 권한자:** 기술적으로는 Loqqa 운영자인 Jan Timo Hünnebeck만 이 저장 공간에 접근할 수 있습니다. 그는 귀하가 지원 요청에서 요청한 경우, 귀하가 신고한 버그를 해결하는 데 필요한 경우, 또는 당사에 법적 의무가 있는 경우에만 바디 체크 사진을 확인합니다.

앱에서 개별 바디 체크를 삭제할 수 있습니다. 그러면 앱이 기기와 당사 저장 공간에서 해당 사진을 삭제합니다. 그 시점에 기기가 오프라인이면 계정을 삭제할 때까지 사진이 당사 저장 공간에 남아 있을 수 있습니다. 이 경우 당사에 연락해 주시면 삭제해 드립니다.

법적 근거: 미국의 OpenAI로의 전송을 포함하여 귀하의 명시적 동의(4.4항)(8항의 보호 조치에 더해 GDPR 제49조 제1항 (a)).

### 4.7 가져오기, 플랜 생성 및 음성으로 운동 입력

다른 앱이나 스프레드시트에서 귀하의 운동을 가져올 수 있습니다. CSV, TSV, Excel 또는 OpenDocument 형식의 파일(예: Hevy 또는 Strong에서 내보낸 파일)로 가져올 수 있습니다. 파일에는 귀하의 운동 이력, 운동 플랜 또는 둘 다 포함될 수 있습니다. 파일에 다른 사람의 데이터가 포함되지 않도록 주의해 주십시오.

**기기에서 읽기:** 앱은 귀하의 기기에서 파일을 열고 그 행을 읽습니다. 이를 위해 귀하의 운동 이력 전체를 당사 서버로 전송하지는 않습니다.

**OpenAI의 AI 모델을 통한 인식:** 파일이 어떻게 구성되어 있고 어떤 운동 종목을 가리키는지 앱이 파악할 수 있도록, 앱은 파일 이름과 시트 이름, 시트별 머리글 행, 처음·중간·끝 부분에서 고른 최대 150개의 행, 각 열에 관한 정보(예: 채워진 셀의 수와 자주 나오는 값), 운동 이력에 있는 운동 종목의 이름과 그 세트 수 및 대표적인 중량, 그리고 파일에 플랜이 포함된 경우 플랜의 행을 앱 언어와 함께 당사 서버로 전송합니다. 서버는 이를 당사의 운동 카탈로그와 함께 OpenAI의 AI 모델에 전달합니다. 모델은 어떤 열에 날짜, 운동 종목, 중량, 반복 수 등이 들어 있는지 인식하고, 운동 종목의 이름을 당사 카탈로그와 연결하며, 플랜의 루틴, 운동 종목, 세트, 반복 수, 휴식 시간을 읽어 냅니다. 파일에 플랜이 없으면 앱이 귀하의 최근 6주간 운동으로 플랜을 구성합니다. 이름이 없는 루틴에는 모델이 이름을 제안하며, 이를 위해 모델은 해당 루틴의 운동 종목과 귀하가 그 루틴을 한 횟수만 받습니다. 이 과정에서 다른 데이터는 전송하지 않습니다. 요청에는 귀하의 계정도 이름도 포함되지 않습니다. OpenAI는 데이터를 미국에서 처리합니다(8항). 당사는 OpenAI가 요청을 나중에 조회할 수 있도록 저장하지 않게 설정했습니다. OpenAI는 API를 통해 받은 데이터를 모델 학습에 사용하지 않으며, 오남용 탐지를 위해 최대 30일간 보관합니다.

당사 서버는 귀하의 파일과 전송된 발췌 내용을 저장하지 않으며, 결과만 앱에 돌려줍니다. 마지막에 귀하가 적용하는 내용이 저장됩니다. 즉, 운동 이력의 운동은 완료한 운동으로 저장되고, 귀하가 확인한 플랜도 저장됩니다(4.5항). 귀하 계정에 있는 운동과 같은 시각에 시작하는 운동은 다시 가져오지 않습니다. 앱은 당사 카탈로그에 없는 운동 종목을 귀하 계정의 나만의 운동으로 만듭니다. 초기 설정 중에 운동 이력을 가져오면, 이 이력은 계정을 만들 때까지 귀하의 기기에 남아 있다가 그 후 귀하의 계정으로 전송됩니다.

**OpenAI의 AI 모델을 통한 플랜 생성:** 플랜 생성을 요청하면 앱은 운동 목표, 집중 근육 부위, 장비, 주당 운동 횟수, 운동 시간, 운동 경험에 대한 답변과 앱 언어를 당사 서버로 전송합니다. 서버는 이를 귀하의 장비에 맞는 당사 카탈로그의 운동 종목과 함께 OpenAI의 AI 모델에 전달하며, 모델은 이를 바탕으로 플랜을 구성합니다. 이 과정에서 귀하의 이름, 생년월일, 성별, 체중 또는 키는 전송하지 않으며, 요청에는 귀하의 계정이 포함되지 않습니다. OpenAI에서의 처리는 가져오기와 동일합니다. 당사 서버는 이 과정에서 귀하의 답변을 저장하지 않으며, 플랜만 앱에 돌려줍니다. 플랜은 앱에서 변경할 수 있습니다.

**음성으로 운동 입력:** 플랜을 설정할 때, 루틴을 편집할 때, 자유 운동을 구성할 때 운동을 하나씩 찾는 대신 세트와 반복 횟수와 함께 말로 입력할 수 있습니다. 귀하가 말한 내용은 운영체제의 음성 인식이 텍스트로 변환합니다. iPhone에서는 Apple의 음성 인식이, Android 기기에서는 Google의 음성 인식이 사용됩니다. 기기에 따라 이 변환은 기기 자체에서 또는 Apple이나 Google의 서버에서 이루어지며, 이에는 각 회사의 개인정보 처리방침이 적용됩니다. 당사는 녹음 자체를 받지 않습니다. 앱은 운동을 추가하기 전에 귀하가 수정할 수 있는 텍스트를 앱 언어와 함께 당사 서버로 전송합니다. 서버는 이를 당사의 운동 카탈로그와 함께 OpenAI의 AI 모델에 전달하고, AI 모델은 세트와 반복 횟수를 포함한 운동을 인식합니다. 요청에는 귀하의 계정이나 이름이 포함되지 않습니다. OpenAI의 처리에는 가져오기와 동일한 내용이 적용됩니다. 당사 서버는 텍스트를 저장하지 않습니다.

**요청 제한:** 가져오기, 플랜 생성 및 음성으로 운동 입력이 오남용되지 않도록 네트워크별 및 전체 하루 이용 횟수를 제한합니다. 이를 위해 당사 서버는 요청마다 시각, 어떤 기능에 대한 요청인지, 그리고 비밀 키로 생성한 귀하 IP 주소의 해시값을 저장합니다. IP 주소 자체는 저장하지 않습니다. 새 요청이 있을 때마다 2일이 지난 항목을 삭제합니다.

법적 근거: 귀하가 시작한 가져오기, 플랜 생성 및 음성으로 운동 입력에는 미국의 OpenAI로의 전송을 포함하여 GDPR 제6조 제1항 (b). 요청 제한에는 GDPR 제6조 제1항 (f). 당사의 정당한 이익은 오남용과 불필요한 비용을 방지하는 것입니다.

### 4.8 카이 · AI 코치

Loqqa Pro가 있으면 앱의 AI 코치인 카이에게 귀하의 운동에 관해 질문할 수 있습니다(예: “체중이 어떻게 변했나요?”). 코치는 몇 문장으로 답하며, 대부분 귀하의 데이터로 만든 차트를 함께 보여 줍니다. 다리 운동을 얼마나 자주 해야 하는지, 어딘가 아플 때 어떤 운동을 대신할 수 있는지 같은 일반적인 운동 질문에도 답합니다. 요청하면 운동을 구성하거나, 저장된 운동을 보여 주거나, 플랜의 운동 종목 교체를 제안하기도 합니다. 플랜은 귀하가 앱에서 확인해야 변경됩니다. 진단은 하지 않습니다. 카이는 사람이 아니라 AI입니다. 코치는 선택 사항이며 만 16세 이상만 이용할 수 있습니다. 코치를 이용하려면 인터넷 연결이 필요합니다.

**OpenAI의 AI 모델을 통한 답변:** 앱은 귀하의 질문을 앱 언어 및 기기의 시간대와 함께 당사 서버로 전송합니다. 서버는 질문을 OpenAI의 AI 모델에 전달합니다. 모델에 데이터가 필요하면 당사 서버에 요청합니다. 당사 서버는 저장된 귀하의 데이터로 값을 계산하여 그 결과를 OpenAI에 전송합니다. 모델은 이를 바탕으로 답변을 작성합니다. 당사 서버는 질문마다 다음 정보를 OpenAI에 전송합니다.

- 귀하의 질문, 그리고 이 채팅의 최근 질문(최대 6개)과 그 답변 및 답변을 위해 조회한 데이터
- 오늘 날짜, 단위 및 앱 언어
- 프로필의 운동 목표, 운동 경험, 장비, 집중 근육 부위, 그리고 활성 플랜의 이름과 주당 운동 횟수
- 활성 플랜의 운동과 그 운동 종목, 이번 주 진행 상태(완료, 다음, 미완료), 그리고 그 밖에 저장된 운동의 이름
- 운동 횟수와 첫 운동 및 마지막 운동 날짜, 체중 기록 수와 첫 기록 날짜, 바디 체크 횟수
- 귀하가 한 운동 종목(나만의 운동 포함): 이름, 기록 방식, 해당 종목을 한 운동 횟수, 마지막으로 한 날짜

질문에 따라 당사 서버는 이를 위해 귀하의 데이터로 계산한 다음 정보도 전송합니다.

- 날짜, 이름, 소요 시간, 운동 종목, 세트(중량, 반복 수, 초, RIR)가 포함된 운동 기록
- 운동별 값(예: 추정 1회 최대 중량(1RM), 최고 중량, 반복 수, 버틴 시간, 볼륨, 개인 기록)
- 체중 기록과 평활화한 체중 추이
- 바디 체크 종합 점수(사진과 체지방률 같은 개별 값은 제외)
- 주별 또는 월별 운동 횟수, 세트 수, 볼륨, 운동 시간, 운동 공백 기간, 운동한 요일
- 근육 부위별 및 운동 종목별 세트 수
- 코치가 저장된 운동을 보여 주거나 변경을 제안할 때, 해당 운동의 운동 종목, 세트 및 목표
- 코치가 운동을 구성하거나 교체를 제안할 때, 앱 카탈로그의 운동 종목(귀하가 가장 많이 한 종목부터)

당사는 귀하의 이름, 이메일 주소, 계정 ID, 생년월일과 나이, 성별, 키, 프로필 사진, “자기소개” 문구, 바디 체크 사진, 지원 메시지를 전송하지 않습니다. 질문에 다른 사람의 데이터를 적지 말아 주십시오. OpenAI는 데이터를 미국에서 처리합니다(8항). 당사는 OpenAI가 요청을 나중에 조회할 수 있도록 저장하지 않게 설정했습니다. OpenAI는 API를 통해 받은 데이터를 모델 학습에 사용하지 않으며, 오남용 탐지를 위해 최대 30일간 보관한 후 삭제합니다.

답변은 AI 모델이 작성합니다. 답변에는 오류가 있을 수 있습니다. 답변은 운동을 위한 정보와 권장 사항이며, 의학적 조언이나 진단이 아닙니다.

당사 서버는 질문에 답하기 전에 프로필의 생년월일로 귀하의 나이를 확인하고, 귀하의 동의(4.4항)를 확인하며, RevenueCat을 통해 귀하의 계정에 Loqqa Pro가 있는지 확인합니다(4.12항).

**음성으로 질문하기:** 질문을 말로 할 수도 있습니다. 이 경우 앱은 귀하가 녹음을 끝낼 때까지, 최대 2분 동안 마이크로 녹음하고, 녹음을 앱 언어와 함께 당사 서버로 전송합니다. 서버는 이를 OpenAI의 음성 인식 모델에 전달하고, 이 모델이 녹음을 텍스트로 변환합니다. “벤치프레스” 같은 용어가 올바르게 인식되도록 서버는 주제에 대한 짧은 안내(트레이닝 코치에게 하는 질문과 일반적인 용어)를 함께 보냅니다. 앱은 텍스트를 입력란에 표시하며, 귀하는 이를 수정할 수 있습니다. 텍스트는 귀하가 보낼 때 비로소 질문이 됩니다. 당사는 귀하의 녹음을 저장하지 않습니다. 당사 서버는 녹음을 전달만 하며, 앱은 텍스트가 준비되거나 귀하가 녹음을 취소하는 즉시 기기에서 녹음을 삭제합니다. 다른 사람을 녹음하지 마세요. OpenAI의 처리에는 답변과 동일한 내용이 적용됩니다(미국에서 처리, 모델 학습에 사용되지 않음, 오남용 탐지를 위해 최대 30일 보관). 이 경우에도 당사 서버는 귀하의 연령과 계정의 Loqqa Pro 여부를 확인합니다. 변환이 오남용되지 않도록 24시간에 최대 100회까지 이용할 수 있습니다. 이를 위해 당사 서버는 변환마다 시각과 비밀 키로 생성한 귀하 계정 ID의 해시값을 저장하며, 새 변환이 있을 때마다 2일이 지난 항목을 삭제합니다.

**저장하는 데이터:** 당사는 질문, 답변, 답변 아래에 표시되는 차트를 포함한 귀하의 채팅을 데이터베이스에 저장합니다. 앱은 귀하가 기기에서 채팅을 볼 수 있도록 이를 귀하의 기기와 동기화합니다(5항). 또한 질문마다 앱에 표시되지 않는 기록을 저장합니다. 여기에는 시각, 상태(예: 답변이 생성되었는지 여부), 사용한 모델, 토큰 수(OpenAI가 요금을 매기는 텍스트 단위), 소요 시간, 그리고 모델의 조회 내역과 조회한 데이터가 포함됩니다. 이 조회 내역은 코치가 답변에 대한 후속 질문에 답할 수 있도록 하기 위해 필요합니다.

**질문 수 제한:** 코치가 오남용되지 않고 불필요한 비용이 발생하지 않도록 24시간에 최대 20개, 30일에 최대 150개의 질문을 할 수 있습니다. 이를 위해 당사 서버는 기록의 수를 셉니다.

앱에서 채팅을 삭제할 수 있으며, 여러 채팅을 한 번에 삭제할 수도 있습니다. 그러면 당사는 해당 채팅의 질문, 답변, 차트와 기록에 포함된 조회 데이터를 삭제합니다. 시각, 상태, 모델, 토큰 수, 소요 시간은 질문 수 제한이 계속 적용되고 당사가 코치의 비용을 파악할 수 있도록 남겨 둡니다. 그 밖에는 귀하가 채팅이나 계정을 삭제할 때까지 채팅을 보관합니다. 계정을 삭제하면 모든 채팅과 기록을 삭제합니다(10항).

법적 근거: 미국의 OpenAI로의 전송을 포함하여 귀하의 명시적 동의(4.4항)(8항의 보호 조치에 더해 GDPR 제49조 제1항 (a)). 음성으로 한 질문을 텍스트로 변환하는 데에는 귀하가 직접 시작하므로 미국의 OpenAI로의 전송을 포함하여 GDPR 제6조 제1항 (b). 질문 수 및 변환 횟수 제한과 시각, 상태, 모델, 토큰 수, 소요 시간 정보에는 GDPR 제6조 제1항 (f). 당사의 정당한 이익은 오남용과 불필요한 비용을 방지하는 것입니다.

### 4.9 지원

앱의 “버그 신고” 및 “기능 요청”을 통해 직접 문의하거나 support@useloqqa.com으로 이메일을 보낼 수 있습니다. 앱에서 당사는 다음을 처리합니다.

- 요청 유형(버그 또는 아이디어), 아이디어의 경우 1~5단계의 중요도, 귀하의 메시지 및 제목(첫 메시지의 첫 줄)
- 메시지당 사진 보관함에서 선택한 최대 5장의 스크린샷. 앱은 이를 축소(긴 변 최대 1600픽셀)하여 JPEG로 저장합니다
- 요청 이력(예: 상태 변경, 당사의 답변, 요청을 다시 열었는지 여부)
- 요청을 보낸 기기: 오류를 파악할 수 있도록 플랫폼(iOS 또는 Android), 운영체제 버전, 기기 모델 및 앱 버전
- 당사의 답변을 귀하의 언어로 번역할 수 있도록 앱 언어
- 각 메시지의 감지된 언어와 그 번역(아래 참조)

**OpenAI의 AI 모델을 통한 번역:** 당사가 귀하의 메시지를 이해하고 귀하가 당사의 답변을 귀하의 언어로 읽을 수 있도록, OpenAI의 AI 모델이 지원 메시지를 번역합니다. 이를 위해 당사 서버는 텍스트가 포함된 모든 메시지를 번역할 언어와 함께 OpenAI에 전송합니다. 귀하의 메시지는 언어를 감지하고 당사 지원팀의 언어로 번역하기 위해, 당사의 답변은 귀하의 앱 언어로 번역하기 위해 전송됩니다. 앱 언어를 변경하면 기존 답변을 새 언어로 번역합니다. 당사는 귀하의 이름, 이메일 주소, 계정 ID 또는 스크린샷을 전송하지 않습니다. 번역은 메시지와 함께 저장되며, 앱에서 언제든지 원문을 볼 수 있습니다. OpenAI는 데이터를 미국에서 처리합니다(8항). 당사는 OpenAI가 요청을 나중에 조회할 수 있도록 저장하지 않게 설정했습니다. OpenAI는 API를 통해 받은 데이터를 모델 학습에 사용하지 않으며, 오남용 탐지를 위해 최대 30일간 보관한 후 삭제합니다.

**음성으로 메시지 보내기:** 메시지를 말로 입력할 수도 있습니다. 코치에게 하는 질문(4.8항)과 같은 방식입니다. 앱은 귀하가 녹음을 끝낼 때까지, 최대 2분 동안 녹음합니다. 서버는 녹음을 주제에 관한 짧은 안내와 함께 OpenAI의 음성 인식 모델에 전달합니다. 앱은 텍스트를 입력란에 표시하며 귀하가 이를 수정할 수 있고, 귀하가 전송해야 비로소 귀하의 메시지가 됩니다. 귀하의 녹음은 저장하지 않습니다. 이 경우에도 서버는 귀하의 연령과 계정의 Loqqa Pro 보유 여부를 확인하며, 동일한 횟수 제한이 적용됩니다.

**귀하의 요청을 보는 사람:** 당사는 브라우저의 내부 지원 공간에서 요청을 처리하며, 이 공간에는 Jan Timo Hünnebeck만 별도의 계정으로 접근할 수 있습니다. 지원 공간에는 귀하의 요청과 함께 이메일 주소, Apple과 Google 중 어떤 방식으로 로그인하는지, 계정 ID, 계정 생성일과 마지막 활동 시점, 앱 언어 및 이전 요청도 표시됩니다.

앱은 스크린샷을 먼저 기기에 저장한 후 백그라운드에서 업로드합니다. 이력을 추적할 수 있도록 메시지와 요청은 직접 삭제할 수 없습니다. 이는 계정과 함께 삭제되며, 요청하시면 종료된 요청을 더 일찍 삭제해 드립니다. 이메일은 귀하의 요청을 처리하는 데 필요한 기간 동안 보관합니다.

요청에 필요하지 않다면 메시지와 스크린샷에 건강 데이터나 다른 사람의 데이터를 보내지 말아 주십시오. 메시지는 번역을 위해 OpenAI에도 전송됩니다.

법적 근거: 요청이 앱 이용과 관련된 경우(예: 버그) GDPR 제6조 제1항 (b). 아이디어 및 기타 피드백에는 GDPR 제6조 제1항 (f). 당사의 정당한 이익은 귀하의 요청에 답변하고 Loqqa를 개선하는 것입니다. 이는 번역 및 미국의 OpenAI로의 전송(8항)에도 적용됩니다.

### 4.10 법적 문서와 동의

앱은 이용약관과 본 개인정보 처리방침의 현재 유효한 버전을 귀하의 언어로 불러옵니다. 귀하가 가입 시 또는 이후 변경된 버전에 동의하면, 당사는 귀하가 동의한 버전, 시각(서버가 기록), 앱 버전 및 플랫폼(iOS 또는 Android)을 저장합니다. 이를 통해 어떤 버전이 귀하에게 적용되는지 증명하고, 중대한 변경이 있을 때 다시 동의를 요청할 수 있습니다.

법적 근거: GDPR 제6조 제1항 (c) 및 제7조 제1항(동의의 증명), GDPR 제6조 제1항 (f)(어떤 약관이 적용되는지 증명할 수 있는 당사의 정당한 이익).

### 4.11 Loqqa Pro: 구독 및 구매

Loqqa Pro는 Apple의 App Store 또는 Google Play를 통해 구매합니다. 구매와 결제는 각각 Apple 또는 Google이 처리합니다. Apple과 Google은 이에 대해 스스로 책임을 지며, 자체 개인정보 처리방침에 따라 귀하의 결제 정보를 처리합니다: [Apple](https://www.apple.com/kr/legal/privacy/kr/) 및 [Google](https://policies.google.com/privacy?hl=ko). 당사는 신용카드 번호 등 결제 정보를 받지 않습니다.

Loqqa Pro를 활성화하기 위해 당사는 RevenueCat(4.12항)을 통해 귀하가 구매한 구독, 체험 기간 진행 여부, 구매 시점, 구독 활성 여부를 확인합니다. 앱은 이 상태를 기기에 저장하고, 시작할 때와 로그인할 때마다 다시 조회합니다. 당사는 구매 데이터를 자체 데이터베이스에 저장하지 않습니다.

구독은 스토어 계정의 설정에서 관리하고 해지합니다. 앱의 “구독 관리”에서 해당 설정으로 이동할 수 있습니다.

법적 근거: GDPR 제6조 제1항 (b).

### 4.12 RevenueCat을 통한 구독 관리

당사는 RevenueCat을 통해 구매와 구독을 관리합니다. RevenueCat은 당사를 대신하여 스토어의 구매 영수증을 확인하고, Loqqa Pro가 활성 상태인지 앱에 알려 줍니다. 당사 서버는 바디 체크를 분석하거나 코치에게 한 질문에 답하기 전에 귀하의 계정에 Loqqa Pro가 있는지 RevenueCat에 확인합니다.

RevenueCat이 귀하의 구매를 귀하의 계정에 연결할 수 있도록, 당사는 이름이나 이메일 주소가 포함되지 않은 무작위 식별자인 귀하의 계정 ID를 전송합니다. 계정을 만들기 전에 구매하면 RevenueCat은 먼저 자체 무작위 식별자를 부여한 후 구매를 귀하의 계정에 연결합니다. RevenueCat은 또한 스토어의 구매 및 구독 정보(예: 상품, 가격, 통화, 구매일·갱신일·만료일, 체험 기간 및 거래 식별자)와 플랫폼, 기기 유형, 앱 버전, IP 주소 등 기술 정보를 처리합니다.

RevenueCat은 또한 귀하의 구독에 관한 이벤트(예: 체험 시작 또는 전환, 갱신, 취소 및 해당 매출)를 PostHog에 전송합니다(4.14항). 이를 위해 앱은 귀하의 PostHog 식별자를 RevenueCat에 제공합니다. 계정을 만들기 전에는 무작위 식별자이고, 그 후에는 귀하의 계정 ID입니다.

- 제공업체: RevenueCat, Inc., 1032 E Brandon Blvd #3003, Brandon, FL 33511, USA(당사의 수탁자)
- 저장 위치: 미국(Amazon Web Services). 보호 조치는 8항 참조
- 보관 기간: 당사와 RevenueCat 간의 계약이 존속하는 동안. 귀하가 계정을 삭제하면 법적 의무에 반하지 않는 한 귀하의 계정과 관련된 데이터를 삭제하도록 합니다

법적 근거: GDPR 제6조 제1항 (b).

### 4.13 기술적으로 필요한 연결 데이터

앱이 당사 서버에 연결될 때마다(예: 로그인, 동기화, 업로드, 운동 카탈로그 및 법적 문서 불러오기) 기술적으로 필요한 데이터가 처리됩니다. 여기에는 IP 주소, 날짜와 시각, 호출된 인터페이스, 상태 코드 등 기술 정보, 그리고 전송된 경우 앱과 운영체제에 관한 정보가 포함됩니다. 호스팅 제공업체는 운영과 보안을 위해 이 데이터를 기록합니다. Supabase에서는 로그가 1일 후 삭제되며, PowerSync에서는 운영과 보안에 더 이상 필요하지 않게 되면 삭제됩니다.

법적 근거: GDPR 제6조 제1항 (f). 당사의 정당한 이익은 안정적이고 안전한 운영입니다.

### 4.14 PostHog를 통한 제품 분석 및 오류 보고

Loqqa의 이용 방식을 이해하고 버그를 찾기 위해 당사는 PostHog를 사용합니다. 이를 위해 앱은 다음을 전송합니다.

- **이용 이벤트:** 귀하가 연 화면과 특정 단계(예: 초기 설정 시작, 생성하거나 가져온 플랜, 가져온 운동 이력(규모만, 내용은 제외), Loqqa Pro 화면 조회, 구매, 가입 및 로그인, 운동의 시작·종료·취소, 코치에게 질문했다는 사실과 답변 여부(내용은 제외), 바디 체크 분석(수치는 제외), 체중 기록 저장(체중은 제외), 음성으로 추가한 운동 종목, 스토어 평가 요청). 각각 시각과 함께 운동 종목 수나 세트 수, 소요 시간 또는 오류 코드 같은 수치가 포함됩니다
- **구독 이벤트:** RevenueCat이 전송하는 체험 시작 또는 전환, 갱신, 취소 및 해당 매출(4.12항)
- **앱 이벤트:** 앱 열기와 닫기, 앱 버전, 기기 유형, 운영체제 및 언어
- **오류 보고:** 기술적 세부 정보가 포함된 충돌 및 오류 메시지
- **프로필 정보:** 가입 후 목표, 운동 경험, 주당 운동 횟수, 분할, 장비, 언어, 단위, 연령대(예: “25–34”) 및 Loqqa Pro 보유 여부
- **가명 식별자:** 가입 전에는 앱이 기기에 저장하는 무작위 식별자, 가입 후에는 계정 ID. 가입 전후의 이벤트를 하나로 합치기 위함입니다

귀하의 이름, 이메일 주소, 체중, 키, 생년월일, 바디 체크 사진과 값, 자유 입력 텍스트는 PostHog로 전송되지 않습니다. PostHog는 귀하의 IP 주소를 저장하지 않으며, 당사는 세션 녹화를 사용하지 않습니다. 로그아웃하면 앱이 식별자를 초기화합니다.

- 제공업체: PostHog, Inc., 2261 Market St. #4008, San Francisco, CA 94114, USA(당사의 수탁자)
- 저장 위치: PostHog Cloud EU(프랑크푸르트암마인). PostHog는 EU-미국 데이터 프라이버시 프레임워크 인증을 받았습니다(8항)
- 보관 기간: 이벤트는 1년 후 삭제됩니다

법적 근거: GDPR 제6조 제1항 (f). 당사의 정당한 이익은 Loqqa를 개선하고 버그를 수정하는 것입니다. 귀하는 언제든지 이에 반대할 수 있으며(11항), 예를 들어 support@useloqqa.com으로 이메일을 보내면 됩니다. 그러면 당사는 귀하의 계정과 관련된 분석 데이터를 삭제합니다.

## 5. 기기 내 저장

Loqqa가 오프라인에서도 작동하도록 앱은 귀하의 기기에 다음 데이터를 저장합니다.

- 프로필, 플랜과 운동 기록, 체중 기록, 바디 체크 값, 코치 채팅, 지원 요청 및 동의 내역이 담긴 로컬 데이터베이스
- 이 기기에서 촬영한 바디 체크 사진과 지원 요청 스크린샷의 사본
- 로그인 세션, 초기 설정 답변, 초기 설정 중에 가져온 운동 이력(계정으로 전송될 때까지), 구독 상태, 앱 언어 등의 설정, 아직 업로드해야 할 파일 목록
- 운동 카탈로그
- PostHog용 식별자와 아직 전송되지 않은 이벤트(4.14항)

PostHog용 데이터를 제외하면, 이 저장은 귀하가 이용하려는 서비스를 위해 반드시 필요합니다(TDDDG 제25조 제2항 제2호).

로그아웃하면 앱은 이 기기의 로컬 데이터베이스, 바디 체크 사진, 스크린샷 사본을 삭제하고 초기 설정, 구독 상태, 진행 중인 운동, 아직 전송되지 않은 가져온 데이터를 초기화합니다. 이 과정에서 아직 동기화되지 않은 변경 사항은 사라지며, 앱은 그 전에 이를 경고합니다. 앱 언어 등의 설정은 유지됩니다. 앱을 삭제하면 일반적으로 운영체제가 앱의 모든 데이터를 제거합니다.

기기 설정에 따라 바디 체크 사진을 포함한 앱의 파일이 기기 백업(예: iCloud 또는 Google)에 포함될 수 있습니다. 이러한 백업에 대해서는 각각 Apple 또는 Google이 책임을 집니다.

## 6. 기기 권한

Loqqa는 권한이 필요한 기능을 이용할 때에만 해당 권한을 요청합니다.

- **카메라:** 바디 체크 사진, 프로필 사진
- **사진:** 지원 스크린샷, 프로필 사진에 사용할 이미지 선택. 이를 위해 앱은 운영체제의 이미지 선택기를 사용하며, 귀하가 선택한 이미지만 받습니다.
- **파일:** 운영체제의 파일 선택기를 통한 운동 기록 파일 선택(4.7항)
- **마이크:** 운동(4.7항), 코치에게 하는 질문(4.8항), 고객 지원 메시지(4.9항)를 말로 입력하기 위해. 앱은 귀하가 음성 입력을 사용하는 동안에만 녹음합니다.
- **음성 인식(iPhone):** Apple의 음성 인식이 말로 입력한 운동을 텍스트로 변환할 수 있도록(4.7항)

Loqqa는 위치, 연락처 또는 Apple 건강이나 Health Connect 같은 건강 앱에 대한 접근을 요청하지 않으며, 푸시 알림을 보내지 않습니다. 권한은 기기 설정에서 언제든지 취소할 수 있습니다.

## 7. 수신자 및 수탁자

당사는 명시된 목적에 필요한 경우, 귀하가 동의한 경우 또는 법적 의무가 있는 경우에만 귀하의 데이터를 제공합니다. 당사의 서비스 제공업체는 당사를 대신하여 당사의 지시에 따라 데이터를 처리합니다(GDPR 제28조).

- **Supabase, Inc.**(데이터베이스, 로그인, 파일 저장 공간 및 서버 기능): 프랑크푸르트암마인의 서버(Amazon Web Services)
- **PowerSync**(Journey Mobile, Inc.)(앱과 데이터베이스 간 동기화. 이를 위해 동기화된 데이터의 사본을 보관): EU 내 서버
- **OpenAI Ireland Ltd.**, 117–126 Sheriff Street Upper, Dublin 1, Ireland(AI를 통한 플랜 생성, 가져온 운동 파일 및 말로 입력한 운동 인식, 바디 체크 사진 분석, 코치의 답변, 말로 한 질문의 텍스트 변환 및 지원 메시지 번역, 4.6항~4.9항): OpenAI OpCo, LLC가 미국에서 처리
- **RevenueCat, Inc.**(구독 관리, 4.12항)
- **PostHog, Inc.**(제품 분석 및 오류 보고, 4.14항)

Apple과 Google은 앱 다운로드와 구매(4.11항), 각 계정을 통한 로그인(4.2항), 그리고 각 운영체제의 음성 인식(4.7항)에 대해 독립적인 책임자로서 데이터를 받습니다.

Loqqa는 한 사람이 운영합니다. 운영과 지원에 필요한 범위에서 Jan Timo Hünnebeck만 귀하의 데이터에 접근할 수 있습니다.

당사는 법적 의무가 있는 경우에만 관공서와 법원에 데이터를 제공합니다.

## 8. 제3국으로의 이전

당사는 귀하의 계정, 운동 기록, 사진을 EU 내 데이터 센터(프랑크푸르트암마인의 Supabase, EU 내 PowerSync)에 저장합니다. 일부 서비스 제공업체는 미국에 본사를 두고 있습니다. 따라서 예를 들어 서비스 제공업체의 유지보수나 지원 과정에서 데이터가 미국으로 이전될 수도 있습니다. 플랜 생성, 운동 기록 가져오기, 말로 입력한 운동과 질문, 바디 체크 분석, 코치의 답변 및 지원 메시지 번역의 경우 요청할 때마다 미국의 OpenAI로 데이터를 전송하며(4.6항~4.9항), RevenueCat은 구독 데이터를 미국에서 처리합니다(4.12항).

당사는 다음 보호 조치를 근거로 이러한 이전을 합니다.

- **PostHog:** PostHog가 인증을 받은 EU-미국 데이터 프라이버시 프레임워크에 대한 EU 집행위원회의 적정성 결정(GDPR 제45조)
- **Supabase, PowerSync, OpenAI 및 RevenueCat:** 당사의 데이터 처리 계약에 포함된 EU 집행위원회의 표준계약조항(GDPR 제46조 제2항 (c))
- **바디 체크 및 코치:** 추가로 귀하의 명시적 동의(GDPR 제49조 제1항 (a)). 미국에서는 특정 상황에서 관공서가 데이터에 접근할 수 있으며, 귀하에게는 이에 대해 EU에서와 같은 법적 구제 수단이 없을 수 있습니다.

표준계약조항의 사본은 당사에 요청할 수 있습니다.

## 9. 데이터 보관 기간

- **계정, 프로필, 플랜, 운동 기록, 체중 기록, 바디 체크, 코치 채팅, 지원 요청 및 동의 내역:** 계정이 존재하는 동안. 그 전에 플랜, 체중 기록, 바디 체크, 코치 채팅 등 개별 콘텐츠를 직접 삭제할 수 있습니다. 계정을 삭제하면 당사는 이를 모두 삭제합니다(10항). 더 이상 사용하지 않는 계정을 자동으로 삭제하지는 않습니다. 앱에서 또는 이메일로 언제든지 삭제를 요청할 수 있습니다.
- **계정 없이 진행한 초기 설정 답변:** 계정을 만들거나 앱을 삭제할 때까지 귀하의 기기에만 저장
- **기기 내 데이터:** 로그아웃하거나 앱을 삭제할 때까지(5항)
- **서버 로그:** Supabase에서는 1일, PowerSync에서는 운영과 보안에 필요한 동안(4.13항)
- **가져오기, 플랜 생성 및 음성 입력 제한:** 2일(4.7항 및 4.8항)
- **말로 한 질문의 녹음:** 저장하지 않으며, 앱은 변환 후 녹음을 삭제합니다(4.8항)
- **코치 기록:** 계정이 존재하는 동안. 기록에 포함된 조회 데이터는 해당 채팅과 함께 삭제합니다(4.8항).
- **OpenAI:** 최대 30일(4.6항~4.9항)
- **PostHog의 분석 데이터:** 1년(4.14항)
- **RevenueCat의 구독 데이터:** 4.12항 참조
- **백업:** 현재 당사는 데이터베이스와 저장 공간의 백업을 만들지 않습니다. 이 사항이 변경되면 백업의 보관 기간을 여기에 추가하겠습니다.

## 10. 계정 삭제

앱의 설정에서 “계정 삭제”를 통해 언제든지 계정을 삭제할 수 있습니다. 그러면 다음과 같이 진행됩니다.

1. Apple로 로그인한 경우 Apple 기기에서 Apple에 한 번 더 확인합니다. 이로써 귀하의 Apple 계정과 Loqqa의 연결이 종료됩니다. 당사 서버는 이 확인 정보를 Apple에서 귀하의 로그인 키로 교환한 뒤 즉시 폐기되도록 합니다. 이 과정에서 아무것도 저장되지 않습니다.
2. 앱이 당사 저장 공간에서 프로필 사진, 바디 체크 사진, 지원 스크린샷을 삭제합니다.
3. 그런 다음 계정이 삭제됩니다. 이에 따라 데이터베이스의 모든 관련 데이터(프로필, 플랜, 운동 기록, 체중 기록, 바디 체크, 코치 채팅과 그 기록, 모든 메시지가 포함된 지원 요청, 저장된 동의 내역)가 자동으로 삭제됩니다. PowerSync의 사본도 이 과정에서 제거됩니다.
4. 마지막으로 앱이 이 기기에서 로그아웃하고 기기에 저장된 데이터를 삭제합니다.

**이렇게 해도 활성 구독은 해지되지 않습니다.** 구독은 App Store 또는 Google Play에서 해지해 주십시오.

로그인했던 다른 기기에는 그 기기에서 로그아웃하거나 앱을 삭제할 때까지 로컬 데이터가 남아 있을 수 있습니다. PostHog의 분석 데이터와 RevenueCat의 구독 데이터는 자동으로 함께 삭제되지 않습니다. 즉시 삭제를 원하시면 당사에 연락해 주십시오. 그렇지 않으면 9항의 기간이 적용됩니다.

예를 들어 인터넷 연결이 없어 삭제가 되지 않으면 앱에 안내가 표시되며 다시 시도할 수 있습니다. support@useloqqa.com으로 이메일을 보내 삭제를 요청할 수도 있습니다.

## 11. 귀하의 권리

귀하는 당사에 대해 다음과 같은 권리를 가집니다.

- 당사가 처리하는 귀하의 데이터에 대한 **열람**(GDPR 제15조)
- 잘못된 데이터의 **정정**(GDPR 제16조). 많은 정보는 앱에서 직접 변경할 수 있으며, 그 밖의 정보는 메시지를 보내 주시면 당사가 변경합니다
- 데이터의 **삭제**(GDPR 제17조). 계정은 앱에서 직접 삭제할 수 있습니다(10항)
- 처리의 **제한**(GDPR 제18조)
- **데이터 이동성**(GDPR 제20조): 이메일로 요청하시면 귀하가 당사에 제공한 데이터를 1개월 이내에 JSON 파일로 보내 드립니다.
- 제공한 동의의 **철회**(12항)

**반대권(GDPR 제21조):** 당사가 GDPR 제6조 제1항 (f)(정당한 이익)에 근거하여 데이터를 처리하는 경우(예: PostHog를 통한 제품 분석), 귀하는 특별한 상황과 관련된 사유로 언제든지 이 처리에 반대할 수 있습니다. 그러면 당사는 귀하의 이익보다 우선하는 불가피한 정당한 사유를 입증할 수 있거나 처리가 법적 청구의 확정, 행사 또는 방어를 위한 것이 아닌 한 해당 데이터를 더 이상 처리하지 않습니다.

모든 요청은 support@useloqqa.com으로 이메일을 보내면 됩니다. 당사가 귀하의 계정을 확인할 수 있도록 앱의 설정에 표시된 이메일 주소를 알려 주십시오.

## 12. 동의 철회

동의는 언제든지 장래에 대해 철회할 수 있습니다(GDPR 제7조 제3항). 철회 전에 이루어진 처리는 적법한 상태로 유지됩니다.

- **신체 측정값:** support@useloqqa.com으로 이메일을 보내 주십시오. 그러면 당사가 귀하의 체중, 키 및 체중 기록을 삭제합니다. 이 정보가 없으면 앱은 운동을 제한적으로만 맞춤화할 수 있습니다. 또는 계정을 삭제할 수도 있습니다(10항).
- **바디 체크:** 앱에서 바디 체크를 삭제하고 새로 하지 않거나, 당사에 연락해 주십시오. 그러면 당사가 모든 바디 체크 사진과 값을 삭제합니다.
- **코치:** support@useloqqa.com으로 이메일을 보내 주십시오. 그러면 당사가 동의 철회를 기록합니다. 코치와 관련하여 당사는 귀하가 코치에게 질문할 때만 OpenAI로 데이터를 전송합니다. 따라서 철회 후에는 질문하지 마십시오. 새 질문은 다시 동의한 것으로 간주됩니다. 기존 채팅은 앱에서 삭제하거나, 당사에 연락해 주시면 당사가 삭제합니다.

## 13. 감독 기관에 대한 민원

귀하는 개인정보 보호 감독 기관에 민원을 제기할 수 있습니다(GDPR 제77조). 특히 귀하가 거주하거나 근무하는 EU 회원국, 또는 침해가 의심되는 일이 발생한 EU 회원국의 감독 기관에 제기할 수 있습니다. 당사를 관할하는 기관은 바이에른주 개인정보 감독청(Bayerisches Landesamt für Datenschutzaufsicht), Promenade 18, 91522 Ansbach, Germany, [www.lda.bayern.de](https://www.lda.bayern.de)입니다.

## 14. 데이터를 반드시 제공해야 하나요?

계정을 만들려면 Google 계정 또는 Apple 계정이 필요합니다. 계정이 없으면 초기 설정 이후 Loqqa를 이용할 수 없습니다. 앱은 나이를 확인하고 플랜을 만들고 조정하기 위해 초기 설정에서 입력한 정보가 필요합니다. 특히 성별(“밝히지 않음” 선택 가능), 바디 체크, 코치, 체중 기록, 프로필 사진 및 “자기소개” 문구는 선택 사항입니다.

## 15. 자동화된 결정 없음

앱은 플랜, 제안, 근육별 세트 수와 같은 분석, 바디 체크 값 및 코치의 답변을 자동으로 만듭니다. 귀하가 요청해 생성된 플랜, 바디 체크 값 및 코치의 답변은 OpenAI의 AI 모델에서 나옵니다(4.6항~4.8항). 이는 운동을 위한 정보, 권장 사항 및 추정치입니다. 코치의 답변에는 오류가 있을 수 있으며 의학적 조언이 아닙니다. 당사는 귀하에게 법적 효력을 미치거나 이와 유사하게 중대한 영향을 미치는 결정을 내리지 않습니다(GDPR 제22조).

## 16. 아동 및 청소년

Loqqa는 거주 국가에서 본인의 데이터 처리에 스스로 동의할 수 있는 연령에 도달한 사람을 대상으로 합니다. 이 연령은 독일에서는 만 16세이며, 그 밖의 국가에서는 현지 법률에 따라 만 13세에서 16세입니다. 앱은 초기 설정 중에 생년월일을 묻고 이 연령 이상인 경우에만 다음 단계로 진행할 수 있게 하며, 이때 기기에 설정된 국가가 기준이 됩니다. 코치는 최소 연령이 더 낮은 국가에서도 만 16세 이상만 이용할 수 있습니다. 바디 체크는 만 18세 이상만 이용할 수 있습니다. 당사 서버는 두 가지 모두 프로필의 생년월일로 확인합니다.

최소 연령 미만인 사람의 계정임을 알게 되면 당사는 해당 계정을 삭제합니다.

## 17. 보안

당사는 다음을 포함한 기술적·관리적 조치로 귀하의 데이터를 보호합니다.

- 앱과 서버 간 암호화된 전송(HTTPS/TLS)
- 각 계정이 자신의 데이터만 읽고 변경할 수 있도록 하는 데이터베이스 접근 규칙
- 각 계정이 자신의 폴더에만 접근할 수 있는 프로필 사진, 바디 체크 사진, 스크린샷용 비공개 저장 공간
- 사진 표시를 위한 시간 제한 링크: 바디 체크 사진과 스크린샷은 1시간, 프로필 사진은 24시간
- 비밀번호를 저장하지 않도록 Google 또는 Apple을 통한 로그인

어떤 시스템도 완벽하게 안전하지는 않습니다. 앱은 데이터를 기기에 저장하므로 화면 잠금으로 기기를 보호해 주십시오.

## 18. 개인정보 처리방침의 변경

앱이나 법적 상황이 변경되면 당사는 본 개인정보 처리방침을 수정합니다. 현재 유효한 버전은 앱의 설정과 [useloqqa.com](https://useloqqa.com)에서 확인할 수 있습니다. 중대한 변경 사항은 앱에서 알려 드리며, 필요한 경우 귀하의 동의를 요청합니다.
$md$, '2026-11-07 10:00:00+00', false),
  ('terms', 'es', '1.5', $md$# Términos de Uso

Versión: 1.5

Última actualización: 6 de noviembre de 2026

Esta es una traducción. La versión alemana es jurídicamente vinculante.

Estos Términos de Uso regulan cómo puedes usar la app Loqqa. Léelos con atención. En nuestra Política de Privacidad explicamos cómo tratamos tus datos.

## 1. Proveedor y ámbito de aplicación

El proveedor de la app Loqqa es:

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 München, Alemania
- Correo electrónico: support@useloqqa.com
- Sitio web: [useloqqa.com](https://useloqqa.com)

En adelante, nos referimos a nosotros mismos como “nosotros”. Estos términos se aplican a todas las funciones de la app. En las compras a través de la App Store de Apple o de Google Play, se aplican además los términos de la tienda correspondiente.

## 2. Edad mínima

Debes tener al menos la edad a la que, en tu país, puedes dar tú mismo tu consentimiento para el tratamiento de tus datos: en Alemania, 16 años; en otros países, de 13 a 16 años según la legislación local. Durante la configuración inicial, la app te pide tu fecha de nacimiento y solo te deja continuar a partir de esta edad.

Si aún no eres mayor de edad, necesitas el consentimiento de tus padres o tutores legales para comprar Loqqa Pro. El coach solo está disponible a partir de los 16 años; el control corporal, solo a partir de los 18.

## 3. Tu cuenta

- Para usar Loqqa después de la configuración inicial, necesitas una cuenta. La creas al final de la configuración inicial con tu cuenta de Google o, en dispositivos Apple, con tu cuenta de Apple. El contrato para el uso de Loqqa se celebra al crear tu cuenta.
- Proporciona información veraz durante la configuración inicial.
- Protege el acceso a tu cuenta de Google o a tu cuenta de Apple. Si sospechas que otra persona está usando tu cuenta, avísanos.
- Tu cuenta es personal e intransferible.

## 4. Qué ofrece Loqqa

Loqqa te apoya en el entrenamiento de fuerza. Esto incluye en particular:

- un plan de entrenamiento que un modelo de IA crea a partir de tus datos, por ejemplo objetivo, experiencia, equipamiento y entrenamientos por semana
- importar tu plan de entrenamiento y tus entrenamientos anteriores desde un archivo, por ejemplo la exportación de otra app
- registrar tus entrenamientos con pesos, repeticiones y tiempos, tu historial, récords, tus series por músculo en el periodo que elijas y sugerencias para tus series
- registrar tu peso corporal
- el control corporal con fotos y valores estimados (a partir de los 18 años)
- Kai, el coach de IA: un modelo de IA que responde tus preguntas sobre tu entrenamiento, normalmente con un gráfico a partir de tus datos, y que, si se lo pides, prepara entrenamientos y sugiere reemplazar ejercicios (a partir de los 16 años)
- un catálogo de ejercicios con instrucciones, imágenes y videos
- un chat de soporte para informes de errores e ideas

Puedes completar la configuración inicial, incluida la creación del plan o la importación, de forma gratuita. Después, el uso de Loqqa requiere una suscripción (Loqqa Pro, sección 6). Sin una suscripción activa, tu cuenta y tus datos se conservan y aún puedes usar los ajustes, el soporte y la eliminación de la cuenta; las demás funciones quedan entonces bloqueadas.

El reconocimiento durante la importación puede cometer errores. Por eso, revisa el plan reconocido y la asignación de tus ejercicios antes de aceptarlos; la app te muestra los ejercicios cuyo reconocimiento es incierto para que los revises. Un plan que la app crea para ti también es una sugerencia: revísalo y ajústalo si es necesario. Las respuestas del coach también pueden ser incorrectas, por ejemplo si el modelo malinterpreta una pregunta. Para evitar que se haga un uso indebido del coach, puedes hacerle como máximo 20 preguntas en 24 horas y 150 preguntas en 30 días. Para la creación de planes, la importación, el control corporal y el coach, la app necesita una conexión a internet.

Muchas de las funciones de Loqqa también funcionan sin conexión a internet. Tus datos se sincronizan en cuanto estás en línea. Los cambios que aún no se hayan sincronizado al cerrar sesión se pierden; la app te avisa antes.

Loqqa es una herramienta para tu entrenamiento. No te debemos ningún éxito de entrenamiento concreto.

## 5. Avisos de salud

> Loqqa no sustituye el consejo, el diagnóstico ni el tratamiento médicos.

- Loqqa ofrece recomendaciones generales de entrenamiento. La app no ofrece asesoramiento médico, fisioterapéutico ni nutricional. Loqqa no es un producto sanitario y no está destinada a detectar, vigilar ni tratar enfermedades.
- Consulta a un médico antes de empezar un programa de entrenamiento, especialmente si tienes enfermedades previas (por ejemplo, del sistema cardiovascular), molestias o lesiones, después de una operación, durante el embarazo o la lactancia y si llevas mucho tiempo sin entrenar.
- Los valores del control corporal, por ejemplo el porcentaje estimado de grasa corporal, son estimaciones aproximadas de un modelo de IA. No son una medición médica ni un diagnóstico.
- Las respuestas del coach son información y recomendaciones generales para tu entrenamiento, creadas por un modelo de IA. Pueden ser incorrectas y no sustituyen el consejo de un médico o fisioterapeuta. El coach no diagnostica dolores ni lesiones; si tienes molestias que persisten, haz que un médico las revise.
- Los planes y las sugerencias son una orientación. Elige pesos y repeticiones que puedas completar con seguridad y con buena técnica. Usa barras de seguridad o un compañero que te asista cuando levantes mucho peso.
- Detente de inmediato si sientes dolor, mareo, falta de aire u opresión en el pecho, y busca ayuda médica si es necesario.

## 6. Loqqa Pro, periodo de prueba y suscripción

- **Compra:** compras Loqqa Pro en la app a través de la App Store de Apple o de Google Play. Celebras el contrato de compra con Apple o con Google, respectivamente. El pago, la facturación, la renovación, la cancelación y los reembolsos se rigen por los términos de la tienda correspondiente.
- **Precios y plazos:** Loqqa Pro está disponible como suscripción mensual y como suscripción anual. Antes de la compra, puedes ver los precios actuales en tu moneda en la app y en la tienda.
- **Periodo de prueba:** Loqqa Pro puede comenzar con un periodo de prueba gratuito de 7 días. La tienda decide si puedes usarlo, normalmente una vez por cuenta de la tienda. Si no cancelas a tiempo antes de que termine la prueba, esta se convierte automáticamente en una suscripción de pago. Antes de la compra, la app te muestra qué día comienza la suscripción de pago. No te enviamos un recordatorio aparte antes de que termine el periodo de prueba.
- **Renovación:** tu suscripción se renueva automáticamente por el plazo elegido si no la cancelas a tiempo: en la App Store, al menos 24 horas antes de que termine el plazo; en Google Play, antes de la fecha de renovación.
- **Cancelación:** cancelas en los ajustes de suscripción de tu cuenta de la tienda. En la app encontrarás el enlace a ellos en “Gestionar suscripción”. Tras la cancelación, Loqqa Pro sigue activo hasta el final del plazo pagado.
- **Importante:** eliminar la app o tu cuenta no cancela tu suscripción.
- **Restaurar compras:** Loqqa Pro se aplica a la cuenta de Loqqa con la que lo compraste, en todos los dispositivos en los que hayas iniciado sesión con ella. Mediante “Restaurar compras” en la pantalla de Loqqa Pro de la app, puedes reactivar una compra de tu cuenta de la tienda; si lo haces con otra cuenta de Loqqa, Loqqa Pro pasa a esa cuenta.
- **Reembolsos:** los reembolsos se rigen por los términos de la tienda correspondiente. Dirígete a Apple o a Google, respectivamente.
- **Cambios de precio:** los precios de las suscripciones activas solo pueden cambiar conforme a los procedimientos de la tienda correspondiente. La tienda te informa de antemano y, cuando se requiere, obtiene tu consentimiento. Si no estás de acuerdo con un nuevo precio, puedes cancelar tu suscripción con efecto al final del plazo.

## 7. Derecho de desistimiento

Como consumidor, por lo general tienes un derecho legal de desistimiento en los contratos de contenidos digitales y servicios digitales. Dado que compras Loqqa Pro a Apple o a Google, las tiendas te informan sobre este derecho, y el ejercicio y la tramitación del desistimiento se rigen por sus procedimientos.

## 8. Tu contenido

El contenido que incorporas en Loqqa sigue siendo tuyo, por ejemplo planes, datos de entrenamiento, fotos, tu texto “Sobre ti”, tus mensajes de soporte y tus preguntas al coach. Solo nos concedes los derechos no exclusivos e intransferibles que necesitamos para prestarte la app: almacenar, sincronizar, procesar y mostrarte tu contenido, y gestionar tus solicitudes de soporte. Estos derechos terminan cuando eliminas el contenido o tu cuenta.

- Sube únicamente contenido sobre el que tengas los derechos necesarios. Solo puedes importar planes de entrenamiento de entrenadores, libros o apps en la medida en que se te permita usarlos para tu propio entrenamiento.
- Tus fotos y capturas de pantalla no deben mostrar a otras personas que no hayan dado su consentimiento.
- No se permite contenido ilícito, ofensivo o inapropiado, tampoco en el chat de soporte ni en las preguntas al coach.

Podemos usar gratuitamente las ideas y sugerencias que nos envíes para mejorar Loqqa. No existe derecho a que se implementen ni a una compensación.

## 9. Soporte

En el chat de soporte de la app puedes informar de errores y sugerir funciones. Te respondemos allí, normalmente en unos pocos días. Los tiempos de respuesta indicados en la app son orientativos, no un compromiso vinculante. También puedes contactarnos por correo electrónico en support@useloqqa.com.

## 10. Uso permitido

Solo puedes usar Loqqa de forma privada para tu propio entrenamiento. El uso comercial, por ejemplo por parte de entrenadores para sus clientes, solo está permitido con nuestro consentimiento previo. En particular, no está permitido:

- eludir las medidas de protección técnica ni la comprobación de la suscripción
- acceder a la app o a nuestros servidores de forma automatizada, extraer contenido a gran escala o sobrecargar excesivamente nuestros servidores
- intentar acceder a los datos de otros usuarios
- descompilar o modificar la app, salvo que la ley lo permita expresamente (§§ 69d y 69e de la Ley alemana de Derechos de Autor (UrhG))

La app, el catálogo de ejercicios con textos, imágenes y videos, así como las marcas y los diseños están protegidos legalmente. Recibes un derecho no exclusivo e intransferible a usarlos dentro del alcance de estos términos.

## 11. Disponibilidad, actualizaciones y cambios en la app

- Nos esforzamos por que Loqqa funcione de forma fiable. Sin embargo, no podemos prometer una disponibilidad ininterrumpida de nuestros servidores, por ejemplo durante tareas de mantenimiento o en caso de fallos de nuestros proveedores de servicios. En ese caso, aún puedes usar muchas funciones sin conexión.
- Te proporcionamos las actualizaciones necesarias para que Loqqa funcione conforme al contrato, en particular las actualizaciones de seguridad (§ 327f del Código Civil alemán (BGB)). Instálalas con prontitud.
- Podemos modificar y seguir desarrollando Loqqa si existe un motivo válido para ello (por ejemplo, nuevos requisitos técnicos, la seguridad, el desarrollo de la app o un cambio en la situación jurídica), si esto no te ocasiona gastos adicionales y te informamos de forma clara y comprensible. Si un cambio afecta a tu acceso a Loqqa o a su usabilidad de forma más que insignificante, te informaremos con antelación. En ese caso, podrás resolver el contrato gratuitamente de conformidad con el § 327r del BGB.
- Actualizamos el catálogo de ejercicios de forma continua.

## 12. Responsabilidad

- Respondemos sin limitación en caso de dolo y negligencia grave, por daños a la vida, la integridad física o la salud, conforme a la Ley alemana de Responsabilidad por Productos (ProdHaftG) y en la medida de una garantía que hayamos otorgado.
- En caso de incumplimiento por negligencia leve de una obligación contractual esencial, solo respondemos por el daño previsible y típico del contrato. Las obligaciones contractuales esenciales son aquellas sin cuyo cumplimiento no sería posible la correcta ejecución del contrato y en cuyo cumplimiento puedes confiar por regla general.
- Por lo demás, no respondemos por negligencia leve.
- Estas reglas también se aplican a la responsabilidad personal de nuestros representantes y auxiliares.
- Tus derechos legales en caso de defectos en productos digitales (§§ 327 y ss. del BGB) no se ven afectados.

## 13. Duración, resolución y eliminación de la cuenta

- El contrato para el uso de Loqqa tiene duración indefinida.
- Puedes ponerle fin en cualquier momento eliminando tu cuenta en la app: en los ajustes, en “Eliminar cuenta”. También puedes solicitar la eliminación por correo electrónico a support@useloqqa.com.
- Podemos resolver el contrato con un preaviso de cuatro semanas si no tienes una suscripción activa. Una suscripción de pago no se ve afectada hasta el final del plazo pagado.
- El derecho de ambas partes a resolver sin preaviso por causa justificada no se ve afectado. Para nosotros existe causa justificada en particular en caso de infracciones graves o reiteradas de estos términos.
- Cuando se elimina tu cuenta, eliminamos tus datos como se describe en la Política de Privacidad. No podemos restaurar los datos eliminados.
- Cancelas tu suscripción a través de la tienda (sección 6).

## 14. Cambios en estos términos

Podemos modificar estos términos, por ejemplo cuando introducimos nuevas funciones o cambia la situación jurídica. Te mostramos la nueva versión en la app, con los cambios resaltados. Los cambios que afecten de forma sustancial a tus derechos u obligaciones solo surten efecto para ti una vez que los aceptes en la app. Hasta entonces, en la app solo puedes usar los ajustes, el soporte y la eliminación de la cuenta. Si no estás de acuerdo, puedes poner fin al contrato en cualquier momento eliminando tu cuenta; cancelas tu suscripción en la tienda.

## 15. Disposiciones finales

- **Ley aplicable:** se aplica el derecho de la República Federal de Alemania, con exclusión de la Convención de las Naciones Unidas sobre los Contratos de Compraventa Internacional de Mercaderías (CISG). Como consumidor, conservas la protección de las disposiciones imperativas del país en el que tengas tu residencia habitual.
- **Fuero:** para comerciantes, personas jurídicas de derecho público y patrimonios especiales de derecho público, el fuero es Múnich. Para consumidores, se aplican los fueros legales.
- **Resolución de litigios de consumo:** no estamos dispuestos ni obligados a participar en procedimientos ante una entidad de resolución alternativa de litigios en materia de consumo.
- **Idioma:** estos términos están disponibles en alemán, inglés, portugués, coreano, español y francés. La versión determinante es la alemana; las demás son traducciones.
- **Disposiciones inválidas:** si una disposición de estos términos es inválida, el resto del contrato sigue siendo válido. Las disposiciones legales sustituyen a la disposición inválida.
$md$, '2026-11-07 10:00:00+00', false),
  ('privacy', 'es', '1.5', $md$# Política de Privacidad

Versión: 1.5

Última actualización: 6 de noviembre de 2026

Esta es una traducción. La versión alemana es jurídicamente vinculante.

Aquí puedes saber qué datos personales tratamos cuando usas la app Loqqa, por qué lo hacemos y qué derechos tienes. Esto se basa en el Reglamento General de Protección de Datos (RGPD), la Ley Federal alemana de Protección de Datos (BDSG) y la Ley alemana de Protección de Datos en las Telecomunicaciones y los Servicios Digitales (TDDDG).

## En resumen

- Loqqa guarda primero tus planes y entrenamientos en tu dispositivo y los sincroniza con tu cuenta en cuanto estás en línea. Nuestra base de datos se encuentra en Fráncfort del Meno.
- Otros usuarios no pueden ver tu perfil, tus entrenamientos ni tus fotos.
- Tratamos tu peso, tu estatura y tus fotos del control corporal como datos de salud. Solo los tratamos con tu consentimiento explícito.
- Para la creación de planes, la importación de tus entrenamientos, la entrada por voz, el control corporal, el coach y la traducción de mensajes de soporte, usamos un modelo de IA de OpenAI. Para ello, transferimos a OpenAI los datos necesarios, que los trata en EE. UU.
- Para mejorar la app, usamos PostHog para medir cómo se usa. A PostHog no se envían datos de salud ni fotos. La app no contiene publicidad.
- Puedes eliminar tu cuenta en la app en cualquier momento. Con ello, también eliminamos tus fotos y todos los datos de tu cuenta.

## 1. ¿Quién es el responsable?

El responsable del tratamiento de tus datos es:

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 München, Alemania
- Correo electrónico: support@useloqqa.com

En adelante, nos referimos a nosotros mismos como “nosotros”.

## 2. Delegado de protección de datos

No hemos designado un delegado de protección de datos porque no estamos obligados a hacerlo. Puedes contactarnos directamente en support@useloqqa.com para cualquier pregunta sobre protección de datos.

## 3. Cómo funciona Loqqa

Loqqa es una app de entrenamiento. Puedes pedir que te creen un plan de entrenamiento o importar tu plan y tus entrenamientos anteriores desde otra app o una hoja de cálculo, registrar tus entrenamientos y tu peso corporal, hacerle preguntas al coach sobre tu entrenamiento y, a partir de los 18 años, hacer controles corporales con fotos.

La app funciona “offline first”: tus datos se guardan en una base de datos en tu dispositivo para que puedas entrenar incluso sin internet. Cuando has iniciado sesión y estás en línea, la app sincroniza estos datos con tu cuenta en nuestros servidores. Así, tu plan y tu historial tienen copia de seguridad y están disponibles en todos tus dispositivos. Para los servidores usamos proveedores de servicios (sección 7).

Todos los datos de nuestra base de datos están asignados a tu cuenta. Unas reglas de acceso técnicas garantizan que solo tú puedas leer y modificar tus propios datos. Loqqa no tiene ninguna función que permita a otros usuarios ver tu perfil, tus entrenamientos o tus fotos.

## 4. Qué datos tratamos y por qué

### 4.1 Configuración inicial sin cuenta

Completas la configuración inicial sin una cuenta. Durante la configuración inicial, la app carga desde nuestros servidores el catálogo de ejercicios (nombres, instrucciones, imágenes y videos de los ejercicios) y estos textos legales. Comprueba si el catálogo de ejercicios ha cambiado al iniciarse y, después, cada hora. En el proceso solo se generan los datos de conexión técnicamente necesarios (sección 4.13).

La app guarda inicialmente tus respuestas durante la configuración inicial (por ejemplo, nombre, sexo, fecha de nacimiento, peso, estatura, objetivo y el plan creado o importado) solo en tu dispositivo. Esta información solo se nos envía cuando creas una cuenta (secciones 4.3 y 4.4). Excepciones: si pides que te creen un plan, la app transfiere antes tus respuestas sobre objetivo, enfoque, equipamiento, entrenamientos por semana, duración del entrenamiento y experiencia para que se pueda crear el plan; de un archivo que importas, transfiere extractos, los nombres de los ejercicios y tu plan para que se puedan reconocer (ambos en la sección 4.7). Un historial de entrenamientos importado solo lo transfiere cuando creas una cuenta.

Base jurídica: art. 6, apartado 1, letra b), del RGPD (prestación de la app que quieres usar).

### 4.2 Tu cuenta

Al final de la configuración inicial, creas una cuenta iniciando sesión con tu cuenta de Google o, en dispositivos Apple, con tu cuenta de Apple. No hay contraseña de Loqqa. En ese proceso, tratamos:

- la información que Google o Apple nos transfiere cuando inicias sesión, incluida tu dirección de correo electrónico (véase más abajo)
- tu nombre, para que la app pueda volver a rellenarlo después de iniciar sesión en un dispositivo nuevo
- datos técnicos de la cuenta, como el momento del registro y del último inicio de sesión, así como tokens de inicio de sesión

Para mantener tu sesión iniciada, la app guarda tu sesión en tu dispositivo.

**Iniciar sesión con Google:** cuando inicias sesión con Google, el inicio de sesión de Google se abre en tu dispositivo. Google nos confirma entonces tu inicio de sesión y nos transfiere tu dirección de correo electrónico, tu nombre, la dirección de tu foto de perfil de Google y un identificador de tu cuenta de Google. Guardamos esta información en tu cuenta. En el proceso, Google se entera de que inicias sesión en Loqqa. Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlanda, es responsable independiente del inicio de sesión mediante tu cuenta de Google; se aplica la [Política de Privacidad de Google](https://policies.google.com/privacy?hl=es).

**Iniciar sesión con Apple** (solo en dispositivos Apple): cuando inicias sesión con Apple, el inicio de sesión de Apple se abre en tu dispositivo. Apple nos confirma entonces tu inicio de sesión y nos transfiere un identificador de tu cuenta de Apple y tu dirección de correo electrónico. En su lugar, puedes elegir una dirección generada por Apple que te reenvía los correos electrónicos (“Ocultar mi correo electrónico”). En el primer inicio de sesión, Apple también transfiere tu nombre si lo compartes. Guardamos esta información en tu cuenta. Apple Distribution International Limited, Hollyhill Industrial Estate, Hollyhill, Cork, Irlanda, es responsable independiente del inicio de sesión mediante tu cuenta de Apple; se aplica la [Política de Privacidad de Apple](https://www.apple.com/es/legal/privacy/).

Las cuentas solo se crean al final de la configuración inicial. Si el inicio de sesión mediante “Iniciar sesión” en la pantalla de bienvenida creara una cuenta nueva, la app la elimina de inmediato y te avisa de que todavía no existe ninguna cuenta.

Base jurídica: art. 6, apartado 1, letra b), del RGPD.

### 4.3 Perfil y planificación del entrenamiento

Cuando creas una cuenta, guardamos tus datos de la configuración inicial como tu perfil. Más adelante puedes modificar algunos de ellos en los ajustes y en tu perfil.

- nombre, sexo biológico (también es posible “Prefiero no decirlo”) y fecha de nacimiento
- peso corporal, estatura y tus unidades preferidas (métricas o imperiales)
- experiencia de entrenamiento, objetivo de entrenamiento, grupos musculares de enfoque, equipamiento disponible, entrenamientos por semana y duración deseada del entrenamiento
- el idioma de tu app, para que nuestro soporte pueda responderte en tu idioma
- opcional: una foto de perfil (la app la guarda como imagen cuadrada de 512 × 512 píxeles) y un breve texto “Sobre ti” de hasta 150 caracteres

Para qué: necesitamos tu fecha de nacimiento para comprobar la edad mínima (sección 16) y los límites de edad del coach y del control corporal. Si pides que te creen un plan de entrenamiento, un modelo de IA de OpenAI lo crea a partir de tu objetivo de entrenamiento, enfoque, equipamiento, entrenamientos por semana, duración del entrenamiento y experiencia (sección 4.7). El coach también usa tu objetivo, experiencia, equipamiento, enfoque y unidades para sus respuestas (sección 4.8). La app usa el sexo, la edad, el peso y la estatura para el control corporal (sección 4.6). Tu foto de perfil y “Sobre ti” solo se te muestran a ti en tu perfil.

Base jurídica: art. 6, apartado 1, letra b), del RGPD; para el peso corporal y la estatura, tu consentimiento (sección 4.4).

### 4.4 Datos de salud y tu consentimiento

Algunos datos pueden permitir extraer conclusiones sobre tu salud. Por ello los tratamos como datos relativos a la salud (“datos de salud”) en el sentido del art. 9 del RGPD:

- **Medidas corporales:** tu peso corporal, tus registros de peso y tu estatura (secciones 4.3 y 4.5).
- **Control corporal:** tus fotos del control corporal y los valores derivados de ellas, por ejemplo un porcentaje estimado de grasa corporal (sección 4.6).

Solo tratamos estos datos con tu consentimiento explícito (art. 9, apartado 2, letra a), en relación con el art. 6, apartado 1, letra a), del RGPD):

- **Medidas corporales:** al crear tu cuenta, consientes explícitamente, mediante el aviso situado justo encima del botón, que tratemos tus datos corporales para adaptar tu entrenamiento. Antes de eso, el peso y la estatura permanecen en tu dispositivo.
- **Control corporal:** antes de que la app envíe tus fotos para su evaluación, te informa de que, para ello, se transferirán fotos y datos corporales a OpenAI en EE. UU. Al tocar “Listo”, das tu consentimiento a esto.
- **Coach:** para sus respuestas, el coach también usa tus registros de peso y las puntuaciones globales de tus controles corporales, y para ello nuestro servidor transfiere tus datos de entrenamiento y corporales a OpenAI en EE. UU. (sección 4.8). Al crear tu cuenta y aceptar esta Política de Privacidad, das tu consentimiento a esto. Guardamos el momento de tu consentimiento. Solo transferimos estos datos cuando le haces una pregunta al coach.

El uso del control corporal y del coach es voluntario. Puedes retirar tus consentimientos en cualquier momento con efecto para el futuro (sección 12).

### 4.5 Datos de entrenamiento y peso corporal

Cuando usas Loqqa, guardamos:

- **Planes:** nombre, entrenamientos por semana, bloques con una semana de descarga, entrenamientos en su orden (incluidos entrenamientos sin plan), ejercicios, series con valores objetivo (repeticiones o segundos), repeticiones en reserva (RIR) y tiempos de descanso
- **Entrenamientos completados,** también los que importas: inicio y fin, a qué plan y a qué semana del plan cuentan, ejercicios, peso y repeticiones o segundos por serie, el momento de cada serie completada y récords personales
- **Ejercicios personalizados** que creas tú o que se crean durante la importación
- **Peso corporal:** los registros de peso que anotas, un valor por día

Para qué: para que puedas registrar tus entrenamientos y tu peso y ver tu historial, tus récords, tus series por músculo en el periodo que elijas y tu actividad. La app calcula en tu dispositivo las sugerencias para tus series y el número de tus series por músculo. Si se lo preguntas al coach, este responde tu pregunta a partir de estos datos (sección 4.8).

Base jurídica: art. 6, apartado 1, letra b), del RGPD; para los registros de peso, tu consentimiento (sección 4.4).

### 4.6 Control corporal

El control corporal es opcional y solo está disponible a partir de los 18 años. Para ello, tomas tres fotos con la cámara: de frente, de lado y de espaldas. La app recomienda llevar ropa interior o ropa deportiva ajustada. Tu rostro puede verse en las fotos.

La app reduce las fotos a un ancho máximo de 1080 píxeles y las guarda en tu dispositivo. Cuando inicias la evaluación, sube las fotos a un área de almacenamiento no pública de tu cuenta. Allí permanecen para que también puedas verlas en tus otros dispositivos. Para la evaluación necesitas una conexión a internet.

**Evaluación por un modelo de IA de OpenAI:** un modelo de IA de OpenAI determina los valores de tu control. Para ello, nuestro servidor transfiere a OpenAI:

- las tres fotos de este control y, si las hay, las fotos de tu control anterior, para que el modelo pueda comparar directamente los cambios
- sexo, edad (calculada a partir de tu fecha de nacimiento), estatura, peso y experiencia de entrenamiento de tu perfil
- los valores de tu control anterior, para que los valores sigan siendo comparables de un control a otro

No transferimos tu nombre, tu dirección de correo electrónico ni el ID de tu cuenta. OpenAI trata los datos en EE. UU. (sección 8). Hemos configurado OpenAI para que no guarde la solicitud para consultarla más tarde. OpenAI no usa los datos de su API para entrenar sus modelos y los conserva hasta 30 días para detectar usos indebidos; después, se eliminan.

El modelo comprueba primero si las fotos se pueden evaluar, por ejemplo si tienen suficiente luz y si tu cuerpo se ve al menos de la cabeza a las rodillas. Si una foto no se puede evaluar, la app te pide que la repitas. En caso contrario, el modelo proporciona valores para seis grupos musculares (hombros, pecho, brazos, espalda, abdomen, piernas), un porcentaje estimado de grasa corporal y valores de proporciones y definición. A partir de ellos, nuestro servidor calcula la puntuación global. Guardamos estos valores junto con tu control.

Antes de que nuestro servidor evalúe un control, comprueba con RevenueCat si tu cuenta tiene Loqqa Pro (sección 4.12). Registramos cada evaluación con su momento y su resultado. Así limitamos el número de evaluaciones por día y garantizamos que los valores guardados proceden de una evaluación. Eliminamos el registro junto con tu cuenta.

Los valores son estimaciones aproximadas y no una medición médica ni un diagnóstico.

**Quién tiene acceso:** técnicamente, solo el operador de Loqqa, Jan Timo Hünnebeck, puede acceder al área de almacenamiento. Solo mira las fotos del control corporal si lo pides en soporte, si es necesario para corregir un error del que nos informas o si estamos obligados a ello por ley.

Puedes eliminar controles individuales en la app. La app elimina entonces las fotos en tu dispositivo y en nuestro almacenamiento. Si tu dispositivo está sin conexión en ese momento, las fotos pueden permanecer en nuestro almacenamiento hasta que elimines tu cuenta; en ese caso, escríbenos y las eliminaremos.

Base jurídica: tu consentimiento explícito (sección 4.4), también para la transferencia a OpenAI en EE. UU. (art. 49, apartado 1, letra a), del RGPD, además de las garantías de la sección 8).

### 4.7 Importación, creación de planes y ejercicios por voz

Puedes importar tus entrenamientos desde otra app o una hoja de cálculo: como un archivo en formato CSV, TSV, Excel u OpenDocument, por ejemplo la exportación de Hevy o Strong. El archivo puede contener tu historial de entrenamientos, tu plan de entrenamiento o ambos. Asegúrate de que en el archivo no haya datos de otras personas.

**Lectura en tu dispositivo:** la app abre el archivo y lee sus filas en tu dispositivo. Para ello, no transfiere todo tu historial de entrenamientos a nuestro servidor.

**Reconocimiento por un modelo de IA de OpenAI:** para que la app entienda cómo está estructurado tu archivo y a qué ejercicios se refiere, transfiere a nuestro servidor, junto con el idioma de tu app: el nombre del archivo y los nombres de las hojas; por cada hoja, la fila de encabezado, una selección de como máximo 150 filas (del principio, del medio y del final) e información sobre cada columna (por ejemplo, cuántas celdas están rellenas y los valores frecuentes); los nombres de los ejercicios de tu historial con el número de sus series y un peso típico, así como las filas de tu plan, si el archivo contiene uno. El servidor pasa estos datos, junto con nuestro catálogo de ejercicios, a un modelo de IA de OpenAI. Este reconoce qué columnas contienen, por ejemplo, la fecha, el ejercicio, el peso y las repeticiones, asigna los nombres de los ejercicios a nuestro catálogo y lee los entrenamientos, ejercicios, series, repeticiones y tiempos de descanso de tu plan. Si el archivo no contiene ningún plan, la app elabora uno a partir de tus entrenamientos de las últimas seis semanas; para los entrenamientos sin nombre, el modelo propone uno y, para ello, solo recibe sus ejercicios y cuántas veces los has hecho. En el proceso no transferimos ningún otro dato: las solicitudes no contienen ni tu cuenta ni tu nombre. OpenAI trata los datos en EE. UU. (sección 8). Hemos configurado OpenAI para que no guarde la solicitud para consultarla más tarde. OpenAI no usa los datos de su API para entrenar sus modelos y los conserva hasta 30 días para detectar usos indebidos.

Nuestro servidor no guarda tu archivo ni los extractos transferidos; solo devuelve el resultado a la app. Se guarda lo que aceptas al final: los entrenamientos de tu historial como entrenamientos completados y el plan que confirmas (sección 4.5). La app no vuelve a incorporar los entrenamientos que empiezan a la misma hora que un entrenamiento de tu cuenta. La app crea en tu cuenta, como ejercicios personalizados, los ejercicios que nuestro catálogo no conoce. Si importas tu historial durante la configuración inicial, permanece en tu dispositivo hasta que crees tu cuenta y después se transfiere a tu cuenta.

**Creación de planes por un modelo de IA de OpenAI:** si pides que te creen un plan, la app transfiere a nuestro servidor tus respuestas sobre objetivo de entrenamiento, grupos musculares de enfoque, equipamiento, entrenamientos por semana, duración del entrenamiento y experiencia de entrenamiento, así como el idioma de tu app. El servidor las pasa, junto con los ejercicios de nuestro catálogo que coinciden con tu equipamiento, a un modelo de IA de OpenAI, que con ellos elabora tu plan. En el proceso no transferimos tu nombre, tu fecha de nacimiento, sexo, peso ni estatura, y la solicitud no contiene tu cuenta. Para el tratamiento en OpenAI se aplica lo mismo que para la importación. Nuestro servidor no guarda tus respuestas en el proceso; solo devuelve el plan a la app, donde puedes modificarlo.

**Ejercicios por voz:** al configurar un plan, al editar un entrenamiento y al preparar un entrenamiento libre, puedes decir los ejercicios con sus series y repeticiones en lugar de buscarlos uno por uno. El reconocimiento de voz de tu sistema operativo convierte lo que dices en texto: el de Apple en el iPhone, el de Google en los dispositivos Android. Según el dispositivo, esto ocurre en el propio dispositivo o en los servidores de Apple o de Google; se aplican sus políticas de privacidad. No recibimos la grabación en sí. La app transfiere a nuestro servidor el texto, que aún puedes modificar antes de añadir los ejercicios, junto con el idioma de tu app. El servidor lo pasa, junto con nuestro catálogo de ejercicios, a un modelo de IA de OpenAI, que reconoce los ejercicios con sus series y repeticiones. La solicitud no contiene ni tu cuenta ni tu nombre. Para el tratamiento en OpenAI se aplica lo mismo que para la importación. Nuestro servidor no guarda el texto.

**Límites de solicitudes:** para evitar que la importación, la creación de planes y los ejercicios por voz se usen indebidamente, limitamos con qué frecuencia se pueden usar por red y en total por día. Para ello, nuestro servidor guarda de cada solicitud el momento, a cuál de estas funciones se refería y un hash de tu dirección IP, que genera con una clave secreta; no guardamos la dirección IP en sí. Eliminamos las entradas con más de dos días de antigüedad con cada nueva solicitud.

Base jurídica: art. 6, apartado 1, letra b), del RGPD para la importación, la creación de planes y los ejercicios por voz que inicias, también para la transferencia a OpenAI en EE. UU. Para los límites de solicitudes, art. 6, apartado 1, letra f), del RGPD; nuestro interés legítimo es evitar usos indebidos y gastos innecesarios.

### 4.8 Kai · coach de IA

Con Loqqa Pro, puedes hacerle preguntas a Kai, el coach de IA de la app, sobre tu propio entrenamiento, por ejemplo “¿Cómo ha evolucionado mi peso?”. El coach responde en pocas frases, normalmente con un gráfico a partir de tus datos. También responde preguntas generales de entrenamiento, como con qué frecuencia debes entrenar piernas o qué ejercicio puedes hacer si algo te duele. Si se lo pides, puede preparar un entrenamiento, mostrar uno de tus entrenamientos guardados o sugerir reemplazar ejercicios de tu plan; tu plan solo cambia cuando lo confirmas en la app. No hace diagnósticos. Kai es una IA, no una persona. El coach es opcional y solo está disponible a partir de los 16 años. Para usarlo necesitas una conexión a internet.

**Respuestas de un modelo de IA de OpenAI:** la app transfiere a nuestro servidor tu pregunta, junto con el idioma de tu app y la zona horaria de tu dispositivo. El servidor pasa la pregunta a un modelo de IA de OpenAI. Si el modelo necesita datos, los solicita a nuestro servidor: el servidor calcula los valores a partir de tus datos guardados y transfiere los resultados a OpenAI. Con ellos, el modelo redacta la respuesta. Con cada pregunta, nuestro servidor transfiere a OpenAI:

- tu pregunta y hasta las seis últimas preguntas de este chat con sus respuestas y los datos consultados para ellas
- la fecha de hoy, tus unidades y el idioma de tu app
- objetivo de entrenamiento, experiencia de entrenamiento, equipamiento y grupos musculares de enfoque de tu perfil, así como el nombre y los entrenamientos por semana de tu plan activo
- los entrenamientos de tu plan activo con sus ejercicios y en qué punto están esta semana (hecho, siguiente o pendiente), y los nombres de tus otros entrenamientos guardados
- el número de tus entrenamientos con la fecha del primero y del último, el número de tus registros de peso con la fecha del primero y el número de tus controles corporales
- los ejercicios que has hecho, incluidos los ejercicios personalizados: nombre, cómo los registras, en cuántos entrenamientos los hiciste y cuándo los hiciste por última vez

Según la pregunta, nuestro servidor también transfiere lo que calcula a partir de tus datos para ella:

- entrenamientos con fecha, nombre, duración, ejercicios y series (peso, repeticiones, segundos y RIR)
- valores por entrenamiento, por ejemplo la repetición máxima estimada (1RM), el peso más alto, repeticiones, tiempo de aguante, volumen y récords
- tus registros de peso y una tendencia de peso suavizada
- las puntuaciones globales de tus controles corporales, sin fotos y sin valores individuales como el porcentaje de grasa corporal
- entrenamientos, series, volumen y tiempo de entrenamiento por semana o mes, pausas de entrenamiento y los días de la semana de tus entrenamientos
- series por grupo muscular y por ejercicio
- los ejercicios, series y objetivos de un entrenamiento guardado, cuando el coach te lo muestra o te sugiere un cambio en él
- ejercicios del catálogo de la app, cuando el coach prepara un entrenamiento o sugiere un reemplazo, con los que más has hecho primero

No transferimos tu nombre, tu dirección de correo electrónico, el ID de tu cuenta, tu fecha de nacimiento ni tu edad, tu sexo, tu estatura, tu foto de perfil, tu texto “Sobre ti”, las fotos de tu control corporal ni tus mensajes de soporte. No escribas datos de otras personas en tus preguntas. OpenAI trata los datos en EE. UU. (sección 8). Hemos configurado OpenAI para que no guarde la solicitud para consultarla más tarde. OpenAI no usa los datos de su API para entrenar sus modelos y los conserva hasta 30 días para detectar usos indebidos; después, se eliminan.

Las respuestas las redacta un modelo de IA. Pueden ser incorrectas. Son información y recomendaciones para tu entrenamiento, no consejo médico ni un diagnóstico.

Antes de que nuestro servidor responda una pregunta, comprueba tu edad mediante la fecha de nacimiento de tu perfil, tu consentimiento (sección 4.4) y, con RevenueCat, si tu cuenta tiene Loqqa Pro (sección 4.12).

**Preguntas por voz:** también puedes decir tu pregunta en voz alta. La app graba entonces con el micrófono hasta que terminas la grabación, durante un máximo de dos minutos, y transfiere la grabación, junto con el idioma de tu app, a nuestro servidor. El servidor la pasa a un modelo de reconocimiento de voz de OpenAI, que la convierte en texto. Para que términos como “press de banca” se reconozcan correctamente, envía junto con ella una breve nota sobre el tema (preguntas a un coach de entrenamiento y términos típicos). La app muestra el texto en el campo de entrada, donde puedes modificarlo; solo se convierte en tu pregunta cuando lo envías. No guardamos tu grabación: nuestro servidor solo la reenvía, y la app la elimina de tu dispositivo en cuanto el texto está disponible o descartas la grabación. No grabes a otras personas. Para el tratamiento en OpenAI se aplica lo mismo que para las respuestas (EE. UU., sin uso para entrenamiento, conservación de hasta 30 días para detectar usos indebidos). También para esto, nuestro servidor comprueba tu edad y si tu cuenta tiene Loqqa Pro. Para evitar que la conversión se use indebidamente, puedes usarla como máximo 100 veces en 24 horas. Para ello, nuestro servidor guarda de cada conversión el momento y un hash del ID de tu cuenta, que genera con una clave secreta; eliminamos las entradas con más de dos días de antigüedad con cada nueva conversión.

**Qué guardamos:** guardamos en nuestra base de datos tus chats con las preguntas, las respuestas y los gráficos bajo las respuestas. La app los sincroniza con tus dispositivos para que puedas ver allí tus chats (sección 5). De cada pregunta guardamos además un registro que la app no muestra: momento, estado (por ejemplo, si se dio una respuesta), el modelo usado, el número de tokens (unidades de texto por las que factura OpenAI) y la duración, además de las consultas del modelo con los datos consultados. Necesitamos estas consultas para que el coach pueda responder preguntas de seguimiento sobre una respuesta.

**Límites de preguntas:** para evitar que el coach se use indebidamente y para evitar gastos innecesarios, puedes hacer como máximo 20 preguntas en 24 horas y 150 preguntas en 30 días. Para ello, nuestro servidor cuenta los registros.

Puedes eliminar chats en la app, también varios a la vez. Eliminamos entonces sus preguntas, respuestas y gráficos y los datos consultados en sus registros. El momento, el estado, el modelo, los tokens y la duración se conservan para que los límites sigan aplicándose y para que podamos llevar el control de los gastos del coach. Por lo demás, conservamos tus chats hasta que los elimines o elimines tu cuenta. Cuando eliminas tu cuenta, eliminamos todos los chats y registros (sección 10).

Base jurídica: tu consentimiento explícito (sección 4.4), también para la transferencia a OpenAI en EE. UU. (art. 49, apartado 1, letra a), del RGPD, además de las garantías de la sección 8). Para convertir una pregunta hablada en texto, art. 6, apartado 1, letra b), del RGPD, ya que la inicias tú, también para la transferencia a OpenAI en EE. UU. Para los límites de preguntas y conversiones y los datos de momento, estado, modelo, tokens y duración, art. 6, apartado 1, letra f), del RGPD; nuestro interés legítimo es evitar usos indebidos y gastos innecesarios.

### 4.9 Soporte

Puedes escribirnos directamente en la app mediante “Informar de un error” y “Pedir una función”, o puedes escribir a support@useloqqa.com. En la app, tratamos:

- el tipo de tu solicitud (error o idea), para las ideas la importancia de 1 a 5, tus mensajes y el asunto (la primera línea de tu primer mensaje)
- hasta cinco capturas de pantalla por mensaje que seleccionas de tu biblioteca de fotos; la app las reduce (lado más largo de 1600 píxeles como máximo) y las guarda como JPEG
- el historial de tu solicitud, por ejemplo cambios de estado, nuestras respuestas y si reabriste una solicitud
- el dispositivo desde el que envías una solicitud: plataforma (iOS o Android), versión del sistema operativo, modelo del dispositivo y versión de la app, para que podamos rastrear errores
- el idioma de tu app, para que podamos traducir nuestras respuestas a tu idioma
- el idioma detectado de cada mensaje y sus traducciones (véase más abajo)

**Traducción por un modelo de IA de OpenAI:** para que te entendamos y puedas leer nuestras respuestas en tu idioma, un modelo de IA de OpenAI traduce los mensajes de soporte. Para ello, nuestro servidor transfiere a OpenAI cada mensaje que contiene texto, junto con el idioma al que se debe traducir: tus mensajes, para detectar su idioma y traducirlos al idioma de nuestro soporte, y nuestras respuestas, para traducirlas al idioma de tu app. Si cambias el idioma de tu app, traducimos nuestras respuestas anteriores al nuevo idioma. No transferimos tu nombre, tu dirección de correo electrónico, el ID de tu cuenta ni tus capturas de pantalla. Guardamos las traducciones junto con los mensajes; en la app puedes mostrar el original en cualquier momento. OpenAI trata los datos en EE. UU. (sección 8). Hemos configurado OpenAI para que no guarde la solicitud para consultarla más tarde. OpenAI no usa los datos de su API para entrenar sus modelos y los conserva hasta 30 días para detectar usos indebidos; después, se eliminan.

**Mensajes por voz:** también puedes decir tu mensaje en voz alta. Funciona como las preguntas al coach (sección 4.8): la app graba hasta que terminas la grabación, durante un máximo de dos minutos. Nuestro servidor pasa la grabación, con una breve nota sobre el tema, a un modelo de reconocimiento de voz de OpenAI. La app muestra el texto en el campo de entrada, donde puedes modificarlo; solo se convierte en tu mensaje cuando lo envías. No guardamos tu grabación. También aquí, nuestro servidor comprueba tu edad y si tu cuenta tiene Loqqa Pro, y se aplica el mismo límite.

**Quién ve tu solicitud:** gestionamos las solicitudes en un área de soporte interna en el navegador a la que solo puede acceder Jan Timo Hünnebeck, con un inicio de sesión independiente. Para tu solicitud, el área de soporte también muestra tu dirección de correo electrónico, si inicias sesión con Apple o con Google, el ID de tu cuenta, cuándo creaste tu cuenta y cuándo estuviste activo por última vez, el idioma de tu app y tus solicitudes anteriores.

La app guarda primero las capturas de pantalla en tu dispositivo y luego las sube en segundo plano. No puedes eliminar mensajes ni solicitudes tú mismo, para que el historial siga siendo trazable. Se eliminan junto con tu cuenta; si lo solicitas, también eliminamos antes las solicitudes cerradas. Conservamos los correos electrónicos durante el tiempo que los necesitemos para tu solicitud.

No nos envíes datos de salud ni datos de otras personas en mensajes y capturas de pantalla si no son necesarios para tu solicitud. También transferimos mensajes a OpenAI para su traducción.

Base jurídica: art. 6, apartado 1, letra b), del RGPD, en la medida en que tu solicitud se refiera al uso de la app, por ejemplo en caso de errores. Para las ideas y otros comentarios, art. 6, apartado 1, letra f), del RGPD; nuestro interés legítimo es responder a tu solicitud y mejorar Loqqa. Esto también se aplica a la traducción y a la transferencia a OpenAI en EE. UU. (sección 8).

### 4.10 Textos legales y aceptaciones

La app carga la versión actualmente vigente de los Términos de Uso y de esta Política de Privacidad en tu idioma. Cuando aceptas una versión, al registrarte o más tarde una versión modificada, guardamos qué versión aceptaste, el momento (fijado por el servidor), la versión de la app y la plataforma (iOS o Android). Esto nos permite demostrar qué versión se aplica a ti y volver a pedirte tu aceptación en caso de cambios sustanciales.

Base jurídica: art. 6, apartado 1, letra c), en relación con el art. 7, apartado 1, del RGPD (prueba del consentimiento) y art. 6, apartado 1, letra f), del RGPD (nuestro interés legítimo en poder demostrar qué términos se aplican).

### 4.11 Loqqa Pro: suscripciones y compras

Compras Loqqa Pro a través de la App Store de Apple o de Google Play. Apple o Google, respectivamente, gestionan la compra y el pago. Son responsables de ello por sí mismos y tratan tus datos de pago de acuerdo con sus propias políticas de privacidad: [Apple](https://www.apple.com/es/legal/privacy/) y [Google](https://policies.google.com/privacy?hl=es). No recibimos datos de pago, como números de tarjeta de crédito.

Para poder desbloquear Loqqa Pro, nos enteramos a través de RevenueCat (sección 4.12) de qué suscripción compraste, si hay un periodo de prueba en curso, cuándo la compraste y si la suscripción está activa. La app guarda este estado en tu dispositivo y lo consulta de nuevo al iniciarse y cada vez que inicias sesión. No guardamos datos de compra en nuestra propia base de datos.

Gestionas y cancelas tu suscripción en los ajustes de tu cuenta de la tienda. La app enlaza allí desde “Gestionar suscripción”.

Base jurídica: art. 6, apartado 1, letra b), del RGPD.

### 4.12 Gestión de suscripciones con RevenueCat

Gestionamos las compras y las suscripciones a través de RevenueCat. Por encargo nuestro, RevenueCat verifica los comprobantes de compra de la tienda e informa a la app de si Loqqa Pro está activo. Antes de que nuestro servidor evalúe un control corporal o responda a una pregunta dirigida al coach, consulta a RevenueCat si tu cuenta tiene Loqqa Pro.

Para que RevenueCat pueda asignar tus compras a tu cuenta, transferimos el ID de tu cuenta, un identificador aleatorio sin nombre ni dirección de correo electrónico. Si compras antes de crear tu cuenta, RevenueCat asigna primero un identificador aleatorio propio y luego asigna la compra a tu cuenta. RevenueCat también trata información de compra y suscripción de la tienda (por ejemplo, producto, precio, moneda, fechas de compra, renovación y vencimiento, periodo de prueba e identificadores de transacción), así como información técnica como plataforma, tipo de dispositivo, versión de la app y dirección IP.

RevenueCat también envía a PostHog (sección 4.14) eventos sobre tu suscripción, por ejemplo una prueba iniciada o convertida, renovaciones y cancelaciones, cada uno con los ingresos. Para ello, la app le da a RevenueCat tu identificador de PostHog: un identificador aleatorio antes de que crees tu cuenta, el ID de tu cuenta después.

- Proveedor: RevenueCat, Inc., 1032 E Brandon Blvd #3003, Brandon, FL 33511, EE. UU., como nuestro encargado del tratamiento
- Lugar de almacenamiento: EE. UU. (Amazon Web Services); para la garantía, véase la sección 8
- Plazo de conservación: mientras exista nuestro contrato con RevenueCat; hacemos que se eliminen los datos relativos a tu cuenta cuando eliminas tu cuenta, salvo que obligaciones legales lo impidan

Base jurídica: art. 6, apartado 1, letra b), del RGPD.

### 4.13 Datos de conexión técnicamente necesarios

Siempre que la app está conectada a nuestros servidores (por ejemplo, al iniciar sesión, sincronizar, subir archivos o cargar el catálogo de ejercicios y los textos legales), se tratan datos técnicamente necesarios: tu dirección IP, fecha y hora, la interfaz a la que se accede e información técnica como códigos de estado y, cuando se transmite, información sobre la app y el sistema operativo. Nuestros proveedores de alojamiento registran estos datos para garantizar el funcionamiento y la seguridad. En Supabase, los registros se eliminan al cabo de un día; en PowerSync, en cuanto dejan de ser necesarios para el funcionamiento y la seguridad.

Base jurídica: art. 6, apartado 1, letra f), del RGPD; nuestro interés legítimo es un funcionamiento estable y seguro.

### 4.14 Analítica de producto e informes de errores con PostHog

Para entender cómo se usa Loqqa y para encontrar errores, usamos PostHog. Para ello, la app envía:

- **Eventos de uso:** qué pantallas abres y determinados pasos, por ejemplo el inicio de la configuración inicial, planes creados o importados, historiales de entrenamientos importados (solo su tamaño, nunca el contenido), vistas de la pantalla de Loqqa Pro, compras, registro e inicio de sesión, el inicio, el fin o la cancelación de un entrenamiento, que le hiciste una pregunta al coach y si respondió (nunca el texto), la evaluación de un control corporal (nunca los valores), el guardado de un registro de peso (nunca el peso), ejercicios añadidos por voz, solicitudes de una valoración en la tienda, cada uno con el momento y métricas como el número de ejercicios o series, la duración o el código de error
- **Eventos de suscripción:** pruebas iniciadas o convertidas, renovaciones y cancelaciones con los ingresos, enviados por RevenueCat (sección 4.12)
- **Eventos de la app:** apertura y cierre de la app, versión de la app, tipo de dispositivo, sistema operativo e idioma
- **Informes de errores:** mensajes de fallos y errores con detalles técnicos
- **Información de perfil:** tras el registro, objetivo, experiencia, entrenamientos por semana, división, equipamiento, idioma, unidades, un grupo de edad (por ejemplo “25–34”) y si tienes Loqqa Pro
- **un identificador seudónimo:** antes del registro, un identificador aleatorio que la app guarda en tu dispositivo; después, el ID de tu cuenta, para que se unan los eventos anteriores y posteriores al registro

Tu nombre, tu dirección de correo electrónico, peso, estatura, tu fecha de nacimiento, las fotos y los valores del control corporal y los textos libres no se envían a PostHog. PostHog no guarda tu dirección IP, y no usamos grabaciones de sesión. Cuando cierras sesión, la app restablece el identificador.

- Proveedor: PostHog, Inc., 2261 Market St. #4008, San Francisco, CA 94114, EE. UU., como nuestro encargado del tratamiento
- Lugar de almacenamiento: PostHog Cloud EU (Fráncfort del Meno); PostHog está certificado conforme al Marco de Privacidad de Datos UE-EE. UU. (EU-US Data Privacy Framework; sección 8)
- Plazo de conservación: los eventos se eliminan al cabo de un año

Base jurídica: art. 6, apartado 1, letra f), del RGPD; nuestro interés legítimo es mejorar Loqqa y corregir errores. Puedes oponerte a ello en cualquier momento (sección 11), por ejemplo por correo electrónico a support@useloqqa.com; eliminaremos entonces los datos de analítica relativos a tu cuenta.

## 5. Almacenamiento en tu dispositivo

Para que Loqqa también funcione sin conexión, la app guarda datos en tu dispositivo:

- una base de datos local con tu perfil, tus planes y entrenamientos, tus registros de peso, los valores de tu control corporal, tus chats con el coach, tus solicitudes de soporte y tus aceptaciones
- fotos del control corporal que tomaste en este dispositivo y copias de tus capturas de pantalla de soporte
- tu sesión iniciada, tus respuestas de la configuración inicial, un historial de entrenamientos importado durante la configuración inicial, hasta que esté en tu cuenta, el estado de tu suscripción, ajustes como el idioma de la app y listas de archivos que aún deben subirse
- el catálogo de ejercicios
- el identificador y los eventos aún no enviados para PostHog (sección 4.14)

Salvo los datos para PostHog, este almacenamiento es estrictamente necesario para los servicios que quieres usar (§ 25, apartado 2, n.º 2, TDDDG).

Cuando cierras sesión, la app elimina de este dispositivo la base de datos local, así como tus fotos del control corporal y las copias de capturas de pantalla, y restablece la configuración inicial, el estado de la suscripción, los entrenamientos en curso y una importación aún no transferida. Los cambios aún no sincronizados se pierden en el proceso; la app te avisa antes. Los ajustes como el idioma de la app se conservan. Cuando eliminas la app, tu sistema operativo normalmente elimina todos los datos de la app.

Según los ajustes de tu dispositivo, los archivos de la app, incluidas las fotos del control corporal, pueden incluirse en las copias de seguridad de tu dispositivo (por ejemplo, con iCloud o Google). Apple o Google, respectivamente, son responsables de estas copias de seguridad.

## 6. Permisos en tu dispositivo

Loqqa solo pide un permiso cuando usas una función que lo necesita:

- **Cámara:** para las fotos del control corporal y para tu foto de perfil
- **Fotos:** para seleccionar imágenes para capturas de pantalla de soporte y para tu foto de perfil. Para ello, la app usa el selector de imágenes de tu sistema operativo y solo recibe las imágenes que seleccionas.
- **Archivos:** para seleccionar un archivo con tus entrenamientos mediante el selector de archivos de tu sistema operativo (sección 4.7)
- **Micrófono:** para decir ejercicios (sección 4.7), preguntas al coach (sección 4.8) y mensajes a soporte (sección 4.9). La app solo graba mientras usas la entrada por voz.
- **Reconocimiento de voz (iPhone):** para que el reconocimiento de voz de Apple pueda convertir en texto los ejercicios dichos en voz alta (sección 4.7)

Loqqa no pide acceso a la ubicación, a los contactos ni a apps de salud como la app Salud de Apple o Health Connect, y no envía notificaciones push. Puedes revocar los permisos en cualquier momento en los ajustes de tu dispositivo.

## 7. Destinatarios y encargados del tratamiento

Solo comunicamos tus datos si es necesario para los fines indicados, has dado tu consentimiento o estamos obligados a ello por ley. Nuestros proveedores de servicios tratan los datos por cuenta nuestra y conforme a nuestras instrucciones (art. 28 del RGPD):

- **Supabase, Inc.** (base de datos, inicio de sesión, almacenamiento de archivos y funciones de servidor): servidores en Fráncfort del Meno (Amazon Web Services)
- **PowerSync** de Journey Mobile, Inc. (sincronización entre la app y la base de datos; para ello, el servicio conserva una copia de tus datos sincronizados): servidores en la UE
- **OpenAI Ireland Ltd.**, 117–126 Sheriff Street Upper, Dublin 1, Irlanda (creación de planes con IA, reconocimiento de archivos de entrenamientos importados y de ejercicios dichos en voz alta, evaluación de las fotos del control corporal, las respuestas del coach, conversión de preguntas habladas en texto y traducción de mensajes de soporte, secciones 4.6 a 4.9): tratamiento en EE. UU. por OpenAI OpCo, LLC
- **RevenueCat, Inc.** (gestión de suscripciones, sección 4.12)
- **PostHog, Inc.** (analítica de producto e informes de errores, sección 4.14)

Apple y Google reciben datos como responsables independientes por las descargas de la app y las compras (sección 4.11), así como por el inicio de sesión mediante su cuenta (sección 4.2) y por el reconocimiento de voz de su sistema operativo (sección 4.7).

Loqqa la dirige una sola persona: solo Jan Timo Hünnebeck tiene acceso a tus datos, en la medida en que los necesite para el funcionamiento y el soporte.

Solo facilitamos datos a autoridades y tribunales si estamos obligados a ello por ley.

## 8. Transferencias a terceros países

Guardamos tu cuenta, tus entrenamientos y tus fotos en centros de datos de la UE (Supabase en Fráncfort del Meno, PowerSync en la UE). Algunos de nuestros proveedores de servicios tienen su sede en EE. UU. Por ello, los datos también pueden transferirse a EE. UU., por ejemplo durante el mantenimiento o el soporte por parte del proveedor de servicios. Para la creación de planes, la importación de tus entrenamientos, los ejercicios y preguntas por voz, la evaluación del control corporal, las respuestas del coach y la traducción de mensajes de soporte, transferimos datos a OpenAI en EE. UU. con cada solicitud (secciones 4.6 a 4.9), y RevenueCat trata los datos de suscripción en EE. UU. (sección 4.12).

Basamos estas transferencias en las siguientes garantías:

- **PostHog:** decisión de adecuación de la Comisión Europea para el Marco de Privacidad de Datos UE-EE. UU., conforme al cual PostHog está certificado (art. 45 del RGPD)
- **Supabase, PowerSync, OpenAI y RevenueCat:** cláusulas contractuales tipo de la Comisión Europea (art. 46, apartado 2, letra c), del RGPD), que forman parte de nuestros contratos de encargo del tratamiento
- **Control corporal y coach:** además, tu consentimiento explícito (art. 49, apartado 1, letra a), del RGPD). En EE. UU., las autoridades pueden acceder a los datos en determinadas circunstancias sin que tengas frente a ello los mismos recursos jurídicos que en la UE.

Puedes solicitarnos una copia de las cláusulas contractuales tipo.

## 9. Cuánto tiempo conservamos tus datos

- **Cuenta, perfil, planes, entrenamientos, registros de peso, controles corporales, chats con el coach, solicitudes de soporte y aceptaciones:** mientras exista tu cuenta. Antes puedes eliminar tú mismo contenidos individuales, por ejemplo planes, registros de peso, controles corporales o chats con el coach. Cuando eliminas tu cuenta, los eliminamos por completo (sección 10). No eliminamos automáticamente las cuentas que ya no se usan; puedes solicitar la eliminación en cualquier momento en la app o por correo electrónico.
- **Respuestas de la configuración inicial sin cuenta:** solo en tu dispositivo, hasta que crees una cuenta o elimines la app.
- **Datos en tu dispositivo:** hasta que cierres sesión o elimines la app (sección 5).
- **Registros del servidor:** un día en Supabase; en PowerSync, mientras sean necesarios para el funcionamiento y la seguridad (sección 4.13).
- **Límites de importación, creación de planes y entrada por voz:** dos días (secciones 4.7 y 4.8).
- **Grabaciones de preguntas habladas:** no las guardamos; la app las elimina tras la conversión (sección 4.8).
- **Registros del coach:** mientras exista tu cuenta; eliminamos los datos consultados que contienen junto con el chat correspondiente (sección 4.8).
- **En OpenAI:** hasta 30 días (secciones 4.6 a 4.9).
- **Datos de analítica en PostHog:** un año (sección 4.14).
- **Datos de suscripción en RevenueCat:** véase la sección 4.12.
- **Copias de seguridad:** actualmente no creamos copias de seguridad de nuestra base de datos ni de nuestro almacenamiento. Si esto cambia, añadiremos aquí cuánto tiempo se conservan las copias de seguridad.

## 10. Eliminación de tu cuenta

Puedes eliminar tu cuenta en la app en cualquier momento: en los ajustes, en “Eliminar cuenta”. Entonces ocurre lo siguiente:

1. Si iniciaste sesión con Apple, lo confirmas una vez más con Apple en un dispositivo Apple. Con ello ponemos fin a la conexión entre tu cuenta de Apple y Loqqa: nuestro servidor intercambia la confirmación con Apple por tus claves de inicio de sesión y hace que se revoquen de inmediato. En el proceso no se guarda nada.
2. La app elimina de nuestro almacenamiento tu foto de perfil, las fotos de tu control corporal y tus capturas de pantalla de soporte.
3. A continuación se elimina tu cuenta. Esto elimina automáticamente todos los datos asociados en nuestra base de datos: perfil, planes, entrenamientos, registros de peso, controles corporales, chats con el coach con sus registros, solicitudes de soporte con todos los mensajes y tus aceptaciones guardadas. En el proceso también se elimina la copia en PowerSync.
4. Por último, la app cierra tu sesión en este dispositivo y elimina los datos guardados en él.

**Esto no pone fin a una suscripción activa.** Cancélala en la App Store o en Google Play.

En otros dispositivos en los que hubieras iniciado sesión, los datos guardados localmente pueden permanecer hasta que cierres sesión allí o elimines la app. Los datos de analítica en PostHog y los datos de suscripción en RevenueCat no se eliminan automáticamente con tu cuenta; escríbenos si quieres que los hagamos eliminar de inmediato; de lo contrario, se aplican los plazos de la sección 9.

Si la eliminación no funciona, por ejemplo sin conexión a internet, la app muestra un aviso y puedes intentarlo de nuevo. También puedes solicitar la eliminación por correo electrónico a support@useloqqa.com.

## 11. Tus derechos

Tienes los siguientes derechos frente a nosotros:

- **Acceso** a los datos que tratamos sobre ti (art. 15 del RGPD)
- **Rectificación** de datos inexactos (art. 16 del RGPD); puedes modificar gran parte de la información directamente en la app, y todo lo demás lo modificamos cuando nos escribes
- **Supresión** de tus datos (art. 17 del RGPD); puedes eliminar tu cuenta directamente en la app (sección 10)
- **Limitación** del tratamiento (art. 18 del RGPD)
- **Portabilidad de los datos** (art. 20 del RGPD): si lo solicitas por correo electrónico, te enviaremos los datos que nos proporcionaste como archivo JSON en el plazo de un mes.
- **Retirada** de los consentimientos otorgados (sección 12)

**Derecho de oposición (art. 21 del RGPD):** si tratamos datos sobre la base del art. 6, apartado 1, letra f), del RGPD (intereses legítimos), por ejemplo para la analítica de producto con PostHog, puedes oponerte en cualquier momento a este tratamiento por motivos relacionados con tu situación particular. Dejaremos entonces de tratar los datos, salvo que podamos acreditar motivos legítimos imperiosos que prevalezcan sobre tus intereses, o que el tratamiento sirva para la formulación, el ejercicio o la defensa de reclamaciones.

Para todas las solicitudes basta con un correo electrónico a support@useloqqa.com. Para que podamos identificar tu cuenta, indícanos la dirección de correo electrónico que muestra la app en sus ajustes.

## 12. Retirada del consentimiento

Puedes retirar un consentimiento en cualquier momento con efecto para el futuro (art. 7, apartado 3, del RGPD). El tratamiento realizado antes de la retirada sigue siendo lícito.

- **Medidas corporales:** por correo electrónico a support@useloqqa.com. Eliminaremos entonces tu peso, tu estatura y tus registros de peso. Sin esta información, la app solo puede adaptar tu entrenamiento de forma limitada; como alternativa, también puedes eliminar tu cuenta (sección 10).
- **Control corporal:** elimina tus controles en la app y no hagas otros nuevos, o escríbenos; eliminaremos entonces todas las fotos y valores del control corporal.
- **Coach:** por correo electrónico a support@useloqqa.com. Registraremos entonces tu retirada. Para el coach, solo transferimos datos a OpenAI cuando le haces una pregunta, así que no hagas más preguntas tras la retirada: una nueva pregunta cuenta como un nuevo consentimiento. Puedes eliminar tus chats anteriores en la app, o escribirnos; los eliminaremos entonces.

## 13. Reclamación ante una autoridad de control

Puedes presentar una reclamación ante una autoridad de control de protección de datos (art. 77 del RGPD), en particular en el Estado miembro de la UE en el que vives o trabajas o en el que tuvo lugar la presunta infracción. La autoridad competente para nosotros es el Bayerisches Landesamt für Datenschutzaufsicht (Autoridad de Protección de Datos de Baviera), Promenade 18, 91522 Ansbach, Alemania, [www.lda.bayern.de](https://www.lda.bayern.de).

## 14. ¿Tienes que facilitarnos datos?

Para una cuenta necesitamos tu cuenta de Google o tu cuenta de Apple. Sin una cuenta, no puedes usar Loqqa después de la configuración inicial. La app necesita la información de la configuración inicial para comprobar tu edad y para crear y adaptar tu plan. En particular, tu sexo (puedes elegir “Prefiero no decirlo”), el control corporal, el coach, los registros de peso, una foto de perfil y el texto “Sobre ti” son voluntarios.

## 15. Sin decisiones automatizadas

La app crea planes, sugerencias, análisis como tus series por músculo, valores del control corporal y las respuestas del coach de forma automática; los planes que pides que te creen, los valores del control corporal y las respuestas del coach proceden de un modelo de IA de OpenAI (secciones 4.6 a 4.8). Son información, recomendaciones y estimaciones para tu entrenamiento. Las respuestas del coach pueden ser incorrectas y no son consejo médico. No tomamos decisiones que produzcan efectos jurídicos en ti o te afecten significativamente de modo similar (art. 22 del RGPD).

## 16. Niños y adolescentes

Loqqa está dirigida a personas que han alcanzado la edad a la que, en su país, pueden dar por sí mismas su consentimiento para el tratamiento de sus datos: en Alemania, a partir de los 16 años; en otros países, a partir de una edad de entre 13 y 16 años, según la legislación local. Durante la configuración inicial, la app te pide tu fecha de nacimiento y solo te deja continuar a partir de esta edad; es determinante el país configurado en tu dispositivo. El coach solo está disponible a partir de los 16 años, incluso en países con una edad mínima inferior. El control corporal solo está disponible a partir de los 18 años. Nuestro servidor comprueba ambos mediante la fecha de nacimiento de tu perfil.

Si nos enteramos de que una cuenta pertenece a una persona menor de la edad mínima, la eliminaremos.

## 17. Seguridad

Protegemos tus datos con medidas técnicas y organizativas, entre ellas:

- transmisión cifrada entre la app y los servidores (HTTPS/TLS)
- reglas de acceso en la base de datos mediante las cuales cada cuenta solo puede leer y modificar sus propios datos
- áreas de almacenamiento no públicas para fotos de perfil, fotos del control corporal y capturas de pantalla, en las que cada cuenta solo puede acceder a su propia carpeta
- enlaces de duración limitada para mostrar fotos: una hora para las fotos del control corporal y las capturas de pantalla, 24 horas para las fotos de perfil
- inicio de sesión mediante Google o Apple, de modo que no guardamos contraseñas

Ningún sistema es completamente seguro. Como la app guarda datos en tu dispositivo, protege tu dispositivo con un bloqueo de pantalla.

## 18. Cambios en esta Política de Privacidad

Adaptamos esta Política de Privacidad cuando cambian la app o la situación jurídica. Puedes encontrar la versión actualmente vigente en la app, en los ajustes, y en [useloqqa.com](https://useloqqa.com). Te informaremos de los cambios sustanciales en la app y, cuando sea necesario, te pediremos tu consentimiento.
$md$, '2026-11-07 10:00:00+00', false),
  ('terms', 'fr', '1.5', $md$# Conditions d'utilisation

Version : 1.5

Dernière mise à jour : 6 novembre 2026

Ceci est une traduction. La version allemande fait foi.

Les présentes Conditions d'utilisation régissent la manière dont tu peux utiliser l'application Loqqa. Lis-les attentivement. Nous t'expliquons comment nous traitons tes données dans notre Politique de confidentialité.

## 1. Fournisseur et champ d'application

Le fournisseur de l'application Loqqa est :

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 München, Allemagne
- E-mail : support@useloqqa.com
- Site web : [useloqqa.com](https://useloqqa.com)

Ci-après dénommé « nous ». Ces conditions s'appliquent à toutes les fonctionnalités de l'application. Pour les achats effectués via l'App Store d'Apple ou via Google Play, les conditions de la boutique concernée s'appliquent également.

## 2. Âge minimum

Tu dois avoir au moins l'âge auquel tu peux consentir toi-même au traitement de tes données dans ton pays : en Allemagne 16 ans, dans les autres pays entre 13 et 16 ans selon le droit local. Lors de la configuration, l'application te demande ta date de naissance et ne te laisse continuer qu'à partir de cet âge.

Si tu n'es pas encore majeur, tu as besoin du consentement de tes parents ou de tes représentants légaux pour acheter Loqqa Pro. Le coach n'est disponible qu'à partir de 16 ans, le bilan corporel qu'à partir de 18 ans.

## 3. Ton compte

- Pour utiliser Loqqa après la configuration, tu as besoin d'un compte. Tu le crées à la fin de la configuration avec ton compte Google ou, sur les appareils Apple, ton compte Apple. Le contrat d'utilisation de Loqqa est conclu lorsque tu crées ton compte.
- Fournis des informations exactes lors de la configuration.
- Protège l'accès à ton compte Google ou à ton compte Apple. Si tu soupçonnes que quelqu'un d'autre utilise ton compte, préviens-nous.
- Ton compte est personnel et non transférable.

## 4. Ce que propose Loqqa

Loqqa t'accompagne dans ta musculation. Cela comprend notamment :

- un programme d'entraînement qu'un modèle d'IA crée à partir de tes informations, par exemple ton objectif, ton expérience, ton équipement et le nombre de séances par semaine
- l'importation de ton programme d'entraînement et de tes séances passées à partir d'un fichier, par exemple l'export d'une autre application
- l'enregistrement de tes séances avec les charges, les répétitions et les durées, ton historique, tes records, tes séries par muscle sur la période de ton choix et des suggestions pour tes séries
- l'enregistrement de ton poids corporel
- le bilan corporel avec des photos et des valeurs estimées (à partir de 18 ans)
- Kai, le coach IA : un modèle d'IA qui répond à tes questions sur ton entraînement, le plus souvent avec un graphique issu de tes données, et qui, sur demande, compose des séances et propose de remplacer des exercices (à partir de 16 ans)
- un catalogue d'exercices avec des instructions, des images et des vidéos
- une discussion d'assistance pour les signalements de bugs et les idées

Tu peux effectuer la configuration, y compris la création d'un programme ou l'importation, gratuitement. Ensuite, l'utilisation de Loqqa nécessite un abonnement (Loqqa Pro, section 6). Sans abonnement actif, ton compte et tes données sont conservés et tu peux encore utiliser les réglages, l'assistance et la suppression du compte ; les autres fonctionnalités sont alors verrouillées.

La reconnaissance lors de l'importation peut comporter des erreurs. Vérifie donc le programme reconnu et l'association de tes exercices avant de les accepter ; l'application te soumet pour vérification les exercices dont la reconnaissance est incertaine. Un programme que l'application crée pour toi est lui aussi une suggestion : relis-le et ajuste-le si nécessaire. Les réponses du coach peuvent elles aussi être erronées, par exemple si le modèle comprend mal une question. Afin que le coach ne soit pas utilisé de façon abusive, tu peux lui poser au maximum 20 questions en 24 heures et 150 questions en 30 jours. Pour la création de programme, l'importation, le bilan corporel et le coach, l'application a besoin d'une connexion internet.

De nombreuses fonctionnalités de Loqqa fonctionnent aussi sans connexion internet. Tes données sont synchronisées dès que tu es en ligne. Les modifications qui n'ont pas encore été synchronisées au moment où tu te déconnectes sont perdues ; l'application t'en avertit au préalable.

Loqqa est un outil pour ton entraînement. Nous ne te devons aucun résultat d'entraînement particulier.

## 5. Avertissements relatifs à la santé

> Loqqa ne remplace ni un avis médical, ni un diagnostic, ni un traitement.

- Loqqa donne des recommandations d'entraînement générales. L'application ne propose aucun conseil médical, kinésithérapeutique ou nutritionnel. Loqqa n'est pas un dispositif médical et n'est pas destinée à détecter, surveiller ou traiter des maladies.
- Demande un avis médical avant de commencer un programme d'entraînement, surtout si tu as des affections préexistantes (par exemple cardiovasculaires), des troubles ou des blessures, après une opération, pendant la grossesse ou l'allaitement et si tu ne t'es pas entraîné depuis longtemps.
- Les valeurs du bilan corporel, par exemple le pourcentage de masse grasse estimé, sont des estimations approximatives d'un modèle d'IA. Elles ne constituent ni une mesure médicale ni un diagnostic.
- Les réponses du coach sont des informations et des recommandations générales pour ton entraînement, créées par un modèle d'IA. Elles peuvent être erronées et ne remplacent pas l'avis d'un médecin ou d'un kinésithérapeute. Le coach ne diagnostique ni douleurs ni blessures ; fais examiner par un médecin les troubles qui persistent.
- Les programmes et les suggestions sont des repères. Choisis les charges et les répétitions de manière à pouvoir les réaliser en toute sécurité avec une technique propre. Utilise des barres de sécurité ou un partenaire pour assurer les charges lourdes.
- Arrête-toi immédiatement si tu ressens une douleur, des vertiges, des difficultés à respirer ou une oppression dans la poitrine, et consulte un médecin si nécessaire.

## 6. Loqqa Pro, période d'essai et abonnement

- **Achat :** tu achètes Loqqa Pro dans l'application via l'App Store d'Apple ou via Google Play. Tu conclus le contrat d'achat avec Apple ou Google, selon le cas. Le paiement, la facturation, le renouvellement, la résiliation et les remboursements sont régis par les conditions de la boutique concernée.
- **Prix et durées :** Loqqa Pro est disponible en abonnement mensuel et en abonnement annuel. Tu peux consulter les prix actuels dans ta devise avant l'achat, dans l'application et dans la boutique.
- **Période d'essai :** Loqqa Pro peut commencer par une période d'essai gratuite de 7 jours. C'est la boutique qui décide si tu peux en bénéficier, en général une fois par compte de boutique. Si tu ne résilies pas à temps avant la fin de l'essai, celui-ci se transforme automatiquement en abonnement payant. Avant l'achat, l'application t'indique à quelle date l'abonnement payant commence. Nous ne t'envoyons pas de rappel distinct avant la fin de la période d'essai.
- **Renouvellement :** ton abonnement est automatiquement renouvelé pour la durée choisie si tu ne le résilies pas à temps : dans l'App Store au moins 24 heures avant la fin de la période, sur Google Play avant la date de renouvellement.
- **Résiliation :** tu résilies dans les réglages d'abonnement de ton compte de boutique. Dans l'application, tu trouves le lien correspondant sous « Gérer l'abonnement ». Après la résiliation, Loqqa Pro reste actif jusqu'à la fin de la période payée.
- **Important :** supprimer l'application ou ton compte ne résilie pas ton abonnement.
- **Restaurer les achats :** Loqqa Pro est attaché au compte Loqqa avec lequel tu l'as acheté, sur tous les appareils sur lesquels tu es connecté avec ce compte. Avec « Restaurer les achats » sur l'écran Loqqa Pro de l'application, tu peux réactiver un achat de ton compte de boutique ; si tu le fais avec un autre compte Loqqa, Loqqa Pro est transféré à ce compte.
- **Remboursements :** les remboursements sont régis par les conditions de la boutique concernée. Adresse-toi à Apple ou à Google, selon le cas.
- **Modifications de prix :** les prix des abonnements actifs ne peuvent changer que conformément aux procédures de la boutique concernée. La boutique t'en informe au préalable et, lorsque c'est requis, recueille ton consentement. Si tu n'es pas d'accord avec un nouveau prix, tu peux résilier ton abonnement à la fin de la période.

## 7. Droit de rétractation

En tant que consommateur, tu disposes en principe d'un droit de rétractation légal pour les contrats portant sur des contenus numériques et des services numériques. Comme tu achètes Loqqa Pro auprès d'Apple ou de Google, ce sont les boutiques qui t'informent de ce droit, et l'exercice et le traitement de la rétractation sont régis par leurs procédures.

## 8. Tes contenus

Les contenus que tu saisis dans Loqqa restent à toi, par exemple les programmes, les données d'entraînement, les photos, ton texte « À propos de toi », tes messages à l'assistance et tes questions au coach. Tu ne nous accordes que les droits non exclusifs et non transférables dont nous avons besoin pour te fournir l'application : stocker, synchroniser, traiter et t'afficher tes contenus, et traiter tes demandes d'assistance. Ces droits prennent fin lorsque tu supprimes les contenus ou ton compte.

- Ne téléverse que des contenus pour lesquels tu disposes des droits nécessaires. Tu ne peux importer des programmes d'entraînement de coachs, de livres ou d'applications que dans la mesure où tu as le droit de les utiliser pour ton propre entraînement.
- Tes photos et captures d'écran ne doivent montrer aucune autre personne qui n'y a pas consenti.
- Les contenus illicites, injurieux ou choquants ne sont pas autorisés, y compris dans la discussion d'assistance ou dans les questions au coach.

Nous pouvons utiliser gratuitement, pour améliorer Loqqa, les idées et suggestions que tu nous envoies. Il n'existe aucun droit à leur mise en œuvre ni à une rémunération.

## 9. Assistance

Dans la discussion d'assistance de l'application, tu peux signaler des bugs et proposer des fonctionnalités. Nous t'y répondons, en général sous quelques jours. Les délais de réponse indiqués dans l'application sont des valeurs indicatives, non un engagement contraignant. Tu peux aussi nous joindre par e-mail à support@useloqqa.com.

## 10. Utilisation autorisée

Tu ne peux utiliser Loqqa qu'à titre privé pour ton propre entraînement. Une utilisation commerciale, par exemple par des coachs pour leurs clients, n'est autorisée qu'avec notre accord préalable. Il est notamment interdit :

- de contourner les mesures de protection techniques ou la vérification de l'abonnement
- d'accéder à l'application ou à nos serveurs de manière automatisée, d'extraire des contenus à grande échelle ou de solliciter excessivement nos serveurs
- d'essayer d'accéder aux données d'autres utilisateurs
- de décompiler ou de modifier l'application, sauf si la loi l'autorise expressément (§§ 69d, 69e de la loi allemande sur le droit d'auteur (UrhG))

L'application, le catalogue d'exercices avec ses textes, ses images et ses vidéos, ainsi que les marques et les dessins et modèles sont protégés par la loi. Tu reçois un droit non exclusif et non transférable de les utiliser dans le cadre de ces conditions.

## 11. Disponibilité, mises à jour et modifications de l'application

- Nous nous efforçons de faire fonctionner Loqqa de façon fiable. Nous ne pouvons toutefois pas promettre une disponibilité ininterrompue de nos serveurs, par exemple lors de travaux de maintenance ou en cas de perturbations chez nos prestataires. Tu peux alors continuer à utiliser de nombreuses fonctionnalités hors ligne.
- Nous te fournissons les mises à jour nécessaires au bon fonctionnement de Loqqa conformément au contrat, notamment les mises à jour de sécurité (§ 327f du Code civil allemand (BGB)). Installe-les rapidement.
- Nous pouvons modifier et faire évoluer Loqqa s'il existe un motif valable (par exemple de nouvelles exigences techniques, la sécurité, l'évolution de l'application ou un changement de la situation juridique), si cela ne t'occasionne aucun coût supplémentaire et si nous t'en informons de manière claire et compréhensible. Si une modification affecte ton accès à Loqqa ou son utilisabilité de manière plus que seulement mineure, nous t'en informerons à l'avance. Tu peux alors mettre fin gratuitement au contrat conformément au § 327r BGB.
- Nous actualisons le catalogue d'exercices en continu.

## 12. Responsabilité

- Nous sommes responsables sans limitation en cas de faute intentionnelle et de négligence grave, en cas d'atteinte à la vie, à l'intégrité corporelle ou à la santé, au titre de la loi allemande sur la responsabilité du fait des produits (ProdHaftG) et dans la mesure d'une garantie que nous avons donnée.
- En cas de violation par négligence légère d'une obligation contractuelle essentielle, nous ne sommes responsables que du dommage prévisible et typique pour ce type de contrat. Les obligations contractuelles essentielles sont les obligations sans l'exécution desquelles la bonne exécution du contrat ne serait tout simplement pas possible et au respect desquelles tu peux normalement te fier.
- Pour le surplus, nous ne sommes pas responsables en cas de négligence légère.
- Ces règles s'appliquent également à la responsabilité personnelle de nos représentants et de nos auxiliaires d'exécution.
- Tes droits légaux en cas de défauts des produits numériques (§§ 327 et suivants BGB) ne sont pas affectés.

## 13. Durée, résiliation et suppression du compte

- Le contrat d'utilisation de Loqqa est conclu pour une durée indéterminée.
- Tu peux y mettre fin à tout moment en supprimant ton compte dans l'application : dans les réglages sous « Supprimer le compte ». Tu peux aussi demander la suppression par e-mail à support@useloqqa.com.
- Nous pouvons résilier le contrat avec un préavis de quatre semaines si tu n'as pas d'abonnement actif. Un abonnement payant n'est pas affecté jusqu'à la fin de la période payée.
- Le droit des deux parties de résilier sans préavis pour juste motif n'est pas affecté. Pour nous, un juste motif existe notamment en cas de violations graves ou répétées de ces conditions.
- Lorsque ton compte est supprimé, nous supprimons tes données comme décrit dans la Politique de confidentialité. Nous ne pouvons pas restaurer des données supprimées.
- Tu résilies ton abonnement via la boutique (section 6).

## 14. Modifications de ces conditions

Nous pouvons modifier ces conditions, par exemple lorsque nous introduisons de nouvelles fonctionnalités ou que la situation juridique change. Nous te montrons la nouvelle version dans l'application, avec les modifications mises en évidence. Les modifications qui touchent substantiellement tes droits ou tes obligations ne prennent effet à ton égard qu'une fois que tu les as acceptées dans l'application. Jusque-là, tu ne peux utiliser dans l'application que les réglages, l'assistance et la suppression du compte. Si tu n'es pas d'accord, tu peux mettre fin au contrat à tout moment en supprimant ton compte ; tu résilies ton abonnement dans la boutique.

## 15. Dispositions finales

- **Droit applicable :** le droit de la République fédérale d'Allemagne s'applique, à l'exclusion de la Convention des Nations unies sur les contrats de vente internationale de marchandises (CVIM). En tant que consommateur, tu conserves la protection des dispositions impératives du pays dans lequel tu as ta résidence habituelle.
- **Juridiction compétente :** pour les commerçants, les personnes morales de droit public et les patrimoines spéciaux de droit public, les tribunaux de Munich sont compétents. Pour les consommateurs, les tribunaux compétents sont ceux désignés par la loi.
- **Règlement extrajudiciaire des litiges de consommation :** nous n'avons ni l'intention ni l'obligation de participer à une procédure de règlement des litiges devant un organisme de médiation de la consommation.
- **Langue :** ces conditions sont disponibles en allemand, anglais, portugais, coréen, espagnol et français. La version allemande fait foi ; les autres sont des traductions.
- **Dispositions invalides :** si une disposition de ces conditions est invalide, le reste du contrat demeure valable. Les dispositions légales se substituent à la disposition invalide.
$md$, '2026-11-07 10:00:00+00', false),
  ('privacy', 'fr', '1.5', $md$# Politique de confidentialité

Version : 1.5

Dernière mise à jour : 6 novembre 2026

Ceci est une traduction. La version allemande fait foi.

Tu trouveras ici quelles données à caractère personnel nous traitons lorsque tu utilises l'application Loqqa, pourquoi nous le faisons et quels droits tu as. Cette politique repose sur le Règlement général sur la protection des données (RGPD), la loi fédérale allemande sur la protection des données (BDSG) et la loi allemande sur la protection des données dans les télécommunications et les services numériques (TDDDG).

## En bref

- Loqqa enregistre d'abord tes programmes et tes séances sur ton appareil et les synchronise avec ton compte dès que tu es en ligne. Notre base de données se trouve à Francfort-sur-le-Main.
- Les autres utilisateurs ne peuvent voir ni ton profil, ni tes séances, ni tes photos.
- Nous traitons ton poids, ta taille et tes photos du bilan corporel comme des données de santé. Nous ne les traitons qu'avec ton consentement explicite.
- Pour la création de programme, l'importation de tes séances, la saisie vocale, le bilan corporel, le coach et la traduction des messages à l'assistance, nous utilisons un modèle d'IA d'OpenAI. Pour cela, nous transmettons les données nécessaires à OpenAI, qui les traite aux États-Unis.
- Pour améliorer l'application, nous utilisons PostHog afin de mesurer comment elle est utilisée. Les données de santé et les photos ne sont pas envoyées à PostHog. L'application ne contient aucune publicité.
- Tu peux supprimer ton compte dans l'application à tout moment. Cela supprime aussi tes photos et toutes les données de ton compte.

## 1. Qui est responsable ?

Le responsable du traitement de tes données est :

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 München, Allemagne
- E-mail : support@useloqqa.com

Ci-après dénommé « nous ».

## 2. Délégué à la protection des données

Nous n'avons pas désigné de délégué à la protection des données, car nous n'y sommes pas tenus. Pour toute question relative à la protection des données, tu peux nous contacter directement à l'adresse support@useloqqa.com.

## 3. Comment fonctionne Loqqa

Loqqa est une application d'entraînement. Tu peux faire créer un programme d'entraînement ou importer ton programme et tes séances passées depuis une autre application ou un tableur, enregistrer tes séances et ton poids corporel, poser des questions au coach sur ton entraînement et, à partir de 18 ans, faire des bilans corporels avec des photos.

L'application fonctionne en mode « offline first » (d'abord hors ligne) : tes données sont conservées dans une base de données sur ton appareil afin que tu puisses t'entraîner même sans internet. Lorsque tu es connecté et en ligne, l'application synchronise ces données avec ton compte sur nos serveurs. Ainsi, ton programme et ton historique sont sauvegardés et disponibles sur tous tes appareils. Pour les serveurs, nous faisons appel à des prestataires (section 7).

Toutes les données de notre base de données sont rattachées à ton compte. Des règles d'accès techniques garantissent que toi seul peux lire et modifier tes propres données. Loqqa ne comporte aucune fonctionnalité permettant à d'autres utilisateurs de voir ton profil, tes séances ou tes photos.

## 4. Quelles données nous traitons et pourquoi

### 4.1 Configuration sans compte

Tu effectues la configuration sans compte. Pendant la configuration, l'application charge depuis nos serveurs le catalogue d'exercices (noms, instructions, images et vidéos des exercices) et ces textes juridiques. Elle vérifie au démarrage si le catalogue d'exercices a changé, puis toutes les heures. Seules les données de connexion techniquement nécessaires sont générées à cette occasion (section 4.13).

L'application enregistre d'abord tes réponses données pendant la configuration (par exemple prénom, sexe, date de naissance, poids, taille, objectif et programme créé ou importé) uniquement sur ton appareil. Ces informations ne nous sont envoyées que lorsque tu crées un compte (sections 4.3 et 4.4). Exceptions : si tu fais créer un programme, l'application transmet au préalable tes réponses sur l'objectif, la priorité, l'équipement, le nombre de séances par semaine, la durée des séances et l'expérience afin que le programme puisse être créé ; d'un fichier que tu importes, elle transmet des extraits, les noms des exercices et ton programme afin qu'ils puissent être reconnus (les deux : section 4.7). Elle ne transmet un historique d'entraînement importé que lorsque tu crées un compte.

Base juridique : art. 6, paragraphe 1, point b), du RGPD (fourniture de l'application que tu souhaites utiliser).

### 4.2 Ton compte

À la fin de la configuration, tu crées un compte en te connectant avec ton compte Google ou, sur les appareils Apple, ton compte Apple. Il n'y a pas de mot de passe Loqqa. Dans ce cadre, nous traitons :

- les informations que Google ou Apple nous transmet lors de ta connexion, y compris ton adresse e-mail (voir ci-dessous)
- ton prénom, afin que l'application puisse le préremplir après ta connexion sur un nouvel appareil
- des données techniques du compte telles que la date et l'heure de l'inscription et de la dernière connexion, ainsi que des jetons de connexion

Pour te garder connecté, l'application enregistre ta session de connexion sur ton appareil.

**Connexion avec Google :** lorsque tu te connectes avec Google, la connexion Google s'ouvre sur ton appareil. Google nous confirme ensuite ta connexion et nous transmet ton adresse e-mail, ton nom, l'adresse de ta photo de profil Google et un identifiant de ton compte Google. Nous enregistrons ces informations avec ton compte. Google apprend ainsi que tu te connectes à Loqqa. Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande, est responsable du traitement, à titre indépendant, pour la connexion via ton compte Google ; la [Politique de confidentialité de Google](https://policies.google.com/privacy?hl=fr) s'applique.

**Connexion avec Apple** (uniquement sur les appareils Apple) : lorsque tu te connectes avec Apple, la connexion Apple s'ouvre sur ton appareil. Apple nous confirme ensuite ta connexion et nous transmet un identifiant de ton compte Apple et ton adresse e-mail. Tu peux à la place choisir une adresse générée par Apple qui te transfère les e-mails (« Masquer mon adresse e-mail »). Lors de la première connexion, Apple transmet aussi ton nom si tu le partages. Nous enregistrons ces informations avec ton compte. Apple Distribution International Limited, Hollyhill Industrial Estate, Hollyhill, Cork, Irlande, est responsable du traitement, à titre indépendant, pour la connexion via ton compte Apple ; l'[Engagement de confidentialité d'Apple](https://www.apple.com/legal/privacy/fr-ww/) s'applique.

Les comptes ne sont créés qu'à la fin de la configuration. Si la connexion via « Se connecter » sur l'écran d'accueil devait créer un nouveau compte, l'application le supprime immédiatement et t'indique qu'il n'existe pas encore de compte.

Base juridique : art. 6, paragraphe 1, point b), du RGPD.

### 4.3 Profil et planification de l'entraînement

Lorsque tu crées un compte, nous enregistrons comme profil les informations que tu as données pendant la configuration. Tu peux en modifier une partie plus tard dans les réglages et dans ton profil.

- prénom, sexe biologique (« Ne pas préciser » est aussi possible) et date de naissance
- poids corporel, taille et tes unités préférées (métriques ou impériales)
- expérience d'entraînement, objectif d'entraînement, groupes musculaires prioritaires, équipement disponible, nombre de séances par semaine et durée de séance souhaitée
- la langue de ton application, afin que notre assistance puisse te répondre dans ta langue
- facultatif : une photo de profil (l'application l'enregistre sous forme d'image carrée de 512 × 512 pixels) et un court texte « À propos de toi » de 150 caractères maximum

Pourquoi : nous avons besoin de ta date de naissance pour vérifier l'âge minimum (section 16) et les limites d'âge pour le coach et le bilan corporel. Si tu fais créer un programme d'entraînement, un modèle d'IA d'OpenAI le crée à partir de ton objectif d'entraînement, de ta priorité, de ton équipement, du nombre de séances par semaine, de la durée des séances et de ton expérience (section 4.7). Le coach utilise aussi ton objectif, ton expérience, ton équipement, ta priorité et tes unités pour ses réponses (section 4.8). L'application utilise le sexe, l'âge, le poids et la taille pour le bilan corporel (section 4.6). Ta photo de profil et « À propos de toi » ne sont affichés que pour toi dans ton profil.

Base juridique : art. 6, paragraphe 1, point b), du RGPD ; pour le poids corporel et la taille, ton consentement (section 4.4).

### 4.4 Données de santé et ton consentement

Certaines informations peuvent permettre de tirer des conclusions sur ta santé. Nous les traitons donc comme des données concernant la santé (« données de santé ») au sens de l'art. 9 du RGPD :

- **Données corporelles :** ton poids corporel, tes entrées de poids et ta taille (sections 4.3 et 4.5).
- **Bilan corporel :** tes photos du bilan corporel et les valeurs qui en sont déduites, par exemple un pourcentage de masse grasse estimé (section 4.6).

Nous ne traitons ces données qu'avec ton consentement explicite (art. 9, paragraphe 2, point a), en combinaison avec l'art. 6, paragraphe 1, point a), du RGPD) :

- **Données corporelles :** lors de la création de ton compte, tu consens explicitement, par la mention placée directement au-dessus du bouton, à ce que nous traitions tes données corporelles pour adapter ton entraînement. Avant cela, le poids et la taille restent sur ton appareil.
- **Bilan corporel :** avant que l'application envoie tes photos pour évaluation, elle t'informe que les photos et les données corporelles seront transmises à cet effet à OpenAI aux États-Unis. En touchant « Terminé », tu y consens.
- **Coach :** pour ses réponses, le coach utilise aussi tes entrées de poids et les scores corporels de tes bilans, et notre serveur transmet à cette fin tes données d'entraînement et tes données corporelles à OpenAI aux États-Unis (section 4.8). En créant ton compte et en acceptant cette Politique de confidentialité, tu y consens. Nous enregistrons la date et l'heure de ton consentement. Nous ne transmettons ces données que lorsque tu poses une question au coach.

Le bilan corporel et le coach sont facultatifs. Tu peux retirer chacun de tes consentements à tout moment avec effet pour l'avenir (section 12).

### 4.5 Données d'entraînement et poids corporel

Lorsque tu utilises Loqqa, nous enregistrons :

- **Programmes :** nom, nombre de séances par semaine, blocs avec une semaine de décharge, séances dans leur ordre (y compris les séances sans programme), exercices, séries avec valeurs cibles (répétitions ou secondes), répétitions en réserve (RIR) et temps de repos
- **Séances effectuées,** y compris celles que tu importes : début et fin, à quel programme et à quelle semaine du programme elles comptent, exercices, charge et répétitions ou secondes par série, date et heure de chaque série effectuée et records personnels
- **Exercices personnalisés** que tu crées ou qui sont créés lors de l'importation
- **Poids corporel :** les entrées de poids que tu enregistres, une valeur par jour

Pourquoi : pour que tu puisses enregistrer tes séances et ton poids et consulter ton historique, tes records, tes séries par muscle sur la période de ton choix et ton activité. L'application calcule sur ton appareil les suggestions pour tes séries et le nombre de tes séries par muscle. Si tu interroges le coach, il répond à ta question à partir de ces données (section 4.8).

Base juridique : art. 6, paragraphe 1, point b), du RGPD ; pour les entrées de poids, ton consentement (section 4.4).

### 4.6 Bilan corporel

Le bilan corporel est facultatif et n'est disponible qu'à partir de 18 ans. Pour cela, tu prends trois photos avec l'appareil photo : de face, de profil et de dos. L'application recommande de porter pour cela des sous-vêtements ou une tenue de sport près du corps. Ton visage peut être visible sur les photos.

L'application réduit les photos à une largeur maximale de 1080 pixels et les enregistre sur ton appareil. Lorsque tu lances l'évaluation, elle téléverse les photos dans un espace de stockage non public de ton compte. Elles y restent afin que tu puisses aussi les voir sur tes autres appareils. Tu as besoin d'une connexion internet pour l'évaluation.

**Évaluation par un modèle d'IA d'OpenAI :** un modèle d'IA d'OpenAI détermine les valeurs de ton bilan. Pour cela, notre serveur transmet à OpenAI :

- les trois photos de ce bilan et, si elles existent, les photos de ton bilan précédent, afin que le modèle puisse comparer directement les évolutions
- le sexe, l'âge (calculé à partir de ta date de naissance), la taille, le poids et l'expérience d'entraînement figurant dans ton profil
- les valeurs de ton bilan précédent, afin que les valeurs restent comparables d'un bilan à l'autre

Nous ne transmettons ni ton nom, ni ton adresse e-mail, ni l'identifiant de ton compte. OpenAI traite les données aux États-Unis (section 8). Nous avons configuré OpenAI pour qu'il ne conserve pas la requête en vue d'une consultation ultérieure. OpenAI n'utilise pas les données de son API pour entraîner ses modèles et les conserve jusqu'à 30 jours pour détecter les abus ; elles sont ensuite supprimées.

Le modèle vérifie d'abord si les photos peuvent être évaluées, par exemple si elles sont suffisamment lumineuses et si ton corps est visible au moins de la tête aux genoux. Si une photo ne peut pas être évaluée, l'application te demande de la reprendre. Sinon, le modèle fournit des valeurs pour six groupes musculaires (épaules, pectoraux, bras, dos, abdominaux, jambes), un pourcentage de masse grasse estimé et des valeurs pour les proportions et la définition. À partir de ces valeurs, notre serveur calcule le score corporel. Nous enregistrons ces valeurs avec ton bilan.

Avant que notre serveur n'évalue un bilan, il vérifie auprès de RevenueCat si ton compte dispose de Loqqa Pro (section 4.12). Nous consignons chaque évaluation avec sa date, son heure et son résultat. Cela nous permet de limiter le nombre d'évaluations par jour et de garantir que les valeurs enregistrées proviennent d'une évaluation. Nous supprimons ce journal avec ton compte.

Les valeurs sont des estimations approximatives et ne constituent ni une mesure médicale ni un diagnostic.

**Qui a accès :** techniquement, seul l'exploitant de Loqqa, Jan Timo Hünnebeck, peut accéder à l'espace de stockage. Il ne consulte les photos du bilan corporel que si tu le demandes à l'assistance, si cela est nécessaire pour corriger un bug que tu signales, ou si la loi nous y oblige.

Tu peux supprimer des bilans individuels dans l'application. L'application supprime alors les photos sur ton appareil et dans notre stockage. Si ton appareil est hors ligne à ce moment-là, des photos peuvent rester dans notre stockage jusqu'à la suppression de ton compte ; dans ce cas, écris-nous et nous les supprimerons.

Base juridique : ton consentement explicite (section 4.4), y compris pour le transfert vers OpenAI aux États-Unis (art. 49, paragraphe 1, point a), du RGPD, en plus des garanties de la section 8).

### 4.7 Importation, création de programme et exercices par la voix

Tu peux importer tes séances depuis une autre application ou un tableur : sous forme de fichier au format CSV, TSV, Excel ou OpenDocument, par exemple l'export de Hevy ou de Strong. Le fichier peut contenir ton historique d'entraînement, ton programme d'entraînement ou les deux. Veille à ce que le fichier ne contienne aucune donnée d'autres personnes.

**Lecture sur ton appareil :** l'application ouvre le fichier et en lit les lignes sur ton appareil. Pour cela, elle ne transmet pas tout ton historique d'entraînement à notre serveur.

**Reconnaissance par un modèle d'IA d'OpenAI :** pour que l'application comprenne comment ton fichier est structuré et de quels exercices il s'agit, elle transmet à notre serveur, avec la langue de ton application : le nom du fichier et les noms des feuilles, pour chaque feuille la ligne d'en-tête, une sélection de 150 lignes au maximum (du début, du milieu et de la fin) et des informations sur chaque colonne (par exemple le nombre de cellules remplies et les valeurs fréquentes), les noms des exercices de ton historique avec leur nombre de séries et une charge typique, ainsi que les lignes de ton programme si le fichier en contient un. Le serveur les transmet, avec notre catalogue d'exercices, à un modèle d'IA d'OpenAI. Celui-ci reconnaît quelles colonnes contiennent par exemple la date, l'exercice, la charge et les répétitions, associe les noms des exercices à notre catalogue et extrait les séances, les exercices, les séries, les répétitions et les temps de repos de ton programme. Si le fichier ne contient pas de programme, l'application en compose un à partir de tes séances des six dernières semaines ; pour les séances sans nom, le modèle en propose un et ne reçoit pour cela que leurs exercices et le nombre de fois où tu les as effectuées. Nous ne transmettons aucune autre donnée à cette occasion : les requêtes ne contiennent ni ton compte ni ton nom. OpenAI traite les données aux États-Unis (section 8). Nous avons configuré OpenAI pour qu'il ne conserve pas la requête en vue d'une consultation ultérieure. OpenAI n'utilise pas les données de son API pour entraîner ses modèles et les conserve jusqu'à 30 jours pour détecter les abus.

Notre serveur n'enregistre ni ton fichier ni les extraits transmis ; il ne renvoie que le résultat à l'application. Ce que tu reprends à la fin est enregistré : les séances de ton historique en tant que séances effectuées et le programme que tu confirmes (section 4.5). L'application ne reprend pas une seconde fois les séances qui commencent à la même heure qu'une séance de ton compte. L'application crée, comme exercices personnalisés dans ton compte, les exercices que notre catalogue ne connaît pas. Si tu importes ton historique pendant la configuration, il reste sur ton appareil jusqu'à la création de ton compte, puis il est transféré dans ton compte.

**Création de programme par un modèle d'IA d'OpenAI :** si tu fais créer un programme, l'application transmet à notre serveur tes réponses sur l'objectif d'entraînement, les groupes musculaires prioritaires, l'équipement, le nombre de séances par semaine, la durée des séances et l'expérience d'entraînement, ainsi que la langue de ton application. Le serveur les transmet, avec les exercices de notre catalogue qui correspondent à ton équipement, à un modèle d'IA d'OpenAI, qui compose ton programme à partir de ces éléments. Nous ne transmettons à cette occasion ni ton nom, ni ta date de naissance, ni ton sexe, ni ton poids, ni ta taille, et la requête ne contient pas ton compte. Le traitement chez OpenAI est soumis aux mêmes règles que pour l'importation. Notre serveur n'enregistre pas tes réponses ; il ne renvoie que le programme à l'application, où tu peux le modifier.

**Exercices par la voix :** lors de la configuration d'un programme, de la modification d'une séance et de la composition d'une séance libre, tu peux dicter des exercices avec leurs séries et leurs répétitions au lieu de les chercher un par un. La reconnaissance vocale de ton système d'exploitation transforme ce que tu dis en texte : celle d'Apple sur l'iPhone, celle de Google sur les appareils Android. Selon l'appareil, cela se fait sur l'appareil lui-même ou sur les serveurs d'Apple ou de Google ; leurs politiques de confidentialité s'appliquent à ce traitement. Nous ne recevons pas l'enregistrement lui-même. L'application transmet à notre serveur le texte, que tu peux encore modifier avant d'ajouter les exercices, avec la langue de ton application. Le serveur le transmet, avec notre catalogue d'exercices, à un modèle d'IA d'OpenAI, qui reconnaît les exercices avec leurs séries et leurs répétitions. La requête ne contient ni ton compte ni ton nom. Le traitement chez OpenAI est soumis aux mêmes règles que pour l'importation. Notre serveur n'enregistre pas le texte.

**Limites de requêtes :** pour éviter que l'importation, la création de programme et les exercices par la voix ne soient utilisés de façon abusive, nous limitons la fréquence à laquelle ils peuvent être utilisés par réseau et au total par jour. Pour cela, notre serveur enregistre pour chaque requête la date et l'heure, la fonctionnalité concernée, et un hachage de ton adresse IP qu'il génère avec une clé secrète ; nous n'enregistrons pas l'adresse IP elle-même. Nous supprimons les entrées de plus de deux jours à chaque nouvelle requête.

Base juridique : art. 6, paragraphe 1, point b), du RGPD pour l'importation, la création de programme et les exercices par la voix que tu lances, y compris pour le transfert vers OpenAI aux États-Unis. Pour les limites de requêtes, art. 6, paragraphe 1, point f), du RGPD ; notre intérêt légitime est d'empêcher les abus et les coûts inutiles.

### 4.8 Kai · coach IA

Avec Loqqa Pro, tu peux poser à Kai, le coach IA de l'application, des questions sur ton propre entraînement, par exemple « Comment mon poids a-t-il évolué ? ». Le coach répond en quelques phrases, le plus souvent avec un graphique issu de tes données. Il répond aussi à des questions générales d'entraînement, par exemple à quelle fréquence entraîner les jambes ou quel exercice faire si quelque chose fait mal. Si tu le demandes, il peut aussi composer une séance, te montrer l'une de tes séances enregistrées ou proposer de remplacer des exercices dans ton programme ; ton programme ne change qu'une fois que tu le confirmes dans l'application. Il ne pose aucun diagnostic. Kai est une IA, pas une personne. Le coach est facultatif et n'est disponible qu'à partir de 16 ans. Tu as besoin d'une connexion internet pour l'utiliser.

**Réponses par un modèle d'IA d'OpenAI :** l'application transmet à notre serveur ta question, avec la langue de ton application et le fuseau horaire de ton appareil. Le serveur transmet la question à un modèle d'IA d'OpenAI. Si le modèle a besoin de données, il les demande à notre serveur : le serveur calcule les valeurs à partir de tes données enregistrées et transmet les résultats à OpenAI. Le modèle rédige la réponse à partir de ces résultats. À chaque question, notre serveur transmet à OpenAI :

- ta question et les six dernières questions au plus de cette discussion, avec leurs réponses et les données consultées pour celles-ci
- la date du jour, tes unités et la langue de ton application
- l'objectif d'entraînement, l'expérience d'entraînement, l'équipement et les groupes musculaires prioritaires de ton profil, ainsi que le nom et le nombre de séances par semaine de ton programme actif
- les séances de ton programme actif avec leurs exercices et où elles en sont cette semaine (faite, prochaine ou à faire), et les noms de tes autres séances enregistrées
- le nombre de tes séances avec la date de la première et de la dernière, le nombre de tes entrées de poids avec la date de la première, et le nombre de tes bilans corporels
- les exercices que tu as effectués, y compris les exercices personnalisés : nom, façon dont tu les enregistres, dans combien de séances tu les as faits et quand tu les as faits pour la dernière fois

Selon la question, notre serveur transmet aussi ce qu'il calcule à partir de tes données pour y répondre :

- des séances avec date, nom, durée, exercices et séries (charge, répétitions, secondes et RIR)
- des valeurs par séance, par exemple le maximum estimé sur une répétition (1RM), la charge la plus lourde, les répétitions, le temps de maintien, le volume et les records
- tes entrées de poids et une tendance de poids lissée
- les scores corporels de tes bilans, sans photos et sans valeurs individuelles telles que le pourcentage de masse grasse
- des séances, séries, volumes et temps d'entraînement par semaine ou par mois, des pauses d'entraînement et les jours de la semaine de tes séances
- des séries par groupe musculaire et par exercice
- les exercices, séries et objectifs d'une séance enregistrée, lorsque le coach te la montre ou propose une modification
- des exercices du catalogue de l'application, lorsque le coach compose une séance ou propose un remplacement, en commençant par ceux que tu as faits le plus souvent

Nous ne transmettons ni ton nom, ni ton adresse e-mail, ni l'identifiant de ton compte, ni ta date de naissance, ni ton âge, ni ton sexe, ni ta taille, ni ta photo de profil, ni ton texte « À propos de toi », ni tes photos du bilan corporel, ni tes messages à l'assistance. N'écris pas de données d'autres personnes dans tes questions. OpenAI traite les données aux États-Unis (section 8). Nous avons configuré OpenAI pour qu'il ne conserve pas la requête en vue d'une consultation ultérieure. OpenAI n'utilise pas les données de son API pour entraîner ses modèles et les conserve jusqu'à 30 jours pour détecter les abus ; elles sont ensuite supprimées.

Les réponses sont rédigées par un modèle d'IA. Elles peuvent être erronées. Ce sont des informations et des recommandations pour ton entraînement, pas un avis médical ni un diagnostic.

Avant que notre serveur ne réponde à une question, il vérifie ton âge à partir de la date de naissance de ton profil, ton consentement (section 4.4) et, auprès de RevenueCat, si ton compte dispose de Loqqa Pro (section 4.12).

**Questions par la voix :** tu peux aussi dicter ta question. L'application enregistre alors via le microphone jusqu'à ce que tu termines l'enregistrement, pendant deux minutes au maximum, et transmet l'enregistrement, avec la langue de ton application, à notre serveur. Le serveur le transmet à un modèle de reconnaissance vocale d'OpenAI, qui le transforme en texte. Pour que des termes comme « développé couché » soient correctement reconnus, il y joint une courte note sur le sujet (questions à un coach d'entraînement et termes typiques). L'application affiche le texte dans le champ de saisie, où tu peux le modifier ; il ne devient ta question que lorsque tu l'envoies. Nous ne conservons pas ton enregistrement : notre serveur ne fait que le transmettre, et l'application le supprime sur ton appareil dès que le texte est disponible ou que tu supprimes l'enregistrement. N'enregistre pas d'autres personnes. Le traitement chez OpenAI est soumis aux mêmes règles que pour les réponses (États-Unis, pas d'utilisation pour l'entraînement, conservation jusqu'à 30 jours pour détecter les abus). Là aussi, notre serveur vérifie ton âge et si ton compte dispose de Loqqa Pro. Pour éviter que la conversion ne soit utilisée de façon abusive, tu peux l'utiliser au maximum 100 fois en 24 heures. Pour cela, notre serveur enregistre pour chaque conversion la date, l'heure et un hachage de l'identifiant de ton compte, qu'il génère avec une clé secrète ; nous supprimons les entrées de plus de deux jours à chaque nouvelle conversion.

**Ce que nous enregistrons :** nous enregistrons dans notre base de données tes discussions avec les questions, les réponses et les graphiques sous les réponses. L'application les synchronise sur tes appareils afin que tu puisses y voir tes discussions (section 5). Pour chaque question, nous enregistrons en outre un journal que l'application n'affiche pas : la date et l'heure, le statut (par exemple si une réponse a été donnée), le modèle utilisé, le nombre de jetons (unités de texte sur lesquelles OpenAI facture) et la durée, ainsi que les consultations du modèle avec les données consultées. Nous avons besoin de ces consultations pour que le coach puisse répondre aux questions de suivi sur une réponse.

**Limites de questions :** pour éviter que le coach ne soit utilisé de façon abusive et pour éviter des coûts inutiles, tu peux poser au maximum 20 questions en 24 heures et 150 questions en 30 jours. Pour cela, notre serveur compte les journaux.

Tu peux supprimer des discussions dans l'application, y compris plusieurs à la fois. Nous supprimons alors leurs questions, réponses et graphiques ainsi que les données consultées dans leurs journaux. La date et l'heure, le statut, le modèle, les jetons et la durée sont conservés afin que les limites continuent de s'appliquer et que nous puissions suivre les coûts du coach. Pour le reste, nous conservons tes discussions jusqu'à ce que tu les supprimes ou que tu supprimes ton compte. Lorsque tu supprimes ton compte, nous supprimons toutes les discussions et tous les journaux (section 10).

Base juridique : ton consentement explicite (section 4.4), y compris pour le transfert vers OpenAI aux États-Unis (art. 49, paragraphe 1, point a), du RGPD, en plus des garanties de la section 8). Pour la transformation d'une question dictée en texte, art. 6, paragraphe 1, point b), du RGPD, puisque tu la lances, y compris pour le transfert vers OpenAI aux États-Unis. Pour les limites de questions et de conversions et les informations sur la date et l'heure, le statut, le modèle, les jetons et la durée, art. 6, paragraphe 1, point f), du RGPD ; notre intérêt légitime est d'empêcher les abus et les coûts inutiles.

### 4.9 Assistance

Tu peux nous écrire directement dans l'application via « Signaler un bug » et « Proposer une fonctionnalité », ou écrire à support@useloqqa.com. Dans l'application, nous traitons :

- le type de ta demande (bug ou idée), pour les idées l'importance de 1 à 5, tes messages et l'objet (la première ligne de ton premier message)
- jusqu'à cinq captures d'écran par message que tu sélectionnes dans ta photothèque ; l'application les réduit (côté le plus long : 1600 pixels au maximum) et les enregistre au format JPEG
- l'historique de ta demande, par exemple les changements de statut, nos réponses et si tu as rouvert une demande
- l'appareil depuis lequel tu envoies une demande : plateforme (iOS ou Android), version du système d'exploitation, modèle de l'appareil et version de l'application, afin que nous puissions retrouver l'origine des erreurs
- la langue de ton application, afin que nous puissions traduire nos réponses dans ta langue
- la langue détectée de chaque message et ses traductions (voir ci-dessous)

**Traduction par un modèle d'IA d'OpenAI :** pour que nous te comprenions et que tu puisses lire nos réponses dans ta langue, un modèle d'IA d'OpenAI traduit les messages à l'assistance. Pour cela, notre serveur transmet à OpenAI chaque message contenant du texte, avec la langue vers laquelle le traduire : tes messages, pour en détecter la langue et les traduire dans la langue de notre assistance, et nos réponses, pour les traduire dans la langue de ton application. Si tu changes la langue de ton application, nous traduisons nos réponses antérieures dans la nouvelle langue. Nous ne transmettons ni ton nom, ni ton adresse e-mail, ni l'identifiant de ton compte, ni tes captures d'écran. Nous enregistrons les traductions avec les messages ; dans l'application, tu peux afficher l'original à tout moment. OpenAI traite les données aux États-Unis (section 8). Nous avons configuré OpenAI pour qu'il ne conserve pas la requête en vue d'une consultation ultérieure. OpenAI n'utilise pas les données de son API pour entraîner ses modèles et les conserve jusqu'à 30 jours pour détecter les abus ; elles sont ensuite supprimées.

**Messages par la voix :** tu peux aussi dicter ton message. Cela fonctionne comme pour les questions au coach (section 4.8) : l'application enregistre jusqu'à ce que tu termines l'enregistrement, pendant deux minutes au maximum. Notre serveur transmet l'enregistrement, avec une courte note sur le sujet, à un modèle de reconnaissance vocale d'OpenAI. L'application affiche le texte dans le champ de saisie, où tu peux le modifier ; il ne devient ton message que lorsque tu l'envoies. Nous ne conservons pas ton enregistrement. Là aussi, notre serveur vérifie ton âge et si ton compte dispose de Loqqa Pro, et la même limite s'applique.

**Qui voit ta demande :** nous traitons les demandes dans un espace d'assistance interne, dans le navigateur, auquel seul Jan Timo Hünnebeck a accès, avec ses propres identifiants. Pour ta demande, l'espace d'assistance affiche aussi ton adresse e-mail, si tu te connectes avec Apple ou Google, l'identifiant de ton compte, la date de création de ton compte et de ta dernière activité, la langue de ton application et tes demandes antérieures.

L'application enregistre d'abord les captures d'écran sur ton appareil, puis les téléverse en arrière-plan. Tu ne peux pas supprimer toi-même les messages et les demandes, afin que l'historique reste traçable. Ils sont supprimés avec ton compte ; sur demande, nous supprimons aussi plus tôt les demandes closes. Nous conservons les e-mails aussi longtemps que nous en avons besoin pour ta demande.

N'envoie pas de données de santé ni de données d'autres personnes dans les messages et les captures d'écran si elles ne sont pas nécessaires à ta demande. Nous transmettons aussi les messages à OpenAI pour la traduction.

Base juridique : art. 6, paragraphe 1, point b), du RGPD, dans la mesure où ta demande concerne l'utilisation de l'application, par exemple en cas de bugs. Pour les idées et les autres retours, art. 6, paragraphe 1, point f), du RGPD ; notre intérêt légitime est de répondre à ta demande et d'améliorer Loqqa. Cela vaut aussi pour la traduction et le transfert vers OpenAI aux États-Unis (section 8).

### 4.10 Textes juridiques et acceptations

L'application charge la version actuellement en vigueur des Conditions d'utilisation et de cette Politique de confidentialité dans ta langue. Lorsque tu acceptes une version, lors de l'inscription ou plus tard une version modifiée, nous enregistrons la version que tu as acceptée, la date et l'heure (fixées par le serveur), la version de l'application et la plateforme (iOS ou Android). Cela nous permet de prouver quelle version s'applique à toi et de te demander à nouveau ton accord en cas de modifications substantielles.

Base juridique : art. 6, paragraphe 1, point c), en combinaison avec l'art. 7, paragraphe 1, du RGPD (preuve du consentement) et art. 6, paragraphe 1, point f), du RGPD (notre intérêt légitime à pouvoir prouver quelles conditions s'appliquent).

### 4.11 Loqqa Pro : abonnements et achats

Tu achètes Loqqa Pro via l'App Store d'Apple ou via Google Play. Apple ou Google, selon le cas, traite l'achat et le paiement. Ils en sont eux-mêmes responsables et traitent tes données de paiement conformément à leurs propres politiques de confidentialité : [Apple](https://www.apple.com/legal/privacy/fr-ww/) et [Google](https://policies.google.com/privacy?hl=fr). Nous ne recevons aucune donnée de paiement telle que des numéros de carte bancaire.

Pour que nous puissions débloquer Loqqa Pro, nous apprenons via RevenueCat (section 4.12) quel abonnement tu as acheté, si une période d'essai est en cours, quand tu l'as acheté et si l'abonnement est actif. L'application enregistre ce statut sur ton appareil et l'interroge à nouveau au démarrage et à chaque connexion. Nous n'enregistrons pas de données d'achat dans notre propre base de données.

Tu gères et résilies ton abonnement dans les réglages de ton compte de boutique. L'application y renvoie sous « Gérer l'abonnement ».

Base juridique : art. 6, paragraphe 1, point b), du RGPD.

### 4.12 Gestion des abonnements avec RevenueCat

Nous gérons les achats et les abonnements via RevenueCat. Pour notre compte, RevenueCat vérifie les justificatifs d'achat de la boutique et indique à l'application si Loqqa Pro est actif. Avant que notre serveur n'évalue un bilan corporel ou ne réponde à une question au coach, il demande à RevenueCat si ton compte dispose de Loqqa Pro.

Pour que RevenueCat puisse rattacher tes achats à ton compte, nous lui transmettons l'identifiant de ton compte, un identifiant aléatoire sans nom ni adresse e-mail. Si tu achètes avant de créer ton compte, RevenueCat attribue d'abord son propre identifiant aléatoire, puis rattache l'achat à ton compte. RevenueCat traite aussi des informations d'achat et d'abonnement provenant de la boutique (par exemple produit, prix, devise, dates d'achat, de renouvellement et d'expiration, période d'essai et identifiants de transaction) ainsi que des informations techniques telles que la plateforme, le type d'appareil, la version de l'application et l'adresse IP.

RevenueCat envoie en outre à PostHog (section 4.14) des événements relatifs à ton abonnement, par exemple un essai commencé ou converti, les renouvellements et les résiliations, chacun avec le chiffre d'affaires correspondant. Pour cela, l'application communique à RevenueCat ton identifiant PostHog : un identifiant aléatoire avant la création de ton compte, l'identifiant de ton compte ensuite.

- Prestataire : RevenueCat, Inc., 1032 E Brandon Blvd #3003, Brandon, FL 33511, États-Unis, en tant que sous-traitant
- Lieu de stockage : États-Unis (Amazon Web Services) ; pour la garantie, voir la section 8
- Durée de conservation : aussi longtemps que notre contrat avec RevenueCat existe ; nous faisons supprimer les données relatives à ton compte lorsque tu supprimes ton compte, sauf obligations légales contraires

Base juridique : art. 6, paragraphe 1, point b), du RGPD.

### 4.13 Données de connexion techniquement nécessaires

Chaque fois que l'application est connectée à nos serveurs (par exemple lors de la connexion, de la synchronisation, d'un téléversement ou du chargement du catalogue d'exercices et des textes juridiques), des données techniquement nécessaires sont traitées : ton adresse IP, la date et l'heure, l'interface consultée et des informations techniques telles que les codes d'état et, lorsqu'elles sont transmises, des informations sur l'application et le système d'exploitation. Nos hébergeurs consignent ces données pour assurer le fonctionnement et la sécurité. Chez Supabase, les journaux sont supprimés après un jour ; chez PowerSync, dès qu'ils ne sont plus nécessaires au fonctionnement et à la sécurité.

Base juridique : art. 6, paragraphe 1, point f), du RGPD ; notre intérêt légitime est un fonctionnement stable et sûr.

### 4.14 Analyse du produit et rapports d'erreurs avec PostHog

Pour comprendre comment Loqqa est utilisée et pour trouver des bugs, nous utilisons PostHog. Pour cela, l'application envoie :

- **Événements d'utilisation :** les écrans que tu ouvres et certaines étapes, par exemple le début de la configuration, les programmes créés ou importés, les historiques d'entraînement importés (uniquement leur taille, jamais leur contenu), les consultations de l'écran Loqqa Pro, les achats, l'inscription et la connexion, le début, la fin ou l'annulation d'une séance, le fait que tu aies posé une question au coach et s'il a répondu (jamais le texte), l'évaluation d'un bilan corporel (jamais les valeurs), l'enregistrement d'une entrée de poids (jamais le poids), les exercices ajoutés par la voix, les demandes d'évaluation sur la boutique, chacun avec la date, l'heure et des indicateurs tels que le nombre d'exercices ou de séries, la durée ou le code d'erreur
- **Événements d'abonnement :** essais commencés ou convertis, renouvellements et résiliations avec le chiffre d'affaires correspondant, envoyés par RevenueCat (section 4.12)
- **Événements de l'application :** ouverture et fermeture de l'application, version de l'application, type d'appareil, système d'exploitation et langue
- **Rapports d'erreurs :** messages de plantage et d'erreur avec des détails techniques
- **Informations de profil :** après l'inscription, objectif, expérience, nombre de séances par semaine, répartition de l'entraînement (split), équipement, langue, unités, une tranche d'âge (par exemple « 25–34 ») et si tu disposes de Loqqa Pro
- **un identifiant pseudonyme :** avant l'inscription, un identifiant aléatoire que l'application enregistre sur ton appareil, ensuite l'identifiant de ton compte, afin que les événements avant et après l'inscription soient réunis

Ton nom, ton adresse e-mail, ton poids, ta taille, ta date de naissance, les photos et les valeurs du bilan corporel et le texte libre ne sont pas envoyés à PostHog. PostHog n'enregistre pas ton adresse IP, et nous n'utilisons pas d'enregistrements de session. Lorsque tu te déconnectes, l'application réinitialise l'identifiant.

- Prestataire : PostHog, Inc., 2261 Market St. #4008, San Francisco, CA 94114, États-Unis, en tant que sous-traitant
- Lieu de stockage : PostHog Cloud EU (Francfort-sur-le-Main) ; PostHog est certifié au titre du cadre de protection des données UE-États-Unis (EU-US Data Privacy Framework, section 8)
- Durée de conservation : les événements sont supprimés après un an

Base juridique : art. 6, paragraphe 1, point f), du RGPD ; notre intérêt légitime est d'améliorer Loqqa et de corriger des bugs. Tu peux t'y opposer à tout moment (section 11), par exemple par e-mail à support@useloqqa.com ; nous supprimerons alors les données d'analyse relatives à ton compte.

## 5. Stockage sur ton appareil

Pour que Loqqa fonctionne aussi hors ligne, l'application enregistre des données sur ton appareil :

- une base de données locale avec ton profil, tes programmes et tes séances, tes entrées de poids, les valeurs de tes bilans corporels, tes discussions avec le coach, tes demandes à l'assistance et tes acceptations
- les photos du bilan corporel que tu as prises sur cet appareil, et des copies de tes captures d'écran envoyées à l'assistance
- ta session de connexion, tes réponses de la configuration, un historique d'entraînement importé pendant la configuration, jusqu'à ce qu'il soit dans ton compte, ton statut d'abonnement, des réglages tels que la langue de l'application, et des listes de fichiers qui doivent encore être téléversés
- le catalogue d'exercices
- l'identifiant et les événements pas encore envoyés pour PostHog (section 4.14)

À l'exception des données destinées à PostHog, ce stockage est strictement nécessaire aux services que tu souhaites utiliser (§ 25, alinéa 2, n° 2, TDDDG).

Lorsque tu te déconnectes, l'application supprime la base de données locale ainsi que tes photos du bilan corporel et les copies de captures d'écran sur cet appareil, et réinitialise la configuration, le statut d'abonnement, les séances en cours et une importation pas encore transférée. Les modifications non encore synchronisées sont perdues à cette occasion ; l'application t'en avertit au préalable. Les réglages tels que la langue de l'application sont conservés. Lorsque tu supprimes l'application, ton système d'exploitation supprime en général toutes les données de l'application.

Selon les réglages de ton appareil, les fichiers de l'application, y compris les photos du bilan corporel, peuvent être inclus dans les sauvegardes de ton appareil (par exemple avec iCloud ou Google). Apple ou Google, selon le cas, est responsable de ces sauvegardes.

## 6. Autorisations sur ton appareil

Loqqa ne demande une autorisation que lorsque tu utilises une fonctionnalité qui en a besoin :

- **Appareil photo :** pour les photos du bilan corporel et pour ta photo de profil
- **Photos :** pour sélectionner des images pour les captures d'écran destinées à l'assistance et pour ta photo de profil. Pour cela, l'application utilise le sélecteur d'images de ton système d'exploitation et ne reçoit que les images que tu sélectionnes.
- **Fichiers :** pour sélectionner un fichier contenant tes séances via le sélecteur de fichiers de ton système d'exploitation (section 4.7)
- **Microphone :** pour dicter des exercices (section 4.7), des questions au coach (section 4.8) et des messages à l'assistance (section 4.9). L'application n'enregistre que pendant que tu utilises la saisie vocale.
- **Reconnaissance vocale (iPhone) :** pour que la reconnaissance vocale d'Apple puisse transformer les exercices dictés en texte (section 4.7)

Loqqa ne demande pas l'accès à la localisation, aux contacts ou aux applications de santé telles que l'app Santé d'Apple ou Santé Connect, et n'envoie pas de notifications push. Tu peux révoquer les autorisations à tout moment dans les réglages de ton appareil.

## 7. Destinataires et sous-traitants

Nous ne transmettons tes données que si cela est nécessaire aux finalités indiquées, si tu y as consenti ou si la loi nous y oblige. Nos prestataires traitent des données pour notre compte et selon nos instructions (art. 28 du RGPD) :

- **Supabase, Inc.** (base de données, connexion, stockage de fichiers et fonctions serveur) : serveurs à Francfort-sur-le-Main (Amazon Web Services)
- **PowerSync** de Journey Mobile, Inc. (synchronisation entre l'application et la base de données ; pour cela, le service conserve une copie de tes données synchronisées) : serveurs dans l'UE
- **OpenAI Ireland Ltd.**, 117–126 Sheriff Street Upper, Dublin 1, Irlande (création de programmes par IA, reconnaissance des fichiers d'entraînement importés et des exercices dictés, évaluation des photos du bilan corporel, réponses du coach, transformation des questions dictées en texte et traduction des messages à l'assistance, sections 4.6 à 4.9) : traitement aux États-Unis par OpenAI OpCo, LLC
- **RevenueCat, Inc.** (gestion des abonnements, section 4.12)
- **PostHog, Inc.** (analyse du produit et rapports d'erreurs, section 4.14)

Apple et Google reçoivent des données en tant que responsables du traitement indépendants pour les téléchargements d'applications et les achats (section 4.11), ainsi que pour la connexion via leur compte (section 4.2) et pour la reconnaissance vocale de leur système d'exploitation (section 4.7).

Loqqa est exploitée par une seule personne : seul Jan Timo Hünnebeck a accès à tes données, dans la mesure où il en a besoin pour l'exploitation et l'assistance.

Nous ne communiquons des données à des autorités et à des tribunaux que si la loi nous y oblige.

## 8. Transferts vers des pays tiers

Nous stockons ton compte, tes séances et tes photos dans des centres de données de l'UE (Supabase à Francfort-sur-le-Main, PowerSync dans l'UE). Certains de nos prestataires ont leur siège aux États-Unis. Des données peuvent donc aussi être transférées vers les États-Unis, par exemple lors de la maintenance ou de l'assistance assurées par le prestataire. Pour la création de programme, l'importation de tes séances, les exercices et les questions dictés, l'évaluation du bilan corporel, les réponses du coach et la traduction des messages à l'assistance, nous transmettons à chaque requête des données à OpenAI aux États-Unis (sections 4.6 à 4.9), et RevenueCat traite les données d'abonnement aux États-Unis (section 4.12).

Nous fondons ces transferts sur les garanties suivantes :

- **PostHog :** décision d'adéquation de la Commission européenne pour le cadre de protection des données UE-États-Unis, au titre duquel PostHog est certifié (art. 45 du RGPD)
- **Supabase, PowerSync, OpenAI et RevenueCat :** clauses contractuelles types de la Commission européenne (art. 46, paragraphe 2, point c), du RGPD), qui font partie de nos contrats de sous-traitance
- **Bilan corporel et coach :** en outre ton consentement explicite (art. 49, paragraphe 1, point a), du RGPD). Aux États-Unis, des autorités peuvent, dans certaines circonstances, accéder à des données sans que tu disposes à cet égard des mêmes voies de recours que dans l'UE.

Tu peux nous demander une copie des clauses contractuelles types.

## 9. Durée de conservation de tes données

- **Compte, profil, programmes, séances, entrées de poids, bilans corporels, discussions avec le coach, demandes à l'assistance et acceptations :** aussi longtemps que ton compte existe. Tu peux supprimer toi-même au préalable des contenus individuels, par exemple des programmes, des entrées de poids, des bilans corporels ou des discussions avec le coach. Lorsque tu supprimes ton compte, nous les supprimons complètement (section 10). Nous ne supprimons pas automatiquement les comptes qui ne sont plus utilisés ; tu peux demander la suppression à tout moment dans l'application ou par e-mail.
- **Réponses de la configuration sans compte :** uniquement sur ton appareil, jusqu'à ce que tu crées un compte ou que tu supprimes l'application.
- **Données sur ton appareil :** jusqu'à ce que tu te déconnectes ou que tu supprimes l'application (section 5).
- **Journaux serveur :** un jour chez Supabase ; chez PowerSync, aussi longtemps qu'ils sont nécessaires au fonctionnement et à la sécurité (section 4.13).
- **Limites pour l'importation, la création de programme et la saisie vocale :** deux jours (sections 4.7 et 4.8).
- **Enregistrements de questions dictées :** nous ne les conservons pas ; l'application les supprime après la conversion (section 4.8).
- **Journaux du coach :** aussi longtemps que ton compte existe ; nous supprimons les données consultées qu'ils contiennent avec la discussion concernée (section 4.8).
- **Chez OpenAI :** jusqu'à 30 jours (sections 4.6 à 4.9).
- **Données d'analyse chez PostHog :** un an (section 4.14).
- **Données d'abonnement chez RevenueCat :** voir la section 4.12.
- **Sauvegardes :** nous ne créons actuellement aucune sauvegarde de notre base de données et de notre stockage. Si cela change, nous ajouterons ici combien de temps les sauvegardes sont conservées.

## 10. Supprimer ton compte

Tu peux supprimer ton compte dans l'application à tout moment : dans les réglages sous « Supprimer le compte ». Voici alors ce qui se passe :

1. Si tu t'es connecté avec Apple, tu le confirmes une fois de plus auprès d'Apple sur un appareil Apple. Cela met fin à la liaison entre ton compte Apple et Loqqa : notre serveur échange la confirmation avec Apple contre tes clés de connexion et les fait révoquer immédiatement. Rien n'est enregistré à cette occasion.
2. L'application supprime de notre stockage ta photo de profil, tes photos du bilan corporel et tes captures d'écran envoyées à l'assistance.
3. Ton compte est ensuite supprimé. Cela supprime automatiquement toutes les données associées dans notre base de données : profil, programmes, séances, entrées de poids, bilans corporels, discussions avec le coach et leurs journaux, demandes à l'assistance avec tous les messages et tes acceptations enregistrées. La copie chez PowerSync est également supprimée à cette occasion.
4. Enfin, l'application te déconnecte sur cet appareil et supprime les données qui y sont enregistrées.

**Cela ne met pas fin à un abonnement actif.** Résilie-le dans l'App Store ou sur Google Play.

Sur les autres appareils sur lesquels tu étais connecté, des données enregistrées localement peuvent subsister jusqu'à ce que tu t'y déconnectes ou que tu supprimes l'application. Les données d'analyse chez PostHog et les données d'abonnement chez RevenueCat ne sont pas supprimées automatiquement en même temps ; écris-nous si tu veux que nous les fassions supprimer immédiatement, sinon les durées de la section 9 s'appliquent.

Si la suppression ne fonctionne pas, par exemple sans connexion internet, l'application affiche un avis et tu peux réessayer. Tu peux aussi demander la suppression par e-mail à support@useloqqa.com.

## 11. Tes droits

Tu disposes à notre égard des droits suivants :

- **Droit d'accès** aux données que nous traitons à ton sujet (art. 15 du RGPD)
- **Droit de rectification** des données inexactes (art. 16 du RGPD) ; tu peux modifier directement dans l'application de nombreuses informations, nous modifions tout le reste lorsque tu nous écris
- **Droit à l'effacement** de tes données (art. 17 du RGPD) ; tu peux supprimer ton compte directement dans l'application (section 10)
- **Droit à la limitation** du traitement (art. 18 du RGPD)
- **Droit à la portabilité des données** (art. 20 du RGPD) : sur ta demande par e-mail, nous t'envoyons dans un délai d'un mois les données que tu nous as fournies sous forme de fichier JSON.
- **Droit de retirer** les consentements donnés (section 12)

**Droit d'opposition (art. 21 du RGPD) :** si nous traitons des données sur la base de l'art. 6, paragraphe 1, point f), du RGPD (intérêts légitimes), par exemple pour l'analyse du produit avec PostHog, tu peux t'opposer à tout moment à ce traitement pour des raisons tenant à ta situation particulière. Nous ne traiterons alors plus les données, sauf si nous pouvons démontrer des motifs légitimes et impérieux qui prévalent sur tes intérêts, ou si le traitement sert à la constatation, à l'exercice ou à la défense de droits en justice.

Pour toutes les demandes, un e-mail à support@useloqqa.com suffit. Pour que nous puissions identifier ton compte, indique-nous l'adresse e-mail que l'application affiche dans ses réglages.

## 12. Retirer tes consentements

Tu peux retirer un consentement à tout moment avec effet pour l'avenir (art. 7, paragraphe 3, du RGPD). Le traitement effectué avant le retrait demeure licite.

- **Données corporelles :** par e-mail à support@useloqqa.com. Nous supprimerons alors ton poids, ta taille et tes entrées de poids. Sans ces informations, l'application ne peut adapter ton entraînement que de façon limitée ; tu peux aussi, à la place, supprimer ton compte (section 10).
- **Bilan corporel :** supprime tes bilans dans l'application et n'en fais plus de nouveaux, ou écris-nous ; nous supprimerons alors toutes les photos et valeurs du bilan corporel.
- **Coach :** par e-mail à support@useloqqa.com. Nous enregistrerons alors ton retrait. Pour le coach, nous ne transmettons des données à OpenAI que lorsque tu lui poses une question ; ne pose donc plus de questions après le retrait : une nouvelle question vaut nouveau consentement. Tu peux supprimer tes discussions antérieures dans l'application, ou nous écrire ; nous les supprimerons alors.

## 13. Réclamation auprès d'une autorité de contrôle

Tu peux introduire une réclamation auprès d'une autorité de contrôle de la protection des données (art. 77 du RGPD), en particulier dans l'État membre de l'UE dans lequel tu vis ou travailles ou dans lequel la violation présumée a eu lieu. L'autorité compétente pour nous est le Bayerisches Landesamt für Datenschutzaufsicht (autorité bavaroise de contrôle de la protection des données), Promenade 18, 91522 Ansbach, Allemagne, [www.lda.bayern.de](https://www.lda.bayern.de).

## 14. Es-tu obligé de nous fournir des données ?

Pour un compte, nous avons besoin de ton compte Google ou de ton compte Apple. Sans compte, tu ne peux pas utiliser Loqqa après la configuration. L'application a besoin des informations de la configuration pour vérifier ton âge ainsi que pour créer et adapter ton programme. Ton sexe (tu peux choisir « Ne pas préciser »), le bilan corporel, le coach, les entrées de poids, une photo de profil et le texte « À propos de toi » sont notamment facultatifs.

## 15. Pas de décisions automatisées

L'application crée automatiquement des programmes, des suggestions, des analyses comme tes séries par muscle, des valeurs de bilan corporel et les réponses du coach ; les programmes que tu fais créer, les valeurs du bilan corporel et les réponses du coach proviennent d'un modèle d'IA d'OpenAI (sections 4.6 à 4.8). Ce sont des informations, des recommandations et des estimations pour ton entraînement. Les réponses du coach peuvent être erronées et ne constituent pas un avis médical. Nous ne prenons aucune décision qui produise des effets juridiques te concernant ou t'affecte de manière significative de façon similaire (art. 22 du RGPD).

## 16. Enfants et adolescents

Loqqa s'adresse aux personnes qui ont atteint l'âge auquel elles peuvent consentir elles-mêmes au traitement de leurs données dans leur pays : en Allemagne à partir de 16 ans, dans les autres pays, entre 13 et 16 ans selon le droit local. Lors de la configuration, l'application te demande ta date de naissance et ne te laisse continuer qu'à partir de cet âge ; le pays défini sur ton appareil est déterminant. Le coach n'est disponible qu'à partir de 16 ans, même dans les pays où l'âge minimum est inférieur. Le bilan corporel n'est disponible qu'à partir de 18 ans. Notre serveur vérifie les deux à partir de la date de naissance de ton profil.

Si nous apprenons qu'un compte appartient à une personne n'ayant pas atteint l'âge minimum, nous le supprimerons.

## 17. Sécurité

Nous protégeons tes données par des mesures techniques et organisationnelles, notamment :

- une transmission chiffrée entre l'application et les serveurs (HTTPS/TLS)
- des règles d'accès dans la base de données par lesquelles chaque compte ne peut lire et modifier que ses propres données
- des espaces de stockage non publics pour les photos de profil, les photos du bilan corporel et les captures d'écran, dans lesquels chaque compte ne peut accéder qu'à son propre dossier
- des liens à durée limitée pour l'affichage des photos : une heure pour les photos du bilan corporel et les captures d'écran, 24 heures pour les photos de profil
- la connexion via Google ou Apple, de sorte que nous n'enregistrons aucun mot de passe

Aucun système n'est totalement sûr. Comme l'application enregistre des données sur ton appareil, protège ton appareil par un verrouillage d'écran.

## 18. Modifications de cette Politique de confidentialité

Nous adaptons cette Politique de confidentialité lorsque l'application ou la situation juridique change. Tu trouves la version actuellement en vigueur dans l'application, dans les réglages, et sur [useloqqa.com](https://useloqqa.com). Nous t'informerons des modifications substantielles dans l'application et, si nécessaire, nous te demanderons ton consentement.
$md$, '2026-11-07 10:00:00+00', false);
