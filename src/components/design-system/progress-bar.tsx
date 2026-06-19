type ProgressBarProps = {
  value: number;
  className?: string;
  "aria-label"?: string;
};

/** Flat editorial progress — Oxford Blue fill, 4px height, no gradient. */
export function ProgressBar({ value, className = "", "aria-label": ariaLabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={["ds-progress", className].filter(Boolean).join(" ")}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div className="ds-progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
