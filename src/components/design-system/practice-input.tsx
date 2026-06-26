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
          "focus-kb practice-ws-input break-russian",
          compact ? "practice-ws-input--compact" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {hint ? (
        <span className="mt-2 block text-xs font-medium text-[var(--v2-label,#94a3b8)]">{hint}</span>
      ) : null}
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
    "ds-exercise-card ws-card",
    active ? "ds-exercise-card-active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {eyebrow || title ? (
        <header className="ws-card__header">
          {eyebrow ? <p className="text-eyebrow ws-card__eyebrow">{eyebrow}</p> : null}
          {title ? (
            <p className="break-russian font-reader text-lg leading-snug text-[var(--ink)] ws-card__title">
              {title}
            </p>
          ) : null}
        </header>
      ) : null}
      {children ? <div className="ws-card__body">{children}</div> : null}
      {footer ? (
        <footer className="ws-card__footer border-t border-[var(--hairline)] pt-3">{footer}</footer>
      ) : null}
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
