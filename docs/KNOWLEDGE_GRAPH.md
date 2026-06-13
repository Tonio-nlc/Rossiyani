# KnowledgeGraph — Architecture

Évolution de la LinguisticLibrary vers un **référentiel pédagogique cumulatif**.

Complète `docs/LINGUISTIC_LIBRARY.md` sans modifier l'architecture `components → features → services → lib`.

---

## 1. Philosophie

| Avant | Après |
|-------|-------|
| Chaque texte = analyses isolées | Chaque import **enrichit** le graphe |
| Explications dupliquées par phrase | Explications **canonisables** |
| Coût IA constant | Coût IA **décroissant** (cache + réutilisation) |
| Reader = affichage texte | Reader = **visualisation** d'une base linguistique |

Les occurrences de phrase (`Word`, `PhraseGroup`) restent des **exemples** attachés au graphe.

---

## 2. Couches

```text
Import
  → KnowledgeLookupService (cache phrase)
  → AIProvider (si miss)
  → LinguisticLibraryIndexer (KnowledgeLemma/Form/Ending/Phrase/Sentence)
  → persistSentenceAnalysis (Text/Sentence/Word/PhraseGroup)
  → KnowledgeGraph.mergeOccurrence (occurrences + concepts)
```

| Couche | Tables / services | Rôle |
|--------|-------------------|------|
| **Instances texte** | `Word`, `PhraseGroup` | Occurrence dans un texte donné |
| **Bibliothèque** | `Knowledge*` (lookup) | Formes connues, cache phrase |
| **Graphe** | `KnowledgeConcept`, `KnowledgeOccurrence`, … | Pédagogie canonique cumulée |

---

## 3. Modèle de graphe

```text
KnowledgeLemma
    ↓ forms
KnowledgeForm
    ↓ endings (via ending + case)
KnowledgeEnding
    ↓ cases
KnowledgeCase ↔ KnowledgeConcept (GRAMMATICAL_CASE)
    ↓
KnowledgePhrase (+ KnowledgePhraseOccurrence)
    ↓
KnowledgeConcept (patterns, constructions, sémantique)
    ↓
KnowledgeOccurrence → example sentences, textes sources
```

### KnowledgeConcept

Entité pédagogique **indépendante d'un mot** :

- `Prepositional case` → `GRAMMATICAL_CASE`
- `в + prepositional` → `PREPOSITION_PATTERN`
- `мне кажется` → `CONSTRUCTION` / `SEMANTIC`

Champs extensibles : `frenchComparison`, `commonMistakesJson`, `reviewStatus`.

### Occurrences

`KnowledgeOccurrence` : une forme dans une phrase, liée à un texte source.

`KnowledgePhraseOccurrence` : une collocation/construction dans une phrase.

Clé unique : `(formId, sentenceKey, wordPosition)` — pas de doublon sur ré-import de la même phrase.

---

## 4. Services

Emplacement : `src/services/knowledge-graph/`

| Service | Fichier |
|---------|---------|
| Facade | `knowledge-graph-service.ts` |
| Merge import | `merge-occurrence.ts` |
| Concepts | `concept-resolver.ts` |
| Graphe lemme | `get-lemma-graph.ts` |
| Graphe terminaison | `get-ending-graph.ts` |
| Graphe cas | `get-case-graph.ts` |
| Graphe phrase | `get-phrase-graph.ts` |
| Graphe concept | `get-concept-graph.ts` |
| Admin (futur) | `admin/knowledge-review-service.ts` |

### Features Reader (sans UI)

`src/features/knowledge/` :

- `getLemmaKnowledge()`
- `getEndingKnowledge()`
- `getConceptKnowledge()`
- `getPhraseKnowledge()`

---

## 5. Stratégie de merge

### Exemple

Import 1 : `Я живу в городке.`
Import 2 : `Он работает в городке.`

Résultat cumulatif pour `городок` / `городке` :

| Métrique | Comportement |
|----------|--------------|
| `KnowledgeForm.hitCount` | +1 à chaque indexation |
| `KnowledgeForm.occurrenceCount` | +1 par phrase distincte |
| `KnowledgeLemma.occurrenceCount` | recalculé depuis occurrences |
| `KnowledgeOccurrence` | 2 lignes (2 phrases) |
| `KnowledgeConcept` `в_prepositional` | hitCount++, liens lemme |
| Exemples | 2 phrases dans `getLemmaGraph().exampleSentences` |

### Ré-import même phrase

- `KnowledgeSentence` cache → skip IA
- `mergeOccurrence` → occurrence existante **ignorée** (pas de doublon)

---

## 6. Admin Review (préparé)

`KnowledgeReviewService` :

- `promoteCanonical()` — promouvoir une explication
- `rejectAnalysis()` — marquer REJECTED
- `listPendingReview()` — file d'attente
- `mergeDuplicateConcepts()` — fusion concepts

Pas d'UI dans ce sprint.

---

## 7. Évolution future

| Phase | Contenu |
|-------|---------|
| **G1** (actuel) | Merge occurrences, concepts, feature services |
| **G2** | Reader UI consomme `getLemmaKnowledge` etc. |
| **G3** | Admin Review Workspace |
| **G4** | Merge partiel lookup formes + IA ciblée |
| **G5** | Tableaux de déclinaison, erreurs fréquentes, textes liés |

Le schéma prévoit `canonicalExplanation`, `reviewStatus`, `commonMistakesJson` sans migration destructive.

---

## 8. Exemple API interne

```typescript
import { getLemmaKnowledge } from "@/features/knowledge";

const knowledge = await getLemmaKnowledge("городок", "noun");
// knowledge?.occurrenceCount → nombre de fois vu dans tous les textes
// knowledge?.exampleSentences → phrases d'exemple
// knowledge?.concepts → cas, patterns prépositionnels liés
```

```typescript
import { knowledgeGraphService } from "@/services/knowledge-graph";

const graph = await knowledgeGraphService.getLemmaGraph("городок", "noun");
```

---

## 9. Rétrocompatibilité

- Pipeline import inchangé (un hook `mergeOccurrence` après persist)
- Reader API (`getTextForReader`) inchangée
- Tables `Text` / `Sentence` / `Word` inchangées
- Imports antérieurs : ré-importer ou script de backfill pour peupler le graphe
