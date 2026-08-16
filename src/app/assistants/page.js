'use client';
import { useEffect, useState } from 'react';

export default function VoiceAgentStudioPage() {
  const [agents, setAgents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Voice Studio Form Fields
  const [callType, setCallType] = useState('Outbound (AI calls users)');
  const [useCase, setUseCase] = useState('Real Estate Lead Qualification');
  const [activityDescription, setActivityDescription] = useState('Qualify real estate leads for Sector 62 Noida 3 BHK flats. Speak in polite feminine Hindi grammar (kar rahi hoon, bata rahi hoon). Check budget and site visit availability.');
  const [agentName, setAgentName] = useState('Swara - Real Estate Lead Qualifier');
  const [selectedVoice, setSelectedVoice] = useState('swara');

  const [status, setStatus] = useState(null);

  const voiceLibrary = [
    { id: 'swara', name: '👩 Swara (Warm Indian Hindi Female)', gender: 'Female', desc: 'Sweet & polite, best for Real Estate & Customer Sales' },
    { id: 'ananya', name: '👩 Ananya (Professional Corporate Female)', gender: 'Female', desc: 'Clear, modern & energetic Hinglish sales agent' },
    { id: 'pooja', name: '👩 Pooja (Empathetic Care Female)', gender: 'Female', desc: 'Soft & caring, best for Healthcare & Education' },
    { id: 'kavya', name: '👩 Kavya (Persuasive Retail Female)', gender: 'Female', desc: 'High conversion for E-commerce & Festive offers' },
    { id: 'madhur', name: '👨 Madhur (Corporate Indian Male)', gender: 'Male', desc: 'Confident & trustworthy for Financial Loans & Banking' },
    { id: 'rohan', name: '👨 Rohan (Authoritative Indian Male)', gender: 'Male', desc: 'Deep & formal for Legal, B2B & Executive support' },
    { id: 'aarav', name: '👨 Aarav (Dynamic Young Indian Male)', gender: 'Male', desc: 'Young & enthusiastic for Tech Startups & Automobiles' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('suvidha_custom_agents');
    if (!saved) {
      const initial = [
        {
          id: 'ag_1',
          name: 'Swara - Real Estate Lead Qualifier',
          callType: 'Outbound (AI calls users)',
          useCase: 'Real Estate Sales',
          description: 'Qualifies Noida property buyers in polite Hindi female voice (kar rahi hoon).',
          voice: '👩 Swara (Indian Female)'
        },
        {
          id: 'ag_2',
          name: 'Madhur - Loan & Finance Advisor',
          callType: 'Outbound (AI calls users)',
          useCase: 'Financial Services',
          description: 'Offers pre-approved personal loans up to 5 Lakhs in confident corporate tone.',
          voice: '👨 Madhur (Indian Male)'
        },
        {
          id: 'ag_3',
          name: 'Pooja - Hospital & Clinic Support',
          callType: 'Inbound (Users call AI)',
          useCase: 'Healthcare Appointment',
          description: 'Books doctor appointments and answers patient queries with empathy.',
          voice: '👩 Pooja (Caring Female)'
        }
      ];
      localStorage.setItem('suvidha_custom_agents', JSON.stringify(initial));
      setAgents(initial);
    } else {
      setAgents(JSON.parse(saved));
    }
  }, []);

  const playVoiceSample = (voiceId) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const vObj = voiceLibrary.find(v => v.id === voiceId) || voiceLibrary[0];
    const sampleText = vObj.gender === 'Female' 
      ? `Namaste! Main ${vObj.name.split(' ')[1]} bol rahi hoon. Suvidha Voice CRM mein aapka swagat hai!`
      : `Namaste! Main ${vObj.name.split(' ')[1]} bol raha hoon. Suvidha Voice CRM mein aapka swagat hai!`;

    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.pitch = vObj.gender === 'Female' ? 1.2 : 0.88;
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    let match = voices.find(v => (v.lang.includes('hi') || v.lang.includes('IN')));
    if (match) utterance.voice = match;

    window.speechSynthesis.speak(utterance);
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
    setStatus({ type: 'success', message: `🎉 Voice Agent "${agentName}" created with ${vObj.name} successfully!` });
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>🤖 Voice Agent Creation Studio</h1>
          <p className="subtitle">Choose from 7 customized Indian voice personas and create AI Calling Agents</p>
        </div>
      </div>

      {status && (
        <div className="card mb-6" style={{ padding: '1rem', borderColor: status.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)', background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
          {status.message}
        </div>
      )}

      {/* Voice Library Preview Cards */}
      <div className="mb-8">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🎧 Choose Your Favorite Voice Persona (7 Indian Voices)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {voiceLibrary.map(v => {
            const isSelected = selectedVoice === v.id;
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
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  >
                    🔊 Listen Sample
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
        <h2 style={{ marginTop: 0, fontSize: '1.35rem', marginBottom: '0.5rem' }}>Create Customized Voice Agent</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>Configure your agent persona and custom business scripts</p>

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
              <option value="Outbound (AI calls users)">Outbound (AI calls users / Lead Dialing)</option>
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
              placeholder="e.g. Swara - Real Estate Lead Qualifier" 
            />
          </div>

          <div className="form-group mb-6">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>4. Industry / Use Case</label>
            <input 
              required
              type="text" 
              className="form-control" 
              value={useCase}
              onChange={e => setUseCase(e.target.value)} 
              placeholder="e.g. Real Estate Sales, Pre-Approved Loans, Clinic Appointments" 
            />
          </div>

          <div className="form-group mb-8">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>5. AI Prompt & Business Script</label>
            <textarea 
              required
              rows="4"
              className="form-control" 
              value={activityDescription}
              onChange={e => setActivityDescription(e.target.value)} 
              placeholder="Describe what the voice agent should speak and how it should qualify leads..." 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            🚀 Save & Launch Voice Agent
          </button>
        </form>
      </div>

      {/* Active Agents List */}
      <div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Active Client Voice Agents ({agents.length})</h2>
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
