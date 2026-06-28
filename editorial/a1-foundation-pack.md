# Foundation Pack A1 — Rapport éditorial

**Sprint 8 — Rossiyani 2.0**

Ce document valide la méthode sur un parcours complet : 18 Learning Patterns, 15 textes, recyclage systématique.

Références : [`LEARNING_CURRICULUM.md`](../docs/product/LEARNING_CURRICULUM.md) · [`PATTERN_SYSTEM.md`](../docs/product/PATTERN_SYSTEM.md) · [`data/patterns/a1-foundation-pack.json`](../data/patterns/a1-foundation-pack.json)

---

## 1. Synthèse

| Métrique | Valeur |
|----------|--------|
| Patterns retenus | **18** (sur 54 curriculum, 20 JSON catalogue) |
| Textes du parcours | **15** |
| Textes réutilisables aujourd'hui | **0 importés** (1 ID référencé : `text-a1-family-01`) |
| Textes à rédiger | **15** |
| Collections dominantes | `everyday-russian`, `dialogues`, `travel-russian` |

Le pack ne couvre pas le russe A1 entier — il couvre **la logique minimale** pour qu'un débutant lise sans leçon et construise des liens entre idées.

---

## 2. Patterns retenus (18)

Priorité : **P0** = indispensable · **P1** = core · **P2** = consolidation fin A1

| Ordre | ID | Nom utilisateur | Priorité | Étape |
|------:|----|-----------------|----------|-------|
| 1 | `lp.foundation.stress_marks.v1` | L'accent tonique guide la prononciation | P0 | Décoder |
| 2 | `lp.morphology.nominative_default.v1` | La forme du dictionnaire est le point de départ | P0 | Situer |
| 3 | `lp.verbs.present_conjugation.v1` | Les verbes changent selon la personne | P0 | Situer |
| 4 | `lp.syntax.zero_subject.v1` | Le russe supprime ce qui est évident | P0 | Situer |
| 5 | `lp.syntax.negation_ne.v1` | La négation entoure le verbe | P1 | Situer |
| 6 | `lp.lexique.questions_intonation.v1` | Une question peut se faire par l'intonation | P1 | Situer |
| 7 | `lp.syntax.basic_word_order.v1` | L'ordre des mots est flexible mais pas libre | P1 | Situer |
| 8 | `lp.morphology.role_terminations.v1` | Les mots changent selon leur rôle | P0 | Relier |
| 9 | `lp.morphology.gender_intuition.v1` | Chaque nom est masculin, féminin ou neutre | P0 | Relier |
| 10 | `lp.syntax.possession_existence.v1` | Avoir, c'est « il y a près de moi » | P0 | Relier |
| 11 | `lp.morphology.accusative_object.v1` | L'objet direct prend une autre forme | P1 | Relier |
| 12 | `lp.prepositions.v_na_location.v1` | В et На indiquent où (et parfois où aller) | P1 | Relier |
| 13 | `lp.morphology.adjective_agreement.v1` | L'adjectif s'accorde avec le nom | P1 | Qualifier |
| 14 | `lp.morphology.plural_forms.v1` | Le pluriel a ses propres terminaisons | P1 | Qualifier |
| 15 | `lp.morphology.dative_recipient.v1` | Donner, dire, téléphoner — à qui ? | P2 | Qualifier |
| 16 | `lp.syntax.impersonal_experience.v1` | « Il me froid » plutôt que « je suis froid » | P1 | Qualifier |
| 17 | `lp.verbs.imperative_forms.v1` | Demander, inviter — formes courtes | P1 | Qualifier |
| 18 | `lp.morphology.prepositional_topic.v1` | Parler de / être dans un lieu | P2 | Qualifier |

**Hors pack A1 (catalogue présent, A2+)** : `lp.aspect.pair_intuition.v1`, `lp.verbs.preferred_constructions.v1`.

Chaque pattern JSON inclut : objectifs pédagogiques, exemples canoniques, erreurs fréquentes, conditions d'introduction, textes éditoriaux recommandés.

### 2b. Erreurs fréquentes (francophones)

