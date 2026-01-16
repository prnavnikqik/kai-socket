import { MongoClient } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const MONGO_DB = process.env.MONGO_DB || 'meeting_ai_prod';

let client = null;
let db = null;

async function connect() {
    if (db) return db;
    client = new MongoClient(MONGO_URL);
    await client.connect();
    db = client.db(MONGO_DB);

    // Create Indexes for search performance
    await db.collection('transcripts').createIndex({ meetingId: 1 }, { unique: true });
    await db.collection('chunks').createIndex({ meetingId: 1 });
    await db.collection('chunks').createIndex({ text: 'text' }); // Enable text search for RAG

    return db;
}

export async function loadTranscripts() {
    const database = await connect();
    return await database.collection('transcripts').find({}).sort({ importedAt: -1 }).toArray();
}

export async function getMeeting(meetingId) {
    const database = await connect();
    return await database.collection('transcripts').findOne({ meetingId });
}

export async function saveTranscripts(transcripts) {
    const database = await connect();
    const list = Array.isArray(transcripts) ? transcripts : [transcripts];
    for (const t of list) {
        await database.collection('transcripts').updateOne(
            { meetingId: t.meetingId },
            { $set: { ...t, updatedAt: new Date() } },
            { upsert: true }
        );
    }
}

export async function loadChunks(meetingId) {
    const database = await connect();
    const filter = meetingId ? { meetingId } : {};
    return await database.collection('chunks').find(filter).toArray();
}

export async function saveChunks(chunks) {
    const database = await connect();
    const list = Array.isArray(chunks) ? chunks : [chunks];
    if (list.length === 0) return;

    // Clear old chunks for updated meetings to prevent duplicates
    const meetingIds = [...new Set(list.map(c => c.meetingId))];
    await database.collection('chunks').deleteMany({ meetingId: { $in: meetingIds } });

    await database.collection('chunks').insertMany(list);
}