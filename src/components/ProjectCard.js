// components/ProjectCard.jsx
import Link from "next/link";

export default function ProjectCard({ project }) {
  const img =
    project.logo?.formats?.thumbnail ??
    project.logo?.formats?.small ??
    project.logo ?? null;

  const logoUrl = img?.url ?? null;
  const logoAlt = project.logo?.alternativeText || project.name || "Logo";
  const href = project.url || "";

  return (
    <article className="card">
      {logoUrl && (
        <div className="card__media">
          <img
            src={logoUrl}
            alt={logoAlt}
            className="card__image"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <div className="card__body">
        <h3 className="card__title">{project.name}</h3>
        {project.description && <p className="card__text">{project.description}</p>}
        {!!project.skillTags?.length && (
          <ul className="card__tags">
            {project.skillTags.map((t) => (
              <li key={t.id ?? t.name} className="tag">{t.name}</li>
            ))}
          </ul>
        )}
      </div>

      {href && (
        <div className="card__footer">
          <Link className="btn btn--sm" href={href}>View</Link>
        </div>
      )}
    </article>
  );
}
