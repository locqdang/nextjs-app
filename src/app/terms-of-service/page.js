export default function TermsOfServicePage() {
  // Keep legal revision date centralized for easier policy updates.
  const lastUpdated = 'May 17, 2026';

  return (
    <main className="legal-page">
      <div className="legal-page__hero">
        <p className="legal-page__eyebrow">Legal</p>
        <h1>Terms of Service</h1>
        <p>
          These Terms of Service govern your access to and use of the Vietpolyglots website and
          related services.
        </p>
        <p className="legal-page__meta">Last updated: {lastUpdated}</p>
      </div>

      <section className="legal-page__section">
        <h2>Acceptance of terms</h2>
        <p>
          By accessing or using this website or related services, you agree to be bound by these
          Terms of Service. If you do not agree, do not use the service.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Use of the service</h2>
        <p>
          You may use the website only for lawful purposes and in a way that does not interfere with
          the operation, security, or availability of the service.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Accounts and authentication</h2>
        <p>
          Some features may require account access or third-party authentication. You are
          responsible for providing accurate information and for maintaining the security of your
          account or authentication credentials.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Prohibited conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the service for unlawful, fraudulent, or misleading activity.</li>
          <li>Attempt to gain unauthorized access to accounts, systems, or data.</li>
          <li>Interfere with the site, infrastructure, or security measures.</li>
          <li>Copy, scrape, reverse engineer, or exploit the service beyond permitted use.</li>
        </ul>
      </section>

      <section className="legal-page__section">
        <h2>Intellectual property</h2>
        <p>
          Unless otherwise stated, the content, branding, design, and materials on this website are
          owned by or licensed to Vietpolyglots and are protected by applicable intellectual
          property laws.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Third-party services</h2>
        <p>
          The service may integrate with third-party platforms or providers, including
          authentication providers. We are not responsible for the content, policies, or
          availability of third-party services.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Disclaimers</h2>
        <p>
          The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
          warranties of any kind, whether express or implied, to the fullest extent permitted by
          law.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Vietpolyglots will not be liable for indirect,
          incidental, special, consequential, or punitive damages, or for loss of data, revenue,
          profits, or business opportunities arising from use of the service.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Termination</h2>
        <p>
          We may suspend or terminate access to the service at any time if we reasonably believe a
          user has violated these terms or created risk to the service or others.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Changes to the service or terms</h2>
        <p>
          We may update the service or these terms from time to time. Continued use after an update
          means you accept the revised terms.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Contact</h2>
        <p>
          For questions about these terms, contact{' '}
          <a href="mailto:locqdang@gmail.com">locqdang@gmail.com</a>.
        </p>
      </section>
    </main>
  );
}
