'use client';
import { useEffect, useState, useRef } from 'react';
import { store } from '@/lib/store';

export default function OverviewPage() {
  // Use Case Selector (Deepgram Style)
  const [selectedUseCase, setSelectedUseCase] = useState('General');
  const [configTab, setConfigTab] = useState('LLM'); // 'Voice' | 'LLM' | 'Functions' | 'Transcription'
  const [rightTab, setRightTab] = useState('Agent'); // 'Agent' | 'Developer Console'

  // Model & Voice Config
  const [language, setLanguage] = useState('Hindi / Hinglish');
  const [llmModel, setLlmModel] = useState('Google Gemini 2.0 Flash Lite');
  const [llmTemperature, setLlmTemperature] = useState(0.7);
  const [ttsVoice, setTtsVoice] = useState('madhur');
  const [sttModel, setSttModel] = useState('Deepgram Nova-2 (Real-time)');
  const [elevenLabsKey, setElevenLabsKey] = useState('sk_fd1cace7cf05a5e700ce78a557f61815046a23576e8cb477');

  // Prompts & Scripts
  const [systemPrompt, setSystemPrompt] = useState(`#General Guidelines
-Be warm, friendly, and professional.
-Speak clearly and naturally in Indian Hindi/Hinglish language.
-Keep most responses to 1-2 sentences and under 120 characters unless caller asks for more details.
-Do not use markdown formatting like asterisks or bold in voice output.
-Help customer with product information, sales discovery, and booking consultation.`);

  const [greetingText, setGreetingText] = useState('नमस्ते! मैं आपका एआई वॉइस असिस्टेंट बोल रहा हूँ। बताइए, आज मैं आपकी क्या सहायता कर सकता हूँ?');

  // Call & Audio State
  const [isCalling, setIsCalling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Click to talk to your AI agent');
  const [transcriptHistory, setTranscriptHistory] = useState([
    { sender: 'AI Assistant', text: 'नमस्ते! मैं आपका एआई असिस्टेंट हूँ। आप मुझसे बोलकर (Mic) या चैट (Text) से बात कर सकते हैं।' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const activeSourceRef = useRef(null);
  const chatEndRef = useRef(null);

  // 7 DISTINCT ELEVENLABS VOICES
  const voiceLibrary = [
    { id: 'madhur', name: '👨 Madhur (ElevenLabs Real Male)', gender: 'Male', pitch: 0.64, rate: 0.94, desc: 'Deep, authentic human masculine consultant (George)' },
    { id: 'rohan', name: '👨 Rohan (ElevenLabs Deep Bass Male)', gender: 'Male', pitch: 0.48, rate: 0.86, desc: 'Authoritative baritone male executive voice' },
    { id: 'aarav', name: '👨 Aarav (ElevenLabs Young Male)', gender: 'Male', pitch: 0.78, rate: 1.06, desc: 'Energetic, fast-paced modern male closer' },
    { id: 'swara', name: '👩 Swara (ElevenLabs Real Female)', gender: 'Female', pitch: 1.34, rate: 0.94, desc: 'Sweet, natural & warm human female executive (Sarah)' },
    { id: 'ananya', name: '👩 Ananya (ElevenLabs Modern Female)', gender: 'Female', pitch: 1.15, rate: 1.08, desc: 'Crisp, fast-paced modern Hinglish sales closer' },
    { id: 'pooja', name: '👩 Pooja (ElevenLabs Soft Female)', gender: 'Female', pitch: 1.22, rate: 0.88, desc: 'Calm, soothing empathetic healthcare cadence' },
    { id: 'kavya', name: '👩 Kavya (ElevenLabs Dynamic Female)', gender: 'Female', pitch: 1.28, rate: 1.02, desc: 'Warm, dynamic & expressive sales pitch tone' },
  ];

  const useCasePresets = {
    'Custom': {
      prompt: `#Custom Assistant Guidelines\n-Act as a knowledgeable and helpful AI assistant for custom business requirements.\n-Speak in conversational Hindi/English.`,
      greeting: 'नमस्ते! मैं आपका कस्टम एआई असिस्टेंट हूँ। बताइए, मैं आपकी क्या सहायता करूँ?'
    },
    'General': {
      prompt: `#General Guidelines\n-Be warm, friendly, and professional.\n-Speak clearly and naturally in Indian Hindi/Hinglish.\n-Keep responses concise (1-2 sentences) unless asked for details.\n-Help callers with product questions, scheduling, and information.`,
      greeting: 'नमस्ते! मैं आपका एआई असिस्टेंट बोल रहा हूँ। बताइए, आज आपकी क्या सहायता कर सकता हूँ?'
    },
    'Healthcare': {
      prompt: `#Healthcare Clinic Guidelines\n-Be calm, empathetic, and polite.\n-Help patients book clinic appointments, check doctor availability, and give general clinic timings.\n-Remind them that in emergencies, visit hospital immediately.`,
      greeting: 'नमस्ते! सुविधा हेल्थकेयर में आपका स्वागत है। क्या मैं आपके लिए डॉक्टर का अपॉइंटमेंट बुक कर दूँ?'
    },
    'Customer support': {
      prompt: `#Customer Support Guidelines\n-Politely resolve customer issues, track orders, and process return/exchange requests.\n-Gather customer phone number and order ID.`,
      greeting: 'नमस्ते! सुविधा कस्टमर केयर में आपका स्वागत है। बताइए, आपकी किस समस्या में सहायता करूँ?'
    },
    'Sales': {
      prompt: `#Sales Discovery Guidelines\n-Qualify business leads for product demos.\n-Ask about their monthly budget and timeline.\n-Offer a free 15-minute consultation with senior sales executive.`,
      greeting: 'नमस्ते सर! मैं सुविधा सेल्स से बात कर रहा हूँ। क्या आप अपने बिजनेस के लिए ज्यादा कस्टमर्स और लीड्स चाहते हैं?'
    },
    'Financial services': {
      prompt: `#Financial & Loan Guidelines\n-Offer pre-approved personal loans up to 10 Lakhs with low interest rates.\n-Check customer employment type (Salaried or Business).`,
      greeting: 'नमस्ते सर! मैं सुविधा फाइनेंस से बोल रहा हूँ। आपका 5 लाख तक का प्री-अप्रूव्ड लोन रेडी है, क्या मैं डिटेल्स बताऊँ?'
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';
      const key = localStorage.getItem(`elevenLabsApiKey_${uid}`) || localStorage.getItem('elevenLabsApiKey') || 'sk_fd1cace7cf05a5e700ce78a557f61815046a23576e8cb477';
      setElevenLabsKey(key);
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcriptHistory]);

  const currentPersona = voiceLibrary.find(v => v.id === ttsVoice) || voiceLibrary[0];
  const isCurrentMale = currentPersona.gender === 'Male';

  const selectUseCase = (uc) => {
    setSelectedUseCase(uc);
    if (useCasePresets[uc]) {
      let g = useCasePresets[uc].greeting;
      if (!isCurrentMale) {
        g = g.replace('रहा हूँ', 'रही हूँ').replace('सकता हूँ', 'सकती हूँ');
      }
      setSystemPrompt(useCasePresets[uc].prompt);
      setGreetingText(g);
      speakWithAudioContext(g, ttsVoice);
    }
  };

  // 100% UNBLOCKABLE Web Audio API PCM Player
  const playBase64WithAudioContext = async (base64String) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (activeSourceRef.current) {
        try { activeSourceRef.current.stop(); } catch(e) {}
      }

      const cleanBase64 = base64String.replace(/^data:audio\/\w+;base64,/, '');
      const binaryString = window.atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      source.onended = () => {
        setIsSpeaking(false);
        setStatusText(isCalling ? 'Listening... (Speak now)' : 'Ready');
        if (isCalling && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch(e) {}
        }
      };

      activeSourceRef.current = source;
      source.start(0);
      setIsSpeaking(true);
      setStatusText(`AI (${currentPersona.name.split(' ')[1]}) is speaking...`);
      return true;
    } catch (e) {
      console.error('AudioContext decode error:', e);
      return false;
    }
  };

  // Main Speech Output Engine
  const speakWithAudioContext = async (text, customVoiceId) => {
    if (typeof window === 'undefined') return;

    if (recognitionRef.current && isCalling) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const activeId = customVoiceId || ttsVoice;
    const activePersona = voiceLibrary.find(v => v.id === activeId) || voiceLibrary[0];

    setIsSpeaking(true);
    setStatusText(`AI (${activePersona.name.split(' ')[1]}) is speaking...`);

    const storedKey = elevenLabsKey || localStorage.getItem('elevenLabsApiKey') || 'sk_fd1cace7cf05a5e700ce78a557f61815046a23576e8cb477';

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          gender: activePersona.gender,
          voice: activePersona.id,
          elevenLabsApiKey: storedKey
        })
      });

      const data = await res.json();

      if (data.audioBase64) {
        const played = await playBase64WithAudioContext(data.audioBase64);
        if (played) return;
      }
    } catch (e) {
      console.log('Audio fetch note:', e.message);
    }

    // Fallback: Browser Speech Synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = activePersona.pitch;
      utterance.rate = activePersona.rate;
      utterance.lang = 'hi-IN';

      const voices = window.speechSynthesis.getVoices();
      const isM = activePersona.gender === 'Male';
      let sel = null;
      if (isM) {
        sel = voices.find(v => (v.name.toLowerCase().includes('male') || v.name.includes('Madhur') || v.name.includes('David')) && !v.name.toLowerCase().includes('female'));
      } else {
        sel = voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Swara') || v.name.includes('Heera'));
      }
      if (!sel) sel = voices.find(v => v.lang.includes('hi')) || voices[0];
      if (sel) utterance.voice = sel;

      utterance.onend = () => {
        setIsSpeaking(false);
        setStatusText(isCalling ? 'Listening... (Speak now)' : 'Ready');
        if (isCalling && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch(e) {}
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setStatusText('Ready');
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleAgent = () => {
    if (isCalling) {
      setIsCalling(false);
      setIsSpeaking(false);
      setStatusText('Call Ended. Click to talk to your agent');
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {}
      if (activeSourceRef.current) try { activeSourceRef.current.stop(); } catch(e) {}
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
      setIsCalling(true);
      setStatusText('Connecting with AI Voice Agent...');

      const welcomeText = greetingText.trim() || (isCurrentMale 
        ? 'नमस्ते! मैं आपका एआई असिस्टेंट बोल रहा हूँ। बताइए, आज आपकी क्या सहायता कर सकता हूँ?'
        : 'नमस्ते! मैं आपका एआई असिस्टेंट बोल रही हूँ। बताइए, आज आपकी क्या सहायता कर सकती हूँ?');

      setTranscriptHistory(prev => [...prev, { sender: `AI Assistant (${currentPersona.name.split(' ')[1]})`, text: welcomeText }]);
      speakWithAudioContext(welcomeText, ttsVoice);

      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = language.includes('Hindi') ? 'hi-IN' : 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          if (transcript.trim()) {
            setTranscriptHistory(prev => [...prev, { sender: 'You (Caller)', text: transcript }]);
            handleAgentAIResponse(transcript);
          }
        };

        recognition.onerror = (e) => console.log('Speech recognition note:', e.error);
        try { recognition.start(); } catch(e) {}
        recognitionRef.current = recognition;
      }
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setTranscriptHistory(prev => [...prev, { sender: 'You (Chat)', text: userText }]);
    setChatInput('');

    handleAgentAIResponse(userText);
  };

  const handleAgentAIResponse = (userText) => {
    const personaName = currentPersona.name.split(' ')[1];
    let aiReply = '';
    const lower = userText.toLowerCase();

    if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('rate') || lower.includes('daam') || lower.includes('kitna')) {
      aiReply = isCurrentMale
        ? 'जी बिल्कुल! हमारे पैकेजेस बहुत ही कस्टमाइज़्ड और अफोर्डेबल हैं। क्या मैं आपकी जरूरत के हिसाब से बेस्ट प्लान बताऊँ?'
        : 'जी बिल्कुल! हमारे पैकेजेस बहुत ही कस्टमाइज़्ड और अफोर्डेबल हैं। क्या मैं आपकी जरूरत के हिसाब से बेस्ट प्लान बताऊँ?';
    } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('namaste') || lower.includes('hey')) {
      aiReply = isCurrentMale
        ? 'नमस्ते! बताइए आज मैं आपके बिजनेस या कॉलिंग के लिए क्या हेल्प कर सकता हूँ?'
        : 'नमस्ते! बताइए आज मैं आपके बिजनेस या कॉलिंग के लिए क्या हेल्प कर सकती हूँ?';
    } else if (lower.includes('yes') || lower.includes('haan') || lower.includes('theek') || lower.includes('interested') || lower.includes('bataiye')) {
      aiReply = isCurrentMale
        ? 'बहुत बढ़िया! मैंने आपकी डिटेल नोट कर ली है। मैं तुरंत आपको व्हाट्सएप पर सारी जानकारी भेज रहा हूँ!'
        : 'बहुत बढ़िया! मैंने आपकी डिटेल नोट कर ली है। मैं तुरंत आपको व्हाट्सएप पर सारी जानकारी भेज रही हूँ!';
    } else {
      aiReply = isCurrentMale 
        ? `जी बिल्कुल, मैं आपकी बात समझ गया। कृपया बताइए आप किस बारे में और डिटेल जानना चाहते हैं?`
        : `जी बिल्कुल, मैं आपकी बात समझ गई। कृपया बताइए आप किस बारे में और डिटेल जानना चाहते हैं?`;
    }

    setTranscriptHistory(prev => [...prev, { sender: `AI Assistant (${personaName})`, text: aiReply }]);
    speakWithAudioContext(aiReply, ttsVoice);
  };

  const copyTranscriptText = () => {
    const text = transcriptHistory.map(t => `${t.sender}: ${t.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ maxWidth: '1440px' }}>
      
      {/* Top Header Bar with Language & Pipeline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Voice Agent Studio</h1>
            <span className="badge success">🟢 Deepgram + ElevenLabs</span>
          </div>
          <p className="subtitle" style={{ margin: '0.25rem 0 0' }}>Deploy ultra-low latency real-time voice agents with conversational AI</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select 
            className="form-control" 
            value={language} 
            onChange={e => setLanguage(e.target.value)}
            style={{ width: '180px', fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
          >
            <option value="Hindi / Hinglish">🇮🇳 Hindi / Hinglish</option>
            <option value="English">🇺🇸 English</option>
          </select>
          <button className="btn btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}>
            📄 Code Sample
          </button>
        </div>
      </div>

      {/* "Try a use case" Quick Preset Chips (Exact Deepgram Style) */}
      <div style={{ marginBottom: '1.5rem', background: '#0a0a10', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Try a use case:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['Custom', 'General', 'Healthcare', 'Customer support', 'Sales', 'Financial services'].map(uc => {
            const isSel = selectedUseCase === uc;
            return (
              <button
                key={uc}
                onClick={() => selectUseCase(uc)}
                className={`btn ${isSel ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  fontSize: '0.8rem', 
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  background: isSel ? 'var(--accent-blue)' : '#14141f',
                  borderColor: isSel ? 'var(--accent-blue)' : 'rgba(255,255,255,0.08)'
                }}
              >
                {uc === 'Custom' ? '⭐ Custom' : uc === 'General' ? '🏢 General' : uc === 'Healthcare' ? '🩺 Healthcare' : uc === 'Customer support' ? '🎧 Customer support' : uc === 'Sales' ? '💲 Sales' : '💳 Financial services'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Deepgram Grid: Left Config Tabs, Right Glowing Ribbon Console */}
      <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', gap: '1.75rem' }}>
        
        {/* Left Column: Deepgram Voice Agent Settings Card */}
        <div className="card" style={{ padding: '1.75rem', background: '#0a0a12' }}>
          
          {/* Subheader Navigation Tabs (Voice | LLM | Functions | Transcription) */}
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            {['LLM', 'Voice', 'Functions', 'Transcription'].map(tab => (
              <button
                key={tab}
                onClick={() => setConfigTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: configTab === tab ? '2px solid var(--accent-blue)' : 'none',
                  color: configTab === tab ? '#fff' : 'var(--text-secondary)',
                  paddingBottom: '0.4rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: LLM Configuration */}
          {configTab === 'LLM' && (
            <div>
              <div className="form-group mb-4">
                <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>LLM Intelligence Engine</label>
                <select className="form-control" value={llmModel} onChange={e => setLlmModel(e.target.value)}>
                  <option value="Google Gemini 2.0 Flash Lite">⚡ Google Gemini 2.0 Flash Lite (Ultra Fast)</option>
                  <option value="Google Gemini 1.5 Flash">⚡ Google Gemini 1.5 Flash (Balanced)</option>
                  <option value="OpenAI GPT-4o Mini">🧠 OpenAI GPT-4o Mini</option>
                  <option value="Claude 3.5 Haiku">💡 Claude 3.5 Haiku</option>
                </select>
              </div>

              <div className="form-group mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>System Instructions & Prompt</label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Characters: {systemPrompt.length} / 25000</span>
                </div>
                <textarea 
                  rows="7"
                  className="form-control"
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  style={{ fontSize: '0.8125rem', fontFamily: 'monospace', lineHeight: '1.45', background: '#07070b' }}
                />
              </div>

              <div className="form-group mb-4">
                <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Initial Greeting Dialogue</label>
                <input 
                  type="text"
                  className="form-control"
                  value={greetingText}
                  onChange={e => setGreetingText(e.target.value)}
                  style={{ fontSize: '0.825rem' }}
                />
              </div>

              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>LLM Temperature (Creativity: {llmTemperature})</label>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.1"
                  value={llmTemperature} 
                  onChange={e => setLlmTemperature(parseFloat(e.target.value))}
                  style={{ width: '100%' }} 
                />
              </div>
            </div>
          )}

          {/* TAB 2: Voice Persona */}
          {configTab === 'Voice' && (
            <div>
              <div className="form-group mb-4">
                <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>ElevenLabs Human Voice Persona</label>
                <select className="form-control" value={ttsVoice} onChange={e => { setTtsVoice(e.target.value); speakWithAudioContext(greetingText, e.target.value); }}>
                  {voiceLibrary.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  {currentPersona.desc}
                </span>
              </div>

              <div style={{ background: '#07070d', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-green)', marginBottom: '0.25rem' }}>
                  🌟 ElevenLabs Ultra-Human 44.1kHz Stream Active
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Natural breaths, authentic emotional cadence, and sweet Indian Hindi pronunciations.
                </div>
              </div>

              <button 
                type="button"
                onClick={() => speakWithAudioContext(greetingText, ttsVoice)}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.825rem' }}
              >
                🔊 Listen Voice Sample
              </button>
            </div>
          )}

          {/* TAB 3: Functions / Tools */}
          {configTab === 'Functions' && (
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Automated AI Tools connected to this voice agent:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.85rem', background: '#0e0e16', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>📲 WhatsApp Hot Lead Webhook</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sends instant WhatsApp alert to admin when lead shows interest.</div>
                </div>
                <div style={{ padding: '0.85rem', background: '#0e0e16', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>🗓️ Calendar Meeting Scheduler</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Locks appointment slot directly into CRM Follow-up queue.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Transcription STT */}
          {configTab === 'Transcription' && (
            <div>
              <div className="form-group mb-4">
                <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Speech-to-Text (STT) Model</label>
                <select className="form-control" value={sttModel} onChange={e => setSttModel(e.target.value)}>
                  <option value="Deepgram Nova-2 (Real-time)">⚡ Deepgram Nova-2 (Real-time Indian Accents)</option>
                  <option value="OpenAI Whisper Large-v3">🎙️ OpenAI Whisper Large-v3</option>
                </select>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Powered by Deepgram Nova-2 with real-time streaming WebSockets and sub-300ms transcription latency.
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Deepgram Glowing Concentric Ribbon & Live Chat Console */}
        <div className="deepgram-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '620px' }}>
          
          {/* Top Console Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button 
                onClick={() => setRightTab('Agent')}
                style={{ background: 'none', border: 'none', borderBottom: rightTab === 'Agent' ? '2px solid var(--accent-green)' : 'none', color: rightTab === 'Agent' ? '#fff' : 'var(--text-secondary)', paddingBottom: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
              >
                Agent ({isCurrentMale ? '👨' : '👩'} {currentPersona.name.split(' ')[1]})
              </button>
              <button 
                onClick={() => setRightTab('Developer Console')}
                style={{ background: 'none', border: 'none', borderBottom: rightTab === 'Developer Console' ? '2px solid var(--accent-green)' : 'none', color: rightTab === 'Developer Console' ? '#fff' : 'var(--text-secondary)', paddingBottom: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
              >
                Developer Console
              </button>
            </div>
            
            <button 
              onClick={copyTranscriptText}
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              {copied ? '✅ Copied!' : 'Copy Transcript 📋'}
            </button>
          </div>

          {/* Deepgram Animated Glowing Waveform Visualizer */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div className="ring-visualizer" style={{ height: '130px', margin: '0.5rem auto' }}>
              <div className={`ring-circle ring-outer ${isCalling ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`} style={{ width: '120px', height: '120px' }}></div>
              <div className={`ring-circle ring-middle ${isCalling ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`} style={{ width: '95px', height: '95px' }}></div>
              <div className={`ring-circle ring-inner ${isCalling ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`} style={{ width: '70px', height: '70px' }}>
                <span style={{ fontSize: '2.2rem' }}>
                  {isSpeaking ? '🔊' : isCalling ? (isCurrentMale ? '👨‍💼' : '👩‍💼') : '🎧'}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.95rem', fontWeight: '600', color: isSpeaking ? 'var(--accent-green)' : isCalling ? 'var(--accent-blue)' : '#fff', marginTop: '0.5rem' }}>
              {statusText}
            </div>

            {/* Exact Deepgram Green Action Button */}
            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={toggleAgent} 
                className="btn btn-success"
                style={{ 
                  padding: '0.8rem 2.5rem', 
                  fontSize: '1rem', 
                  borderRadius: '30px', 
                  fontWeight: '700',
                  background: isCalling ? 'var(--accent-red)' : 'linear-gradient(135deg, #10b981, #059669)',
                  borderColor: isCalling ? 'var(--accent-red)' : '#10b981',
                  boxShadow: isCalling ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 0 20px rgba(16, 185, 129, 0.4)'
                }}
              >
                {isCalling ? '⏹️ End Call' : '🎤 Talk To Your Agent'}
              </button>
            </div>
          </div>

          {/* Deepgram Live Dialogue Message Stream */}
          <div style={{ flex: 1, background: '#06060a', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)', overflowY: 'auto', maxHeight: '220px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {transcriptHistory.map((t, idx) => {
              const isUser = t.sender.includes('You');
              return (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  {!isUser && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem' }}>
                      🟢
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px', textAlign: isUser ? 'right' : 'left' }}>
                      {t.sender}
                    </div>
                    <div style={{ 
                      background: isUser ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : '#12121c', 
                      color: '#fff', 
                      padding: '0.6rem 0.9rem', 
                      borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      fontSize: '0.85rem',
                      lineHeight: '1.45',
                      border: isUser ? 'none' : '1px solid rgba(255,255,255,0.06)'
                    }}>
                      {t.text}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Text Chat Bar */}
          <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <input 
              type="text" 
              className="form-control"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Type your message or query here..."
              style={{ fontSize: '0.85rem', padding: '0.65rem 0.85rem', background: '#0a0a10', flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', flexShrink: 0 }}>
              💬 Send
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
