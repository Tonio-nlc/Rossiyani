import Link from "next/link";
import type { ReactNode } from "react";

type SecondaryButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  large?: boolean;
};

export function SecondaryButton({
  href,
  onClick,
  children,
  className = "",
  disabled,
  type = "button",
  large = false,
}: SecondaryButtonProps) {
  const classes = [
    "r3-btn r3-btn--secondary focus-kb",
    large ? "r3-btn--large" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

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
