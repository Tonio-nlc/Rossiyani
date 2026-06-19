import Link from "next/link";
import type { ReactNode } from "react";

type GhostButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
};

export function GhostButton({ href, onClick, children, className = "" }: GhostButtonProps) {
  const classes = ["ds-ghost-btn focus-kb", className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
