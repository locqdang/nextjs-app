export default function PrivacyPolicyPage() {
  const lastUpdated = 'May 17, 2026';

  return (
    <main className="legal-page">
      <div className="legal-page__hero">
        <p className="legal-page__eyebrow">Legal</p>
        <h1>Privacy Policy</h1>
        <p>
          This Privacy Policy explains how Vietpolyglots collects, uses, and protects personal
          information when you use our website and related services.
        </p>
        <p className="legal-page__meta">Last updated: {lastUpdated}</p>
      </div>

      <section className="legal-page__section">
        <h2>Who we are</h2>
        <p>
          Vietpolyglots operates this website and related online services, including future tools or
          applications connected to the site.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Information we collect</h2>
        <p>We may collect the following categories of information:</p>
        <ul>
          <li>Contact details you provide, such as your name and email address.</li>
          <li>Account or authentication details when you sign in or request secure access.</li>
          <li>Messages or other information you submit through forms or direct communication.</li>
          <li>
            Technical data such as IP address, browser type, device information, referral pages, and
            site usage data.
          </li>
        </ul>
      </section>

      <section className="legal-page__section">
        <h2>How we use information</h2>
        <p>We use personal information to:</p>
        <ul>
          <li>Provide, maintain, and improve the website and related services.</li>
          <li>Respond to inquiries and communicate with users.</li>
          <li>Authenticate users and help keep accounts secure.</li>
          <li>Monitor performance, diagnose issues, and prevent abuse or fraud.</li>
          <li>Comply with legal obligations and enforce our terms.</li>
        </ul>
      </section>

      <section className="legal-page__section">
        <h2>Google authentication and third-party services</h2>
        <p>
          If you choose to sign in with Google or another third-party provider, we may receive
          limited profile data such as your email address, name, and a provider-specific account
          identifier. We use that information only to verify identity, create or connect an account,
          and support the sign-in flow.
        </p>
        <p>
          We may also use service providers for hosting, analytics, infrastructure, or security.
          Those providers may process data on our behalf as needed to operate the service.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Cookies and similar technologies</h2>
        <p>
          We may use cookies, local storage, and similar technologies to remember preferences,
          maintain sessions, measure usage, and improve reliability. You can control cookies through
          your browser settings, though some features may stop working properly if you disable them.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Data sharing</h2>
        <p>
          We do not sell personal information. We may share information with trusted service
          providers, when required by law, or when reasonably necessary to protect our rights,
          users, systems, or business operations.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Data retention</h2>
        <p>
          We retain personal information only as long as necessary for the purposes described in
          this policy, including legal, security, operational, and recordkeeping needs.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Your choices</h2>
        <p>
          Depending on your location, you may have rights to request access, correction, or deletion
          of personal information. You may also contact us to ask questions about how your data is
          handled.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Security</h2>
        <p>
          We use reasonable administrative, technical, and organizational safeguards to protect
          personal information. No method of transmission or storage is completely secure, so we
          cannot guarantee absolute security.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will post the revised
          version on this page and update the effective date above.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Contact</h2>
        <p>
          For privacy questions, contact <a href="mailto:locqdang@gmail.com">locqdang@gmail.com</a>.
        </p>
      </section>
    </main>
  );
}
