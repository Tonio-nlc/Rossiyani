# Foundation Pack A1 — Curriculum officiel

**Sprint Foundation Pack — Rossiyani 2.0**

Corpus : [`content/a1-foundation-pack/`](../content/a1-foundation-pack/) · Patterns : [`data/patterns/a1-foundation-pack.json`](../data/patterns/a1-foundation-pack.json)

---

## 1. Learning Patterns retenus (18)

| Ordre | ID | Nom utilisateur | Prérequis | Prépare |
|------:|----|-----------------|-----------|---------|
| 1 | `lp.foundation.stress_marks.v1` | L'accent tonique guide la prononciation | — | nominatif, lecture à voix haute |
| 2 | `lp.morphology.nominative_default.v1` | La forme du dictionnaire est le point de départ | stress | présent, identification sujet |
| 3 | `lp.verbs.present_conjugation.v1` | Les verbes changent selon la personne | nominatif | pro-drop, routine |
| 4 | `lp.syntax.zero_subject.v1` | Le russe supprime ce qui est évident | présent | dialogue, impératif |
| 5 | `lp.syntax.negation_ne.v1` | La négation entoure le verbe | présent | soirée, refus poli |
| 6 | `lp.lexique.questions_intonation.v1` | Une question peut se faire par l'intonation | présent | rendez-vous, lieu |
| 7 | `lp.syntax.basic_word_order.v1` | L'ordre des mots est flexible mais pas libre | zero_subject | emphase A2 |
| 8 | `lp.morphology.role_terminations.v1` | Les mots changent selon leur rôle | nominatif | possession, accusatif |
| 9 | `lp.morphology.gender_intuition.v1` | Chaque nom est masculin, féminin ou neutre | role_terminations | accord adjectif |
| 10 | `lp.syntax.possession_existence.v1` | Avoir, c'est « il y a près de moi » | role_terminations | accusatif (contraste) |
| 11 | `lp.morphology.accusative_object.v1` | L'objet direct prend une autre forme | role_terminations | datif (personnes) |
| 12 | `lp.prepositions.v_na_location.v1` | В et На indiquent où (et parfois où aller) | role_terminations | prépositionnel |
| 13 | `lp.morphology.adjective_agreement.v1` | L'adjectif s'accorde avec le nom | gender | pluriel |
| 14 | `lp.morphology.plural_forms.v1` | Le pluriel a ses propres terminaisons | gender | récits collectifs |
| 15 | `lp.morphology.dative_recipient.v1` | Donner, dire, téléphoner — à qui ? | role_terminations | impératif, dialogue |
| 16 | `lp.syntax.impersonal_experience.v1` | « Il me froid » plutôt que « je suis froid » | role_terminations | négation + sensation |
| 17 | `lp.verbs.imperative_forms.v1` | Demander, inviter — formes courtes | présent, zero_subject | dialogue |
| 18 | `lp.morphology.prepositional_topic.v1` | Parler de / être dans un lieu | v_na_location | récit ville |

---

## 2. Parcours de lecture (22 textes)

