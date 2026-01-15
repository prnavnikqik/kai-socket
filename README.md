# MeetingAI

A Next.js application that parses Microsoft Teams meeting transcripts (WebVTT format), stores normalized meeting objects, and provides REST APIs for search and RAG-ready chunks.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```
   Server runs on port 5656

3. **Import sample data:**
   ```bash
   # PowerShell
   Invoke-RestMethod -Uri http://localhost:5656/api/import-mock -Method Post
   
   # cURL
   curl -X POST http://localhost:5656/api/import-mock
   ```

4. **Open the app:**
   Navigate to `http://localhost:5656`

## API Endpoints

- `GET /api/transcripts` - List all meetings
- `GET /api/transcripts/:meetingId` - Get full transcript
- `GET /api/search?q=term` - Search transcripts
- `GET /api/chunks/:meetingId` - Get RAG chunks
- `POST /api/import-mock` - Import VTT files

## MongoDB Support

Set environment variables to use MongoDB:
```bash
MONGO_URL=mongodb://localhost:27017
MONGO_DB=teams_notes
```

## Troubleshooting

### Port 5656 Already in Use

If you get `EADDRINUSE` error:

1. **Find and kill the process:**
   ```powershell
   netstat -ano | findstr :5656
   taskkill /PID <PID_NUMBER> /F
   ```
   (Run PowerShell as Administrator if you get "Access is denied")

## Presentation Guide

For detailed instructions on how to run, use, and present this prototype, see:
- **`HOW_TO_RUN_AND_PRESENT.md`** - Complete guide with demo script and talking points

## License

MIT
