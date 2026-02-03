import { RequireAuth } from "../lib/auth";

export default function SecretPage() {
  return (
    <RequireAuth>
      <main>
        <h1 className="h1">There is no secret</h1>
      </main>
    </RequireAuth>
  );
}
