import Link from "next/link";
import type { ReactNode } from "react";

type PrimaryButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "default" | "gold";
  large?: boolean;
};

export function PrimaryButton({
  href,
  onClick,
  children,
  className = "",
  disabled,
  type = "button",
  variant = "default",
  large = false,
}: PrimaryButtonProps) {
  const classes = [
    "r3-btn r3-btn--primary ds-primary-btn focus-kb",
    large ? "r3-btn--large" : "",
    variant === "gold" ? "ds-primary-btn--gold" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
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
