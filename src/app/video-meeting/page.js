'use client';

import { RequireAuth } from '../../lib/auth';
import Booking from '../../components/Booking';

export default function VideoMeetingPage() {
  return (
    <RequireAuth>
      <main>
        <h1 className="h1">Book a Video Meeting</h1>
        <Booking />
      </main>
    </RequireAuth>
  );
}
