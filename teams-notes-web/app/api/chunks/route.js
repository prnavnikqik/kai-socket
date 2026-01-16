import { NextResponse } from 'next/server';
import { loadChunksForMeeting } from '../../../../../teams-notes-web/lib/backend-adapter.js';

export async function GET(request, { params }) {
  const id = params.id;
  const chunks = await loadChunksForMeeting(id);
  return NextResponse.json(chunks);
}
