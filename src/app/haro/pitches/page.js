'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth';
import HaroPitch from '../../../components/HaroPitch';
import Pagination from '../../../components/Pagination';

export default function HaroPitchesPage() {
  // Require authenticated user context before loading private HARO pitch data.
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [pitches, setPitches] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(2);

  useEffect(() => {
    const loadPitches = async () => {
      try {
        // Lock UI while fetching the current page of pitches from protected API.
        setLoading(true);

        const token = localStorage.getItem('token');
        const res = await fetch(`/api/haro/pitches?page=${currentPage}&limit=${limit}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load pitches');
        }
        setPitches(data.pitches);
        setPagination(data.pagination);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch pitches only after auth is resolved and email is available.
    if (user?.email) void loadPitches();
  }, [user?.email, currentPage, limit]);

  return (
    <main className="haro-pitches">
      <section className="haro-pitches__hero">
        <p className="haro-pitches__eyebrow">HARO Workspace</p>
        <h1>Recent Pitches</h1>
        <p className="haro-pitches__intro">
          Review outreach that has been generated on your behalf, track active matches, and scan
          deadlines before they expire.
        </p>
      </section>

      {error && <p className="haro-pitches__state haro-pitches__state--error">{error}</p>}
      {loading && <p className="haro-pitches__state">Loading pitches...</p>}

      <section className="haro-pitches__list">
        {(!pitches || pitches.length === 0) && (
          <p className="haro-pitches__state">No pitch has been done on your behalf.</p>
        )}
        {pitches && pitches.map((pitch) => <HaroPitch key={pitch.match_id} pitch={pitch} />)}
      </section>

      <Pagination
        currentPage={currentPage}
        totalPages={pagination?.totalPages ?? 1}
        onPageSelect={setCurrentPage}
        limit={limit}
        setLimit={setLimit}
        loading={loading}
      />
    </main>
  );
}
