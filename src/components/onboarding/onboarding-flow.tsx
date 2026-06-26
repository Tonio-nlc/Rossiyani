"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { completeOnboarding } from "@/lib/onboarding";

const STEPS = [
  {
    title: "Bienvenue dans Rossiyani",
    body: "Rossiyani n'est pas un traducteur. C'est un microscope linguistique — chaque mot devient une porte d'entrée vers la grammaire russe.",
    visual: "welcome" as const,
  },
  {
    title: "Comment ça fonctionne",
    body: "Cliquez sur un mot. Rossiyani décompose la forme, révèle la terminaison, et explique pourquoi le russe fléchit ainsi.",
    visual: "animation" as const,
  },
  {
    title: "Quatre espaces pour explorer",
    body: "Bibliothèque, Reader, Explorer et Recherche — tout est connecté par le même graphe de connaissances.",
    visual: "spaces" as const,
  },
  {
    title: "Prêt à commencer",
    body: "Importez un texte russe ou ouvrez la bibliothèque pour votre première lecture guidée.",
    visual: "cta" as const,
  },
];

type OnboardingFlowProps = {
  onComplete: () => void;
};

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const finish = useCallback(() => {
    completeOnboarding();
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--background)]/95 p-4 backdrop-blur-md">
      <div className="animate-microscope-in w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="mb-6 flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={[
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-[var(--accent-violet)]" : "bg-[var(--surface)]",
              ].join(" ")}
            />
          ))}
        </div>

        {current.visual === "welcome" ? (
          <div className="mb-6 text-center">
            <span className="text-5xl" aria-hidden>
              🔬
            </span>
          </div>
        ) : null}

        {current.visual === "animation" ? <MorphologyAnimation /> : null}

        {current.visual === "spaces" ? <SpacesPreview /> : null}

        {current.visual === "cta" ? (
          <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
            <p className="font-reader text-2xl text-[var(--accent-violet-bright)]">городке</p>
            <p className="mt-3 text-sm text-[var(--muted)]">Votre premier texte vous attend.</p>
          </div>
        ) : null}

        <h2 className="font-reader text-2xl font-semibold text-[var(--foreground)]">{current.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{current.body}</p>

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="focus-kb rounded-xl px-4 py-2.5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Retour
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="focus-kb rounded-xl px-4 py-2.5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Passer
            </button>
          )}

          {isLast ? (
            <div className="flex gap-2">
              <Link
                href="/import"
                onClick={finish}
                className="focus-kb rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm transition hover:border-[var(--border-strong)]"
              >
                Importer
              </Link>
              <Link
                href="/library"
                onClick={finish}
                className="btn-primary focus-kb rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                Commencer à lire
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary focus-kb rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              Continuer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MorphologyAnimation() {
  const [stage, setStage] = useState(0);
  const stages = ["городке", "городок", "городк + е", "Pourquoi ?"];

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setStage((s) => (s + 1) % stages.length)}
        className="focus-kb w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center transition hover:border-[var(--accent-violet)]/40"
      >
        <p
          className={[
            "font-reader text-2xl transition-all duration-500",
            stage === 3 ? "text-[var(--accent-cyan-bright)]" : "text-[var(--foreground)]",
          ].join(" ")}
        >
          {stages[stage]}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">Cliquez pour avancer</p>
      </button>
    </div>
  );
}

function SpacesPreview() {
  const spaces = [
    { icon: "📚", label: "Bibliothèque", desc: "Vos textes russes", href: "/library" },
    { icon: "🔬", label: "Reader", desc: "Lecture + microscope", href: "/library" },
    { icon: "📚", label: "Vocabulary", desc: "Mémoire linguistique", href: "/vocabulary" },
    { icon: "🔎", label: "Recherche", desc: "Trouver instantanément", href: "/vocabulary" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-2">
      {spaces.map((s) => (
        <Link
          key={s.label}
          href={s.href}
          className="focus-kb card-hover rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition hover:border-[var(--border-strong)]"
        >
          <span className="text-xl" aria-hidden>
            {s.icon}
          </span>
          <p className="mt-2 text-sm font-semibold">{s.label}</p>
          <p className="text-xs text-[var(--muted)]">{s.desc}</p>
        </Link>
      ))}
    </div>
  );
}
