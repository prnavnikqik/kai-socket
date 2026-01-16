const fs = require('fs');
const path = require('path');

function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const sFloat = (sec % 60).toFixed(3);
  const sParts = sFloat.split('.');
  const s = String(sParts[0]).padStart(2, '0');
  const ms = String(sParts[1]).padStart(3, '0');
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2,'0')}:${s}.${ms}`;
}

async function writeChunksFile(chunks) {
  const filePath = path.join(__dirname, '../data/chunks.json');
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, JSON.stringify({ chunks }, null, 2), 'utf8');
}

function buildChunksForMeeting(meeting, opts) {
  const entries = (meeting.entries || []).slice().sort((a,b) => (a.startSec || 0) - (b.startSec || 0));
  const chunks = [];
  const windowSec = opts.windowSec;
  const minChars = opts.minChars;
  const overlapSec = opts.overlapSec;

  let i = 0;
  let seq = 0;
  while (i < entries.length) {
    const startIdx = i;
    const startSec = entries[i].startSec || 0;
    let endSec = entries[i].endSec || (startSec + 5);
    let textAcc = '';
    let j = i;

    while (j < entries.length) {
      const e = entries[j];
      const eText = (e.text || '').trim();
      const potentialText = textAcc ? (textAcc + ' ' + eText) : eText;
      const potentialEnd = (e.endSec || e.startSec || endSec);

      // Stop if we've exceeded window AND reached minChars
      if ((potentialEnd - startSec) > windowSec && potentialText.length >= minChars) {
        break;
      }

      textAcc = potentialText;
      endSec = potentialEnd;
      j++;
    }

    seq++;
    const chunkId = `${meeting.meetingId}#${String(seq).padStart(4, '0')}`;
    const slice = entries.slice(startIdx, j);
    const speakerSet = Array.from(new Set(slice.map(x => x.speaker || 'Unknown')));

    const chunk = {
      chunkId,
      meetingId: meeting.meetingId,
      sequence: seq,
      prevChunkId: null,
      nextChunkId: null,
      start: formatTime(startSec),
      startSec: startSec,
      end: formatTime(endSec),
      endSec: endSec,
      overlapSeconds: overlapSec,
      speakerSet,
      text: textAcc,
      metadata: Object.assign({}, meeting.meetingMeta || {}, { source: meeting.source || null })
    };

    chunks.push(chunk);

    // compute next start index respecting overlap
    const threshold = endSec - overlapSec;
    let k = j;
    // advance k until entry.startSec >= threshold
    while (k < entries.length && (entries[k].startSec || 0) < threshold) {
      k++;
    }
    if (k === i) {
      // ensure progress
      k = j || i + 1;
    }
    i = k;
  }

  // assign prev/next
  for (let idx = 0; idx < chunks.length; idx++) {
    if (idx > 0) chunks[idx].prevChunkId = chunks[idx - 1].chunkId;
    if (idx < chunks.length - 1) chunks[idx].nextChunkId = chunks[idx + 1].chunkId;
  }

  return chunks;
}

async function chunkMeetings(meetings, options = {}) {
  const opts = Object.assign({ windowSec: 90, minChars: 350, overlapSec: 15 }, options);
  const allChunks = [];
  for (const m of meetings) {
    try {
      const cs = buildChunksForMeeting(m, opts);
      allChunks.push(...cs);
    } catch (err) {
      console.error('Chunking failed for meeting', m.meetingId, err);
    }
  }

  // If MONGO_URL present, write to Mongo else local file
  if (process.env.MONGO_URL) {
    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      const db = client.db(process.env.MONGO_DB || 'teams_notes');
      const coll = db.collection('rag_chunks');
      const ops = allChunks.map(c => ({ updateOne: { filter: { chunkId: c.chunkId }, update: { $set: c }, upsert: true } }));
      if (ops.length) await coll.bulkWrite(ops);
      await client.close();
    } catch (err) {
      console.error('Failed to write chunks to mongo', err);
    }
  } else {
    await writeChunksFile(allChunks);
  }

  return allChunks;
}

module.exports = {
  chunkMeetings
};
