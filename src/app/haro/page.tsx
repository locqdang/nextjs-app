import Link from 'next/link';

// Central config for HARO landing cards so section links stay easy to update.
const haroSections = [
  {
    title: 'Pitches',
    description: 'Review outreach generated on your behalf and track recent match activity.',
    href: '/haro/pitches',
  },
  {
    title: 'Profile',
    description: 'Manage the HARO profile details that support your pitching workflow.',
    href: '/haro/profile',
  },
  {
    title: 'Journalists',
    description: 'Browse the journalist workspace as that section comes online.',
    href: '/haro/journalists',
  },
];

export default function HaroLandingPage() {
  // Provide a single entry point into HARO sub-workspaces.
  return (
    <main className="haro-landing">
      <section className="haro-landing__hero">
        <p className="haro-landing__eyebrow">HARO Workspace</p>
        <h1>Manage your HARO workflow from one place</h1>
        <p className="haro-landing__intro">
          This section is the entry point for your profile, pitches, mailbox setup, and journalist
          workspace. Use the links below or the HARO navigation to move into each section.
        </p>
        <Link href="/haro/pitches" className="btn">
          View Pitches
        </Link>
      </section>

      <section className="haro-landing__grid">
        {haroSections.map((section) => (
          <article key={section.href} className="haro-landing__card">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
            <Link href={section.href} className="btn btn--ghost">
              Open
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
