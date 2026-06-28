# Pattern Instance Indexer

Relie automatiquement chaque phrase analysée aux **Learning Patterns** du catalogue.

Référence : [`docs/product/PATTERN_SYSTEM.md`](../../../docs/product/PATTERN_SYSTEM.md) §4 (Détection), §7.4 (Stockage).

## Rôle

À partir d'une `SentenceAnalysisOutput` existante (import) :

1. Exécute les `detectionRules` du catalogue + mapping `knowledgeConceptKeys`
2. Fusionne les candidats par `patternId`
3. Sélectionne **un LP primaire** (algorithme stable, documenté)
4. Persiste les `PatternInstance` en base

Aucune UI. Indépendant de Reader / Vocabulary / Review / Compose.

## Structure

```text
src/types/pattern-instances.ts
src/services/patterns/indexer/
  pattern-instance-indexer.ts    # API principale
  detect-patterns.ts             # Orchestration détection
  detectors/rule-handlers.ts     # Règles heuristiques
  prioritize-primary.ts          # Sélection LP primaire
  extract-knowledge-context.ts   # Concepts depuis l'analyse
  resolve-indexer-knowledge-context.ts  # Liens KG (occurrences)
  persist-pattern-instances.ts   # Prisma
src/pipeline/stages/pattern-index-stage.ts
```

## API

```typescript
import {
  indexPatternInstances,
  persistPatternInstances,
  getPatternCatalogService,
} from "@/services/patterns";

const catalog = await getPatternCatalogService();
const index = indexPatternInstances({
  sentenceId,
  textId,
  analysis,           // SentenceAnalysisOutput existante
  catalog,
  knowledgeContext,   // optionnel — enrichi depuis le KG
});

await persistPatternInstances(index);
// → index.primaryPatternId, index.instances, index.secondaryPatternIds
```

## Algorithme de priorisation (import, sans état apprenant)

Ordre de préférence pour le LP **primaire** :

1. **Introduction éditoriale** — `introductionConditions.editorialTextIds` contient le `textId`
2. **Score de détection** — somme pondérée des règles (`detectionRules.weight`)
3. **Fréquence catalogue** — `core` > `frequent` > …
4. **Localité** — span plus petit préféré (LP « local » avant LP global)
5. **Niveau recommandé** — tie-breaker

Un seul `isPrimary: true` par phrase. Les autres LP détectés restent en `secondaryPatternIds`.

## Règles de détection implémentées

| Clé `detectionRules.rule` | LP cible |
|---------------------------|----------|
| `noun_ending_variation_same_lemma` | Terminaisons selon le rôle |
| `u_genitive_existence` | Possession / existence |
| `finite_verb_without_explicit_subject` | Pro-drop |
| `dative_noun_after_transfer_verb` | Datif destinataire |
| `verb_governed_case_mismatch` | Constructions verbales favorites |
| `aspect_pair_same_stem` | Paire aspectuelle |

+ **concept_mapping** : intersection `knowledgeConceptKeys` ↔ concepts dérivés de l'analyse.

## Intégration import

Appelé automatiquement après `runKnowledgeGraphStage` dans `enrich-text-import.ts` (stage `pattern-index`).

Point d'entrée backfill manuel :

```typescript
import { runPatternIndexStage } from "@/pipeline/stages";
```

## Schéma Prisma

- `PatternInstance` — une ligne par `(sentenceId, patternId)`
- `Sentence.primaryPatternId` / `Sentence.patternIndexedAt`

Migration : `npx prisma migrate dev --name pattern_instances`

## Tests

```bash
npm test -- tests/patterns/pattern-instance-indexer.test.ts
```

## Prochaine étape

Service de **maîtrise** (`PatternMastery`) — le Reader consommera `primaryPatternId` + profondeur L1–L5 par utilisateur.
