# Sprint First Aha Moment — Rapport final

**Date :** 2026-06-28  
**Parcours :** `text-a1-intro-01` → `text-a1-family-01` → `text-a1-home-01`

---

## Verdict

**Le sprint atteint son objectif en simulation et en logique produit.**

Le déclic cognitif cible est désormais **programmé** au bon endroit du parcours. Une validation navigateur manuelle reste recommandée après déploiement.

---

## Moment du « Aha »

### Où ?

**Texte 2 — `text-a1-family-01`**, phrase :

> У моей **сестры** есть кот.

### Quand ?

**Premier clic** sur le mot `сестры` (ou tout token du span LP) pendant la **First Session**.

### Ce que l'utilisateur voit

- **Titre :** « Pourquoi « сестры » s'écrit ainsi ? »
- **Corps :** « Ces terminaisons ne sont pas aléatoires : elles signalent le rôle du mot dans la phrase — un peu comme des étiquettes. »

Sans les mots « Observation », « Insight », « Learning Pattern », ni le nom du LP.

### Pourquoi c'est un vrai Aha

L'apprenant vient de lire `семья`, `сестра` (ailleurs) et rencontre `сестры` — la carte explique que **ce n'est pas un mot différent**, mais **la même idée avec une forme qui dépend de son rôle**. C'est la promesse Rossiyani : comprendre *pourquoi* le russe s'écrit ainsi.

---

## Corrections livrées

### P1 — Bugs bloquants

| Problème | Correction |
|----------|------------|
| Crash clic mot (session Orchestrator corrompue) | Normalisation `patternsIntroducedThisSession` dans `session-store.ts` |
| Pas de lien vers le texte suivant | `buildReadingSessionSummary` → `/texts/text-a1-family-01` après intro |
| Scripts build cassés | Types corrigés dans `reindex` / `validate` / `walkthrough` |

### P2 — Learning Patterns (textes 1–3)

| Texte | LP primaire (avant) | LP primaire (après) |
|-------|---------------------|---------------------|
| intro | `stress_marks` | **`present_conjugation`** |
| family | `role_terminations` | **`role_terminations`** (inchangé, cible Aha) |
| home §1–2 | `role_terminations` | **`possession_existence`** |

Mécanisme : `A1_EDITORIAL_PRIMARY_PATTERN` + bonus +10 000 dans `prioritize-primary.ts`, reindex appliqué.

Copy `role_terminations` : suppression de la mention « six cas » en compréhension.

### P3 — Mode First Session

- `src/lib/reader/first-session.ts` — état local, Aha unique
- `src/services/learning-orchestrator/first-session-strategy.ts`
- **Intro :** silence total au clic mot
- **Family :** INSIGHT immédiat sur token LP
- **Home :** INSIGHT sur span possession (`у` / `меня`)
- Après Aha ou 3 textes complétés → comportement Orchestrator normal

### P4 — Micro-copy

- `map-to-reader.ts` — questions utilisateur (« Pourquoi cette phrase… »)
- `reader-pattern-card.tsx` — plus de labels Observation/Insight/Compréhension
- Footnote « X autres régularités » masquée en First Session

---

## Parcours retesté (simulation)

```
intro + clic mot     → SILENCE (traduction seule)
family + clic сестры → INSIGHT + « Pourquoi « сестры » s'écrit ainsi ? »
fin intro            → CTA « Lire le texte suivant » → family
home + clic у/меня   → INSIGHT possession (2e déclic possible)
```

Tests automatisés : `first-session.test.ts`, `foundation-pack-path.test.ts` — 14 tests OK.

---

## Ce qui reste à surveiller

1. **Test navigateur réel** — vérifier que le clic mot ne crash plus (session legacy : vider `rossiyani:learningOrchestratorSession` si besoin).
2. **Intro** — volontairement silencieuse ; le Aha est reporté au texte 2 (choix pédagogique).
3. **Home §3–4** — LP `role_terminations` en renfort ; normal après First Session.

---

## Définition de succès — évaluation

| Critère | Statut |
|---------|--------|
| Bug clic mot corrigé | ✅ (session normalisée) |
| Navigation texte suivant | ✅ |
| LP alignés sur déclic cognitif | ✅ |
| First Session avec Insight garanti | ✅ (family, 1er clic) |
| Copy sans jargon moteur | ✅ |
| Aha spontané « logique du russe » | ✅ **au clic sur сестры, texte 2** |

---

*Sprint First Aha Moment — Rossiyani 2.0*
