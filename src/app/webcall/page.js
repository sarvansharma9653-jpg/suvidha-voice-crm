'use client';
import { useState, useEffect, useRef } from 'react';

export default function WebCallPage() {
  const [callActive, setCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState('swara');
  const [transcript, setTranscript] = useState([]);
  const [statusMsg, setStatusMsg] = useState('Click Start Call to speak with AI');

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const agents = {
    swara: { name: 'Swara', gender: 'Female', title: 'Real Estate Sales Specialist', greeting: 'नमस्ते! मैं स्वरा बोल रही हूँ। सुविधा में आपका स्वागत है। बताइए मैं आपकी क्या सहायता कर सकती हूँ?' },
    madhur: { name: 'Madhur', gender: 'Male', title: 'Financial & Loan Advisor', greeting: 'नमस्ते! मैं मधुर बोल रहा हूँ। सुविधा में आपका स्वागत है। बताइए मैं आपकी क्या मदद कर सकता हूँ?' },
    ananya: { name: 'Ananya', gender: 'Female', title: 'Customer Support Lead', greeting: 'नमस्ते! मैं अनन्या बोल रही हूँ। सुविधा कस्टमर केयर में आपका स्वागत है।' },
    rohan: { name: 'Rohan', gender: 'Male', title: 'Corporate Consultant', greeting: 'नमस्ते! मैं रोहन बोल रहा हूँ। सुविधा कंसल्टेंसी में आपका स्वागत है।' }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const currentAgent = agents[selectedAgent] || agents.swara;

  const playAgentVoice = async (text, gender) => {
    try {
      setIsSpeaking(true);
      setStatusMsg(`${currentAgent.name} is speaking...`);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, gender, voice: selectedAgent })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        if (gender === 'Male') {
          audio.playbackRate = 0.92;
        } else {
          audio.playbackRate = 1.0;
        }

        audio.onended = () => {
          setIsSpeaking(false);
          setStatusMsg('Listening to you... (Speak now)');
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          setStatusMsg('Listening...');
        };

        await audio.play();
      }
    } catch (e) {
      console.log('Audio error:', e);
      setIsSpeaking(false);
    }
  };

  const startWebCall = () => {
    setCallActive(true);
    setCallDuration(0);
    setStatusMsg(`Connecting to ${currentAgent.name}...`);
    
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    setTranscript([{ sender: currentAgent.name, text: currentAgent.greeting }]);
    playAgentVoice(currentAgent.greeting, currentAgent.gender);

    // Browser Speech Recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'hi-IN';

      rec.onresult = (e) => {
        const userSpeech = e.results[e.results.length - 1][0].transcript;
        if (userSpeech.trim()) {
          setTranscript(prev => [...prev, { sender: 'You', text: userSpeech }]);
          handleAIConversation(userSpeech);
        }
      };

      rec.onerror = (err) => console.log('Mic note:', err.error);
      rec.start();
      recognitionRef.current = rec;
    }
  };

  const endWebCall = () => {
    setCallActive(false);
    setIsSpeaking(false);
    setStatusMsg('Call Ended. Thank you for speaking with Suvidha AI.');
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (audioRef.current) audioRef.current.pause();
  };

  const handleAIConversation = (userSpeech) => {
    let reply = '';
    const lower = userSpeech.toLowerCase();

    if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('daam')) {
      reply = 'हमारे सेक्टर 62 नोएडा फ्लैट्स 1.2 करोड़ से शुरू होते हैं। क्या मैं आपके लिए साइट विज़िट बुक कर दूँ?';
    } else if (lower.includes('loan') || lower.includes('finance') || lower.includes('interest')) {
      reply = 'हम 5 लाख तक का प्री-अप्रूव्ड पर्सनल लोन सिर्फ 9.5% ब्याज दर पर ऑफर कर रहे हैं।';
    } else if (lower.includes('yes') || lower.includes('haan') || lower.includes('theek') || lower.includes('interested')) {
      reply = currentAgent.gender === 'Male'
        ? 'बहुत बढ़िया! मैंने आपकी विज़िट कन्फर्म कर दी है। मैं आपको व्हाट्सएप पर डिटेल भेज रहा हूँ।'
        : 'बहुत बढ़िया! मैंने आपकी विज़िट कन्फर्म कर दी है। मैं आपको व्हाट्सएप पर डिटेल भेज रही हूँ।';
    } else {
      reply = currentAgent.gender === 'Male'
        ? 'जी बिल्कुल, मैं आपकी बात समझ रहा हूँ। कृपया बताइए मैं आपकी क्या सहायता कर सकता हूँ?'
        : 'जी बिल्कुल, मैं आपकी बात समझ रही हूँ। कृपया बताइए मैं आपकी क्या सहायता कर सकती हूँ?';
    }

    setTimeout(() => {
      setTranscript(prev => [...prev, { sender: currentAgent.name, text: reply }]);
      playAgentVoice(reply, currentAgent.gender);
    }, 400);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '2rem 1rem' }}>
      
      {/* Header */}
      <div className="mb-8">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1rem' }}>
          <span className="pulse-dot"></span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: '600' }}>OmniDimension WebRTC In-Browser Voice Calling (Zero Telephony Needed)</span>
        </div>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>🌐 Instant AI Web Call</h1>
        <p className="subtitle">Call and talk to Suvidha AI directly through your browser or mobile phone with 0 telephony cost</p>
      </div>

      {/* Main Calling Box */}
      <div className="card" style={{ padding: '3rem 2rem', background: '#0e0e14', position: 'relative' }}>
        
        {/* Agent Selector when not on call */}
        {!callActive && (
          <div className="mb-6" style={{ maxWidth: '400px', margin: '0 auto 2rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Select AI Agent to Call</label>
            <select className="form-control" value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}>
              <option value="swara">👩 Swara — Real Estate Sales (Female Hindi)</option>
              <option value="madhur">👨 Madhur — Loans & Financial Advisor (Male Hindi)</option>
              <option value="ananya">👩 Ananya — Customer Support (Female Hinglish)</option>
              <option value="rohan">👨 Rohan — Corporate Advisory (Male Hindi)</option>
            </select>
          </div>
        )}

        {/* Live Call Pulsing Visualizer */}
        <div style={{ margin: '2rem 0' }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            background: callActive ? 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))' : 'rgba(255,255,255,0.05)', 
            margin: '0 auto', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '3rem',
            boxShadow: callActive ? '0 0 40px rgba(16, 185, 129, 0.4)' : 'none',
            animation: callActive ? 'pulse 1.8s infinite' : 'none',
            transition: 'all 0.3s ease'
          }}>
            {isSpeaking ? '🔊' : callActive ? (currentAgent.gender === 'Male' ? '👨‍💼' : '👩‍💼') : '📞'}
          </div>

          <h2 style={{ fontSize: '1.4rem', marginTop: '1.5rem', marginBottom: '0.25rem' }}>{currentAgent.name}</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentAgent.title}</span>

          {callActive && (
            <div style={{ marginTop: '0.75rem', fontSize: '1.1rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>
              ⏱️ {formatTime(callDuration)}
            </div>
          )}
        </div>

        <p style={{ color: isSpeaking ? 'var(--accent-green)' : callActive ? 'var(--accent-blue)' : 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          {statusMsg}
        </p>

        {/* Action Button */}
        <div>
          {!callActive ? (
            <button onClick={startWebCall} className="btn btn-success" style={{ padding: '0.85rem 2.5rem', fontSize: '1.1rem', borderRadius: '30px', fontWeight: 'bold' }}>
              📞 Start Live Web Call
            </button>
          ) : (
            <button onClick={endWebCall} className="btn btn-danger" style={{ padding: '0.85rem 2.5rem', fontSize: '1.1rem', borderRadius: '30px', fontWeight: 'bold' }}>
              🔴 End Call
            </button>
          )}
        </div>

        {/* Live Conversation Transcript */}
        {transcript.length > 0 && (
          <div style={{ marginTop: '2.5rem', background: '#08080c', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'left', maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              💬 LIVE WEBCALL TRANSCRIPT:
            </div>
            {transcript.map((t, idx) => (
              <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '0.4rem', color: t.sender === 'You' ? 'var(--accent-blue)' : 'var(--accent-green)' }}>
                <strong>{t.sender}:</strong> {t.text}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
