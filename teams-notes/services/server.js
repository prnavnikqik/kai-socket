const express = require('express');
const storage = require('./storage');
const fs = require('fs');
const path = require('path');
const parseVTTToMeeting = require('./parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.get('/transcripts', async (req, res) => {
  try {
    const meetings = await storage.loadTranscripts();
    // Return summary list
    const list = meetings.map(m => ({ meetingId: m.meetingId, source: m.source, importedAt: m.importedAt, durationSeconds: m.durationSeconds }));
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load transcripts' });
  }
});

app.get('/transcripts/:meetingId', async (req, res) => {
  try {
    const id = req.params.meetingId;
    const meetings = await storage.loadTranscripts();
    const meeting = meetings.find(m => m.meetingId === id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load transcripts' });
  }
});

app.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q) return res.status(400).json({ error: 'Query parameter q required' });
    const meetings = await storage.loadTranscripts();
    const results = [];
    for (const m of meetings) {
      for (const e of m.entries) {
        if ((e.text || '').toLowerCase().includes(q) || (e.speaker || '').toLowerCase().includes(q)) {
          results.push({ meetingId: m.meetingId, entry: e });
        }
      }
    }
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Import mock VTTs endpoint
app.post('/import-mock', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const mockDir = path.join(__dirname, '../mock_data');
    const files = (await fs.promises.readdir(mockDir)).filter(f => f.endsWith('.vtt'));
    const meetings = await storage.loadTranscripts();
    const meetingMap = new Map(meetings.map(m => [m.meetingId, m]));

    const summary = { imported: 0, skipped: 0, errors: [] };

    for (const f of files) {
      try {
        const content = await fs.promises.readFile(path.join(mockDir, f), 'utf8');
        const meeting = parseVTTToMeeting(content, f);
        if (meetingMap.has(meeting.meetingId) && !force) {
          summary.skipped++;
          continue;
        }
        meetingMap.set(meeting.meetingId, meeting);
        summary.imported++;
      } catch (err) {
        console.error('Failed to import', f, err);
        summary.errors.push({ file: f, error: String(err) });
      }
    }

    // Persist meetings array
    const toSave = Array.from(meetingMap.values());
    await storage.saveTranscripts(toSave);

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Import failed' });
  }
});

// Existing endpoints for chunks placeholder
app.get('/chunks/:meetingId', async (req, res) => {
  // For now, return empty array or placeholder until indexer is implemented
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});