import type { ExplorerWordPresentation } from "./explorer-word-presentation";

type ExplorerMicroscopePanelProps = {
  presentation: ExplorerWordPresentation;
};

export function ExplorerMicroscopePanel({ presentation }: ExplorerMicroscopePanelProps) {
  const showAspectPair = Boolean(presentation.imperfective || presentation.perfective);

  return (
    <div className="explorer-microscope">
      <p className="explorer-microscope__title">Microscope</p>

      {showAspectPair ? (
        <section className="explorer-microscope__section">
          <h3 className="explorer-microscope__section-title">Paire Aspectuelle</h3>
          <div className="explorer-microscope__aspect-pair">
            <span className="explorer-microscope__aspect-block">
              {presentation.imperfective ?? "—"}
            </span>
            <span className="explorer-microscope__aspect-arrow" aria-hidden>
              &rarr;
            </span>
            <span className="explorer-microscope__aspect-block">
              {presentation.perfective ?? "—"}
            </span>
          </div>
        </section>
      ) : null}

      {presentation.constructions.length > 0 ? (
        <section className="explorer-microscope__section">
          <h3 className="explorer-microscope__section-title">Constructions fréquentes</h3>
          <ul className="explorer-microscope__list">
            {presentation.constructions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {presentation.usageNote ? (
        <section className="explorer-microscope__note">
          <h3 className="explorer-microscope__note-title">Note d&apos;usage</h3>
          <p className="explorer-microscope__note-text">{presentation.usageNote}</p>
        </section>
      ) : null}
    </div>
  );
}
