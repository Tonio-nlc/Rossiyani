import Link from "next/link";

import type {
  CaseBrowseCard,
  ConceptBrowseCard,
  LemmaBrowseCard,
  PortalBrowseCard,
} from "@/features/explorer/get-explorer-browse-data";

export type ExplorerExploreCardData =
  | LemmaBrowseCard
  | ConceptBrowseCard
  | CaseBrowseCard
  | PortalBrowseCard;

type ExplorerExploreCardProps = {
  card: ExplorerExploreCardData;
  featured?: boolean;
};

function CardCta({ label }: { label: string }) {
  return <span className="explorer-explore-card__cta">{label}</span>;
}

function LemmaCardBody({ card }: { card: LemmaBrowseCard }) {
  const occurrenceLabel =
    card.occurrenceCount === 1 ? "1 occurrence" : `${card.occurrenceCount} occurrences`;

  return (
    <>
      <p className="explorer-explore-card__title break-russian">{card.lemma}</p>
      <p className="explorer-explore-card__category">{card.categoryLabel}</p>
      <p className="explorer-explore-card__stat">{occurrenceLabel}</p>
      {card.contextPreview ? (
        <p className="explorer-explore-card__preview">
          <span className="explorer-explore-card__preview-label">Dernière apparition :</span>
          <span className="explorer-explore-card__preview-text break-russian font-reader">
            {card.contextPreview}
          </span>
        </p>
      ) : null}
      <CardCta label="Explorer →" />
    </>
  );
}

function ConceptCardBody({ card }: { card: ConceptBrowseCard }) {
  const exampleLabel =
    card.exampleCount === 1
      ? "1 exemple observé"
      : `${card.exampleCount} exemples observés`;

  return (
    <>
      <p className="explorer-explore-card__title">{card.title}</p>
      <p className="explorer-explore-card__description">{card.description}</p>
      <p className="explorer-explore-card__stat">{exampleLabel}</p>
      {card.relatedLabels.length > 0 ? (
        <p className="explorer-explore-card__related">
          <span className="explorer-explore-card__related-label">Relié à :</span>
          {card.relatedLabels.join(" · ")}
        </p>
      ) : null}
      <CardCta label="Explorer →" />
    </>
  );
}

function CaseCardBody({ card }: { card: CaseBrowseCard }) {
  return (
    <>
      <p className="explorer-explore-card__title explorer-explore-card__title--portal">
        {card.title}
      </p>
      <p className="explorer-explore-card__description">{card.description}</p>
      <ul className="explorer-explore-card__metrics">
        <li>{card.exampleCount} exemples</li>
        <li>{card.lessonCount} leçons</li>
        <li>{card.textCount} textes</li>
      </ul>
      <CardCta label="Ouvrir →" />
    </>
  );
}

function PortalCardBody({ card }: { card: PortalBrowseCard }) {
  return (
    <>
      <p className="explorer-explore-card__title break-russian">{card.title}</p>
      <p className="explorer-explore-card__description">{card.description}</p>
      {card.meta ? <p className="explorer-explore-card__stat">{card.meta}</p> : null}
      <CardCta label="Explorer →" />
    </>
  );
}

export function ExplorerExploreCard({ card, featured = false }: ExplorerExploreCardProps) {
  return (
    <Link
      href={card.href}
      className={[
        "explorer-explore-card focus-kb",
        featured ? "explorer-explore-card--featured" : "",
        card.kind === "case" ? "explorer-explore-card--case" : "",
      ].join(" ")}
    >
      {card.kind === "lemma" ? <LemmaCardBody card={card} /> : null}
      {card.kind === "concept" ? <ConceptCardBody card={card} /> : null}
      {card.kind === "case" ? <CaseCardBody card={card} /> : null}
      {card.kind === "portal" ? <PortalCardBody card={card} /> : null}
    </Link>
  );
}
