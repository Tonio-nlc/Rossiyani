import Link from "next/link";
import type { ReactNode } from "react";

type GhostButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

export function GhostButton({ href, onClick, children, className = "", disabled }: GhostButtonProps) {
  const classes = ["ds-ghost-btn focus-kb", className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
