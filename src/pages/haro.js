import { useEffect, useState } from "react";
import { RequireAuth, useAuth } from "../lib/auth";
import HaroPitch from "../components/HaroPitch";

export default function haroPitches() {

  const { user } = useAuth();
  const [ error, setError ] = useState(null);
  const [ pitches, setPitches ] = useState(null);

  useEffect(()=>{
    const loadPitches = async () =>{
      try {
        const token = localStorage.getItem("token");
        // console.log({token})
        const res = await fetch('/api/haro/pitches',{
          headers:{
            authorization: `Bearer ${token}`
          }
        })
        const data = await res.json();
        if(!res.ok){ throw new Error(data.error || "Failed to load pitches")}
        setPitches(data.pitches);
      } catch(e) {
        setError(e.message)
      }
    }
    
    if (user?.email) loadPitches();

},[user?.email])

  

  return (
    <RequireAuth>
      <main>
        <h1 className="h1">Haro Pitches</h1>
        {error && <p>{error}</p>}
        <div>
          {pitches && pitches.map((p)=>(<HaroPitch key={p.match_id} pitch={p}/>))}
        </div>
      </main>
    </RequireAuth>
  );
}