| # | Fichier | ID | LP introduit | Renforce | Mots | Min |
|---|---------|-----|--------------|----------|------|-----|
| 1 | 01-intro | `text-a1-intro-01` | stress, nominatif, présent | — | ~45 | 3 |
| 2 | 02-family | `text-a1-family-01` | role_terminations | présent, nominatif | ~55 | 4 |
| 3 | 03-home | `text-a1-home-01` | possession_existence | role_terminations | ~50 | 4 |
| 4 | 04-cafe | `text-a1-cafe-01` | zero_subject, questions | impératif (léger) | ~45 | 3 |
| 5 | 05-day | `text-a1-day-01` | basic_word_order | présent, zero_subject | ~45 | 5 |
| 6 | 06-metro | `text-a1-metro-01` | v_na_location | questions | ~50 | 4 |
| 7 | 07-shop | `text-a1-shop-01` | accusative_object | role_terminations, v/na | ~50 | 4 |
| 8 | 08-describe | `text-a1-describe-01` | gender, adjective_agreement | nominatif, présent | ~55 | 4 |
| 9 | 09-school | `text-a1-school-01` | plural_forms | adjectifs, genre | ~55 | 5 |
| 10 | 10-weather | `text-a1-weather-01` | impersonal_experience | v/na, présent | ~45 | 4 |
| 11 | 11-friend | `text-a1-friend-01` | dative_recipient, imperative | zero_subject, questions | ~40 | 3 |
| 12 | 12-city | `text-a1-city-01` | prepositional_topic | v/na, pluriel | ~55 | 5 |
| 13 | 13-evening | `text-a1-evening-01` | negation_ne | impersonal, possession | ~50 | 4 |
| 14 | 14-breakfast | `text-a1-breakfast-01` | — | possession, présent | ~45 | 3 |
| 15 | 15-phone | `text-a1-phone-01` | — | dative, dialogue | ~45 | 3 |
| 16 | 16-park | `text-a1-park-01` | — | v/na, pluriel | ~45 | 4 |
| 17 | 17-colors | `text-a1-colors-01` | — | adjectifs, genre | ~45 | 4 |
| 18 | 18-market | `text-a1-market-01` | — | accusatif, pluriel | ~50 | 4 |
| 19 | 19-weekend | `text-a1-weekend-01` | — | négation, impersonal | ~45 | 4 |
| 20 | 20-dialogue | `text-a1-dialogue-01` | — | zero_subject, négation, datif | ~45 | 4 |
| 21 | 21-bridge | `text-a1-bridge-01` | — | tous LP phase 1–13 | ~55 | 5 |
| 22 | 22-capstone | `text-a1-capstone-01` | — | synthèse 18 LP | ~80 | 6 |

**Vocabulaire récurrent** : семья, дом, кафе, метро, магазин, друг, мама, сестра, парк, город, читать, работать, гулять, говорить.

---

## 3. Intégration

```bash
# Import complet (analyse IA + Knowledge Graph + Pattern Indexer)
set -a && source .env && set +a
npx tsx scripts/import-a1-foundation-pack.ts

# Validation PatternInstance
npx tsx scripts/validate-a1-foundation-pack.ts
```

Chaque texte reçoit un `id` stable (`text-a1-*-01`) pour le mapping éditorial LP (`editorialTextIds`).

---

## 4. Validation pédagogique (checklist)

| Critère | Comment vérifier |
|---------|------------------|
| LP au bon moment | `validate-a1-foundation-pack.ts` + lecture textes 1→5 |
| Reader silencieux d'abord | Orchestrator `SILENCE` tant que `exposureCount < min` |
| Observation → Insight | 2e–3e exposition même LP, clic token dans span |
| Vocabulary | Fiche mot après sauvegarde depuis texte pack |
| Aha moment cible | Texte 2 ou 3 : « сестры » vs « сестра » sans nommer le cas |

---

## 5. Lacunes connues de l'indexer

| LP | Détection actuelle | Impact |
|----|-------------------|--------|
| role_terminations, possession, zero_subject, dative | Règles + concepts | ✅ Fiable |
| present, negation, accusative, imperative, v/na, … | Règles **non implémentées** | ⚠️ Dépend analyse morpho + `knowledgeConceptKeys` |
| stress_marks | Marquage éditorial uniquement | ⚠️ Pas de règle `stress_marked_token` |

**Recommandation avant tests utilisateurs** : compléter `DETECTION_RULE_HANDLERS` pour les 12 règles A1 restantes (Sprint technique court, hors contenu).

---

## 6. Recommandations pré-tests utilisateurs

1. Importer les 22 textes (`import-a1-foundation-pack.ts`).
2. Vérifier validation — corriger textes sans `primaryPatternId`.
3. Parcours test : onboarding → `text-a1-intro-01` → `02-family` → `03-home`.
4. Noter si carte LP apparaît au 2e clic sur « сестры » / « меня ».
5. Si silence total : baisser `minExposureCount` en dev OU compléter handlers.
6. Ne pas ouvrir Lessons / Practice pendant le test — parcours lecture seul.

---

*Curriculum v2 — 22 textes, 18 LP, corpus dans `content/a1-foundation-pack/`.*
