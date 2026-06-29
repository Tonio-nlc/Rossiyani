# Rapport — Sprint Pedagogical Validation

**Date :** 2026-06-28  
**Parcours testé :** `text-a1-intro-01` → `text-a1-family-01` → `text-a1-home-01`  
**Méthode :** lecture réelle dans le Reader (navigateur) + simulation Orchestrator (`scripts/pedagogical-walkthrough.ts`)

---

## Verdict

**Le sprint n'atteint pas la définition de succès.**

Un débutant peut lire les textes — ils sont courts, naturels, progressifs. En revanche, le produit ne délivre pas encore le sentiment de « comprendre une logique nouvelle du russe » dans une session réaliste. Les obstacles sont surtout **pédagogiques** (mauvais LP au mauvais moment, seuils trop hauts, formulations encore scolaires) et **d'expérience** (parcours non guidé, interaction mot fragile).

---

## Réponses à l'audit (honnêtes)

### 1. Ai-je mieux compris le russe ?

**Partiellement, grâce aux textes — pas grâce au moteur.**

Les trois textes fonctionnent bien comme matière : répétition de `У меня есть`, apparition de `сестры` / `семью`, variation `комната` / `комнате`. En lisant seul, on devine qu'il se passe quelque chose sur les terminaisons.

Mais le Reader n'aide pas assez vite : le LP affiché sur l'intro est **l'accent tonique**, pas la logique syntaxique attendue. On ne ressort pas avec une intuition claire du « pourquoi » en une session.

### 2. Puis-je expliquer pourquoi une phrase est construite ainsi ?

**Seulement après plusieurs passes simulées (passe 4+), pas en conditions débutant réelles.**

L'Insight sur *Les mots changent selon leur rôle* est bien rédigé au niveau Observation/Insight, mais la couche **Compréhension** cite explicitement « six cas » — retour scolaire.

Sur *Avoir = у + génitif*, l'Insight (« chez moi, il y a… ») est le bon moment — mais il n'apparaît qu'après 3–4 expositions + explorations de mots.

### 3. Ai-je vécu un « Aha moment » ?

**Dans le corpus, oui. Dans le produit, non (session unique).**

Moment cible identifié dans le texte 2 : `У моей сестры` — la même famille lexicale que `сестра` / `семью` avec des fins différentes.

Dans le produit : première passe = DEFER partout ; Insight inaccessible sans relire le texte ou cliquer plusieurs mots du span. En test navigateur, **le clic sur un mot a provoqué un écran d'erreur** (voir ci-dessous) — l'Aha ne peut pas se produire si l'interaction de base est cassée.

### 4. Quels écrans m'ont semblé inutiles ?

| Élément | Pourquoi |
|---------|----------|
| Nav globale (Home, Library, Vocabulary, Lessons, Practice) | Brise le parcours ; rappelle une app généraliste, pas un chemin A1 |
| Lien « Bibliothèque » dans le header Reader | Même problème — sortie du pack |
| Carte de fin de texte → `/library` | Ne propose pas `text-a1-family-01` ; le parcours s'arrête |
| Onboarding (après reset localStorage) | Interrompt l'accès direct au texte du pack |
| Préfetch massif des fiches mots (20+ appels API au chargement) | Invisible pour l'utilisateur, alourdit la page |
| « À propos de ce texte » (replié) | Non consulté ; bruit potentiel |

### 5. Quels composants n'ont apporté aucune valeur ?

| Composant | Constat |
|-----------|---------|
| **Pattern card sur DEFER** | Affiche quand même un titre LP + « Lisez encore un peu » — ce n'est pas du silence, c'est une micro-leçon |
| **LP stress_marks sur tout l'intro** | L'accent est déjà visible dans le texte ; le moteur n'ajoute pas de compréhension structurelle |
| **Barre audio fixe** | Sur viewport étroit, intercepte les clics sur les mots |
| **Fil d'Ariane + 5 boutons header** | Charge cognitive avant le premier mot |

### 6. Quels Learning Patterns étaient mal introduits ?

