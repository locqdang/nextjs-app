// components/Hero.jsx
export default function Hero({ data }) {
  const headline = data?.headline ?? 'Strapi Connection Issue';
  const subHeadline = data?.subHeadline ?? data?.subHealine ?? '';
  const introText = data?.introText ?? '';
  const b1 = data?.button1 ?? { label: 'See Projects', url: '/projects' };
  const b2 = data?.button2 ?? { label: 'Book a Meeting', url: '/video-meeting' };

  return (
    <section className="hero">
      <div className="hero__content">
        <div className="hero__panel">
          <p className="hero__eyebrow">Vietpolyglots</p>
          <h1>{headline}</h1>
          {subHeadline && <p className="hero__subheadline">{subHeadline}</p>}
          {introText && <p className="hero__intro">{introText}</p>}

          {(b1?.label || b2?.label) && (
            <div className="hero__cta">
              {b1?.label && (
                <a className="btn hero__btn" href={b1?.url ?? '/projects'}>
                  {b1.label}
                </a>
              )}
              {b2?.label && (
                <a
                  className="btn btn--ghost hero__btn hero__btn--ghost"
                  href={b2?.url ?? '/video-meeting'}
                >
                  {b2.label}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
