import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "blue" | "violet" | "green" | "amber" | "rose" | "slate" | "teal";

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export function Badge({
  children,
  tone = "neutral",
  active = false,
  onClick,
  className = "",
}: BadgeProps) {
  const classes = [
    "r3-badge",
    `r3-badge--${tone}`,
    active ? "r3-badge--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={active} className={`${classes} focus-kb`}>
        {children}
      </button>
    );
  }

  return <span className={classes}>{children}</span>;
}
