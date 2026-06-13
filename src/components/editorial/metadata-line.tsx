type MetadataLineProps = {
  items: string[];
  className?: string;
};

export function MetadataLine({ items, className = "" }: MetadataLineProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <p className={["text-metadata", className].filter(Boolean).join(" ")}>
      {items.join(" · ")}
    </p>
  );
}
