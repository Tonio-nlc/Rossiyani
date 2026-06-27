"use client";

type OnboardingProgressProps = {
  step: number;
  total: number;
};

export function OnboardingProgress({ step, total }: OnboardingProgressProps) {
  return (
    <div className="onboarding__progress" aria-hidden>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={[
            "onboarding__progress-dot",
            index <= step ? "onboarding__progress-dot--active" : "",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

type OnboardingOptionProps = {
  label: string;
  description?: string;
  selected?: boolean;
  onSelect: () => void;
};

export function OnboardingOption({
  label,
  description,
  selected = false,
  onSelect,
}: OnboardingOptionProps) {
  return (
    <button
      type="button"
      className={[
        "onboarding__option focus-kb",
        selected ? "onboarding__option--selected" : "",
      ].join(" ")}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="onboarding__option-label">{label}</span>
      {description ? <span className="onboarding__option-desc">{description}</span> : null}
    </button>
  );
}

type OnboardingShellProps = {
  step: number;
  total: number;
  eyebrow: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function OnboardingShell({
  step,
  total,
  eyebrow,
  title,
  lead,
  children,
  footer,
}: OnboardingShellProps) {
  return (
    <div className="onboarding">
      <div className="onboarding__card">
        <OnboardingProgress step={step} total={total} />
        <p className="onboarding__eyebrow">{eyebrow}</p>
        <h1 className="onboarding__title">{title}</h1>
        {lead ? <p className="onboarding__lead">{lead}</p> : null}
        <div className="onboarding__body">{children}</div>
        <footer className="onboarding__footer">{footer}</footer>
      </div>
    </div>
  );
}
