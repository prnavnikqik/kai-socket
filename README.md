# Kai — Meeting Transcript Prototype

Lightweight mock pipeline that parses WebVTT transcripts, stores normalized meeting objects locally, exposes simple APIs and produces RAG-ready chunks.

Quick start (local)

1. Open PowerShell in the repo root (e.g. `C:\Users\pranav.patil\meetingAI`).
2. Install dependencies:

   npm install

3. Start server:

   npm start

4. Import mock transcripts (after server is running) — either call the import endpoint or let the server read mock files directly:

   POST http://localhost:3000/import-mock

APIs

- GET /health — health check
- GET /transcripts — list meeting summaries
- GET /transcripts/:meetingId — get full meeting (entries ordered)
- GET /search?q=term — search across entries
- GET /chunks/:meetingId — (placeholder) chunk set for a meeting
- POST /import-mock[?force=true] — import all `mock_data/*.vtt`

Data files

- `data/transcripts.json` — normalized meeting documents (one per VTT)
- `data/chunks.json` — RAG-ready chunks (created by chunker)

Notes

- The importer treats each `.vtt` file as a separate meeting. Do not mix meetings unless explicitly merging.
- By default `data/` is ignored in `.gitignore`; if you want to commit the seeded data, remove the ignore rule.

GitHub push (recommended)

- Use the GitHub CLI to login then create & push the repo securely (see the PowerShell snippet in this README).

License: MIT (adjust as needed)
