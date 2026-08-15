'use client';
import { useEffect, useState } from 'react';
import { store } from '@/lib/store';

export default function DograhVoiceAgentStudioPage() {
  const [agents, setAgents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Dograh Studio Form Fields (Screenshot 4)
  const [callType, setCallType] = useState('Outbound (AI calls users)');
  const [useCase, setUseCase] = useState('Lead Qualification');
  const [activityDescription, setActivityDescription] = useState('Qualify real estate leads for Sector 62 Noida 3 BHK flats. Speak in polite feminine Hindi grammar (kar rahi hoon, bata rahi hoon). Check budget and site visit availability.');
  const [agentName, setAgentName] = useState('Ananya - Real Estate Lead Qualifier');

  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Initial sample agents if empty
    const saved = localStorage.getItem('dograh_agents');
    if (!saved) {
      const initial = [
        {
          id: 'ag_1',
          name: 'Ananya - Real Estate Lead Qualifier',
          callType: 'Outbound (AI calls users)',
          useCase: 'Lead Qualification',
          description: 'Qualifies Noida property buyers in polite Hindi female voice (kar rahi hoon).',
          voice: 'hi-IN-SwaraNeural'
        },
        {
          id: 'ag_2',
          name: 'Priya - Support & Feedback Agent',
          callType: 'Inbound (Users call AI)',
          useCase: 'Customer Support',
          description: 'Answers customer queries and collects rating scores.',
          voice: 'hi-IN-SwaraNeural'
        }
      ];
      localStorage.setItem('dograh_agents', JSON.stringify(initial));
      setAgents(initial);
    } else {
      setAgents(JSON.parse(saved));
    }
  }, []);

  const handleCreateAgent = (e) => {
    e.preventDefault();
    const newAgent = {
      id: 'ag_' + Date.now(),
      name: agentName,
      callType,
      useCase,
      description: activityDescription,
      voice: 'hi-IN-SwaraNeural'
    };

    const updated = [newAgent, ...agents];
    localStorage.setItem('dograh_agents', JSON.stringify(updated));
    setAgents(updated);
    setShowCreateModal(false);
    setStatus({ type: 'success', message: `🎉 Voice Agent "${agentName}" created successfully!` });
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>🤖 Voice Agent Creation Studio</h1>
          <p className="subtitle">Tell us about your use case and we'll create a customized voice agent for you</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          ➕ Create New Voice Agent
        </button>
      </div>

      {status && (
        <div className="card mb-6" style={{ padding: '1rem', borderColor: status.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          {status.message}
        </div>
      )}

      {/* Main Dograh Create Agent Box */}
      <div className="card mb-8" style={{ padding: '2.5rem', background: '#0e0e14' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.35rem', marginBottom: '0.5rem' }}>Agent Details</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>Configure your voice agent settings and system prompts</p>

        <form onSubmit={handleCreateAgent}>
          <div className="form-group mb-6">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Call Type</label>
            <select className="form-control" value={callType} onChange={e => setCallType(e.target.value)}>
              <option value="Outbound (AI calls users)">Outbound (AI calls users)</option>
              <option value="Inbound (Users call AI)">Inbound (Users call AI)</option>
            </select>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Choose whether users will call your AI or your AI will call users</span>
          </div>

          <div className="form-group mb-6">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Agent Name & Title</label>
            <input 
              required
              type="text" 
              className="form-control" 
              value={agentName}
              onChange={e => setAgentName(e.target.value)}
              placeholder="e.g. Ananya - Real Estate Lead Qualifier" 
            />
          </div>

          <div className="form-group mb-6">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Use Case</label>
            <input 
              required
              type="text" 
              className="form-control" 
              value={useCase}
              onChange={e => setUseCase(e.target.value)}
              placeholder="e.g., Lead Qualification, HR Screening, Customer Support" 
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Describe the primary purpose of your voice agent</span>
          </div>

          <div className="form-group mb-8">
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Activity Description & Prompt</label>
            <textarea 
              required
              rows="4"
              className="form-control" 
              value={activityDescription}
              onChange={e => setActivityDescription(e.target.value)}
              placeholder="Describe briefly what your voice agent will do (e.g. Qualify leads for real estate, Screen candidates for roles...). This will be a prompt to an LLM." 
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>This description will be used to generate the AI prompt for your voice agent</span>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            🚀 Create Voice Agent
          </button>
        </form>
      </div>

      {/* Saved Voice Agents List */}
      <div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Active Voice Agents ({agents.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {agents.map(ag => (
            <div className="card" key={ag.id} style={{ padding: '1.5rem' }}>
              <div className="flex justify-between items-center mb-3">
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{ag.name}</h3>
                <span className="badge success">{ag.callType.includes('Outbound') ? 'Outbound' : 'Inbound'}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                {ag.description}
              </p>
              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--border-light)', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--accent-purple)' }}>Voice: Swara Neural (Female)</span>
                <button 
                  onClick={() => alert(`✅ Agent "${ag.name}" ready! Go to Overview & Playground to test.`)}
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                >
                  ⚡ Test Agent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
