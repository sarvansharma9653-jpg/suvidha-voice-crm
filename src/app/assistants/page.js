'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AssistantsPage() {
  const [assistantId, setAssistantId] = useState(null);
  const [name, setName] = useState('Suvidha AI Agent');
  const [businessType, setBusinessType] = useState('real-estate');
  const [productDetails, setProductDetails] = useState('3 BHK Luxury Flat in Sector 62 Noida for 1.2 Crore, 10% discount on downpayment.');
  const [prompt, setPrompt] = useState('');
  const [voiceProvider, setVoiceProvider] = useState('sarvam_hindi');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState(null);

  // Handle wizard changes to build the AI script prompt
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
    fetchAssistant();
  }, []);

  const fetchAssistant = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('assistants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAssistantId(data.id);
        setName(data.name);
        setPrompt(data.system_prompt);
        setVoiceProvider(data.voice_provider);
      }
    } catch (err) {
      console.error('Error fetching assistant:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required.');

      let error;
      if (assistantId) {
        // Update
        const { error: err } = await supabase
          .from('assistants')
          .update({
            name,
            system_prompt: prompt,
            first_message: `Hello, main Suvidha AI assistant bol raha hoon. Kya aapke paas 2 minute hain?`,
            voice_provider: voiceProvider
          })
          .eq('id', assistantId);
        error = err;
      } else {
        // Insert
        const { error: err } = await supabase
          .from('assistants')
          .insert([{
            user_id: user.id,
            name,
            system_prompt: prompt,
            first_message: `Hello, main Suvidha AI assistant bol raha hoon. Kya aapke paas 2 minute hain?`,
            voice_provider: voiceProvider,
            voice_id: voiceProvider === 'sarvam_hindi' ? 'meera' : 'sarah'
          }]);
        error = err;
      }

      if (error) throw error;
      setStatus({ type: 'success', message: '🎉 AI Assistant script and configurations saved successfully!' });
      fetchAssistant();
    } catch (err) {
      setStatus({ type: 'error', message: `❌ Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading configurations...</div>;
  }

  return (
    <div>
      <h1>🤖 AI Assistants Configurations</h1>
      <p className="subtitle">Set up your AI Agent prompt scripts, target business, and voice models</p>

      {status && (
        <div className="card mb-4" style={{
          borderColor: status.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
          padding: '1rem 1.5rem',
          maxWidth: '800px'
        }}>
          {status.message}
        </div>
      )}

      <div className="card" style={{ maxWidth: '800px', padding: '2.5rem' }}>
        <h2 style={{ marginTop: 0 }}>Configure Calling Agent</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Input details about your product or service below. The wizard will automatically construct a prompt script, which you can also edit manually.
        </p>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Agent Name</label>
            <input required type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Suvidha Real Estate Assistant" />
          </div>

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
            <label>Product / Business Details (Offer specifications, pricing, location...)</label>
            <textarea 
              rows="3"
              className="form-control"
              value={productDetails}
              onChange={(e) => setProductDetails(e.target.value)}
              placeholder="e.g. details of properties, pricing, discounts..."
              style={{ resize: 'none', fontSize: '0.8125rem' }}
            />
          </div>

          <div className="form-group">
            <label>Final Compiled System Script Prompt (What the AI will read and follow)</label>
            <textarea 
              required
              rows="6"
              className="form-control"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ resize: 'none', fontSize: '0.8125rem', background: 'rgba(0, 0, 0, 0.4)', fontFamily: 'monospace' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Select Voice Model</label>
            <select className="form-control" value={voiceProvider} onChange={e => setVoiceProvider(e.target.value)}>
              <option value="sarvam_hindi">Bulbul:v3 (Sarvam AI - Hindi Female)</option>
              <option value="sarah">Sarah (11labs - English Female)</option>
              <option value="dom">Dom (Cartesia - Indian Accent)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Saving configurations...' : '💾 Save Agent Configuration'}
          </button>
        </form>
      </div>
    </div>
  );
}
