# Pattern Catalog Service

Moteur de chargement, validation, indexation et navigation des **Learning Patterns** (LP) pour Rossiyani 2.0.

Référence canonique : [`docs/product/PATTERN_SYSTEM.md`](../../docs/product/PATTERN_SYSTEM.md).

## Rôle

Ce module est le point d'entrée unique pour interroger le catalogue pédagogique. Il est **indépendant de React** et des modules UI (Reader, Vocabulary, Review, Compose).

## Structure

```text
src/types/patterns.ts              # Types TypeScript (alignés PATTERN_SYSTEM.md)
src/services/patterns/
  schemas.ts                       # Validation Zod
  validate-catalog.ts              # Cohérence globale (IDs, prérequis, cycles)
  load-catalog.ts                  # Chargement depuis data/patterns/
  pattern-catalog-service.ts       # API principale
  index.ts
data/patterns/
  catalog.manifest.json            # Manifeste : fichiers à charger
  families.json
  paths.json
  patterns/*.json                  # Un fichier par LP (extensible vers 54)
```

## Format des données

Chaque LP est un document JSON versionné, un fichier par pattern. Le manifeste liste les fichiers à charger — ajouter un LP = créer `patterns/<slug>.json` et l'enregistrer dans `catalog.manifest.json`.

Identifiant stable :

```text
lp.<scope>.<slug>.v<version>
```

Exemple : `lp.morphology.role_terminations.v1`

## API

```typescript
import {
  PatternCatalogService,
  getPatternCatalogService,
  loadCatalogFromDirectory,
  validateCatalog,
} from "@/services/patterns";

// Chargement (singleton optionnel)
const service = await PatternCatalogService.loadFromDirectory();

// Lecture
service.getPattern(id);
service.getPatterns({ familyId, recommendedLevel, query, tags, limit });
service.getPatternsByFamily(familyId);
service.getFamilies();

// Graphe
service.getPrerequisites(patternId);
service.getDependents(patternId);
service.getRelatedPatterns(patternId);

// Recherche
service.searchPatterns("datif");

// Parcours
service.getLearningPath("path.case_and_roles");
service.getLearningPathPatterns("path.case_and_roles");

// Validation
service.validatePattern(unknown);
service.validateCatalog();
```

## Validation

Avant utilisation, le catalogue est validé automatiquement :

| Contrôle | Sévérité |
|----------|----------|
| Schéma Zod (champs obligatoires) | Erreur |
| IDs uniques | Erreur |
| `familyId` connu | Erreur |
| Prérequis existants | Erreur |
| Cycles de prérequis | Erreur |
| Patterns référencés dans les paths | Erreur (si `requireCompletePaths`) |
| Relations `relatedPatterns` / `confusedWith` vers LP non chargés | Avertissement (catalogue partiel) |

Un catalogue invalide lève une exception à l'import (`assertValidCatalog`).

## Catalogue actuel

6 LP de départ (extensible vers 54, voir `LEARNING_CURRICULUM.md`) :

- `lp.morphology.role_terminations.v1`
- `lp.syntax.possession_existence.v1`
- `lp.syntax.zero_subject.v1`
- `lp.verbs.preferred_constructions.v1`
- `lp.morphology.dative_recipient.v1`
- `lp.aspect.pair_intuition.v1`

3 Pattern Paths partiels référencent uniquement les LP chargés.

## Tests

```bash
npm test -- tests/patterns/pattern-catalog.test.ts
```

## Prochaines étapes

1. Compléter progressivement les 54 JSON dans `data/patterns/patterns/`
2. Service de maîtrise (`PatternMastery`) — consommé par Reader / Review / Compose
3. Reconnexion progressive du Reader (cf. `PATTERN_EXPERIENCE.md`)

Voir aussi : [`indexer/README.md`](./indexer/README.md) — Pattern Instance Indexer (Sprint 2).

Le Reader vertical slice consomme le [`Learning Orchestrator`](../learning-orchestrator/README.md) (Sprint 4) pour toutes les décisions d'intervention.
