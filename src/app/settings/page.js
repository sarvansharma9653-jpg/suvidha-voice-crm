'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [provider, setProvider] = useState('vobiz');
  
  // Vobiz Exact Fields (+91 Indian Calling)
  const [vobizApiKey, setVobizApiKey] = useState('');
  const [vobizVirtualNumber, setVobizVirtualNumber] = useState('');
  const [vobizOrgId, setVobizOrgId] = useState('');

  // Exotel Exact Fields
  const [exotelAccountSid, setExotelAccountSid] = useState('');
  const [exotelSubdomain, setExotelSubdomain] = useState('api.exotel.com');
  const [exotelApiKey, setExotelApiKey] = useState('');
  const [exotelApiToken, setExotelApiToken] = useState('');
  const [exotelVirtualNumber, setExotelVirtualNumber] = useState('');

  // Generic / Twilio / Plivo Fields
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // ElevenLabs Human Voice Engine API Key
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');

  // WhatsApp Meta Cloud API Credentials
  const [adminNumber, setAdminNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchCredentials();
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';

      setElevenLabsApiKey(localStorage.getItem(`elevenLabsApiKey_${uid}`) || localStorage.getItem('elevenLabsApiKey') || '');
      setAdminNumber(localStorage.getItem(`adminNumber_${uid}`) || localStorage.getItem('adminNumber') || '');
      
      setProvider(localStorage.getItem(`telephonyProvider_${uid}`) || localStorage.getItem('telephonyProvider') || 'vobiz');
      
      // Vobiz
      setVobizApiKey(localStorage.getItem(`vobizApiKey_${uid}`) || localStorage.getItem('vobizApiKey') || '');
      setVobizVirtualNumber(localStorage.getItem(`vobizVirtualNumber_${uid}`) || localStorage.getItem('vobizVirtualNumber') || '');
      setVobizOrgId(localStorage.getItem(`vobizOrgId_${uid}`) || localStorage.getItem('vobizOrgId') || '');

      // Exotel
      setExotelAccountSid(localStorage.getItem(`exotelAccountSid_${uid}`) || localStorage.getItem('exotelAccountSid') || '');
      setExotelSubdomain(localStorage.getItem(`exotelSubdomain_${uid}`) || localStorage.getItem('exotelSubdomain') || 'api.exotel.com');
      setExotelApiKey(localStorage.getItem(`exotelApiKey_${uid}`) || localStorage.getItem('exotelApiKey') || '');
      setExotelApiToken(localStorage.getItem(`exotelApiToken_${uid}`) || localStorage.getItem('exotelApiToken') || '');
      setExotelVirtualNumber(localStorage.getItem(`exotelVirtualNumber_${uid}`) || localStorage.getItem('exotelVirtualNumber') || '');

      // Generic
      setAccountSid(localStorage.getItem(`accountSid_${uid}`) || localStorage.getItem('accountSid') || '');
      setAuthToken(localStorage.getItem(`authToken_${uid}`) || localStorage.getItem('authToken') || '');
      setPhoneNumber(localStorage.getItem(`phoneNumber_${uid}`) || localStorage.getItem('phoneNumber') || '');
    }
  }, []);

  const fetchCredentials = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFetching(false);
        return;
      }

      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setProvider(data.provider || 'vobiz');
        setAccountSid(data.account_sid || '');
        setAuthToken(data.auth_token || '');
        setPhoneNumber(data.phone_number || '');
      }
    } catch (err) {
      console.log('Supabase credentials fetch note:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const uid = (typeof window !== 'undefined' && localStorage.getItem('suvidha_auth_user_id')) || 'default';

    if (typeof window !== 'undefined') {
      localStorage.setItem(`elevenLabsApiKey_${uid}`, elevenLabsApiKey);
      localStorage.setItem('elevenLabsApiKey', elevenLabsApiKey);

      localStorage.setItem(`telephonyProvider_${uid}`, provider);
      localStorage.setItem('telephonyProvider', provider);
      
      // Vobiz
      localStorage.setItem(`vobizApiKey_${uid}`, vobizApiKey);
      localStorage.setItem('vobizApiKey', vobizApiKey);
      localStorage.setItem(`vobizVirtualNumber_${uid}`, vobizVirtualNumber);
      localStorage.setItem('vobizVirtualNumber', vobizVirtualNumber);
      localStorage.setItem(`vobizOrgId_${uid}`, vobizOrgId);
      localStorage.setItem('vobizOrgId', vobizOrgId);

      // Exotel
      localStorage.setItem(`exotelAccountSid_${uid}`, exotelAccountSid);
      localStorage.setItem('exotelAccountSid', exotelAccountSid);
      localStorage.setItem(`exotelSubdomain_${uid}`, exotelSubdomain);
      localStorage.setItem('exotelSubdomain', exotelSubdomain);
      localStorage.setItem(`exotelApiKey_${uid}`, exotelApiKey);
      localStorage.setItem('exotelApiKey', exotelApiKey);
      localStorage.setItem(`exotelApiToken_${uid}`, exotelApiToken);
      localStorage.setItem('exotelApiToken', exotelApiToken);
      localStorage.setItem(`exotelVirtualNumber_${uid}`, exotelVirtualNumber);
      localStorage.setItem('exotelVirtualNumber', exotelVirtualNumber);

      localStorage.setItem(`accountSid_${uid}`, accountSid);
      localStorage.setItem('accountSid', accountSid);
      localStorage.setItem(`authToken_${uid}`, authToken);
      localStorage.setItem('authToken', authToken);
      localStorage.setItem(`phoneNumber_${uid}`, phoneNumber);
      localStorage.setItem('phoneNumber', phoneNumber);

      localStorage.setItem(`adminNumber_${uid}`, adminNumber);
      localStorage.setItem('adminNumber', adminNumber);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const payload = {
          user_id: user.id,
          provider,
          account_sid: provider === 'vobiz' ? vobizOrgId : (provider === 'exotel' ? exotelAccountSid : accountSid),
          auth_token: provider === 'vobiz' ? vobizApiKey : (provider === 'exotel' ? exotelApiToken : authToken),
          phone_number: provider === 'vobiz' ? vobizVirtualNumber : (provider === 'exotel' ? exotelVirtualNumber : phoneNumber),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('credentials').upsert(payload, { onConflict: 'user_id' });
        if (error) console.log('Supabase sync note:', error.message);
      }
    } catch (e) {
      console.log('Safe save note:', e.message);
    }

    setStatus({ type: 'success', message: '🎉 Telephony & Voice Settings saved successfully!' });
    setLoading(false);
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Settings...</div>;
  }

  return (
    <div style={{ maxWidth: '1050px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>⚙️ Telephony & AI Voice Settings</h1>
          <p className="subtitle">Configure your Indian Calling Carrier (Vobiz / Exotel / Plivo) and ElevenLabs Voice Key</p>
        </div>
      </div>

      {status && (
        <div className="card mb-8" style={{
          borderColor: status.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
          padding: '1rem 1.5rem',
          background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
        }}>
          {status.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '2rem' }}>
        
        {/* 1. Telephony Provider Setup (Clean & Simple) */}
        <div className="card" style={{ padding: '2rem' }}>
          <div className="flex justify-between items-center mb-2">
            <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>📞 1. Telephony Provider Setup</h2>
            <span className="badge success">Active</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Select your calling provider and enter your credentials:
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group mb-4">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Select Calling Carrier</label>
              <select className="form-control" value={provider} onChange={e => setProvider(e.target.value)}>
                <option value="vobiz">🇮🇳 Vobiz India (+91 Indian DID Calling - Recommended)</option>
                <option value="exotel">🇮🇳 Exotel India (+91 Commercial Telephony)</option>
                <option value="plivo">⚡ Plivo Telephony (Low-Cost Indian Calling)</option>
                <option value="twilio">🇺🇸 Twilio (Global Real Calling)</option>
                <option value="webphone">🌐 Free In-Browser WebCall (Zero Telephony / Free Testing)</option>
              </select>
            </div>

            {/* VOBIZ FIELDS */}
            {provider === 'vobiz' && (
              <>
                <div className="form-group mb-4">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Vobiz Virtual Number / Caller ID</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={vobizVirtualNumber} 
                    onChange={e => setVobizVirtualNumber(e.target.value)} 
                    placeholder="e.g. +917965854130" 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                    Enter your Vobiz purchased +91 phone number.
                  </span>
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Vobiz API Key / Auth Token</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={vobizApiKey} 
                    onChange={e => setVobizApiKey(e.target.value)} 
                    placeholder="Enter your Vobiz API key" 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                    Copy from <strong>Vobiz Dashboard &rarr; API Keys</strong>.
                  </span>
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Vobiz Organization ID (Optional)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={vobizOrgId} 
                    onChange={e => setVobizOrgId(e.target.value)} 
                    placeholder="e.g. org_xxxxx" 
                  />
                </div>

                <div style={{ background: '#0a0a10', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)', fontSize: '0.8rem', color: 'var(--accent-green)', marginBottom: '1.5rem' }}>
                  💡 <strong>Inbound Call Webhook:</strong> <code>https://suvidha-voice-crm.vercel.app/api/inbound</code><br />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paste in Vobiz console to auto-answer incoming customer calls with AI!</span>
                </div>
              </>
            )}

            {/* EXOTEL FIELDS */}
            {provider === 'exotel' && (
              <>
                <div className="form-group mb-3">
                  <label>Exotel Account SID</label>
                  <input type="text" className="form-control" value={exotelAccountSid} onChange={e => setExotelAccountSid(e.target.value)} placeholder="Enter Exotel Account SID" />
                </div>
                <div className="form-group mb-3">
                  <label>Exotel Subdomain</label>
                  <input type="text" className="form-control" value={exotelSubdomain} onChange={e => setExotelSubdomain(e.target.value)} placeholder="e.g. api.exotel.com" />
                </div>
                <div className="form-group mb-3">
                  <label>Exotel API Key</label>
                  <input type="text" className="form-control" value={exotelApiKey} onChange={e => setExotelApiKey(e.target.value)} placeholder="Enter Exotel API Key" />
                </div>
                <div className="form-group mb-3">
                  <label>Exotel API Token</label>
                  <input type="password" className="form-control" value={exotelApiToken} onChange={e => setExotelApiToken(e.target.value)} placeholder="Enter Exotel API Token" />
                </div>
                <div className="form-group mb-4">
                  <label>Exotel Virtual Number</label>
                  <input type="text" className="form-control" value={exotelVirtualNumber} onChange={e => setExotelVirtualNumber(e.target.value)} placeholder="e.g. 08047280901" />
                </div>
              </>
            )}

            {/* TWILIO / PLIVO */}
            {provider !== 'vobiz' && provider !== 'exotel' && provider !== 'webphone' && (
              <>
                <div className="form-group mb-3">
                  <label>Account SID / Username</label>
                  <input type="text" className="form-control" value={accountSid} onChange={e => setAccountSid(e.target.value)} placeholder="Enter Account SID" />
                </div>
                <div className="form-group mb-3">
                  <label>Auth Token / API Secret</label>
                  <input type="password" className="form-control" value={authToken} onChange={e => setAuthToken(e.target.value)} placeholder="Enter Auth Token" />
                </div>
                <div className="form-group mb-4">
                  <label>Caller ID / Virtual Number</label>
                  <input type="text" className="form-control" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="e.g. +91..." />
                </div>
              </>
            )}

            {provider === 'webphone' && (
              <div style={{ background: '#0a0a10', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                🌐 <strong>Zero Telephony Web Calling Active:</strong> Calls connect directly through browser microphone & speaker without requiring any SIM card, Vobiz, or telecom recharge.
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Saving...' : '💾 Save Telephony Settings'}
            </button>
          </form>
        </div>

        {/* 2. ElevenLabs Human Voice Engine API Key */}
        <div className="card" style={{ padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'rgba(139, 92, 246, 0.03)' }}>
          <div className="flex justify-between items-center mb-2">
            <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>🎙️ 2. Real Human Voice (ElevenLabs)</h2>
            <span className="badge primary">Ultra-Human</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Get 10,000 characters FREE every month from <strong>elevenlabs.io</strong>:
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group mb-4">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>ElevenLabs API Key</label>
              <input 
                type="password" 
                className="form-control" 
                value={elevenLabsApiKey} 
                onChange={e => setElevenLabsApiKey(e.target.value)} 
                placeholder="Paste your ElevenLabs API Key" 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Copy from: <strong>elevenlabs.io &rarr; Profile &rarr; API Keys</strong>
              </span>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Saving...' : '💾 Save Voice Key'}
            </button>
          </form>

          {/* 3. Optional WhatsApp Hot Lead Alerts */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <div className="flex justify-between items-center mb-2">
              <h3 style={{ margin: 0, fontSize: '1rem' }}>📲 WhatsApp Hot Lead Alerts (Optional)</h3>
              <span className="badge info">Optional</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
              Receive instant alerts on WhatsApp when a lead says Yes:
            </p>

            <form onSubmit={handleSave}>
              <div className="form-group mb-3">
                <input 
                  type="text" 
                  className="form-control" 
                  value={adminNumber} 
                  onChange={e => setAdminNumber(e.target.value)} 
                  placeholder="e.g. +917707978068" 
                />
              </div>

              <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.8125rem', width: '100%' }}>
                Save WhatsApp Number
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
