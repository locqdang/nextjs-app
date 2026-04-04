import { useEffect, useState } from "react";
import { RequireAuth, useAuth } from "../lib/auth";
import Booking from "../components/Booking";

export default function booking() {

  const { user } = useAuth();
  const [ error, setError ] = useState(null);
  const [ pitches, setPitches ] = useState(null);
  const [ pagination, setPagination ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ currentPage, setCurrentPage] = useState(1);
  const [ limit, setLimit] = useState(2);

  useEffect(()=>{
  

},[user?.email, currentPage, limit])

  

  return (
    <RequireAuth>
      <main>
        <h1 className="h1">Book a Video Meeting</h1>
        <Booking></Booking>
      </main>
    </RequireAuth>
  );
}