| Pattern | Erreur typique | Correction / intuition |
|---------|----------------|------------------------|
| stress_marks | Prononcer sans accent marqué | Suivre le marquage éditorial ; écouter avant de mémoriser |
| nominative_default | Utiliser une forme déclinée comme entrée de dictionnaire | Retenir la forme sujet / citation |
| present_conjugation | *Я читает* | *Я читаю* — la 1re personne a sa propre terminaison |
| zero_subject | Ajouter *я* partout par calque français | Le verbe + contexte suffisent souvent |
| negation_ne | *Я не понимаю русский язык не* | *не* colle au verbe, pas en fin de phrase |
| questions_intonation | *Est-ce que tu es à la maison ?* calqué | *Ты дома?* — intonation ou mot interrogatif |
| basic_word_order | Inverser systématiquement pour « sonner russe » | SVO neutre en A1 ; l'emphase vient plus tard |
| role_terminations | *У меня сестра* (possesseur) | *У меня сестры* — le possesseur change de forme |
| gender_intuition | Deviner le genre au hasard | S'appuyer sur terminaisons et accords visibles |
| possession_existence | *Я имею брат* | *У меня есть брат* — existence, pas « иметь » |
| accusative_object | *Я читаю книга* | *Я читаю книгу* — l'objet direct change |
| v_na_location | Même forme pour lieu et direction | *в школе* (où) vs *в школу* (vers) |
| adjective_agreement | *Большая стол* | *Большой стол* — l'adjectif suit le genre du nom |
| plural_forms | *Два брат* | *Два брата* — le pluriel a ses terminaisons |
| dative_recipient | *Я дал книгу сестру* | *Я дал сестре книгу* — le destinataire au datif |
| impersonal_experience | *Я холодный* (météo) | *Мне холодно* — sensation externalisée |
| imperative_forms | Infinitif à la place de l'ordre | *Скажи*, pas *сказать* pour « dis » |
| prepositional_topic | *Я в школу* pour « je suis à l'école » | *Я в школе* — forme statique du lieu |

---

## 3. Parcours de lecture conseillé

```text
1. text-a1-intro-01      Привет! (présentation, présent, nominatif)
2. text-a1-family-01     Ma famille (rôles, у меня есть) ★ référencé catalogue
3. text-a1-home-01       Chez moi (possession, description chambre)
4. text-a1-cafe-01       Au café (dialogue, questions, impératif)
5. text-a1-day-01        Ma journée (ordre des mots, routine)
6. text-a1-metro-01      Le métro (в/на, lieu)
7. text-a1-shop-01       Les courses (accusatif objet)
8. text-a1-describe-01   Décrire quelqu'un (genre, adjectifs)
9. text-a1-school-01     À l'école (pluriel, recyclage)
10. text-a1-weather-01   Il fait froid (impersonnel мне холодно)
11. text-a1-friend-01    Rendez-vous (datif, impératif)
12. text-a1-city-01      Dans la ville (prépositionnel, direction)
13. text-a1-evening-01   Le soir (négation, recyclage)
14. text-a1-dialogue-01  Dialogue court (tous LP en recyclage)
15. text-a1-capstone-01  Une semaine à Moscou (synthèse A1)
```

**Règle éditoriale** : chaque texte introduit **1 LP nouveau max** ; recycle **≥ 3 LP** déjà vus (cf. curriculum §5.3).

---

## 4. Audit des textes existants

| Text ID | Statut repo | Collection cible | Introduit | Renforce |
|---------|-------------|------------------|-----------|----------|
| `text-a1-family-01` | **ID seulement** (réf. patterns + tests) | everyday-russian | `role_terminations` | `possession_existence`, `present_conjugation` |
| *Tous les autres* | **Absents** | — | — | — |

**Constat** : la bibliothèque Reader ne contient pas encore de corpus A1 tagué LP. Le moteur (Catalog, Indexer, Orchestrator, Learning State) est prêt ; **le goulot est éditorial**.

Spécifications détaillées par texte : [`editorial/a1-foundation-pack/texts/`](./a1-foundation-pack/texts/).

---

## 5. Nouveaux textes nécessaires (15)

| # | ID | Titre FR | Mots cible | LP introduit |
|---|-----|----------|------------|--------------|
| 1 | `text-a1-intro-01` | Bonjour, je m'appelle… | 80–100 | stress, nominatif, présent |
| 2 | `text-a1-family-01` | Ma famille | 100–120 | role_terminations |
| 3 | `text-a1-home-01` | Ma chambre | 90–110 | possession_existence |
| 4 | `text-a1-cafe-01` | Au café | 80–100 | zero_subject, questions *(impératif en renforcement)* |
| 5 | `text-a1-day-01` | Ma journée | 110–130 | basic_word_order |
| 6 | `text-a1-metro-01` | Dans le métro | 90–110 | v_na_location |
| 7 | `text-a1-shop-01` | Les courses | 100–120 | accusative_object |
| 8 | `text-a1-describe-01` | Mon ami Paul | 100–120 | gender, adjective_agreement |
| 9 | `text-a1-school-01` | À l'université | 110–130 | plural_forms |
| 10 | `text-a1-weather-01` | L'hiver à Moscou | 90–110 | impersonal_experience |
| 11 | `text-a1-friend-01` | On se voit demain ? | 80–100 | dative_recipient, imperative_forms |
| 12 | `text-a1-city-01` | Une promenade | 120–140 | prepositional_topic |
| 13 | `text-a1-evening-01` | Le soir à la maison | 100–120 | negation_ne |
| 14 | `text-a1-dialogue-01` | Deux voisins | 100–120 | — (recyclage pur) |
| 15 | `text-a1-capstone-01` | Première semaine | 140–160 | — (synthèse) |

