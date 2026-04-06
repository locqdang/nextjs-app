import { useEffect, useState } from "react";
import { RequireAuth, useAuth } from "../lib/auth";
import HaroPitch from "../components/HaroPitch";
import Pagination from "../components/Pagination";

export default function haroPitches() {

  const { user } = useAuth();
  const [ error, setError ] = useState(null);
  const [ pitches, setPitches ] = useState(null);
  const [ pagination, setPagination ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ currentPage, setCurrentPage] = useState(1);
  const [ limit, setLimit] = useState(2);

  useEffect(()=>{
    const loadPitches = async () =>{
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        // console.log({token})
        const res = await fetch(`/api/haro/pitches?page=${currentPage}&limit=${limit}`,{
          headers:{
            authorization: `Bearer ${token}`
          }
        })
        const data = await res.json();
        if(!res.ok){ throw new Error(data.error || "Failed to load pitches")}
        setPitches(data.pitches);
        setPagination(data.pagination);
        setLoading(false);
      } catch(e) {
        setError(e.message)
      }
    }
    
    if (user?.email) loadPitches();

},[user?.email, currentPage, limit])

  

  return (
    <RequireAuth>
      <main>
        <h1 className="h1">Haro Pitches</h1>
        {error && <p>{error}</p>}
        {loading && <p>loading...</p>}
        <div>
          {(!pitches || pitches.length === 0) && <p class="text-center p-6">No pitch has been done on your behalf.</p>}
          {pitches && pitches.map((p)=>(<HaroPitch key={p.match_id} pitch={p}/>))}
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={pagination?.totalPages ?? 1}
          onPageSelect={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          loading={loading}
        />
      </main>
    </RequireAuth>
  );
}
