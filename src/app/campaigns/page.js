'use client';
import { useEffect, useState } from 'react';
import { store } from '@/lib/store';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Wizard Form
  const [formData, setFormData] = useState({ 
    name: '', 
    template: 'real-estate',
    script: 'You are a polite female AI voice real estate assistant for Suvidha. Qualify leads for Sector 62 Noida 3 BHK flats. Speak in feminine Hindi grammar (kar rahi hoon, bata rahi hoon). Keep it brief under 2 sentences.', 
    voice: 'hi-IN-SwaraNeural',
    targetContacts: []
  });

  // Auto-Dialer Engine State
  const [activeDialer, setActiveDialer] = useState(null);
  const [dialerProgress, setDialerProgress] = useState({ current: 0, total: 0, activeName: '' });

  useEffect(() => {
    setCampaigns(store.getCampaigns());
    setContacts(store.getContacts());
  }, []);

  const handleTemplateChange = (tmpl) => {
    let defaultScript = '';
    if (tmpl === 'real-estate') {
      defaultScript = 'You are a polite female AI voice real estate assistant for Suvidha. Qualify leads for Sector 62 Noida 3 BHK flats. Speak in feminine Hindi grammar (kar rahi hoon, bata rahi hoon). Keep it brief under 2 sentences.';
    } else if (tmpl === 'support') {
      defaultScript = 'You are a polite female AI support assistant for Suvidha. Speak in feminine Hindi grammar (kar rahi hoon, bata rahi hoon). Answer customer service queries concisely.';
    } else if (tmpl === 'financial') {
      defaultScript = 'You are a polite female AI loan advisor for Suvidha. Offer pre-approved personal loans up to 5 Lakhs. Speak in feminine Hindi grammar (kar rahi hoon, bata rahi hoon).';
    } else {
      defaultScript = 'You are a custom female AI calling assistant. Speak in feminine Hindi grammar (kar rahi hoon, bata rahi hoon). Be polite and concise.';
    }

    setFormData({
      ...formData,
      template: tmpl,
      script: defaultScript
    });
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    const newCamp = store.addCampaign({
      name: formData.name,
      script: formData.script,
      totalContacts: contacts.length > 0 ? contacts.length : 10,
      completedCalls: 0,
      successRate: 0,
      status: 'Active'
    });

    setCampaigns(store.getCampaigns());
    setShowModal(false);
    setFormData({ name: '', template: 'real-estate', script: '', voice: 'hi-IN-SwaraNeural', targetContacts: [] });
  };

  // Launch Live Sequential Auto-Dialer Engine
  const startAutoDialer = (campaign) => {
    const leadList = contacts.length > 0 ? contacts : [
      { id: '1', name: 'Rahul Sharma', phone: '+919876543210' },
      { id: '2', name: 'Priya Patel', phone: '+919876543211' },
      { id: '3', name: 'Vikram Reddy', phone: '+919876543214' }
    ];

    setActiveDialer(campaign.id);
    setDialerProgress({ current: 0, total: leadList.length, activeName: leadList[0].name });

    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index >= leadList.length) {
        clearInterval(interval);
        setActiveDialer(null);
        setDialerProgress({ current: leadList.length, total: leadList.length, activeName: 'All calls completed!' });
        
        // Update campaign progress
        store.updateCampaign(campaign.id, {
          completedCalls: leadList.length,
          successRate: 45,
          status: 'Completed'
        });
        setCampaigns(store.getCampaigns());
        alert(`🎉 Campaign "${campaign.name}" auto-dialer successfully completed ${leadList.length} AI calls!`);
      } else {
        setDialerProgress({ current: index, total: leadList.length, activeName: leadList[index].name });
        
        // Simulate progress update
        store.updateCampaign(campaign.id, {
          completedCalls: index,
          successRate: Math.round((index / leadList.length) * 40)
        });
        setCampaigns(store.getCampaigns());

        // Add automated call log
        store.addCall({
          contactId: leadList[index - 1].id,
          contactName: leadList[index - 1].name,
          phone: leadList[index - 1].phone,
          campaignId: campaign.id,
          duration: 42,
          status: 'Completed',
          sentiment: index % 2 === 0 ? '🔥 Hot Lead' : '😊 Interested',
          stage: 'Qualified',
          summary: `Auto-dialer call completed for ${leadList[index - 1].name}. AI qualified lead intent.`,
          transcript: `Agent: Namaste ${leadList[index - 1].name}ji! Main Suvidha AI Assistant bol rahi hoon.\nLead: Haan ji bataiye.`
        });
      }
    }, 4000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>🎯 Automated AI Calling Campaigns</h1>
          <p className="subtitle">Launch sequential auto-dialer campaigns to call lead lists automatically</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          🚀 Create New Campaign
        </button>
      </div>

      {/* Active Dialer Live Status Panel */}
      {activeDialer && (
        <div className="card mb-8" style={{ padding: '1.5rem', borderColor: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.08)' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <span className="bar-wave" style={{ height: '24px' }}></span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>⚡ Live Auto-Dialer Running...</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Calling Lead {dialerProgress.current + 1} of {dialerProgress.total}: <strong>{dialerProgress.activeName}</strong>
                </span>
              </div>
            </div>
            <span className="badge warning">Dialing Sequential Leads</span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${Math.round((dialerProgress.current / dialerProgress.total) * 100)}%`, 
                height: '100%', 
                background: 'linear-gradient(to right, var(--accent-blue), var(--accent-green))',
                transition: 'width 0.4s ease' 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Campaigns Grid */}
      <div className="stats-grid mb-8">
        {campaigns.map(camp => {
          const isRunning = activeDialer === camp.id;
          const pct = camp.totalContacts > 0 ? Math.round((camp.completedCalls / camp.totalContacts) * 100) : 0;

          return (
            <div className="card" key={camp.id} style={{ padding: '1.75rem' }}>
              <div className="stat-header mb-4">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{camp.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Script: {camp.script ? camp.script.substring(0, 45) + '...' : 'General Sales'}</span>
                </div>
                <span className={`badge ${camp.status === 'Active' ? 'success' : camp.status === 'Completed' ? 'primary' : 'info'}`}>
                  {camp.status}
                </span>
              </div>

              <div style={{ margin: '1.25rem 0' }}>
                <div className="flex justify-between mb-2" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Auto-Dialer Progress</span>
                  <span>{pct}% ({camp.completedCalls}/{camp.totalContacts})</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: '600' }}>
                  Success Rate: {camp.successRate}%
                </span>

                <button 
                  onClick={() => startAutoDialer(camp)}
                  disabled={isRunning}
                  className={`btn ${isRunning ? 'btn-secondary' : 'btn-success'}`}
                  style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem' }}
                >
                  {isRunning ? '⏳ Auto-Dialing...' : '▶️ Start Auto-Dialing'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Beginner Campaign Creator Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Create Automated AI Campaign</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✖</button>
            </div>
            
            <form onSubmit={handleCreateCampaign}>
              <div className="form-group">
                <label>1. Campaign Name</label>
                <input 
                  required 
                  type="text" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Noida 3 BHK Luxury Flat Outbound" 
                />
              </div>

              <div className="form-group">
                <label>2. Business AI Script Template</label>
                <select className="form-control" value={formData.template} onChange={e => handleTemplateChange(e.target.value)}>
                  <option value="real-estate">🏢 Real Estate / Property Sales</option>
                  <option value="support">🎧 Customer Support & Feedback</option>
                  <option value="financial">💰 Financial Loans & Pre-Approval</option>
                  <option value="custom">✏️ Custom AI Script Instruction</option>
                </select>
              </div>

              <div className="form-group">
                <label>3. AI Voice Agent System Script (Female Hindi Grammar)</label>
                <textarea 
                  required
                  className="form-control" 
                  rows="4"
                  value={formData.script} 
                  onChange={e => setFormData({...formData, script: e.target.value})} 
                  placeholder="Enter instructions for what the AI agent should speak..." 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>4. Select AI Voice Gender</label>
                <select className="form-control" value={formData.voice} onChange={e => setFormData({...formData, voice: e.target.value})}>
                  <option value="hi-IN-SwaraNeural">👩 Swara (Warm Indian Hindi Female AI Voice Agent)</option>
                  <option value="hi-IN-MadhurNeural">👨 Madhur (Professional Indian Hindi Male AI Voice Agent)</option>
                </select>
              </div>

              <div className="flex justify-between gap-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>🚀 Launch Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
