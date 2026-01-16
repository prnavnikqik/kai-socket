# Kai — Meeting Transcript Prototype

Lightweight mock pipeline that parses WebVTT transcripts, stores normalized meeting objects locally, exposes simple APIs and produces RAG-ready chunks.

This repo has been consolidated to use `teams-notes-web/` as the canonical app (Next.js with a lightweight backend adapter and local storage). The older `teams-notes/` service folder is now redundant and can be removed.

Quick start (Windows PowerShell)

1. Stop any process using port 3000 (if necessary):

   ```
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. Install dependencies for the web app:

   ```
   cd .\teams-notes-web
   npm install
   ```

3. Start the dev server (from teams-notes-web folder):

   ```
   npm run dev
   ```

   If `npm run dev` is not defined, use:

   ```
   npx next dev --port 3000
   ```

4. Seed mock transcripts (after server is running):

   ```
   curl -X POST http://localhost:3000/api/import-mock
   ```

   or in PowerShell:

   ```
   Invoke-RestMethod -Uri http://localhost:3000/api/import-mock -Method Post
   ```

5. Open the demo UI in your browser:

   ```
   http://localhost:3000
   ```

APIs

- GET /api/transcripts — list meeting summaries
- GET /api/transcripts/:meetingId — get full meeting
- GET /api/search?q=term — search across entries
- GET /api/chunks/:meetingId — get chunk list for meeting
- POST /api/import-mock — import mock VTTs from `teams-notes-web/public/mock_data`

Data files (generated)

- teams-notes-web/data/transcripts.json
- teams-notes-web/data/chunks.json

To remove legacy files

If you no longer need the legacy service, delete the `teams-notes/` folder. Ensure you have migrated any needed utilities into `teams-notes-web/lib/` before deleting.

Notes

- To enable MongoDB for production, set MONGO_URL and MONGO_DB environment variables. The web app will upsert transcripts and chunks into Mongo when configured.
- Keep `data/` out of version control (it's in .gitignore) unless you intentionally commit seeded data.

License: MIT
