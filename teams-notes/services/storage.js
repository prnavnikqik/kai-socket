const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/transcripts.json');

// Lazy Mongo support: only require if MONGO_URL is set
let useMongo = Boolean(process.env.MONGO_URL);
let mongoClient = null;
let mongoDb = null;
let mongoCollection = null;

async function initMongo() {
  if (!useMongo) return;
  if (mongoClient) return;
  const { MongoClient } = require('mongodb');
  mongoClient = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  await mongoClient.connect();
  mongoDb = mongoClient.db(process.env.MONGO_DB || 'teams_notes');
  mongoCollection = mongoDb.collection('meeting_transcripts');
  // create index on meetingId for fast upserts/queries
  await mongoCollection.createIndex({ meetingId: 1 }, { unique: true });
}

// Save an array of meeting objects to the backing store. For Mongo, we upsert by meetingId.
async function saveTranscripts(transcripts) {
  if (useMongo) {
    await initMongo();
    const ops = (Array.isArray(transcripts) ? transcripts : [transcripts]).map(t => ({
      updateOne: {
        filter: { meetingId: t.meetingId },
        update: { $set: t },
        upsert: true
      }
    }));
    if (ops.length) await mongoCollection.bulkWrite(ops);
    return;
  }

  // local file
  const payload = Array.isArray(transcripts) ? { transcripts } : transcripts;
  await fs.promises.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

// Load all transcripts. For Mongo, return array of docs. For local, return normalized array.
async function loadTranscripts() {
  if (useMongo) {
    await initMongo();
    const docs = await mongoCollection.find({}).toArray();
    return docs;
  }

  try {
    const data = await fs.promises.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
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
  loadTranscripts,
  // expose a helper for toggling (useful for tests)
  _internal: {
    get useMongo() { return useMongo; },
    setUseMongo(val) { useMongo = !!val; }
  }
};