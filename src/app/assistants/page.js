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
  const [script, setScript] = useState('नमस्का�?जी! मै�?Pooja, Shree Aangan Developer की तर�?से बा�?कर रही हूँ। आपने property से related information मे�?interest दिखाया था, उसी के regarding आपसे बा�?कर रही हूँ। क्या अभी 2 मिनट बा�?करना convenient रहेग�?');
  const [objections, setObjections] = useState('अग�?Customer बा�?करने के लि�?तैया�?है: "Thank you जी�?सबसे पहले मै�?आपकी requirement समझन�?चाहूँगी ताकि आपको आपकी ज़रूरत के हिसा�?से सही property option की जानकारी दी जा सके।" अग�?पूछे प्राइस कितन�?है तो बताए�?कि 45 ला�?से शुरू है�?);
  
  // Call Transfer to Admin / Senior Manager
  const [enableTransfer, setEnableTransfer] = useState(true);
  const [adminTransferNumber, setAdminTransferNumber] = useState('+918739904737');

  // Live Q&A Simulation State
  const [testQuestion, setTestQuestion] = useState('kon si property hai apke pass');
  const [testAnswer, setTestAnswer] = useState('');
  const [simulating, setSimulating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  
  // Modal Popup State (For Save Confirmation & Errors)
  const [saveModal, setSaveModal] = useState(null); // { type: 'success'|'error', title: '', message: '' }

  const voiceLibrary = [
    { id: 'pooja', name: '👩 Pooja', title: 'Warm Sales Closer', gender: 'Female', desc: 'मीठी, विनम्र और भरोसेमंद आवाज (बो�?रही हू�?' },
    { id: 'aarav', name: '👨 Aarav', title: 'Finance & Loan Specialist', gender: 'Male', desc: 'कॉन्फिडेंट और प्रोफेशन�?आवाज (बो�?रह�?हू�?' },
    { id: 'swara', name: '👩 Swara', title: 'Luxury Consultant', gender: 'Female', desc: 'सॉफ्�?और प्रीमियम रियल एस्टेट एडवाइज�? },
    { id: 'madhur', name: '👨 Madhur', title: 'Corporate B2B Executive', gender: 'Male', desc: 'कॉर्पोरे�?और बिजनेस डील्�?के लि�?बेस्�? },
    { id: 'ananya', name: '👩 Ananya', title: 'Customer Support Lead', gender: 'Female', desc: 'मॉडर्न, ते�?और दोस्ताना हिंग्लिश आवाज' },
    { id: 'rohan', name: '👨 Rohan', title: 'Senior Sales Director', gender: 'Male', desc: 'गंभी�?और असरदार आवाज' },
  ];

  useEffect(() => {
    setAgents(store.getAgents());
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';
      const savedAdmin = localStorage.getItem(`adminNumber_${uid}`) || localStorage.getItem('adminNumber');
      if (savedAdmin) setAdminTransferNumber(savedAdmin);
    }
  }, []);

  const playVoiceSample = async (voiceId, customText) => {
    try {
      setPlayingVoiceId(voiceId);
      const vObj = voiceLibrary.find(v => v.id === voiceId) || voiceLibrary[0];
      const isMale = vObj.gender === 'Male';
      const personaName = vObj.name.replace(/[^a-zA-Z]/g, '');

      const sampleText = customText || (isMale 
        ? `नमस्ते! मै�?${personaName} बो�?रह�?हूँ। हमार�?पा�?आपके लि�?बेस्�?बिजनेस ऑफर्�?हैं। बताइ�? आज मै�?आपकी क्या सहायता करूँ?`
        : `नमस्ते! मै�?${personaName} बो�?रही हूँ। हमार�?पा�?आपके लि�?बेस्�?बिजनेस ऑफर्�?हैं। बताइ�? आज मै�?आपकी क्या सहायता करूँ?`);

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
    if (!testQuestion.trim()) {
      setSaveModal({ type: 'error', title: 'सवाल लिखे�?, message: 'कृपय�?कस्टमर का को�?सवाल लिखे�?जैसे "kon si property hai" ya "price kitna hai"!' });
      return;
    }
    setSimulating(true);
    setTestAnswer('');

    const lower = testQuestion.toLowerCase();
    const isTransferReq = lower.includes('senior') || lower.includes('manager') || lower.includes('admin') || lower.includes('human') || lower.includes('insaan') || lower.includes('transfer') || lower.includes('baat karao');

    if (enableTransfer && isTransferReq) {
      const vObj = voiceLibrary.find(v => v.id === selectedVoice) || voiceLibrary[0];
      const reply = vObj.gender === 'Male'
        ? `जी बिल्कु�?सर! मै�?आपकी कॉ�?तुरं�?हमार�?सीनियर मैनेजर (${adminTransferNumber}) को ट्रांसफर कर रह�?हूँ। कृपय�?लाइन पर बन�?रहें!`
        : `जी बिल्कु�?सर! मै�?आपकी कॉ�?तुरं�?हमार�?सीनियर मैनेजर (${adminTransferNumber}) को ट्रांसफर कर रही हूँ। कृपय�?लाइन पर बन�?रहें!`;
      
      setTestAnswer(reply);
      setSimulating(false);
      await playVoiceSample(selectedVoice, reply);
      return;
    }

    try {
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
      const reply = data.reply || 'जी बिल्कु�? मै�?आपको पूरी जानकारी व्हाट्सए�?कर रही हू�?';
      setTestAnswer(reply);
      setSimulating(false);

      await playVoiceSample(selectedVoice, reply);
    } catch (e) {
      console.error('LLM Simulation Error:', e);
      setSimulating(false);
    }
  };

  // SAVE VOICE AGENT HANDLER WITH HIGH-VISIBILITY POPUP
  const handleSaveAgent = (e) => {
    if (e) e.preventDefault();

    if (!agentName.trim()) {
      setSaveModal({ type: 'error', title: 'ना�?जरूरी है', message: 'कृपय�?अपने वॉइस एजें�?का ना�?लिखे�?' });
      return;
    }

    if (!script.trim()) {
      setSaveModal({ type: 'error', title: 'स्क्रिप्�?जरूरी है', message: 'कृपय�?AI के बोलन�?की शुरुआती स्क्रिप्�?लिखे�?' });
      return;
    }

    try {
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
        enableTransfer,
        adminTransferNumber: adminTransferNumber.trim(),
        callType,
        useCase: useCase.trim() || 'Sales',
        script: script.trim(),
        objections: objections.trim()
      };

      if (editingId) {
        store.updateAgent(editingId, agentData);
        setSaveModal({
          type: 'success',
          title: '�?वॉइस एजें�?अपडे�?हो गय�?',
          message: `वॉइस एजें�?"${agentName}" की सभी सेटिंग्स और स्क्रिप्�?सुरक्षित रू�?से से�?हो गई हैं।`
        });
        setEditingId(null);
      } else {
        store.addAgent(agentData);
        setSaveModal({
          type: 'success',
          title: '🎉 नय�?वॉइस एजें�?से�?हो गय�?',
          message: `वॉइस एजें�?"${agentName}" सफलतापूर्व�?से�?हो गय�?है�?अब आप Campaigns मे�?जाकर इससे कॉलिंग शुरू कर सकते है�?`
        });
      }

      setAgents(store.getAgents());
    } catch (err) {
      setSaveModal({
        type: 'error',
        title: '�?से�?करने मे�?त्रुटि',
        message: 'त्रुटि: ' + err.message
      });
    }
  };

  const handleEdit = (agent) => {
    setEditingId(agent.id);
    setAgentName(agent.name);
    setSelectedVoice(agent.voiceId || 'pooja');
    setSpeed(agent.speed || '1.0x (Normal)');
    setPitch(agent.pitch || 'Warm & Friendly');
    setBargeIn(agent.bargeIn !== false);
    setEnableTransfer(agent.enableTransfer !== false);
    setAdminTransferNumber(agent.adminTransferNumber || '+918739904737');
    setCallType(agent.callType || 'Outbound (AI calls leads)');
    setUseCase(agent.useCase || '');
    setScript(agent.script || agent.description || '');
    setObjections(agent.objections || '');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleDelete = (id, name) => {
    if (confirm(`क्या आप सच मे�?Voice Agent "${name}" को डिली�?करना चाहत�?है�?`)) {
      store.deleteAgent(id);
      setAgents(store.getAgents());
      if (editingId === id) setEditingId(null);
      setSaveModal({
        type: 'success',
        title: '🗑�?डिली�?कर दिया गय�?,
        message: `वॉइस एजें�?"${name}" को हट�?दिया गय�?है।`
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAgentName('Pooja - Real Estate Closer');
    setSelectedVoice('pooja');
    setScript('नमस्का�?जी! मै�?Pooja, Shree Aangan Developer की तर�?से बा�?कर रही हूँ।');
  };

  return (
    <div style={{ maxWidth: '1050px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>🤖 Voice Agent Studio (LLM Powered)</h1>
          <p className="subtitle">सर�?और आसान तरीके से अपना AI कॉलिंग एजें�?बनाए�?�?AI आपके लिखे हु�?स्क्रिप्�?और नियमों के अनुसार ही बा�?करेग�?/p>
        </div>

        <Link href="/campaigns" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          🚀 Bulk Campaigns मे�?जाएं &rarr;
        </Link>
      </div>

      {/* POPUP MODAL FOR SAVE CONFIRMATION & ERRORS */}
      {saveModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center', padding: '2rem', background: '#12121c', border: `1px solid ${saveModal.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}` }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
              {saveModal.type === 'success' ? '🎉' : '⚠️'}
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem', color: saveModal.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {saveModal.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              {saveModal.message}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {saveModal.type === 'success' && (
                <Link href="/campaigns" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>
                  🚀 Go to Campaigns
                </Link>
              )}
              <button 
                onClick={() => setSaveModal(null)} 
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
              >
                {saveModal.type === 'success' ? 'Got It' : 'ठी�?है'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Voice Selection */}
      <div className="mb-8">
        <h2 style={{ fontSize: '1.15rem', marginBottom: '0.85rem' }}>🎧 Step 1: एजें�?की आवाज चुने�?(Male / Female)</h2>
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
                    {isPlaying ? '🔊 आवाज बज रही है...' : '🔊 आवाज सुनक�?देखे�?}
                  </button>
                  {isSelected && <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>�?चुनी हु�?/span>}
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
              {editingId ? '✏️ एजें�?एडिट करें' : '⚙️ Step 2: एजें�?का ना�?और बोलन�?की स्क्रिप्�?लिखे�?}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', margin: '0.25rem 0 0' }}>
              यह वही स्क्रिप्�?और बिजनेस डिटेल्�?है�?जिनक�?अनुसार AI LLM कस्टमर के हर सवाल का जवाब देगा�?            </p>
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
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>1. एजें�?का ना�?लिखे�?(Voice Agent Custom Name)</label>
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
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>2. का�?/ बिजनेस (Industry & Company Name)</label>
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
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>3. बोलन�?की स्पी�?/label>
              <select className="form-control" value={speed} onChange={e => setSpeed(e.target.value)}>
                <option value="0.8x (Slow & Clear)">🐢 0.8x (धीमी और सा�?आवाज)</option>
                <option value="1.0x (Normal)">�?1.0x (सामान्�?स्पी�?- बेस्�?</option>
                <option value="1.2x (Fast & Energetic)">🚀 1.2x (ते�?और एनर्जेटि�?</option>
              </select>
            </div>

            {/* Voice Tone & Pitch */}
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>4. बोलन�?का तरीका (Tone)</label>
              <select className="form-control" value={pitch} onChange={e => setPitch(e.target.value)}>
                <option value="Warm & Friendly">🌸 दोस्ताना और मीठी आवाज (Warm & Friendly)</option>
                <option value="Professional & Trustworthy">👔 प्रोफेशन�?और गंभी�?(Corporate & Banking)</option>
                <option value="Confident & High-Energy">🔥 जोशीली और कॉन्फिडेंट आवाज</option>
              </select>
            </div>

          </div>

          {/* Interruption / Barge-in Notice */}
          <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.25)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.825rem', color: '#fff' }}>
              🎙�?<strong>कस्टमर के बोलत�?ही AI चु�?हो जाएग�?</strong> जैसे ही कस्टमर सवाल पूछेगा, AI रु�?कर जवाब देगा�?            </div>
            <span className="badge success" style={{ fontSize: '0.72rem' }}>सक्रिय (Active)</span>
          </div>

          {/* CALL TRANSFER TO ADMIN / SENIOR MANAGER */}
          <div style={{ background: '#0a0a14', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '1.5rem' }}>
            <div className="flex justify-between items-center mb-2">
              <div style={{ fontWeight: '700', fontSize: '0.925rem', color: 'var(--accent-blue)' }}>
                📞 5. Live Call Transfer to Admin / Senior Manager (कॉ�?ट्रांसफर)
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                <input type="checkbox" checked={enableTransfer} onChange={e => setEnableTransfer(e.target.checked)} />
                सक्रिय (Active)
              </label>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
              जब कस्टमर बोलेगा <em>"सीनियर/मैनेजर से बा�?कराओ"</em> ya <em>"कस्टमर केयर ट्रांसफर कर�?</em>, तो AI तुरं�?कॉ�?इस नंबर पर ट्रांसफर कर देगा:
            </p>

            <div className="form-group" style={{ maxWidth: '350px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: '600' }}>Admin Mobile Number (+91)</label>
              <input 
                type="text" 
                className="form-control" 
                value={adminTransferNumber} 
                onChange={e => setAdminTransferNumber(e.target.value)} 
                placeholder="e.g. +91 8739904737" 
              />
            </div>
          </div>

          {/* Custom Call Script */}
          <div className="form-group mb-4">
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              6. AI क्या बोलेगा (Opening Call Script) <span style={{ color: 'var(--accent-green)' }}>*</span>
            </label>
            <textarea 
              required
              rows="3"
              className="form-control" 
              value={script}
              onChange={e => setScript(e.target.value)} 
              placeholder="नमस्ते सर! मै�?पूजा बो�?रही हू�?श्री आँगन डेवलपर से..." 
              style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
            />
          </div>

          {/* Objection Handling */}
          <div className="form-group mb-6">
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              7. कस्टमर के सवालों के जवाब (FAQ / Objection Rules)
            </label>
            <textarea 
              rows="3"
              className="form-control" 
              value={objections}
              onChange={e => setObjections(e.target.value)} 
              placeholder="अग�?कस्टमर पूछे डिस्काउं�?कितन�?है... अग�?बोले बा�?मे�?कॉ�?कर�?.." 
              style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
            />
          </div>

          {/* LIVE LLM Q&A TEST SIMULATOR */}
          <div style={{ background: '#0a0a14', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', marginBottom: '1.75rem' }}>
            <div className="flex justify-between items-center mb-2">
              <div style={{ fontWeight: '700', color: 'var(--accent-purple)', fontSize: '0.9rem' }}>
                🧠 Step 3: लाइव AI जवाब �?कॉ�?ट्रांसफर टेस्�?करें:
              </div>
              <span className="badge primary" style={{ fontSize: '0.68rem' }}>Intelligent AI Active</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              ऊप�?आपके लिखे हु�?स्क्रिप्�? कंपनी डिटेल्�?(e.g. <em>"kon si property hai"</em>) या कॉ�?ट्रांसफर टेस्�?करें:
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <input 
                type="text" 
                className="form-control" 
                value={testQuestion} 
                onChange={e => setTestQuestion(e.target.value)} 
                placeholder="कस्टमर का सवाल लिखे�?e.g. kon si property hai ya price kitna hai" 
              />
              <button 
                type="button" 
                onClick={handleTestAgentQuestion}
                disabled={simulating}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', flexShrink: 0, fontWeight: '700', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
              >
                {simulating ? '🧠 AI सो�?रह�?है...' : '🔊 टेस्�?करें और सुने�?}
              </button>
            </div>

            {testAnswer && (
              <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.3)', fontSize: '0.825rem' }}>
                <strong style={{ color: 'var(--accent-purple)', display: 'block', marginBottom: '2px' }}>
                  🤖 AI एजें�?का जवाब:
                </strong>
                <span style={{ color: '#fff', lineHeight: '1.4' }}>"{testAnswer}"</span>
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={handleSaveAgent}
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '0.9rem', 
              fontWeight: '700', 
              fontSize: '1.05rem', 
              background: 'linear-gradient(135deg, #10b981, #059669)', 
              border: 'none', 
              boxShadow: '0 0 20px rgba(16,185,129,0.3)',
              cursor: 'pointer'
            }}
          >
            {editingId ? '💾 एजें�?अपडे�?करें' : '🚀 एजें�?को सुरक्षित से�?करें (Save Agent)'}
          </button>
        </form>
      </div>

      {/* Saved Agents List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>
            से�?कि�?हु�?Voice Agents ({agents.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            पे�?रिफ्रे�?करने पर भी यह से�?रहेंगे�?          </span>
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
                  "{ag.script || ag.description || 'नमस्ते! मै�?सुविधा एआ�?से बा�?कर रही हूँ। हमार�?पा�?आपके लि�?बेस्�?ऑफर्�?हैं।'}"
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  <span className="badge warning">{ag.speed || '1.0x'}</span>
                  <span className="badge info">{ag.pitch || 'Warm'}</span>
                  {ag.adminTransferNumber && <span className="badge success">Transfer: {ag.adminTransferNumber}</span>}
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
                    🗑�?Delete
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
