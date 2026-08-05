'use client';
import { useEffect, useState } from 'react';
import { store } from '@/lib/store';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', systemPrompt: '', voice: 'en-IN-Standard-A' });

  useEffect(() => {
    setCampaigns(store.getCampaigns());
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    store.addCampaign({...formData, totalContacts: 0, successRate: 0});
    setCampaigns(store.getCampaigns());
    setShowModal(false);
    setFormData({ name: '', systemPrompt: '', voice: 'en-IN-Standard-A' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>🎯 Campaigns</h1>
          <p className="subtitle">Launch and monitor your AI calling campaigns</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>🚀 Create Campaign</button>
      </div>

      <div className="stats-grid" style={{marginBottom: '2rem'}}>
        {campaigns.map(camp => (
          <div className="card" key={camp.id}>
            <div className="stat-header">
              <span style={{fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 'bold'}}>{camp.name}</span>
              <span className={`badge ${camp.status === 'Active' ? 'success' : camp.status === 'Draft' ? 'info' : 'warning'}`}>
                {camp.status}
              </span>
            </div>
            <div style={{margin: '1rem 0'}}>
              <div className="flex justify-between" style={{fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>
                <span>Progress</span>
                <span>{camp.totalContacts > 0 ? Math.round((camp.completedCalls / camp.totalContacts) * 100) : 0}%</span>
              </div>
              <div style={{width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px'}}>
                <div style={{width: `${camp.totalContacts > 0 ? Math.round((camp.completedCalls / camp.totalContacts) * 100) : 0}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: '3px'}}></div>
              </div>
            </div>
            <div className="flex justify-between" style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
              <span>Calls: {camp.completedCalls}/{camp.totalContacts}</span>
              <span>Success: {camp.successRate}%</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Campaign</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✖</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Campaign Name</label>
                <input required type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Q3 Feedback" />
              </div>
              <div className="form-group">
                <label>AI System Prompt / Script</label>
                <textarea required className="form-control" style={{minHeight: '120px'}} value={formData.systemPrompt} onChange={e => setFormData({...formData, systemPrompt: e.target.value})} placeholder="You are a helpful AI assistant calling from XYZ company..." />
              </div>
              <div className="form-group">
                <label>Voice Selection</label>
                <select className="form-control" value={formData.voice} onChange={e => setFormData({...formData, voice: e.target.value})}>
                  <option value="en-IN-Standard-A">Indian English (Female) - Standard</option>
                  <option value="en-IN-Standard-B">Indian English (Male) - Standard</option>
                  <option value="hi-IN-Standard-A">Hindi (Female) - Standard</option>
                  <option value="en-US-Standard-C">US English (Female) - Premium</option>
                </select>
              </div>
              <div className="flex justify-between mt-8">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
