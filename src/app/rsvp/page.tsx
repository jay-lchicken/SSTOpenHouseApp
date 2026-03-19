"use client"
import {FormEvent, useState} from 'react';

export default function RSVPPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleRSVP(e: FormEvent) {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please fill in your name and email.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/openhouse-rsvp', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email}),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setStatus('success');
    } catch (err: any) {
      if (err && 'message' in err) {
        setErrorMsg(err.message);
        setStatus('error');
      }
    }


  }
  if (status === 'success') {
      return (
          <div className="app-domain rsvp-page">
            <div className="texts">
              <h1>You're in! 🎉</h1>
              <h3>We've received your RSVP. See you at SST Open House 2026!</h3>
            </div>
          </div>
      );
    }

  return (
      <div className="app-domain rsvp-page">
        <div className="texts">
          <h1>
            <span>RSVP</span> for SST Open House 2026!
          </h1>
          <h3>
            Get ready for immersive experiences to help decide if SST is the
            school for you!
          </h3>
          <form onSubmit={handleRSVP}>
            <input
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
      </div>
  );
}
