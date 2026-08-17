'use client';
import { useEffect, useState, useRef } from 'react';
import { store } from '@/lib/store';

export default function OverviewPage() {
  const [stats, setStats] = useState({ totalCalls: 0, completed: 0, hotLeads: 0, totalMinutes: 0 });
  const [language, setLanguage] = useState('Hindi');
  const [ttsVoice, setTtsVoice] = useState('madhur');
  const [llmModel, setLlmModel] = useState('Google Gemini 2.0 Flash Lite');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  
  // Custom Script Editable by User
  const [customIntroScript, setCustomIntroScript] = useState('नमस्ते! मैं आपका एआई वॉइस असिस्टेंट बोल रहा हूँ। बताइए, आज मैं आपकी क्या सहायता कर सकता हूँ?');
  const [systemPrompt, setSystemPrompt] = useState('You are an intelligent, polite, and helpful AI Sales & Support Voice Assistant. Speak in natural conversational Hindi/English. Answer user queries clearly and help them book appointments or get information.');

  // Audio & Interactive Chat State
  const [isCalling, setIsCalling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Ready: Click to talk or type in live chat');
  const [transcriptHistory, setTranscriptHistory] = useState([
    { sender: 'AI Assistant', text: 'नमस्ते! मैं आपका एआई असिस्टेंट हूँ। आप मुझसे बोलकर (Mic) या चैट (Text) से बात कर सकते हैं।' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState('Agent');

  const recognitionRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const chatEndRef = useRef(null);

  // 7 DISTINCT VOICES
  const voiceLibrary = [
    { id: 'madhur', name: '👨 Madhur (Mid-Tone Indian Male)', gender: 'Male', pitch: 0.64, rate: 0.94, desc: 'Confident corporate sales tone (बोल रहा हूँ)' },
    { id: 'rohan', name: '👨 Rohan (Deep Bass Authoritative Male)', gender: 'Male', pitch: 0.48, rate: 0.86, desc: 'Very deep baritone, formal and serious executive voice' },
    { id: 'aarav', name: '👨 Aarav (Youthful Energetic Indian Male)', gender: 'Male', pitch: 0.78, rate: 1.06, desc: 'Young, lively & fast-paced modern male voice' },
    { id: 'swara', name: '👩 Swara (Sweet Polite Indian Female)', gender: 'Female', pitch: 1.34, rate: 0.94, desc: 'High, sweet & gentle feminine tone (बोल रही हूँ)' },
    { id: 'ananya', name: '👩 Ananya (Fast Professional Female)', gender: 'Female', pitch: 1.15, rate: 1.08, desc: 'Crisp, fast-paced modern Hinglish closer' },
    { id: 'pooja', name: '👩 Pooja (Soft Empathetic Female)', gender: 'Female', pitch: 1.22, rate: 0.88, desc: 'Calm, soothing & slow empathetic healthcare cadence' },
    { id: 'kavya', name: '👩 Kavya (Dynamic Persuasive Female)', gender: 'Female', pitch: 1.28, rate: 1.02, desc: 'Warm, dynamic & expressive sales pitch tone' },
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

    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';
      const key = localStorage.getItem(`elevenLabsApiKey_${uid}`) || localStorage.getItem('elevenLabsApiKey') || '';
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

  const updateVoiceSelection = (newVoiceId) => {
    setTtsVoice(newVoiceId);
    const p = voiceLibrary.find(v => v.id === newVoiceId) || voiceLibrary[0];
    const isMale = p.gender === 'Male';

    let current = customIntroScript;
    if (isMale && current.includes('रही हूँ')) {
      current = current.replace('रही हूँ', 'रहा हूँ').replace('सकती हूँ', 'सकता हूँ');
      setCustomIntroScript(current);
    } else if (!isMale && current.includes('रहा हूँ')) {
      current = current.replace('रहा हूँ', 'रही हूँ').replace('सकता हूँ', 'सकती हूँ');
      setCustomIntroScript(current);
    }

    speakResponse(current, newVoiceId);
  };

  // High-Fidelity Audio Synthesis with ElevenLabs & Browser Hybrid Engine
  const speakResponse = async (text, customVoiceId) => {
    if (typeof window === 'undefined') return;

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    if (recognitionRef.current && isCalling) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const activeId = customVoiceId || ttsVoice;
    const activePersona = voiceLibrary.find(v => v.id === activeId) || voiceLibrary[0];
    const isMale = activePersona.gender === 'Male';

    setIsSpeaking(true);
    setStatusText(`AI (${activePersona.name.split(' ')[1]}) is speaking...`);

    const storedKey = elevenLabsKey || localStorage.getItem('elevenLabsApiKey') || '';

    // If ElevenLabs key exists, stream 100% real human MP3 audio!
    if (storedKey && storedKey.length > 15) {
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

        if (res.ok && res.headers.get('Content-Type')?.includes('audio')) {
          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioPlayerRef.current = audio;

          audio.onended = () => {
            setIsSpeaking(false);
            setStatusText(isCalling ? 'Listening... (Speak now)' : 'Ready');
            if (isCalling && recognitionRef.current) {
              try { recognitionRef.current.start(); } catch(e) {}
            }
          };

          audio.onerror = () => {
            setIsSpeaking(false);
            setStatusText('Ready');
          };

          await audio.play();
          return;
        }
      } catch (e) {
        console.log('ElevenLabs playback note:', e.message);
      }
    }

    // Fallback: Browser Speech Synthesis with pitch/speed modulation
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = activePersona.pitch;
      utterance.rate = activePersona.rate;
      utterance.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';

      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;

      if (isMale) {
        selectedVoice = voices.find(v => (v.name.toLowerCase().includes('male') || v.name.includes('Madhur') || v.name.includes('Ravi') || v.name.includes('David') || v.name.includes('George')) && !v.name.toLowerCase().includes('female'));
      } else {
        selectedVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Swara') || v.name.includes('Heera') || v.name.includes('Kalpana') || v.name.includes('Zira'));
      }

      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN')) || voices[0];
      }

      if (selectedVoice) utterance.voice = selectedVoice;

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
      setStatusText('Call Ended. Click to talk or type in live chat');
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {}
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
      setIsCalling(true);
      setStatusText('Connecting AI Voice Agent...');
      
      const welcomeText = customIntroScript.trim() || (isCurrentMale 
        ? 'नमस्ते! मैं आपका एआई असिस्टेंट बोल रहा हूँ। बताइए, आज आपकी क्या सहायता कर सकता हूँ?'
        : 'नमस्ते! मैं आपका एआई असिस्टेंट बोल रही हूँ। बताइए, आज आपकी क्या सहायता कर सकती हूँ?');

      setTranscriptHistory(prev => [...prev, { sender: `AI (${currentPersona.name.split(' ')[1]})`, text: welcomeText }]);
      speakResponse(welcomeText, ttsVoice);

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
        try { recognition.start(); } catch(e) {}
        recognitionRef.current = recognition;
      }
    }
  };

  // Instant Chat Submit with guaranteed audio playback
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setTranscriptHistory(prev => [...prev, { sender: 'You (Chat)', text: userText }]);
    setChatInput('');

    const personaName = currentPersona.name.split(' ')[1];
    let aiReply = '';
    const lower = userText.toLowerCase();

    if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('rate') || lower.includes('daam') || lower.includes('kitna')) {
      aiReply = isCurrentMale
        ? 'जी बिल्कुल! हमारी सर्विसेज के पैकेजेस बहुत ही कस्टमाइज़्ड और अफोर्डेबल हैं। क्या मैं आपकी रिक्वायरमेंट के हिसाब से बेस्ट ऑफर बताऊँ?'
        : 'जी बिल्कुल! हमारी सर्विसेज के पैकेजेस बहुत ही कस्टमाइज़्ड और अफोर्डेबल हैं। क्या मैं आपकी रिक्वायरमेंट के हिसाब से बेस्ट ऑफर बताऊँ?';
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

    setTranscriptHistory(prev => [...prev, { sender: `AI (${personaName})`, text: aiReply }]);
    speakResponse(aiReply, ttsVoice);
  };

  const handleAgentAIResponse = (userText) => {
    const personaName = currentPersona.name.split(' ')[1];
    let aiReply = '';
    const lower = userText.toLowerCase();

    if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('rate') || lower.includes('daam') || lower.includes('kitna')) {
      aiReply = isCurrentMale
        ? 'जी बिल्कुल! हमारी सर्विसेज के पैकेजेस बहुत ही कस्टमाइज़्ड और अफोर्डेबल हैं। क्या मैं आपकी रिक्वायरमेंट के हिसाब से बेस्ट ऑफर बताऊँ?'
        : 'जी बिल्कुल! हमारी सर्विसेज के पैकेजेस बहुत ही कस्टमाइज़्ड और अफोर्डेबल हैं। क्या मैं आपकी रिक्वायरमेंट के हिसाब से बेस्ट ऑफर बताऊँ?';
    } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('namaste')) {
      aiReply = isCurrentMale
        ? 'नमस्ते! बताइए आज मैं आपके लिए क्या हेल्प कर सकता हूँ?'
        : 'नमस्ते! बताइए आज मैं आपके लिए क्या हेल्प कर सकती हूँ?';
    } else if (lower.includes('yes') || lower.includes('haan') || lower.includes('theek') || lower.includes('interested') || lower.includes('bataiye')) {
      aiReply = isCurrentMale
        ? 'बहुत बढ़िया! मैंने आपकी डिटेल नोट कर ली है। मैं तुरंत आपको व्हाट्सएप पर सारी जानकारी भेज रहा हूँ!'
        : 'बहुत बढ़िया! मैंने आपकी डिटेल नोट कर ली है। मैं तुरंत आपको व्हाट्सएप पर सारी जानकारी भेज रही हूँ!';
    } else {
      aiReply = isCurrentMale 
        ? `जी बिल्कुल, मैं आपकी बात समझ गया। कृपया बताइए आप किस बारे में और डिटेल जानना चाहते हैं?`
        : `जी बिल्कुल, मैं आपकी बात समझ गई। कृपया बताइए आप किस बारे में और डिटेल जानना चाहते हैं?`;
    }

    setTranscriptHistory(prev => [...prev, { sender: `AI (${personaName})`, text: aiReply }]);
    speakResponse(aiReply, ttsVoice);
  };

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>🎙️ AI Voice & Script Studio</h1>
          <p className="subtitle" style={{ margin: 0 }}>Select AI Models, write custom scripts, and test with ElevenLabs Real Human Voice or text chat</p>
        </div>

        <div className="flex items-center gap-4">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Credit: <strong style={{ color: 'var(--accent-green)' }}>$199.49 FREE</strong></span>
          <button className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>📄 Code Sample</button>
        </div>
      </div>

      {/* Main Grid: Left Config, Right Deepgram Glowing Ring & Interactive Chat Console */}
      <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: '2rem' }}>
        
        {/* Left Column: Model & Script Selector */}
        <div className="card" style={{ padding: '1.75rem', background: '#0c0c12' }}>
          <h2 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            ⚙️ Model & Script Configuration
          </h2>

          {/* 1. LLM Model Selector */}
          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>1. Select AI Intelligence Model (LLM)</label>
            <select className="form-control" value={llmModel} onChange={e => setLlmModel(e.target.value)}>
              <option value="Google Gemini 2.0 Flash Lite">⚡ Google Gemini 2.0 Flash Lite (Ultra Fast)</option>
              <option value="Google Gemini 1.5 Flash">⚡ Google Gemini 1.5 Flash (Balanced)</option>
              <option value="OpenAI GPT-4o Mini">🧠 OpenAI GPT-4o Mini</option>
              <option value="Claude 3.5 Haiku">💡 Claude 3.5 Haiku</option>
            </select>
          </div>

          {/* 2. Distinct Voice Persona Selector */}
          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>2. Select Voice Model (7 Distinct Indian Voices)</label>
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

          {/* 3. Editable Custom Introduction Script */}
          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>3. Introduction Script (What AI Speaks First)</label>
            <textarea 
              rows="3"
              className="form-control"
              value={customIntroScript}
              onChange={e => setCustomIntroScript(e.target.value)}
              placeholder="Type your introduction script here..."
              style={{ fontSize: '0.85rem', lineHeight: '1.4' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
              Call start hote hi AI sabse pehle yahi sentence bolegi.
            </span>
          </div>

          {/* 4. Editable System Instructions / Prompt */}
          <div className="form-group mb-6">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>4. AI Business Instructions (System Prompt)</label>
            <textarea 
              rows="3"
              className="form-control"
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              placeholder="Describe how the AI should behave and what it should answer..."
              style={{ fontSize: '0.82rem', lineHeight: '1.4' }}
            />
          </div>

          <div style={{ 
            background: elevenLabsKey ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: elevenLabsKey ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)', 
            fontSize: '0.8125rem', 
            color: elevenLabsKey ? 'var(--accent-green)' : 'var(--accent-blue)' 
          }}>
            {elevenLabsKey ? '🌟 ElevenLabs Ultra-Human Real Studio Voice Active!' : '⚡ Standard Neural Voice Active (Connect ElevenLabs API in Settings for 100% Real Human Voice)'}
          </div>
        </div>

        {/* Right Column: Deepgram Glowing Ring & Interactive Chat Box */}
        <div className="deepgram-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '620px' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button 
                onClick={() => setActiveTab('Agent')}
                style={{ background: 'none', border: 'none', borderBottom: activeTab === 'Agent' ? '2px solid var(--accent-green)' : 'none', color: activeTab === 'Agent' ? '#fff' : 'var(--text-secondary)', paddingBottom: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
              >
                🎙️ Voice Test ({isCurrentMale ? '👨' : '👩'} {currentPersona.name.split(' ')[1]})
              </button>
              <button 
                onClick={() => setActiveTab('Chat')}
                style={{ background: 'none', border: 'none', borderBottom: activeTab === 'Chat' ? '2px solid var(--accent-green)' : 'none', color: activeTab === 'Chat' ? '#fff' : 'var(--text-secondary)', paddingBottom: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
              >
                💬 Chat Test
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: isSpeaking ? 'var(--accent-green)' : 'var(--text-muted)' }}>
              {isSpeaking ? '🔊 Audio Playing...' : '🟢 Ready'}
            </span>
          </div>

          {/* Voice Ring Section */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="ring-visualizer" style={{ height: '110px', margin: '0.5rem auto' }}>
              <div className={`ring-circle ring-outer ${isCalling ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`} style={{ width: '100px', height: '100px' }}></div>
              <div className={`ring-circle ring-middle ${isCalling ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`} style={{ width: '80px', height: '80px' }}></div>
              <div className={`ring-circle ring-inner ${isCalling ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`} style={{ width: '60px', height: '60px' }}>
                <span style={{ fontSize: '1.8rem' }}>
                  {isSpeaking ? '🔊' : isCalling ? (isCurrentMale ? '👨‍💼' : '👩‍💼') : '🎧'}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.95rem', fontWeight: '600', color: isSpeaking ? 'var(--accent-green)' : isCalling ? 'var(--accent-blue)' : '#fff', marginTop: '0.5rem' }}>
              {statusText}
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <button 
                onClick={toggleAgent} 
                className={`talk-agent-btn ${isCalling ? 'listening' : ''}`}
                style={{ padding: '0.6rem 1.8rem', fontSize: '0.95rem' }}
              >
                {isCalling ? '⏹️ End Voice Test' : `🎙️ Test By Speaking (Mic)`}
              </button>
            </div>
          </div>

          {/* Interactive Chat Messages Log */}
          <div style={{ flex: 1, background: '#08080d', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)', overflowY: 'auto', maxHeight: '240px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {transcriptHistory.map((t, idx) => {
              const isUser = t.sender.includes('You');
              return (
                <div key={idx} style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px', textAlign: isUser ? 'right' : 'left' }}>
                    {t.sender}
                  </div>
                  <div style={{ 
                    background: isUser ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : '#161622', 
                    color: '#fff', 
                    padding: '0.55rem 0.85rem', 
                    borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    fontSize: '0.825rem',
                    lineHeight: '1.4',
                    border: isUser ? 'none' : '1px solid rgba(255,255,255,0.06)'
                  }}>
                    {t.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Text Chat Input Bar */}
          <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <input 
              type="text" 
              className="form-control"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Type to test by chat (e.g. hi, price kya hai?)..."
              style={{ fontSize: '0.85rem', padding: '0.6rem 0.85rem', background: '#0a0a10', flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', flexShrink: 0 }}>
              💬 Send & Speak
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
