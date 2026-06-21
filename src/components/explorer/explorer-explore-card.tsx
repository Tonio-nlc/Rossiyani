import Link from "next/link";

import {
  appearsAcrossTexts,
  observedInContexts,
  patternObservedInTexts,
} from "@/lib/explorer/explorer-ia";
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

function CardContext({ children }: { children: string }) {
  return <p className="explorer-explore-card__context">{children}</p>;
}

function LemmaCardBody({ card }: { card: LemmaBrowseCard }) {
  return (
    <>
      <div className="explorer-explore-card__body">
        <p className="explorer-explore-card__title break-russian">{card.lemma}</p>
        <p className="explorer-explore-card__description">{card.categoryLabel}</p>
        <CardContext>{observedInContexts(card.occurrenceCount)}</CardContext>
        {card.contextPreview ? (
          <p className="explorer-explore-card__preview break-russian font-reader">
            {card.contextPreview}
          </p>
        ) : null}
      </div>
      <CardCta label="Explore →" />
    </>
  );
}

function ConceptCardBody({ card }: { card: ConceptBrowseCard }) {
  return (
    <>
      <div className="explorer-explore-card__body">
        <p className="explorer-explore-card__title">{card.title}</p>
        <p className="explorer-explore-card__description">{card.description}</p>
        <CardContext>{patternObservedInTexts(card.exampleCount)}</CardContext>
        {card.relatedLabels.length > 0 ? (
          <p className="explorer-explore-card__related break-russian">
            {card.relatedLabels.slice(0, 3).join(" · ")}
          </p>
        ) : null}
      </div>
      <CardCta label="Explore →" />
    </>
  );
}

function CaseCardBody({ card }: { card: CaseBrowseCard }) {
  const context =
    card.exampleCount > 0 && card.textCount > 0
      ? `${observedInContexts(card.exampleCount)} · ${appearsAcrossTexts(card.textCount)}`
      : card.exampleCount > 0
        ? observedInContexts(card.exampleCount)
        : appearsAcrossTexts(card.textCount);

  return (
    <>
      <div className="explorer-explore-card__body">
        <p className="explorer-explore-card__title explorer-explore-card__title--portal">
          {card.title}
        </p>
        <p className="explorer-explore-card__description">{card.description}</p>
        <CardContext>{context}</CardContext>
      </div>
      <CardCta label="Open →" />
    </>
  );
}

function CategoryPortalBody({ card }: { card: PortalBrowseCard }) {
  const examples = card.examples?.slice(0, 3) ?? [];

  return (
    <>
      <div className="explorer-explore-card__body">
        <p className="explorer-explore-card__title explorer-explore-card__title--portal">
          {card.title}
        </p>
        <p className="explorer-explore-card__description">{card.description}</p>
        {examples.length > 0 ? (
          <ul className="explorer-explore-card__example-list">
            {examples.map((example) => (
              <li key={example} className="break-russian">
                {example}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <CardCta label="Explore →" />
    </>
  );
}

function EntityPortalBody({ card }: { card: PortalBrowseCard }) {
  return (
    <>
      <div className="explorer-explore-card__body">
        <p className="explorer-explore-card__title break-russian">{card.title}</p>
        {card.description ? (
          <p className="explorer-explore-card__description">{card.description}</p>
        ) : null}
        {card.context ? <CardContext>{card.context}</CardContext> : null}
      </div>
      <CardCta label="Explore →" />
    </>
  );
}

function PortalCardBody({ card }: { card: PortalBrowseCard }) {
  if (card.portalKind === "category") {
    return <CategoryPortalBody card={card} />;
  }
  return <EntityPortalBody card={card} />;
}

export function ExplorerExploreCard({ card, featured = false }: ExplorerExploreCardProps) {
  const isCategoryPortal = card.kind === "portal" && card.portalKind === "category";

  return (
    <Link
      href={card.href}
      className={[
        "explorer-explore-card focus-kb",
        featured ? "explorer-explore-card--featured" : "",
        card.kind === "case" ? "explorer-explore-card--case" : "",
        isCategoryPortal ? "explorer-explore-card--category-portal" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {card.kind === "lemma" ? <LemmaCardBody card={card} /> : null}
      {card.kind === "concept" ? <ConceptCardBody card={card} /> : null}
      {card.kind === "case" ? <CaseCardBody card={card} /> : null}
      {card.kind === "portal" ? <PortalCardBody card={card} /> : null}
    </Link>
  );
}
