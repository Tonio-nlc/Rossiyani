# Rossiyani 2.0 — Product Reality Check

**Sprint réalignement produit — juin 2026**

> Promesse : *« Rossiyani vous fait comprendre pourquoi le russe est écrit comme il l'est. »*

Ce document couvre les corrections de régression, l'audit UX, l'écart philosophie/expérience, l'héritage V1, et une proposition concrète pour **aujourd'hui** — sans nouveau développement fonctionnel.

Références : [`PATTERN_EXPERIENCE.md`](../docs/product/PATTERN_EXPERIENCE.md) · [`PRODUCT_BIBLE.md`](../docs/product/PRODUCT_BIBLE.md) · [`a1-foundation-pack.md`](./a1-foundation-pack.md)

---

## 1. Corrections apportées (Phase 1)

### 1.1 Reader — cause racine de la page d'erreur

| Symptôme | Page d'erreur globale (`error.tsx`) à l'ouverture d'un texte |
|----------|----------------------------------------------------------------|
| Erreur Prisma | `P2022` — colonne `Sentence.primaryPatternId` absente de la base |
| Chaîne | `getTextForReader` → `prisma.text.findUnique` (include sentences) → schéma attend `primaryPatternId`, `patternInstances`, `patternIndexedAt` |
| Cause | Schéma Prisma mis à jour (Sprints Patterns / Learning State) **sans synchronisation DB** (`prisma db push` / migration jamais exécutée sur Neon) |

**Action effectuée** : `npx prisma db push` — base Neon synchronisée avec `schema.prisma` (tables `PatternInstance`, `UserLearningPatternState`, colonnes Sentence).

**Durcissement code** : `getTextForReader` enveloppe `loadReaderPatternSlice` dans un try/catch — si le catalogue LP ou l'index échoue, la **lecture reste possible** avec un `patternSlice` vide.

### 1.2 Autres régressions corrigées récemment (build Vercel)

| Problème | Correction |
|----------|------------|
| `node:fs` importé côté client via barrels | `@/lib/vocabulary` et `@/features/texts` séparés client / serveur |
| Imports onboarding fantômes | Suppression de `onboarding.ts` qui masquait le barrel complet |
| Typage build | Labels L4/L5 orchestrator, normalisation `definitions` fiche vocabulaire |

### 1.3 Reader « fonctionne » mais la méthode reste invisible

Après sync DB, `getTextForReader` réussit. **Constat sur les textes existants** :

```
patterns: []  — aucune PatternInstance en base
```

| Couche | État |
|--------|------|
| Moteur LP (catalogue, indexer, orchestrator, learning state) | ✅ Code présent |
| Données LP sur textes importés avant le stage 12 | ❌ Jamais indexées |
| Corpus A1 Foundation Pack | ❌ Non rédigé / non importé |
| Learning State branché au runtime Reader | ❌ Pas encore câblé (localStorage encounter seulement) |

**Conséquence** : l'orchestrator retourne quasi toujours `SILENCE` — pas de carte LP, pas d'écho visuel, pas d'« Aha moment ». L'utilisateur voit un **lecteur annoté V1 dépouillé**, pas Rossiyani 2.0.

**Action opérationnelle requise** (hors scope dev sprint) : ré-importer ou backfiller les textes via le pipeline (stage `pattern-index`) + publier le Foundation Pack A1.

### 1.4 Checklist pages utilisables

| Page | Statut | Note |
|------|--------|------|
| `/texts/[id]` Reader | ✅ Après db push | LP invisibles sans index |
| `/` Home | ✅ | Dashboard V1 riche, pas pattern-first |
| `/library` | ✅ | |
| `/vocabulary` | ✅ | Fiche pattern si API + knowledge OK |
| `/lessons` | ✅ | 400+ leçons manuelles — parcours parallèle |
| `/practice` | ✅ | Analyse / réécriture — pas LP |
| `/review` | ✅ | Hors nav principale ; cartes mot, pas LP |
| `/compose` | ✅ | Hors nav ; V1 |
| `/onboarding` | ✅ | Promet « lecture », pas « patterns » |
| `/settings` | ✅ | |

---

## 2. Audit UX — parcours débutant (Phase 2)

### 2.1 Parcours nominal

```text
Lancement → Onboarding (5 étapes) → Premier texte → Lecture → Panneau mot → Fin de texte → Home
```

### 2.2 Écran par écran

