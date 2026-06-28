# Learning Orchestrator

Chef d'orchestre pédagogique de Rossiyani 2.0 — décide **quand**, **pourquoi** et **combien** intervenir.

Référence : [`docs/product/PATTERN_EXPERIENCE.md`](../../../docs/product/PATTERN_EXPERIENCE.md)

## Rôle

Ce service ne rédige pas de contenu. Il produit une **décision explicite** pour chaque interaction :

| Action | Signification |
|--------|---------------|
| `SILENCE` | Aucune intervention — le texte reste souverain |
| `OBSERVATION` | L1 seulement (première exploration) |
| `REMINDER` | Rappel discret + L1 |
| `INSIGHT` | L1 + L2 + L3 |
| `DEFER` | Reporter — message doux, pas de leçon |

Chaque décision inclut `reasons[]` (code + message + poids).

## Entrées

```typescript
import { decidePedagogicalIntervention } from "@/services/learning-orchestrator";

const decision = decidePedagogicalIntervention({
  interaction: "explore_word", // reading | explore_word | explore_sentence
  sentence: { sentenceId, textId, textTitle, wordPosition, isFirstReadOfText },
  primaryPattern: { patternId, pattern, instance },
  secondaryPatternIds: ["lp.other.v1"],
  encounter: getPatternEncounter(patternId),
  session: getOrchestratorSession(),
  preferences: { immersiveReading: false },
});
```

## Contraintes (PATTERN_EXPERIENCE)

- Lecture → toujours `SILENCE`
- Une idée importante à la fois → LP secondaires dans `deferredPatternIds`
- Familiarité avant nouveauté → max 1 nouveau LP / session ; délai entre introductions
- Session : ≤ 2 insights, ≤ 1 L3 nouvelle
- Première lecture d'un texte → `DEFER`
- Session courte (< 5 min) → `DEFER` sur première exploration
- Mode immersif → `SILENCE`

## Session locale

`getOrchestratorSession()` / `recordOrchestratorOutcome()` — budget session en localStorage (`rossiyani:learningOrchestratorSession`).

Sans Pattern Mastery ; remplacé plus tard par un store serveur.

## Intégration Reader

Le vertical slice Reader consomme l'orchestrateur via :

- `buildOrchestratorInputFromReader()` — pont depuis `ReaderTextData`
- `mapDecisionToReaderExperience()` — vue `ReaderPatternCard`
- `useReaderPatternExperience` — hook client (aucune règle métier)

## Tests

```bash
npm test -- tests/learning-orchestrator/
```

## Prochaines étapes

- Pattern Mastery alimentera `encounter` et `session`
- Review, Compose, Home appelleront `decidePedagogicalIntervention` au lieu de règles locales
