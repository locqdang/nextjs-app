// components/ProjectCard.jsx
import Link from 'next/link';
import Image from 'next/image';

export default function ProjectCard({ project }) {
  const img =
    project.logo?.formats?.thumbnail ?? project.logo?.formats?.small ?? project.logo ?? null;

  const logoUrl = img?.url ?? null;
  const logoAlt = project.logo?.alternativeText || project.name || 'Logo';
  const href = project.url || '';
  const logoWidth = img?.width ?? 200;
  const logoHeight = img?.height ?? 80;

  return (
    <article className="card">
      {logoUrl && (
        <div className="card__media" style={{ position: 'relative' }}>
          <Image
            src={logoUrl}
            alt={logoAlt}
            className="card__image"
            width={logoWidth}
            height={logoHeight}
          />
        </div>
      )}

      <div className="card__body">
        <h3 className="card__title">{project.name}</h3>
        {project.description && <p className="card__text">{project.description}</p>}
        {!!project.skillTags?.length && (
          <ul className="card__tags">
            {project.skillTags.map((t) => (
              <li key={t.id ?? t.name} className="tag">
                {t.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {href && (
        <div className="card__footer">
          <Link className="btn btn--sm" href={href} rel="nofollow">
            View
          </Link>
        </div>
      )}
    </article>
  );
}