| Écran | Objectif déclaré | Ce qu'apprend l'utilisateur | Aligné Rossiyani 2.0 ? | Héritage | Verdict |
|-------|------------------|----------------------------|------------------------|----------|---------|
| **Onboarding étape 0** | Présenter la méthode | « Lire des textes authentiques » | Partiel — pas de notion de *pattern* ni de *remarquer avant comprendre* | V1 copy | **Reconstruire** le message (méthode, pas feature list) |
| **Onboarding niveau / objectif** | Personnaliser | Rien sur le russe ; segmentation marketing | Non | V1 | Conserver structure, **réécrire** pour annoncer le premier LP |
| **Onboarding préférences** | Thème, traduction, audio | Où cliquer pour la traduction | Indirect | V1 | Conserver |
| **Choix premier texte** | `pickFirstOnboardingText` par CEFR | Qu'un texte existe | Non — pas de justification pédagogique | V1 | Lier au Foundation Pack |
| **First Reading Coach** | 5 hints UI | Comment cliquer, écouter, traduire, sauver | **Tutoriel interface**, pas méthode | V1 | **Simplifier** — 2 écrans max ; parler « remarquez » pas « grammaire » |
| **Reader — texte** | Lire | Le russe dans un contexte | Oui (socle) | V2 layout, V1 contenu | **Conserver** le socle lecture |
| **Reader — traduction phrase** | Comprendre | Traduction FR | Indirect | V1 | Conserver, optionnel |
| **Reader — panneau mot** | Explorer un mot | Traduction + (théoriquement) LP | **LP jamais visible** sans index | V2 shell, V1 `buildReaderExplorerView` | **Conserver** shell ; **activer** LP |
| **Reader — écho pattern** | Signal discret | Rien aujourd'hui (`showPatternEcho` toujours false) | Non | V2 prévu | **Activer** avec données |
| **Reader — fin de texte** | Clôturer | Message « grammaire en lisant » (bon copy) | Partiel | V2 card | Conserver ; ajouter **rappel LP du texte** |
| **Home post-lecture** | Reprendre | Stats, collections, review, découvertes | Dashboard générique | **V1 fort** | **Simplifier** drastiquement (voir §5) |
| **Vocabulary** | Revoir les mots sauvés | Fiche riche ; section pattern si données | Partiel si LP indexés | V2 fiche, V1 détails repliés | Conserver structure V2 |
| **Lessons** (si découvert) | Cours de grammaire | Règles hors contexte | **Contredit** la lecture-first | **V1 fort** | Rétrograder / portail L4 conditionnel |
| **Practice** (si découvert) | Produire | Corrections IA | Hors méthode LP | V1 | Hors parcours A1 |

### 2.3 Premier texte — expérience réelle aujourd'hui

1. L'utilisateur lit du russe — **bien**.
2. Il clique un mot — **traduction** — bien.
3. Il attend une explication « pourquoi » — **rien** (orchestrator silencieux).
4. Il active la traduction de phrase — **comportement V1**.
5. Il termine — message philosophique correct, mais **aucun pattern nommé**.
6. Il revient Home — **12 blocs** (continue, review, journey, discovery, progress, collections…) — **surcharge V1**.

**Verdict honnête** : le parcours fonctionne techniquement mais **n'enseigne pas la méthode Rossiyani**.

---

## 3. Promesse produit par page (Phase 3)

Échelle : **D** direct · **I** indirect · **—** aucune valeur · **✗** contredit

| Page | Note | Justification |
|------|------|---------------|
| **Home** | **—** | Dashboard multi-objectifs (review, stats, découvertes, collections). Aucun fil conducteur LP. L'utilisateur ne sait pas *pourquoi* revenir. |
| **Library** | **I** | Choix de texte = prérequis à la lecture. Pas de signal « ce texte introduit X ». |
| **Reader** | **D** (potentiel) / **—** (actuel) | Conçu pour révéler les LP ; **données et UI branchées mais vides**. Seul endroit où la promesse *peut* tenir. |
| **Vocabulary** | **I** | Approfondit après lecture. Section pattern = bonne intention ; noyée dans détails morpho repliés (V1). |
| **Lessons** | **✗** | Parcours cours parallèle, 400+ leçons, égale au Reader dans la nav. Enseigne *quoi* apprendre, pas *pourquoi le russe s'écrit ainsi* en contexte. |
| **Practice** | **✗** | Exercices de production / traduction sans ancrage LP. Autre logique pédagogique. |
| **Review** | **—** | SRS sur mots/expressions ; pas de carte pattern. Métriques « maîtrisées » ≠ compréhension structurelle. |
| **Profile / Settings** | **I** | Préférences de lecture ; pas de promesse pédagogique. |

