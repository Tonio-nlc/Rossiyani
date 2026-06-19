type CollectionCardProps = {
  name: string;
  description?: string;
  active?: boolean;
  onClick: () => void;
};

export function CollectionCard({ name, description, active, onClick }: CollectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={["ds-collection-card focus-kb text-left", active ? "ds-collection-card-active" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="font-reader text-base text-[var(--ink)]">{name}</span>
      {description ? (
        <span className="mt-1 block text-xs leading-snug text-[var(--ink-muted)] line-clamp-2">
          {description}
        </span>
      ) : null}
    </button>
  );
}
