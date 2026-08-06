'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [provider, setProvider] = useState('twilio');
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
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
    // Load local storage values for WhatsApp and Sarvam AI configurations
    if (typeof window !== 'undefined') {
      setMetaAccessToken(localStorage.getItem('metaAccessToken') || '');
      setMetaPhoneNumberId(localStorage.getItem('metaPhoneNumberId') || '');
      setAdminNumber(localStorage.getItem('adminNumber') || '');
      setSarvamApiKey(localStorage.getItem('sarvamApiKey') || '');
    }
  }, []);

  const fetchCredentials = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus({ type: 'error', message: 'Please log in to manage credentials.' });
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
        setProvider(data.provider);
        setAccountSid(data.account_sid);
        setAuthToken(data.auth_token);
        setPhoneNumber(data.phone_number);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required.');

      // Check if credentials record exists
      const { data: existing } = await supabase
        .from('credentials')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      if (existing) {
        // Update
        const { error: err } = await supabase
          .from('credentials')
          .update({
            provider,
            account_sid: accountSid,
            auth_token: authToken,
            phone_number: phoneNumber
          })
          .eq('user_id', user.id);
        error = err;
      } else {
        // Insert
        const { error: err } = await supabase
          .from('credentials')
          .insert([{
            user_id: user.id,
            provider,
            account_sid: accountSid,
            auth_token: authToken,
            phone_number: phoneNumber
          }]);
        error = err;
      }

      if (error) throw error;

      // Save WhatsApp & Sarvam settings in LocalStorage
      localStorage.setItem('metaAccessToken', metaAccessToken);
      localStorage.setItem('metaPhoneNumberId', metaPhoneNumberId);
      localStorage.setItem('adminNumber', adminNumber);
      localStorage.setItem('sarvamApiKey', sarvamApiKey);

      setStatus({ type: 'success', message: '🎉 Telephony, WhatsApp, & Sarvam credentials saved successfully!' });
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
    <div>
      <h1>⚙️ Settings</h1>
      <p className="subtitle" style={{ marginBottom: '2rem' }}>Configure integrations and AI voice providers</p>

      {status && (
        <div className="card mb-4" style={{
          borderColor: status.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
          padding: '1rem 1.5rem',
          maxWidth: '800px'
        }}>
          {status.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Telephony config */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginTop: 0 }}>🔌 Telephony Config</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Connect your Twilio/Plivo account for outbound and inbound calls.
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Telephony Provider</label>
              <select className="form-control" value={provider} onChange={e => setProvider(e.target.value)}>
                <option value="twilio">Twilio</option>
                <option value="plivo">Plivo</option>
              </select>
            </div>

            <div className="form-group">
              <label>{provider === 'twilio' ? 'Twilio Account SID' : 'Plivo Auth ID'}</label>
              <input required type="text" className="form-control" value={accountSid} onChange={e => setAccountSid(e.target.value)} placeholder="AC..." />
            </div>

            <div className="form-group">
              <label>{provider === 'twilio' ? 'Twilio Auth Token' : 'Plivo Auth Token'}</label>
              <input required type="password" className="form-control" value={authToken} onChange={e => setAuthToken(e.target.value)} placeholder="••••••••••••" />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>{provider === 'twilio' ? 'Twilio Phone Number' : 'Plivo Phone Number'}</label>
              <input required type="tel" className="form-control" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+1..." />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              Save Telephony
            </button>
          </form>
        </div>

        {/* Sarvam AI config */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginTop: 0 }}>🇮🇳 Sarvam AI Voice</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Connect your Sarvam AI account subscription key for premium Hinglish voices.
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>Sarvam AI Subscription Key</label>
              <input type="password" className="form-control" value={sarvamApiKey} onChange={e => setSarvamApiKey(e.target.value)} placeholder="e.g. 5d5a2d9a-..." />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              Save Sarvam AI
            </button>
          </form>
        </div>

        {/* WhatsApp config */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginTop: 0 }}>💬 WhatsApp CRM Alert</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Receive real-time notifications on WhatsApp for positive qualified hot leads.
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Meta Access Token</label>
              <input type="password" className="form-control" value={metaAccessToken} onChange={e => setMetaAccessToken(e.target.value)} placeholder="EAAb..." />
            </div>

            <div className="form-group">
              <label>Meta Phone Number ID</label>
              <input type="text" className="form-control" value={metaPhoneNumberId} onChange={e => setMetaPhoneNumberId(e.target.value)} placeholder="e.g. 1048472917" />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>Admin Notification Number</label>
              <input type="tel" className="form-control" value={adminNumber} onChange={e => setAdminNumber(e.target.value)} placeholder="+91..." />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              Save WhatsApp
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
