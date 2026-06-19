import Link from "next/link";
import type { ReactNode, TextareaHTMLAttributes } from "react";

type PracticeInputProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  label?: string;
  hint?: string;
  /** Compact variant for non-Russian source sentences */
  compact?: boolean;
};

/** Large editorial answer field — feels like writing on paper. */
export function PracticeInput({
  label,
  hint,
  compact = false,
  id,
  ...textareaProps
}: PracticeInputProps) {
  return (
    <label htmlFor={id} className="block">
      {label ? <span className="text-eyebrow mb-3 block">{label}</span> : null}
      <textarea
        id={id}
        {...textareaProps}
        className={[
          "focus-kb ds-practice-input break-russian",
          compact ? "ds-practice-input-compact" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {hint ? <span className="mt-2 block text-xs text-[var(--ink-muted)]">{hint}</span> : null}
    </label>
  );
}

type ExerciseCardProps = {
  eyebrow?: string;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

/** Flat exercise surface — alternatives, rewrites, margin notes. */
export function ExerciseCard({
  eyebrow,
  title,
  children,
  footer,
  active = false,
  href,
  onClick,
  disabled,
  className = "",
}: ExerciseCardProps) {
  const shellClass = [
    "ds-exercise-card",
    active ? "ds-exercise-card-active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {eyebrow ? <p className="text-eyebrow mb-2">{eyebrow}</p> : null}
      {title ? (
        <p className="break-russian font-reader text-lg leading-snug text-[var(--ink)]">{title}</p>
      ) : null}
      {children ? <div className={title || eyebrow ? "mt-3" : ""}>{children}</div> : null}
      {footer ? <div className="mt-4 border-t border-[var(--hairline)] pt-3">{footer}</div> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`focus-kb block ${shellClass}`}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`focus-kb block w-full text-left ${shellClass} disabled:opacity-40`}
      >
        {content}
      </button>
    );
  }

  return <article className={shellClass}>{content}</article>;
}

/** Margin note — contextual help that must not compete with the exercise. */
export function PracticeMarginNote({ children }: { children: ReactNode }) {
  return (
    <aside className="border-l-2 border-[var(--hairline)] pl-4 text-sm leading-relaxed text-[var(--ink-muted)]">
      {children}
    </aside>
  );
}
