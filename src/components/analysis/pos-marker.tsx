import { getPosMarkerClass, POS_LABELS_FR } from "@/features/grammar";
import type { PartOfSpeech } from "@/types";

type PosMarkerProps = {
  partOfSpeech: PartOfSpeech;
  showLabel?: boolean;
  variant?: "default" | "reader";
};

/** Subtle POS indicator — vertical bar + optional label. */
export function PosMarker({
  partOfSpeech,
  showLabel = false,
  variant = "default",
}: PosMarkerProps) {
  const barClass =
    variant === "reader"
      ? "inline-block h-2.5 w-px shrink-0 rounded-full opacity-25"
      : "inline-block h-4 w-1 shrink-0 rounded-full";

  return (
    <span
      className={[
        "inline-flex items-center gap-1 self-center align-middle",
        variant === "reader" ? "mr-0 w-0 overflow-hidden opacity-0" : "mr-0.5",
      ].join(" ")}
      title={POS_LABELS_FR[partOfSpeech]}
    >
      <span
        className={`${barClass} ${getPosMarkerClass(partOfSpeech)}`}
        aria-hidden
      />
      {showLabel ? (
        <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
          {POS_LABELS_FR[partOfSpeech]}
        </span>
      ) : null}
    </span>
  );
}
