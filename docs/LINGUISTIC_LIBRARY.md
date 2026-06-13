# LinguisticLibrary — Audit et architecture

Document de fondation long terme. Complète `docs/ARCHITECTURE.md` sans la remplacer.

---

## 1. Audit du pipeline d'analyse actuel

### 1.1 Flux import (état actuel)

```text
POST /api/admin/texts/import
  → features/import/import-russian-text.ts
  → services/import/import-russian-text.ts
       1. cleanText()
       2. segmentSentences()
       3. prisma.text.create()
       4. FOR EACH sentence:
            AIProvider.analyzeSentence()   ← appel systématique
            Zod (dans parseAnalysisResponse)
            persistSentenceAnalysis()      ← Text/Sentence/Word/PhraseGroup uniquement
       5. rollback si 0 phrase persistée
```

### 1.2 Flux lecture (état actuel)

```text
/texts/[id]
  → features/texts/get-text-for-reader.ts
  → Prisma Text + Sentence + Word + PhraseGroup
  → components/reader (affichage uniquement)
```

Aucun appel IA. Aucune consultation de connaissances transversales.

### 1.3 Points forts

| Élément | Statut |
|---------|--------|
| Contrat Zod (`SentenceAnalysisOutput`) | Stable, validé |
| Abstraction `AIProvider` | Découplée |
| Normalisation IA (`normalize-analysis-payload`) | Tolère dérives modèle |
| Persistance transactionnelle par phrase | Fonctionnelle |
| Reader pré-calculé | Aligné produit |

### 1.4 Lacunes identifiées

| Lacune | Impact |
|--------|--------|
| **Aucun cache inter-textes** | Même mot (`городке`) ré-analysé par l'IA à chaque import |
| **Données éphémères par texte** | `Word` lié à `sentenceId` — pas de référentiel lemma/forme |
| **Terminaisons non factorisées** | `ending` + `case` dupliqués sans table pédagogique |
| **PhraseGroups non réutilisables** | `мне кажется` re-détecté à chaque phrase |
| **Pas de couche entre parser et IA** | Impossible de court-circuiter l'IA partiellement |
| **Reader ignorant du référentiel** | Pas d'enrichissement cross-texte (fréquence réelle, formes connues) |
| **Indexation post-import absente** | Analyses validées non capitalisées |

### 1.5 Coût et risque actuels

- **Coût** : 1 appel API × nombre de phrases (même contenu répété).
- **Qualité** : variance IA sur formes déjà validées.
- **Évolution** : impossible de corriger une analyse une fois pour toutes les occurrences.

---

## 2. Vision : LinguisticLibrary

Bibliothèque linguistique **transversale** aux textes importés.

**Principe** : une analyse validée une fois devient un actif réutilisable.

```text
                    ┌─────────────────────┐
                    │  LinguisticLibrary   │
                    │  (référentiel stable) │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
  KnowledgeLemma      KnowledgeForm         KnowledgePhrase
  (лемма)             (forme fléchie)       (collocation / construction)
         │                     │
         └──────────┬──────────┘
                    ▼
            KnowledgeEnding
            (terminaison + cas)
                    │
                    ▼
         KnowledgeSentence
         (cache phrase entière)
```

### 2.1 Règles

1. **Lookup avant IA** — toujours.
2. **IA en complément** — uniquement pour les lacunes ou phrase entière inconnue.
3. **Indexation après validation Zod** — chaque analyse persistée alimente la bibliothèque.
4. **Reader** — lit d'abord les données texte (inchangé), enrichissement optionnel via `features/words`.
5. **Pas de duplication de logique** — une seule source de vérité pour le contrat : `SentenceAnalysisOutput`.

---

## 3. KnowledgeLookupService (couche parser → IA)

Emplacement : `src/services/knowledge/`

