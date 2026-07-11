// components/Hero.jsx
import Link from 'next/link';
import { isExternalUrl, normalizeLinkUrl } from '../lib/security';

export default function Hero({ data }) {
  const headline = data?.headline ?? 'Strapi Connection Issue';
  const subHeadline = data?.subHeadline ?? data?.subHealine ?? '';
  const introText = data?.introText ?? '';
  const b1 = data?.button1 ?? { label: 'See Projects', url: '/projects' };
  const b2 = data?.button2 ?? { label: 'Book a Meeting', url: '/video-meeting' };
  const primaryHref = normalizeLinkUrl(b1?.url) ?? '/projects';
  const secondaryHref = normalizeLinkUrl(b2?.url) ?? '/video-meeting';

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
              {b1?.label &&
                (isExternalUrl(primaryHref) ? (
                  <a
                    className="btn hero__btn"
                    href={primaryHref}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                  >
                    {b1.label}
                  </a>
                ) : (
                  <Link className="btn hero__btn" href={primaryHref}>
                    {b1.label}
                  </Link>
                ))}
              {b2?.label &&
                (isExternalUrl(secondaryHref) ? (
                  <a
                    className="btn btn--ghost hero__btn hero__btn--ghost"
                    href={secondaryHref}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                  >
                    {b2.label}
                  </a>
                ) : (
                  <Link className="btn btn--ghost hero__btn hero__btn--ghost" href={secondaryHref}>
                    {b2.label}
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
