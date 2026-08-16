'use client';
import { useEffect, useState, useRef } from 'react';
import { store } from '@/lib/store';

export default function OverviewPage() {
  const [stats, setStats] = useState({ totalCalls: 0, completed: 0, hotLeads: 0, totalMinutes: 0 });
  const [language, setLanguage] = useState('Hindi');
  const [useCase, setUseCase] = useState('Real Estate');
  const [ttsVoice, setTtsVoice] = useState('swara');
  const [llmModel, setLlmModel] = useState('Google Gemini 2.0 Flash Lite');
  
  // Audio Ring & Speech State
  const [isCalling, setIsCalling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Click to talk to your AI agent');
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('Agent');

  const recognitionRef = useRef(null);

  const voiceLibrary = [
    { id: 'swara', name: '👩 Swara (Warm Indian Hindi Female)', gender: 'Female', pitch: 1.25, rate: 0.95, desc: 'Sweet & polite feminine voice (kar rahi hoon, bata rahi hoon)' },
    { id: 'ananya', name: '👩 Ananya (Professional Corporate Female)', gender: 'Female', pitch: 1.2, rate: 1.0, desc: 'Clear & energetic modern Hinglish sales voice' },
    { id: 'pooja', name: '👩 Pooja (Empathetic Care Female)', gender: 'Female', pitch: 1.3, rate: 0.9, desc: 'Soft & caring, best for Healthcare & Education' },
    { id: 'kavya', name: '👩 Kavya (Persuasive Retail Female)', gender: 'Female', pitch: 1.22, rate: 1.02, desc: 'High conversion for E-commerce & Festive offers' },
    { id: 'madhur', name: '👨 Madhur (Corporate Indian Male)', gender: 'Male', pitch: 0.72, rate: 0.92, desc: 'Deep, confident masculine Hindi voice (bol raha hoon, bata raha hoon)' },
    { id: 'rohan', name: '👨 Rohan (Authoritative Indian Male)', gender: 'Male', pitch: 0.68, rate: 0.9, desc: 'Deep & formal tone for Financial & Legal advisory' },
    { id: 'aarav', name: '👨 Aarav (Dynamic Young Indian Male)', gender: 'Male', pitch: 0.78, rate: 1.02, desc: 'Enthusiastic masculine tone for Tech Startups & Cars' },
  ];

  useEffect(() => {
    const calls = store.getCalls();
    const completed = calls.filter(c => c.status === 'Completed').length;
    const hotLeads = calls.filter(c => c.sentiment?.includes('Hot')).length;
    const totalMinutes = calls.reduce((sum, c) => sum + (c.duration || 0), 0);

    setStats({
      totalCalls: calls.length,
      completed,
      hotLeads,
      totalMinutes: Math.round(totalMinutes / 60)
    });
  }, []);

  // Web Speech Audio Output Engine (Multi-Gender Neural Voice Switcher)
  const speakResponse = (text, customVoiceId) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const activeId = customVoiceId || ttsVoice;
    const activePersona = voiceLibrary.find(v => v.id === activeId) || voiceLibrary[0];
    
    utterance.pitch = activePersona.pitch;
    utterance.rate = activePersona.rate;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (activePersona.gender === 'Male') {
      // Find explicitly male Indian or English voice
      selectedVoice = voices.find(v => (v.lang.includes('hi') || v.lang.includes('IN')) && (v.name.includes('Madhur') || v.name.includes('Ravi') || v.name.includes('Male') || v.name.includes('David') || v.name.includes('George')));
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Mark') || v.name.includes('Guy'));
      }
    } else {
      // Find female Indian voice
      selectedVoice = voices.find(v => (v.lang.includes('hi') || v.lang.includes('IN')) && (v.name.includes('Swara') || v.name.includes('Kalpana') || v.name.includes('Heera') || v.name.includes('Female') || v.name.includes('Zira')));
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Jenny'));
      }
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN')) || voices[0];
    }

    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusText(`AI Agent (${activePersona.name}) is speaking...`);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusText('Listening to your voice... (Speak now)');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatusText('Click to talk to your AI agent');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Live Agent Playground
  const toggleAgent = () => {
    if (isCalling) {
      setIsCalling(false);
      setIsSpeaking(false);
      setStatusText('Call Ended. Click to talk to your AI agent');
      if (recognitionRef.current) recognitionRef.current.stop();
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
      setIsCalling(true);
      setStatusText('Agent Initialized! Connecting live audio...');
      
      const activePersona = voiceLibrary.find(v => v.id === ttsVoice) || voiceLibrary[0];
      const isMale = activePersona.gender === 'Male';
      const personaName = activePersona.name.split(' ')[1];

      const welcomeText = language === 'Hindi'
        ? (isMale 
            ? `Namaste! Main ${personaName} bol raha hoon. Kripya bataiye main aapki kya sahayata kar sakta hoon?`
            : `Namaste! Main ${personaName} bol rahi hoon. Kripya bataiye main aapki kya sahayata kar sakti hoon?`)
        : `Hello! I am your AI assistant ${personaName}. How can I assist you today?`;

      setTranscriptHistory([{ sender: `AI Agent (${personaName})`, text: welcomeText }]);
      speakResponse(welcomeText, ttsVoice);

      // Start Browser Speech Recognition
      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          if (transcript.trim()) {
            setTranscriptHistory(prev => [...prev, { sender: 'You (User)', text: transcript }]);
            handleAgentAIResponse(transcript);
          }
        };

        recognition.onerror = (e) => console.log('Speech recognition note:', e.error);
        recognition.start();
        recognitionRef.current = recognition;
      }
    }
  };

  const handleAgentAIResponse = (userText) => {
    const activePersona = voiceLibrary.find(v => v.id === ttsVoice) || voiceLibrary[0];
    const isMale = activePersona.gender === 'Male';
    const personaName = activePersona.name.split(' ')[1];

    let aiReply = '';
    const lower = userText.toLowerCase();

    if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('rate') || lower.includes('daam')) {
      aiReply = isMale 
        ? 'Hamare Sector 62 Noida 3 BHK flats 1.2 Crore se start hote hain. Kya main aapke liye Saturday ko site visit arrange kar doon?'
        : 'Hamare Sector 62 Noida 3 BHK flats 1.2 Crore se start hote hain. Kya main aapke liye Saturday ko site visit arrange kar doon?';
    } else if (lower.includes('location') || lower.includes('kahan') || lower.includes('site')) {
      aiReply = 'Yeh project Sector 62 Noida prime metro station ke paas located hai. Highway connectivity aur car parking available hai.';
    } else if (lower.includes('yes') || lower.includes('haan') || lower.includes('theek') || lower.includes('interested')) {
      aiReply = isMale
        ? 'Bahut badhiya! Maine aapki Saturday 11 AM ki site visit schedule kar di hai. Main aapko WhatsApp par brochure bhej raha hoon.'
        : 'Bahut badhiya! Maine aapki Saturday 11 AM ki site visit schedule kar di hai. Main aapko WhatsApp par brochure bhej rahi hoon.';
    } else {
      aiReply = isMale 
        ? `Ji bilkul, main aapki baat samajh raha hoon. Kripya bataiye main aapki kya sahayata kar sakta hoon?`
        : `Ji bilkul, main aapki baat samajh rahi hoon. Kripya bataiye main aapki kya sahayata kar sakti hoon?`;
    }

    setTimeout(() => {
      setTranscriptHistory(prev => [...prev, { sender: `AI Agent (${personaName})`, text: aiReply }]);
      speakResponse(aiReply, ttsVoice);
    }, 400);
  };

  const currentPersona = voiceLibrary.find(v => v.id === ttsVoice) || voiceLibrary[0];

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>🎙️ Multi-Voice AI Agent Playground</h1>
          <p className="subtitle" style={{ margin: 0 }}>Test and switch between 7 Indian Female and Male voice personas</p>
        </div>

        <div className="flex items-center gap-4">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Credit: <strong style={{ color: 'var(--accent-green)' }}>$199.49 FREE</strong></span>
          <button className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>📄 Code Sample</button>
        </div>
      </div>

      {/* Main Grid: Left Config, Right Deepgram Glowing Ring Console */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '2rem' }}>
        
        {/* Left Column: Voice Persona Selector */}
        <div className="card" style={{ padding: '1.75rem', background: '#0c0c12' }}>
          <h2 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            ⚙️ Select Voice Persona
          </h2>

          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>AI Voice Persona (7 Indian Voices)</label>
            <select 
              className="form-control" 
              value={ttsVoice} 
              onChange={e => {
                const newV = e.target.value;
                setTtsVoice(newV);
                // Quick test sample audio
                const p = voiceLibrary.find(v => v.id === newV);
                if (p) {
                  const sample = p.gender === 'Male' 
                    ? `Namaste! Main ${p.name.split(' ')[1]} bol raha hoon.`
                    : `Namaste! Main ${p.name.split(' ')[1]} bol rahi hoon.`;
                  speakResponse(sample, newV);
                }
              }}
            >
              {voiceLibrary.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
              {currentPersona.desc}
            </span>
          </div>

          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Language Mode</label>
            <select className="form-control" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="Hindi">🇮🇳 Hindi / Hinglish</option>
              <option value="English">🇺🇸 English</option>
            </select>
          </div>

          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Business Use Case Script</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {['General', 'Real Estate', 'Customer Support', 'Sales Discovery'].map(uc => (
                <button 
                  key={uc}
                  type="button"
                  onClick={() => setUseCase(uc)}
                  className={`btn ${useCase === uc ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', textAlign: 'center' }}
                >
                  {uc}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group mb-6">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>LLM Intelligence Engine</label>
            <select className="form-control" value={llmModel} onChange={e => setLlmModel(e.target.value)}>
              <option value="Google Gemini 2.0 Flash Lite">Google Gemini 2.0 Flash Lite</option>
              <option value="Google Gemini 1.5 Flash">Google Gemini 1.5 Flash</option>
            </select>
          </div>

          <div style={{ 
            background: currentPersona.gender === 'Male' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(16, 185, 129, 0.08)', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: currentPersona.gender === 'Male' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)', 
            fontSize: '0.8125rem', 
            color: currentPersona.gender === 'Male' ? 'var(--accent-blue)' : 'var(--accent-green)' 
          }}>
            {currentPersona.gender === 'Male' ? '👨' : '👩'} <strong>{currentPersona.name} Active!</strong> {currentPersona.gender === 'Male' ? 'Masculine Hindi grammar (bol raha hoon, kar raha hoon)' : 'Feminine Hindi grammar (bol rahi hoon, kar rahi hoon)'}.
          </div>
        </div>

        {/* Right Column: Deepgram Glowing Pulsing Ring Console */}
        <div className="deepgram-container">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '1.5rem', position: 'absolute', top: '1.5rem', left: '2rem', borderBottom: '1px solid var(--border-light)', width: 'calc(100% - 4rem)' }}>
            <button 
              onClick={() => setActiveTab('Agent')}
              style={{ background: 'none', border: 'none', borderBottom: activeTab === 'Agent' ? '2px solid var(--accent-green)' : 'none', color: activeTab === 'Agent' ? '#fff' : 'var(--text-secondary)', paddingBottom: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
            >
              Agent Console ({currentPersona.gender === 'Female' ? '👩' : '👨'} {currentPersona.name.split(' ')[1]})
            </button>
            <button 
              onClick={() => setActiveTab('Developer')}
              style={{ background: 'none', border: 'none', borderBottom: activeTab === 'Developer' ? '2px solid var(--accent-green)' : 'none', color: activeTab === 'Developer' ? '#fff' : 'var(--text-secondary)', paddingBottom: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
            >
              Developer Logs
            </button>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            {/* Glowing Pulsing Ring Visualizer */}
            <div className="ring-visualizer">
              <div className={`ring-circle ring-outer ${isCalling ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}></div>
              <div className={`ring-circle ring-middle ${isCalling ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}></div>
              <div className={`ring-circle ring-inner ${isCalling ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}>
                <span style={{ fontSize: '2.5rem' }}>
                  {isSpeaking ? '🔊' : isCalling ? (currentPersona.gender === 'Male' ? '👨‍💼' : '👩‍💼') : '🎧'}
                </span>
              </div>
            </div>

            {/* Status & Subtitle */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: isSpeaking ? 'var(--accent-green)' : isCalling ? 'var(--accent-blue)' : '#fff', marginBottom: '0.25rem' }}>
                {statusText}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {isCalling ? `Speaking as ${currentPersona.name}` : 'Click the button below to start live microphone conversation'}
              </div>
            </div>

            {/* Big Action Button */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <button 
                onClick={toggleAgent} 
                className={`talk-agent-btn ${isCalling ? 'listening' : ''}`}
              >
                {isCalling ? '⏹️ End Voice Conversation' : `🎙️ Talk With ${currentPersona.name.split(' ')[1]}`}
              </button>
            </div>

            {/* Live Conversation Transcript History */}
            {transcriptHistory.length > 0 && (
              <div style={{ background: '#0a0a0f', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', maxHeight: '180px', overflowY: 'auto', textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                  💬 LIVE CONVERSATION TRANSCRIPT:
                </div>
                {transcriptHistory.map((t, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', marginBottom: '0.4rem', color: t.sender.includes('AI') ? 'var(--accent-green)' : 'var(--accent-blue)' }}>
                    <strong>{t.sender}:</strong> {t.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
