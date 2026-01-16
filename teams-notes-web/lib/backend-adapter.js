import fs from 'fs';
import path from 'path';
import * as storage from './storage-files.js';
import { parseVTT } from './parser.js';
import { chunkEntries } from './indexer.js';

const mockDir = path.join(process.cwd(), 'public', 'mock_data');

export async function loadTranscripts() {
  return await storage.loadTranscripts();
}

export async function getMeeting(meetingId) {
  const meetings = await storage.loadTranscripts();
  return meetings.find(m => m.meetingId === meetingId) || null;
}

export async function searchEntries(q, meetingId) {
  const ql = (q || '').toLowerCase();
  if (!ql) return [];
  const meetings = await storage.loadTranscripts();
  const results = [];
  for (const m of meetings) {
    if (meetingId && m.meetingId !== meetingId) continue;
    for (const e of (m.entries || [])) {
      if ((e.text || '').toLowerCase().includes(ql) || (e.speaker || '').toLowerCase().includes(ql)) {
        results.push({ meetingId: m.meetingId, entry: e });
      }
    }
  }
  return results;
}

export async function loadChunksForMeeting(meetingId) {
  try {
    const chunks = await storage.loadChunks();
    return (chunks || []).filter(c => c.meetingId === meetingId);
  } catch (err) {
    console.error('Failed to load chunks', err);
    return [];
  }
}

function makeMeetingIdFromFilename(f) {
  return f.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
}

export async function importMock({ force = false } = {}) {
  const summary = { imported: 0, skipped: 0, errors: [] };
  try {
    const files = (await fs.promises.readdir(mockDir)).filter(f => f.endsWith('.vtt'));
    const meetings = await storage.loadTranscripts();
    const map = new Map(meetings.map(m => [m.meetingId, m]));

    for (const f of files) {
      try {
        const content = await fs.promises.readFile(path.join(mockDir, f), 'utf8');
        const parsed = parseVTT(content, f);
        // parsed is an array of entries or similar
        const meetingId = makeMeetingIdFromFilename(f);
        const meetingObj = {
          meetingId,
          source: f,
          importedAt: new Date().toISOString(),
          durationSeconds: (parsed && parsed.length) ? Math.max(...parsed.map(e => {
            const end = e.end || e.start; const parts = (end || '00:00:00').split(':'); return Number(parts[0])*3600 + Number(parts[1])*60 + Number(parts[2]);
          })) : 0,
          entries: (parsed || []).map((e, idx) => ({
            id: `${meetingId}:${String(idx+1).padStart(4,'0')}`,
            sequence: idx+1,
            start: e.start,
            end: e.end,
            speaker: e.speaker || 'Unknown',
            text: e.text || '',
            raw: e.raw || ''
          }))
        };

        if (map.has(meetingObj.meetingId) && !force) { summary.skipped++; continue; }
        map.set(meetingObj.meetingId, meetingObj); summary.imported++;
      } catch (err) {
        console.error('Import error', f, err);
        summary.errors.push({ file: f, error: String(err) });
      }
    }

    const toSave = Array.from(map.values());
    await storage.saveTranscripts(toSave);

    // build chunks per meeting and persist
    try {
      const allChunks = [];
      for (const m of toSave) {
        const entries = m.entries || [];
        const chunks = chunkEntries(entries);
        // attach meetingId and stable chunkId
        chunks.forEach((c, i) => {
          c.meetingId = m.meetingId;
          c.chunkId = `${m.meetingId}#${String(i+1).padStart(4,'0')}`;
        });
        allChunks.push(...chunks);
      }
      await storage.saveChunks(allChunks);
      summary.chunks = allChunks.length;
    } catch (err) {
      console.error('Chunking after import failed', err);
    }

    return summary;
  } catch (err) {
    console.error('importMock failed', err);
    throw err;
  }
}
