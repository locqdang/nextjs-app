import HaroProfileClient from './HaroProfileClient';

export default function HaroProfilePage() {
  // Keep route wrapper thin; profile behavior lives in the client component.
  return <HaroProfileClient />;
}
