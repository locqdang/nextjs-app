'use client';

import Booking from '../../components/Booking';

export default function VideoMeetingPage() {
  // Keep this page focused on scheduling by delegating interaction details to Booking.
  return (
    <main>
      <h1 className="h1">Book a Video Meeting</h1>
      <Booking />
    </main>
  );
}