```text
segmentSentences()
       │
       ▼
KnowledgeLookupService.lookupSentence(russianText)
       │
       ├── HIT complet  → SentenceAnalysisOutput (skip IA)
       ├── HIT partiel  → merge + IA pour lacunes (phase ultérieure)
       └── MISS         → AIProvider.analyzeSentence()
                               │
                               ▼
                    LinguisticLibraryIndexer.indexFromAnalysis()
                               │
                               ▼
                    persistSentenceAnalysis()  (inchangé)
```

### 3.1 API (fondation)

```typescript
interface KnowledgeLookupService {
  lookupSentence(russianText: string): Promise<KnowledgeSentenceLookupResult>;
  lookupForm(original: string): Promise<KnowledgeFormLookupResult | null>;
  lookupPhrase(label: string): Promise<KnowledgePhraseLookupResult | null>;
  lookupEnding(ending: string, grammaticalCase?: string): Promise<KnowledgeEndingLookupResult | null>;
}
```

### 3.2 Clés de recherche

Normalisation : `src/lib/normalization/russian-key.ts`

- minuscules locale `ru-RU`
- NFC
- suppression diacritiques d'accent pour clé secondaire (forme surface)

---

## 4. Modèles de données (Prisma)

Tables préfixées `Knowledge*` — distinctes de `Word` / `PhraseGroup` (instances par texte).

| Modèle | Rôle | Clé unique |
|--------|------|------------|
| `KnowledgeLemma` | Lemme + POS + stress | `(lemma, partOfSpeech)` |
| `KnowledgeForm` | Forme fléchie réutilisable | `originalKey` |
| `KnowledgeEnding` | Fiche terminaison + cas | `(ending, caseKey)` |
| `KnowledgePhrase` | Collocation / expression / construction | `labelKey` |
| `KnowledgeSentence` | Cache phrase analysée | `russianTextKey` |

`Word` et `PhraseGroup` restent les **occurrences dans un texte**.
`Knowledge*` est le **référentiel pédagogique**.

---

## 5. Services

| Service | Dossier | Responsabilité |
|---------|---------|----------------|
| `KnowledgeLookupService` | `services/knowledge/` | Lecture référentiel |
| `LinguisticLibraryIndexer` | `services/linguistic-library/` | Écriture après analyse validée |
| `analyzeWithKnowledge` | `services/knowledge/` | Orchestration lookup → IA → index |

### 5.1 Dépendances autorisées

```text
services/knowledge     → lib, types, prisma
services/linguistic-library → lib, types, prisma, services/ai/schemas
services/import        → services/knowledge, services/ai (existant)
features/knowledge     → services/knowledge, services/linguistic-library
features/words         → services/knowledge (enrichissement reader)
components             → features uniquement (inchangé)
```

---

## 6. Reader — préparation sans refonte

Le Reader continue d'utiliser `getTextForReader()`.

Enrichissement **optionnel** (fondation posée) :

```text
features/words/get-word-knowledge.ts
  → KnowledgeLookupService.lookupForm(original)
  → retourne WordKnowledgeContext | null
```

Le composant Reader pourra appeler cette feature plus tard pour :

- badge « déjà vu N fois »
- explication canonique de la bibliothèque vs explication phrase
- lien lemma ↔ autres formes connues

**Aucun changement obligatoire des composants existants.**

---

## 7. Phases d'implémentation

| Phase | Contenu | Statut |
|-------|---------|--------|
| **F0** | Audit + schéma + services stub + indexation passive | Ce document + code fondation |
| **F1** | Hit sentence cache → skip IA si `KnowledgeSentence` existe | À venir |
| **F2** | Merge partiel formulaire + IA ciblée | À venir |
| **F3** | Reader enrichi (badges bibliothèque) | À venir |
| **F4** | Admin review → promotion analyse canonique | Préparé (`KnowledgeReviewService`) |
| **G1** | KnowledgeGraph — merge occurrences, concepts | Voir `docs/KNOWLEDGE_GRAPH.md` |

---

## 8. Hors scope (intentionnel)

- Pas de refonte `components/`
- Pas de second moteur d'analyse
- Pas de multilingue
- Pas d'API publique séparée
