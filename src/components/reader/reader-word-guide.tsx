import type { ReaderWordGuideView } from "@/types/reader-word-guide";

type ReaderWordGuideProps = {
  guide: ReaderWordGuideView;
};

export function ReaderWordGuide({ guide }: ReaderWordGuideProps) {
  if (guide.mode !== "guide" || !guide.headline) {
    return null;
  }

  return (
    <section className="reader-word-guide" aria-label={guide.headline}>
      <h3 className="reader-word-guide__headline">{guide.headline}</h3>

      {guide.notice ? (
        <div className="reader-word-guide__notice">
          <p className="reader-word-guide__notice-lead">Regarde bien.</p>
          {guide.notice.priorForm ? (
            <div className="reader-word-guide__compare">
              <div className="reader-word-guide__compare-col">
                <span className="reader-word-guide__compare-label">Tu as déjà vu</span>
                <span className="reader-word-guide__compare-form break-russian">
                  {guide.notice.priorForm}
                </span>
              </div>
              <div className="reader-word-guide__compare-col reader-word-guide__compare-col--now">
                <span className="reader-word-guide__compare-label">Aujourd&apos;hui tu lis</span>
                <span className="reader-word-guide__compare-form break-russian reader-word-guide__compare-form--active">
                  {guide.notice.currentForm}
                </span>
              </div>
            </div>
          ) : (
            <p className="reader-word-guide__current-form break-russian">{guide.notice.currentForm}</p>
          )}
          <p className="reader-word-guide__bridge">{guide.notice.bridge}</p>
        </div>
      ) : null}

      {guide.discovery ? (
        <div className="reader-word-guide__discovery">
          <p className="reader-word-guide__discovery-text">{guide.discovery}</p>
        </div>
      ) : null}

      {guide.explanation ? (
        <div className="reader-word-guide__explanation">
          <p className="reader-word-guide__explanation-text">{guide.explanation}</p>
        </div>
      ) : null}

      {guide.exampleLine ? (
        <blockquote className="reader-word-guide__example">
          <span className="reader-word-guide__example-label">Dans cette phrase</span>
          <p className="reader-word-guide__example-line break-russian">{guide.exampleLine}</p>
        </blockquote>
      ) : null}
    </section>
  );
}
