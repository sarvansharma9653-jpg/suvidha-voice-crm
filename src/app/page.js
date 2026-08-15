'use client';
import { useEffect, useState, useRef } from 'react';
import { store } from '@/lib/store';

export default function DeepgramPlaygroundPage() {
  // Voice Agent Config State (Deepgram Style)
  const [language, setLanguage] = useState('Hindi');
  const [useCase, setUseCase] = useState('General');
  const [ttsVoice, setTtsVoice] = useState('Flux - Swara (Indian, feminine)');
  const [llmModel, setLlmModel] = useState('Google Gemini 2.0 Flash Lite');
  const [activeTab, setActiveTab] = useState('Agent');

  // Interactive Audio Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState([
    { sender: 'AI Agent', text: 'Namaste! Main Suvidha Voice Assistant bol rahi hoon. Main aapki kya sahayata kar sakti hoon?' }
  ]);

  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Universal Web Speech API Synthesizer (100% Vercel & HTTPS Compatible!)
  const speakResponse = (text) => {
    if (!synthRef.current) return;
    
    // Stop previous utterance
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick female voice if available
    const voices = synthRef.current.getVoices();
    const femaleVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('female'));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => setIsAgentSpeaking(true);
    utterance.onend = () => setIsAgentSpeaking(false);
    utterance.onerror = () => setIsAgentSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const handleStartSession = () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      setIsAgentSpeaking(false);
      if (synthRef.current) synthRef.current.cancel();
    } else {
      setIsSessionActive(true);
      const greeting = 'Namaste! Main Suvidha AI Voice Agent bol rahi hoon. Aapka swagat hai!';
      speakResponse(greeting);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userMsg = textInput.trim();
    setTextInput('');

    // Append User Message
    const updatedHistory = [...transcriptHistory, { sender: 'You', text: userMsg }];
    setTranscriptHistory(updatedHistory);

    // Generate Feminine Hindi AI Reply
    let aiReply = '';
    const input = userMsg.toLowerCase();
    if (input.includes('namaste') || input.includes('hello') || input.includes('hi') || input.includes('kaise')) {
      aiReply = 'Namaste! Main Suvidha AI Voice Assistant bol rahi hoon. Aap kaise hain aur main aapki kya sahayata kar sakti hoon?';
    } else if (input.includes('price') || input.includes('cost') || input.includes('kitna') || input.includes('rate')) {
      aiReply = 'Aapka poora AI Voice CRM setup 100% Free credits par chal raha hai! Aapko koi charges nahi dene hain.';
    } else if (input.includes('noida') || input.includes('flat') || input.includes('property') || input.includes('real estate')) {
      aiReply = 'Sector 62 Noida mein 3 BHK Luxury Flat available hai 1.2 Crore mein. Kya main aapka site visit schedule kar doon?';
    } else if (input.includes('kaun') || input.includes('who') || input.includes('naam')) {
      aiReply = 'Main Suvidha Voice CRM ki Automated Female AI Voice Assistant hoon.';
    } else {
      aiReply = 'Ji bilkul, main aapki baat samajh rahi hoon. Kripya bataiye main aapki kya sahayata kar sakti hoon?';
    }

    setTimeout(() => {
      setTranscriptHistory(prev => [...prev, { sender: 'AI Agent', text: aiReply }]);
      speakResponse(aiReply);
    }, 600);
  };

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>🎙️ Voice Agent Playground</h1>
          <p className="subtitle" style={{ margin: 0 }}>Configure and test your real-time AI voice agent</p>
        </div>

        <div className="flex items-center gap-4">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Credit: <strong style={{ color: 'var(--accent-green)' }}>$199.49 FREE</strong></span>
          <button className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>📄 Code Sample</button>
        </div>
      </div>

      {/* Main Grid: Left Config, Right Deepgram Glowing Ring Console */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '2rem' }}>
        
        {/* Left Column: Voice Agent Settings (Deepgram & Dograh Style) */}
        <div className="card" style={{ padding: '1.75rem', background: '#0c0c12' }}>
          <h2 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            ⚙️ Voice Agent Settings
          </h2>

          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Language</label>
            <select className="form-control" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="Hindi">🇮🇳 Hindi / Hinglish</option>
              <option value="English">🇺🇸 English</option>
            </select>
          </div>

          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Try a Use Case</label>
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

          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>TTS Voice Model</label>
            <select className="form-control" value={ttsVoice} onChange={e => setTtsVoice(e.target.value)}>
              <option value="Flux - Swara (Indian, feminine)">Flux - Swara (Indian, feminine)</option>
              <option value="Flux - Naveen (Indian, masculine)">Flux - Naveen (Indian, masculine)</option>
            </select>
          </div>

          <div className="form-group mb-6">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>LLM Intelligence Model</label>
            <select className="form-control" value={llmModel} onChange={e => setLlmModel(e.target.value)}>
              <option value="Google Gemini 2.0 Flash Lite">Google Gemini 2.0 Flash Lite</option>
              <option value="Google Gemini 1.5 Flash">Google Gemini 1.5 Flash</option>
            </select>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            💡 <strong>System Prompt:</strong> Calling as polite female AI agent for Suvidha. Uses feminine Hindi grammar (<em>kar rahi hoon, bata rahi hoon</em>).
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
              Agent Console
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
              <div className={`ring-circle ${isSessionActive ? 'active' : ''} ${isAgentSpeaking ? 'speaking' : ''}`}></div>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#12121a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, fontSize: '2.5rem' }}>
                {isAgentSpeaking ? '🗣️' : isSessionActive ? '🎙️' : '🤖'}
              </div>
            </div>

            {/* Glowing Green Action Button */}
            <button 
              onClick={handleStartSession}
              className={`talk-agent-btn ${isSessionActive ? 'active' : ''}`}
            >
              {isSessionActive ? '🔴 Terminate Session' : '🎙️ Talk To Your Agent'}
            </button>
          </div>

          {/* Interactive Chat & Transcript Console */}
          <div style={{ width: '100%', marginTop: '2rem', background: '#12121a', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.25rem' }}>
            <div style={{ maxHeight: '160px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {transcriptHistory.map((item, idx) => (
                <div key={idx} style={{ textAlign: item.sender === 'You' ? 'right' : 'left' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>{item.sender}</span>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '0.5rem 0.875rem', 
                    borderRadius: '12px', 
                    fontSize: '0.85rem', 
                    background: item.sender === 'You' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    color: item.sender === 'You' ? 'var(--accent-blue)' : 'var(--accent-green)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Text Message Form (Bypasses WebSockets / Vercel HTTPS limitations) */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Type message (e.g. Namaste, property details batao...)" 
                value={textInput} 
                onChange={e => setTextInput(e.target.value)} 
                style={{ fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
