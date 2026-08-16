'use client';
import { useEffect, useState, useRef } from 'react';
import { store } from '@/lib/store';

export default function OverviewPage() {
  const [stats, setStats] = useState({ totalCalls: 0, completed: 0, hotLeads: 0, totalMinutes: 0 });
  const [language, setLanguage] = useState('Hindi');
  const [useCase, setUseCase] = useState('Design Suvidha Marketing');
  const [ttsVoice, setTtsVoice] = useState('madhur');
  const [llmModel, setLlmModel] = useState('Google Gemini 2.0 Flash Lite');
  
  // Custom Introduction Script for Design Suvidha
  const [customIntroScript, setCustomIntroScript] = useState('नमस्ते सर! मैं Design Suvidha से बात कर रहा हूँ। हम आपके बिजनेस की ऑनलाइन ग्रोथ के लिए Meta Ads, SEO, वेबसाइट डेवलपमेंट और सोशल मीडिया मार्केटिंग सर्विसेज प्रोवाइड करते हैं। क्या आप अपने बिजनेस की सेल्स और विजिबिलिटी बढ़ाना चाहते हैं?');

  // Audio Ring & Speech State
  const [isCalling, setIsCalling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Click to talk or type in live chat');
  const [transcriptHistory, setTranscriptHistory] = useState([
    { sender: 'Design Suvidha AI', text: 'नमस्ते! मैं Design Suvidha का एआई असिस्टेंट हूँ। आप मुझसे बोलकर या टाइप करके चैट कर सकते हैं।' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState('Agent');

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const voiceLibrary = [
    { id: 'madhur', name: '👨 Madhur (Senior Growth Consultant)', gender: 'Male', pitch: 0.68, rate: 0.94, desc: 'Deep, confident corporate masculine consultant (बोल रहा हूँ)' },
    { id: 'rohan', name: '👨 Rohan (Executive Business Development Lead)', gender: 'Male', pitch: 0.60, rate: 0.90, desc: 'Deep, authoritative tone for B2B Digital Marketing' },
    { id: 'aarav', name: '👨 Aarav (Dynamic Tech & Ads Specialist)', gender: 'Male', pitch: 0.72, rate: 1.0, desc: 'Young & energetic masculine tone for Startups & E-commerce' },
    { id: 'swara', name: '👩 Swara (Creative Strategy Lead)', gender: 'Female', pitch: 1.25, rate: 0.96, desc: 'Sweet, polite & persuasive female marketing expert (बोल रही हूँ)' },
    { id: 'ananya', name: '👩 Ananya (Client Growth Manager)', gender: 'Female', pitch: 1.2, rate: 1.0, desc: 'Clear, modern & energetic Hinglish sales voice' },
    { id: 'pooja', name: '👩 Pooja (Brand Success Advisor)', gender: 'Female', pitch: 1.28, rate: 0.92, desc: 'Soft & caring human cadence for Small Businesses' },
    { id: 'kavya', name: '👩 Kavya (Social Media & Video Specialist)', gender: 'Female', pitch: 1.22, rate: 1.02, desc: 'High conversion human conversational tone' },
  ];

  const scriptTemplates = [
    { label: '🎨 Design Suvidha (Growth Pitch)', text: 'नमस्ते सर! मैं Design Suvidha से बात कर रहा हूँ। हम आपके बिजनेस की ऑनलाइन ग्रोथ के लिए Meta Ads, SEO, वेबसाइट डेवलपमेंट और सोशल मीडिया मार्केटिंग सर्विसेज प्रोवाइड करते हैं। क्या आप अपने बिजनेस की सेल्स और विजिबिलिटी बढ़ाना चाहते हैं?' },
    { label: '📈 Meta & Google Ads', text: 'नमस्ते सर! मैं Design Suvidha से बोल रहा हूँ। क्या आप अपने बिजनेस के लिए हाई-कन्वर्टिंग Facebook और Google Ads से डेली 20-30 क्वालिफाइड लीड्स चाहते हैं?' },
    { label: '🌐 Website & Landing Page', text: 'नमस्ते सर! Design Suvidha से बात कर रहा हूँ। क्या आप अपने बिजनेस के लिए फास्ट, मॉडर्न वेबसाइट या हाई-कन्वर्टिंग लैंडिंग पेज बनवाना चाहते हैं?' },
    { label: '📍 SEO & Google Profile', text: 'नमस्ते सर! मैं Design Suvidha से बात कर रहा हूँ। हम Google Business Profile ऑप्टिमाइज़ करते हैं ताकि आपके एरिया में कस्टमर्स आपको सबसे पहले ढूंढ सकें।' }
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

  // Smooth, Stutter-Free Speech Engine
  const speakResponse = (text, customVoiceId) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Temporarily pause mic to prevent audio loop feedback/stuttering
    if (recognitionRef.current && isCalling) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

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
      selectedVoice = voices.find(v => (v.name.toLowerCase().includes('male') || v.name.includes('Madhur') || v.name.includes('Ravi') || v.name.includes('David') || v.name.includes('George')) && !v.name.toLowerCase().includes('female'));
    } else {
      selectedVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Swara') || v.name.includes('Heera') || v.name.includes('Kalpana') || v.name.includes('Zira'));
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN')) || voices[0];
    }

    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusText(`Design Suvidha AI (${activePersona.name.split(' ')[1]}) is speaking...`);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusText(isCalling ? 'Listening to your voice... (Speak now)' : 'Ready for conversation');
      
      // Resume mic cleanly after speaking finishes
      if (isCalling && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e) {}
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatusText('Ready for conversation');
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleAgent = () => {
    if (isCalling) {
      setIsCalling(false);
      setIsSpeaking(false);
      setStatusText('Call Ended. Click to talk or type in live chat');
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {}
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
      setIsCalling(true);
      setStatusText('Connecting with Design Suvidha AI...');
      
      const welcomeText = customIntroScript.trim() || (isCurrentMale 
        ? 'नमस्ते सर! मैं Design Suvidha से बात कर रहा हूँ। हम आपके बिजनेस की ऑनलाइन ग्रोथ के लिए Meta Ads, SEO, और वेबसाइट डेवलपमेंट प्रोवाइड करते हैं। बताइए, आज आपकी क्या सहायता कर सकता हूँ?'
        : 'नमस्ते सर! मैं Design Suvidha से बात कर रही हूँ। हम आपके बिजनेस की ऑनलाइन ग्रोथ के लिए Meta Ads, SEO, और वेबसाइट डेवलपमेंट प्रोवाइड करते हैं। बताइए, आज आपकी क्या सहायता कर सकती हूँ?');

      setTranscriptHistory(prev => [...prev, { sender: `Design Suvidha AI (${currentPersona.name.split(' ')[1]})`, text: welcomeText }]);
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

  // Text Chat Submit Handler
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setTranscriptHistory(prev => [...prev, { sender: 'You (Chat)', text: userText }]);
    setChatInput('');
    handleAgentAIResponse(userText);
  };

  // Design Suvidha Intelligent Knowledge Engine
  const handleAgentAIResponse = (userText) => {
    const personaName = currentPersona.name.split(' ')[1];
    let aiReply = '';
    const lower = userText.toLowerCase();

    if (lower.includes('meta') || lower.includes('facebook') || lower.includes('insta') || lower.includes('ads') || lower.includes('ad')) {
      aiReply = 'जी बिल्कुल! Design Suvidha आपके बिजनेस के लिए हाई-कन्वर्टिंग Meta और Instagram Ads रन करता है, जिससे आपको डेली क्वालिफाइड कस्टमर लीड्स मिलती हैं। क्या आप अपने बिजनेस के लिए फ्री ऑडिट चाहते हैं?';
    } else if (lower.includes('website') || lower.includes('landing page') || lower.includes('web') || lower.includes('site')) {
      aiReply = 'Design Suvidha अल्ट्रा-फास्ट, मॉडर्न और मोबाइल-फ्रेंडली वेबसाइट्स और लैंडिंग पेज बनाता है जो विजिटर्स को डायरेक्ट कस्टमर्स में कन्वर्ट करते हैं।';
    } else if (lower.includes('seo') || lower.includes('google') || lower.includes('ranking') || lower.includes('gmb')) {
      aiReply = 'हम Google Business Profile और लोकल SEO ऑप्टिमाइजेशन करते हैं ताकि आपके एरिया में जब भी कोई आपकी सर्विस सर्च करे, आपकी कंपनी टॉप पर रैंक करे।';
    } else if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('rate') || lower.includes('charge') || lower.includes('charges')) {
      aiReply = isCurrentMale
        ? 'हमारे डिजिटल मार्केटिंग और क्रिएटिव पैकेजेस बहुत ही अफोर्डेबल हैं और बिजनेस के कस्टमाइज्ड गोल पर डिपेंड करते हैं। क्या मैं आपके साथ 10 मिनट का फ्री कंसल्टेशन कॉल बुक कर दूँ?'
        : 'हमारे डिजिटल मार्केटिंग और क्रिएटिव पैकेजेस बहुत ही अफोर्डेबल हैं और बिजनेस के कस्टमाइज्ड गोल पर डिपेंड करते हैं। क्या मैं आपके साथ 10 मिनट का फ्री कंसल्टेशन कॉल बुक कर दूँ?';
    } else if (lower.includes('yes') || lower.includes('haan') || lower.includes('theek') || lower.includes('interested') || lower.includes('book')) {
      aiReply = isCurrentMale
        ? 'बहुत बढ़िया सर! मैंने Design Suvidha के सीनियर डिजिटल स्ट्रैटेजिस्ट के साथ आपका फ्री कंसल्टेशन शेड्यूल कर दिया है। मैं तुरंत आपको व्हाट्सएप पर हमारी कंपनी प्रोफाइल और केस स्टडीज भेज रहा हूँ!'
        : 'बहुत बढ़िया सर! मैंने Design Suvidha के सीनियर डिजिटल स्ट्रैटेजिस्ट के साथ आपका फ्री कंसल्टेशन शेड्यूल कर दिया है। मैं तुरंत आपको व्हाट्सएप पर हमारी कंपनी प्रोफाइल और केस स्टडीज भेज रही हूँ!';
    } else {
      aiReply = isCurrentMale 
        ? `जी बिल्कुल, मैं आपकी बात समझ रहा हूँ। Design Suvidha सोशल मीडिया मार्केटिंग, SEO, वेबसाइट्स, और वीडियो कंटेंट से बिजनेस ग्रो करने में हेल्प करता है। बताइए, आप अपने बिजनेस में कौन सी सर्विस एक्सप्लोर करना चाहते हैं?`
        : `जी बिल्कुल, मैं आपकी बात समझ रही हूँ। Design Suvidha सोशल मीडिया मार्केटिंग, SEO, वेबसाइट्स, और वीडियो कंटेंट से बिजनेस ग्रो करने में हेल्प करता है। बताइए, आप अपने बिजनेस में कौन सी सर्विस एक्सप्लोर करना चाहते हैं?`;
    }

    setTimeout(() => {
      setTranscriptHistory(prev => [...prev, { sender: `Design Suvidha AI (${personaName})`, text: aiReply }]);
      speakResponse(aiReply, ttsVoice);
    }, 200);
  };

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>🎨 Design Suvidha Voice & Chat AI Studio</h1>
          <p className="subtitle" style={{ margin: 0 }}>Interactive Voice Calling & Real-Time Chat Assistant for Digital Marketing Services</p>
        </div>

        <div className="flex items-center gap-4">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Credit: <strong style={{ color: 'var(--accent-green)' }}>$199.49 FREE</strong></span>
          <button className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>📄 Code Sample</button>
        </div>
      </div>

      {/* Main Grid: Left Config, Right Deepgram Glowing Ring & Interactive Chat Console */}
      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: '2rem' }}>
        
        {/* Left Column: Voice Persona & Custom Script */}
        <div className="card" style={{ padding: '1.75rem', background: '#0c0c12' }}>
          <h2 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            ⚙️ Design Suvidha Voice & Pitch Config
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
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>📝 Design Suvidha Introduction Script (Live)</label>
            <textarea 
              rows="3"
              className="form-control"
              value={customIntroScript}
              onChange={e => setCustomIntroScript(e.target.value)}
              placeholder="Type custom introduction script..."
              style={{ fontSize: '0.85rem', lineHeight: '1.4' }}
            />
            
            {/* Quick 1-Click Script Preset Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
              {scriptTemplates.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    let text = t.text;
                    if (!isCurrentMale) {
                      text = text.replace('रहा हूँ', 'रही हूँ').replace('सकता हूँ', 'सकती हूँ');
                    }
                    setCustomIntroScript(text);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#181824' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group mb-4">
            <label style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Business Core Services</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {['Design Suvidha Marketing', 'Meta & Insta Ads', 'SEO & GMB', 'Websites & Videos'].map(uc => (
                <button 
                  key={uc}
                  type="button"
                  onClick={() => setUseCase(uc)}
                  className={`btn ${useCase === uc ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.72rem', padding: '0.4rem 0.5rem', textAlign: 'center' }}
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
            {isCurrentMale ? '👨' : '👩'} <strong>Design Suvidha AI Active!</strong> Stutter-free audio engine with simultaneous live voice calling and text chat.
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
                🎙️ Voice Console ({isCurrentMale ? '👨' : '👩'} {currentPersona.name.split(' ')[1]})
              </button>
              <button 
                onClick={() => setActiveTab('Chat')}
                style={{ background: 'none', border: 'none', borderBottom: activeTab === 'Chat' ? '2px solid var(--accent-green)' : 'none', color: activeTab === 'Chat' ? '#fff' : 'var(--text-secondary)', paddingBottom: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
              >
                💬 Live Chat Room
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: isSpeaking ? 'var(--accent-green)' : 'var(--text-muted)' }}>
              {isSpeaking ? '🔊 Audio Streaming...' : '🟢 Ready'}
            </span>
          </div>

          {/* Voice Ring Section */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="ring-visualizer" style={{ height: '110px', margin: '0.5rem auto' }}>
              <div className={`ring-circle ring-outer ${isCalling ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`} style={{ width: '100px', height: '100px' }}></div>
              <div className={`ring-circle ring-middle ${isCalling ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`} style={{ width: '80px', height: '80px' }}></div>
              <div className={`ring-circle ring-inner ${isCalling ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`} style={{ width: '60px', height: '60px' }}>
                <span style={{ fontSize: '1.8rem' }}>
                  {isSpeaking ? '🔊' : isCalling ? (isCurrentMale ? '👨‍💼' : '👩‍💼') : '🎨'}
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
                {isCalling ? '⏹️ End Voice Conversation' : `🎙️ Start Voice Call With AI`}
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
              placeholder="Type your question or message here (e.g. Website price kya hai?)..."
              style={{ fontSize: '0.85rem', padding: '0.6rem 0.85rem', background: '#0a0a10', flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', flexShrink: 0 }}>
              💬 Send
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
