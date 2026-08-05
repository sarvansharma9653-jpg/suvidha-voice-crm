'use client';
import { useEffect, useState } from 'react';
import { store } from '@/lib/store';

export default function DashboardHome() {
  const [stats, setStats] = useState({ contacts: 0, calls: 0, success: 0, avgDuration: 0 });
  const [recentCalls, setRecentCalls] = useState([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState('Idle');
  const [selectedVoice, setSelectedVoice] = useState('sarah');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [prompt, setPrompt] = useState(
    "You are a friendly and professional AI calling agent for Suvidha. Speak in natural Hinglish."
  );

  useEffect(() => {
    const contacts = store.getContacts();
    const calls = store.getCalls();
    
    const totalContacts = contacts.length;
    const todayCalls = calls.filter(c => new Date(c.date).toDateString() === new Date().toDateString()).length;
    const successCalls = calls.filter(c => c.sentiment === '😊 Positive' || c.sentiment === '✅ Positive').length;
    const successRate = calls.length > 0 ? Math.round((successCalls / calls.length) * 100) : 0;
    const avgDuration = calls.length > 0 ? Math.round(calls.reduce((acc, curr) => acc + curr.duration, 0) / calls.length) : 0;

    setStats({ contacts: totalContacts, calls: todayCalls, success: successRate, avgDuration });
    setRecentCalls(calls.slice(0, 5));
  }, []);

  const startTestSession = () => {
    if (isTesting) {
      setIsTesting(false);
      setTestStatus('Idle');
    } else {
      setIsTesting(true);
      setTestStatus('Connecting microphone...');
      setTimeout(() => {
        setTestStatus('Agent is listening... Speak now!');
      }, 1500);
    }
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="playground-layout">
      {/* LEFT COLUMN: CONSOLE & ANALYTICS */}
      <div className="console-main">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>🤖 Console Overview</h1>
            <p className="subtitle" style={{ marginBottom: 0 }}>Configure and test your voice assistants in real-time</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="card glass-card">
            <div className="stat-header">
              <span>Total Contacts</span>
              <span>👥</span>
            </div>
            <div className="stat-value">{stats.contacts}</div>
            <div className="stat-trend trend-up">↑ 12% imported</div>
          </div>
          <div className="card glass-card">
            <div className="stat-header">
              <span>Active Calls Today</span>
              <span>📞</span>
            </div>
            <div className="stat-value">{stats.calls}</div>
            <div className="stat-trend trend-up">↑ 8% active</div>
          </div>
          <div className="card glass-card">
            <div className="stat-header">
              <span>Average Duration</span>
              <span>⏱️</span>
            </div>
            <div className="stat-value">{formatDuration(stats.avgDuration)}</div>
            <div className="stat-trend trend-down">↓ 12s latency</div>
          </div>
        </div>

        {/* Recent Calls Table */}
        <h2 style={{ marginTop: '2.5rem', marginBottom: '1rem', fontSize: '1.25rem' }}>📜 Recent Run Logs</h2>
        <div className="table-container glass-card">
          <table>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Sentiment</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.map(call => (
                <tr key={call.id}>
                  <td style={{ fontWeight: 600 }}>{call.contactName}</td>
                  <td>{formatDuration(call.duration)}</td>
                  <td>
                    <span className={`badge ${call.status.toLowerCase()}`}>
                      {call.status}
                    </span>
                  </td>
                  <td>{call.sentiment}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{call.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT COLUMN: VAPI-STYLE PLAYGROUND */}
      <div className="playground-sidebar card glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚡ Voice Sandbox
        </h2>
        
        {/* Voice Wave Animation */}
        <div className={`wave-container ${isTesting ? 'active' : ''}`}>
          {isTesting ? (
            <div className="wave-bars">
              <span className="bar-wave"></span>
              <span className="bar-wave"></span>
              <span className="bar-wave"></span>
              <span className="bar-wave"></span>
              <span className="bar-wave"></span>
              <span className="bar-wave"></span>
            </div>
          ) : (
            <div className="mic-placeholder">🎙️</div>
          )}
          <p className="wave-status">{testStatus}</p>
        </div>

        <button 
          onClick={startTestSession} 
          className={`btn ${isTesting ? 'btn-danger' : 'btn-primary'}`} 
          style={{ width: '100%', padding: '0.875rem', marginBottom: '2rem', fontSize: '1rem', boxShadow: 'none' }}
        >
          {isTesting ? '🔴 Terminate WebRTC Session' : '🎙️ Test Assistant in Browser'}
        </button>

        {/* Configurations */}
        <div className="form-group">
          <label>Agent System Prompt / Prompt Script</label>
          <textarea 
            rows="5"
            className="form-control"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ resize: 'none', fontSize: '0.8125rem', background: 'rgba(0, 0, 0, 0.4)' }}
          />
        </div>

        <div className="form-group">
          <label>Select Voice Engine</label>
          <select className="form-control" value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}>
            <option value="sarah">Sarah (11labs - Professional)</option>
            <option value="dom">Dom (Cartesia - Indian English)</option>
            <option value="rachel">Rachel (11labs - Hindi/English)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Model Configuration</label>
          <select className="form-control" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
            <option value="gpt-4o-mini">GPT-4o-mini (Lowest Latency)</option>
            <option value="gemini-flash">Gemini 1.5 Flash (Fast Streaming)</option>
            <option value="gpt-4o">GPT-4o (Reasoning capability)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
