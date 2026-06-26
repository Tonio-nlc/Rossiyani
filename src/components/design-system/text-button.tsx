import Link from "next/link";
import type { ReactNode } from "react";

type TextButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
};

export function TextButton({
  href,
  onClick,
  children,
  className = "",
  disabled,
  type = "button",
}: TextButtonProps) {
  const classes = ["r3-btn r3-btn--text focus-kb", className].filter(Boolean).join(" ");

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
