# MeetingAI  🎯

> **Intelligent meeting transcript analysis powered by AI**

A premium Next.js application that transforms Microsoft Teams meeting transcripts into actionable insights. Upload VTT files, chat with your meetings using RAG, extract AI-powered summaries, and automatically identify action items.

![Architecture](./public/image.png)

---

## ✨ Features

### 🎨 **Premium Modern UI**
- **Dark Theme Design System** - Glassmorphism, gradients, and smooth animations
- **Responsive Layout** - Works beautifully on all screen sizes
- **Micro-interactions** - Hover effects, loading states, and transitions

### 🤖 **AI-Powered Intelligence**
- **RAG-Based Chat** - Ask questions about meetings and get contextual answers
- **Auto-Summarization** - Generate executive summaries and detailed breakdowns
- **Action Item Extraction** - Automatically identify tasks, owners, and deadlines
- **Powered by Gemini 2.0 Flash** - Fast, accurate, and cost-effective

### 📊 **Meeting Management**
- **VTT Upload** - Drag and drop MS Teams transcript files
- **Smart Parsing** - Preserves speaker attribution and timestamps
- **Chunking Strategy** - 90-second windows with 15-second overlap for optimal RAG
- **Search & Filter** - Find specific meetings quickly

### 🔧 **Developer-Friendly**
- **File or MongoDB Storage** - Swap backends without code changes
- **REST API** - Well-documented endpoints for all features
- **Mock Data** - Sample meetings included for testing

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

**Required:** Add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
```

Get your free API key at: https://aistudio.google.com/apikey

### 3. Start Development Server
```bash
npm run dev
```

Server runs on **http://localhost:5656**

### 4. Import Sample Data
Click "Import Samples" in the UI, or use:
```bash
# PowerShell
Invoke-RestMethod -Uri http://localhost:5656/api/import-mock -Method Post

# cURL
curl -X POST http://localhost:5656/api/import-mock
```

---

## 📁 Project Structure

```
kai/
├── app/
│   ├── api/                    # REST API endpoints
│   │   ├── transcripts/        # Meeting CRUD
│   │   ├── chunks/             # RAG chunks
│   │   ├── search/             # Full-text search
│   │   ├── chat/[id]/          # RAG-based Q&A
│   │   ├── summary/[id]/       # AI summaries
│   │   ├── actions/[id]/       # Action item extraction
│   │   ├── upload/             # File upload handler
│   │   └── import-mock/        # Sample data importer
│   ├── globals.css             # Premium design system
│   ├── layout.js               # Root layout
│   └── page.jsx                # Main UI component
├── lib/
│   ├── parser.js               # VTT parser
│   ├── indexer.js              # Chunking algorithm
│   ├── llm-service.js          # Gemini integration
│   ├── backend-adapter.js      # Business logic
│   └── storage-files.js        # Persistence layer
├── public/
│   ├── mock_data/              # Sample VTT files
│   │   ├── sprint-planning-5m.vtt
│   │   ├── business-review-4m.vtt
│   │   └── standup-30m.vtt
│   └── uploads/                # User-uploaded files
└── data/                       # JSON storage (auto-created)
    ├── transcripts.json
    └── chunks.json
```

---

## 🎯 API Endpoints

### Meetings
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transcripts` | GET | List all meetings |
| `/api/transcripts/:id` | GET | Get meeting details |
| `/api/chunks/:id` | GET | Get RAG chunks for meeting |
| `/api/search?q=term` | GET | Search transcripts |

### AI Services
| Endpoint | Method | Description | Requires |
|----------|--------|-------------|----------|
| `/api/chat/:id` | POST | Ask questions about meeting | Gemini API key |
| `/api/summary/:id` | GET | Generate meeting summary | Gemini API key |
| `/api/actions/:id` | GET | Extract action items | Gemini API key |

### Upload & Import
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload VTT or recording file |
| `/api/import-mock` | POST | Import sample meetings |

---

