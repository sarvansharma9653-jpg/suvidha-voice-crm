'use client';
import { useEffect, useState } from 'react';
import { store } from '@/lib/store';
import Link from 'next/link';

export default function VoiceAgentStudioPage() {
  const [agents, setAgents] = useState([]);

  // Voice Studio Form Fields
  const [agentName, setAgentName] = useState('Pooja — Shree Aangan Investment Advisor');
  const [selectedVoice, setSelectedVoice] = useState('pooja');
  const [speed, setSpeed] = useState('1.0x (Normal)');
  const [pitch, setPitch] = useState('Warm & Friendly');
  const [bargeIn, setBargeIn] = useState(true);
  const [callType, setCallType] = useState('Outbound (AI calls leads)');
  const [useCase, setUseCase] = useState('The Shree Aangan Developers — Jaipur Real Estate');
  
  const defaultScript = "नमस्कार जी! मैं Pooja बोल रही हूँ, The Shree Aangan Developers की तरफ से।\n\nजी, मैं आपको एक बहुत ही महत्वपूर्ण जानकारी देने के लिए Call कर रही हूँ।\n\nआपने जयपुर में Property Investment या घर लेने के बारे में सोचा होगा — तो आज मैं आपको Jaipur का सबसे बड़ा Golden Opportunity बताने वाली हूँ।\n\nChaksu, Tonk Road पर हमारा 85 Acres का JDA Approved और RERA Registered Gated Township प्रोजेक्ट है — जहाँ Property की कीमतें हर साल 18 से 25 प्रतिशत बढ़ रही हैं!\n\nऔर सबसे बड़ी बात — Jaipur Metro Phase 2 की नींव July 2026 में रख दी गई है! जब Metro आएगी, तो यहाँ की Property की कीमतें 40 से 60 प्रतिशत तक और बढ़ जाएंगी।\n\nयह Last Chance है सही Price में लेने का — क्या आप इस Weekend हमारी Site Visit के लिए आ सकते हैं? हम आपको सब कुछ खुद दिखाएंगे!";
  const defaultObjections = "अगर Customer पूछे \"Price kya hai\" / \"Rate kya hai\":\nजी, हमारे JDA Approved Plots ₹800 से ₹2,750 प्रति वर्ग फुट के बीच उपलब्ध हैं — EMI Facility के साथ। और अभी जो कीमत है, 3 साल बाद यह Double हो जाएगी क्योंकि Jaipur Metro Phase 2 Tonk Road पर आ रही है। Complete Price List अभी व्हाट्सएप कर रही हूँ!\n\nअगर Customer पूछे \"Location kahan hai\" / \"Kitna door hai\":\nजी, प्रोजेक्ट Chaksu, Tonk Road पर है — Jaipur से सिर्फ 25-30 km की दूरी पर NH-12 Jaipur-Kota Highway पर। Jaipur Outer Ring Road से बिल्कुल Connected है। Sheetla Mata Mandir और Bombay Hospital के पास। Google Maps Location अभी आपके व्हाट्सएप पर भेज रही हूँ।\n\nअगर Customer पूछे \"Grow karega kya\" / \"Return milega?\" :\nजी बिल्कुल! Chaksu में इस साल Property 18-25% बढ़ी है। Jaipur Metro Phase 2 का काम शुरू हो गया है — Metro आने पर Property 40-60% और बढ़ेगी। Delhi-Mumbai Industrial Corridor (DMIC) का 39% हिस्सा Rajasthan से जाता है — इसके Influence Zone में हैं हम! यह Jaipur का Next Booming Zone है।\n\nअगर Customer पूछे \"Iska RERA Number kya hai\" / \"Legal hai?\":\nजी बिल्कुल Legal है! हमारा RERA Registration Number है RAJ/P/2026/4660 — Rajasthan RERA पर Verify कर सकते हैं। JDA Approved Project है। पूरा Documentation 100% Clear है।\n\nअगर Customer पूछे \"Koi Guarantee?\" / \"Trustworthy hai?\":\nजी, The Shree Aangan एक Trusted Developer है। RERA Approved, JDA Approved, 85 Acres का Gated Township, 1500+ Satisfied Customers। आप हमारे Instagram @shreeaangandevelopers पर Photos और Projects देख सकते हैं।\n\nअगर Customer पूछे \"Mujhe zaroorat nahi\" / \"Baad mein sochenge\":\nSir, मैं समझती हूँ। लेकिन Metro Phase 2 का काम शुरू हो गया है — जैसे ही Metro आती है, आज की Price में नहीं मिलेगा। Limited Plots बचे हैं। एक बार बिना किसी Commitment के साइट देखें — पसंद आए तो आगे बात करें। क्या Saturday या Sunday Convenient रहेगा?\n\nअगर Customer पूछे \"Brochure bhejo\" / \"Details chahiye\":\nजी बिल्कुल! Complete Brochure, Plot Map, RERA Details, Floor Plan, Pricing, और Google Maps Location — सब कुछ अभी आपके व्हाट्सएप पर भेज रही हूँ। Site Visit की एक Free Slot भी Book कर देती हूँ!\n\nअगर Customer कहे \"Interested hoon\" / \"Sahi lagta hai\":\nअरे बहुत बढ़िया! आपके लिए Best Plot Reserve कर देती हूँ — Site Visit पर आकर चुन लीजिए। Brochure अभी WhatsApp पर आ रहा है!\n\nअगर Customer कहे \"Baad mein call karo\" / \"Busy hoon\":\nजी ज़रूर! कब Convenient रहेगा — क्या कल सुबह 10 बजे Call करूँ? तब तक मैं पूरी Details और Video Tour WhatsApp पर भेज देती हूँ।";

  const [script, setScript] = useState(defaultScript);
  const [objections, setObjections] = useState(defaultObjections);
  
  // Call Transfer to Admin / Senior Manager
  const [enableTransfer, setEnableTransfer] = useState(true);
  const [adminTransferNumber, setAdminTransferNumber] = useState('+918739904737');

  // ElevenLabs Key in Studio
  const [elevenLabsKey, setElevenLabsKey] = useState('');

  // Live Q&A Simulation State
  const [testQuestion, setTestQuestion] = useState('price kitna hai aur location kahan hai');
  const [testAnswer, setTestAnswer] = useState('');
  const [simulating, setSimulating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  
  // Modal Popup State (For Save Confirmation & Errors)
  const [saveModal, setSaveModal] = useState(null);

  const voiceLibrary = [
    { id: 'pooja', name: '👩 Pooja', title: 'Warm Sales Closer', gender: 'Female', desc: 'मीठी, विनम्र और भरोसेमंद आवाज (बोल रही हूँ)' },
    { id: 'aarav', name: '👨 Aarav', title: 'Finance & Loan Specialist', gender: 'Male', desc: 'कॉन्फिडेंट और प्रोफेशनल आवाज (बोल रहा हूँ)' },
    { id: 'swara', name: '👩 Swara', title: 'Luxury Consultant', gender: 'Female', desc: 'सॉफ्ट और प्रीमियम रियल एस्टेट एडवाइजर' },
    { id: 'madhur', name: '👨 Madhur', title: 'Corporate B2B Executive', gender: 'Male', desc: 'कॉर्पोरेट और बिजनेस डील्स के लिए बेस्ट' },
    { id: 'ananya', name: '👩 Ananya', title: 'Customer Support Lead', gender: 'Female', desc: 'मॉडर्न, तेज और दोस्ताना हिंग्लिश आवाज' },
    { id: 'rohan', name: '👨 Rohan', title: 'Senior Sales Director', gender: 'Male', desc: 'गंभीर और असरदार आवाज' },
  ];

  useEffect(() => {
    const loadedAgents = store.getAgents();
    setAgents(loadedAgents);

    const shreeAgent = loadedAgents.find(a => a.id === 'ag_pooja' || a.name?.includes('Shree Aangan'));
    if (!editingId) {
      setAgentName('Pooja — Shree Aangan Investment Advisor');
      setSelectedVoice(shreeAgent?.voiceId || 'pooja');
      setScript(defaultScript);
      setObjections(defaultObjections);
      setUseCase('The Shree Aangan Developers — Jaipur Real Estate');
      if (shreeAgent?.adminTransferNumber) setAdminTransferNumber(shreeAgent.adminTransferNumber);
    }

    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';
      const savedAdmin = localStorage.getItem(`adminNumber_${uid}`) || localStorage.getItem('adminNumber');
      if (savedAdmin) setAdminTransferNumber(savedAdmin);
      const savedKey = localStorage.getItem(`elevenLabsApiKey_${uid}`) || localStorage.getItem('elevenLabsApiKey') || '';
      setElevenLabsKey(savedKey);
    }
  }, []);

  const loadShreeAanganPreset = () => {
    setEditingId(null);
    setAgentName('Pooja - Shree Aangan Real Estate Closer');
    setSelectedVoice('pooja');
    setSpeed('1.0x (Normal)');
    setPitch('Warm & Friendly');
    setBargeIn(true);
    setEnableTransfer(true);
    setAdminTransferNumber('+918739904737');
    setUseCase('Real Estate & Property Investment');
    setScript(defaultScript);
    setObjections(defaultObjections);

    const poojaAgent = {
      id: 'ag_pooja',
      name: 'Pooja - Shree Aangan Real Estate Closer',
      voiceId: 'pooja',
      voice: '👩 Pooja (Warm Sales Closer)',
      gender: 'Female',
      speed: '1.0x (Normal)',
      pitch: 'Warm & Friendly',
      bargeIn: true,
      callType: 'Outbound (AI calls leads)',
      useCase: 'Real Estate & Property Investment',
      script: defaultScript,
      objections: defaultObjections,
      adminTransferNumber: '+918739904737',
      enableTransfer: true
    };
    store.addAgent(poojaAgent);
    setAgents(store.getAgents());

    setSaveModal({
      type: 'success',
      title: '🎉 Shree Aangan Setup Loaded & Saved!',
      message: 'Shree Aangan Developers (Jaipur Metro Site Visit Script + 85 Acres JDA & RERA Rules + Admin Transfer) form mein load aur save ho gaya hai!'
    });
  };

  const playVoiceSample = async (voiceId, customText) => {
    try {
      setPlayingVoiceId(voiceId);
      const vObj = voiceLibrary.find(v => v.id === voiceId) || voiceLibrary[0];
      const isMale = vObj.gender === 'Male';
      const personaName = vObj.name.replace(/[^a-zA-Z]/g, '');

      const sampleText = customText || (isMale 
        ? `नमस्ते! मैं ${personaName} बोल रहा हूँ, The Shree Aangan Developers की तरफ से। बताइये आज मैं आपकी क्या सहायता करूँ?`
        : `नमस्ते! मैं ${personaName} बोल रही हूँ, The Shree Aangan Developers की तरफ से। बताइये आज मैं आपकी क्या सहायता करूँ?`);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: sampleText, 
          gender: vObj.gender, 
          voice: voiceId,
          elevenLabsApiKey: elevenLabsKey 
        })
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
      setSaveModal({ type: 'error', title: 'सवाल लिखें', message: 'कृपया कस्टमर का कोई सवाल लिखें जैसे "price kitna hai" या "location kahan hai"!' });
      return;
    }
    setSimulating(true);
    setTestAnswer('');

    const lower = testQuestion.toLowerCase();
    const isTransferReq = lower.includes('senior') || lower.includes('manager') || lower.includes('admin') || lower.includes('human') || lower.includes('insaan') || lower.includes('transfer') || lower.includes('baat karao');

    if (enableTransfer && isTransferReq) {
      const vObj = voiceLibrary.find(v => v.id === selectedVoice) || voiceLibrary[0];
      const reply = vObj.gender === 'Male'
        ? `जी बिल्कुल सर! मैं आपकी कॉल तुरंत हमारे सीनियर मैनेजर (${adminTransferNumber}) को ट्रांसफर कर रहा हूँ। कृपया लाइन पर बने रहें!`
        : `जी बिल्कुल सर! मैं आपकी कॉल तुरंत हमारे सीनियर मैनेजर (${adminTransferNumber}) को ट्रांसफर कर रही हूँ। कृपया लाइन पर बने रहें!`;
      
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
      const reply = data.reply || 'जी बिल्कुल, मैं आपको पूरी जानकारी व्हाट्सएप कर रही हूँ।';
      setTestAnswer(reply);
      setSimulating(false);

      await playVoiceSample(selectedVoice, reply);
    } catch (e) {
      console.error('LLM Simulation Error:', e);
      setSimulating(false);
    }
  };

  // SAVE VOICE AGENT HANDLER
  const handleSaveAgent = (e) => {
    if (e) e.preventDefault();

    if (!agentName.trim()) {
      setSaveModal({ type: 'error', title: 'नाम जरूरी है', message: 'कृपया अपने वॉइस एजेंट का नाम लिखें!' });
      return;
    }

    if (!script.trim()) {
      setSaveModal({ type: 'error', title: 'स्क्रिप्ट जरूरी है', message: 'कृपया AI के बोलने की शुरुआती स्क्रिप्ट लिखें!' });
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
        useCase: useCase.trim() || 'Real Estate & Property Investment',
        script: script.trim(),
        objections: objections.trim()
      };

      if (editingId) {
        store.updateAgent(editingId, agentData);
        setSaveModal({
          type: 'success',
          title: '🎉 वॉइस एजेंट अपडेट हो गया!',
          message: `वॉइस एजेंट "${agentName}" की सभी सेटिंग्स और स्क्रिप्ट सुरक्षित रूप से सेव हो गई हैं।`
        });
        setEditingId(null);
      } else {
        store.addAgent(agentData);
        setSaveModal({
          type: 'success',
          title: '🎉 नया वॉइस एजेंट सेव हो गया!',
          message: `वॉइस एजेंट "${agentName}" सफलतापूर्वक सेव हो गया है! अब आप Campaigns में जाकर इससे कॉलिंग शुरू कर सकते हैं।`
        });
      }

      setAgents(store.getAgents());
    } catch (err) {
      setSaveModal({
        type: 'error',
        title: '⚠️ सेव करने में त्रुटि',
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
    if (confirm(`क्या आप सच में Voice Agent "${name}" को डिलीट करना चाहते हैं?`)) {
      store.deleteAgent(id);
      setAgents(store.getAgents());
      if (editingId === id) setEditingId(null);
      setSaveModal({
        type: 'success',
        title: '🗑️ डिलीट कर दिया गया',
        message: `वॉइस एजेंट "${name}" को हटा दिया गया है।`
      });
    }
  };

  return (
    <div style={{ maxWidth: '1050px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>🤖 Voice Agent Studio (LLM Powered)</h1>
          <p className="subtitle">सरल और आसान तरीके से अपना AI कॉलिंग एजेंट बनाएं — AI आपके लिखे हुए स्क्रिप्ट और नियमों के अनुसार ही बात करेगा</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            onClick={loadShreeAanganPreset}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', borderColor: 'var(--accent-green)', color: 'var(--accent-green)', fontWeight: 'bold' }}
          >
            ✨ Load Shree Aangan Preset
          </button>
          <Link href="/campaigns" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            🚀 Bulk Campaigns में जाएं &rarr;
          </Link>
        </div>
      </div>

      {/* POPUP MODAL FOR SAVE CONFIRMATION & ERRORS */}
      {saveModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center', padding: '2rem', background: '#12121c', border: `1px solid ${saveModal.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}` }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
              {saveModal.type === 'success' ? '🎉' : '⚠️'}
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: saveModal.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {saveModal.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
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
                {saveModal.type === 'success' ? 'Got It' : 'ठीक है'}
              </button>
            </div>
          </div>
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
                  {isSelected && <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>✅ चुनी हुई</span>}
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
          <button 
            type="button" 
            onClick={loadShreeAanganPreset}
            className="btn btn-secondary" 
            style={{ fontSize: '0.8rem', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}
          >
            ✨ 1-Click Fill Shree Aangan
          </button>
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

          {/* CALL TRANSFER TO ADMIN / SENIOR MANAGER */}
          <div style={{ background: '#0a0a14', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '1.5rem' }}>
            <div className="flex justify-between items-center mb-2">
              <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                📞 5. Live Call Transfer to Admin / Senior Manager
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={enableTransfer} 
                  onChange={e => setEnableTransfer(e.target.checked)} 
                />
                ट्रांसफर चालू रखें (Enabled)
              </label>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
              जब कस्टमर कॉल पर कहेगा <em>"सीनियर से बात कराओ"</em>, <em>"मैनेजर से बात करनी है"</em> या <em>"एडमिन को ट्रांसफर करो"</em>, तो AI कॉल को आपके इस एडमिन नंबर पर ट्रांसफर कर देगा:
            </p>
            <div className="form-group" style={{ margin: 0, maxWidth: '400px' }}>
              <input 
                type="text" 
                className="form-control" 
                value={adminTransferNumber}
                onChange={e => setAdminTransferNumber(e.target.value)}
                placeholder="e.g. +91 8739904737" 
                style={{ borderColor: 'var(--accent-blue)', fontWeight: 'bold', letterSpacing: '0.5px' }}
              />
            </div>
          </div>

          {/* Opening Dialogue Script (Hindi / Hinglish) */}
          <div className="form-group mb-4">
            <div className="flex justify-between items-center mb-1">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                6. AI कॉल उठाते ही सबसे पहले क्या बोलेगा? (Opening Call Script in Hindi/Hinglish)
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {script.length} अक्षर
              </span>
            </div>
            <textarea 
              required
              rows={4} 
              className="form-control" 
              value={script}
              onChange={e => setScript(e.target.value)} 
              placeholder="e.g. नमस्कार जी! मैं Pooja बोल रही हूँ, The Shree Aangan Developers की तरफ से..."
              style={{ lineHeight: '1.5', fontFamily: 'inherit' }}
            />
          </div>

          {/* Intelligent FAQ & Objection Handling Rules */}
          <div className="form-group mb-6">
            <div className="flex justify-between items-center mb-1">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                7. कस्टमर के सवालों के जवाब के नियम (FAQ & Objection Handling Rules)
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>
                🧠 LLM Dynamic Reasoner Active
              </span>
            </div>
            <textarea 
              rows={6} 
              className="form-control" 
              value={objections}
              onChange={e => setObjections(e.target.value)} 
              placeholder="e.g. अगर पूछे प्राइस कितना है तो बताएं कि JDA Approved Plots ₹800 से शुरू हैं..."
              style={{ lineHeight: '1.5', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              type="button" 
              onClick={handleSaveAgent}
              className="btn btn-primary" 
              style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', fontWeight: '700' }}
            >
              {editingId ? '💾 अपडेट सेव करें (Update Agent)' : '🎉 यह वॉइस एजेंट सेव करें (Save Agent)'}
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              ✅ सेव करने पर यह एजेंट Campaigns में उपलब्ध हो जाएगा
            </span>
          </div>
        </form>
      </div>

      {/* Step 3: Real LLM Intelligent Q&A Simulation */}
      <div className="card mb-8" style={{ padding: '2rem', background: '#0a0a14', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>
          🧪 Step 3: लाइव AI टेस्ट करें (Test Script & Objection Rules)
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
          कोई भी सवाल पूछकर देखें — AI आपकी ऊपर लिखी हुई Shree Aangan स्क्रिप्ट और नियमों के आधार पर बिल्कुल इंसान की तरह जवाब देगा:
        </p>

        <div className="form-group mb-3">
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input 
              type="text" 
              className="form-control" 
              value={testQuestion}
              onChange={e => setTestQuestion(e.target.value)}
              placeholder="e.g. price kitna hai ya metro kab tak aayegi"
              onKeyDown={e => { if (e.key === 'Enter') handleTestAgentQuestion(); }}
              style={{ flex: 1 }}
            />
            <button 
              type="button"
              onClick={handleTestAgentQuestion} 
              disabled={simulating}
              className="btn btn-primary"
              style={{ padding: '0 1.5rem', whiteSpace: 'nowrap' }}
            >
              {simulating ? '⏳ सोच रहा है...' : '🎙️ पूछें और जवाब सुनें'}
            </button>
          </div>
        </div>

        {testAnswer && (
          <div style={{ background: '#12121c', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--accent-green)', marginTop: '1rem' }}>
            <div className="flex justify-between items-center mb-2">
              <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-green)' }}>
                🤖 AI Agent Reply:
              </span>
              <button 
                type="button"
                onClick={() => playVoiceSample(selectedVoice, testAnswer)} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
              >
                🔊 फिर से सुनें
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#fff' }}>
              "{testAnswer}"
            </p>
          </div>
        )}
      </div>

      {/* Saved Voice Agents List */}
      <div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          📋 आपके सेव किए गए वॉइस एजेंट्स ({agents.length})
        </h2>

        {agents.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <p>अभी तक कोई कस्टम वॉइस एजेंट सेव नहीं हुआ है। ऊपर फॉर्म भरकर "यह वॉइस एजेंट सेव करें" पर क्लिक करें।</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {agents.map(ag => (
              <div key={ag.id} className="card" style={{ padding: '1.25rem', background: '#0e0e14', border: '1px solid var(--border-light)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--accent-green)' }}>
                    {ag.name}
                  </span>
                  <span className="badge primary">{ag.voiceId || 'pooja'}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <strong>बिजनेस:</strong> {ag.useCase || 'Real Estate'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  <strong>स्क्रिप्ट:</strong> "{ag.script}"
                </p>
                <div className="flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleEdit(ag)} 
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      ✏️ एडिट
                    </button>
                    <button 
                      onClick={() => handleDelete(ag.id, ag.name)} 
                      className="btn btn-danger" 
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      🗑️ डिलीट
                    </button>
                  </div>
                  <Link 
                    href={`/campaigns?agentId=${ag.id}`}
                    className="btn btn-primary" 
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                  >
                    🚀 Call with this Agent &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
