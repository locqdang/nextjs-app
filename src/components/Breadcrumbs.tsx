import Link from 'next/link';

export default function Breadcrumbs({ pathname }: { pathname: string }) {
  const parts = pathname.split('/').filter(Boolean);

  const items = [
    { label: 'HOME', href: '/' },
    ...parts.map((part, index) => {
      const href = '/' + parts.slice(0, index + 1).join('/');

      return {
        label: decodeURIComponent(part).replaceAll('-', ' ').toUpperCase(),
        href,
      };
    }),
  ];

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="breadcrumbs__item">
              {isLast ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}

              {!isLast && <span className="breadcrumbs__separator">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
