import type { ReactNode } from "react";

type TagProps = {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export function Tag({ active = false, onClick, children }: TagProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={["ds-tag focus-kb", active ? "ds-tag-active" : ""].filter(Boolean).join(" ")}
      >
        {children}
      </button>
    );
  }

  return <span className="ds-tag ds-tag-static">{children}</span>;
}