---

## 6. Validation — pas de Patterns isolés

Matrice cible : chaque LP apparaît dans **≥ 3 textes** et **≥ 2 collections** avant fin de pack.

| Pattern | Textes d'intro | Recyclages prévus | Contextes différents |
|---------|----------------|-------------------|----------------------|
| stress_marks | intro-01 | family, day, capstone | présentation, dialogue, récit |
| nominative_default | intro-01 | family, school, capstone | sujet, identification |
| present_conjugation | intro-01, day-01 | cafe, evening, capstone | routine, dialogue |
| zero_subject | cafe-01 | friend, dialogue, capstone | invitation, dialogue |
| negation_ne | evening-01 | cafe, day, capstone | refus, routine |
| questions_intonation | cafe-01 | metro, friend, dialogue | lieu, rendez-vous |
| basic_word_order | day-01 | shop, city, capstone | récit, description |
| role_terminations | family-01 | home, shop, friend | possession, objet, datif |
| gender_intuition | describe-01 | school, city, capstone | personne, lieu |
| possession_existence | home-01 | family, evening, capstone | chambre, famille |
| accusative_object | shop-01 | day, cafe, capstone | achat, action |
| v_na_location | metro-01 | city, school, capstone | transport, ville |
| adjective_agreement | describe-01 | school, home, capstone | portrait, lieu |
| plural_forms | school-01 | family, city, capstone | amis, bâtiments |
| dative_recipient | friend-01 | family, dialogue, capstone | donner, téléphoner |
| impersonal_experience | weather-01 | evening, city, capstone | météo, sensation |
| imperative_forms | friend-01, cafe-01 | metro, dialogue | invitation, service |
| prepositional_topic | city-01 | metro, school, capstone | lieu, sujet о |

**Liens explicites entre LP** (réseau, pas îlots) :

- `role_terminations` → `possession_existence` → `accusative_object` → `dative_recipient`
- `present_conjugation` → `zero_subject` → `imperative_forms`
- `v_na_location` → `prepositional_topic`
- `gender_intuition` → `adjective_agreement` → `plural_forms`

---

## 7. Lacunes du catalogue actuel

| Lacune | Impact | Action |
|--------|--------|--------|
| **36 LP curriculum A1–B1 absents du JSON** | Parcours incomplet après A1 | Étapes 4–10 curriculum — hors scope pack |
| **0 texte importé tagué LP** | Reader non testable bout-en-bout | Rédiger + importer les 15 textes |
| `lp.foundation.cyrillic_reading.v1` absent | Pré-A1 alphabet non modélisé LP | Onboarding séparé ou LP foundation futur |
| `lp.morphology.genitive_negation.v1` absent | « Il n'y a pas » sous-modélisé | A1.2 — texte `evening` peut préparer sans L4 |
| `lp.verbs.past_tense_gender.v1` absent | Pas de passé A1.3 | Pack suivant « A1 temporalité » |
| Détection / instances sur textes réels | Indexer vide sans import | Pipeline import après rédaction |
| `preferred_constructions`, `pair_intuition` | A2 dans pack A1 | Conservés catalogue, exclus `path.a1_foundation` |

---

## 8. Critères de succès (test débutant réel)

Un apprenant francophone zéro russe, après les 15 textes :

1. Lit un dialogue court sans traduction systématique.
2. Repère qu'un nom change de terminaison selon son rôle (sans nommer les cas).
3. Comprend « у меня есть » comme existence, pas comme « j'ai » calqué.
4. Accepte les phrases sans sujet explicite.
5. Associe в/на à lieu vs direction intuitivement.

**Échec si** : un LP n'apparaît qu'une fois ; un texte introduit 2+ LP nouveaux ; la formalisation (L4) précède l'insight (L2).

---

## 9. Fichiers produits (Sprint 8)

| Fichier | Rôle |
|---------|------|
| `data/patterns/patterns/*.json` | 14 nouveaux LP + 6 existants = 20 catalogue |
| `data/patterns/paths.json` | `path.a1_foundation` (18 étapes) |
| `data/patterns/a1-foundation-pack.json` | Manifeste machine-readable |
| `data/patterns/families.json` | +5 familles |
| `editorial/a1-foundation-pack/texts/*.yaml` | Specs éditoriales par texte |
| `scripts/seed-a1-foundation-patterns.mjs` | Génération patterns (réutilisable) |

Aucun composant, page ou service ajouté — contenu pédagogique uniquement.
