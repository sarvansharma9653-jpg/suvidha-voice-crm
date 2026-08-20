'use client';
import { useEffect, useState } from 'react';
import { store } from '@/lib/store';
import Link from 'next/link';

export default function VoiceAgentStudioPage() {
  const [agents, setAgents] = useState([]);

  // Voice Studio Form Fields
  const [agentName, setAgentName] = useState('Pooja - Luxury Real Estate Closer');
  const [selectedVoice, setSelectedVoice] = useState('pooja');
  const [speed, setSpeed] = useState('1.0x (Normal)');
  const [pitch, setPitch] = useState('Warm & Friendly');
  const [bargeIn, setBargeIn] = useState(true);
  const [callType, setCallType] = useState('Outbound (AI calls leads)');
  const [useCase, setUseCase] = useState('Real Estate Sales & Discovery');
  const [script, setScript] = useState('नमस्ते सर! मैं पूजा बात कर रही हूँ। हमारे पास 2 और 3 बीएचके लक्ज़री फ्लैट्स का एक्सक्लूसिव ऑफर है जो 45 लाख से शुरू है। क्या आप इस वीकेंड साइट विजिट के लिए फ्री हैं?');
  const [objections, setObjections] = useState('अगर कस्टमर पूछे बजट कम है, तो 35 लाख वाले विकल्प बताएं। अगर पूछे WhatsApp पर भेजो, तो तुरंत सहमति देकर विवरण भेजने का वादा करें।');

  // Live Q&A Simulation State (Step 6)
  const [testQuestion, setTestQuestion] = useState('Price kitna hai aur details kahan milegi?');
  const [testAnswer, setTestAnswer] = useState('');
  const [simulating, setSimulating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [status, setStatus] = useState(null);

  const voiceLibrary = [
    { id: 'pooja', name: '👩 Pooja (Warm & Polite Closer)', gender: 'Female', desc: 'Soft, polite & highly persuasive female sales tone (बोल रही हूँ)' },
    { id: 'aarav', name: '👨 Aarav (Dynamic Tech & Finance Specialist)', gender: 'Male', desc: 'Enthusiastic & sharp tone for Loans, Banking & Tech (बोल रहा हूँ)' },
    { id: 'swara', name: '👩 Swara (Real Estate & Luxury Advisor)', gender: 'Female', desc: 'Sweet, empathetic and crystal-clear voice for premium consulting' },
    { id: 'madhur', name: '👨 Madhur (Corporate B2B Executive)', gender: 'Male', desc: 'Confident & trustworthy corporate tone for High-Ticket Deals' },
    { id: 'ananya', name: '👩 Ananya (Client Support Manager)', gender: 'Female', desc: 'Modern, fast and energetic Hinglish sales & support voice' },
    { id: 'rohan', name: '👨 Rohan (Executive Business Development)', gender: 'Male', desc: 'Deep bass authoritative voice for Commercial & Industrial sales' },
    { id: 'kavya', name: '👩 Kavya (Social Media & Retail Deals)', gender: 'Female', desc: 'High-conversion friendly tone for e-Commerce and Festive promotions' },
  ];

  useEffect(() => {
    setAgents(store.getAgents());
  }, []);

  const playVoiceSample = async (voiceId, customText) => {
    try {
      setPlayingVoiceId(voiceId);
      const vObj = voiceLibrary.find(v => v.id === voiceId) || voiceLibrary[0];
      const isMale = vObj.gender === 'Male';
      const personaName = vObj.name.split(' ')[1];

      const sampleText = customText || (isMale 
        ? `नमस्ते! मैं ${personaName} बोल रहा हूँ। हमारे पास आपके लिए बेस्ट बिजनेस ऑफर्स हैं। क्या आप जानकारी चाहते हैं?`
        : `नमस्ते! मैं ${personaName} बोल रही हूँ। हमारे पास आपके लिए बेस्ट बिजनेस ऑफर्स हैं। क्या आप जानकारी चाहती हैं?`);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText, gender: vObj.gender, voice: voiceId })
      });

      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(data.audioBase64);
        audio.onended = () => setPlayingVoiceId(null);
        audio.onerror = () => setPlayingVoiceId(null);
        await audio.play();
      } else {
        setPlayingVoiceId(null);
      }
    } catch(e) {
      console.log('Sample playback note:', e);
      setPlayingVoiceId(null);
    }
  };

  // Live Q&A Simulation
  const handleTestAgentQuestion = async () => {
    if (!testQuestion.trim()) return;
    setSimulating(true);

    let reply = '';
    const lower = testQuestion.toLowerCase();
    const vObj = voiceLibrary.find(v => v.id === selectedVoice) || voiceLibrary[0];
    const isMale = vObj.gender === 'Male';

    if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('kitna') || lower.includes('rate')) {
      reply = isMale 
        ? 'हाँ जी बिल्कुल सर! हमारे पैकेजेस बहुत ही किफायती हैं और 45 लाख से शुरू हैं। मैंने आपका नंबर नोट कर लिया है और ब्रोशर तुरंत आपको व्हाट्सएप कर रहा हूँ!'
        : 'हाँ जी बिल्कुल सर! हमारे पैकेजेस बहुत ही किफायती हैं और 45 लाख से शुरू हैं। मैंने आपका नंबर नोट कर लिया है और ब्रोशर तुरंत आपको व्हाट्सएप कर रही हूँ!';
    } else if (lower.includes('loan') || lower.includes('interest') || lower.includes('emi')) {
      reply = isMale
        ? 'जी! हमारे पास सभी प्रमुख बैंकों से 9.99% पर प्री-अप्रूव्ड लोन उपलब्ध है। क्या मैं आपको ईएमआई कैलकुलेटर भेज दूँ?'
        : 'जी! हमारे पास सभी प्रमुख बैंकों से 9.99% पर प्री-अप्रूव्ड लोन उपलब्ध है। क्या मैं आपको ईएमआई कैलकुलेटर भेज दूँ?';
    } else if (lower.includes('where') || lower.includes('location') || lower.includes('kahan') || lower.includes('address')) {
      reply = isMale
        ? 'यह प्रोजेक्ट नोएडा सेक्टर 62 में प्राइम लोकेशन पर स्थित है, मेट्रो स्टेशन से मात्र 5 मिनट की दूरी पर!'
        : 'यह प्रोजेक्ट नोएडा सेक्टर 62 में प्राइम लोकेशन पर स्थित है, मेट्रो स्टेशन से मात्र 5 मिनट की दूरी पर!';
    } else {
      reply = isMale
        ? `जी बिल्कुल सर, ${testQuestion} के बारे में मैं आपको पूरी सहायता दूंगा। क्या मैं आपकी मीटिंग हमारे सीनियर मैनेजर से फिक्स कर दूँ?`
        : `जी बिल्कुल सर, ${testQuestion} के बारे में मैं आपको पूरी सहायता दूँगी। क्या मैं आपकी मीटिंग हमारे सीनियर मैनेजर से फिक्स कर दूँ?`;
    }

    setTestAnswer(reply);
    setSimulating(false);
    await playVoiceSample(selectedVoice, reply);
  };

  const handleSaveAgent = (e) => {
    e.preventDefault();
    const vObj = voiceLibrary.find(v => v.id === selectedVoice) || voiceLibrary[0];

    const agentData = {
      id: editingId || ('ag_' + Date.now()),
      name: agentName.trim(),
      voiceId: selectedVoice,
      voice: vObj.name,
      gender: vObj.gender,
      speed,
      pitch,
      bargeIn,
      callType,
      useCase: useCase.trim(),
      script: script.trim(),
      objections: objections.trim()
    };

    if (editingId) {
      store.updateAgent(editingId, agentData);
      setStatus({ type: 'success', message: `✅ Voice Agent "${agentName}" updated successfully!` });
      setEditingId(null);
    } else {
      store.addAgent(agentData);
      setStatus({ type: 'success', message: `🎉 Voice Agent "${agentName}" created and permanently saved!` });
    }

    setAgents(store.getAgents());
    setTimeout(() => setStatus(null), 4000);
  };

  const handleEdit = (agent) => {
    setEditingId(agent.id);
    setAgentName(agent.name);
    setSelectedVoice(agent.voiceId || 'pooja');
    setSpeed(agent.speed || '1.0x (Normal)');
    setPitch(agent.pitch || 'Warm & Friendly');
    setBargeIn(agent.bargeIn !== false);
    setCallType(agent.callType || 'Outbound (AI calls leads)');
    setUseCase(agent.useCase || '');
    setScript(agent.script || '');
    setObjections(agent.objections || '');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete Voice Agent "${name}"?`)) {
      store.deleteAgent(id);
      setAgents(store.getAgents());
      if (editingId === id) setEditingId(null);
      setStatus({ type: 'success', message: `🗑️ Voice Agent "${name}" removed.` });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAgentName('Pooja - Luxury Real Estate Closer');
    setSelectedVoice('pooja');
    setScript('नमस्ते सर! मैं पूजा बात कर रही हूँ। हमारे पास 2 और 3 बीएचके लक्ज़री फ्लैट्स का एक्सक्लूसिव ऑफर है। क्या मैं आपको व्हाट्सएप पर डिटेल्स भेज दूँ?');
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>🤖 AI Voice Agent Studio</h1>
          <p className="subtitle">Build, test live Q&A speech, and deploy custom AI personas (Pooja, Aarav, Swara, Madhur)</p>
        </div>

        <Link href="/campaigns" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          🚀 Launch in Bulk Campaigns &rarr;
        </Link>
      </div>

      {status && (
        <div className="card mb-6" style={{ padding: '1rem', borderColor: status.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)', background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
          {status.message}
        </div>
      )}

      {/* Voice Library Selector */}
      <div className="mb-8">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🎧 Step 1: Choose Voice Model (Male / Female)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {voiceLibrary.map(v => {
            const isSelected = selectedVoice === v.id;
            const isPlaying = playingVoiceId === v.id;

            return (
              <div 
                key={v.id} 
                className="card" 
                onClick={() => setSelectedVoice(v.id)}
                style={{ 
                  padding: '1.25rem', 
                  cursor: 'pointer', 
                  borderColor: isSelected ? 'var(--accent-green)' : 'var(--border-light)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.08)' : '#0d0d14',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontWeight: '600', fontSize: '0.95rem', color: isSelected ? 'var(--accent-green)' : '#fff' }}>
                    {v.name}
                  </span>
                  <span className={`badge ${v.gender === 'Female' ? 'primary' : 'warning'}`}>
                    {v.gender}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                  {v.desc}
                </p>
                <div className="flex justify-between items-center">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); playVoiceSample(v.id); }}
                    className={`btn ${isPlaying ? 'btn-success' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  >
                    {isPlaying ? '🔊 Playing Voice...' : '🔊 Listen Voice Sample'}
                  </button>
                  {isSelected && <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>✓ Selected</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Agent Creation & Tuning Form */}
      <div className="card mb-8" style={{ padding: '2.5rem', background: '#0e0e14', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>
              {editingId ? '✏️ Edit AI Voice Agent' : '⚙️ Step 2: Configure Pitch, Speed, Script & Objections'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
              Set how the agent sounds, what it speaks, and test live responses before saving.
            </p>
          </div>
          {editingId && (
            <button onClick={cancelEdit} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSaveAgent}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            {/* Agent Name */}
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>1. Agent Name & Persona Title</label>
              <input 
                required
                type="text" 
                className="form-control" 
                value={agentName}
                onChange={e => setAgentName(e.target.value)} 
                placeholder="e.g. Pooja - Luxury Real Estate Closer" 
              />
            </div>

            {/* Core Industry Use Case */}
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>2. Business Industry / Use Case</label>
              <input 
                required
                type="text" 
                className="form-control" 
                value={useCase}
                onChange={e => setUseCase(e.target.value)} 
                placeholder="e.g. Real Estate Sales, Pre-Approved Loans, Clinic Appointments" 
              />
            </div>

            {/* Speaking Pace / Speed */}
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>3. Speaking Pace (Speed)</label>
              <select className="form-control" value={speed} onChange={e => setSpeed(e.target.value)}>
                <option value="0.8x (Slow & Clear)">🐢 0.8x (Slow & Clear - Best for Elderly / Complex Financial)</option>
                <option value="1.0x (Normal)">⚡ 1.0x (Normal Pace - Recommended for Real Estate & Sales)</option>
                <option value="1.2x (Fast & Energetic)">🚀 1.2x (Fast & Energetic - Best for Short Promotional Deals)</option>
              </select>
            </div>

            {/* Voice Tone & Pitch */}
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>4. Voice Tone & Pitch</label>
              <select className="form-control" value={pitch} onChange={e => setPitch(e.target.value)}>
                <option value="Warm & Friendly">🌸 Warm & Friendly (Soft, polite, conversational closer)</option>
                <option value="Professional & Trustworthy">👔 Professional & Trustworthy (Corporate B2B & Banking)</option>
                <option value="Confident & High-Energy">🔥 Confident & High-Energy (Excited, promotional pitch)</option>
                <option value="Empathetic & Soft">💙 Empathetic & Soft (Customer Support & Retention)</option>
              </select>
            </div>

          </div>

          {/* Interruption / Barge-in Feature */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--accent-green)' }}>
                🎙️ Instant Interruption Handling (Barge-In Active)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Jab customer beech mein koi sawal puchega, AI turant bolna band karke customer ki baat sunega aur jawab dega.
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={bargeIn} onChange={e => setBargeIn(e.target.checked)} />
              Enabled
            </label>
          </div>

          {/* Custom Call Script */}
          <div className="form-group mb-4">
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              5. AI Spoken Opening Script <span style={{ color: 'var(--accent-green)' }}>(Call Receive Hote Hi AI Yeh Bolega)</span>
            </label>
            <textarea 
              required
              rows="3"
              className="form-control" 
              value={script}
              onChange={e => setScript(e.target.value)} 
              placeholder="नमस्ते सर! मैं पूजा बोल रही हूँ..." 
              style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
            />
          </div>

          {/* Objection Handling */}
          <div className="form-group mb-6">
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              6. Objection Handling & FAQ Instructions <span style={{ color: 'var(--accent-blue)' }}>(Customer Ke Sawalo Ka Jawab)</span>
            </label>
            <textarea 
              rows="3"
              className="form-control" 
              value={objections}
              onChange={e => setObjections(e.target.value)} 
              placeholder="अगर कस्टमर पूछे डिस्काउंट कितना है... अगर बोले बाद में कॉल करो..." 
              style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
            />
          </div>

          {/* STEP 6: LIVE Q&A TEST SIMULATOR BEFORE SAVING */}
          <div style={{ background: '#0a0a14', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '2rem' }}>
            <div className="flex justify-between items-center mb-2">
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--accent-purple)' }}>
                🎙️ Step 3: Test Your Agent Live (Q&A Simulator)
              </h3>
              <span className="badge warning">Pre-Save Test</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1rem' }}>
              Yahan customer ka koi bhi sawal likhein aur suniye ki aapka AI agent kaisa jawab deta hai:
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                className="form-control" 
                value={testQuestion} 
                onChange={e => setTestQuestion(e.target.value)} 
                placeholder="Type customer question e.g. Price kitna hai?" 
              />
              <button 
                type="button" 
                onClick={handleTestAgentQuestion}
                disabled={simulating}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', flexShrink: 0, fontWeight: '700', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
              >
                {simulating ? 'Thinking...' : '🔊 Test & Listen Response'}
              </button>
            </div>

            {testAnswer && (
              <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)', fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--accent-purple)', display: 'block', marginBottom: '4px' }}>
                  🤖 Agent Response:
                </strong>
                <span style={{ color: '#fff', lineHeight: '1.5' }}>"{testAnswer}"</span>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontWeight: '700', fontSize: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
            {editingId ? '💾 Update Voice Agent' : '🚀 Permanently Save & Deploy AI Voice Agent'}
          </button>
        </form>
      </div>

      {/* Saved & Deployed Agents List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
            Active Saved Voice Agents ({agents.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Permanently saved in database. Refresh karne par bhi hatega nahi.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {agents.map(ag => (
            <div className="card" key={ag.id} style={{ padding: '1.5rem', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{ag.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: '600' }}>{ag.useCase}</span>
                  </div>
                  <span className="badge primary">{ag.voice}</span>
                </div>

                <div style={{ background: '#0a0a12', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', margin: '0.75rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>Opening Script:</strong>
                  "{ag.script}"
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <span className="badge warning">Speed: {ag.speed || '1.0x'}</span>
                  <span className="badge info">Tone: {ag.pitch || 'Warm'}</span>
                  <span className="badge success">Barge-in: {ag.bargeIn !== false ? 'Active' : 'Off'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                <Link 
                  href={`/campaigns?agentId=${ag.id}`}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', fontWeight: '700' }}
                >
                  🚀 Use in Campaign
                </Link>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleEdit(ag)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(ag.id, ag.name)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
