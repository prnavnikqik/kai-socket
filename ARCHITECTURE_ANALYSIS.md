# Architecture Analysis & Chatbot Extension Plan

## ✅ Current Project Status (NOW)

### What We Have (Matches Diagram "NOW" Section)

#### ✅ Core Components
1. **Parser (`lib/parser.js`)**
   - ✅ Parses WebVTT → entries
   - ✅ Extracts timestamps, speakers, text
   - ✅ Matches diagram: "parser js (VTT > entries)"

2. **Indexer (`lib/indexer.js`)**
   - ✅ Converts entries → RAG chunks
   - ✅ 90-second time windows with overlap
   - ✅ Matches diagram: "indexer js (entries > chunks)"

3. **Storage (`lib/storage-files.js`)**
   - ✅ File-based storage (JSON)
   - ✅ MongoDB-ready (when MONGO_URL set)
   - ✅ Matches diagram: file storage

4. **API Endpoints**
   - ✅ `/api/transcripts` - List meetings
   - ✅ `/api/transcripts/:id` - Get transcript
   - ✅ `/api/chunks/:id` - Get RAG chunks
   - ✅ `/api/search?q=term` - Search
   - ✅ `/api/import-mock` - Import VTT files

5. **UI (`app/page.jsx`)**
   - ✅ List meetings
   - ✅ Search functionality
   - ✅ Matches diagram: "UI page: list, search, play"

### What's Missing from "NOW" Section
- ❌ Playback functionality (mentioned in diagram but not implemented)
- ❌ Recording demo (public/recordings/demo.mp4 exists but not integrated)

---

## 🚀 Future Architecture (FUTURE - Per Diagram)

### What We Need to Add

#### 1. Microsoft Graph Integration
**Status:** ❌ Not implemented

**Required:**
- Webhook subscription for transcript availability
- `GET /onlineMeetings/{id}/transcripts` - List transcripts
- `GET /onlineMeetings/{id}/transcripts/{id}/content` - Fetch VTT
- OAuth 2.0 client credentials flow
- Permissions: `OnlineMeetings.Read.All`

**Implementation Plan:**
```
lib/
  ├── graph-client.js      # Microsoft Graph API client
  ├── webhook-handler.js   # Handle Graph webhooks
  └── auth.js              # OAuth token management
```

#### 2. Embeddings Job
**Status:** ❌ Not implemented

**Required:**
- Generate vector embeddings for chunks
- Store embeddings in vector database
- Support semantic search

**Implementation Plan:**
```
lib/
  ├── embeddings.js        # Generate embeddings (OpenAI/Cohere/etc)
  └── vector-store.js     # Vector DB integration (Pinecone/Weaviate/MongoDB Atlas)
```

#### 3. Chatbot API
**Status:** ❌ Not implemented

**Required:**
- `/api/chat` or `/api/chatbot` endpoint
- RAG-based question answering
- Context from meeting transcripts
- Real-time assistance during meetings

**Implementation Plan:**
```
app/api/
  └── chat/
      └── route.js         # Chatbot endpoint

lib/
  ├── rag-engine.js       # RAG retrieval logic
  └── llm-client.js       # LLM integration (OpenAI/Anthropic/etc)
```

#### 4. Enhanced Metadata Enrichment
**Status:** ⚠️ Partial

**Current:** Basic metadata (meetingId, timestamps, speakers)
**Needed:** 
- Meeting title, participants list
- Topics extraction
- Action items detection
- Summary generation

---

## 🤖 Chatbot Extension Plan

### Architecture for Online Meeting Chatbot

