import Link from "next/link";

export default function ProjectCard({ title, description, href, tags = [] }) {
  return (
    <article className="card">
      <div className="card__body">
        <h3 className="card__title">{title}</h3>
        <p className="card__text">{description}</p>
        {tags?.length > 0 && (
          <ul className="card__tags">
            {tags.map((t) => (
              <li key={t} className="tag">
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
      {href && (
        <div className="card__footer">
          <Link className="btn btn--sm" href={href}>
            View
          </Link>
        </div>
      )}
    </article>
  );
}
