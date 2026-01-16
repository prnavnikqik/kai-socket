teams-notes-web/
├─ app/
│  ├─ page.jsx                    # demo UI (list + search + playback)
│  └─ api/
│     ├─ transcripts/route.js     # GET list
│     ├─ transcripts/[id]/route.js# GET one transcript
│     ├─ chunks/[id]/route.js     # GET chunks for a meeting
│     └─ search/route.js          # GET search?q=...
├─ lib/
│  ├─ config.js                   # constants
│  ├─ parser.js                   # VTT → entries
│  ├─ indexer.js                  # chunking (RAG-ready)
│  └─ storage-files.js            # file-backed JSON “DB”
├─ public/
│  ├─ mock_data/                  # put the .vtt files here
│  │  ├─ standup-30m.vtt
│  │  ├─ review-60m.vtt
│  │  └─ bugbash-120m.vtt
│  └─ recordings/
│     └─ demo.mp4                 # any small MP4 for playback demo
├─ scripts/
│  └─ ingest.mjs                  # parses VTTs → data/*.json (local build step)
├─ data/
│  ├─ transcripts.json            # “meeting_transcripts” collection (file)
│  └─ chunks.json                 # “rag_chunks” collection (file)
└─ .env.local                     # PORT if you want; not required