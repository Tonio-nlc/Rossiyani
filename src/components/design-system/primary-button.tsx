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
};

export function PrimaryButton({
  href,
  onClick,
  children,
  className = "",
  disabled,
  type = "button",
  variant = "default",
}: PrimaryButtonProps) {
  const classes = [
    "ds-primary-btn focus-kb",
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
