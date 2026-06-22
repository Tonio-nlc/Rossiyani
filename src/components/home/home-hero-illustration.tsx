export function HomeHeroIllustration() {
  return (
    <div className="home-hero-illustration" aria-hidden>
      <div className="home-hero-illustration__frame">
        <p className="home-hero-illustration__label">В метро</p>
        <div className="home-hero-illustration__rule" />
        <p className="home-hero-illustration__line home-hero-illustration__line--ru">
          Я смотрел в окно и думал о встрече.
        </p>
        <p className="home-hero-illustration__line home-hero-illustration__line--muted">
          Je regardais par la fenêtre et pensais à la rencontre.
        </p>
        <div className="home-hero-illustration__annotations">
          <span className="home-hero-illustration__chip">встреча · nom</span>
          <span className="home-hero-illustration__chip">предложный</span>
          <span className="home-hero-illustration__chip">о + prep.</span>
        </div>
        <div className="home-hero-illustration__margin">
          <span className="home-hero-illustration__margin-label">Explorer</span>
          <span className="home-hero-illustration__margin-item">встреча</span>
          <span className="home-hero-illustration__margin-item">думать о</span>
        </div>
      </div>
    </div>
  );
}
