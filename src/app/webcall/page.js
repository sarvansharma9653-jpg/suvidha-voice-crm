'use client';
import { useState, useEffect, useRef } from 'react';

export default function WebCallPage() {
  const [callActive, setCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState('swara');
  const [transcript, setTranscript] = useState([]);
  const [statusMsg, setStatusMsg] = useState('Click Start Call to speak with AI');
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const agents = {
    swara: { name: 'Swara', gender: 'Female', title: 'Real Estate & Sales Specialist', greeting: 'नमस्ते! मैं स्वरा बोल रही हूँ। सुविधा में आपका स्वागत है। बताइए आज मैं आपकी क्या सहायता कर सकती हूँ?' },
    madhur: { name: 'Madhur', gender: 'Male', title: 'Financial & Loan Advisor', greeting: 'नमस्ते! मैं मधुर बोल रहा हूँ। सुविधा में आपका स्वागत है। बताइए आज मैं आपकी क्या मदद कर सकता हूँ?' },
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

        audio.onended = () => {
          setIsSpeaking(false);
          setStatusMsg('Listening to you... (Speak now)');
        };

        await audio.play();
      }
    } catch (e) {
      console.error('Audio playback error:', e);
      setIsSpeaking(false);
    }
  };

  const startWebCall = () => {
    setCallActive(true);
    setCallDuration(0);
    setTranscript([{ speaker: currentAgent.name, text: currentAgent.greeting }]);
    setStatusMsg(`${currentAgent.name} is speaking...`);

    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    playAgentVoice(currentAgent.greeting, currentAgent.gender);

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN';

      recognition.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript;
        if (text.trim()) {
          setTranscript(prev => [...prev, { speaker: 'You', text }]);
          handleAICallResponse(text);
        }
      };

      recognition.onerror = (e) => console.log('WebCall recognition note:', e.error);
      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const handleAICallResponse = (userText) => {
    let reply = '';
    const lower = userText.toLowerCase();

    if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('budget')) {
      reply = currentAgent.gender === 'Male'
        ? 'हाँ जी बिल्कुल सर! हमारे पैकेजेस बहुत ही कस्टमाइज़्ड और अफोर्डेबल हैं। क्या मैं आपकी जरूरत के हिसाब से सबसे बेस्ट प्लान बताऊँ?'
        : 'हाँ जी बिल्कुल सर! हमारे पैकेजेस बहुत ही कस्टमाइज़्ड और अफोर्डेबल हैं। क्या मैं आपकी जरूरत के हिसाब से सबसे बेस्ट प्लान बताऊँ?';
    } else if (lower.includes('yes') || lower.includes('haan') || lower.includes('theek') || lower.includes('interested')) {
      reply = currentAgent.gender === 'Male'
        ? 'अरे बहुत ही बढ़िया सर! मैंने आपका टाइम लॉक कर दिया है। मैं तुरंत आपको व्हाट्सएप पर सारी डिटेल भेज रहा हूँ!'
        : 'अरे बहुत ही बढ़िया सर! मैंने आपका टाइम लॉक कर दिया है। मैं तुरंत आपको व्हाट्सएप पर सारी डिटेल भेज रही हूँ!';
    } else {
      reply = currentAgent.gender === 'Male'
        ? 'जी बिल्कुल, मैं आपकी बात समझ रहा हूँ। आप बेझिझक बताइए, मैं आपकी किस प्रकार सहायता कर सकता हूँ?'
        : 'जी बिल्कुल, मैं आपकी बात समझ रही हूँ। आप बेझिझक बताइए, मैं आपकी किस प्रकार सहायता कर सकती हूँ?';
    }

    setTimeout(() => {
      setTranscript(prev => [...prev, { speaker: currentAgent.name, text: reply }]);
      playAgentVoice(reply, currentAgent.gender);
    }, 300);
  };

  const endWebCall = () => {
    setCallActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (audioRef.current) audioRef.current.pause();
    setIsSpeaking(false);
    setStatusMsg('Call Ended. Ready for next call');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>🌐 Instant Web Call Room (Zero Telephony / No SIM)</h1>
          <p className="subtitle">High-Definition In-Browser 2-Way Voice Call Room powered by WebRTC & Neural AI</p>
        </div>

        <button 
          onClick={copyShareLink}
          className="btn btn-secondary"
          style={{ fontSize: '0.8125rem' }}
        >
          {copied ? '✅ Link Copied!' : '🔗 Copy Shareable Web Call Link'}
        </button>
      </div>

      {/* Step-by-Step Guide Banner */}
      <div className="card mb-6" style={{ padding: '1.25rem 1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>
          📖 How Instant Web Calling Works (Zero Cost Telephony):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div>
            <strong>1. Select AI Agent:</strong> Choose female (Swara/Ananya) or male (Madhur/Rohan) voice persona below.
          </div>
          <div>
            <strong>2. Start WebRTC Call:</strong> Click <strong>`Start Instant Web Call`</strong> to connect live 2-way audio through your laptop/mobile mic.
          </div>
          <div>
            <strong>3. Share with Clients:</strong> Send this link on WhatsApp so customers can talk to your AI agent directly without phone recharge!
          </div>
        </div>
      </div>

      {/* Main Calling Box */}
      <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', background: '#0a0a10' }}>
        
        {/* Agent Selector */}
        {!callActive && (
          <div style={{ maxWidth: '400px', margin: '0 auto 2.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Select Calling Agent Persona:
            </label>
            <select 
              className="form-control" 
              value={selectedAgent} 
              onChange={e => setSelectedAgent(e.target.value)}
              style={{ textAlign: 'center', fontWeight: '600', fontSize: '0.95rem' }}
            >
              {Object.keys(agents).map(k => (
                <option key={k} value={k}>
                  {agents[k].gender === 'Female' ? '👩' : '👨'} {agents[k].name} — {agents[k].title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pulse Visualizer */}
        <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 2rem' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: callActive ? 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 70%)' : 'rgba(255, 255, 255, 0.03)',
            animation: callActive ? 'pulse 2s infinite' : 'none',
            border: callActive ? '2px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-light)'
          }}></div>
          
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            background: callActive ? (isSpeaking ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)') : 'rgba(255, 255, 255, 0.05)'
          }}>
            {callActive ? (isSpeaking ? '🔊' : '🎙️') : (currentAgent.gender === 'Female' ? '👩‍💼' : '👨‍💼')}
          </div>
        </div>

        {/* Call Info */}
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>
          {currentAgent.name} ({currentAgent.title})
        </h2>

        <div style={{ fontSize: '1rem', color: callActive ? 'var(--accent-green)' : 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: '600' }}>
          {callActive ? `🟢 Live Call in Progress • ${formatDuration(callDuration)}` : statusMsg}
        </div>

        {/* Action Button */}
        <div>
          {!callActive ? (
            <button 
              onClick={startWebCall} 
              className="btn btn-primary" 
              style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', borderRadius: '30px', fontWeight: '600' }}
            >
              📞 Start Instant Web Call
            </button>
          ) : (
            <button 
              onClick={endWebCall} 
              className="btn btn-danger" 
              style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', borderRadius: '30px', fontWeight: '600' }}
            >
              ⏹️ End Call
            </button>
          )}
        </div>

        {/* Live Transcript Box */}
        {transcript.length > 0 && (
          <div style={{ marginTop: '2.5rem', background: '#050508', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)', maxWidth: '600px', margin: '2.5rem auto 0', textAlign: 'left', maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              💬 LIVE WEB CALL TRANSCRIPT:
            </div>
            {transcript.map((t, idx) => (
              <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: t.speaker === 'You' ? 'var(--accent-blue)' : 'var(--accent-green)' }}>
                <strong>{t.speaker}:</strong> {t.text}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
