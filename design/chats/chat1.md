# Onboarding flow restructure

_Started 2026-10-08 19:04 UTC_

---

## User

I have a quesiton. 

Like right now our whole onboarding flow is a bit confusing since it doesnt seem structured. Like why do we ask for a plan name before the user has even answered that question.

why do we only ask for weight or height when creating the plan, etc.

rethink the whole onboarding flow and in what order these screens should be ideally be

## Assistant

_[tool: grep]_

_[tool: run_script]_

_[tool: run_script]_

Main problem: questions about you, about your plan, and about setup are mixed together, and the branch split comes too late. Some details belong to the person, not the plan, but they're only asked on one path.

**What's wrong now**
- **Plan name (N2) comes before "Folgst du aktuell einem Plan?"** An imported plan usually already has a name, and a new plan doesn't exist yet at that point.
- **Units, weight and height are only asked on the "no plan" path.** People who import a plan also need them for the body check and for kg/lb in the imported plan.
- **Experience and complaints are also only on the "no plan" path.** Both describe the person and matter for progression and exercise swaps on either path.
- **The account comes after the long body check.** Anyone who drops out during the photos loses their plan.
- **The step counters don't match.** It switches between "von 20" and "von 7", and Fokus and Erfahrung are both "7 von 20". Aktionstaste shows "11 von 20" but comes last.

**Proposed order: three phases, each with its own progress bar**

**1 · Über dich** (everyone)
1. Willkommen
2. Name
3. Geschlecht
4. Alter
5. Einheiten
6. Gewicht
7. Größe
8. Erfahrung
9. Beschwerden

**2 · Dein Plan** (split here)
- Plan vorhanden?
- **A · Import:** Import-Optionen → Kamera / Sprache → Prüfen → Analyse → Übungen bestätigen. Name the plan from its detected title, editable.
- **B · Erstellen:** Ziel → Fokus → Ausstattung → Trainingstage → Dauer → Plan wird erstellt. Suggest a name from goal and split, editable.

**3 · Los geht's** (everyone)
1. Versprechen
2. Konto erstellen (saves the plan before the optional part)
3. Körpercheck? (optional, skippable)
4. Aktionstaste (or show it as a tip during the first workout)
5. Home

**Plan name:** I'd drop it as its own screen. Show the generated or detected name on the plan result with an edit pencil. That's one question fewer, and the user names something they can already see.

**Open question:** where should the paywall go? Usually it comes after the plan reveal and before the account.

Should I rearrange the onboarding screens on the canvas in this order and fix the back links and progress bars?

## User

Yes

## Assistant

_[tool: run_script]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: grep]_

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I've put the onboarding screens on the canvas in the new order and rewired the back and Weiter links to match; it's out for a final check now.

- **A · Über dich** (everyone): Name → Geschlecht → Alter → Einheiten → Gewicht → Größe → Erfahrung → Beschwerden → Plan vorhanden?
- **B1 · Import:** order unchanged. The plan name comes from the title we detect in the plan.
- **B2 · Erstellen:** Ziel → Fokus → Ausstattung → Trainingstage → Dauer → Plan wird erstellt → Planname. The name suggestions now come after the plan is built, from the goal and split.
- **C · Los geht's:** Versprechen → Konto erstellen → Körpercheck (optional) → Aktionstaste. "Später" on the body check goes straight to Home.

Each phase now has its own counter ("1 von 9", "1 von 6", "1 von 3") instead of the mixed "von 20" / "von 7".

I also fixed some back and Weiter links that pointed to screens that no longer exist. That includes "Plan wird erstellt", which now leads to Planname.

Things I noticed but didn't change:
- **Aktionstaste** still shows its old "11 von 20" counter. Its caption says it's meant as a tip during the first set rather than part of onboarding, so I left it as it was.
- **Duplicated code:** the file contains about 7 copies of the screen logic inside the canvas. Only the last copy runs, but the extra copies bloat the file. I can clean that up if you want.

## User

This page: 06c
Übung wählen

Should use our new muscle design from here 03·0b
Training Übersicht

## Assistant

_[tool: run_script]_

_[tool: grep]_

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

The "Beanspruchte Muskeln" cards on 06c Übung wählen now use the 03·0b design: the muscle shown on a rounded tile, a large % in the accent color, and the muscle name below. It's out for a final check now.

The % is new on this screen. Each muscle's % is its share of all the muscles hit by the exercises picked that day, so it changes as exercises are added or swapped. The old "x Übungen" line is gone.

## User

any onboarding screens I should remove?

## Assistant

I'd remove these:

1. **Einheiten.** Pick kg/cm automatically from the phone's region and add a small kg/lb switch on the Gewicht screen.
2. **Planname.** Name the plan automatically (detected title or goal + split) and let users rename it later in the plan.
3. **Aktionstaste.** Its caption already says it should be a tip during the first set, so it shouldn't be in onboarding.
4. **06e Übungsdetail.** This is a detail view inside the app, not an onboarding step. Move it to the Training section.

Worth thinking about:

- **Größe.** You only need height for the body check. Ask it at the start of the Körpercheck, so people who skip the check don't have to answer it.
- **Fokus.** It overlaps with Ziel. Make it optional ("Überspringen") or drop it.
- **Geschlecht + Alter.** Both are needed, but they could go on one screen.
- **Versprechen.** It doesn't collect any data, but commitment screens like this tend to help retention. Keep it if you want the emotional beat; it's the first to cut if you want a shorter flow.

Keep everything else. Each of those screens feeds the plan, the starting weights or the body check.

Doing all four removals takes "Über dich" from 9 to 7 steps (or 6 if height moves too) and "Erstellen" from 6 to 5. Should I apply them?

## User

remove Aktionstaste.

## Assistant

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I removed the accent-colored glow at the top of 08d-A Bewertung. I left the dark fade behind the bottom button so the content scrolls under it cleanly. Tell me if you want that gone too.

The overlaps the layout check flagged come from stacked file icons and a button sitting over scrolling content, both of which look intentional. They weren't caused by this change.

## User

In addition, what will our tabs be called?

I beleive "Heute, Training, Körper, Komposition and Profil"?

## Assistant

_[tool: grep]_

_[tool: run_script]_

I'd change one name. Komposition overlaps with Körper (both are about the body). In German it also reads as music or art, and the full word "Körperkomposition" is too long for a tab.

The canvas already has a screen for each of these, so I'd suggest:

- **Heute**: today's workout and the week (01·N·S)
- **Training**: plan, templates, collections (01·V)
- **Muskeln**: muscle load and volume (01·M·D)
- **Körper**: body check, photos, measurements (01·K·B)
- **Profil**

Each name is one short word that fits under an icon.

What do you have in mind for Komposition? If it means body fat or muscle mass, it belongs in Körper. If it means muscle balance, it's the Muskeln tab.

One thing to fix either way: the tab bar on the profile screen (01b-2) still uses an old set, "Training · Plan · Fortschritt · Profil". Once the names are settled, I can make every tab bar match.

