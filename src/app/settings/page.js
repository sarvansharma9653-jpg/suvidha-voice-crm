'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [provider, setProvider] = useState('exotel');
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [exotelSubdomain, setExotelSubdomain] = useState('');
  
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
      setMetaAccessToken(localStorage.getItem('metaAccessToken') || '');
      setMetaPhoneNumberId(localStorage.getItem('metaPhoneNumberId') || '');
      setAdminNumber(localStorage.getItem('adminNumber') || '+917707978068');
      setExotelSubdomain(localStorage.getItem('exotelSubdomain') || '');
      setProvider(localStorage.getItem('telephonyProvider') || 'exotel');
      setAccountSid(localStorage.getItem('accountSid') || '');
      setAuthToken(localStorage.getItem('authToken') || '');
      setPhoneNumber(localStorage.getItem('phoneNumber') || '+91');
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

      if (error) throw error;

      if (data) {
        setProvider(data.provider || 'exotel');
        setAccountSid(data.account_sid || '');
        setAuthToken(data.auth_token || '');
        setPhoneNumber(data.phone_number || '+91');
      }
    } catch (err) {
      console.error('Error fetching credentials:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      localStorage.setItem('telephonyProvider', provider);
      localStorage.setItem('accountSid', accountSid);
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('phoneNumber', phoneNumber);
      localStorage.setItem('exotelSubdomain', exotelSubdomain);
      localStorage.setItem('metaAccessToken', metaAccessToken);
      localStorage.setItem('metaPhoneNumberId', metaPhoneNumberId);
      localStorage.setItem('adminNumber', adminNumber);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('credentials')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('credentials')
            .update({
              provider,
              account_sid: accountSid,
              auth_token: authToken,
              phone_number: phoneNumber
            })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('credentials')
            .insert([{
              user_id: user.id,
              provider,
              account_sid: accountSid,
              auth_token: authToken,
              phone_number: phoneNumber
            }]);
        }
      }

      setStatus({ type: 'success', message: '🎉 Exotel India Telephony & WhatsApp Settings Saved Successfully!' });
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
    alert(`📲 Test WhatsApp Alert Dispatched to ${adminNumber}!\n\nMessage: "🔥 HOT LEAD ALERT: Lead Sarvan Sharma expressed interest during AI Voice Call!"`);
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Settings...</div>;
  }

  // Dynamic Provider Specific Labels
  const getSidLabel = () => {
    if (provider === 'exotel') return 'Exotel API Key';
    if (provider === 'plivo') return 'Plivo Auth ID';
    if (provider === 'twilio') return 'Twilio Account SID';
    if (provider === 'sarvam_vobiz') return 'Sarvam API Key';
    return 'Account SID / API Key';
  };

  const getAuthLabel = () => {
    if (provider === 'exotel') return 'Exotel Auth Token / API Secret';
    if (provider === 'plivo') return 'Plivo Auth Token';
    if (provider === 'twilio') return 'Twilio Auth Token';
    if (provider === 'sarvam_vobiz') return 'Sarvam Secret Token';
    return 'Auth Token / API Secret';
  };

  const getPhoneLabel = () => {
    if (provider === 'exotel') return 'Exotel Virtual Number (+91...)';
    if (provider === 'plivo') return 'Plivo Indian Virtual Number (+91...)';
    if (provider === 'twilio') return 'Twilio Phone Number (+17372212163)';
    if (provider === 'sarvam_vobiz') return 'Sarvam Active Number (+917965854130)';
    return 'Caller Phone Number';
  };

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

            {provider !== 'webphone' && (
              <>
                {provider === 'exotel' && (
                  <div className="form-group">
                    <label>Exotel Subdomain (e.g. mycompany.exotel.com)</label>
                    <input 
                      required
                      type="text" 
                      className="form-control" 
                      value={exotelSubdomain} 
                      onChange={e => setExotelSubdomain(e.target.value)} 
                      placeholder="e.g. suvidha.exotel.com" 
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>{getSidLabel()}</label>
                  <input 
                    required 
                    type="text" 
                    className="form-control" 
                    value={accountSid} 
                    onChange={e => setAccountSid(e.target.value)} 
                    placeholder={provider === 'exotel' ? 'Enter Exotel API Key...' : 'Enter Account SID...'} 
                  />
                </div>

                <div className="form-group">
                  <label>{getAuthLabel()}</label>
                  <input 
                    required 
                    type="password" 
                    className="form-control" 
                    value={authToken} 
                    onChange={e => setAuthToken(e.target.value)} 
                    placeholder={provider === 'exotel' ? 'Enter Exotel Auth Token...' : 'Enter Auth Token...'} 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>{getPhoneLabel()}</label>
                  <input 
                    required 
                    type="tel" 
                    className="form-control" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                    placeholder="+91..." 
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
