'use client';
import { useEffect, useState } from 'react';
import { store } from '@/lib/store';
import Link from 'next/link';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [agents, setAgents] = useState([]);

  // Campaign Creation Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    agentId: '',
    selectedLeadIds: []
  });

  // Auto-Dialer Engine State
  const [activeDialer, setActiveDialer] = useState(null);
  const [dialerProgress, setDialerProgress] = useState({ current: 0, total: 0, activeName: '' });
  const [callStatus, setCallStatus] = useState(null);

  useEffect(() => {
    const loadedCampaigns = store.getCampaigns();
    const loadedContacts = store.getContacts();
    const loadedAgents = store.getAgents();

    setCampaigns(loadedCampaigns);
    setContacts(loadedContacts);
    setAgents(loadedAgents);

    if (loadedAgents.length > 0) {
      setFormData(prev => ({
        ...prev,
        agentId: loadedAgents[0].id,
        selectedLeadIds: loadedContacts.map(c => c.id)
      }));
    }

    // Check if query params have ?agentId=...
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryAgentId = searchParams.get('agentId');
      if (queryAgentId) {
        setFormData(prev => ({ ...prev, agentId: queryAgentId }));
        setShowModal(true);
      }
    }
  }, []);

  // Toggle individual lead selection in modal
  const toggleLeadSelection = (id) => {
    setFormData(prev => {
      const exists = prev.selectedLeadIds.includes(id);
      return {
        ...prev,
        selectedLeadIds: exists ? prev.selectedLeadIds.filter(x => x !== id) : [...prev.selectedLeadIds, id]
      };
    });
  };

  const selectAllLeads = () => {
    setFormData(prev => ({ ...prev, selectedLeadIds: contacts.map(c => c.id) }));
  };

  const deselectAllLeads = () => {
    setFormData(prev => ({ ...prev, selectedLeadIds: [] }));
  };

  // Create Campaign (1 or more leads)
  const handleCreateCampaign = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a Campaign Name!');
      return;
    }

    if (!formData.agentId) {
      alert('Please select a Voice Agent!');
      return;
    }

    if (formData.selectedLeadIds.length === 0) {
      alert('Please select at least 1 lead to call!');
      return;
    }

    const selectedAg = agents.find(a => a.id === formData.agentId) || agents[0];

    const newCampaign = {
      name: formData.name.trim(),
      agentName: selectedAg?.name || 'Pooja (Closer)',
      script: selectedAg?.script || selectedAg?.description || 'नमस्ते! मै?सुविधा एआ?से बा?कर रही हूँ।',
      voice: selectedAg?.voiceId || 'pooja',
      selectedLeadIds: formData.selectedLeadIds,
      totalContacts: formData.selectedLeadIds.length,
      completedCalls: 0,
      successRate: 0,
      status: 'Ready'
    };

    store.addCampaign(newCampaign);
    setCampaigns(store.getCampaigns());
    setShowModal(false);
    setFormData({ 
      name: '', 
      agentId: agents.length > 0 ? agents[0].id : '', 
      selectedLeadIds: contacts.map(c => c.id) 
    });
  };

    // Launch Sequential Auto-Dialer Engine (Real Calls via Vobiz)
  const startAutoDialer = async (campaign) => {
    const selectedIds = campaign.selectedLeadIds || [];
    let leadList = contacts.filter(c => selectedIds.includes(c.id));

    if (leadList.length === 0) {
      leadList = contacts.length > 0 ? contacts : [{ id: '1', name: 'Lead', phone: '+918739904737' }];
    }

    const uid = typeof window !== 'undefined' ? (localStorage.getItem('suvidha_auth_user_id') || 'default') : 'default';
    const provider = typeof window !== 'undefined' ? (localStorage.getItem(`telephonyProvider_${uid}`) || localStorage.getItem('telephonyProvider') || 'vobiz') : 'vobiz';
    const vobizAuthId = typeof window !== 'undefined' ? (localStorage.getItem(`vobizAuthId_${uid}`) || localStorage.getItem('vobizAuthId') || 'MA_QTLGTSF9') : 'MA_QTLGTSF9';
    const vobizAuthToken = typeof window !== 'undefined' ? (localStorage.getItem(`vobizAuthToken_${uid}`) || localStorage.getItem('vobizAuthToken') || localStorage.getItem(`vobizApiKey_${uid}`) || localStorage.getItem('vobizApiKey') || '') : '';
    const vobizVirtualNumber = typeof window !== 'undefined' ? (localStorage.getItem(`vobizVirtualNumber_${uid}`) || localStorage.getItem('vobizVirtualNumber') || '+917965854263') : '+917965854263';
    const savedElevenKey = typeof window !== 'undefined' ? (localStorage.getItem(`elevenLabsApiKey_${uid}`) || localStorage.getItem('elevenLabsApiKey') || '') : '';

    // Validate credentials before dialing
    if (provider === 'vobiz' && !vobizAuthToken) {
      setCallStatus({
        type: 'error',
        message: '⚠️ Vobiz Auth Token missing! Please go to Telephony Settings, enter your Vobiz Auth Token, and click Save to make real phone calls.'
      });
      return;
    }

    setActiveDialer(campaign.id);
    setDialerProgress({ current: 0, total: leadList.length, activeName: leadList[0].name });

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < leadList.length; i++) {
      const lead = leadList[i];
      setDialerProgress({ current: i + 1, total: leadList.length, activeName: `${lead.name} (${lead.phone})` });
      
      try {
        console.log(`🚀 Initiating Real Call to Lead ${i + 1}/${leadList.length}: ${lead.name} (${lead.phone})...`);
        const res = await fetch('/api/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: lead.phone,
            contactName: lead.name,
            campaignId: campaign.id,
            script: campaign.script,
            systemPrompt: campaign.script,
            provider,
            vobizAuthId,
            vobizAuthToken,
            vobizVirtualNumber,
            callerNumber: vobizVirtualNumber,
            elevenLabsApiKey: savedElevenKey
          })
        });

        const data = await res.json();
        console.log(`Call dispatch response for ${lead.phone}:`, data);

        if (data.success) {
          successCount++;
          // Only dispatch WhatsApp and record active call on successful dispatch
          const savedWaTpl = typeof window !== 'undefined' ? (localStorage.getItem(`whatsappMessageTemplate_${uid}`) || localStorage.getItem('whatsappMessageTemplate') || '') : '';
          const savedBrochure = typeof window !== 'undefined' ? (localStorage.getItem(`brochureUrl_${uid}`) || localStorage.getItem('brochureUrl') || '') : '';
          
          try {
            await fetch('/api/whatsapp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: lead.phone,
                leadName: lead.name,
                message: savedWaTpl,
                brochureUrl: savedBrochure
              })
            });
          } catch (waErr) {}

          store.addCall({
            contactId: lead.id,
            contactName: lead.name,
            phone: lead.phone,
            callerNumber: vobizVirtualNumber,
            agentName: campaign.agentName || 'Pooja (Closer)',
            campaignId: campaign.name,
            duration: 45,
            status: 'Ringing / Dispatched',
            sentiment: '🔥 Hot Lead',
            stage: 'Called',
            recordingUrl: 'https://suvidha-voice-crm.vercel.app/audio/call_rec.mp3',
            summary: `Call dispatched to ${lead.name} (${lead.phone}) with ${campaign.agentName}. Telephony Call ID: ${data.callSid || 'live'}.`,
            transcript: `AI (${campaign.agentName}): ${campaign.script}`
          });

          store.updateContact(lead.id, { status: 'Called', stage: 'Called', lastCalled: new Date().toISOString().split('T')[0] });
        } else {
          failedCount++;
          store.addCall({
            contactId: lead.id,
            contactName: lead.name,
            phone: lead.phone,
            callerNumber: vobizVirtualNumber,
            agentName: campaign.agentName || 'Pooja (Closer)',
            campaignId: campaign.name,
            duration: 0,
            status: 'Failed',
            sentiment: '⚠️ Dispatch Failed',
            stage: 'Failed',
            recordingUrl: null,
            summary: `Call failed: ${data.error || data.message || 'Telephony provider rejected call'}`,
            transcript: 'Call could not be connected. Please verify telephony credentials in Settings.'
          });
        }
      } catch (e) {
        failedCount++;
        console.error('Dialer network error:', e);
      }

      // 3-second delay between calls
      if (i < leadList.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    store.updateCampaign(campaign.id, {
      completedCalls: leadList.length,
      successRate: leadList.length > 0 ? Math.round((successCount / leadList.length) * 100) : 0,
      status: 'Completed'
    });

    setCampaigns(store.getCampaigns());
    setContacts(store.getContacts());
    setActiveDialer(null);

    if (failedCount > 0 && successCount === 0) {
      setCallStatus({ 
        type: 'error', 
        message: `⚠️ Call could not connect! Please verify your Vobiz Auth Token in Settings.` 
      });
    } else {
      setCallStatus({ 
        type: 'success', 
        message: `🎉 Campaign completed: ${successCount} calls dispatched, ${failedCount} failed.` 
      });
    }
    setTimeout(() => setCallStatus(null), 7000);
  };

  const handleDeleteCampaign = (id, name) => {
    if (confirm(`Are you sure you want to delete campaign "${name}"?`)) {
      store.deleteCampaign(id);
      setCampaigns(store.getCampaigns());
    }
  };

  return (
    <div style={{ maxWidth: '1050px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>🎯 Outbound Calling Campaigns</h1>
          <p className="subtitle">Select your custom Voice Agent, choose 1 or multiple leads, and launch calling</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/assistants" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            🤖 Voice Agent Studio
          </Link>
          <Link href="/calls" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            🎙?Call Transcripts & Audio
          </Link>
          <button 
            onClick={() => setShowModal(true)} 
            className="btn btn-primary" 
            style={{ fontSize: '0.85rem', fontWeight: '700' }}
          >
            ?Create New Campaign
          </button>
        </div>
      </div>

      {callStatus && (
        <div className="card mb-6" style={{
          borderColor: callStatus.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
          padding: '1rem 1.5rem',
          background: callStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
        }}>
          {callStatus.message}
        </div>
      )}

      {/* Auto-Dialer Live Progress Bar */}
      {activeDialer && (
        <div className="card mb-6" style={{ background: '#0d1117', borderColor: 'var(--accent-blue)', padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <span style={{ fontWeight: '600', color: 'var(--accent-blue)' }}>
              ?Auto-Dialer Calling in Progress ({dialerProgress.current}/{dialerProgress.total})
            </span>
            <span className="badge warning">Calling: {dialerProgress.activeName}</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${(dialerProgress.current / dialerProgress.total) * 100}%`, height: '100%', background: 'var(--accent-blue)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
      )}

      {/* Campaigns Cards Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>
            Active Calling Campaigns ({campaigns.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            1 lead ho ya 100 leads, yahi se select karke call karein.
          </span>
        </div>

        {campaigns.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
            <h3 style={{ margin: '0 0 0.5rem' }}>No Campaigns Created Yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Create your first campaign, pick 1 or more leads, and start AI voice calling!
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              ?Create Your First Campaign
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {campaigns.map(camp => {
              const leadCount = camp.totalContacts || (camp.selectedLeadIds ? camp.selectedLeadIds.length : contacts.length);
              const isCalling = activeDialer === camp.id;

              return (
                <div className="card" key={camp.id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{camp.name}</h3>
                      <span className={`badge ${camp.status === 'Completed' ? 'success' : 'primary'}`}>
                        {camp.status || 'Ready'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.825rem', color: 'var(--accent-green)', fontWeight: '600', marginBottom: '0.65rem' }}>
                      🤖 Voice Agent: {camp.agentName || 'Pooja (Closer)'}
                    </div>

                    <div style={{ background: '#0a0a12', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1rem' }}>
                      "{camp.script}"
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <span>Selected Leads: <strong>{leadCount} {leadCount === 1 ? 'Person' : 'People'}</strong></span>
                      {camp.completedCalls > 0 && <span>Completed: {camp.completedCalls}</span>}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.5rem' }}>
                    <button 
                      onClick={() => startAutoDialer(camp)}
                      disabled={isCalling}
                      className={`btn ${isCalling ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', fontWeight: '700', borderRadius: '20px' }}
                    >
                      {isCalling ? '?Calling Now...' : (leadCount === 1 ? '📞 Call 1 Lead Now' : `🚀 Call All ${leadCount} Leads`)}
                    </button>

                    <button 
                      onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
                    >
                      🗑?Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CLEAN 3-STEP CAMPAIGN CREATION MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Create Calling Campaign</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleCreateCampaign}>
              {/* 1. Campaign Name */}
              <div className="form-group mb-4">
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>1. Campaign Name</label>
                <input 
                  required 
                  type="text" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g. Shree Aangan Property Leads" 
                />
              </div>

              {/* 2. Select Voice Agent */}
              <div className="form-group mb-4">
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>2. Select Voice Agent (Agent Ki Voice & Script Use Hogi)</label>
                <select 
                  required
                  className="form-control" 
                  value={formData.agentId} 
                  onChange={e => setFormData({ ...formData, agentId: e.target.value })}
                >
                  <option value="">-- Choose Created Voice Agent --</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.useCase})</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', marginTop: '3px', display: 'block' }}>
                  ?Agent ki saved script, voice aur rules automatically use honge.
                </span>
              </div>

              {/* 3. Individual Lead Checkboxes */}
              <div className="form-group mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                    3. Select Leads to Call ({formData.selectedLeadIds.length} Selected)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={selectAllLeads} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.75rem', cursor: 'pointer' }}>
                      Select All
                    </button>
                    <span style={{ color: 'var(--text-muted)' }}>|</span>
                    <button type="button" onClick={deselectAllLeads} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}>
                      Clear All
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: '220px', overflowY: 'auto', background: '#0a0a12', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.5rem' }}>
                  {contacts.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.75rem', textAlign: 'center' }}>
                      No leads found. Go to "Lead Lists & CSV" to add contacts.
                    </div>
                  ) : (
                    contacts.map(c => {
                      const isChecked = formData.selectedLeadIds.includes(c.id);
                      return (
                        <div 
                          key={c.id}
                          onClick={() => toggleLeadSelection(c.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                            marginBottom: '2px'
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.825rem' }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => {}} 
                            />
                            <strong>{c.name}</strong> ({c.phone})
                          </label>
                          <span className={`badge ${c.stage === 'New' ? 'success' : 'primary'}`} style={{ fontSize: '0.68rem' }}>
                            {c.stage || 'Lead'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: '700' }}>
                  🚀 Save Campaign & Prepare Calls
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
