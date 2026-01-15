# Architecture Overview

## Goal
Simulate the real flow using mock data → local storage → later swap to Graph + MongoDB.

## Architecture Diagram
```
[Mock Teams Transcript (.vtt)] 
        ↓
[Transcript Processor Service]
        ↓
[Local Storage (JSON files)]
        ↓
[APIs for retrieval/search]
```

## Future Real Flow
```
Teams → Microsoft Graph → Transcript Fetcher → MongoDB Atlas → APIs/Dashboard
```

## Components
1. **Mock Teams Transcript**: Sample WebVTT files that imitate Teams transcripts.
2. **Transcript Processor Service**: A Node.js application that reads, parses, and converts VTT files into structured JSON.
3. **Local Storage**: JSON files that temporarily store the structured data before transitioning to a database.
4. **APIs**: Endpoints for retrieving and searching transcripts.

## Data Flow
1. **Input**: WebVTT files containing transcripts.
2. **Processing**: Parsing the VTT files to extract timestamps, speaker names, and dialogue.
3. **Output**: Structured JSON data stored in local files, accessible via API endpoints.

## Future Enhancements
- Integration with Microsoft Graph for real-time transcript fetching.
- Migration to MongoDB Atlas for scalable data storage.
- Implementation of AI features for summarization and analytics.