# Manuel Rossiyani — Ligne éditoriale V4

Référence permanente pour **toutes les nouvelles leçons** et pour la **réécriture progressive** des anciennes.

Validation : `npm run manual:validate`

---

## Objectif

Le lecteur ne doit **jamais** seulement lire une règle. Il doit comprendre **pourquoi** elle existe, **comment** elle fonctionne et **quand** l'utiliser.

Une leçon Rossiyani doit donner l'impression d'avoir un **excellent professeur particulier**, pas de lire une fiche de grammaire.

Objectif final : Rossiyani devient une **encyclopédie pédagogique du russe** — chaque leçon peut être la meilleure ressource francophone sur son sujet : complète mais digeste, rigoureuse mais accessible, riche mais orientée vers la compréhension et la communication réelle.

---

## Style

- Ton pédagogique, naturel et accessible.
- Pas de storytelling artificiel.
- Pas de ton « disruptif » ou trop narratif.
- Pas de jargon inutile.
- Chaque terme technique est **expliqué immédiatement** à sa première occurrence.
- Toujours privilégier la **compréhension** plutôt que la mémorisation brute.

Le lecteur doit pouvoir dire : **« Ah, maintenant je comprends. »**

Éviter : essayiste, blogueur, copywriter, influenceur, longues introductions « fun ».

---

## Structure d'une notion

Pour chaque notion importante, intégrer **autant que nécessaire** :

1. **Pourquoi** cette règle existe
2. **L'intuition** derrière la règle
3. Le **mécanisme** expliqué étape par étape
4. **Exemples** simples puis progressifs
5. **Contre-exemples**
6. **Erreurs fréquentes** (❌ / ✅)
7. **Astuces** de mémorisation
8. **Applications** dans de vraies situations

### Progression

Commencer simple. Approfondir progressivement. Nuances et exceptions **uniquement après** une intuition solide.

### Qualité

Une excellente leçon de 15 minutes vaut mieux que trois leçons superficielles. Ne jamais générer du contenu pour remplir. Si une notion mérite plus d'explications, d'exemples, de schémas ou de comparaisons avec le français — les ajouter.

---

## Communication avant linguistique

Toujours expliquer : **dans quelle situation** un locuteur russe utilise cette structure ?

Format recommandé :

```
Situation :
« Tu racontes ce qu'un ami t'a dit. »

↓

Он сказал, что...
```

Le lecteur doit **associer une structure à une situation réelle**.

---

## Schémas ASCII

Lorsque cela améliore la compréhension, ajouter de **petits schémas simples** :

```
Expression du temps

PASSÉ
↓
вчера
↓
verbe au passé
```

```
Direction

куда ?
↓
в + accusatif
↓
в школу
```

```
Verbe de mouvement

идти
│
├── présent : иду
└── passé : шёл
```

Règles : schémas courts, lisibles, au service du mécanisme — jamais décoratifs.

---

## Encadrés

Délimiteur : `────────────────────────`

### Obligatoires (minimum)

| Encadré | Rôle |
|---------|------|
| **Pourquoi ?** | Mécanisme, intuition — pas une étiquette abstraite |
| **Erreur fréquente** | Au moins une paire ❌ / ✅ |
| **🧠 À retenir** ou **À retenir** | Synthèse re-explicable par le lecteur |

### Recommandés (si utiles)

| Encadré | Rôle |
|---------|------|
| **💡 Astuce** | Mémorisation, raccourci mental, parallèle français |
| **⚠ Attention** | Piège, faux ami, exception critique |
| **⭐ Très fréquent** | Formule ou structure à reconnaître à l'oral |
| **Situation :** | Contexte communicatif concret (peut être hors encadré) |
| **Pour aller un peu plus loin** | Lien vers notion ou leçon suivante |

Les encadrés doivent **apporter une information utile**, jamais être décoratifs.

---

## Exemples

Format : **russe** · traduction naturelle · explication du mécanisme.

Chaque exemple apporte une **idée nouvelle**. Pas de répétitions inutiles.

---

## Formulations interdites

Mauvais (étiquette sans mécanisme) :

- « Le génitif exprime la possession. »
- « La déclinaison indique… »
- « Il convient de noter que… »
- « Dans le cadre de… »
- « Par définition… »

Bon : expliquer *pourquoi* la forme change, avec un parallèle français concret.

---

## Template et réécriture

- Nouvelle leçon : partir de `content/manual/_template.md`
- Leçons V3 existantes : réécriture **progressive** vers V4 (schémas, situations, encadrés enrichis) — pas de big-bang obligatoire tant que les encadrés obligatoires et le lint passent
