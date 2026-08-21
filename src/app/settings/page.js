'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [provider, setProvider] = useState('vobiz');
  const [vobizVirtualNumber, setVobizVirtualNumber] = useState('+917965854263');
  const [vobizAuthId, setVobizAuthId] = useState('MA_QTLGTSF9');
  const [vobizAuthToken, setVobizAuthToken] = useState('');
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [elevenValidating, setElevenValidating] = useState(false);
  const [elevenStatus, setElevenStatus] = useState(null);

  const handleValidateElevenKey = async () => {
    if (!elevenLabsApiKey.trim()) {
      alert('Please enter your ElevenLabs API Key first!');
      return;
    }
    setElevenValidating(true);
    setElevenStatus(null);

    try {
      const res = await fetch('/api/tts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: elevenLabsApiKey.trim() })
      });
      const data = await res.json();
      setElevenStatus(data);
    } catch (e) {
      setElevenStatus({ success: false, error: e.message });
    } finally {
      setElevenValidating(false);
    }
  };
  const [fetching, setFetching] = useState(true);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [savedDetails, setSavedDetails] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';
      const savedProvider = localStorage.getItem(`telephonyProvider_${uid}`) || localStorage.getItem('telephonyProvider') || 'vobiz';
      setProvider(savedProvider);

      setVobizVirtualNumber(localStorage.getItem(`vobizVirtualNumber_${uid}`) || localStorage.getItem('vobizVirtualNumber') || '+917965854263');
      setVobizAuthId(localStorage.getItem(`vobizAuthId_${uid}`) || localStorage.getItem('vobizAuthId') || 'MA_QTLGTSF9');
      setVobizAuthToken(localStorage.getItem(`vobizAuthToken_${uid}`) || localStorage.getItem('vobizAuthToken') || localStorage.getItem(`vobizApiKey_${uid}`) || localStorage.getItem('vobizApiKey') || '');

      setElevenLabsApiKey(localStorage.getItem(`elevenLabsApiKey_${uid}`) || localStorage.getItem('elevenLabsApiKey') || '');
      setAccountSid(localStorage.getItem(`accountSid_${uid}`) || localStorage.getItem('accountSid') || '');
      setAuthToken(localStorage.getItem(`authToken_${uid}`) || localStorage.getItem('authToken') || '');
      setPhoneNumber(localStorage.getItem(`phoneNumber_${uid}`) || localStorage.getItem('phoneNumber') || '');
    }
    setFetching(false);
  }, []);

  const handleSaveTelephony = (e) => {
    e.preventDefault();
    setLoading(true);
    const uid = (typeof window !== 'undefined' && localStorage.getItem('suvidha_auth_user_id')) || 'default';

    if (typeof window !== 'undefined') {
      localStorage.setItem(`telephonyProvider_${uid}`, provider);
      localStorage.setItem('telephonyProvider', provider);

      localStorage.setItem(`vobizVirtualNumber_${uid}`, vobizVirtualNumber.trim());
      localStorage.setItem('vobizVirtualNumber', vobizVirtualNumber.trim());
      localStorage.setItem(`vobizAuthId_${uid}`, vobizAuthId.trim());
      localStorage.setItem('vobizAuthId', vobizAuthId.trim());
      localStorage.setItem(`vobizAuthToken_${uid}`, vobizAuthToken.trim());
      localStorage.setItem('vobizAuthToken', vobizAuthToken.trim());
      localStorage.setItem(`vobizApiKey_${uid}`, vobizAuthToken.trim());
      localStorage.setItem('vobizApiKey', vobizAuthToken.trim());

      localStorage.setItem(`accountSid_${uid}`, accountSid.trim());
      localStorage.setItem('accountSid', accountSid.trim());
      localStorage.setItem(`authToken_${uid}`, authToken.trim());
      localStorage.setItem('authToken', authToken.trim());
      localStorage.setItem(`phoneNumber_${uid}`, phoneNumber.trim());
      localStorage.setItem('phoneNumber', phoneNumber.trim());
    }

    // Sync with server-side backend permanently
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telephonyProvider: provider,
        vobizAuthId: vobizAuthId.trim(),
        vobizAuthToken: vobizAuthToken.trim(),
        vobizVirtualNumber: vobizVirtualNumber.trim(),
        callerNumber: vobizVirtualNumber.trim(),
        elevenLabsApiKey: elevenLabsApiKey.trim()
      })
    }).catch(console.error);

    setSavedDetails({
      provider: provider === 'vobiz' ? 'Vobiz India (+91)' : provider,
      number: provider === 'vobiz' ? vobizVirtualNumber : phoneNumber,
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
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elevenLabsApiKey: elevenLabsApiKey.trim() })
    }).catch(console.error);
    alert('🎉 ElevenLabs Voice Key Saved Successfully! Available in Incognito and across all sessions.');
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
      alert('🧹 All credentials reset successfully!');
    }
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Settings...</div>;
  }

  return (
    <div style={{ maxWidth: '1050px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>⚙️ Telephony & Voice API Settings</h1>
          <p className="subtitle">Configure your Indian Calling Carrier (Vobiz) and ElevenLabs Real Voice Key</p>
        </div>

        <button onClick={handleClearAll} className="btn btn-secondary" style={{ fontSize: '0.8rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
          🧹 Clear All Saved Keys
        </button>
      </div>

      {/* WHATSAPP CATALOG LINK BANNER */}
      <div className="card mb-6" style={{ padding: '1.25rem 1.5rem', background: 'rgba(16, 185, 129, 0.06)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
        <div className="flex justify-between items-center">
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--accent-green)' }}>
              💬 WhatsApp Catalog & Auto-Send Settings:
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Product Brochure (PDF), Pricing and Auto-WhatsApp message templates are managed exclusively in the WhatsApp tab.
            </div>
          </div>
          <Link href="/whatsapp" className="btn btn-primary" style={{ fontSize: '0.825rem', padding: '0.4rem 1rem' }}>
            Open WhatsApp Automation &rarr;
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '2rem' }}>
        
        {/* CARD 1: Telephony Provider Setup */}
        <div className="card" style={{ padding: '2rem', background: '#0a0a12' }}>
          <div className="flex justify-between items-center mb-2">
            <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>📞 1. Calling Provider Setup</h2>
            <span className="badge success">Active</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Select your carrier for Real Indian Inbound & Outbound Calling:
          </p>

          <form onSubmit={handleSaveTelephony}>
            <div className="form-group mb-4">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Select Calling Carrier</label>
              <select className="form-control" value={provider} onChange={e => setProvider(e.target.value)}>
                <option value="vobiz">🇮🇳 Vobiz India (+91 Indian DID Calling - Recommended)</option>
                <option value="twilio">🇺🇸 Twilio (Global Real Calling)</option>
                <option value="webphone">🌐 Free In-Browser WebCall (Zero Telecom / Free Testing)</option>
              </select>
            </div>

            {/* VOBIZ FIELDS */}
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
                    placeholder="+917965854263" 
                  />
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>2. Vobiz Auth ID</label>
                  <input 
                    required
                    type="text" 
                    className="form-control" 
                    value={vobizAuthId} 
                    onChange={e => setVobizAuthId(e.target.value)} 
                    placeholder="MA_QTLGTSF9" 
                  />
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>3. Vobiz Auth Token</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={vobizAuthToken} 
                    onChange={e => setVobizAuthToken(e.target.value)} 
                    placeholder="Paste Vobiz Auth Token" 
                  />
                </div>
              </>
            )}

            {/* TWILIO FIELDS */}
            {provider === 'twilio' && (
              <>
                <div className="form-group mb-4">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Twilio Phone Number (+1 / +91)</label>
                  <input type="text" className="form-control" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+1234567890" />
                </div>
                <div className="form-group mb-4">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Twilio Account SID</label>
                  <input type="text" className="form-control" value={accountSid} onChange={e => setAccountSid(e.target.value)} placeholder="ACxxxxxxxxxxxx" />
                </div>
                <div className="form-group mb-4">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Twilio Auth Token</label>
                  <input type="password" className="form-control" value={authToken} onChange={e => setAuthToken(e.target.value)} placeholder="Auth Token" />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', fontWeight: '700' }}>
              {loading ? 'Saving...' : '💾 Save Telephony Settings'}
            </button>
          </form>
        </div>

        {/* CARD 2: ElevenLabs Human Voice Engine */}
        <div className="card" style={{ padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.3)', background: '#0a0a12', height: 'fit-content' }}>
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

      </div>

      {/* Confirmation Modal */}
      {showSavedModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem' }}>Telephony Configured!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Carrier: <strong>{savedDetails?.provider}</strong> | Virtual DID: <strong>{savedDetails?.number}</strong>
            </p>
            <button onClick={() => setShowSavedModal(false)} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: '700' }}>
              Got It & Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
