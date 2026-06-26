import Link from "next/link";
import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  hero?: boolean;
  interactive?: boolean;
};

export function Card({ children, href, onClick, className = "", hero = false, interactive }: CardProps) {
  const classes = [
    "r3-card",
    hero ? "r3-hero-card" : "",
    interactive || href || onClick ? "r3-card--interactive" : "",
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

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
      </button>
    );
  }

  return <div className={classes}>{children}</div>;
}
