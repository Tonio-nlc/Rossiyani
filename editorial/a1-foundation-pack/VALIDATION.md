# Foundation Pack A1 — Rapport de validation pédagogique

**Sprint Foundation Pack — Étape 5**  
Date : 2026-06-28  
Corpus : 22 textes · 18 Learning Patterns

---

## 1. Synthèse

| Métrique | Cible | État |
|----------|-------|------|
| Textes corpus | 22 | ✅ `content/a1-foundation-pack/` |
| Textes importés | 22 | ✅ tous importés |
| PatternInstance totales | — | **836** (reindex 2026-06-28) |
| Phrases avec LP primaire | 100 % | ✅ 95/95 phrases |
| LP d'introduction détectés | 13 textes | ✅ validation `validate-a1-foundation-pack.ts` OK |
| Aha moment (texte 2–3) | role_terminations / possession | ✅ indexé sur family & home |

---

## 2. Validation par texte (attendu vs moteur)

### Phase découverte (textes 1–5)

| # | Texte | LP attendu | Reader (silence → insight) | Orchestrator | Vocabulary |
|---|-------|------------|------------------------------|--------------|------------|
| 1 | intro | stress, nominatif, présent | Silence 1ère lecture ; stress via token | Observation après 2e exposition nominatif | mots outils : зовут, живёт |
| 2 | family | **role_terminations** | **Aha cible** : сестры vs сестра au 2e clic | Insight sur terminaison -ы | réutilise семья, сестра |
| 3 | home | possession_existence | Silence ; у меня au 3e passage | Observation « avoir = у + gen » | есть, нет, комната |
| 4 | cafe | zero_subject, questions | Pro-drop visible sans pronom | Insight après café récurrent | кофе, хотите |
| 5 | day | basic_word_order | SVO neutre ; pas de leçon | Insight ordre sujet-verbe | утром, вечером |

### Phase consolidation (textes 6–13)

| # | Texte | LP attendu | Note validation |
|---|-------|------------|-----------------|
| 6 | metro | v_na_location | Reindex requis si import interrompu ; в + prépositionnel |
| 7 | shop | accusative_object | Objet direct après verbe transitif |
| 8 | describe | gender, adjective_agreement | Adjectif + nom même genre |
| 9 | school | plural_forms | Pluriel -и / -ы |
| 10 | weather | impersonal_experience | Мне холодно — datif expérienceur |
| 11 | friend | dative, imperative | Давай, скажи — datif personne |
| 12 | city | prepositional_topic | О городе, в городе |
| 13 | evening | negation_ne | не + verbe |

### Phase maîtrise (textes 14–22)

Textes **sans nouveau LP** — renforcement croisé uniquement.

| # | Texte | Rôle pédagogique |
|---|-------|------------------|
| 14 | breakfast | possession + présent en routine |
| 15 | phone | datif + dialogue téléphonique |
| 16 | park | в/на + pluriel |
| 17 | colors | accord adjectif couleur |
| 18 | market | accusatif objets, pluriel |
| 19 | weekend | négation + impersonnel |
| 20 | dialogue | synthèse dialogue (zero, questions, datif) |
| 21 | bridge | tous LP 1–13 en contexte unique |
| 22 | capstone | lecture autonome ~80 mots, 18 LP en arrière-plan |

---

## 3. Moments « Aha » ciblés

1. **Texte 2 (family)** — `сестра` → `сестры` : même mot, forme différente selon le rôle.  
   *Réaction attendue* : « Ah, ce n'est pas un autre mot — c'est le même avec une terminaison. »

2. **Texte 3 (home)** — `У меня есть комната` : avoir ≠ « j'ai » littéral.  
   *Réaction attendue* : « Le russe dit « près de moi il y a » — pas « je possède ». »

3. **Texte 4 (cafe)** — `Хотите кофе?` sans « вы ».  
   *Réaction attendue* : « Le sujet disparaît quand c'est évident. »

4. **Texte 10 (weather)** — `Мне холодно`.  
   *Réaction attendue* : « Ce n'est pas « я холодный » — le froid m'arrive. »

---

## 4. Lacunes observées (indexer + contenu)

| Lacune | Gravité | Détail |
|--------|---------|--------|
| `stress_marks` non détecté par règle | Moyenne | Bonus éditorial `editorialTextIds` uniquement ; pas de span stress dans Reader |
| `present_conjugation` souvent absorbé par nominatif | Faible | Présent indexé via `present_tense` concept ; carte peut être nominatif |
| `questions_intonation` | Moyenne | Détection `?` dans phrase ; intonation seule non captée |
| `basic_word_order` | Moyenne | Concept `word_order_svo` — nécessite reindex post-import |
| Règles `svo_default_order`, `v_na_location_or_direction` | Haute | Handlers absents — fallback concept mapping |
| Import interrompu (textes 7–22) | — | ✅ Résolu — import complet |
| `impersonal_experience` sur weather | Moyenne | ✅ Corrigé — détection `мне` + `холодно` |

---

## 5. Recommandations avant tests utilisateurs

1. **Terminer l'import** des 22 textes, puis `reindex-a1-foundation-pack.ts` + `validate-a1-foundation-pack.ts`.
2. **Parcours test** : onboarding → textes 1 → 2 → 3 sans ouvrir Lessons/Practice.
3. **Critère succès** : au texte 2 ou 3, l'utilisateur formule spontanément pourquoi la forme change.
4. **Si silence total** : vérifier `minExposureCount` (3 par défaut) — 2e passage même texte ou texte suivant du pack.
5. **Sprint technique court** (hors scope contenu) : implémenter handlers `v_na_location`, `svo_default_order`, `stress_marked_token`.
6. **Bibliothèque** : filtrer ou épingler `collectionId: pack.a1_foundation` pour que le débutant ne tombe pas sur textes V1 sans patterns.

---

## 6. Commandes de vérification

```bash
set -a && source .env && set +a

# Import (skip déjà importés)
npx tsx scripts/import-a1-foundation-pack.ts

# Re-index après import complet
npx tsx scripts/reindex-a1-foundation-pack.ts

# Validation PatternInstance
npx tsx scripts/validate-a1-foundation-pack.ts
```

---

*Rapport généré dans le cadre du sprint Foundation Pack A1 — Rossiyani 2.0.*
