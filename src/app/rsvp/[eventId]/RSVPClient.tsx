"use client";

import { FormEvent, useState } from 'react';

interface BoothEvent {
  name: string;
  time: string;
}

type EventInfo = {
  boothName: string;
  boothVenue: string;
  event: BoothEvent;
} | null;


interface Props {
  eventId: string;
  eventInfo: EventInfo;
}

export default function RSVPClient({ eventId, eventInfo }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleRSVP(e: FormEvent) {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please fill in your email.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/event-rsvp', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, eventId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Unknown error');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="app-domain rsvp-page">
        <div className="texts">
          <h1>You're in!</h1>
          <h3>We've received your RSVP. See you at SST Open House 2026!</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="app-domain rsvp-page">
      <div className="texts">
        <div className="rsvp-event-card">
          <p className="rsvp-eyebrow">Event RSVP</p>
          <h1 className="rsvp-event-title">
            {eventInfo ? eventInfo.event.name : 'Event Not Found'}
          </h1>
          {eventInfo ? (
            <div>
              <div className="rsvp-event-meta">
                <p className="rsvp-event-time">{eventInfo.event.time}</p>
                <p className="rsvp-event-venue">{eventInfo.boothName} · {eventInfo.boothVenue}</p>
              </div>
              <form className="rsvp-form" onSubmit={handleRSVP}>
                <input
                  className="rsvp-input"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {status === 'error' && <p>{errorMsg}</p>}
                <div className="but-cont">
                  <button className="rsvp-button" type="submit" disabled={status === 'loading'}>
                    <h3>{status === 'loading' ? 'Submitting...' : 'RSVP NOW!'}</h3>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <p className="rsvp-event-venue">We could not find this event. You can still RSVP below.</p>
          )}
          <a className="rsvp-back-link" href="/">Back to events</a>
        </div>
      </div>
    </div>
  );
}
