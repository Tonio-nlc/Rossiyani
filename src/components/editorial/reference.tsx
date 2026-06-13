import Link from "next/link";
import type { ReactNode } from "react";

type ReferenceProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function Reference({ href, children, className = "" }: ReferenceProps) {
  return (
    <Link href={href} className={["focus-kb link-editorial", className].filter(Boolean).join(" ")}>
      {children}
    </Link>
  );
}
