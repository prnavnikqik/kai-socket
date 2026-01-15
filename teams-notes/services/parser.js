const path = require('path');

function parseTimecode(tc) {
  // tc format: HH:MM:SS.mmm or H:MM:SS.mmm
  const parts = tc.split(':');
  if (parts.length !== 3) return null;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  const seconds = Number(parts[2]);
  return hours * 3600 + minutes * 60 + seconds;
}

function normalizeSpeaker(s) {
  if (!s) return 'Unknown';
  return s.trim();
}

function makeMeetingId(filename) {
  const base = path.basename(filename, path.extname(filename));
  // sanitize: replace spaces with dashes, lowercase
  return base.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
}

function parseVTTToMeeting(fileContent, filename = 'unknown.vtt') {
  const lines = fileContent.split(/\r?\n/);
  const cues = [];

  const timestampRE = /(\d{1,2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{1,2}:\d{2}:\d{2}\.\d{3})/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    const tsMatch = line.match(timestampRE);
    if (tsMatch) {
      const startStr = tsMatch[1];
      const endStr = tsMatch[2];
      i++;
      const textLines = [];
      while (i < lines.length && !lines[i].match(timestampRE)) {
        if (lines[i].trim() === '') {
          i++;
          break; // end of cue block
        }
        textLines.push(lines[i]);
        i++;
      }
      const rawText = textLines.join(' ').trim();

      // Try to extract speaker from the first line: "Name: text..."
      let speaker = 'Unknown';
      let text = rawText;
      const speakerMatch = rawText.match(/^([^:\n]{1,60}):\s*(.+)$/);
      if (speakerMatch) {
        speaker = normalizeSpeaker(speakerMatch[1]);
        text = speakerMatch[2].trim();
      }

      cues.push({ startStr, endStr, startSec: parseTimecode(startStr), endSec: parseTimecode(endStr), speaker, text, rawText });
      continue;
    }

    // If line looks like WEBVTT header or cue index, skip
    i++;
  }

  // Sort cues by startSec to enforce chronology
  cues.sort((a, b) => (a.startSec || 0) - (b.startSec || 0));

  // Build entries with sequence and stable ids
  const meetingId = makeMeetingId(filename);
  const entries = cues.map((c, idx) => {
    // If end is missing or invalid, we'll set it later
    return {
      id: `${meetingId}:${String(idx + 1).padStart(4, '0')}`,
      sequence: idx + 1,
      start: c.startStr,
      startSec: c.startSec,
      end: c.endStr,
      endSec: c.endSec,
      speaker: c.speaker,
      speakerRaw: c.speaker,
      text: c.text,
      raw: c.rawText
    };
  });

  // Fix missing end times by using next entry start, and fill nulls
  for (let j = 0; j < entries.length; j++) {
    const cur = entries[j];
    if (!cur.startSec && typeof cur.startSec !== 'number') cur.startSec = 0;
    if ((!cur.endSec || Number.isNaN(cur.endSec)) && j < entries.length - 1) {
      cur.endSec = entries[j + 1].startSec;
      cur.end = entries[j + 1].start;
    }
    if ((!cur.endSec || Number.isNaN(cur.endSec)) && j === entries.length - 1) {
      // Last entry: estimate +5s if missing
      cur.endSec = (cur.startSec || 0) + 5;
      // Format end as hh:mm:ss.mmm
      const h = Math.floor(cur.endSec / 3600);
      const m = Math.floor((cur.endSec % 3600) / 60);
      const s = (cur.endSec % 60).toFixed(3);
      cur.end = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(6, '0')}`;
    }
  }

  const durationSec = entries.length ? Math.max(...entries.map(e => e.endSec || e.startSec)) : 0;

  const meeting = {
    meetingId,
    source: filename,
    importedAt: new Date().toISOString(),
    durationSeconds: durationSec,
    entries
  };

  return meeting;
}

module.exports = parseVTTToMeeting;