| Texte | LP attendu (curriculum) | LP réellement primaire | Problème |
|-------|-------------------------|------------------------|----------|
| intro | nominatif, présent, stress | **stress_marks** sur 100 % des phrases | Le débutant cherche « comment la phrase fonctionne », on lui parle d'accent |
| family | role_terminations | role_terminations | ✅ Aligné |
| home (phrase 1) | possession_existence | **role_terminations** | `У меня есть комната` devrait ancrer la possession, pas les terminaisons |
| home (phrase 2) | possession (renfort) | possession_existence | ✅ Mais span indexé inclut une forme verbale erronée (`лежащи́т`) — bruit |

### 7. Quelles explications étaient encore trop scolaires ?

- **Compréhension** de `role_terminations` : « six cas : nominatif, génitif, datif… » — exactement ce que la méthode veut éviter en A1.
- Labels de carte : « Observation », « Insight », « Compréhension » — vocabulaire métier, pas vécu utilisateur.
- **Formalisation** présente dans les JSON LP mais heureusement masquée en L1–L3 — à ne jamais laisser remonter tôt.

---

## Observations par texte

### Texte 1 — `text-a1-intro-01` (Привет!)

#### Lecture
- ✅ Texte centré, court, ton personnel d'Anna.
- ✅ Stress marks aident la lecture à voix haute.
- ⚠️ Beaucoup de `я` / présent — occasion manquée : le LP nominatif/présent n'est pas celui servi.

#### Learning Pattern
- Primaire indexé : `stress_marks` partout.
- Curriculum prévu : stress + nominatif + présent → **seul stress gagne** (bonus éditorial + span large).
- Trop tôt : la carte LP apparaît dès le premier clic (mode DEFER), pas en silence pur.
- Jamais visible en session 1 : nominatif, présent.

#### Insight
- Contenu stress : utile pour la prononciation, **pas** pour « pourquoi cette phrase est écrite ainsi ».
- Insight stress accessible seulement passe 4 simulée — hors portée session débutant.

#### Vocabulary
- Non testé naturellement (crash au clic mot). Panneau prévu : traduction + « Enregistrer le mot ».

#### Charge cognitive
- Header Reader : 5 actions + progression + audio.
- Panneau mot vide « Lisez d'abord » : bon message, mais disparaît dès qu'on touche un mot.

---

### Texte 2 — `text-a1-family-01` (Моя семья)

#### Lecture
- ✅ Meilleur texte du trio : réutilise `У меня есть`, introduit `сестры`, `семью`, `моей`.
- ✅ Narration simple (chat Barsik) — on lit pour l'histoire.

#### Learning Pattern
- ✅ `role_terminations` bien indexé.
- ✅ `сестры` dans le span — mot cible pédagogique idéal.
- ⚠️ Span couvre la phrase entière — clic sur n'importe quel mot déclenche le même LP.

#### Insight
- Observation : « un même mot peut apparaître avec des terminaisons différentes » — **bonne formulation**.
- Insight : « étiquettes de rôle » — proche d'un Aha.
- Compréhension : cite les six cas — **casse l'effet**.

#### Vocabulary
- Mots récurrents (`мама`, `сестра`) — pont naturel vers Vocabulary si l'utilisateur enregistre un mot ; non testé en live.

#### Charge cognitive
- Même chrome UI que texte 1.
- Footnote « X autres régularités dans cette phrase — pour plus tard » : bon principe, mais invisible si Insight jamais atteint.

---

### Texte 3 — `text-a1-home-01` (Моя комната)

#### Lecture
- ✅ Répétition `комната` / `комнате` — excellent pour les terminaisons.
- ✅ `У меня есть` en ouverture — ancrage possession.

#### Learning Pattern
- ❌ Phrase 1 : LP primaire = role_terminations au lieu de possession.
- ✅ Phrase 2 : possession_existence détecté — mais le mot testé par l'indexer est `У`, pas `меня`.
- Le moment « avoir ≠ je possède » est **dilué**.

