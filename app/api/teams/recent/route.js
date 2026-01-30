import { NextResponse } from 'next/server';
import { listRecentMeetings, checkTranscriptAccess, getMeetingInfo } from '../../../../lib/ms-graph.js';
import { loadTranscripts } from '../../../../lib/backend-adapter.js';

export async function GET(request) {
    const token = request.cookies.get('ms_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 0) Get Current User Info
        const meRes = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const me = await meRes.json();
        const myId = me.id;

        // 1) Get already ingested meetings
        const ingested = await loadTranscripts();
        const ingestedExternalIds = new Set(
            (ingested || [])
                .filter(m => m.source === 'Microsoft Teams API' && m.externalId)
                .map(m => m.externalId)
        );

        // 2) Get recent online meetings from user's calendar
        const recentMeetings = await listRecentMeetings(token);
        console.log(`Found ${recentMeetings.length} recent online meetings from calendar`);

        // 3) Process ALL meetings to determine status
        const validMeetings = [];

        for (const m of recentMeetings) {
            // A. Check if Ingested
            const isIngested = ingestedExternalIds.has(m.id) ||
                (m.onlineMeetingId && ingestedExternalIds.has(m.onlineMeetingId));

            if (isIngested) continue;

            // B. Check Organizer Status
            // Use explicit flag from our smart Fetcher OR check email
            let isOrganizer = m.isOrganizer === true;

            if (!isOrganizer) {
                const orgEmail = m.organizer?.emailAddress?.address || m.organizer?.emailAddress?.name;
                // Case-insensitive check
                if (orgEmail && (orgEmail.toLowerCase() === me.mail?.toLowerCase() || orgEmail.toLowerCase() === me.userPrincipalName?.toLowerCase())) {
                    isOrganizer = true;
                }
            }

            // --- Special Handling for OneDrive Files (P2P Recordings) ---
            if (m.source === 'onedrive') {
                // We found the recording file directly!
                validMeetings.push({
                    ...m,
                    status: 'ONEDRIVE_FILE', // Special status
                    isOrganizer: true,
                    hasTranscript: false // We can't auto-fetch transcript from DriveItem yet
                });
                continue;
            }

            // --- DEBUG MODE: Relaxed strict filtering to diagnose missing meetings ---
            // We return matching meetings with a status explanation instead of hiding them completely.

            let transcriptStatus = { hasAccess: false, transcriptsExist: false };
            try {
                transcriptStatus = await checkTranscriptAccess(token, m.id);
            } catch (e) {
                console.warn(`Transcript check failed for ${m.id}`, e.message);
            }

            if (isOrganizer && transcriptStatus.transcriptsExist) {
                validMeetings.push({
                    ...m,
                    status: 'READY',
                    isOrganizer: true,
                    hasTranscript: true
                });
            } else {
                // Include "invalid" meetings for visibility during debugging if they are recent
                // Only show if it matches the "User's" meeting roughly (attendee or organizer)
                validMeetings.push({
                    ...m,
                    status: isOrganizer ? 'NO_TRANSCRIPT' : 'NOT_ORGANIZER',
                    isOrganizer: isOrganizer,
                    hasTranscript: transcriptStatus.transcriptsExist
                });
            }
        }

        console.log(`Returning ${validMeetings.length} meetings (Debug Mode).`);
        return NextResponse.json(validMeetings);

    } catch (error) {
        console.error('Error in /api/teams/recent:', error);
        return NextResponse.json({ error: error.message || 'Failed to load recent Teams meetings.' }, { status: 500 });
    }
}