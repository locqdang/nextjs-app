import UnderConstructionPage from '../../../components/UnderConstructionPage';

export default function AccountProfilePage() {
  // Reserve account profile route while full settings UI is still pending.
  return (
    <UnderConstructionPage
      eyebrow="Account"
      title="Profile page is under construction"
      description="This profile area is not ready yet. The navigation is in place, but the page content still needs to be built."
      backHref="/"
      backLabel="Back to Home"
    />
  );
}
