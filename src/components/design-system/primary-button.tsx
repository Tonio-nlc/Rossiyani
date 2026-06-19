import Link from "next/link";
import type { ReactNode } from "react";

type PrimaryButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

export function PrimaryButton({
  href,
  onClick,
  children,
  className = "",
  disabled,
}: PrimaryButtonProps) {
  const classes = ["ds-primary-btn focus-kb", className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
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
