# Media Layer

Foundation technique indépendante du produit Rossiyani.

## Rôle

Centraliser **tous** les médias (illustrations, images, audio, vidéo future) derrière des objets `MediaAsset`.

Les modules Reader, Explorer, Practice, Manual, Library et Dashboard :

- consomment des **ids de catalogue** (`MediaAssetId`)
- reçoivent des **`MediaAsset`** résolus
- **n'accèdent jamais** aux chemins de fichiers ni aux backends de stockage

## Structure

| Dossier / fichier | Rôle |
|-------------------|------|
| `types.ts` | `MediaAsset`, `MediaDelivery`, `MediaKind`, `MediaBackend` |
| `catalog/` | Registre statique des assets (ids stables) |
| `providers/` | Backends (`local-public` aujourd'hui ; Supabase, R2, S3, CDN, generated demain) |
| `resolve-media-asset.ts` | Point d'entrée unique de résolution |
| `components/` | Helpers de présentation (`MediaImage`) — pas de logique métier |

## Usage

```tsx
import { MediaImage } from "@/media";

<MediaImage assetId="dashboard.hero" priority sizes="(min-width: 1024px) 42vw, 0px" />
```

```ts
import { resolveMediaAsset } from "@/media";

const asset = resolveMediaAsset("dashboard.hero");
// asset.delivery.url — URL prête pour le navigateur
```

## Ajouter un asset

1. Placer le fichier sous `/public/...` (ou uploader vers le backend cible).
2. Enregistrer l'entrée dans `catalog/static-catalog.ts` avec un id stable.
3. Consommer via `MediaAssetId` — jamais via le chemin fichier.

## Évolution des backends

| Phase | Backend | Configuration |
|-------|---------|---------------|
| V1 | `local-public` | Fichiers `/public`, option `NEXT_PUBLIC_MEDIA_BASE_URL` pour CDN |
| V2 | `supabase` / `r2` / `s3` | Nouveau provider + `MEDIA_BACKEND` |
| V3 | `generated` | URLs éphémères IA à la volée |

Les ids de catalogue et la forme `MediaAsset` restent inchangés.

## Dépendances

- Autorisé : types purs, variables d'environnement publiques
- Interdit : `features/`, `components/` (hors `media/components/`), `services/`, `lib/prisma`

Voir `docs/MEDIA_LAYER.md` pour la spécification complète.
