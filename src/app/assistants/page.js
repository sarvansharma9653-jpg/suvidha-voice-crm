'use client';
import { useEffect, useState, useRef } from 'react';

export default function VoiceAgentStudioPage() {
  const [agents, setAgents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Voice Studio Form Fields
  const [callType, setCallType] = useState('Outbound (AI calls users)');
  const [useCase, setUseCase] = useState('Design Suvidha - Client Acquisition & Growth');
  const [activityDescription, setActivityDescription] = useState('Qualify business clients for Meta Ads, SEO, Website Development, Landing Pages, Social Media Marketing, and Graphic/Video content. Offer a free 15-minute digital growth consultation call.');
  const [agentName, setAgentName] = useState('Design Suvidha - Growth Consultant (Madhur)');
  const [selectedVoice, setSelectedVoice] = useState('madhur');
  const [playingVoiceId, setPlayingVoiceId] = useState(null);

  const [status, setStatus] = useState(null);

  const voiceLibrary = [
    { id: 'madhur', name: '👨 Madhur (Senior Growth Consultant)', gender: 'Male', desc: 'Confident & trustworthy corporate tone for Digital Marketing & B2B Sales (बोल रहा हूँ)' },
    { id: 'rohan', name: '👨 Rohan (Executive Business Development Lead)', gender: 'Male', desc: 'Deep & authoritative tone for High-Ticket Client Deals' },
    { id: 'aarav', name: '👨 Aarav (Dynamic Tech & Ads Specialist)', gender: 'Male', desc: 'Young & enthusiastic for Startups & E-commerce' },
    { id: 'swara', name: '👩 Swara (Creative Strategy Lead)', gender: 'Female', desc: 'Sweet, polite & persuasive female marketing expert (बोल रही हूँ)' },
    { id: 'ananya', name: '👩 Ananya (Client Growth Manager)', gender: 'Female', desc: 'Clear, modern & energetic Hinglish sales voice' },
    { id: 'pooja', name: '👩 Pooja (Brand Success Advisor)', gender: 'Female', desc: 'Soft & caring voice for Local Businesses & Clinics' },
    { id: 'kavya', name: '👩 Kavya (Social Media & Video Specialist)', gender: 'Female', desc: 'High conversion tone for E-commerce & Festive sales' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('suvidha_custom_agents');
    if (!saved) {
      const initial = [
        {
          id: 'ag_design_suvidha',
          name: 'Design Suvidha - Client Acquisition Specialist',
          callType: 'Outbound (AI calls users)',
          useCase: 'Digital Marketing & Creative Solutions',
          description: 'Offers Meta Ads, SEO, Website Development, Social Media, and Video Content to businesses.',
          voice: '👨 Madhur (Indian Male)'
        },
        {
          id: 'ag_1',
          name: 'Swara - Creative Strategy & Branding Lead',
          callType: 'Outbound (AI calls users)',
          useCase: 'Graphic Design & Video Production',
          description: 'Pitches Instagram Reels, Brand Identity, and Creative Landing Pages.',
          voice: '👩 Swara (Indian Female)'
        },
        {
          id: 'ag_2',
          name: 'Madhur - Performance Marketing & Meta Ads',
          callType: 'Outbound (AI calls users)',
          useCase: 'Paid Ads & Lead Gen',
          description: 'Qualifies businesses looking for high-converting Facebook and Google Ads campaigns.',
          voice: '👨 Madhur (Indian Male)'
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
    const isMale = vObj.gender === 'Male';
    const personaName = vObj.name.split(' ')[1];

    const sampleText = isMale 
      ? `नमस्ते सर! मैं Design Suvidha से ${personaName} बात कर रहा हूँ। हम आपके बिजनेस की ऑनलाइन ग्रोथ के लिए Meta Ads और वेबसाइट डेवलपमेंट सर्विसेज प्रोवाइड करते हैं।`
      : `नमस्ते सर! मैं Design Suvidha से ${personaName} बात कर रही हूँ। हम आपके बिजनेस की ऑनलाइन ग्रोथ के लिए Meta Ads और वेबसाइट डेवलपमेंट सर्विसेज प्रोवाइड करते हैं।`;

    setPlayingVoiceId(voiceId);

    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.lang = 'hi-IN';
    utterance.pitch = isMale ? 0.65 : 1.25;
    utterance.rate = isMale ? 0.92 : 0.96;

    const voices = window.speechSynthesis.getVoices();
    let sel = null;
    if (isMale) {
      sel = voices.find(v => (v.name.toLowerCase().includes('male') || v.name.includes('Madhur') || v.name.includes('David')) && !v.name.toLowerCase().includes('female'));
    } else {
      sel = voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Swara') || v.name.includes('Heera') || v.name.includes('Kalpana'));
    }
    if (!sel) sel = voices.find(v => v.lang.includes('hi')) || voices[0];
    if (sel) utterance.voice = sel;

    utterance.onend = () => setPlayingVoiceId(null);
    utterance.onerror = () => setPlayingVoiceId(null);
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
    setStatus({ type: 'success', message: `🎉 Voice Agent "${agentName}" created for Design Suvidha successfully!` });
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>🎨 Design Suvidha Voice Agent Creation Studio</h1>
          <p className="subtitle">Deploy customized AI Calling Agents with Design Suvidha marketing services knowledge</p>
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
        <h2 style={{ marginTop: 0, fontSize: '1.35rem', marginBottom: '0.5rem' }}>Create Customized Marketing Voice Agent</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>Configure your Design Suvidha agent pitch and business scripts</p>

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
              <option value="Outbound (AI calls users)">Outbound (AI calls business leads / Client Acquisition)</option>
              <option value="Inbound (Users call AI)">Inbound (Users call Design Suvidha / Client Support)</option>
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
              placeholder="e.g. Design Suvidha - Growth Consultant" 
            />
          </div>

          <div className="form-group mb-6">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>4. Core Service / Use Case</label>
            <input 
              required
              type="text" 
              className="form-control" 
              value={useCase}
              onChange={e => setUseCase(e.target.value)} 
              placeholder="e.g. Meta Ads, SEO, Website Development, Social Media Marketing" 
            />
          </div>

          <div className="form-group mb-8">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>5. AI Prompt & Company Pitch</label>
            <textarea 
              required
              rows="4"
              className="form-control" 
              value={activityDescription}
              onChange={e => setActivityDescription(e.target.value)} 
              placeholder="Describe how the agent should qualify clients for Design Suvidha services..." 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            🚀 Save & Launch Design Suvidha Agent
          </button>
        </form>
      </div>

      {/* Active Agents List */}
      <div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Active Design Suvidha Voice Agents ({agents.length})</h2>
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
