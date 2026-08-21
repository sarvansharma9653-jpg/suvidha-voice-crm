'use client';
import React, { useEffect, useState, useRef } from 'react';
import { store } from '@/lib/store';

export default function CallsPage() {
  const handleSendWhatsAppToLead = (phone, name, e) => {
    if (e) e.stopPropagation();
    const cleanNum = phone.replace(/[^0-9]/g, '');
    const target = cleanNum.startsWith('91') ? cleanNum : `91${cleanNum.replace(/^0+/, '')}`;
    const defaultMsg = `नमस्ते ${name || 'जी'}! 🙏\n\nThe Shree Aangan Developers की तरफ से कॉल की पूरी जानकारी और ब्रोशर:\n\n🏡 *The Shree Aangan - 85 Acres Township (Jaipur)*\n📍 Chaksu, Tonk Road, NH-12\n📄 Brochure: https://drive.google.com/file/d/103owbyObLS3CVyerjrP_Ryr_OVlU2QDG/view\n\nक्या इस वीकेंड आप साइट विजिट के लिए आ सकते हैं?`;
    const waLink = `https://api.whatsapp.com/send?phone=${target}&text=${encodeURIComponent(defaultMsg)}`;
    window.open(waLink, '_blank');
  };
  const [calls, setCalls] = useState([]);
  const [expandedCall, setExpandedCall] = useState(null);
  const [filter, setFilter] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [playingCallId, setPlayingCallId] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    setCalls(store.getCalls());
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handlePlayRecording = (callId, e) => {
    if (e) e.stopPropagation();
    if (playingCallId === callId) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingCallId(null);
      return;
    }

    setPlayingCallId(callId);
    // Synthesize / play realistic dialogue audio
    const callObj = calls.find(c => c.id === callId);
    const audioText = callObj ? (callObj.transcript || callObj.summary) : 'Namaste! Main Suvidha AI Assistant bol rahi hoon.';

    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: audioText, gender: 'Female', voice: 'pooja' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.audioBase64) {
        const audio = new Audio(data.audioBase64);
        audioRef.current = audio;
        audio.onended = () => setPlayingCallId(null);
        audio.onerror = () => setPlayingCallId(null);
        audio.play();
      } else {
        setPlayingCallId(null);
      }
    })
    .catch(() => setPlayingCallId(null));
  };

  const handleExportCSV = () => {
    if (calls.length === 0) {
      alert('No calls to export!');
      return;
    }
    const headers = 'Call ID,Contact Name,Phone,Date,Duration,Status,Sentiment,Stage,Executive Summary\n';
    const rows = calls.map(c => 
      `"${c.id}","${c.contactName}","${c.phone || ''}","${new Date(c.date).toLocaleString()}","${formatDuration(c.duration)}","${c.status}","${c.sentiment}","${c.stage || 'New'}","${(c.summary || '').replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suvidha_call_executive_summaries_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredCalls = calls.filter(call => {
    const matchesStatus = filter === 'All' || call.status === filter;
    const matchesSentiment = sentimentFilter === 'All' || (call.sentiment && call.sentiment.includes(sentimentFilter));
    const matchesSearch = (call.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (call.phone || '').includes(searchTerm);
    return matchesStatus && matchesSentiment && matchesSearch;
  });

  const latestCall = calls.length > 0 ? calls[0] : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>🎙️ Call Transcripts, Audio Recordings & Executive Summaries</h1>
          <p className="subtitle">Listen to call audio recordings, review AI dialogue transcripts and customer sentiment</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          📥 Export Executive Summaries (CSV)
        </button>
      </div>

      {/* Featured Executive Summary Highlight Card */}
      {latestCall && (
        <div className="card mb-8" style={{ padding: '1.75rem', borderColor: 'var(--accent-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <span className="badge danger">🔥 Latest Call Summary</span>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{latestCall.contactName} ({latestCall.phone || '+91...'})</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={(e) => handlePlayRecording(latestCall.id, e)}
                className={`btn ${playingCallId === latestCall.id ? 'btn-success' : 'btn-primary'}`}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', fontWeight: '700', borderRadius: '20px' }}
              >
                {playingCallId === latestCall.id ? '⏸️ Stop Audio' : '▶ Play Call Recording'}
              </button>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                📅 {new Date(latestCall.date).toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* AI Summary */}
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                🤖 Executive AI Call Summary & Key Takeaways
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: 0, color: 'var(--text-primary)' }}>
                {latestCall.summary}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <span className="badge success">Duration: {formatDuration(latestCall.duration)}</span>
                <span className="badge primary">{latestCall.sentiment || '😊 Interested'}</span>
                <span className="badge warning">Stage: {latestCall.stage || 'Qualified'}</span>
              </div>
            </div>

            {/* Snippet Transcript */}
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                💬 Dialogue Transcript Snippet
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto' }}>
                {latestCall.transcript || 'AI: Namaste! Main Suvidha Voice Assistant bol raha hoon...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="card mb-6" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1, minWidth: '300px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="🔍 Search lead name, phone..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ maxWidth: '280px' }}
            />

            <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)} style={{ maxWidth: '160px' }}>
              <option value="All">All Call Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Missed">Missed</option>
            </select>

            <select className="form-control" value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)} style={{ maxWidth: '180px' }}>
              <option value="All">All Sentiments</option>
              <option value="Interested">😊 Interested / Hot</option>
              <option value="Follow-up">⏳ Follow-up Requested</option>
              <option value="Neutral">😐 Neutral / Discovery</option>
            </select>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredCalls.length}</strong> logged calls
          </div>
        </div>
      </div>

      {/* Main Call Transcripts & Audio Recordings Table */}
      <div className="table-container card">
        <table className="table">
          <thead>
            <tr>
              <th>Lead / Contact</th>
              <th>Voice Agent</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Sentiment & Intent</th>
              <th>Executive Summary</th>
              <th>Audio Recording</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No call logs found matching your filters.
                </td>
              </tr>
            ) : (
              filteredCalls.map(call => {
                const isExpanded = expandedCall === call.id;
                const isPlaying = playingCallId === call.id;

                return (
                  <React.Fragment key={call.id}>
                    <tr 
                      onClick={() => setExpandedCall(isExpanded ? null : call.id)}
                      style={{ cursor: 'pointer', background: isExpanded ? 'rgba(255, 255, 255, 0.03)' : 'transparent' }}
                    >
                      <td>
                        <div style={{ fontWeight: '600' }}>{call.contactName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{call.phone || '+91...'}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.825rem', color: 'var(--accent-green)', fontWeight: '600' }}>
                          {call.agentName || 'Pooja (Closer)'}
                        </span>
                      </td>
                      <td>{formatDuration(call.duration)}</td>
                      <td>
                        <span className={`badge ${call.status === 'Completed' ? 'success' : 'warning'}`}>
                          {call.status}
                        </span>
                      </td>
                      <td>
                        <span className="badge primary" style={{ fontSize: '0.75rem' }}>
                          {call.sentiment || '😊 Interested'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {call.summary || 'AI completed outbound call and qualified lead.'}
                        </div>
                      </td>
                      <td>
                        <button 
                          onClick={(e) => handlePlayRecording(call.id, e)}
                          className={`btn ${isPlaying ? 'btn-success' : 'btn-secondary'}`}
                          style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', borderRadius: '15px' }}
                        >
                          {isPlaying ? '⏸️ Stop' : '▶ Play Recording'}
                        </button>
                      </td>
                      <td>
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                          {isExpanded ? '▲ Hide' : '▼ Details'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Full Transcript & Dialogue Details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="8" style={{ background: '#09090e', padding: '1.5rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--accent-blue)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                📋 Full Executive AI Summary:
                              </div>
                              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-primary)', margin: 0 }}>
                                {call.summary}
                              </p>
                              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Caller ID: <code>{call.callerNumber || '+917965854263'}</code> | Date: {new Date(call.date).toLocaleString()}
                              </div>
                            </div>

                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--accent-green)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                💬 Full Dialogue Transcript:
                              </div>
                              <div style={{ background: '#060609', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.825rem', lineHeight: '1.5', maxHeight: '160px', overflowY: 'auto', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                                {call.transcript || 'No full transcript recorded.'}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
