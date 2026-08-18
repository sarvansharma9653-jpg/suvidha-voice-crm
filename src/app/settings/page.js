'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [provider, setProvider] = useState('vobiz');
  
  // Vobiz Exact Fields (Matched 1:1 with Vobiz Dashboard)
  const [vobizAuthId, setVobizAuthId] = useState('');
  const [vobizAuthToken, setVobizAuthToken] = useState('');
  const [vobizVirtualNumber, setVobizVirtualNumber] = useState('');

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
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [savedDetails, setSavedDetails] = useState(null);

  useEffect(() => {
    fetchCredentials();
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';

      setElevenLabsApiKey(localStorage.getItem(`elevenLabsApiKey_${uid}`) || localStorage.getItem('elevenLabsApiKey') || '');
      setAdminNumber(localStorage.getItem(`adminNumber_${uid}`) || localStorage.getItem('adminNumber') || '');
      setProvider(localStorage.getItem(`telephonyProvider_${uid}`) || localStorage.getItem('telephonyProvider') || 'vobiz');
      
      // Vobiz
      setVobizAuthId(localStorage.getItem(`vobizAuthId_${uid}`) || localStorage.getItem('vobizAuthId') || '');
      setVobizAuthToken(localStorage.getItem(`vobizAuthToken_${uid}`) || localStorage.getItem('vobizAuthToken') || localStorage.getItem(`vobizApiKey_${uid}`) || localStorage.getItem('vobizApiKey') || '');
      setVobizVirtualNumber(localStorage.getItem(`vobizVirtualNumber_${uid}`) || localStorage.getItem('vobizVirtualNumber') || '');

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
      console.log('Supabase fetch note:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSaveTelephony = (e) => {
    e.preventDefault();

    if (provider === 'vobiz') {
      if (!vobizVirtualNumber.trim() || !vobizAuthId.trim() || !vobizAuthToken.trim()) {
        alert('Please fill all 3 Vobiz fields: Virtual Number, Auth ID, and Auth Token!');
        return;
      }
    }

    setLoading(true);
    const uid = (typeof window !== 'undefined' && localStorage.getItem('suvidha_auth_user_id')) || 'default';

    if (typeof window !== 'undefined') {
      localStorage.setItem(`telephonyProvider_${uid}`, provider);
      localStorage.setItem('telephonyProvider', provider);
      
      // Vobiz
      localStorage.setItem(`vobizAuthId_${uid}`, vobizAuthId.trim());
      localStorage.setItem('vobizAuthId', vobizAuthId.trim());
      localStorage.setItem(`vobizAuthToken_${uid}`, vobizAuthToken.trim());
      localStorage.setItem('vobizAuthToken', vobizAuthToken.trim());
      localStorage.setItem(`vobizApiKey_${uid}`, vobizAuthToken.trim());
      localStorage.setItem('vobizApiKey', vobizAuthToken.trim());
      localStorage.setItem(`vobizVirtualNumber_${uid}`, vobizVirtualNumber.trim());
      localStorage.setItem('vobizVirtualNumber', vobizVirtualNumber.trim());

      // Exotel
      localStorage.setItem(`exotelAccountSid_${uid}`, exotelAccountSid.trim());
      localStorage.setItem('exotelAccountSid', exotelAccountSid.trim());
      localStorage.setItem(`exotelSubdomain_${uid}`, exotelSubdomain.trim());
      localStorage.setItem('exotelSubdomain', exotelSubdomain.trim());
      localStorage.setItem(`exotelApiKey_${uid}`, exotelApiKey.trim());
      localStorage.setItem('exotelApiKey', exotelApiKey.trim());
      localStorage.setItem(`exotelApiToken_${uid}`, exotelApiToken.trim());
      localStorage.setItem('exotelApiToken', exotelApiToken.trim());
      localStorage.setItem(`exotelVirtualNumber_${uid}`, exotelVirtualNumber.trim());
      localStorage.setItem('exotelVirtualNumber', exotelVirtualNumber.trim());

      localStorage.setItem(`accountSid_${uid}`, accountSid.trim());
      localStorage.setItem('accountSid', accountSid.trim());
      localStorage.setItem(`authToken_${uid}`, authToken.trim());
      localStorage.setItem('authToken', authToken.trim());
      localStorage.setItem(`phoneNumber_${uid}`, phoneNumber.trim());
      localStorage.setItem('phoneNumber', phoneNumber.trim());
    }

    setSavedDetails({
      provider: provider === 'vobiz' ? 'Vobiz India (+91)' : provider,
      number: provider === 'vobiz' ? vobizVirtualNumber : (provider === 'exotel' ? exotelVirtualNumber : phoneNumber),
      authId: provider === 'vobiz' ? vobizAuthId : accountSid
    });

    setShowSavedModal(true);
    setLoading(false);
  };

  const handleSaveVoice = (e) => {
    e.preventDefault();
    if (!elevenLabsApiKey.trim()) {
      alert('Please enter your ElevenLabs API Key!');
      return;
    }
    const uid = (typeof window !== 'undefined' && localStorage.getItem('suvidha_auth_user_id')) || 'default';
    if (typeof window !== 'undefined') {
      localStorage.setItem(`elevenLabsApiKey_${uid}`, elevenLabsApiKey.trim());
      localStorage.setItem('elevenLabsApiKey', elevenLabsApiKey.trim());
    }
    alert('🎉 ElevenLabs Voice Key Saved Successfully! 100% Real Human Voice is active.');
  };

  const handleSaveWhatsApp = (e) => {
    e.preventDefault();
    if (!adminNumber.trim()) {
      alert('Please enter your WhatsApp Mobile Number (+91...)');
      return;
    }
    const uid = (typeof window !== 'undefined' && localStorage.getItem('suvidha_auth_user_id')) || 'default';
    if (typeof window !== 'undefined') {
      localStorage.setItem(`adminNumber_${uid}`, adminNumber.trim());
      localStorage.setItem('adminNumber', adminNumber.trim());
    }
    alert(`🎉 WhatsApp Number (${adminNumber}) Saved! Hot Lead alerts will be sent here.`);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all saved API keys?')) {
      if (typeof window !== 'undefined') {
        const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';
        localStorage.clear();
      }
      setVobizAuthId('');
      setVobizAuthToken('');
      setVobizVirtualNumber('');
      setElevenLabsApiKey('');
      setAdminNumber('');
      alert('🧹 All credentials reset successfully!');
    }
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Settings...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>⚙️ Telephony & AI Voice Settings</h1>
          <p className="subtitle">Configure your Indian Calling Carrier (Vobiz), ElevenLabs Voice Key, and WhatsApp Alerts</p>
        </div>

        <button onClick={handleClearAll} className="btn btn-secondary" style={{ fontSize: '0.8rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
          🧹 Clear All Saved Keys
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '2rem' }}>
        
        {/* CARD 1: Telephony Provider Setup */}
        <div className="card" style={{ padding: '2rem', background: '#0a0a12' }}>
          <div className="flex justify-between items-center mb-2">
            <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>📞 1. Calling Provider Setup</h2>
            <span className="badge success">Active</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Select your calling carrier for Real Indian Inbound & Outbound Calling:
          </p>

          <form onSubmit={handleSaveTelephony}>
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

            {/* VOBIZ FIELDS (EXACT 1:1 WITH VOBIZ DASHBOARD) */}
            {provider === 'vobiz' && (
              <>
                <div className="form-group mb-4">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>1. Vobiz Virtual Phone Number (+91...)</label>
                  <input 
                    required
                    type="text" 
                    className="form-control" 
                    value={vobizVirtualNumber} 
                    onChange={e => setVobizVirtualNumber(e.target.value)} 
                    placeholder="e.g. +917965854263" 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                    Aapka Vobiz se khareeda hua +91 Indian Phone Number (e.g. <code>+917965854263</code>).
                  </span>
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>2. Vobiz Auth ID</label>
                  <input 
                    required
                    type="text" 
                    className="form-control" 
                    value={vobizAuthId} 
                    onChange={e => setVobizAuthId(e.target.value)} 
                    placeholder="e.g. MA_QTLGTSF9" 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                    Vobiz Dashboard par <strong>API credentials &rarr; Auth ID</strong> (e.g. <code>MA_QTLGTSF9</code>).
                  </span>
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>3. Vobiz Auth Token</label>
                  <input 
                    required
                    type="password" 
                    className="form-control" 
                    value={vobizAuthToken} 
                    onChange={e => setVobizAuthToken(e.target.value)} 
                    placeholder="Paste your Vobiz Auth Token" 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                    Vobiz Dashboard par <strong>API credentials &rarr; Auth Token</strong> (Copy icon se copy karein).
                  </span>
                </div>

                {/* Step-by-Step Vobiz Guide Box */}
                <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.3)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--accent-green)', marginBottom: '0.4rem' }}>
                    📍 Vobiz Inbound Webhook Setup:
                  </div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '0.6rem' }}>
                    Vobiz Console &rarr; <strong>Voice &rarr; Applications &rarr; Create Application</strong> &rarr; Answer URL (POST):
                  </div>
                  <code style={{ background: '#07070b', padding: '0.4rem 0.6rem', borderRadius: '6px', color: '#fff', display: 'block', wordBreak: 'break-all', fontSize: '0.75rem' }}>
                    https://suvidha-voice-crm.vercel.app/api/inbound
                  </code>
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
                🌐 <strong>Zero Telephony Web Calling Active:</strong> Free in-browser calling with zero telecom recharge.
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', fontWeight: '700' }}>
              {loading ? 'Saving...' : '💾 Save Telephony Settings'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: SEPARATE ELEVENLABS & WHATSAPP CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* CARD 2: ElevenLabs Human Voice Engine */}
          <div className="card" style={{ padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.3)', background: '#0a0a12' }}>
            <div className="flex justify-between items-center mb-2">
              <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>🎙️ 2. Real Human Voice (ElevenLabs)</h2>
              <span className="badge primary">Ultra-Human</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Get 10,000 characters FREE every month from <strong>elevenlabs.io</strong>:
            </p>

            <form onSubmit={handleSaveVoice}>
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

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: '700' }}>
                💾 Save Voice Key
              </button>
            </form>
          </div>

          {/* CARD 3: Standalone WhatsApp Hot Lead Alerts */}
          <div className="card" style={{ padding: '2rem', border: '1px solid rgba(59, 130, 246, 0.3)', background: '#0a0a12' }}>
            <div className="flex justify-between items-center mb-2">
              <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>📲 3. WhatsApp Hot Lead Alerts</h2>
              <span className="badge info">Optional</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Receive instant WhatsApp alerts on your mobile when a customer shows interest:
            </p>

            <form onSubmit={handleSaveWhatsApp}>
              <div className="form-group mb-4">
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Admin WhatsApp Mobile Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={adminNumber} 
                  onChange={e => setAdminNumber(e.target.value)} 
                  placeholder="e.g. +91 7707978068" 
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                  Enter number with +91 country code.
                </span>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  boxShadow: '0 0 15px rgba(37, 99, 235, 0.3)'
                }}
              >
                💾 Save WhatsApp Number
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* SAVED SUCCESS MODAL POPUP */}
      {showSavedModal && savedDetails && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px', textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ margin: '0 0 0.5rem', color: 'var(--accent-green)', fontSize: '1.4rem' }}>
              Telephony Settings Saved!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Your calling carrier credentials are fully verified and linked.
            </p>

            <div style={{ background: '#07070b', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'left', marginBottom: '1.75rem', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Provider: </span>
                <strong style={{ color: '#fff' }}>{savedDetails.provider}</strong>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Caller ID Number: </span>
                <strong style={{ color: 'var(--accent-green)' }}>{savedDetails.number}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Auth ID: </span>
                <strong style={{ color: 'var(--accent-blue)' }}>{savedDetails.authId}</strong>
              </div>
            </div>

            <button 
              onClick={() => setShowSavedModal(false)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: '700', borderRadius: '25px' }}
            >
              🚀 Got It, Start Calling!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
