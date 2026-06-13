import { getCaseStyle } from "@/features/grammar";

type EndingBadgeProps = {
  endingText: string;
  grammaticalCase?: string | null;
  size?: "reader" | "panel" | "hero";
  variant?: "default" | "reader";
};

export function EndingBadge({
  endingText,
  grammaticalCase,
  size = "reader",
  variant = "default",
}: EndingBadgeProps) {
  const style = getCaseStyle(grammaticalCase);
  const defaultSizeClass =
    size === "hero"
      ? "text-4xl sm:text-5xl lg:text-6xl px-3 py-1.5 font-black"
      : size === "panel"
        ? "text-3xl sm:text-4xl px-2.5 py-1 font-extrabold"
        : "text-xl sm:text-2xl px-1.5 py-0.5 font-bold";

  if (variant === "reader") {
    const accentClass = style?.endingText ?? "text-[var(--foreground)]";
    return (
      <span
        className={[
          "inline align-baseline font-medium",
          accentClass,
        ].join(" ")}
      >
        {endingText}
      </span>
    );
  }

  if (!style) {
    return (
      <span
        className={`inline-block rounded-md border border-[var(--border-strong)] bg-[var(--surface-elevated)] font-bold text-[var(--foreground)] ${defaultSizeClass}`}
      >
        {endingText}
      </span>
    );
  }

  return (
    <span
      className={[
        "inline-block rounded-md border-2 font-bold",
        defaultSizeClass,
        style.endingBg,
        style.endingText,
        style.endingBorder,
      ].join(" ")}
    >
      {endingText}
    </span>
  );
}
