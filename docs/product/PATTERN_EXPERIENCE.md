# Pattern Experience — Référence UX des Learning Patterns

**Comment vit l'apprenant un Learning Pattern, de la première exposition à la maîtrise**

*Version 1.0 — juin 2026*

**Documents liés :**

- [`ROSSIYANI_METHOD.md`](./ROSSIYANI_METHOD.md) — philosophie et cycle d'apprentissage
- [`PATTERN_SYSTEM.md`](./PATTERN_SYSTEM.md) — moteur technique (états, détection, profondeur L1–L5)
- [`LEARNING_CURRICULUM.md`](./LEARNING_CURRICULUM.md) — catalogue et ordre des 54 LP A1–B1
- **Ce document** — expérience vécue, ton, rythme, silence pédagogique

Ce document ne décrit pas des écrans ni des composants React.

Il décrit **l'expérience d'apprentissage** que chaque module doit reproduire lorsqu'un utilisateur croise un Learning Pattern.

---

## Table des matières

1. [Première rencontre](#1-première-rencontre)
2. [Deuxième rencontre](#2-deuxième-rencontre)
3. [Moment d'insight](#3-moment-dinsight)
4. [Formalisation](#4-formalisation)
5. [Réutilisation](#5-réutilisation)
6. [États UX](#6-états-ux)
7. [Rythme](#7-rythme)
8. [Scénarios complets](#8-scénarios-complets)
9. [Principes UX](#9-principes-ux)
10. [Analyse critique de l'application actuelle](#10-analyse-critique-de-lapplication-actuelle)

---

## Principe directeur

> L'utilisateur ne suit jamais une leçon. Il lit, remarque, comprend — et retrouve la même idée ailleurs jusqu'à ce qu'elle devienne évidente.

Chaque interaction avec un LP doit respecter trois lois :

1. **Le texte reste souverain** — l'analyse est invitée, jamais imposée.
2. **Une idée à la fois** — un LP primaire par instant d'attention.
3. **La familiarité avant la nouveauté** — revoir une idée bat introduire une règle.

---

## 1. Première rencontre

### 1.1 Contexte système

État mastery : `latent` → début de `observed`.

L'utilisateur lit un texte où le LP est **présent** mais pas encore « mûr » pour explication (souvent exposition 1/3). Le texte peut être le texte d'**introduction éditoriale** du LP ou un texte antérieur où le LP apparaît en arrière-plan.

### 1.2 Ce que l'utilisateur voit

| Élément | Présent ? | Description |
|---------|-----------|-------------|
| Texte russe | Oui | Typographie calme, lecture fluide |
| Traduction | Optionnelle | Selon préférences ; jamais forcée |
| Surlignage LP | **Non** | Aucun signal que « une leçon » est là |
| Panneau analyse | **Non** | Pas d'ouverture automatique |
| Marge / badge | **Non** | Pas de compteur, pas d'icône leçon |
| Audio | Oui | Discret, phrase ou texte |

**L'expérience ressemble à lire un livre**, pas à suivre un cours annoté.

### 1.3 Ce que l'utilisateur ne voit pas

- Nom du LP (« datif », « aspect perfectif »).
- Liste des autres LP dans la phrase.
- Explication grammaticale, même courte.
- Lien vers Manual / Lessons.
- Carte Review suggérée.
- Tableaux de déclinaison.

### 1.4 Ce qu'il doit pouvoir remarquer *naturellement*

Sans aide, un observateur attentif *pourrait* noter une régularité — ce n'est pas requis :

- une terminaison inhabituelle ;
- un petit mot fixe (у, с, в) ;
- une forme verbale différente de celle vue ailleurs.

Rossiyani **n'oriente pas** encore l'attention. L'exposition silencieuse alimente le modèle implicite.

### 1.5 Si l'utilisateur interagit (clic mot / phrase)

**Comportement par défaut (1ère exposition) :**

| Action | Réponse |
|--------|---------|
| Clic sur un mot du LP | Panneau **mot** : traduction + prononciation. **Pas** d'explication du LP. |
| Clic « Comprendre la phrase » | **Refus doux** ou panneau minimal : traduction naturelle seulement. Message implicite : « Lisez encore ; cette idée reviendra. » |
| Clic sur phrase entière | Audio + traduction optionnelle |

**Exception — texte d'introduction éditoriale :** si métadonnée `curriculum.introduces: [lp.xxx]` et exposition ≥ seuil (2–3), le système peut proposer une **invite unique** en fin de phrase (voir §3).

### 1.6 Éviter la surcharge cognitive

| Règle | Application |
|-------|-------------|
| Zéro annotation permanente | Pas de soulignement grammatical sur tous les mots |
| Pas d'analyse phrase par défaut | Le bouton « Comprendre » est replié |
| Un seul LP introduit par texte | Les autres LP de la phrase restent silencieux |
| Pas de jargon | Même si l'utilisateur ouvre un panneau, L1 max |

### 1.7 Ce que le système enregistre (invisible)

```text
pattern_exposed { patternId, sentenceId, textId, exposureIndex: 1 }
```

Pas de notification. Pas de badge « nouveau pattern ».

---

## 2. Deuxième rencontre

### 2.1 Contexte système

État : `observed` (expositions 2–3, souvent dans un **second texte**).

Le LP est **familier en surface** : l'œil a déjà vu la forme sans l'avoir nommée.

### 2.2 Rappel subtil

| Signal | Intensité | Exemple |
|--------|-----------|---------|
| **Écho visuel** | Très faible | Même couleur de surlignage *potential* au survol du mot clé (pas au repos) |
| **Marge fantôme** | Optionnel | Point · 2px en marge gauche de la phrase — sans légende |
| **Home** | Non | Pas encore de suggestion LP |
| **Texte** | Aucune modification | Le russe reste nu |

Si l'utilisateur **ne clique pas**, rien d'autre ne se passe. La deuxième exposition suffit pour le système.

### 2.3 Si l'utilisateur clique

| Élément | 2e rencontre |
|---------|--------------|
| Titre panneau | Pas le nom du LP — une **question** : « Cette terminaison vous interpelle ? » |
| Contenu | **L1 Observation** (1 phrase) du canon LP |
| Lien | « Vous avez déjà vu cela dans [titre texte] » — ancrage mémoire |
| CTA secondaire | « Plus de détails → » mène vers L2, pas L4 |

### 2.4 Ce qu'on cache

- Formalisation grammaticale.
- Autres LP de la phrase.
- Exemples multiples.
- Lien Manual.

### 2.5 Renforcer sans répéter

**Interdit :** recoller l'explication complète de la première fois si l'utilisateur avait déjà ouvert un panneau.

**Autorisé :**

- reformulation plus courte du **même** insight ;
- comparaison avec l'occurrence précédente (« Là c'était сестра, ici сестре — même idée ») ;
- silence si l'utilisateur scroll sans interaction.

---

## 3. Moment d'insight

### 3.1 Définition du « Aha moment »

Un véritable insight Rossiyani, ce n'est pas « j'ai lu une règle ».

C'est : **« Ah — c'est pour *ça* que la forme change ici. »**

Conditions cognitives :

- l'utilisateur a déjà **vu** la forme au moins 2 fois (`observed`) ;
- il a montré **curiosité** (clic, hover prolongé, ouverture panneau) OU le texte est le texte d'**introduction** du LP ;
- le système expose **L2 Insight** — analogie, comparaison franco-russe, pas nomenclature.

### 3.2 Quand il apparaît

| Déclencheur | Priorité |
|-------------|----------|
| Exposition ≥ seuil + clic sur token du LP | Standard |
| Texte `introduces` + fin de phrase lue (viewport) | Invite douce |
| Erreur Compose sur ce LP + retour Reader | Insight ciblé sur l'occurrence passée |
| Review ratée + lien « Revoir dans le texte » | Insight en contexte |

**Jamais** au premier mot d'un texte. **Jamais** sur deux LP simultanés.

### 3.3 Forme de l'insight

Structure canonique en **3 temps** (affichage ≤ 4 lignes total) :

1. **Accroche** — question ou constat (« En français on dit… »).
2. **Pivot** — l'idée clé en langage simple.
3. **Ancrage** — renvoi à la phrase en cours (« Ici, сестре indique… »).

**Ton :** calme, confiant, jamais congratulant (« Bravo ! » interdit).

**Visuel :** une carte unique, pas une liste. Pas d'icône trophée.

### 3.4 Comment Rossiyani sait que l'utilisateur est prêt

```text
readyForInsight(patternId, user) :=
  exposureCount >= minExposure
  AND (
    userClickedRelatedToken
    OR textIntroducesPattern
    OR postComposeErrorOnPattern
  )
  AND NOT userFatigued(session)  // > 3 insights dans la session → reporter
```

**Signaux de compréhension** (transition vers `understood`) :

- temps de lecture sur carte > 8 s ;
- ou action « C'est clair » (optionnelle, non bloquante) ;
- ou fermeture panneau après scroll complet du texte insight.

**Pas de quiz obligatoire** pour valider l'insight.

### 3.5 Ce qui n'est pas un insight

- Réciter le génitif.
- Lister six cas.
- Traduire mot à mot la phrase.
- Ouvrir l'onglet « Grammaire » du panneau mot avec 12 champs.

---

## 4. Formalisation

### 4.1 Quand le vocabulaire grammatical apparaît

| Prérequis | Formalisation (L4) |
|-----------|-------------------|
| État ≥ `understood` | Autorisée **sur demande** |
| État ≥ `connected` | Lien « Nom grammatical » visible mais replié |
| État ≥ `reused` | L4 proposée en tête de fiche Vocabulary |
| Manual / Lessons | Accessible seulement si LP `understood` |

**Règle absolue :** L4 n'apparaît **jamais** avant L2 dans le même parcours utilisateur sur ce LP.

### 4.2 Comment éviter que la formalisation remplace l'intuition

| Mécanisme | Description |
|-----------|-------------|
| **Repli par défaut** | Section « Grammaire officielle » fermée |
| **Libellé humain d'abord** | Titre = `userFacingName` du LP, pas « Datif » |
| **Rappel insight en tête** | L2 visible au-dessus de L4 même quand L4 ouvert |
| **Exemple avant tableau** | Phrase du corpus > tableau de déclinaison |
| **Manual = annexe** | « Approfondir la règle » — pas « Leçon 12 » |

### 4.3 Transition UX (understood → formalisation)

1. L'utilisateur a reçu L3 Compréhension au moins une fois.
2. Une ligne discrète apparaît : « Connaître le nom de cette règle → »
3. Clic → L4 dans le même panneau, **sans navigation**
4. Première ouverture L4 : encart « Vous avez déjà senti cela — voici comment les grammairiens le nomment. »

### 4.4 Si l'utilisateur saute la formalisation

Aucune pénalité. Maîtrise possible sans jamais ouvrir L4 (`mastered` via Review + Compose + lecture fluide).

---

## 5. Réutilisation

L'utilisateur doit penser : **« Ah, c'est encore cette histoire de terminaisons »** — pas : **« Nouvelle leçon »**.

### 5.1 Reader

| État LP | Expérience |
|---------|------------|
| `observed` | Lecture nue ; écho visuel au survol |
| `noticed` | Invite question ; L1–L2 |
| `understood` | Clic → L3 contextualisé ; lien « Vu aussi dans… » |
| `connected` | Surlignage léger au repos sur le token ; 1 ligne rappel en marge |
| `reused` | Minimal — l'utilisateur n'a plus besoin d'aide sauf demande |
| `mastered` | Aucun signal sauf statistiques optionnelles profil |

**Fil conducteur :** même formulation `userFacingName`, même structure de carte insight, mêmes couleurs de surlignage pour un `patternId` donné.

### 5.2 Vocabulary

| État LP | Expérience |
|---------|------------|
| Première visite mot | Traduction d'abord ; LP en bas de fiche |
| LP `understood` | Section « Pattern : [nom] » avec L3 |
| LP `connected` | Liste occurrences + LP liés du réseau |
| Demande L4 | Section repliée « Grammaire » |

**Jamais** : ouvrir Vocabulary avec tableau de conjugaison plein écran avant la traduction.

### 5.3 Review

| État LP | Expérience |
|---------|------------|
| LP `connected`+ | Carte due |
| Face avant | Phrase **contexte** (russe) + question L2 (« Quel rôle joue ce mot ? ») |
| Face arrière | L3 + rappel texte source cliquable |
| Succès | « Vous retrouvez l'idée de [userFacingName] » — pas « Correct » sec |

**Ton :** réactivation, pas examen.

### 5.4 Compose

| État LP | Expérience |
|---------|------------|
| Erreur sur LP `understood`+ | Correction mappée à `commonErrors` ; L3 |
| Succès touchant LP | Mention discrète : « Construction naturelle — [userFacingName] » |
| Post-lecture | Exercice lié au LP `introduces` du texte |

**Jamais** : nouveau vocabulaire grammatical dans la correction avant L2.

### 5.5 Matrice de cohérence sensorielle

| Élément | Reader | Vocabulary | Review | Compose |
|---------|--------|------------|--------|---------|
| Nom LP (`userFacingName`) | Identique | Identique | Identique | Identique |
| L2 insight (texte canon) | Identique | Identique | Adapté question/réponse | Paraphrase |
| Exemple ancrage | Phrase en cours | Phrase sauvée | Phrase carte | Phrase utilisateur |
| Couleur accent LP | ● | ● | ● | ● |

---

## 6. États UX

Mapping entre états **vécu par l'utilisateur** et états **système** (`PATTERN_SYSTEM`).

| UX utilisateur | États système | Résumé vécu |
|----------------|---------------|-------------|
| **Inconnu** | `latent` | Je n'ai jamais croisé cette idée (ou pas assez pour que ça compte) |
| **Aperçu** | `observed` | J'ai vu des formes sans qu'on m'explique |
| **Remarqué** | `noticed` | On m'a attiré l'attention une fois |
| **Compris** | `understood` + `connected` | Je sais pourquoi, et je l'ai revu ailleurs |
| **Maîtrisé** | `reused` + `mastered` | Je produis / je rappelle sans effort |

### 6.1 Pattern inconnu (`latent`)

| Dimension | Spécification |
|-----------|---------------|
| **Visible** | Texte seul |
| **Profondeur max** | — |
| **Ton** | Neutre, éditorial |
| **Feedback** | Aucun |

### 6.2 Pattern aperçu (`observed`)

| Dimension | Spécification |
|-----------|---------------|
| **Visible** | Texte ; éventuellement traduction ; au clic mot : traduction uniquement |
| **Profondeur max** | L1 si clic insistant |
| **Ton** | Neutre |
| **Feedback** | Aucun ; ou « Vous avez déjà vu cette forme » à partir de la 2e expo |

### 6.3 Pattern remarqué (`noticed`)

| Dimension | Spécification |
|-----------|---------------|
| **Visible** | Surlignage léger ; invite question ; panneau L2 |
| **Profondeur max** | L2 |
| **Ton** | Curieux, invitant |
| **Feedback** | « Cette idée va revenir » — jamais « À retenir » |

### 6.4 Pattern compris (`understood` / `connected`)

| Dimension | Spécification |
|-----------|---------------|
| **Visible** | L3 ; liens occurrences ; LP reliés ; suggestion Review douce |
| **Profondeur max** | L3 ; L4 sur demande |
| **Ton** | Explicatif, calme |
| **Feedback** | « Même idée dans [autre texte] » ; Compose post-lecture |

### 6.5 Pattern maîtrisé (`mastered`)

| Dimension | Spécification |
|-----------|---------------|
| **Visible** | Rien par défaut ; stats profil optionnelles |
| **Profondeur max** | L5 si expert demande |
| **Ton** | Respect du rythme de lecture |
| **Feedback** | Review maintenance espacée ; pas de popup |

---

## 7. Rythme

### 7.1 Nouvelles idées par texte

| Type texte | LP expliqués (max) | LP en exposition silencieuse |
|------------|-------------------|------------------------------|
| Court A1 | 1 | 2–3 |
| Moyen A2 | 1–2 | 3–4 |
| Long B1 | 2 | 4–5 |

**Session de lecture (15–25 min) :**

- **≤ 2 insights** (passages `noticed` → L2) ;
- **≤ 1** nouvelle L3 ;
- **0** L4 sauf demande explicite.

### 7.2 Rappels

| Type rappel | Fréquence |
|-------------|-----------|
| Exposition silencieuse | Chaque fois que le LP apparaît |
| Écho visuel (`observed`) | 2e et 3e exposition |
| Invite insight | 3e exposition ou texte d'intro |
| Review | Selon SRS, après `connected` |
| Home suggestion LP | Max 1 par session |

### 7.3 Quand ne rien expliquer

- Première lecture d'un texte (découverte narrative).
- LP `mastered`.
- LP `latent` en exposition 1/3.
- Session déjà saturée (2 insights).
- Utilisateur en mode « lecture immersive » (préférence).

### 7.4 Silence pédagogique

Le silence n'est pas un défaut — c'est **l'étape Observation** de la méthode.

> Rossiyani fait confiance à l'exposition répétée. Tout expliciter tuerait la construction du modèle implicite.

**Durée cible :** au moins **40 %** du temps de lecture sans panneau ouvert.

---

## 8. Scénarios complets

### Scénario A — `lp.morphology.dative_recipient.v1` · « Я дал книгу сестре. »

**Contexte :** 3e texte A2 ; utilisatrice Marie, LP en `observed` (vu « сестре » dans un dialogue famille, « маме » dans un texte courses). Texte actuel : récit court « Un cadeau ».

#### Passage 1 — Lecture fluide

| Observé | Caché |
|---------|-------|
| Phrase russe, traduction masquée | Surlignage сестре |
| Progression lecture | Analyse phrase |

Marie lit sans clic. Système : `pattern_exposed` (exposition 3).

#### Passage 2 — Fin de phrase (viewport)

Invite discrète sous la phrase (texte `introduces` ce LP dans ce récit) :

> *« Сестре » finit différemment de « сестра » — vous l'avez déjà remarqué ? »*  
> [Voir →] · [Plus tard]

Marie tape « Plus tard ». Rien d'autre. Respect du rythme.

#### Passage 3 — Clic sur « сестре »

Panneau mot :

- Traduction : « à la sœur »
- **Pas** de tableau de déclinaison en premier

Bandeau LP (L2) :

> **À qui ?**  
> En russe, quand on donne, dit ou écrit *à* quelqu'un, cette personne prend une forme particulière : *сестре*, pas *сестра*.  
> *Vous aviez vu « маме » au marché — c'est la même idée.*

Liens : « Voir au marché → » (texte précédent).

**Caché :** accusatif « книгу », aspect « дал », lien Manual « datif ».

#### Passage 4 — « C'est clair »

État → `understood`. Ligne optionnelle : « Nom grammatical : datif → » (repliée).

#### Plus tard — Review

Carte : « Я помогаю ___ (мама) » → « маме ». Rappel : « À qui ? — même idée que сестре. »

#### Plus tard — Compose

Marie écrit : « Я дал книгу сестра. »

Correction :

> **À qui ?** — après « donner », la personne qui reçoit change de forme : *сестре*, pas *сестра*.

Pas de tableau. Lien « Revoir dans Un cadeau → ».

---

### Scénario B — `lp.syntax.possession_existence.v1` · « У меня есть кот. »

**Contexte :** 1ère introduction (texte « Chez moi »). Marie débutante. LP `latent` → première exposition.

#### 1ère lecture

Silence total. Pas d'invite. Elle comprend « j'ai un chat » via traduction optionnelle.

#### 2e texte (description chambre)

« У меня есть большая комната. » — encore silence. `observed`.

#### 3e texte — clic sur « У меня есть »

L2 :

> **Avoir, c'est « il y a près de moi »**  
> Le russe ne dit pas « j'ai » comme en français. Il dit littéralement : « près de moi, il y a… »

L3 si elle ouvre « Plus » :

> *Кот* devient *кота* parce que c'est l'objet « possédé » dans cette construction.

**Caché jusqu'à `connected` :** mot « génitif » ; comparaison avec génitif de négation.

#### Vocabulary (mot « кот »)

Traduction en tête. Section repliée : « Pattern : Avoir, c'est… »

---

### Scénario C — `lp.aspect.pair_intuition.v1` · Récit passé

Phrases dans un texte « Hier » :

- « Он **писал** письмо весь вечер. »
- « Потом он **написал** письмо и пошёл спать. »

#### Expositions 1–2

Lecture seule. Deux formes verbales visibles — pas de commentaire.

#### Exposition 3 + clic sur verbe

L2 :

> **Deux regards sur la même action**  
> *Писал* — l'action en cours ; *написал* — l'action vue comme terminée. Même verbe, autre perspective.

**Caché :** liste de 20 paires aspectuelles ; terme « perfectif » jusqu'à `understood`.

#### Compose (reformulation)

Consigne : reformulez la 2e phrase avec l'autre aspect. Feedback sur le **regard**, pas sur la note.

---

### Scénario D — `lp.motion.unidirectional.v1` · « Сейчас я иду в магазин. »

#### Après LP `v_na_location` compris

Invite comparée :

> **Un aller, maintenant** — *иду* : un déplacement en cours dans une direction. *Хожу* serait l'habitude ou les allers-retours.

**Caché :** multidirectionnel jusqu'au path mouvement étape suivante.

Erreur classique en Compose (« я хожу в магазин сейчас ») → rappel L2 sans leçon complète sur les verbes de mouvement.

---

### Scénario E — `lp.syntax.zero_subject.v1` · « Пойдём в кино? »

LP `mastered` pour Marie.

#### Expérience

Aucun surlignage. Aucune invite. Elle lit.

Si elle clique « Comprendre la phrase » :

> Traduction naturelle seulement : « On va au cinéma ? »

L3 disponible en bas : « Le russe omet souvent le sujet quand il est évident — ici, « nous ». »

**Principe :** ne pas sur-expliquer ce qui est déjà intégré.

---

## 9. Principes UX

### 9.1 Règles absolues

| # | Règle |
|---|-------|
| 1 | **Une interaction = une idée** — un LP primaire par panneau, carte, correction |
| 2 | **Une découverte par instant** — pas deux insights à la suite sans lecture entre |
| 3 | **Montrer avant d'expliquer** — exposition silencieuse avant L2 |
| 4 | **Relier avant de nommer** — « vu dans [texte] » avant « datif » |
| 5 | **La lecture gagne** — ≥ 40 % du temps sans panneau |
| 6 | **Jamais de leçon non sollicitée** — invite = opt-in |
| 7 | **Même nom, même ton** — `userFacingName` partout |
| 8 | **Le jargon est une porte, pas une entrée** — L4 replié |
| 9 | **Pas de gamification** — pas de points, streaks LP, badges « pattern débloqué » |
| 10 | **Expliquer pourquoi on propose** — toute suggestion Home/Review justifie en une ligne |
| 11 | **Respecter la progression cognitive** — prérequis LP vérifiés avant insight |
| 12 | **Le silence est une feature** — ne pas combler l'absence d'UI par du contenu |

### 9.2 Anti-patterns interdits

- Ouvrir l'analyse phrase automatiquement à chaque scroll.
- Afficher six sections (logique, ordre, usage, constructions…) d'un coup.
- Panneau mot avec onglet Grammaire par défaut.
- Popup « Nouveau pattern débloqué ! ».
- Review sans phrase source.
- Compose qui enseigne une règle jamais exposée en lecture.
- Manual recommandé avant `understood`.

### 9.3 Préférences utilisateur (futures)

| Préférence | Effet |
|------------|-------|
| Lecture immersive | Désactive invites ; exposition silencieuse seulement |
| J'aime les explications | Seuil d'invite abaissé (2 expositions) |
| Grammaire explicite | L4 suggérée après `understood` (toujours repliée par défaut) |

---

## 10. Analyse critique de l'application actuelle

### 10.1 Ce qui fonctionne déjà

| Élément actuel | Alignement Pattern Experience |
|----------------|--------------------------------|
| Traduction optionnelle / masquée | Respecte souveraineté du texte |
| Bouton « Comprendre la phrase » replié | Progressive disclosure |
| `ReaderSentenceInsightPanel` sur demande | Pas d'analyse imposée au repos |
| Panneau mot séparé (traduction) | Bon socle pour séparer mot vs pattern |
| Compose cartes progressives (Sprint 9) | Proche insight → correction → réutilisation |
| Review avec `sourceTextTitle` | Ancrage contextuel amorcé |
| Audio phrase | Observation sans analyse |
| Home session-first | Orientation sans surcharge (partielle) |

### 10.2 Ce qui devra être supprimé

| Élément | Raison |
|---------|--------|
| Analyse phrase multi-sections simultanées (`logique` + `ordre` + `usage` + constructions) | viole « une idée » ; pas de LP primaire |
| Onglet « Grammaire » par défaut dans panneau mot / Explorer | L4 avant L2 |
| Context Translation | Pas d'expérience pattern ; traducteur |
| Badges / métriques « mots appris » comme feedback principal | Remplace insight par accumulation |
| Manual en navigation égale au Reader | Cours parallèle, pas repli L4 |
| Popup ou flux « tout analyser » mot-à-mot | Charge cognitive (AI_ANALYSIS_SPEC actuel) |

### 10.3 Ce qui devra être simplifié

| Élément actuel | Cible Pattern Experience |
|----------------|--------------------------|
| `buildReaderSentenceInsight` (5 types de sections) | **Une carte LP** (L2 ou L3) + traduction |
| `ReaderExplorerPanel` multi-onglets | Mot : traduction + lien LP ; LP : une carte |
| Vocabulary fiche (conjugaison visible) | Traduction → LP (replié) → L4 (demande) |
| Review cartes mot isolé | Carte LP + contexte phrase |
| Fin de texte → lien `/practice` générique | Fin de texte → Compose **post-lecture** sur LP du texte |
| Phrase insight titres techniques (« Ordre des mots ») | Questions ou `userFacingName` |

### 10.4 Ce qui devra être entièrement repensé

| Domaine | Reprise |
|---------|---------|
| **Reader — cœur** | Brancher sur `pattern-mastery-service` ; affichage selon état UX (§6) |
| **Détection surface** | Remplacer sections phrase génériques par `primaryPatternId` |
| **Panneau mot** | Séparer « traduire le mot » et « comprendre le pattern » (deux gestes, deux profondeurs) |
| **Vocabulary** | Fiche organisée par LP liés au lemme, pas par champs morpho |
| **Review** | Type carte `pattern` ; face avant = L2 question |
| **Compose** | Corrections indexées `affectedPatterns[]` ; ton §5.4 |
| **Home** | Suggestions « Réactiver [userFacingName] » / « Prochaine exposition dans [texte] » |
| **Lessons** | Portail L4 conditionnel à `understood` — pas parcours autonome |
| **Onboarding** | Introduire la **méthode** (lire → remarquer), pas une règle |

### 10.5 Tableau de migration Reader (priorité)

| Phase | Expérience cible |
|-------|------------------|
| **R1** | Exposition silencieuse + compteur mastery ; aucun changement visible radical |
| **R2** | Invite LP en fin de phrase (textes tagués `introduces`) |
| **R3** | Remplacer insight multi-sections par carte LP unique |
| **R4** | Panneau mot sans grammaire par défaut ; lien pattern |
| **R5** | Surlignage et échos selon état UX |
| **R6** | Fin de lecture → Compose post-lecture LP |

### 10.6 Écart ressenti utilisateur

| Aujourd'hui | Demain (Pattern Experience) |
|-------------|----------------------------|
| « Je lis un texte très annoté si je clique partout » | « Je lis ; l'app m'interpelle au bon moment » |
| « Chaque clic ouvre beaucoup d'infos » | « Chaque clic ouvre une idée » |
| « Grammaire partout » | « Intuition d'abord, jargon sur demande » |
| « Pratique = autre app » | « Même idée en lecture, révision et écriture » |

---

## Annexes

### A. Checklist implémentation (une interaction LP)

- [ ] Un seul `primaryPatternId` ?
- [ ] Profondeur ≤ `maxDepthAllowed` ?
- [ ] Texte canon L2/L3 identique au catalogue ?
- [ ] Aucun jargon avant L2 ?
- [ ] Lien contexte si 2e+ exposition ?
- [ ] Événement mastery émis ?
- [ ] Session pas saturée (≤ 2 insights) ?

### B. Hiérarchie documentaire complète

```text
ROSSIYANI_METHOD.md       → pourquoi
PATTERN_SYSTEM.md         → moteur / données
LEARNING_CURRICULUM.md    → quoi / ordre A1–B1
PATTERN_EXPERIENCE.md     → comment ça se vit (ce document)
ui_principles.md          → règles interface transverses
```

### C. Glossaire UX

| Terme | Signification |
|-------|---------------|
| **Invite** | Proposition opt-in d'insight, jamais modale bloquante |
| **Écho visuel** | Signal au survol seulement |
| **Carte LP** | Surface unique d'explication (L2 ou L3) |
| **Silence pédagogique** | Période d'exposition sans UI d'analyse |
| **Fil conducteur** | `userFacingName` + formulation cohérente |

---

*Ce document sert de base directe à la reconstruction du Reader, puis de Vocabulary, Review et Compose. Tout composant qui affiche une explication grammaticale doit pouvoir indiquer quel LP, quel état UX et quelle profondeur L1–L5 il sert.*