```
┌─────────────────────────────────────────────────────────┐
│                    User in Teams Meeting                 │
│              (Asks question via chatbot)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Chatbot API (/api/chat)                     │
│  - Receives user question                                │
│  - Identifies current meeting context                    │
│  - Retrieves relevant chunks via RAG                     │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌──────────────────────┐
│  RAG Engine      │    │  Vector Search        │
│  - Query chunks  │◄───│  - Semantic search    │
│  - Rank results  │    │  - Embeddings match   │
└────────┬─────────┘    └──────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              LLM Client (OpenAI/Anthropic)               │
│  - Takes question + context chunks                        │
│  - Generates answer                                       │
│  - Returns response to user                              │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

#### Phase 1: Embeddings Infrastructure
1. **Add embeddings generation**
   ```javascript
   // lib/embeddings.js
   - Generate embeddings for chunks using OpenAI/Cohere
   - Store embeddings with chunk metadata
   ```

2. **Vector database setup**
   ```javascript
   // lib/vector-store.js
   - Pinecone/Weaviate/MongoDB Atlas Vector Search
   - Index chunks with embeddings
   - Support similarity search
   ```

#### Phase 2: RAG Engine
1. **Retrieval logic**
   ```javascript
   // lib/rag-engine.js
   - Query vector DB for relevant chunks
   - Rank by similarity score
   - Filter by meeting context
   - Return top-k chunks
   ```

2. **Context building**
   ```javascript
   - Combine retrieved chunks
   - Add meeting metadata
   - Format for LLM prompt
   ```

#### Phase 3: Chatbot API
1. **Chat endpoint**
   ```javascript
   // app/api/chat/route.js
   POST /api/chat
   {
     "question": "What was discussed about deployment?",
     "meetingId": "optional",
     "context": "current meeting"
   }
   ```

2. **LLM integration**
   ```javascript
   // lib/llm-client.js
   - OpenAI GPT-4/3.5
   - Anthropic Claude
   - Azure OpenAI
   ```

#### Phase 4: Real-time Integration
1. **Microsoft Teams Bot**
   - Bot Framework integration
   - Real-time message handling
   - Meeting context detection

2. **WebSocket/SSE**
   - Real-time responses
   - Streaming answers

---

## 📊 Current vs Future Comparison

| Component | NOW (Current) | FUTURE (Needed) |
|-----------|---------------|-----------------|
| **Data Source** | Mock VTT files | Microsoft Graph API |
| **Storage** | File-based JSON | MongoDB + Vector DB |
| **Chunking** | ✅ Time-window chunks | ✅ Same (enhanced metadata) |
| **Embeddings** | ❌ None | ✅ Vector embeddings |
| **Search** | ✅ Keyword search | ✅ Hybrid (keyword + semantic) |
| **Chatbot** | ❌ None | ✅ RAG-based chatbot |
| **Real-time** | ❌ None | ✅ Teams Bot integration |
| **Summarization** | ❌ None | ✅ AI summaries |

---

## 🎯 Recommended Implementation Order

### Step 1: Embeddings (Foundation)
- Install: `npm install openai` or `npm install @cohere/cohere-js`
- Create `lib/embeddings.js`
- Add embedding generation to chunking pipeline
- Store embeddings in MongoDB or vector DB

### Step 2: Vector Search
- Set up Pinecone/Weaviate account (or use MongoDB Atlas Vector Search)
- Create `lib/vector-store.js`
- Index existing chunks with embeddings
- Test similarity search

### Step 3: RAG Engine
- Create `lib/rag-engine.js`
- Implement retrieval logic
- Test with sample queries

### Step 4: Chatbot API
- Create `app/api/chat/route.js`
- Integrate LLM (OpenAI/Anthropic)
- Test end-to-end flow

### Step 5: Microsoft Graph Integration
- Set up Azure AD app
- Create `lib/graph-client.js`
- Implement webhook handler
- Test with real Teams meetings

### Step 6: Teams Bot Integration
- Set up Bot Framework
- Create Teams app manifest
- Deploy bot to Azure

---

## 🔧 Technical Requirements

### Dependencies to Add
```json
{
  "dependencies": {
    "openai": "^4.0.0",           // For embeddings & chat
    "@azure/msal-node": "^2.0.0", // For Graph auth
    "@microsoft/microsoft-graph-client": "^3.0.0",
    "pinecone-client": "^1.0.0",  // Or Weaviate client
    "botbuilder": "^4.0.0"        // For Teams bot
  }
}
```

### Environment Variables
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Microsoft Graph
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
AZURE_TENANT_ID=...

# Vector DB
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
# OR
WEAVIATE_URL=...
WEAVIATE_API_KEY=...
```

---

## ✅ Summary

### Current Alignment: **80% Complete**
- ✅ Parser, Indexer, Chunking - **Perfect match**
- ✅ API endpoints - **Good foundation**
- ✅ Storage abstraction - **Ready for MongoDB**
- ❌ Embeddings - **Missing**
- ❌ Chatbot - **Missing**
- ❌ Graph integration - **Missing**

### Next Priority: **Chatbot with RAG**
1. Add embeddings generation
2. Set up vector database
3. Build RAG engine
4. Create chatbot API
5. Integrate with Teams

The foundation is solid - we just need to add the AI/ML layer and Microsoft Graph integration!

