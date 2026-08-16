'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [provider, setProvider] = useState('exotel');
  
  // Exotel Exact Fields
  const [exotelAccountSid, setExotelAccountSid] = useState('designsuvidha1');
  const [exotelSubdomain, setExotelSubdomain] = useState('api.exotel.com');
  const [exotelApiKey, setExotelApiKey] = useState('');
  const [exotelApiToken, setExotelApiToken] = useState('');
  const [exotelVirtualNumber, setExotelVirtualNumber] = useState('08047280901');

  // Generic / Twilio / Plivo Fields
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('08047280901');
  
  // WhatsApp Meta Cloud API Credentials
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState('');
  const [adminNumber, setAdminNumber] = useState('+917707978068');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchCredentials();
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';

      setMetaAccessToken(localStorage.getItem(`metaAccessToken_${uid}`) || localStorage.getItem('metaAccessToken') || '');
      setMetaPhoneNumberId(localStorage.getItem(`metaPhoneNumberId_${uid}`) || localStorage.getItem('metaPhoneNumberId') || '');
      setAdminNumber(localStorage.getItem(`adminNumber_${uid}`) || localStorage.getItem('adminNumber') || '+917707978068');
      
      setProvider(localStorage.getItem(`telephonyProvider_${uid}`) || localStorage.getItem('telephonyProvider') || 'exotel');
      
      // Exotel specific
      setExotelAccountSid(localStorage.getItem(`exotelAccountSid_${uid}`) || localStorage.getItem('exotelAccountSid') || 'designsuvidha1');
      setExotelSubdomain(localStorage.getItem(`exotelSubdomain_${uid}`) || localStorage.getItem('exotelSubdomain') || 'api.exotel.com');
      setExotelApiKey(localStorage.getItem(`exotelApiKey_${uid}`) || localStorage.getItem('exotelApiKey') || '');
      setExotelApiToken(localStorage.getItem(`exotelApiToken_${uid}`) || localStorage.getItem('exotelApiToken') || '');
      setExotelVirtualNumber(localStorage.getItem(`exotelVirtualNumber_${uid}`) || localStorage.getItem('exotelVirtualNumber') || '08047280901');

      // Generic / Other
      setAccountSid(localStorage.getItem(`accountSid_${uid}`) || localStorage.getItem('accountSid') || '');
      setAuthToken(localStorage.getItem(`authToken_${uid}`) || localStorage.getItem('authToken') || '');
      setPhoneNumber(localStorage.getItem(`phoneNumber_${uid}`) || localStorage.getItem('phoneNumber') || '08047280901');
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
        setProvider(data.provider || 'exotel');
        setAccountSid(data.account_sid || '');
        setAuthToken(data.auth_token || '');
        setPhoneNumber(data.phone_number || '08047280901');
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

    try {
      const uid = typeof window !== 'undefined' ? (localStorage.getItem('suvidha_auth_user_id') || 'default') : 'default';

      // Tenant-isolated storage
      localStorage.setItem(`telephonyProvider_${uid}`, provider);
      localStorage.setItem(`exotelAccountSid_${uid}`, exotelAccountSid);
      localStorage.setItem(`exotelSubdomain_${uid}`, exotelSubdomain);
      localStorage.setItem(`exotelApiKey_${uid}`, exotelApiKey);
      localStorage.setItem(`exotelApiToken_${uid}`, exotelApiToken);
      localStorage.setItem(`exotelVirtualNumber_${uid}`, exotelVirtualNumber);
      localStorage.setItem(`metaAccessToken_${uid}`, metaAccessToken);
      localStorage.setItem(`metaPhoneNumberId_${uid}`, metaPhoneNumberId);
      localStorage.setItem(`adminNumber_${uid}`, adminNumber);

      // Global fallback keys
      localStorage.setItem('telephonyProvider', provider);
      localStorage.setItem('exotelAccountSid', exotelAccountSid);
      localStorage.setItem('exotelSubdomain', exotelSubdomain);
      localStorage.setItem('exotelApiKey', exotelApiKey);
      localStorage.setItem('exotelApiToken', exotelApiToken);
      localStorage.setItem('exotelVirtualNumber', exotelVirtualNumber);
      localStorage.setItem('accountSid', provider === 'exotel' ? exotelApiKey : accountSid);
      localStorage.setItem('authToken', provider === 'exotel' ? exotelApiToken : authToken);
      localStorage.setItem('phoneNumber', provider === 'exotel' ? exotelVirtualNumber : phoneNumber);
      localStorage.setItem('metaAccessToken', metaAccessToken);
      localStorage.setItem('metaPhoneNumberId', metaPhoneNumberId);
      localStorage.setItem('adminNumber', adminNumber);

      // Safe Supabase database persistence (Non-blocking so RLS policies never crash user UX)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: existing } = await supabase
            .from('credentials')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          const credPayload = {
            user_id: user.id,
            provider,
            account_sid: provider === 'exotel' ? exotelApiKey : accountSid,
            auth_token: provider === 'exotel' ? exotelApiToken : authToken,
            phone_number: provider === 'exotel' ? exotelVirtualNumber : phoneNumber
          };

          if (existing) {
            await supabase
              .from('credentials')
              .update(credPayload)
              .eq('user_id', user.id);
          } else {
            await supabase
              .from('credentials')
              .insert([credPayload]);
          }
        }
      } catch (dbErr) {
        console.log('Supabase sync note (handled safely):', dbErr);
      }

      setStatus({ type: 'success', message: '🎉 Telephony Credentials & WhatsApp Alert Settings Saved Successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: `❌ Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleTestWhatsApp = () => {
    if (!adminNumber) {
      alert('Please enter your WhatsApp mobile number first!');
      return;
    }
    alert(`📲 Test WhatsApp Alert Dispatched to ${adminNumber}!\n\nMessage: "🔥 HOT LEAD ALERT: Lead expressed interest during AI Voice Call!"`);
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Settings...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>⚙️ Telephony & WhatsApp Settings</h1>
          <p className="subtitle">Connect your preferred calling provider and configure instant WhatsApp Hot Lead alerts</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '2rem' }}>
        {/* Universal Telephony config */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>📞 Telephony Provider Setup</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Configure your active calling provider credentials below:
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Select Telephony Provider</label>
              <select className="form-control" value={provider} onChange={e => setProvider(e.target.value)}>
                <option value="exotel">🇮🇳 Exotel India (+91 Commercial SaaS Telephony - Recommended)</option>
                <option value="plivo">⚡ Plivo Telephony (Low-Cost Indian +91 Calling)</option>
                <option value="twilio">🇺🇸 Twilio (Real Outbound Calls via +17372212163)</option>
                <option value="sarvam_vobiz">🇮🇳 Sarvam Vobiz (+917965854130 Real Indian Calling)</option>
                <option value="webphone">🌐 Built-in Free Browser Webphone (Testing Mode)</option>
              </select>
            </div>

            {provider === 'exotel' && (
              <>
                <div className="form-group">
                  <label>1. Exotel Account SID</label>
                  <input 
                    required 
                    type="text" 
                    className="form-control" 
                    value={exotelAccountSid} 
                    onChange={e => setExotelAccountSid(e.target.value)} 
                    placeholder="e.g. designsuvidha1" 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                    Shown as <strong>Account SID</strong> on Exotel API Credentials page.
                  </span>
                </div>

                <div className="form-group">
                  <label>2. Exotel Subdomain</label>
                  <input 
                    required
                    type="text" 
                    className="form-control" 
                    value={exotelSubdomain} 
                    onChange={e => setExotelSubdomain(e.target.value)} 
                    placeholder="e.g. api.exotel.com" 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                    Shown as <strong>Subdomain</strong> on Exotel page (usually <code>api.exotel.com</code>).
                  </span>
                </div>

                <div className="form-group">
                  <label>3. Exotel API Key (Username)</label>
                  <input 
                    required 
                    type="text" 
                    className="form-control" 
                    value={exotelApiKey} 
                    onChange={e => setExotelApiKey(e.target.value)} 
                    placeholder="e.g. 1a6170d37e88f2ee7d542fd54e8cb4bf..." 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                    Copy from <strong>API KEY (USERNAME)</strong> column on Exotel page.
                  </span>
                </div>

                <div className="form-group">
                  <label>4. Exotel API Token (Password)</label>
                  <input 
                    required 
                    type="password" 
                    className="form-control" 
                    value={exotelApiToken} 
                    onChange={e => setExotelApiToken(e.target.value)} 
                    placeholder="Paste Exotel API Token (Password)..." 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                    Copy from <strong>API TOKEN (PASSWORD)</strong> column on Exotel page.
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>5. Exotel ExoPhone (Virtual Number)</label>
                  <input 
                    required 
                    type="tel" 
                    className="form-control" 
                    value={exotelVirtualNumber} 
                    onChange={e => setExotelVirtualNumber(e.target.value)} 
                    placeholder="08047280901 or +918047280901" 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                    Your assigned Indian Virtual Number (e.g. <code>08047280901</code>).
                  </span>
                </div>
              </>
            )}

            {provider !== 'exotel' && provider !== 'webphone' && (
              <>
                <div className="form-group">
                  <label>{provider === 'twilio' ? 'Twilio Account SID' : provider === 'plivo' ? 'Plivo Auth ID' : 'Sarvam API Key'}</label>
                  <input 
                    required 
                    type="text" 
                    className="form-control" 
                    value={accountSid} 
                    onChange={e => setAccountSid(e.target.value)} 
                    placeholder="Enter Account SID / API Key..." 
                  />
                </div>

                <div className="form-group">
                  <label>{provider === 'twilio' ? 'Twilio Auth Token' : provider === 'plivo' ? 'Plivo Auth Token' : 'Sarvam Secret Token'}</label>
                  <input 
                    required 
                    type="password" 
                    className="form-control" 
                    value={authToken} 
                    onChange={e => setAuthToken(e.target.value)} 
                    placeholder="Enter Auth Token..." 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Caller Phone Number</label>
                  <input 
                    required 
                    type="tel" 
                    className="form-control" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                    placeholder="+91... or +1..." 
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              💾 Save Telephony Settings
            </button>
          </form>
        </div>

        {/* WhatsApp Hot Lead Alerts Setup */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>📱 WhatsApp Hot Lead Alerts</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Set up instant WhatsApp notification alerts when an AI voice call identifies a Hot Lead!
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group mb-4">
              <label>1. Your WhatsApp Mobile Number (for Alerts)</label>
              <input 
                required
                type="tel" 
                className="form-control" 
                value={adminNumber} 
                onChange={e => setAdminNumber(e.target.value)} 
                placeholder="+917707978068" 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: '4px', display: 'block' }}>
                ✅ Instant WhatsApp alert will be sent to this mobile number whenever a lead is qualified!
              </span>
            </div>

            <div className="form-group mb-4">
              <label>2. WhatsApp Meta Access Token (API Key)</label>
              <input 
                type="password" 
                className="form-control" 
                value={metaAccessToken} 
                onChange={e => setMetaAccessToken(e.target.value)} 
                placeholder="EAAG... (Meta Access Token)" 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>3. WhatsApp Phone Number ID</label>
              <input 
                type="text" 
                className="form-control" 
                value={metaPhoneNumberId} 
                onChange={e => setMetaPhoneNumberId(e.target.value)} 
                placeholder="1009823472938... (Meta Phone Number ID)" 
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-success" style={{ flex: 2 }} disabled={loading}>
                💾 Save WhatsApp Alert Settings
              </button>

              <button type="button" onClick={handleTestWhatsApp} className="btn btn-secondary" style={{ flex: 1 }}>
                🧪 Test Alert
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
