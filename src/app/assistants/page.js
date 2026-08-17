'use client';
import { useEffect, useState, useRef } from 'react';

export default function VoiceAgentStudioPage() {
  const [agents, setAgents] = useState([]);

  // Voice Studio Form Fields
  const [callType, setCallType] = useState('Outbound (AI calls users)');
  const [useCase, setUseCase] = useState('Real Estate & Sales Leads');
  const [activityDescription, setActivityDescription] = useState('Qualify clients for 2 & 3 BHK luxury flats in Noida. Ask for budget, location preference, and schedule site visits.');
  const [agentName, setAgentName] = useState('Swara - Luxury Real Estate Closer');
  const [selectedVoice, setSelectedVoice] = useState('swara');
  const [playingVoiceId, setPlayingVoiceId] = useState(null);

  const [status, setStatus] = useState(null);

  const voiceLibrary = [
    { id: 'madhur', name: '👨 Madhur (Corporate Sales Consultant)', gender: 'Male', desc: 'Confident & trustworthy corporate tone for Sales & B2B (बोल रहा हूँ)' },
    { id: 'rohan', name: '👨 Rohan (Executive Business Development)', gender: 'Male', desc: 'Deep & authoritative tone for High-Ticket Deals' },
    { id: 'aarav', name: '👨 Aarav (Dynamic Tech & Ads Specialist)', gender: 'Male', desc: 'Young & enthusiastic for Startups & Tech' },
    { id: 'swara', name: '👩 Swara (Warm Real Estate & Closer)', gender: 'Female', desc: 'Sweet, polite & persuasive female sales expert (बोल रही हूँ)' },
    { id: 'ananya', name: '👩 Ananya (Client Support Manager)', gender: 'Female', desc: 'Clear, modern & energetic Hinglish sales voice' },
    { id: 'pooja', name: '👩 Pooja (Brand Success Advisor)', gender: 'Female', desc: 'Soft & caring voice for Local Businesses & Clinics' },
    { id: 'kavya', name: '👩 Kavya (Social Media & Deals Specialist)', gender: 'Female', desc: 'High conversion tone for Retail & Festive sales' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('suvidha_custom_agents');
    if (!saved) {
      const initial = [
        {
          id: 'ag_swara',
          name: 'Swara - Luxury Real Estate Closer',
          callType: 'Outbound (AI calls users)',
          useCase: 'Real Estate Sales & Discovery',
          description: 'Qualifies clients for 2 & 3 BHK luxury flats in Noida. Asks for budget, location preference, and schedules site visits.',
          voice: '👩 Swara (Indian Female)'
        },
        {
          id: 'ag_madhur',
          name: 'Madhur - Financial & Loan Advisor',
          callType: 'Outbound (AI calls users)',
          useCase: 'Pre-Approved Loans',
          description: 'Offers pre-approved personal & business loans up to 10 Lakhs. Collects KYC details and checks eligibility.',
          voice: '👨 Madhur (Indian Male)'
        },
        {
          id: 'ag_ananya',
          name: 'Ananya - 24/7 Customer Support Agent',
          callType: 'Inbound (Users call AI)',
          useCase: 'Customer Service & Ticketing',
          description: 'Answers customer queries, resolves order issues, and registers complaints directly into CRM.',
          voice: '👩 Ananya (Indian Female)'
        }
      ];
      localStorage.setItem('suvidha_custom_agents', JSON.stringify(initial));
      setAgents(initial);
    } else {
      setAgents(JSON.parse(saved));
    }
  }, []);

  const playVoiceSample = async (voiceId) => {
    try {
      setPlayingVoiceId(voiceId);
      const vObj = voiceLibrary.find(v => v.id === voiceId) || voiceLibrary[0];
      const isMale = vObj.gender === 'Male';
      const personaName = vObj.name.split(' ')[1];

      const sampleText = isMale 
        ? `नमस्ते! मैं ${personaName} बोल रहा हूँ सुविधा एआई से। बताइए, आज मैं आपकी क्या सहायता कर सकता हूँ?`
        : `नमस्ते! मैं ${personaName} बोल रही हूँ सुविधा एआई से। बताइए, आज मैं आपकी क्या सहायता कर सकती हूँ?`;

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText, gender: vObj.gender, voice: voiceId })
      });

      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(data.audioBase64);
        audio.onended = () => setPlayingVoiceId(null);
        audio.onerror = () => setPlayingVoiceId(null);
        await audio.play();
      } else {
        setPlayingVoiceId(null);
      }
    } catch(e) {
      console.log('Sample playback note:', e);
      setPlayingVoiceId(null);
    }
  };

  const handleCreateAgent = (e) => {
    e.preventDefault();
    const vObj = voiceLibrary.find(v => v.id === selectedVoice) || voiceLibrary[0];
    const newAgent = {
      id: 'ag_' + Date.now(),
      name: agentName,
      callType,
      useCase,
      description: activityDescription,
      voice: vObj.name
    };

    const updated = [newAgent, ...agents];
    localStorage.setItem('suvidha_custom_agents', JSON.stringify(updated));
    setAgents(updated);
    setStatus({ type: 'success', message: `🎉 Voice Agent "${agentName}" created and ready for campaigns!` });
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>🤖 AI Voice Agent Creation Studio</h1>
          <p className="subtitle">Build, customize, and deploy AI voice agents for automated inbound & outbound calling</p>
        </div>
      </div>

      {/* 3-Step Guide Banner */}
      <div className="card mb-6" style={{ padding: '1.25rem 1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--accent-green)', marginBottom: '0.5rem' }}>
          📖 How to Create an Agent & Start Calling in 3 Simple Steps:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div>
            <strong>Step 1: Choose Voice Persona</strong><br />
            Select male or female voice and click <strong>`Listen Sample`</strong> to hear 100% human studio speech.
          </div>
          <div>
            <strong>Step 2: Define Agent Script & Pitch</strong><br />
            Give your agent a name, business use case (e.g. Loans / Real Estate), and instructions on how to answer.
          </div>
          <div>
            <strong>Step 3: Launch in Campaigns</strong><br />
            Go to <strong>`🎯 Campaigns`</strong>, upload your customer lead numbers, and click Start Calling!
          </div>
        </div>
      </div>

      {status && (
        <div className="card mb-6" style={{ padding: '1rem', borderColor: status.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)', background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
          {status.message}
        </div>
      )}

      {/* Voice Library Preview Cards */}
      <div className="mb-8">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🎧 Choose Your Voice Persona (Male / Female)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {voiceLibrary.map(v => {
            const isSelected = selectedVoice === v.id;
            const isPlaying = playingVoiceId === v.id;

            return (
              <div 
                key={v.id} 
                className="card" 
                onClick={() => setSelectedVoice(v.id)}
                style={{ 
                  padding: '1.25rem', 
                  cursor: 'pointer', 
                  borderColor: isSelected ? 'var(--accent-green)' : 'var(--border-light)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.08)' : '#0d0d14',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontWeight: '600', fontSize: '0.95rem', color: isSelected ? 'var(--accent-green)' : '#fff' }}>
                    {v.name}
                  </span>
                  <span className={`badge ${v.gender === 'Female' ? 'primary' : 'warning'}`}>
                    {v.gender}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                  {v.desc}
                </p>
                <div className="flex justify-between items-center">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); playVoiceSample(v.id); }}
                    className={`btn ${isPlaying ? 'btn-success' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  >
                    {isPlaying ? '🔊 Playing Sample...' : '🔊 Listen Sample'}
                  </button>
                  {isSelected && <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>✓ Selected</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Create Agent Box */}
      <div className="card mb-8" style={{ padding: '2.5rem', background: '#0e0e14' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.35rem', marginBottom: '0.5rem' }}>Create Customized AI Voice Agent</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>Configure your agent pitch, business use case, and objections handling</p>

        <form onSubmit={handleCreateAgent}>
          <div className="form-group mb-6">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>1. Selected Voice Persona</label>
            <select className="form-control" value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}>
              {voiceLibrary.map(v => (
                <option key={v.id} value={v.id}>{v.name} — {v.desc}</option>
              ))}
            </select>
          </div>

          <div className="form-group mb-6">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>2. Call Type</label>
            <select className="form-control" value={callType} onChange={e => setCallType(e.target.value)}>
              <option value="Outbound (AI calls users)">Outbound (AI calls leads / Sales & Follow-ups)</option>
              <option value="Inbound (Users call AI)">Inbound (Users call AI / Customer Support)</option>
            </select>
          </div>

          <div className="form-group mb-6">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>3. Agent Name & Title</label>
            <input 
              required
              type="text" 
              className="form-control" 
              value={agentName}
              onChange={e => setAgentName(e.target.value)} 
              placeholder="e.g. Swara - Real Estate Closer" 
            />
          </div>

          <div className="form-group mb-6">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>4. Core Use Case</label>
            <input 
              required
              type="text" 
              className="form-control" 
              value={useCase}
              onChange={e => setUseCase(e.target.value)} 
              placeholder="e.g. Real Estate Sales, Loans, Support, Client Discovery" 
            />
          </div>

          <div className="form-group mb-8">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>5. AI Prompt & Company Pitch Instructions</label>
            <textarea 
              required
              rows="4"
              className="form-control" 
              value={activityDescription}
              onChange={e => setActivityDescription(e.target.value)} 
              placeholder="Describe how the agent should qualify clients and answer queries..." 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            🚀 Save & Deploy AI Voice Agent
          </button>
        </form>
      </div>

      {/* Active Agents List */}
      <div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Active Deployed Voice Agents ({agents.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {agents.map(ag => (
            <div className="card" key={ag.id} style={{ padding: '1.5rem' }}>
              <div className="flex justify-between items-center mb-3">
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{ag.name}</h3>
                <span className="badge success">{ag.callType.includes('Outbound') ? 'Outbound' : 'Inbound'}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                {ag.description}
              </p>
              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--border-light)', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--accent-purple)', fontWeight: '600' }}>{ag.voice}</span>
                <span className="badge info">{ag.useCase}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
