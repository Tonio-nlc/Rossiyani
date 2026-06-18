export type CollectionId =
  | "everyday-russian"
  | "stories"
  | "telegram"
  | "slow-news"
  | "dialogues"
  | "travel-russian"
  | "culture";

export type Collection = {
  id: CollectionId;
  slug: CollectionId;
  name: string;
  description: string;
  order: number;
  /** Cover image id for the Media Layer catalog (e.g. `collections.everyday-russian`). */
  illustrationAssetId?: string;
  /** CSS color token or hex for collection accents. */
  accentColor?: string;
  /** Reserved for future default TTS voice per collection. */
  defaultVoiceId?: string;
  /** Reserved for future editorial style preset key. */
  editorialStyleKey?: string;
  /** Reserved for future dedicated landing route slug. */
  landingPageSlug?: string;
};
