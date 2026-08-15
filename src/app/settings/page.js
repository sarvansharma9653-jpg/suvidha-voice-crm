'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [provider, setProvider] = useState('webphone');
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [exotelSubdomain, setExotelSubdomain] = useState('');
  
  // WhatsApp Meta Cloud API Credentials
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState('');
  const [adminNumber, setAdminNumber] = useState('');

  // Sarvam AI API Key Credentials
  const [sarvamApiKey, setSarvamApiKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchCredentials();
    // Load local storage values
    if (typeof window !== 'undefined') {
      setMetaAccessToken(localStorage.getItem('metaAccessToken') || '');
      setMetaPhoneNumberId(localStorage.getItem('metaPhoneNumberId') || '');
      setAdminNumber(localStorage.getItem('adminNumber') || '');
      setSarvamApiKey(localStorage.getItem('sarvamApiKey') || '');
      setExotelSubdomain(localStorage.getItem('exotelSubdomain') || '');
      setProvider(localStorage.getItem('telephonyProvider') || 'webphone');
      setAccountSid(localStorage.getItem('accountSid') || '');
      setAuthToken(localStorage.getItem('authToken') || '');
      setPhoneNumber(localStorage.getItem('phoneNumber') || '');
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
        setProvider(data.provider || 'webphone');
        setAccountSid(data.account_sid || '');
        setAuthToken(data.auth_token || '');
        setPhoneNumber(data.phone_number || '');
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
      // Save local storage configurations
      localStorage.setItem('telephonyProvider', provider);
      localStorage.setItem('accountSid', accountSid);
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('phoneNumber', phoneNumber);
      localStorage.setItem('exotelSubdomain', exotelSubdomain);
      localStorage.setItem('metaAccessToken', metaAccessToken);
      localStorage.setItem('metaPhoneNumberId', metaPhoneNumberId);
      localStorage.setItem('adminNumber', adminNumber);
      localStorage.setItem('sarvamApiKey', sarvamApiKey);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Upsert to Supabase
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

      setStatus({ type: 'success', message: '🎉 Telephony Provider & Integration credentials saved successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: `❌ Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Settings...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>⚙️ Telephony & Client Settings</h1>
          <p className="subtitle">Connect your preferred calling provider and AI credentials</p>
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
            Choose your calling provider. Leave as <strong>Built-in Webphone</strong> to test 100% free without any API keys!
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Select Telephony Provider</label>
              <select className="form-control" value={provider} onChange={e => setProvider(e.target.value)}>
                <option value="webphone">🌐 Built-in Free Browser Webphone (No API Key Required)</option>
                <option value="exotel">🇮🇳 Exotel India (+91 Real Mobile Calling)</option>
                <option value="twilio">🇺🇸 Twilio (Global Calling & SMS)</option>
                <option value="plivo">⚡ Plivo Telephony</option>
                <option value="vonage">📱 Vonage / Sinch</option>
              </select>
            </div>

            {provider !== 'webphone' && (
              <>
                {provider === 'exotel' && (
                  <div className="form-group">
                    <label>Exotel Account Subdomain / SID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={exotelSubdomain} 
                      onChange={e => setExotelSubdomain(e.target.value)} 
                      placeholder="e.g. mycompany.exotel.com" 
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>{provider === 'twilio' ? 'Twilio Account SID' : provider === 'exotel' ? 'Exotel API Key' : 'Account SID / API Key'}</label>
                  <input 
                    required 
                    type="text" 
                    className="form-control" 
                    value={accountSid} 
                    onChange={e => setAccountSid(e.target.value)} 
                    placeholder="Enter SID or API Key..." 
                  />
                </div>

                <div className="form-group">
                  <label>{provider === 'twilio' ? 'Twilio Auth Token' : 'Auth Token / API Secret'}</label>
                  <input 
                    required 
                    type="password" 
                    className="form-control" 
                    value={authToken} 
                    onChange={e => setAuthToken(e.target.value)} 
                    placeholder="••••••••••••" 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Caller Phone Number / Virtual Number</label>
                  <input 
                    required 
                    type="tel" 
                    className="form-control" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                    placeholder="+919876543210 or +1..." 
                  />
                </div>
              </>
            )}

            {provider === 'webphone' && (
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                ✅ <strong>Free Testing Mode Active!</strong> Your client dashboard can place test AI calls using the browser Webphone without spending money on Twilio/Exotel credits.
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              💾 Save Telephony Settings
            </button>
          </form>
        </div>

        {/* Sarvam AI & WhatsApp config */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>🇮🇳 Sarvam AI & WhatsApp Alerts</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Configure premium Hindi voices and WhatsApp Hot Lead notifications.
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Sarvam AI Subscription Key (Optional)</label>
              <input 
                type="password" 
                className="form-control" 
                value={sarvamApiKey} 
                onChange={e => setSarvamApiKey(e.target.value)} 
                placeholder="e.g. 5d5a2d9a-..." 
              />
            </div>

            <div className="form-group">
              <label>WhatsApp Meta Access Token</label>
              <input 
                type="password" 
                className="form-control" 
                value={metaAccessToken} 
                onChange={e => setMetaAccessToken(e.target.value)} 
                placeholder="EAAG..." 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Admin Mobile Number for Hot Lead WhatsApp Alerts</label>
              <input 
                type="tel" 
                className="form-control" 
                value={adminNumber} 
                onChange={e => setAdminNumber(e.target.value)} 
                placeholder="+919876543210" 
              />
            </div>

            <button type="submit" className="btn btn-success" style={{ width: '100%' }} disabled={loading}>
              💾 Save AI & Notification Keys
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
