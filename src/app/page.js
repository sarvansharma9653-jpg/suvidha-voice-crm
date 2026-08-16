'use client';
import { useEffect, useState, useRef } from 'react';
import { store } from '@/lib/store';

export default function OverviewPage() {
  const [stats, setStats] = useState({ totalCalls: 0, completed: 0, hotLeads: 0, totalMinutes: 0 });
  const [language, setLanguage] = useState('Hindi');
  const [useCase, setUseCase] = useState('Real Estate');
  const [ttsVoice, setTtsVoice] = useState('madhur');
  const [llmModel, setLlmModel] = useState('Google Gemini 2.0 Flash Lite');
  
  // Custom Introduction Script Editable by User!
  const [customIntroScript, setCustomIntroScript] = useState('अरे नमस्ते जी! मैं सुविधा रियल एस्टेट से बात कर रहा हूँ। बताइए ना, आपकी क्या सहायता कर सकता हूँ आज?');

  // Audio Ring & Speech State
  const [isCalling, setIsCalling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Click to talk to your AI agent');
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('Agent');

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const voiceLibrary = [
    { id: 'madhur', name: '👨 Madhur (Corporate Indian Male)', gender: 'Male', pitch: 0.65, rate: 0.90, desc: 'Deep, masculine Indian Hindi sales consultant (बोल रहा हूँ)' },
    { id: 'rohan', name: '👨 Rohan (Executive & Financial Male)', gender: 'Male', pitch: 0.58, rate: 0.88, desc: 'Deep, authoritative masculine voice for Loans & Legal' },
    { id: 'aarav', name: '👨 Aarav (Dynamic Young Indian Male)', gender: 'Male', pitch: 0.70, rate: 0.98, desc: 'Enthusiastic masculine tone for Tech & Startups' },
    { id: 'swara', name: '👩 Swara (Warm Real Estate Female)', gender: 'Female', pitch: 1.25, rate: 0.96, desc: 'Sweet, natural & polite Indian female executive (बोल रही हूँ)' },
    { id: 'ananya', name: '👩 Ananya (Corporate Customer Care Female)', gender: 'Female', pitch: 1.2, rate: 1.0, desc: 'Clear, modern & energetic conversational sales voice' },
    { id: 'pooja', name: '👩 Pooja (Empathetic Healthcare Female)', gender: 'Female', pitch: 1.28, rate: 0.92, desc: 'Soft & caring human cadence for Clinics & Care' },
    { id: 'kavya', name: '👩 Kavya (Persuasive Retail & Deals Female)', gender: 'Female', pitch: 1.22, rate: 1.02, desc: 'High conversion human conversational tone' },
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

  const currentPersona = voiceLibrary.find(v => v.id === ttsVoice) || voiceLibrary[0];
  const isCurrentMale = currentPersona.gender === 'Male';

  // Dynamic Greeting Generator based on Voice selection
  const updateVoiceSelection = (newVoiceId) => {
    setTtsVoice(newVoiceId);
    const p = voiceLibrary.find(v => v.id === newVoiceId) || voiceLibrary[0];
    const isMale = p.gender === 'Male';
    const personaName = p.name.split(' ')[1];

    const newIntro = isMale
      ? `अरे नमस्ते जी! मैं ${personaName} बात कर रहा हूँ सुविधा से। बताइए ना, आपकी क्या सहायता कर सकता हूँ आज?`
      : `अरे नमस्ते जी! मैं ${personaName} बात कर रही हूँ सुविधा से। बताइए ना, आपकी क्या सहायता कर सकती हूँ आज?`;
    
    setCustomIntroScript(newIntro);
    speakResponse(newIntro, newVoiceId);
  };

  // Robust Male vs Female Speech Output Engine
  const speakResponse = (text, customVoiceId) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const activeId = customVoiceId || ttsVoice;
    const activePersona = voiceLibrary.find(v => v.id === activeId) || voiceLibrary[0];
    const isMale = activePersona.gender === 'Male';

    utterance.pitch = activePersona.pitch;
    utterance.rate = activePersona.rate;
    utterance.lang = 'hi-IN';

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (isMale) {
      // Find explicitly Male voice
      selectedVoice = voices.find(v => (v.name.toLowerCase().includes('male') || v.name.includes('Madhur') || v.name.includes('Ravi') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Guy')) && !v.name.toLowerCase().includes('female'));
    } else {
      // Find explicitly Female voice
      selectedVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Swara') || v.name.includes('Heera') || v.name.includes('Kalpana') || v.name.includes('Zira'));
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN')) || voices[0];
    }

    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusText(`AI (${activePersona.name}) is speaking...`);
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
      
      const welcomeText = customIntroScript.trim() || (isCurrentMale 
        ? `अरे नमस्ते जी! मैं ${currentPersona.name.split(' ')[1]} बात कर रहा हूँ। बताइए ना, आपकी क्या सहायता कर सकता हूँ आज?`
        : `अरे नमस्ते जी! मैं ${currentPersona.name.split(' ')[1]} बात कर रही हूँ। बताइए ना, आपकी क्या सहायता कर सकती हूँ आज?`);

      setTranscriptHistory([{ sender: `AI Executive (${currentPersona.name.split(' ')[1]})`, text: welcomeText }]);
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
    const personaName = currentPersona.name.split(' ')[1];
    let aiReply = '';
    const lower = userText.toLowerCase();

    if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('rate') || lower.includes('daam') || lower.includes('kitna')) {
      aiReply = isCurrentMale 
        ? 'हाँ जी बिल्कुल सर! हमारे सेक्टर 62 नोएडा वाले 3 बीएचके फ्लैट्स सिर्फ 1.2 करोड़ से शुरू हो रहे हैं। क्या मैं आपके लिए इस शनिवार की साइट विज़िट बुक कर दूँ सर?'
        : 'हाँ जी बिल्कुल सर! हमारे सेक्टर 62 नोएडा वाले 3 बीएचके फ्लैट्स सिर्फ 1.2 करोड़ से शुरू हो रहे हैं। क्या मैं आपके लिए इस शनिवार की साइट विज़िट बुक कर दूँ सर?';
    } else if (lower.includes('location') || lower.includes('kahan') || lower.includes('site') || lower.includes('kaha') || lower.includes('kidhar')) {
      aiReply = 'जी, यह प्रोजेक्ट सेक्टर 62 नोएडा में बिल्कुल प्राइम मेट्रो स्टेशन के पास है। हाईवे से सीधी कनेक्टिविटी है और क्लब हाउस भी है।';
    } else if (lower.includes('yes') || lower.includes('haan') || lower.includes('theek') || lower.includes('interested') || lower.includes('kar do')) {
      aiReply = isCurrentMale
        ? 'अरे बहुत ही बढ़िया सर! मैंने शनिवार सुबह 11 बजे का टाइम आपके नाम पर लॉक कर दिया है। मैं तुरंत आपको व्हाट्सएप पर ब्रोशर भेज रहा हूँ!'
        : 'अरे बहुत ही बढ़िया सर! मैंने शनिवार सुबह 11 बजे का टाइम आपके नाम पर लॉक कर दिया है। मैं तुरंत आपको व्हाट्सएप पर ब्रोशर भेज रही हूँ!';
    } else {
      aiReply = isCurrentMale 
        ? `जी बिल्कुल, मैं आपकी बात पूरी तरह समझ रहा हूँ। आप बेझिझक बताइए, आपको किस बजट या लोकेशन में प्रॉपर्टी देखनी है?`
        : `जी बिल्कुल, मैं आपकी बात पूरी तरह समझ रही हूँ। आप बेझिझक बताइए, आपको किस बजट या लोकेशन में प्रॉपर्टी देखनी है?`;
    }

    setTimeout(() => {
      setTranscriptHistory(prev => [...prev, { sender: `AI Executive (${personaName})`, text: aiReply }]);
      speakResponse(aiReply, ttsVoice);
    }, 300);
  };

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>🎙️ Conversational AI Agent Studio</h1>
          <p className="subtitle" style={{ margin: 0 }}>Customize Introduction Script, Voice Personas (Male/Female), and Test Live</p>
        </div>

        <div className="flex items-center gap-4">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Credit: <strong style={{ color: 'var(--accent-green)' }}>$199.49 FREE</strong></span>
          <button className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>📄 Code Sample</button>
        </div>
      </div>

      {/* Main Grid: Left Config, Right Deepgram Glowing Ring Console */}
      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: '2rem' }}>
        
        {/* Left Column: Voice Persona & Custom Script */}
        <div className="card" style={{ padding: '1.75rem', background: '#0c0c12' }}>
          <h2 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            ⚙️ AI Voice & Script Configuration
          </h2>

          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Select Voice Persona (Male / Female)</label>
            <select 
              className="form-control" 
              value={ttsVoice} 
              onChange={e => updateVoiceSelection(e.target.value)}
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

          {/* Editable Custom Introduction Script */}
          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>📝 Custom Introduction Script (Editable)</label>
            <textarea 
              rows="3"
              className="form-control"
              value={customIntroScript}
              onChange={e => setCustomIntroScript(e.target.value)}
              placeholder="Type custom introduction script..."
              style={{ fontSize: '0.85rem', lineHeight: '1.4' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
              Aap jo bhi script yahan likhenge, AI call start hote hi wahi bolegi!
            </span>
          </div>

          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Language Mode</label>
            <select className="form-control" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="Hindi">🇮🇳 Pure Conversational Hindi / Hinglish</option>
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
            background: isCurrentMale ? 'rgba(59, 130, 246, 0.08)' : 'rgba(16, 185, 129, 0.08)', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: isCurrentMale ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)', 
            fontSize: '0.8125rem', 
            color: isCurrentMale ? 'var(--accent-blue)' : 'var(--accent-green)' 
          }}>
            {isCurrentMale ? '👨' : '👩'} <strong>{currentPersona.name} Active!</strong> {isCurrentMale ? 'Deep Masculine Male Voice (bol raha hoon)' : 'Sweet Feminine Female Voice (bol rahi hoon)'}.
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
              Agent Console ({isCurrentMale ? '👨' : '👩'} {currentPersona.name.split(' ')[1]})
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
                  {isSpeaking ? '🔊' : isCalling ? (isCurrentMale ? '👨‍💼' : '👩‍💼') : '🎧'}
                </span>
              </div>
            </div>

            {/* Status & Subtitle */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: isSpeaking ? 'var(--accent-green)' : isCalling ? 'var(--accent-blue)' : '#fff', marginBottom: '0.25rem' }}>
                {statusText}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {isCalling ? `Speaking naturally as ${currentPersona.name}` : 'Click the button below to start live microphone conversation'}
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