#### Insight
- Simulation passe 4 sur `У` : bon Insight possession (« chez moi, il y a… »).
- En session réelle : l'utilisateur n'y arrive probablement pas avant d'avoir abandonné.

#### Vocabulary
- Non testé.

#### Charge cognitive
- Identique aux textes précédents.

---

## Ce qui fonctionne

1. **Corpus A1** — les trois textes sont authentiques, courts, progressifs ; le vocabulaire se recycle.
2. **Silence en lecture continue** — l'Orchestrator ne déclenche rien sur le scroll (interaction `reading`).
3. **Formulations Observation/Insight** des LP role_terminations et possession — bonne direction narrative.
4. **Panneau mot épuré** — traduction d'abord, pas d'onglets grammaire V1.
5. **Indexer** — PatternInstance présentes ; family est aligné curriculum.
6. **Rythme DEFER première passe** — bonne intention (ne pas leçonner tout de suite).

---

## Ce qui ne fonctionne pas

1. **Interaction mot → crash** (navigateur) : clic sur `меня́` provoque l'écran « Un problème est survenu ». Erreur dev associée : hydration mismatch `TopNavigation`. **Bloquant pour valider la méthode en conditions réelles.**
2. **Mauvais LP primaire** sur intro (stress) et home phrase 1 (terminaisons vs possession).
3. **Seuil Insight trop élevé** : `exploreCount >= 2` ou `exposureCount >= 3 && exploreCount >= 1` — inaccessible en une lecture attentive.
4. **DEFER affiche une carte LP** — contredit la promesse « silence » et « jamais comme une leçon ».
5. **Parcours non enchaîné** — fin de texte → bibliothèque, pas `text-a1-family-01`.
6. **Compréhension trop scolaire** — mention des six cas.

---

## Ce qui est inutile (à retirer ou masquer)

- Nav Lessons / Practice / Vocabulary **pendant le parcours foundation**.
- Carte LP en mode DEFER (garder traduction seule).
- LP stress comme primaire dominant sur l'intro (le texte porte déjà l'accent).
- Préfetch agressif de toutes les fiches mots au chargement.
- Lien Bibliothèque dans le header Reader pendant un pack guidé.

---

## Ce qui doit être simplifié

| Zone | Simplification |
|------|----------------|
| **Seuils Orchestrator** | Permettre 1 Observation dès la 2e phrase du pack ; Insight dès la 2e lecture du même texte |
| **Sélection LP primaire** | Prioriser le LP `introduces` du manifest éditorial sur le bonus stress |
| **Texte home phrase 1** | Forcer possession comme primaire quand `У меня есть` en tête de phrase |
| **Carte LP** | 1 bloc court (Insight seul), pas 3 sections étiquetées |
| **Fin de texte** | Un seul CTA : « Texte suivant » → prochain ID du `readingPath` |
| **Reader chrome** | Mode immersion : masquer nav globale, fil d'Ariane, réduire barre audio |
| **Contenu LP** | Retirer « six cas » de la Compréhension A1 ; garder l'analogie « étiquettes » |

---

## Simulation Orchestrator (référence)

Commande : `npx tsx scripts/pedagogical-walkthrough.ts`

| Passe | Comportement typique |
|-------|---------------------|
| 1 | DEFER + message « Lisez encore un peu » |
| 2 | REMINDER + Observation L1 |
| 4 | INSIGHT L1+L2+L3 (si session non saturée) |

---

## Conclusion pédagogique

> La méthode est dans les **textes** et dans certains **Insights** — pas encore dans l'**expérience** d'une session débutant.

Le Foundation Pack tient la route sur le papier. Le produit, lui, demande encore trop d'effort (relectures, clics multiples, navigation hors parcours) pour produire l'Aha visé. **Priorité : ajuster la pédagogie produit (LP, seuils, copy, parcours) avant toute nouvelle fonctionnalité.**

Les corrections techniques minimales (crash clic mot, session Orchestrator corrompue, enchaînement readingPath) ne sont pas du scope de ce sprint mais bloquent la validation utilisateur réelle.

---

*Rapport Sprint Pedagogical Validation — Rossiyani 2.0*
