> Toute IA qui modifie le projet doit respecter l'architecture existante et ne jamais créer de nouvelle structure sans justification écrite.

---

# SPECIFICATION.md

# Projet : Russian Deep Reading (Rossiyani)

## Vision

Créer une application web destinée aux apprenants du russe.

L'objectif n'est pas de traduire des textes.

L'objectif est de permettre à l'utilisateur de comprendre :

* la structure grammaticale ;
* les déclinaisons ;
* les conjugaisons ;
* les prépositions ;
* l'ordre des mots ;
* la logique russe ;
* l'accent tonique ;
* les expressions natives.

Chaque phrase doit pouvoir être analysée dans ses moindres détails.

Le produit doit être conçu pour évoluer pendant plusieurs années.

La maintenabilité du code est une priorité absolue.

---

# Principes fondamentaux

## Principe 1

Le code doit être lisible par un humain.

Le code n'est pas optimisé pour être court.

Le code est optimisé pour être compris rapidement.

---

## Principe 2

Une responsabilité par fichier.

Un fichier ne doit pas gérer plusieurs concepts métiers.

---

## Principe 3

Une responsabilité par composant.

Chaque composant doit avoir un rôle unique.

---

## Principe 4

Aucune logique métier dans les composants UI.

La logique métier doit être isolée dans :

```text
src/features
src/services
src/lib
```

---

## Principe 5

Tous les types doivent être explicitement définis.

Pas de any.

TypeScript strict obligatoire.

---

# Stack technique

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

---

## Backend

Dans la V1 :

* Next.js API Routes

Pas de backend séparé.

---

## Base de données

SQLite

ORM :

* Prisma

---

## Hébergement

* Vercel

---

# Structure du projet

```text
src/

├── app/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── reader/
│   ├── sentence/
│   ├── word/
│   └── analysis/
│
├── features/
│   ├── texts/
│   ├── sentences/
│   ├── words/
│   └── grammar/
│
├── services/
│   ├── ai/
│   ├── parser/
│   └── import/
│
├── lib/
│   ├── constants/
│   ├── utils/
│   ├── validation/
│   └── formatting/
│
├── hooks/
│
├── types/
│
├── styles/
│
└── prisma/
```

---

# Arborescence obligatoire

## components

Uniquement :

* affichage
* interactions utilisateur

Jamais :

* requêtes SQL
* appels Prisma
* logique grammaticale

---

## features

Contient :

* logique métier

Exemple :

```text
features/grammar
```

contient :

* détection des cas
* règles grammaticales
* helpers linguistiques

---

## services

Contient :

* intégrations externes

Exemple :

```text
services/ai
```

pour Claude/OpenAI.

---

## lib

Contient :

* fonctions génériques réutilisables

---

# Modèle de données

## Text

```ts
type Text = {
  id: string;
  title: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "Native";
  source?: string;
  createdAt: Date;
};
```

---

## Sentence

```ts
type Sentence = {
  id: string;
  textId: string;

  russianText: string;

  literalTranslation: string;

  naturalTranslation: string;

  grammarNotes: string;

  orderExplanation: string;

  position: number;
};
```

---

## Word

```ts
type Word = {
  id: string;

  sentenceId: string;

  original: string;

  lemma: string;

  stressMarked: string;

  partOfSpeech: string;

  case?: string;

  gender?: string;

  number?: string;

  tense?: string;

  aspect?: string;

  explanation: string;
};
```

---

# Fonctionnalités V1

## Bibliothèque de textes

Affichage :

* titre
* niveau
* nombre de phrases

Tri :

* niveau
* date

Recherche :

* titre

---

## Lecture

Un texte affiche :

une phrase par bloc.

Exemple :

```text
[Phrase 1]

[Phrase 2]

[Phrase 3]
```

---

## Analyse d'une phrase

Au clic :

ouverture d'un panneau.

Affichage :

### Texte russe

### Traduction littérale

### Traduction naturelle

### Explication de la logique russe

### Explication de l'ordre des mots

### Analyse grammaticale

---

## Analyse mot par mot

Au clic sur un mot :

ouvrir :

```text
Mot
Lemme
Nature
Cas
Genre
Nombre
Temps
Aspect
Accent tonique
Explication
```

---

# Couleurs

## Nature grammaticale

Nom

```text
Bleu
```

Verbe

```text
Rouge
```

Adjectif

```text
Vert
```

Pronom

```text
Orange
```

Adverbe

```text
Violet
```

---

## Cas

Soulignement uniquement.

Ne jamais colorer tout le mot.

Exemple :

```text
дома
   ^^
```

Le soulignement reçoit la couleur du cas.

---

# Administration

Route :

```text
/admin
```

Fonction :

ajouter un texte.

---

## Processus d'import

L'utilisateur colle :

```text
texte russe
```

L'application :

1. découpe les phrases
2. appelle l'IA
3. génère :

* analyses
* accentuation
* traductions
* explications

4. stocke le résultat

---

# Qualité du code

## Obligatoire

ESLint

Prettier

TypeScript strict

---

## Interdit

any

console.log oubliés

fichiers > 300 lignes

composants > 200 lignes

fonctions > 50 lignes

---

# Documentation

Chaque dossier principal doit contenir :

```text
README.md
```

Expliquant :

* rôle
* responsabilités
* dépendances autorisées

---

# Tests

Minimum :

* tests utilitaires
* tests parser
* tests transformations

Vitest obligatoire.

---

# Évolution V2 (NON À CODER)

Liste uniquement :

* audio
* export Anki
* SRS
* statistiques
* comptes utilisateurs
* synchronisation cloud
* mode mobile hors ligne
* comparaison de traductions
