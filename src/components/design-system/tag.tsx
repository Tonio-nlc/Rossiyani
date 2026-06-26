import type { ReactNode } from "react";

import { Badge, type BadgeTone } from "./badge";

type TagProps = {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  tone?: BadgeTone;
};

export function Tag({ active = false, onClick, children, tone = "neutral" }: TagProps) {
  return (
    <Badge tone={tone} active={active} onClick={onClick}>
      {children}
    </Badge>
  );
}
