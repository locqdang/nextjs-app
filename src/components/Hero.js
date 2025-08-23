// components/Hero.jsx
export default function Hero({ data }) {
  const headline = data?.headline ?? "Your headline";
  const subHeadline = data?.subHeadline ?? data?.subHealine ?? "";
  const b1 = data?.button1 ?? {};
  const b2 = data?.button2 ?? {};

  return (
    <section className="hero">
      <div className="hero__content">
        <h1>{headline}</h1>
        {subHeadline && <p>{subHeadline}</p>}

        {(b1?.label || b2?.label) && (
          <div className="hero__cta">
            {b1?.label && (
              <a className="btn" href={b1?.href ?? "#projects"}>
                {b1.label}
              </a>
            )}
            {b2?.label && (
              <a className="btn btn--ghost" href={b2?.href ?? "#contact"}>
                {b2.label}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
