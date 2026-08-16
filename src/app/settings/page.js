'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [provider, setProvider] = useState('twilio');
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+17372212163');
  const [exotelSubdomain, setExotelSubdomain] = useState('');
  
  // WhatsApp Meta Cloud API Credentials
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState('');
  const [adminNumber, setAdminNumber] = useState('+917707978068');

  // Sarvam AI API Key Credentials
  const [sarvamApiKey, setSarvamApiKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchCredentials();
    if (typeof window !== 'undefined') {
      setMetaAccessToken(localStorage.getItem('metaAccessToken') || '');
      setMetaPhoneNumberId(localStorage.getItem('metaPhoneNumberId') || '');
      setAdminNumber(localStorage.getItem('adminNumber') || '+917707978068');
      setSarvamApiKey(localStorage.getItem('sarvamApiKey') || '');
      setExotelSubdomain(localStorage.getItem('exotelSubdomain') || '');
      setProvider(localStorage.getItem('telephonyProvider') || 'twilio');
      setAccountSid(localStorage.getItem('accountSid') || '');
      setAuthToken(localStorage.getItem('authToken') || '');
      setPhoneNumber(localStorage.getItem('phoneNumber') || '+17372212163');
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
        setProvider(data.provider || 'twilio');
        setAccountSid(data.account_sid || '');
        setAuthToken(data.auth_token || '');
        setPhoneNumber(data.phone_number || '+17372212163');
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
      localStorage.setItem('sarvamApiKey', sarvamApiKey);

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

      setStatus({ type: 'success', message: '🎉 Telephony Credentials & Auth Tokens Saved Successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: `❌ Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Settings...</div>;
  }

  // Dynamic Provider Specific Labels
  const getSidLabel = () => {
    if (provider === 'twilio') return 'Twilio Account SID';
    if (provider === 'exotel') return 'Exotel Account SID / Subdomain';
    if (provider === 'sarvam_vobiz') return 'Sarvam API Key';
    return 'Account SID / API Key';
  };

  const getAuthLabel = () => {
    if (provider === 'twilio') return 'Twilio Auth Token';
    if (provider === 'exotel') return 'Exotel Auth Token / API Secret';
    if (provider === 'sarvam_vobiz') return 'Sarvam Secret Token';
    return 'Auth Token / API Secret';
  };

  const getPhoneLabel = () => {
    if (provider === 'twilio') return 'Twilio Phone Number (+17372212163)';
    if (provider === 'exotel') return 'Exotel Virtual Number (+91...)';
    if (provider === 'sarvam_vobiz') return 'Sarvam Active Number (+917965854130)';
    return 'Caller Phone Number';
  };

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
            Configure your active provider credentials below:
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Select Telephony Provider</label>
              <select className="form-control" value={provider} onChange={e => setProvider(e.target.value)}>
                <option value="twilio">🇺🇸 Twilio (Real Outbound Calls via +17372212163)</option>
                <option value="sarvam_vobiz">🇮🇳 Sarvam Vobiz (+917965854130 Real Indian Calling)</option>
                <option value="exotel">🇮🇳 Exotel India (+91 Enterprise Calling)</option>
                <option value="webphone">🌐 Built-in Free Browser Webphone (Testing Mode)</option>
              </select>
            </div>

            {provider !== 'webphone' && (
              <>
                {provider === 'exotel' && (
                  <div className="form-group">
                    <label>Exotel Subdomain / Account ID</label>
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
                  <label>{getSidLabel()}</label>
                  <input 
                    required 
                    type="text" 
                    className="form-control" 
                    value={accountSid} 
                    onChange={e => setAccountSid(e.target.value)} 
                    placeholder="Enter Account SID..." 
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
                    placeholder="Enter Auth Token..." 
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
                    placeholder="+17372212163 or +91..." 
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              💾 Save Telephony Settings
            </button>
          </form>
        </div>

        {/* WhatsApp & Optional Keys */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>📱 WhatsApp Lead Alerts & Options</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Enter your WhatsApp mobile number to receive instant notifications when a Hot Lead is identified!
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group mb-4">
              <label>Admin Mobile Number for WhatsApp Alerts (Required)</label>
              <input 
                required
                type="tel" 
                className="form-control" 
                value={adminNumber} 
                onChange={e => setAdminNumber(e.target.value)} 
                placeholder="+917707978068" 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: '4px', display: 'block' }}>
                ✅ Hot Lead alerts will be sent to this WhatsApp mobile number!
              </span>
            </div>

            <div className="form-group mb-4">
              <label>Sarvam AI Key (Optional - Leave blank for Free Built-in Voice Engine)</label>
              <input 
                type="password" 
                className="form-control" 
                value={sarvamApiKey} 
                onChange={e => setSarvamApiKey(e.target.value)} 
                placeholder="Optional (sk_samvaad_...)" 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>WhatsApp Meta Access Token (Optional)</label>
              <input 
                type="password" 
                className="form-control" 
                value={metaAccessToken} 
                onChange={e => setMetaAccessToken(e.target.value)} 
                placeholder="Optional (EAAG...)" 
              />
            </div>

            <button type="submit" className="btn btn-success" style={{ width: '100%' }} disabled={loading}>
              💾 Save Alert Number & Keys
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
