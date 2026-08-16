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
  const audioRef = useRef(null);

  const voiceLibrary = [
    { id: 'swara', name: '👩 Swara (Warm Real Estate Sales Specialist)', gender: 'Female', pitch: 1.25, rate: 0.96, desc: 'Sweet, natural & polite Indian female executive' },
    { id: 'ananya', name: '👩 Ananya (Corporate Customer Care Lead)', gender: 'Female', pitch: 1.2, rate: 1.0, desc: 'Clear, modern & energetic conversational sales voice' },
    { id: 'pooja', name: '👩 Pooja (Empathetic Healthcare & Education Advisor)', gender: 'Female', pitch: 1.28, rate: 0.92, desc: 'Soft & caring human cadence' },
    { id: 'kavya', name: '👩 Kavya (Persuasive Retail & Deals Specialist)', gender: 'Female', pitch: 1.22, rate: 1.02, desc: 'High conversion human conversational tone' },
    { id: 'madhur', name: '👨 Madhur (Senior Financial & Loan Consultant)', gender: 'Male', pitch: 0.65, rate: 0.92, desc: 'Deep, trustworthy & confident masculine voice' },
    { id: 'rohan', name: '👨 Rohan (Corporate & Legal Advisory Lead)', gender: 'Male', pitch: 0.60, rate: 0.90, desc: 'Deep, formal & respectful masculine cadence' },
    { id: 'aarav', name: '👨 Aarav (Dynamic Startup & Tech Lead)', gender: 'Male', pitch: 0.72, rate: 1.0, desc: 'Enthusiastic & friendly masculine tone' },
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

  // Human Conversational Audio Playback
  const speakResponse = async (text, customVoiceId) => {
    if (typeof window === 'undefined') return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const activeId = customVoiceId || ttsVoice;
    const activePersona = voiceLibrary.find(v => v.id === activeId) || voiceLibrary[0];
    const isMale = activePersona.gender === 'Male';

    try {
      setIsSpeaking(true);
      setStatusText(`AI Executive (${activePersona.name}) is speaking...`);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          gender: activePersona.gender,
          voice: activePersona.id
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        if (isMale) {
          audio.playbackRate = 0.93;
        } else {
          audio.playbackRate = 0.98;
        }

        audio.onended = () => {
          setIsSpeaking(false);
          setStatusText('Listening to your voice... (Speak now)');
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          setStatusText('Click to talk to your AI agent');
        };

        await audio.play();
      } else {
        throw new Error('TTS Stream error');
      }
    } catch (e) {
      console.log('Audio playback note:', e);
      setIsSpeaking(false);
    }
  };

  // Toggle Live Agent Playground
  const toggleAgent = () => {
    if (isCalling) {
      setIsCalling(false);
      setIsSpeaking(false);
      setStatusText('Call Ended. Click to talk to your AI agent');
      if (recognitionRef.current) recognitionRef.current.stop();
      if (audioRef.current) audioRef.current.pause();
    } else {
      setIsCalling(true);
      setStatusText('Agent Initialized! Connecting live audio...');
      
      const activePersona = voiceLibrary.find(v => v.id === ttsVoice) || voiceLibrary[0];
      const isMale = activePersona.gender === 'Male';
      const personaName = activePersona.name.split(' ')[1];

      // Natural Human Conversational Greeting
      const welcomeText = language === 'Hindi'
        ? (isMale 
            ? `अरे नमस्ते जी! मैं ${personaName} बात कर रहा हूँ सुविधा रियल एस्टेट से। बताइए ना, आपकी क्या मदद कर सकता हूँ आज?`
            : `अरे नमस्ते जी! मैं ${personaName} बात कर रही हूँ सुविधा रियल एस्टेट से। बताइए ना, आपकी क्या सहायता कर सकती हूँ आज?`)
        : `Hello! This is ${personaName} from Suvidha. How may I assist you today?`;

      setTranscriptHistory([{ sender: `AI Executive (${personaName})`, text: welcomeText }]);
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

    // Authentic Conversational Human Dialogues with Fillers
    if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('rate') || lower.includes('daam') || lower.includes('kitna')) {
      aiReply = isMale 
        ? 'हाँ जी बिल्कुल! हमारे सेक्टर 62 नोएडा वाले प्रीमियम 3 बीएचके फ्लैट्स सिर्फ 1.2 करोड़ से शुरू हो रहे हैं। क्या मैं आपके लिए इस शनिवार की साइट विज़िट बुक कर दूँ सर?'
        : 'हाँ जी बिल्कुल! हमारे सेक्टर 62 नोएडा वाले प्रीमियम 3 बीएचके फ्लैट्स सिर्फ 1.2 करोड़ से शुरू हो रहे हैं। क्या मैं आपके लिए इस शनिवार की साइट विज़िट बुक कर दूँ सर?';
    } else if (lower.includes('location') || lower.includes('kahan') || lower.includes('site') || lower.includes('kaha') || lower.includes('kidhar')) {
      aiReply = 'जी, यह प्रोजेक्ट सेक्टर 62 नोएडा में बिल्कुल प्राइम मेट्रो स्टेशन के पास है। हाईवे से सीधी कनेक्टिविटी है और शानदार क्लब हाउस भी है।';
    } else if (lower.includes('yes') || lower.includes('haan') || lower.includes('theek') || lower.includes('interested') || lower.includes('kar do')) {
      aiReply = isMale
        ? 'अरे बहुत ही बढ़िया सर! मैंने शनिवार सुबह 11 बजे का टाइम आपके नाम पर लॉक कर दिया है। मैं तुरंत आपको व्हाट्सएप पर ब्रोशर और लोकेशन भेज रहा हूँ!'
        : 'अरे बहुत ही बढ़िया सर! मैंने शनिवार सुबह 11 बजे का टाइम आपके नाम पर लॉक कर दिया है। मैं तुरंत आपको व्हाट्सएप पर ब्रोशर और लोकेशन भेज रही हूँ!';
    } else {
      aiReply = isMale 
        ? `जी बिल्कुल, मैं आपकी बात पूरी तरह समझ रहा हूँ। आप बेझिझक बताइए, आपको किस बजट या लोकेशन में प्रॉपर्टी देखनी है?`
        : `जी बिल्कुल, मैं आपकी बात पूरी तरह समझ रही हूँ। आप बेझिझक बताइए, आपको किस बजट या लोकेशन में प्रॉपर्टी देखनी है?`;
    }

    setTimeout(() => {
      setTranscriptHistory(prev => [...prev, { sender: `AI Executive (${personaName})`, text: aiReply }]);
      speakResponse(aiReply, ttsVoice);
    }, 300);
  };

  const currentPersona = voiceLibrary.find(v => v.id === ttsVoice) || voiceLibrary[0];

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>🎙️ Natural Human Conversational AI Playground</h1>
          <p className="subtitle" style={{ margin: 0 }}>Realistic Indian Voice Personas with Natural Human Cadence & Emotion</p>
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
                const p = voiceLibrary.find(v => v.id === newV);
                if (p) {
                  const sample = p.gender === 'Male' 
                    ? `अरे नमस्ते जी! मैं ${p.name.split(' ')[1]} बात कर रहा हूँ। सुविधा में आपका स्वागत है!`
                    : `अरे नमस्ते जी! मैं ${p.name.split(' ')[1]} बात कर रही हूँ। सुविधा में आपका स्वागत है!`;
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
            background: currentPersona.gender === 'Male' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(16, 185, 129, 0.08)', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: currentPersona.gender === 'Male' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)', 
            fontSize: '0.8125rem', 
            color: currentPersona.gender === 'Male' ? 'var(--accent-blue)' : 'var(--accent-green)' 
          }}>
            {currentPersona.gender === 'Male' ? '👨' : '👩'} <strong>{currentPersona.name} Active!</strong> Natural conversational cadence with authentic Hindi fillers (*अरे नमस्ते जी, हाँ जी बिल्कुल*).
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
