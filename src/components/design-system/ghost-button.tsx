import Link from "next/link";
import type { ReactNode } from "react";

type GhostButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  small?: boolean;
  type?: "button" | "submit";
};

export function GhostButton({
  href,
  onClick,
  children,
  className = "",
  disabled,
  small = false,
  type = "button",
}: GhostButtonProps) {
  const classes = [
    "r3-btn r3-btn--ghost ds-ghost-btn focus-kb",
    small ? "r3-btn--sm" : "",
    className,
  ].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
