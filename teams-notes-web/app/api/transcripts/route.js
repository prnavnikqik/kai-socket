import { NextResponse } from 'next/server';
import { loadTranscripts } from '../../../../../teams-notes-web/lib/backend-adapter.js';

export async function GET() {
  const list = await loadTranscripts();
  return NextResponse.json(list);
}
