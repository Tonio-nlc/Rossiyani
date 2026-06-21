import Link from "next/link";

function PlusIcon() {
  return (
    <svg className="lib-suggest-card__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.1" />
      <path d="M12 7.5v9M7.5 12h9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function LibrarySuggestCard() {
  return (
    <Link href="/import" className="lib-suggest-card focus-kb">
      <PlusIcon />
      <h3 className="lib-suggest-card__title">Suggérer un texte</h3>
      <p className="lib-suggest-card__lead">
        Vous cherchez un sujet spécifique&nbsp;? Faites-le nous savoir.
      </p>
    </Link>
  );
}
