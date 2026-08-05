'use client';
import React, { useEffect, useState } from 'react';
import { store } from '@/lib/store';

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [expandedCall, setExpandedCall] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    setCalls(store.getCalls());
  }, []);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const filteredCalls = filter === 'All' ? calls : calls.filter(c => c.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>📞 Call Logs</h1>
          <p className="subtitle">Review your AI agent's conversations</p>
        </div>
        <button className="btn btn-secondary">📥 Export CSV</button>
      </div>

      <div className="flex gap-4 mb-4">
        {['All', 'Completed', 'Failed', 'In-progress'].map(f => (
          <button 
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            style={{padding: '0.4rem 1rem', fontSize: '0.8rem'}}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Contact</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Sentiment</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.map(call => (
              <React.Fragment key={call.id}>
                <tr 
                  style={{cursor: 'pointer'}} 
                  onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                >
                  <td style={{fontWeight: '500'}}>{call.contactName}</td>
                  <td>{new Date(call.date).toLocaleString()}</td>
                  <td>{formatDuration(call.duration)}</td>
                  <td>
                    <span className={`badge ${call.status.toLowerCase()}`}>
                      {call.status}
                    </span>
                  </td>
                  <td>{call.sentiment}</td>
                  <td style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {call.summary}
                  </td>
                </tr>
                {expandedCall === call.id && (
                  <tr style={{background: 'rgba(0,0,0,0.2)'}}>
                    <td colSpan="6" style={{padding: '2rem'}}>
                      <div className="flex gap-8">
                        <div style={{flex: 1}}>
                          <h3 style={{fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent-blue)'}}>🤖 AI Summary</h3>
                          <p style={{color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem'}}>{call.summary}</p>
                          
                          {call.recording_url && (
                            <div>
                              <h3 style={{fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent-green)'}}>🎙️ Audio Playback</h3>
                              <audio controls src={call.recording_url} style={{width: '100%', outline: 'none'}} />
                            </div>
                          )}
                        </div>
                        <div style={{flex: 2}}>
                          <h3 style={{fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent-purple)'}}>💬 Transcript</h3>
                          <div style={{
                            background: 'rgba(255,255,255,0.02)', 
                            padding: '1rem', 
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-light)',
                            whiteSpace: 'pre-wrap',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.6',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem'
                          }}>
                            {call.transcript}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filteredCalls.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center'}}>No calls found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