**Synthèse** : une seule page peut tenir la promesse (**Reader**), et elle ne le fait pas encore en pratique.

---

## 4. Héritages Rossiyani V1 (Phase 4)

Liste exhaustive des éléments **encore perceptibles** qui précèdent la philosophie Learning Patterns.

### 4.1 Navigation & architecture produit

| Élément | Fichier / zone |
|---------|----------------|
| 6 entrées nav égales (Home, Library, Reader, Vocabulary, Lessons, Practice) | `main-nav.ts` |
| Lessons au même niveau que Reader | `main-nav.ts` |
| Review accessible mais pas dans nav officielle | `/review` |
| Compose séparé de Practice | `/compose` |
| Universal Search / Explorer | recherche encyclopédique |
| Import admin exposé | `/import` |

### 4.2 Reader

| Élément | Statut V2 |
|---------|-----------|
| `buildReaderExplorerView` — vue dictionnaire | Encore utilisé pour traduction |
| Classes CSS `reader-ws-explorer__*` | Nommage V1 « explorer » |
| Traduction phrase / interlinéaire | V1 — conservé |
| `ReaderAboutText` — métadonnées texte | V1 |
| `buildTextIntroduction` | V1 éditorial |
| Insight phrase multi-sections | Supprimé UI — code mort partiel possible |
| Panneau mot sans LP visible | V2 incomplet |

### 4.3 Vocabulary

| Élément | Statut |
|---------|--------|
| Onglets words / expressions / sentences | V1 |
| Section linguistique (grammaire, cas, collocations) repliée | V1 encyclopédique |
| Badges CEFR, fréquence | V1 |
| Hero « porte vers idée russe » | V2 copy, V1 structure |

### 4.4 Home

| Élément | Statut |
|---------|--------|
| `HomeWorkspaceReview` — cartes SRS | V1 |
| `HomeWorkspaceDiscovery` — candidats curated | V1 |
| `HomeWorkspaceProgress` — mots appris, streak | V1 gamification |
| `HomeWorkspaceCollections` — collections | V1 |
| `getExplorationHistory` — journal explorateur | V1 |
| Session journal multi-blocs | V1 |

### 4.5 Lessons / Manual

| Élément | Statut |
|---------|--------|
| 400+ leçons markdown `lessons/lecons/` | V1 corpus complet |
| Parcours par cas, niveau, thème | V1 école |
| `LessonsContinuePanel` | V1 |
| Library section « lessons » context translation | V1 |

### 4.6 Practice / Compose

| Élément | Statut |
|---------|--------|
| Analyse morpho détaillée | V1 |
| Context translation | V1 — contredit PATTERN_EXPERIENCE |
| Liens « Explorer → » dans cartes | V1 |
| Rewrite presets | V1 |

### 4.7 Review

| Élément | Statut |
|---------|--------|
| Cartes vocabulaire / expression / grammaire isolées | V1 |
| Stats maîtrise % | V1 |
| Pas de `patternId` sur les cartes | V1 |

### 4.8 Données & pipeline

| Élément | Statut |
|---------|--------|
| Analyse phrase 5 champs (`russianLogic`, `orderExplanation`…) | V1 import |
| Knowledge Graph sans lien LP runtime | Déconnecté |
| Pattern indexer stage 12 non rétroactif | Gap opérationnel |
| Learning State Engine non branché UI | V2 code, V0 expérience |

---

## 5. Proposition Rossiyani 2.0 — aujourd'hui (Phase 5)

Pas dans six mois. **Ce que l'app devrait être à la prochaine release utile.**

### 5.1 Principe directeur

> **Une app, un geste principal : lire. Tout le reste est subservient ou caché.**

### 5.2 Ouverture de l'application

**Aujourd'hui** : Home dashboard 6 blocs.  
**Demain** :

- Si onboarding incomplet → onboarding **2 minutes** (« Vous allez lire du russe. Parfois, une idée surgira — pas une leçon. »).
- Sinon → **écran unique** : *Continuer [titre]* ou *Commencer [Foundation texte 1]*. Pas de stats. Pas de review. Pas de collections.

### 5.3 Pourquoi ouvrir Rossiyani ?

**Une raison** : lire le prochain passage du parcours A1 Foundation, où chaque texte fait émerger **une idée** sur le russe.

### 5.4 Première lecture