## 🧠 How It Works

### 1. **VTT Parsing**
```
Input VTT → Parser → Entries [speaker, timestamp, text]
```

### 2. **Chunking Strategy**
```
Entries → Indexer → Chunks [90s window, 350 char min, 15s overlap]
```
- **Why 90 seconds?** Balances context with manageability
- **Why overlap?** Prevents information loss at boundaries
- **Why 350 chars?** Ensures semantic coherence for LLMs

### 3. **RAG Pipeline**
```
User Question → Search Chunks → Top 10 Relevant → Gemini → Answer
```

### 4. **Summarization**
```
Meeting Entries → Gemini → Executive Summary + Key Topics + Decisions
```

### 5. **Action Extraction**
```
Transcript → Gemini → [Task, Owner, Deadline, Priority, Context]
```

---

## 🎨 Design Philosophy

### Color Palette
- **Primary:** `#6366f1` (Indigo) - Trust & Intelligence
- **Secondary:** `#8b5cf6` (Violet) - Creativity
- **Accent:** `#ec4899` (Pink) - Energy

### Animations
- **Fade In:** 600ms for page loads
- **Slide In:** 500ms for list items
- **Hover:** 250ms transitions with glow effects

### Typography
- **Font:** Inter (Google Fonts)
- **Weights:** 300-800 for hierarchy
- **Line Height:** 1.6 for readability

---

## 🔧 Configuration

### MongoDB (Optional)
To use MongoDB instead of file storage:
```env
MONGO_URL=mongodb://localhost:27017
MONGO_DB=teams_notes
```

The app automatically detects MongoDB and switches backends.

### Port Configuration
Default port is **5656**. To change:
```json
// package.json
"scripts": {
  "dev": "next dev --port YOUR_PORT"
}
```

---

## 🐛 Troubleshooting

### Port 5656 Already in Use
```powershell
# Find and kill the process (Run as Administrator)
netstat -ano | findstr :5656
taskkill /PID <PID_NUMBER> /F
```

### Gemini API Error
- **Verify API key** in `.env` file
- **Check quota** at https://aistudio.google.com
- **Review error message** in browser console

### Upload Fails
- **File size limit:** Next.js default is 4MB
- **Supported formats:** `.vtt` files only (recording transcription coming in FUTURE phase)
- **Check browser console** for detailed errors

---

## 🚧 Roadmap (FUTURE Phase)

- [ ] **Microsoft 365 Integration** - Direct Teams connection
- [ ] **Recording Transcription** - MP4/audio to VTT conversion
- [ ] **Vector Search** - Semantic search with embeddings
- [ ] **MongoDB Atlas** - Production-ready database
- [ ] **Speaker Diarization** - Auto-identify speakers
- [ ] **Multi-language Support** - Translate transcripts
- [ ] **Calendar Integration** - Auto-import scheduled meetings
- [ ] **Export Features** - PDF reports, CSV action items

---

## 🏗️ Simplified Production Architecture

To ensure maximum reliability and cost-efficiency for initial testing, the application uses a **Simplified RAG Pipeline**:

1.  **Ingestion**: Real-time meeting transcripts are pulled from Microsoft Graph.
2.  **Storage**: Transcripts and 90-second chunks are stored in **MongoDB Atlas**.
3.  **Retrieval (RAG)**: Uses a robust **Keyword-based Search** over the Atlas collections to identify relevant context.
4.  **Generation**: Uses **Groq (Llama 3.3 70B)** to synthesize answers based only on the retrieved meeting context.
5.  **Media**: Integrated video player for Microsoft Teams recordings.

---

## 📊 Sample Meetings

Included VTT files:
1. **Sprint Planning** (5m) - Technical discussion about AI features
2. **Business Review** (4m) - Quarterly metrics and strategic planning
3. **Standup** (30s) - Quick team sync


---

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Google Gemini** - LLM provider
- **MongoDB** - Database (optional)
- **Inter Font** - Typography

---
