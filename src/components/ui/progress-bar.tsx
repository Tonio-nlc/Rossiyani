type ProgressBarProps = {
  value: number;
  className?: string;
  animated?: boolean;
};

export function ProgressBar({ value, className = "", animated = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`h-2 overflow-hidden rounded-full bg-[var(--surface)] ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={[
          "h-full rounded-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)]",
          animated ? "transition-all duration-500 ease-out" : "",
        ].join(" ")}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