| Moment | Expérience |
|--------|------------|
| Premier écran | Titre FR + russe ; 80–100 mots ; **zéro chrome pédagogique** |
| Premier clic mot | Traduction uniquement |
| 2e exposition LP (même texte ou suivant) | **Carte LP L2** dans panneau mot : `userFacingName` + insight |
| Fin première lecture | « Vous avez rencontré : *Les mots changent selon leur rôle* » — un seul LP |

### 5.5 Premier Learning Pattern visible

- **Où** : panneau mot, phrase 3–4 du `text-a1-family-01` (quand corpus + index existent).
- **Quoi** : `lp.morphology.role_terminations.v1` — formulation utilisateur, pas « génitif ».
- **Quand** : 2e clic sur un token dans le span indexé, ou fin de phrase taguée `introduces`.

### 5.6 Premier « Aha moment »

> « Ah — la fin du mot n'est pas décorative, elle dit son rôle dans la phrase. »

Sans tableau de déclinaison. Sans leçon. **Un exemple du texte qu'il vient de lire.**

### 5.7 Fin de première session

**Ressenti cible** : « J'ai lu du vrai russe, et une idée a commencé à faire sens. »  
**Pas** : « J'ai ouvert dix outils » ou « On m'a donné une leçon de grammaire ».

### 5.8 Navigation proposée (aujourd'hui)

| Visible | Caché / secondaire |
|---------|-------------------|
| Lire (→ dernier texte ou library filtrée A1) | Lessons (lien « Aller plus loin » depuis carte L4) |
| Bibliothèque (textes seulement) | Practice, Compose |
| Mots (vocabulary simplifié) | Review (quand LP `understood`) |
| Réglages | Import, Admin, Search |

### 5.9 Séquence de travail recommandée (sans nouveau moteur)

1. **Publier** 3 textes Foundation Pack + index pattern (pipeline).
2. **Forcer** un LP visible en dev (seuil orchestrator bas pour QA).
3. **Réduire** Home à 1 CTA lecture.
4. **Retirer** Lessons de la nav principale.
5. **Onboarding** : réécrire copy méthode (3 bullets Rossiyani).
6. **Brancher** Learning State persisté (déjà codé) — remplacer encounter localStorage seul.
7. **Mesurer** : un débutant nomme-t-il l'idée du LP après 2 textes ? (test utilisateur)

### 5.10 Ce qu'on ne fait PAS maintenant

- Review reconstruction
- Compose post-lecture
- Home dashboard
- Pattern Mastery UI
- Nouveaux services

---

## 6. Incohérences philosophie ↔ expérience

| # | Philosophie (docs) | Expérience (app) | Gravité |
|---|-------------------|------------------|---------|
| 1 | Lire d'abord | Lessons = nav égale | 🔴 |
| 2 | Une idée à la fois | Home montre 6 objectifs | 🔴 |
| 3 | LP silencieux puis insight | Orchestrator toujours silencieux (pas de données) | 🔴 |
| 4 | Pas de grammaire avant L2 | Vocabulary / Lessons remplis de morpho | 🟠 |
| 5 | Texte souverain | Coach onboarding parle outils | 🟠 |
| 6 | Même idée lecture → vocab → review | Review sans pattern | 🟠 |
| 7 | Foundation Pack A1 comme validation | 0 texte LP tagué importé | 🔴 |
| 8 | Learning State multi-dimension | localStorage encounter only | 🟠 |
| 9 | « Pourquoi le russe s'écrit ainsi » | Traduction mot à mot = compréhension V1 | 🟠 |
| 10 | Moteur complet documenté | Utilisateur ne voit aucune différence vs V1 | 🔴 |

---

## 7. Synthèse exécutive

| Question | Réponse |
|----------|---------|
| Le moteur existe-t-il ? | **Oui** — catalogue, indexer, orchestrator, learning state, reader/vocab V2 |
| La méthode est-elle perceptible ? | **Non** — données LP absentes, UI silencieuse, parcours V1 dominant |
| Le Reader est-il cassé ? | **Était** — DB non synchronisée ; **corrigé** ; LP toujours invisibles sans index |
| Que faire ensuite ? | **Contenu + index** (Foundation Pack), **réduction surface produit**, **activer LP dans Reader** — pas de nouvelles features |

> Nous avons construit un moteur Ferrari branché sur une carrosserie V1, sans essence (instances LP) dans le réservoir.

---

*Document produit par le sprint Product Reality Check. Développement autorisé : corrections de régression uniquement.*
