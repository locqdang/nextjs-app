import { userAgent } from "next/server";
import { RequireAuth } from "../lib/auth";
import { useAuth } from "../lib/auth";


export default function haroPitches() {

  // Retrieve pitches from database
  // const pitches = findMany("requests", {"expert_email": userEmail})
  // console.log(pitches);
  
  return (
    <RequireAuth>
      <main>
        <h1 className="h1">Haro Pitches</h1>
      </main>
    </RequireAuth>
  );
}
