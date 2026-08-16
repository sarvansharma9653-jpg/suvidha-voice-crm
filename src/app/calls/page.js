'use client';
import React, { useEffect, useState } from 'react';
import { store } from '@/lib/store';

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [expandedCall, setExpandedCall] = useState(null);
  const [filter, setFilter] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCalls(store.getCalls());
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
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
          <h1>📊 Call Executive Summaries & Dialogue Logs</h1>
          <p className="subtitle">Review AI call summaries, key customer intent, sentiment tags, and full dialogue transcripts</p>
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
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              📅 {new Date(latestCall.date).toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* AI Summary */}
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                🤖 Executive AI Call Summary & Key Takeaways
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                {latestCall.summary || 'AI call completed. Customer qualified intent and agreed to follow-up details.'}
              </p>
              <div className="flex gap-3 mt-4" style={{ fontSize: '0.75rem' }}>
                <span className="badge success">Sentiment: {latestCall.sentiment || '😊 Interested'}</span>
                <span className="badge primary">Stage: {latestCall.stage || 'Qualified'}</span>
                <span className="badge info">Caller: {latestCall.callerNumber || '+17372212163'}</span>
              </div>
            </div>

            {/* Conversation Snippet */}
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                💬 Conversation Dialogue Preview
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxHeight: '100px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                {latestCall.transcript || 'Agent: Namaste! Main Suvidha AI Assistant bol rahi hoon.\nUser: Haan, bataiye.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex justify-between items-center mb-6 gap-4" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="🔍 Search call logs by client name or phone number..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '300px', fontSize: '0.85rem' }}
        />

        <div className="flex gap-2">
          {['All', 'Completed', 'No Answer', 'Failed'].map(f => (
            <button 
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <select 
          className="form-control" 
          value={sentimentFilter} 
          onChange={e => setSentimentFilter(e.target.value)}
          style={{ width: '220px', fontSize: '0.8125rem' }}
        >
          <option value="All">All Sentiments & Intent</option>
          <option value="Hot">🔥 Hot Lead</option>
          <option value="Interested">😊 Interested</option>
          <option value="Call Later">⏰ Call Later</option>
          <option value="Not Interested">❌ Not Interested</option>
        </select>
      </div>

      {/* Calls Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Contact Name</th>
              <th>Phone</th>
              <th>Call Date</th>
              <th>Duration</th>
              <th>Call Status</th>
              <th>AI Sentiment Tag</th>
              <th>Executive Summary</th>
              <th style={{ textAlign: 'right' }}>Transcript</th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No call logs match the selected filter.
                </td>
              </tr>
            ) : (
              filteredCalls.map(call => {
                const isExpanded = expandedCall === call.id;

                return (
                  <React.Fragment key={call.id}>
                    <tr 
                      style={{ cursor: 'pointer', background: isExpanded ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }} 
                      onClick={() => setExpandedCall(isExpanded ? null : call.id)}
                    >
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{call.contactName}</td>
                      <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{call.phone || '+91...'}</code></td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{new Date(call.date).toLocaleString()}</td>
                      <td style={{ fontSize: '0.85rem' }}>{formatDuration(call.duration)}</td>
                      <td>
                        <span className={`badge ${call.status === 'Completed' ? 'success' : call.status === 'No Answer' ? 'warning' : 'danger'}`}>
                          {call.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${call.sentiment?.includes('Hot') ? 'danger' : call.sentiment?.includes('Interested') ? 'success' : 'info'}`}>
                          {call.sentiment || 'Neutral'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {call.summary}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                          {isExpanded ? '▲ Hide' : '▼ View Transcript'}
                        </button>
                      </td>
                    </tr>

                    {/* Detailed Expander */}
                    {isExpanded && (
                      <tr style={{ background: 'rgba(18, 18, 26, 0.9)' }}>
                        <td colSpan="8" style={{ padding: '1.75rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                            {/* Left: AI Summary & Details */}
                            <div>
                              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🤖 AI Executive Summary & Key Takeaways
                              </h3>
                              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                                {call.summary}
                              </div>

                              <div className="flex justify-between mb-2" style={{ fontSize: '0.8125rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Lead Stage:</span>
                                <span className="badge primary">{call.stage || 'Qualified'}</span>
                              </div>
                              <div className="flex justify-between" style={{ fontSize: '0.8125rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Sentiment Quality:</span>
                                <span className="badge danger">{call.sentiment}</span>
                              </div>
                            </div>

                            {/* Right: Dialogue Transcript */}
                            <div>
                              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                💬 Full Conversation Transcript
                              </h3>
                              <div style={{
                                background: '#0a0a0f', 
                                padding: '1.25rem', 
                                borderRadius: '8px',
                                border: '1px solid var(--border-light)',
                                maxHeight: '240px',
                                overflowY: 'auto',
                                fontSize: '0.8125rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap'
                              }}>
                                {call.transcript || 'No transcript available for this call.'}
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
