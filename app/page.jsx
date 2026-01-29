'use client';
import { useEffect, useState, useRef } from 'react';

// Simple spinner component
const Spinner = () => (
    <div className="w-4 h-4 border-2 border-gray-400 border-t-teams-primary rounded-full animate-spin"></div>
);

export default function MeetingAI() {
    const [meetings, setMeetings] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [view, setView] = useState('overview');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [summary, setSummary] = useState(null);
    const [actionItems, setActionItems] = useState(null);
    const [status, setStatus] = useState('');
    const [theme, setTheme] = useState('dark'); // Default to dark theme
    const [realMeetings, setRealMeetings] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        // Set theme from localStorage or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');

        loadMeetings();
        checkLogin();
    }, []);

    useEffect(() => {
        if (view === 'chat' && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, view]);

    async function handleDeleteMeeting(id) {
        if (!confirm('Are you sure you want to delete this meeting? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMeetings(prev => prev.filter(m => m.meetingId !== id));
                if (selectedMeeting?.meetingId === id) {
                    setSelectedMeeting(null);
                }
            } else {
                alert('Failed to delete meeting');
            }
        } catch (e) {
            console.error(e);
            alert('Delete failed');
        }
    }

    async function loadMeetings() {
        try {
            const res = await fetch('/api/transcripts');
            const data = await res.json();
            setMeetings(data || []);
        } catch (e) {
            console.error(e);
            setStatus('Error loading meetings.');
        }
    }

    async function checkLogin() {
        const hasToken = document.cookie.includes('ms_token');
        setIsLoggedIn(hasToken);
        if (hasToken) {
            await loadUserInfo();
            await loadRealMeetings();
        }
    }

    async function loadUserInfo() {
        try {
            const res = await fetch('/api/user/info');
            if (res.ok) setUserInfo(await res.json());
        } catch (e) {
            console.error('Error loading user info:', e);
        }
    }

    async function loadRealMeetings() {
        setStatus('Syncing Teams meetings...');
        try {
            const res = await fetch('/api/teams/recent');
            setRealMeetings(res.ok ? (await res.json()) : []);
            setStatus('');
        } catch (e) {
            console.error(e);
            setStatus('Network error syncing meetings.');
        }
    }

    async function ingestMeeting(meetingItem) {
        setStatus('Ingesting meeting...');
        const token = document.cookie.split('; ').find(row => row.startsWith('ms_token='))?.split('=')[1];

        if (!token) {
            alert('Session expired. Please reconnect Teams.');
            return;
        }

        const payload = { accessToken: token };
        if (meetingItem.transcriptDriveId) {
            payload.transcriptDriveId = meetingItem.transcriptDriveId;
        } else {
            payload.teamsMeetingId = meetingItem.id;
        }

        const res = await fetch('/api/ingest/teams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            await loadMeetings();
            setStatus('Ingest complete.');
        } else {
            setStatus(`Ingest failed: ${(await res.json()).error}`);
        }
        setTimeout(() => setStatus(''), 3000);
    }

    async function doUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        setStatus('Uploading file...');
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
            await loadMeetings();
            setStatus('Uploaded successfully.');
        } else {
            setStatus(`Upload error: ${data.error}`);
        }
        setTimeout(() => setStatus(''), 3000);
    }

    async function getSummary() {
        if (summary) return;
        setStatus('Generating AI summary...');
        try {
            const res = await fetch(`/api/summary/${selectedMeeting.meetingId}`);
            setSummary(await res.json());
        } catch (e) { console.error(e); }
        setStatus('');
    }

    async function getActions() {
        if (actionItems) return;
        setStatus('Extracting action items...');
        try {
            const res = await fetch(`/api/actions/${selectedMeeting.meetingId}`);
            setActionItems(await res.json());
        } catch (e) { console.error(e); }
        setStatus('');
    }

    async function sendChat() {
        if (!chatInput.trim()) return;
        const newMessages = [...chatMessages, { role: 'user', content: chatInput }];
        setChatMessages(newMessages);
        setChatInput('');
        setStatus('AI is thinking...');
        try {
            const res = await fetch(`/api/chat/${selectedMeeting.meetingId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: chatInput, chatHistory: chatMessages })
            });
            const data = await res.json();
            const assistantMessage = data.error
                ? `Error: ${data.error}`
                : data.answer;
            setChatMessages([...newMessages, { role: 'assistant', content: assistantMessage, sources: data.sources }]);
        } catch (error) {
            setChatMessages([...newMessages, { role: 'assistant', content: `An unexpected error occurred: ${error.message}` }]);
        }
        setStatus('');
    }

    const handleMeetingSelect = (m) => {
        setSelectedMeeting(m);
        setView('overview');
        setChatMessages([]);
        setSummary(null);
        setActionItems(null);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    return (
        <div className="flex flex-col h-screen bg-teams-bg text-teams-text-primary font-sans">
            {/* Header */}
            <header className="flex-shrink-0 bg-[#333366] text-white h-12 px-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <span>⌯</span> MeetingAI
                </div>
                <div className="flex items-center gap-4 text-sm">
                    {status && <span className="opacity-80">{status}</span>}
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10" title="Toggle Theme">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-72 bg-teams-surface flex-shrink-0 flex flex-col border-r border-teams-border">
                    {/* Teams Integration */}
                    <div className="p-4 border-b border-teams-border">
                        <h3 className="text-xs uppercase font-bold text-teams-text-secondary mb-2">Teams Integration</h3>
                        {!isLoggedIn ? (
                            <button
                                onClick={() => window.location.href = '/api/auth/login?prompt=select_account'}
                                className="w-full bg-teams-primary hover:bg-teams-secondary text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
                            >
                                Connect to Microsoft Teams
                            </button>
                        ) : (
                            <div className="text-sm space-y-2">
                                {userInfo && <p className="text-xs text-teams-text-secondary">Logged in as: <b>{userInfo.displayName}</b></p>}
                                <div className="flex justify-between items-center">
                                    <span className="text-green-400 font-semibold">✓ Connected</span>
                                    <button
                                        onClick={() => { document.cookie = 'ms_token=; Max-Age=0'; setIsLoggedIn(false); setUserInfo(null); }}
                                        className="text-xs text-teams-text-secondary hover:underline"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                                <button
                                    onClick={loadRealMeetings}
                                    className="w-full text-xs bg-white/5 hover:bg-white/10 py-1 rounded"
                                    disabled={status.includes('Syncing')}
                                >
                                    ↻ Refresh Recent Meetings
                                </button>
                                <div className="max-h-32 overflow-y-auto mt-2 space-y-1 p-1 rounded-md bg-black/20">
                                    {realMeetings.length > 0 ? realMeetings.map((rm) => (
                                        <div key={rm.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-white/5 hover:bg-white/10 group">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className="truncate font-medium text-white/90" title={rm.subject}>{rm.subject}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-white/50">{new Date(rm.start).toLocaleDateString()}</span>

                                                    {/* Diagnostic Badges */}
                                                    {rm.status === 'INGESTED' && <span className="text-[10px] text-green-400 bg-green-400/10 px-1 rounded">Ingested</span>}
                                                    {rm.status === 'READY' && <span className="text-[10px] text-teams-secondary bg-teams-secondary/10 px-1 rounded">Ready</span>}
                                                    {rm.status === 'NOT_ORGANIZER' && <span className="text-[10px] text-orange-400 bg-orange-400/10 px-1 rounded" title="You are not the organizer">Not Organiser</span>}
                                                    {rm.status === 'NO_TRANSCRIPT' && <span className="text-[10px] text-red-300 bg-red-400/10 px-1 rounded" title="Transcript not available via API">No API Text</span>}

                                                    {/* OneDrive File Badge + Link */}
                                                    {rm.status === 'ONEDRIVE_FILE' && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] bg-[#c7e0f4] text-[#0078d4] px-1 rounded font-medium">Video File</span>
                                                            <a href={rm.webUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-400 hover:text-white" title="Open in Browser to Download Transcript">↗ Open</a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Ingest Action */}
                                            {/* Ingest Action */}
                                            {rm.status === 'READY' || (rm.status === 'ONEDRIVE_FILE' && rm.hasTranscript) ? (
                                                <button
                                                    onClick={() => ingestMeeting(rm)}
                                                    title={rm.hasTranscript && rm.status === 'ONEDRIVE_FILE' ? "Ingest VTT File" : "Ingest Meeting"}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-teams-secondary hover:text-white p-1.5 hover:bg-teams-secondary/20 rounded"
                                                >
                                                    ⇓
                                                </button>
                                            ) : rm.status === 'ONEDRIVE_FILE' ? (
                                                <button
                                                    onClick={() => document.getElementById('file-upload').click()}
                                                    title="1. Open Video ↗ to download VTT. 2. Click here to Upload."
                                                    className="text-[9px] bg-white/10 hover:bg-white/20 text-white px-1.5 py-0.5 rounded transition-colors"
                                                >
                                                    ⇪ Upload
                                                </button>
                                            ) : null}
                                        </div>
                                    )) : <div className="text-xs text-center p-2 text-teams-text-secondary/70">No recent meetings found.</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recorded Meetings */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <h3 className="p-4 pb-2 text-xs uppercase font-bold text-teams-text-secondary">Recorded Meetings</h3>
                        <div className="flex-1 overflow-y-auto px-2 space-y-1">
                            {meetings.length === 0 && <div className="px-2 py-4 text-sm text-center text-teams-text-secondary/70 italic">No meetings found.</div>}
                            {meetings.map(m => (
                                <div
                                    key={m.meetingId}
                                    className={`group relative p-3 rounded-md cursor-pointer border-l-4 ${selectedMeeting?.meetingId === m.meetingId ? 'bg-black/20 border-teams-primary' : 'border-transparent hover:bg-white/5'}`}
                                    onClick={() => handleMeetingSelect(m)}
                                >
                                    <h4 className="font-semibold truncate text-sm">{m.meetingId}</h4>
                                    <p className="text-xs text-teams-text-secondary">{m.entries?.length || 0} segments • {new Date(m.importedAt || Date.now()).toLocaleDateString()}</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteMeeting(m.meetingId); }}
                                        className="absolute top-2 right-2 p-1 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20"
                                        title="Delete Meeting"
                                    >
                                        ✘
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-teams-border">
                            <button className="w-full bg-white/10 hover:bg-white/20 text-teams-text-primary font-semibold py-2 px-4 rounded-md text-sm"
                                onClick={() => document.getElementById('file-upload').click()}>
                                Upload VTT Manually
                            </button>
                            <input id="file-upload" type="file" onChange={doUpload} accept=".vtt" className="hidden" />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 flex flex-col bg-teams-bg overflow-hidden">
                    {selectedMeeting ? (
                        <>
                            {/* Stage Header */}
                            <div className="flex-shrink-0 p-6 border-b border-teams-border bg-teams-surface">
                                <h2 className="text-2xl font-bold">{selectedMeeting.meetingId}</h2>
                                <p className="text-sm text-teams-text-secondary">
                                    Source: {selectedMeeting.source} | Duration: {selectedMeeting.durationSeconds || 'Unknown'}s
                                </p>
                                <div className="mt-4 flex gap-6 border-b border-teams-border">
                                    <button onClick={() => setView('overview')} className={`py-2 text-sm font-semibold border-b-2 ${view === 'overview' ? 'text-teams-primary border-teams-primary' : 'text-teams-text-secondary border-transparent hover:text-white'}`}>Transcript</button>
                                    <button onClick={() => { setView('summary'); getSummary(); }} className={`py-2 text-sm font-semibold border-b-2 ${view === 'summary' ? 'text-teams-primary border-teams-primary' : 'text-teams-text-secondary border-transparent hover:text-white'}`}>AI Summary</button>
                                    <button onClick={() => { setView('actions'); getActions(); }} className={`py-2 text-sm font-semibold border-b-2 ${view === 'actions' ? 'text-teams-primary border-teams-primary' : 'text-teams-text-secondary border-transparent hover:text-white'}`}>Action Items</button>
                                    <button onClick={() => setView('chat')} className={`py-2 text-sm font-semibold border-b-2 ${view === 'chat' ? 'text-teams-primary border-teams-primary' : 'text-teams-text-secondary border-transparent hover:text-white'}`}>☕︎ Chat</button>
                                </div>
                            </div>

                            {/* Stage Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {view === 'overview' && (
                                    <div className="bg-teams-surface rounded-lg shadow-lg p-6">
                                        <h3 className="text-lg font-semibold mb-4">Transcript Preview</h3>
                                        <div className="space-y-4 text-sm">
                                            {selectedMeeting.entries?.map((e, i) => (
                                                <div key={i} className="flex gap-4 items-start">
                                                    <div className="font-semibold text-teams-secondary w-24 shrink-0">{e.speaker}</div>
                                                    <div className="flex-1">{e.text}</div>
                                                    <div className="text-xs text-teams-text-secondary/70">{e.start}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(view === 'summary' || view === 'actions') && (
                                    <div className="bg-teams-surface rounded-lg shadow-lg p-6">
                                        {(view === 'summary' && !summary) || (view === 'actions' && !actionItems) ? (
                                            <div className="flex items-center gap-2 text-teams-text-secondary"><Spinner /><span>Generating...</span></div>
                                        ) : view === 'summary' ? (
                                            summary.error ? <p className="text-red-400">Error: {summary.error}</p> : <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: summary.summary.replace(/\n/g, '<br/>') }} />
                                        ) : (
                                            actionItems.error ? <p className="text-red-400">Error: {actionItems.error}</p> : (
                                                <table className="w-full text-sm text-left">
                                                    <thead className="border-b-2 border-teams-border">
                                                        <tr>
                                                            <th className="p-2">Task</th><th className="p-2 w-40">Owner</th><th className="p-2 w-24">Priority</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {actionItems.actionItems?.map((item, i) => (
                                                            <tr key={i} className="border-b border-teams-border/50">
                                                                <td className="p-3">{item.task}</td>
                                                                <td className="p-3"><span className="bg-white/10 px-2 py-1 rounded-full text-xs">{item.owner}</span></td>
                                                                <td className={`p-3 font-semibold ${item.priority?.toLowerCase().includes('high') ? 'text-red-400' : ''}`}>{item.priority}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )
                                        )}
                                    </div>
                                )}

                                {view === 'chat' && (
                                    <div className="flex flex-col h-full">
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {chatMessages.length === 0 && <div className="text-center text-teams-text-secondary">Ask questions about the meeting.</div>}
                                            {chatMessages.map((m, i) => (
                                                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-xl p-3 rounded-lg ${m.role === 'user' ? 'bg-teams-primary text-white' : 'bg-teams-surface'}`}>
                                                        <p className="whitespace-pre-wrap">{m.content}</p>
                                                        {m.sources && <div className="mt-2 pt-2 border-t border-white/20 text-xs space-y-1">
                                                            {m.sources.map((s, si) => <div key={si} className="p-1.5 bg-black/20 rounded truncate"><b>Source:</b> {s.text}</div>)}
                                                        </div>}
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={chatEndRef} />
                                        </div>
                                        <div className="p-4 border-t border-teams-border flex gap-2">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={e => setChatInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && sendChat()}
                                                placeholder="Ask a follow-up question..."
                                                className="flex-1 bg-teams-surface border border-teams-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teams-primary"
                                            />
                                            <button onClick={sendChat} className="bg-teams-primary hover:bg-teams-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors">Send</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-teams-text-secondary">
                            <div className="text-6xl mb-4">☕︎</div>
                            <h3 className="text-xl font-semibold text-teams-text-primary">Select a meeting</h3>
                            <p className="max-w-sm">Select a recorded meeting from the sidebar, or upload a new VTT file to begin.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}