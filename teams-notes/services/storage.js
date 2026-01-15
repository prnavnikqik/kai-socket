const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/transcripts.json');

async function saveTranscripts(transcripts) {
  // Normalize to object with `transcripts` array to keep file readable
  const payload = Array.isArray(transcripts) ? { transcripts } : transcripts;
  await fs.promises.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.promises.writeFile(dataFilePath, JSON.stringify(payload, null, 2), 'utf8');
}

async function loadTranscripts() {
  try {
    const data = await fs.promises.readFile(dataFilePath, 'utf8');
    const parsed = JSON.parse(data);
    // Support both formats: top-level array or { transcripts: [...] }
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.transcripts)) return parsed.transcripts;
    return [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

module.exports = {
  saveTranscripts,
  loadTranscripts
};