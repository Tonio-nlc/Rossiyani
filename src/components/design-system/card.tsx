import Link from "next/link";
import type { CSSProperties, ElementType, ReactNode } from "react";

type CardElement = "div" | "article" | "section" | "li";

type CardProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  hero?: boolean;
  interactive?: boolean;
  as?: CardElement;
  style?: CSSProperties;
};

function cardClasses(hero: boolean, interactive: boolean, href?: string, onClick?: () => void, className = "") {
  return [
    "r3-card",
    hero ? "r3-hero-card" : "",
    interactive || href || onClick ? "r3-card--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Card({
  children,
  href,
  onClick,
  className = "",
  hero = false,
  interactive,
  as: Tag = "div",
  style,
}: CardProps) {
  const classes = cardClasses(hero, Boolean(interactive), href, onClick, className);

  if (href) {
    return (
      <Link href={href} className={classes} style={style}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes} style={style}>
        {children}
      </button>
    );
  }

  const Component = Tag as ElementType;
  return (
    <Component className={classes} style={style}>
      {children}
    </Component>
  );
}
