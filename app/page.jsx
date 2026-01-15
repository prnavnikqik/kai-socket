'use client';
import { useEffect, useState } from 'react';

export default function Page() {
  const [meetings, setMeetings] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/transcripts').then(r => r.json()).then(setMeetings).catch(console.error);
  }, []);

  async function doSearch(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    setResults(json);
    setLoading(false);
  }

  async function doImport() {
    setLoading(true);
    await fetch('/api/import-mock', { method: 'POST' });
    const updated = await fetch('/api/transcripts').then(r => r.json());
    setMeetings(updated);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Teams Notes Demo</h1>
      <div style={{ marginBottom: 10 }}>
        <button onClick={doImport} disabled={loading}>Import mock VTTs</button>
      </div>

      <h2>Meetings</h2>
      <ul>
        {meetings.map(m => (
          <li key={m.meetingId}>{m.meetingId} — {m.source || m.importedAt}</li>
        ))}
      </ul>

      <h2>Search</h2>
      <form onSubmit={doSearch}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="search term" />
        <button type="submit" disabled={loading}>Search</button>
      </form>

      {loading && <div>Loading…</div>}

      <h3>Results</h3>
      <ul>
        {results.map((r, idx) => (
          <li key={idx}>{r.meetingId}: {r.entry.speaker} — {r.entry.text}</li>
        ))}
      </ul>
    </div>
  );
}
