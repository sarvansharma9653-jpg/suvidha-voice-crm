'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [provider, setProvider] = useState('sarvam_vobiz');
  const [accountSid, setAccountSid] = useState('sk_samvaad_zqem37no_0nBPIELyiA5OEXRXerKOyaBN');
  const [authToken, setAuthToken] = useState('sk_samvaad_zqem37no_0nBPIELyiA5OEXRXerKOyaBN');
  const [phoneNumber, setPhoneNumber] = useState('+917965854130');
  const [exotelSubdomain, setExotelSubdomain] = useState('');
  
  // WhatsApp Meta Cloud API Credentials
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState('');
  const [adminNumber, setAdminNumber] = useState('');

  // Sarvam AI API Key Credentials
  const [sarvamApiKey, setSarvamApiKey] = useState('sk_samvaad_zqem37no_0nBPIELyiA5OEXRXerKOyaBN');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchCredentials();
    if (typeof window !== 'undefined') {
      setMetaAccessToken(localStorage.getItem('metaAccessToken') || '');
      setMetaPhoneNumberId(localStorage.getItem('metaPhoneNumberId') || '');
      setAdminNumber(localStorage.getItem('adminNumber') || '');
      setSarvamApiKey(localStorage.getItem('sarvamApiKey') || 'sk_samvaad_zqem37no_0nBPIELyiA5OEXRXerKOyaBN');
      setExotelSubdomain(localStorage.getItem('exotelSubdomain') || '');
      setProvider(localStorage.getItem('telephonyProvider') || 'sarvam_vobiz');
      setAccountSid(localStorage.getItem('accountSid') || 'sk_samvaad_zqem37no_0nBPIELyiA5OEXRXerKOyaBN');
      setAuthToken(localStorage.getItem('authToken') || 'sk_samvaad_zqem37no_0nBPIELyiA5OEXRXerKOyaBN');
      setPhoneNumber(localStorage.getItem('phoneNumber') || '+917965854130');
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
        setProvider(data.provider || 'sarvam_vobiz');
        setAccountSid(data.account_sid || 'sk_samvaad_zqem37no_0nBPIELyiA5OEXRXerKOyaBN');
        setAuthToken(data.auth_token || 'sk_samvaad_zqem37no_0nBPIELyiA5OEXRXerKOyaBN');
        setPhoneNumber(data.phone_number || '+917965854130');
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

      setStatus({ type: 'success', message: '🎉 Telephony Provider & Sarvam Vobiz Credentials Saved Successfully!' });
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
            Choose your calling provider. Select <strong>Sarvam Vobiz</strong> for your active Indian number +917965854130!
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Select Telephony Provider</label>
              <select className="form-control" value={provider} onChange={e => setProvider(e.target.value)}>
                <option value="sarvam_vobiz">🇮🇳 Sarvam Vobiz (+917965854130 Real Indian Mobile Calling)</option>
                <option value="webphone">🌐 Built-in Free Browser Webphone (No API Key Required)</option>
                <option value="exotel">🇮🇳 Exotel India (+91 Real Mobile Calling)</option>
                <option value="twilio">🇺🇸 Twilio (Global Calling & SMS)</option>
                <option value="plivo">⚡ Plivo Telephony</option>
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
                  <label>{provider === 'sarvam_vobiz' ? 'Sarvam API Key' : provider === 'twilio' ? 'Twilio Account SID' : 'Account SID / API Key'}</label>
                  <input 
                    required 
                    type="text" 
                    className="form-control" 
                    value={accountSid} 
                    onChange={e => setAccountSid(e.target.value)} 
                    placeholder="sk_samvaad_..." 
                  />
                </div>

                <div className="form-group">
                  <label>{provider === 'sarvam_vobiz' ? 'Sarvam Secret / Auth Token' : 'Auth Token / API Secret'}</label>
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
                  <label>Caller Phone Number (Your Active Indian Number)</label>
                  <input 
                    required 
                    type="tel" 
                    className="form-control" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                    placeholder="+917965854130" 
                  />
                </div>
              </>
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
              <label>Sarvam AI Subscription Key</label>
              <input 
                type="password" 
                className="form-control" 
                value={sarvamApiKey} 
                onChange={e => setSarvamApiKey(e.target.value)} 
                placeholder="sk_samvaad_..." 
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
                placeholder="+917707978068" 
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
