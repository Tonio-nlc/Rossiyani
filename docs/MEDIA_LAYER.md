# Rossiyani — Media Layer

Foundation technique pour tous les médias du produit.

---

## Principe

Rossiyani ne possède pas une architecture « audio » ni « illustrations ».

Elle possède une architecture **Media** : une couche unique, indépendante du produit, qui résout des **ids stables** en objets **`MediaAsset`**.

```text
┌─────────────────────────────────────────────────────────────┐
│  Product (Reader, Explorer, Practice, Manual, Library,      │
│           Dashboard)                                        │
│  → MediaAssetId  →  MediaAsset  →  UI (MediaImage, etc.)    │
└────────────────────────────┬────────────────────────────────┘
                             │ resolveMediaAsset(id)
┌────────────────────────────▼────────────────────────────────┐
│  Media Layer (src/media/)                                   │
│  catalog · providers · resolve · presentation helpers       │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
   local-public          supabase / R2         generated
   (/public, CDN)        / S3 / CDN            (IA, éphémère)
```

---

## Règles strictes

1. **Aucun chemin fichier** (`/illustrations/...`, `.mp3`, URLs S3) dans le code produit.
2. **Aucun import** de `src/media/providers/` depuis `features/` ou `components/` (hors `@/media`).
3. **Un seul point de résolution** : `resolveMediaAsset(id)`.
4. **Ids stables** dans le catalogue — le backend peut changer sans toucher au produit.
5. La Media Layer **ne dépend pas** du graphe linguistique, du Reader, ni de Prisma.

---

## Modèle `MediaAsset`

```ts
type MediaAsset = {
  id: string;
  kind: "image" | "illustration" | "audio" | "video";
  alt: string;
  label?: string;
  width?: number;
  height?: number;
  delivery: {
    backend: MediaBackend;
    url: string;           // URL prête pour le client
    mimeType?: string;
    variants?: Record<string, string>;
  };
};
```

Le produit consomme `MediaAsset`. Seule la couche Media connaît `localPublicPath`, buckets, clés S3, etc.

---

## Catalogue

Fichier : `src/media/catalog/static-catalog.ts`

Chaque entrée possède un **id sémantique** :

| Id | Kind | Usage actuel |
|----|------|--------------|
| `dashboard.hero` | illustration | Hero Dashboard |

Future : chargement depuis CMS / DB en conservant les mêmes ids.

---

## Providers

Interface : `MediaProvider.resolve(entry) → MediaDelivery | null`

| Backend | Statut | Rôle |
|---------|--------|------|
| `local-public` | **actif** | Fichiers sous `/public`, CDN via `NEXT_PUBLIC_MEDIA_BASE_URL` |
| `supabase` | prévu | Supabase Storage |
| `r2` | prévu | Cloudflare R2 |
| `s3` | prévu | AWS S3 |
| `cdn` | prévu | URLs CDN dédiées |
| `generated` | prévu | Génération IA à la volée |

Sélection : variable d'environnement `MEDIA_BACKEND` (défaut : `local-public`).

---

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `MEDIA_BACKEND` | Backend actif (`local-public`, …) |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | Préfixe CDN optionnel pour les URLs servies |

---

## Migration progressive

1. Enregistrer l'asset dans le catalogue.
2. Remplacer les chemins hardcodés par `MediaImage` / `resolveMediaAsset`.
3. Déplacer physiquement les fichiers vers `/public/media/...` si souhaité — **sans changer les ids**.

---

## Emplacement dans l'architecture

La Media Layer est une **fondation parallèle** à `src/lib/` :

- `src/lib/` — utilitaires, Prisma, validation
- `src/media/` — médias, livraison, catalogue

Les deux sont consommables par `components/` et `features/`, jamais l'inverse.

Voir aussi : `docs/ARCHITECTURE.md`, `src/media/README.md`.
