'use client';
import { useState, useEffect, useRef } from 'react';
import { store } from '@/lib/store';

export default function WebCallPage() {
  const [callActive, setCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedAgentId, setSelectedAgentId] = useState('ag_pooja');
  const [agentsList, setAgentsList] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [statusMsg, setStatusMsg] = useState('Click Start Call to speak with AI');
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const list = store.getAgents();
    setAgentsList(list);
    if (list.length > 0) {
      setSelectedAgentId(list[0].id);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const currentAgent = agentsList.find(a => a.id === selectedAgentId) || agentsList[0] || {
    name: 'Pooja (AI Closer)',
    gender: 'Female',
    useCase: 'Real Estate Closer',
    script: 'नमस्ते! मैं पूजा बोल रही हूँ। हमारे पास 2 और 3 बीएचके फ्लैट्स के बेस्ट ऑफर्स हैं। क्या आप डिटेल्स जानना चाहते हैं?'
  };

  const playAgentVoice = async (text, gender) => {
    try {
      setIsSpeaking(true);
      setStatusMsg(`${currentAgent.name} is speaking...`);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, gender: gender || currentAgent.gender, voice: currentAgent.voiceId || 'pooja' })
      });

      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(data.audioBase64);
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
    const greeting = currentAgent.script || 'नमस्ते! मैं आपकी क्या सहायता करूँ?';
    setTranscript([{ speaker: currentAgent.name, text: greeting }]);
    setStatusMsg(`${currentAgent.name} is speaking...`);

    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    playAgentVoice(greeting, currentAgent.gender);

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN';

      // Instant Interruption Handling (Barge-in): Stop AI voice immediately when user talks
      recognition.onspeechstart = () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsSpeaking(false);
        setStatusMsg('Listening to your question...');
      };

      recognition.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript;
        if (text.trim()) {
          // Double check audio is paused
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          setIsSpeaking(false);

          setTranscript(prev => [...prev, { speaker: 'You', text }]);
          handleAICallResponse(text);
        }
      };

      recognition.onerror = (e) => console.log('WebCall recognition note:', e.error);
      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  // REAL LLM RESPONSE IN WEBCALL
  const handleAICallResponse = async (userText) => {
    setStatusMsg('🧠 AI thinking...');
    try {
      const res = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: currentAgent.name,
          useCase: currentAgent.useCase,
          script: currentAgent.script,
          objections: currentAgent.objections,
          userQuestion: userText,
          history: transcript
        })
      });

      const data = await res.json();
      const reply = data.reply || 'जी बिल्कुल सर, मैं आपको तुरंत इस बारे में सहायता देती हूँ।';

      setTranscript(prev => [...prev, { speaker: currentAgent.name, text: reply }]);
      playAgentVoice(reply, currentAgent.gender);
    } catch(e) {
      const fallback = 'जी बिल्कुल, मैं समझ गई। क्या मैं आपको व्हाट्सएप पर डिटेल्स भेज दूँ?';
      setTranscript(prev => [...prev, { speaker: currentAgent.name, text: fallback }]);
      playAgentVoice(fallback, currentAgent.gender);
    }
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
    <div style={{ maxWidth: '900px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>🌐 Instant Web Voice Call (LLM Powered)</h1>
          <p className="subtitle">Speak live with your custom AI Voice Agent directly in the browser</p>
        </div>

        <button onClick={copyShareLink} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          {copied ? '✅ Link Copied!' : '🔗 Share WebCall Link'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        
        {/* Left: Agent Selection Card */}
        <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: 0 }}>Select Voice Agent</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {agentsList.map(ag => {
              const isSelected = selectedAgentId === ag.id;
              return (
                <div
                  key={ag.id}
                  onClick={() => { if (!callActive) setSelectedAgentId(ag.id); }}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    border: `1px solid ${isSelected ? 'var(--accent-green)' : 'var(--border-light)'}`,
                    background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                    cursor: callActive ? 'not-allowed' : 'pointer',
                    opacity: callActive && !isSelected ? 0.5 : 1
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: isSelected ? 'var(--accent-green)' : '#fff' }}>
                      {ag.name}
                    </span>
                    <span className="badge primary" style={{ fontSize: '0.7rem' }}>{ag.gender}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {ag.useCase}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem', background: '#0a0a12', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            🎙️ <strong>Instant Barge-in Active:</strong> AI bolte samay jaise hi aap bolege, AI turant chup hokar aapka answer karegi.
          </div>
        </div>

        {/* Right: Live Call Console */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: '#0e0e16' }}>
          
          {/* Avatar Ring */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: callActive ? 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0) 70%)' : 'rgba(255,255,255,0.05)',
            border: `3px solid ${callActive ? (isSpeaking ? 'var(--accent-green)' : 'var(--accent-blue)') : 'var(--border-light)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.5rem',
            marginBottom: '1rem',
            animation: isSpeaking ? 'pulse 1.5s infinite' : 'none'
          }}>
            {currentAgent.gender === 'Female' ? '👩' : '👨'}
          </div>

          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.3rem' }}>{currentAgent.name}</h2>
          <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentAgent.useCase}</p>

          {/* Call Status & Timer */}
          <div style={{ marginBottom: '1.5rem' }}>
            {callActive ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                <span className="badge success" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
                  🟢 Live: {formatDuration(callDuration)}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>{statusMsg}</span>
              </div>
            ) : (
              <span className="badge warning" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
                ⚪ Ready to Call (Click Start Below)
              </span>
            )}
          </div>

          {/* Call Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            {!callActive ? (
              <button
                onClick={startWebCall}
                className="btn btn-primary"
                style={{
                  padding: '0.85rem 2.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  boxShadow: '0 0 20px rgba(16,185,129,0.4)'
                }}
              >
                📞 Start Voice Call Now
              </button>
            ) : (
              <button
                onClick={endWebCall}
                className="btn btn-danger"
                style={{
                  padding: '0.85rem 2.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  borderRadius: '30px',
                  boxShadow: '0 0 20px rgba(239,68,68,0.4)'
                }}
              >
                ⏹️ End Call
              </button>
            )}
          </div>

          {/* Live Transcript Box */}
          <div style={{ width: '100%', textAlign: 'left', background: '#08080c', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', minHeight: '160px', maxHeight: '220px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Live Voice Transcript:
            </div>
            {transcript.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Conversation will appear here in real time...
              </div>
            ) : (
              transcript.map((t, idx) => (
                <div key={idx} style={{ marginBottom: '0.6rem', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  <strong style={{ color: t.speaker === 'You' ? 'var(--accent-blue)' : 'var(--accent-green)' }}>
                    {t.speaker}:
                  </strong>{' '}
                  <span style={{ color: '#fff' }}>{t.text}</span>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
