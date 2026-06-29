import type { ReaderWordGuideView } from "@/types/reader-word-guide";

type ReaderWordGuideProps = {
  guide: ReaderWordGuideView;
};

export function ReaderWordGuide({ guide }: ReaderWordGuideProps) {
  if (guide.mode !== "guide" || !guide.headline || !guide.copy) {
    return null;
  }

  const copy = guide.copy;

  return (
    <section className="reader-word-guide" aria-label={guide.headline}>
      <h3 className="reader-word-guide__headline">{guide.headline}</h3>

      {guide.compare ? (
        <div className="reader-word-guide__notice">
          <p className="reader-word-guide__notice-lead">{copy.noticeLead}</p>
          {guide.compare.priorForm ? (
            <div className="reader-word-guide__compare">
              <div className="reader-word-guide__compare-col">
                <span className="reader-word-guide__compare-label">{copy.comparePriorLabel}</span>
                <span className="reader-word-guide__compare-form break-russian">
                  {guide.compare.priorForm}
                </span>
              </div>
              <div className="reader-word-guide__compare-col reader-word-guide__compare-col--now">
                <span className="reader-word-guide__compare-label">{copy.compareCurrentLabel}</span>
                <span className="reader-word-guide__compare-form break-russian reader-word-guide__compare-form--active">
                  {guide.compare.currentForm}
                </span>
              </div>
            </div>
          ) : (
            <p className="reader-word-guide__current-form break-russian">{guide.compare.currentForm}</p>
          )}
        </div>
      ) : null}

      {guide.invitation ? (
        <p className="reader-word-guide__bridge">{guide.invitation}</p>
      ) : null}

      {guide.secondEncounter ? (
        <div className="reader-word-guide__discovery">
          <p className="reader-word-guide__discovery-text">{guide.secondEncounter}</p>
        </div>
      ) : null}

      {guide.observe ? (
        <div className="reader-word-guide__explanation">
          <p className="reader-word-guide__explanation-text">{guide.observe}</p>
        </div>
      ) : null}

      {guide.insight ? (
        <div className="reader-word-guide__explanation reader-word-guide__explanation--insight">
          <p className="reader-word-guide__explanation-text">{guide.insight}</p>
        </div>
      ) : null}

      {guide.understand ? (
        <div className="reader-word-guide__explanation reader-word-guide__explanation--understand">
          <p className="reader-word-guide__explanation-text">{guide.understand}</p>
        </div>
      ) : null}

      {guide.exampleLine ? (
        <blockquote className="reader-word-guide__example">
          <span className="reader-word-guide__example-label">{copy.exampleLabel}</span>
          <p className="reader-word-guide__example-line break-russian">{guide.exampleLine}</p>
        </blockquote>
      ) : null}
    </section>
  );
}
