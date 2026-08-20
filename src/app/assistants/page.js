'use client';
import { useEffect, useState } from 'react';
import { store } from '@/lib/store';
import Link from 'next/link';

export default function VoiceAgentStudioPage() {
  const [agents, setAgents] = useState([]);

  // Voice Studio Form Fields
  const [agentName, setAgentName] = useState('Pooja - Real Estate Closer');
  const [selectedVoice, setSelectedVoice] = useState('pooja');
  const [speed, setSpeed] = useState('1.0x (Normal)');
  const [pitch, setPitch] = useState('Warm & Friendly');
  const [bargeIn, setBargeIn] = useState(true);
  const [callType, setCallType] = useState('Outbound (AI calls leads)');
  const [useCase, setUseCase] = useState('Real Estate Sales');
  const [script, setScript] = useState('नमस्कार जी! मैं Pooja, Shree Aangan Developer की तरफ से बात कर रही हूँ। आपने property से related information में interest दिखाया था, उसी के regarding आपसे बात कर रही हूँ। क्या अभी 2 मिनट बात करना convenient रहेगा?');
  const [objections, setObjections] = useState('अगर Customer बात करने के लिए तैयार है: "Thank you जी। सबसे पहले मैं आपकी requirement समझना चाहूँगी ताकि आपको आपकी ज़रूरत के हिसाब से सही property option की जानकारी दी जा सके।" अगर पूछे प्राइस कितना है तो बताएं कि 45 लाख से शुरू है और व्हाट्सएप पर ब्रोशर भेजने को कहें।');

  // Live Q&A Simulation State (Connected to Real Gemini LLM)
  const [testQuestion, setTestQuestion] = useState('price batao');
  const [testAnswer, setTestAnswer] = useState('');
  const [simulating, setSimulating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [status, setStatus] = useState(null);

  const voiceLibrary = [
    { id: 'pooja', name: '👩 Pooja', title: 'Warm Sales Closer', gender: 'Female', desc: 'मीठी, विनम्र और भरोसेमंद आवाज (बोल रही हूँ)' },
    { id: 'aarav', name: '👨 Aarav', title: 'Finance & Loan Specialist', gender: 'Male', desc: 'कॉन्फिडेंट और प्रोफेशनल आवाज (बोल रहा हूँ)' },
    { id: 'swara', name: '👩 Swara', title: 'Luxury Consultant', gender: 'Female', desc: 'सॉफ्ट और प्रीमियम रियल एस्टेट एडवाइजर' },
    { id: 'madhur', name: '👨 Madhur', title: 'Corporate B2B Executive', gender: 'Male', desc: 'कॉर्पोरेट और बिजनेस डील्स के लिए बेस्ट' },
    { id: 'ananya', name: '👩 Ananya', title: 'Customer Support Lead', gender: 'Female', desc: 'मॉडर्न, तेज और दोस्ताना हिंग्लिश आवाज' },
    { id: 'rohan', name: '👨 Rohan', title: 'Senior Sales Director', gender: 'Male', desc: 'गंभीर और असरदार आवाज' },
  ];

  useEffect(() => {
    setAgents(store.getAgents());
  }, []);

  const playVoiceSample = async (voiceId, customText) => {
    try {
      setPlayingVoiceId(voiceId);
      const vObj = voiceLibrary.find(v => v.id === voiceId) || voiceLibrary[0];
      const isMale = vObj.gender === 'Male';
      const personaName = vObj.name.replace(/[^a-zA-Z]/g, '');

      const sampleText = customText || (isMale 
        ? `नमस्ते! मैं ${personaName} बोल रहा हूँ। हमारे पास आपके लिए बेस्ट बिजनेस ऑफर्स हैं। बताइए, आज मैं आपकी क्या सहायता करूँ?`
        : `नमस्ते! मैं ${personaName} बोल रही हूँ। हमारे पास आपके लिए बेस्ट बिजनेस ऑफर्स हैं। बताइए, आज मैं आपकी क्या सहायता करूँ?`);

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

  // REAL LLM INTELLIGENT Q&A SIMULATION
  const handleTestAgentQuestion = async () => {
    if (!testQuestion.trim()) return;
    setSimulating(true);
    setTestAnswer('');

    try {
      // Call Real LLM API with the user's custom script, intro and objections
      const res = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: agentName.trim(),
          useCase: useCase.trim(),
          script: script.trim(),
          objections: objections.trim(),
          userQuestion: testQuestion.trim()
        })
      });

      const data = await res.json();
      const reply = data.reply || 'जी बिल्कुल, मैं आपको पूरी जानकारी व्हाट्सएप कर रही हूँ!';
      setTestAnswer(reply);
      setSimulating(false);

      // Speak back the LLM generated response in real-time
      await playVoiceSample(selectedVoice, reply);
    } catch (e) {
      console.error('LLM Simulation Error:', e);
      setSimulating(false);
    }
  };

  const handleSaveAgent = (e) => {
    e.preventDefault();
    const vObj = voiceLibrary.find(v => v.id === selectedVoice) || voiceLibrary[0];

    const agentData = {
      id: editingId || ('ag_' + Date.now()),
      name: agentName.trim(),
      voiceId: selectedVoice,
      voice: `${vObj.name} (${vObj.title})`,
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
      setStatus({ type: 'success', message: `✅ Voice Agent "${agentName}" अपडेट हो गया!` });
      setEditingId(null);
    } else {
      store.addAgent(agentData);
      setStatus({ type: 'success', message: `🎉 Voice Agent "${agentName}" सफलतापूर्वक सेव हो गया!` });
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
    setScript(agent.script || agent.description || '');
    setObjections(agent.objections || '');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleDelete = (id, name) => {
    if (confirm(`क्या आप सच में Voice Agent "${name}" को डिलीट करना चाहते हैं?`)) {
      store.deleteAgent(id);
      setAgents(store.getAgents());
      if (editingId === id) setEditingId(null);
      setStatus({ type: 'success', message: `🗑️ Voice Agent "${name}" डिलीट कर दिया गया।` });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAgentName('Pooja - Real Estate Closer');
    setSelectedVoice('pooja');
    setScript('नमस्कार जी! मैं Pooja, Shree Aangan Developer की तरफ से बात कर रही हूँ।');
  };

  return (
    <div style={{ maxWidth: '1050px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>🤖 Voice Agent Studio (LLM Powered)</h1>
          <p className="subtitle">सरल और आसान तरीके से अपना AI कॉलिंग एजेंट बनाएं — AI आपके लिखे हुए स्क्रिप्ट और नियमों के अनुसार ही बात करेगा</p>
        </div>

        <Link href="/campaigns" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          🚀 Bulk Campaigns में जाएं &rarr;
        </Link>
      </div>

      {status && (
        <div className="card mb-6" style={{ padding: '1rem', borderColor: status.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)', background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
          {status.message}
        </div>
      )}

      {/* Step 1: Voice Selection */}
      <div className="mb-8">
        <h2 style={{ fontSize: '1.15rem', marginBottom: '0.85rem' }}>🎧 Step 1: एजेंट की आवाज चुनें (Male / Female)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {voiceLibrary.map(v => {
            const isSelected = selectedVoice === v.id;
            const isPlaying = playingVoiceId === v.id;

            return (
              <div 
                key={v.id} 
                className="card" 
                onClick={() => setSelectedVoice(v.id)}
                style={{ 
                  padding: '1.15rem', 
                  cursor: 'pointer', 
                  borderColor: isSelected ? 'var(--accent-green)' : 'var(--border-light)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.08)' : '#0d0d14',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span style={{ fontWeight: '700', fontSize: '0.95rem', color: isSelected ? 'var(--accent-green)' : '#fff' }}>
                    {v.name} ({v.title})
                  </span>
                  <span className={`badge ${v.gender === 'Female' ? 'primary' : 'warning'}`}>
                    {v.gender}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: '1.4' }}>
                  {v.desc}
                </p>
                <div className="flex justify-between items-center">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); playVoiceSample(v.id); }}
                    className={`btn ${isPlaying ? 'btn-success' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                  >
                    {isPlaying ? '🔊 आवाज बज रही है...' : '🔊 आवाज सुनकर देखें'}
                  </button>
                  {isSelected && <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>✓ चुनी हुई</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Agent Configuration Form */}
      <div className="card mb-8" style={{ padding: '2rem', background: '#0e0e14', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
              {editingId ? '✏️ एजेंट एडिट करें' : '⚙️ Step 2: एजेंट का नाम और बोलने की स्क्रिप्ट लिखें'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', margin: '0.25rem 0 0' }}>
              यह वही स्क्रिप्ट और बिजनेस डिटेल्स हैं जिनके अनुसार AI LLM कस्टमर के हर सवाल का जवाब देगा।
            </p>
          </div>
          {editingId && (
            <button onClick={cancelEdit} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
              रद्द करें
            </button>
          )}
        </div>

        <form onSubmit={handleSaveAgent}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            
            {/* Agent Custom Name */}
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>1. एजेंट का नाम लिखें (Voice Agent Custom Name)</label>
              <input 
                required
                type="text" 
                className="form-control" 
                value={agentName}
                onChange={e => setAgentName(e.target.value)} 
                placeholder="e.g. Pooja - Shree Aangan Closer" 
              />
            </div>

            {/* Core Industry Use Case */}
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>2. काम / बिजनेस (Industry & Company Name)</label>
              <input 
                required
                type="text" 
                className="form-control" 
                value={useCase}
                onChange={e => setUseCase(e.target.value)} 
                placeholder="e.g. Shree Aangan Developer Real Estate, Loans, Clinic" 
              />
            </div>

            {/* Speaking Pace / Speed */}
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>3. बोलने की स्पीड</label>
              <select className="form-control" value={speed} onChange={e => setSpeed(e.target.value)}>
                <option value="0.8x (Slow & Clear)">🐢 0.8x (धीमी और साफ आवाज)</option>
                <option value="1.0x (Normal)">⚡ 1.0x (सामान्य स्पीड - बेस्ट)</option>
                <option value="1.2x (Fast & Energetic)">🚀 1.2x (तेज और एनर्जेटिक)</option>
              </select>
            </div>

            {/* Voice Tone & Pitch */}
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>4. बोलने का तरीका (Tone)</label>
              <select className="form-control" value={pitch} onChange={e => setPitch(e.target.value)}>
                <option value="Warm & Friendly">🌸 दोस्ताना और मीठी आवाज (Warm & Friendly)</option>
                <option value="Professional & Trustworthy">👔 प्रोफेशनल और गंभीर (Corporate & Banking)</option>
                <option value="Confident & High-Energy">🔥 जोशीली और कॉन्फिडेंट आवाज</option>
              </select>
            </div>

          </div>

          {/* Interruption / Barge-in Notice */}
          <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.25)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.825rem', color: '#fff' }}>
              🎙️ <strong>कस्टमर के बोलते ही AI चुप हो जाएगा:</strong> जैसे ही कस्टमर सवाल पूछेगा, AI रुक कर जवाब देगा।
            </div>
            <span className="badge success" style={{ fontSize: '0.72rem' }}>सक्रिय (Active)</span>
          </div>

          {/* Custom Call Script */}
          <div className="form-group mb-4">
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              5. AI क्या बोलेगा (Opening Call Script) <span style={{ color: 'var(--accent-green)' }}>*</span>
            </label>
            <textarea 
              required
              rows="3"
              className="form-control" 
              value={script}
              onChange={e => setScript(e.target.value)} 
              placeholder="नमस्ते सर! मैं पूजा बोल रही हूँ श्री आँगन डेवलपर से..." 
              style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
            />
          </div>

          {/* Objection Handling */}
          <div className="form-group mb-6">
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              6. कस्टमर के सवालों के जवाब (FAQ / Objection Rules)
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

          {/* LIVE LLM Q&A TEST SIMULATOR */}
          <div style={{ background: '#0a0a14', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', marginBottom: '1.75rem' }}>
            <div className="flex justify-between items-center mb-2">
              <div style={{ fontWeight: '700', color: 'var(--accent-purple)', fontSize: '0.9rem' }}>
                🧠 Step 3: लाइव AI LLM जवाब सुनकर टेस्ट करें:
              </div>
              <span className="badge primary" style={{ fontSize: '0.68rem' }}>Google Gemini 2.0 / 3.6 LLM Active</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              ऊपर आपके लिखे हुए स्क्रिप्ट और कंपनी डिटेल्स के आधार पर AI लाइव सोचकर जवाब देगा:
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <input 
                type="text" 
                className="form-control" 
                value={testQuestion} 
                onChange={e => setTestQuestion(e.target.value)} 
                placeholder="कस्टमर का सवाल लिखें e.g. price batao" 
              />
              <button 
                type="button" 
                onClick={handleTestAgentQuestion}
                disabled={simulating}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', flexShrink: 0, fontWeight: '700', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
              >
                {simulating ? '🧠 AI सोच रहा है...' : '🔊 टेस्ट करें और सुनें'}
              </button>
            </div>

            {testAnswer && (
              <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.3)', fontSize: '0.825rem' }}>
                <strong style={{ color: 'var(--accent-purple)', display: 'block', marginBottom: '2px' }}>
                  🤖 AI एजेंट का जवाब (LLM Brain):
                </strong>
                <span style={{ color: '#fff', lineHeight: '1.4' }}>"{testAnswer}"</span>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontWeight: '700', fontSize: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
            {editingId ? '💾 एजेंट अपडेट करें' : '🚀 एजेंट को सुरक्षित सेव करें (Save Agent)'}
          </button>
        </form>
      </div>

      {/* Saved Agents List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>
            सेव किए हुए Voice Agents ({agents.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            पेज रिफ्रेश करने पर भी यह सेव रहेंगे।
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {agents.map(ag => (
            <div className="card" key={ag.id} style={{ padding: '1.25rem', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{ag.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: '600' }}>{ag.useCase}</span>
                  </div>
                  <span className="badge primary" style={{ fontSize: '0.7rem' }}>{ag.voice}</span>
                </div>

                <div style={{ background: '#0a0a12', padding: '0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', margin: '0.65rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  "{ag.script || ag.description || 'नमस्ते! मैं सुविधा एआई से बात कर रही हूँ। हमारे पास आपके लिए बेस्ट ऑफर्स हैं।'}"
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  <span className="badge warning">{ag.speed || '1.0x'}</span>
                  <span className="badge info">{ag.pitch || 'Warm'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                <Link 
                  href={`/campaigns?agentId=${ag.id}`}
                  className="btn btn-primary"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', fontWeight: '700' }}
                >
                  🚀 Use in Campaign
                </Link>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button 
                    onClick={() => handleEdit(ag)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.55rem' }}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(ag.id, ag.name)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.55rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
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
