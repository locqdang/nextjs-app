import Link from 'next/link';

type UnderConstructionPageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
};

export default function UnderConstructionPage({
  eyebrow = 'Under Construction',
  title,
  description,
  backHref = '/',
  backLabel = 'Go Home',
}: UnderConstructionPageProps) {
  return (
    <main className="under-construction">
      <section className="under-construction__card">
        <p className="under-construction__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="under-construction__text">{description}</p>
        <Link href={backHref} className="btn">
          {backLabel}
        </Link>
      </section>
    </main>
  );
}
