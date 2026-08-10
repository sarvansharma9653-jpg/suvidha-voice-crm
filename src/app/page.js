'use client';
import { useEffect, useState, useRef } from 'react';
import { store } from '@/lib/store';

export default function DashboardHome() {
  const [stats, setStats] = useState({ contacts: 0, calls: 0, success: 0, avgDuration: 0 });
  const [recentCalls, setRecentCalls] = useState([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState('Idle');
  const [textMsg, setTextMsg] = useState('');
  
  // Custom configurations
  const [selectedVoice, setSelectedVoice] = useState('sarvam_hindi');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [businessType, setBusinessType] = useState('real-estate');
  const [productDetails, setProductDetails] = useState('3 BHK Luxury Flat in Sector 62 Noida for 1.2 Crore, 10% discount on downpayment.');
  const [prompt, setPrompt] = useState('');

  // Audio References
  const wsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const micStreamRef = useRef(null);
  const processorRef = useRef(null);
  const nextStartTimeRef = useRef(0);

  // Handle wizard changes to build the AI calling script prompt
  useEffect(() => {
    if (businessType === 'real-estate') {
      setPrompt(`You are a friendly and professional Hinglish AI Real Estate Agent for Suvidha. Your goal is to qualify leads for: ${productDetails}. Explain key benefits briefly, ask if they want to schedule a site visit, and note their preferred callback date.`);
    } else if (businessType === 'customer-support') {
      setPrompt(`You are a polite AI Support Assistant. Product context: ${productDetails}. Answer questions based on this details, resolve queries in natural Hindi-English mix, and note down if they require human agent follow-up.`);
    } else if (businessType === 'financial-services') {
      setPrompt(`You are an AI Personal Loan Advisor. Offer details: ${productDetails}. Qualify the lead by checking their required loan amount, monthly income level, and interest in our offers.`);
    } else {
      setPrompt(`You are a custom AI Assistant. Business details: ${productDetails || 'General consulting'}. Speak naturally in natural Hinglish, be concise (1-2 sentences), and qualify the lead interest level.`);
    }
  }, [businessType, productDetails]);

  useEffect(() => {
    const contacts = store.getContacts();
    const calls = store.getCalls();
    
    const totalContacts = contacts.length;
    const todayCalls = calls.filter(c => new Date(c.date).toDateString() === new Date().toDateString()).length;
    const successCalls = calls.filter(c => c.sentiment === '😊 Positive' || c.sentiment === '✅ Positive' || c.sentiment.includes('Hot')).length;
    const successRate = calls.length > 0 ? Math.round((successCalls / calls.length) * 100) : 0;
    const avgDuration = calls.length > 0 ? Math.round(calls.reduce((acc, curr) => acc + curr.duration, 0) / calls.length) : 0;

    setStats({ contacts: totalContacts, calls: todayCalls, success: successRate, avgDuration });
    setRecentCalls(calls.slice(0, 5));
  }, []);

  // Browser sandbox testing via Web Audio API & WebSockets
  const startTestSession = async () => {
    if (isTesting) {
      // Terminate
      stopTestSession();
      return;
    }

    try {
      setIsTesting(true);
      setTestStatus('Starting audio context...');

      // 1. Initialize Web Audio
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext({ sampleRate: 8000 });
      nextStartTimeRef.current = 0;

      // 2. Connect WebSocket to local server or render service
      setTestStatus('Connecting to calling server...');
      const host = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'ws://127.0.0.1:3001' : 'wss://suvidha-voice-server.onrender.com';
      wsRef.current = new WebSocket(host);

      wsRef.current.onopen = async () => {
        setTestStatus('Microphone connected. Talk now!');
        
        // Send start event emulating Twilio payload
        wsRef.current.send(JSON.stringify({
          event: 'start',
          start: {
            streamSid: 'browser-stream',
            callSid: 'browser-call',
            customParameters: {
              systemPrompt: prompt
            }
          }
        }));

        // 3. Request Microphone access
        micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioCtxRef.current.createMediaStreamSource(micStreamRef.current);
        
        // 4. Create raw audio downsampler processor node
        processorRef.current = audioCtxRef.current.createScriptProcessor(4096, 1, 1);
        processorRef.current.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const mulawData = encodeMulaw(inputData);
          const base64Audio = arrayBufferToBase64(mulawData);
          
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              event: 'media',
              media: {
                payload: base64Audio
              }
            }));
          }
        };

        source.connect(processorRef.current);
        processorRef.current.connect(audioCtxRef.current.destination);
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'media' && data.media?.payload) {
            const base64 = data.media.payload;
            console.log(`📥 Browser received audio payload size: ${base64.length} characters`);
            const mulawBytes = base64ToArrayBuffer(base64);
            const float32PCM = decodeMulaw(mulawBytes);
            console.log(`🔊 Decoded PCM float array length: ${float32PCM.length}`);
            
            // Queue and play synthesized speech buffer
            if (audioCtxRef.current) {
              if (audioCtxRef.current.state === 'suspended') {
                console.log('🔄 Resuming suspended AudioContext...');
                await audioCtxRef.current.resume();
              }
              const buffer = audioCtxRef.current.createBuffer(1, float32PCM.length, 8000);
              buffer.getChannelData(0).set(float32PCM);
              
              const source = audioCtxRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioCtxRef.current.destination);
              
              const currentTime = audioCtxRef.current.currentTime;
              if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime;
              }
              source.start(nextStartTimeRef.current);
              console.log(`🎵 Playing audio block at time ${nextStartTimeRef.current} (duration: ${buffer.duration}s)`);
              nextStartTimeRef.current += buffer.duration;
            }
          }
        } catch (err) {
          console.error('Error handling WebSocket audio packet:', err);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error('WebSocket Sandbox Error:', err);
        setTestStatus('Connection error.');
      };

      wsRef.current.onclose = () => {
        stopTestSession();
      };

    } catch (error) {
      console.error('Failed to start browser voice sandbox:', error);
      setTestStatus(`Error: Microphone access denied.`);
      setIsTesting(false);
    }
  };

  const stopTestSession = () => {
    setTestStatus('Session closed.');
    setIsTesting(false);

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: 'stop' }));
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  };

  const sendTextMessage = () => {
    if (wsRef.current && wsRef.current.readyState === 1 && textMsg.trim()) {
      wsRef.current.send(JSON.stringify({
        event: 'text',
        text: textMsg
      }));
      setTextMsg('');
    }
  };

  // --- Audio DSP Utils (Hinglish browser telephony emulation) ---
  const encodeMulaw = (float32Array) => {
    const buffer = new Uint8Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      let sample = float32Array[i];
      if (sample > 1) sample = 1;
      else if (sample < -1) sample = -1;
      let pcm = Math.round(sample * 32767);
      let sign = (pcm & 0x8000) >> 8;
      if (sign !== 0) pcm = -pcm;
      if (pcm > 32635) pcm = 32635;
      pcm += 0x84;
      pcm >>= 2;
      let exponent = 0;
      if (pcm >= 0x100) { exponent += 4; pcm >>= 4; }
      if (pcm >= 0x40) { exponent += 2; pcm >>= 2; }
      if (pcm >= 0x20) { exponent += 1; pcm >>= 1; }
      let mantissa = pcm & 0x0f;
      let uval = ~(sign | (exponent << 4) | mantissa) & 0xff;
      buffer[i] = uval;
    }
    return buffer;
  };

  const decodeMulaw = (mulawBytes) => {
    const float32 = new Float32Array(mulawBytes.length);
    for (let i = 0; i < mulawBytes.length; i++) {
      let uval = ~mulawBytes[i] & 0xff;
      let sign = (uval & 0x80);
      let segment = (uval & 0x70) >> 4;
      let quantization = uval & 0x0f;
      let clip = (quantization << 3) + 132;
      clip <<= segment;
      let sample = clip - 132;
      float32[i] = (sign !== 0 ? -sample : sample) / 32768.0;
    }
    return float32;
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="playground-layout">
      {/* LEFT COLUMN: CONSOLE & ANALYTICS */}
      <div className="console-main">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>🤖 Console Overview</h1>
            <p className="subtitle" style={{ marginBottom: 0 }}>Configure and test your voice assistants in real-time</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="card glass-card">
            <div className="stat-header">
              <span>Total Contacts</span>
              <span>👥</span>
            </div>
            <div className="stat-value">{stats.contacts}</div>
            <div className="stat-trend trend-up">↑ 12% imported</div>
          </div>
          <div className="card glass-card">
            <div className="stat-header">
              <span>Active Calls Today</span>
              <span>📞</span>
            </div>
            <div className="stat-value">{stats.calls}</div>
            <div className="stat-trend trend-up">↑ 8% active</div>
          </div>
          <div className="card glass-card">
            <div className="stat-header">
              <span>Average Duration</span>
              <span>⏱️</span>
            </div>
            <div className="stat-value">{formatDuration(stats.avgDuration)}</div>
            <div className="stat-trend trend-down">↓ 12s latency</div>
          </div>
        </div>

        {/* Recent Calls Table */}
        <h2 style={{ marginTop: '2.5rem', marginBottom: '1rem', fontSize: '1.25rem' }}>📜 Recent Run Logs</h2>
        <div className="table-container glass-card">
          <table>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Sentiment</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.map(call => (
                <tr key={call.id}>
                  <td style={{ fontWeight: 600 }}>{call.contactName}</td>
                  <td>{formatDuration(call.duration)}</td>
                  <td>
                    <span className={`badge ${call.status.toLowerCase()}`}>
                      {call.status}
                    </span>
                  </td>
                  <td>{call.sentiment}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{call.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT COLUMN: VAPI-STYLE PLAYGROUND */}
      <div className="playground-sidebar card glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚡ Voice Sandbox
        </h2>
        
        {/* Voice Wave Animation */}
        <div className={`wave-container ${isTesting ? 'active' : ''}`}>
          {isTesting ? (
            <div className="wave-bars">
              <span className="bar-wave"></span>
              <span className="bar-wave"></span>
              <span className="bar-wave"></span>
              <span className="bar-wave"></span>
              <span className="bar-wave"></span>
              <span className="bar-wave"></span>
            </div>
          ) : (
            <div className="mic-placeholder">🎙️</div>
          )}
          <p className="wave-status">{testStatus}</p>
        </div>

        <button 
          onClick={startTestSession} 
          className={`btn ${isTesting ? 'btn-danger' : 'btn-primary'}`} 
          style={{ width: '100%', padding: '0.875rem', marginBottom: '2rem', fontSize: '1rem', boxShadow: 'none' }}
        >
          {isTesting ? '🔴 Terminate WebRTC Session' : '🎙️ Test Assistant in Browser'}
        </button>

        {isTesting && (
          <div className="form-group" style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>💬 Type message (Bypasses Deepgram key dependency)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input 
                type="text" 
                className="form-control" 
                value={textMsg} 
                onChange={e => setTextMsg(e.target.value)} 
                placeholder="Namaste, kaise ho?..." 
                onKeyDown={e => { if (e.key === 'Enter') sendTextMessage(); }}
                style={{ fontSize: '0.8125rem', height: '36px', flex: 1 }}
              />
              <button 
                onClick={sendTextMessage} 
                className="btn btn-success" 
                style={{ padding: '0 1rem', height: '36px', minWidth: 'auto', fontSize: '0.8125rem' }}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Business Prompt Wizard */}
        <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
          🏢 Business Context Wizard
        </h3>

        <div className="form-group">
          <label>Business / Campaign Template</label>
          <select className="form-control" value={businessType} onChange={e => setBusinessType(e.target.value)}>
            <option value="real-estate">Real Estate / Property Sales</option>
            <option value="customer-support">Customer Support Desk</option>
            <option value="financial-services">Financial & Loan Services</option>
            <option value="custom">Custom AI Assistant</option>
          </select>
        </div>

        <div className="form-group">
          <label>Product / Service details</label>
          <textarea 
            rows="3"
            className="form-control"
            value={productDetails}
            onChange={(e) => setProductDetails(e.target.value)}
            placeholder="e.g. details of properties, pricing, discounts..."
            style={{ resize: 'none', fontSize: '0.8125rem' }}
          />
        </div>

        {/* Generated Script */}
        <div className="form-group">
          <label>Compiled System Script Prompt</label>
          <textarea 
            rows="5"
            className="form-control"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ resize: 'none', fontSize: '0.8125rem', background: 'rgba(0, 0, 0, 0.4)' }}
          />
        </div>

        <div className="form-group">
          <label>Select Voice Engine</label>
          <select className="form-control" value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}>
            <option value="sarvam_hindi">Bulbul:v3 (Sarvam AI - Hindi Female)</option>
            <option value="sarah">Sarah (11labs - English Female)</option>
            <option value="dom">Dom (Cartesia - Indian Accent)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Model Configuration</label>
          <select className="form-control" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
            <option value="gpt-4o-mini">GPT-4o-mini (Lowest Latency)</option>
            <option value="gemini-flash">Gemini 1.5 Flash (Fast Streaming)</option>
            <option value="gpt-4o">GPT-4o (Reasoning capability)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
