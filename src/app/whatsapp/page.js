'use client';
import { useState, useEffect } from 'react';
import { store } from '@/lib/store';

export default function WhatsAppPage() {
  const defaultShreeName = 'The Shree Aangan - 85 Acres JDA & RERA Township (Tonk Road, Jaipur)';
  const defaultShreePrice = '₹800 – ₹2,750 / sq.ft (EMI Available)';
  const defaultShreeBrochure = 'https://drive.google.com/file/d/103owbyObLS3CVyerjrP_Ryr_OVlU2QDG/view?usp=sharing';
  const defaultShreeImg = 'https://theshreeaangan.com/images/og-image.jpg';
  const defaultShreeTpl = `नमस्ते जी! 🙏

मैं Pooja, The Shree Aangan Developers से बोल रही हूँ।

अभी हमारी बात हुई — जैसा वादा किया था:

🏡 *THE SHREE AANGAN — Jaipur का GOLDEN INVESTMENT*

📍 Location: Chaksu, Tonk Road, Jaipur (NH-12 पर)
📐 Project: 85 Acres JDA Approved Gated Township
✅ RERA No: RAJ/P/2026/4660
💰 Price: ₹800 – ₹2,750/sq.ft (EMI Available)
📈 Annual Growth: 18-25% Year-on-Year!

🚇 *क्यों अभी खरीदना सबसे सही है?*
✅ Jaipur Metro Phase 2 — Construction Started!
✅ Jaipur Ring Road — Connected!
✅ DMIC Influence Zone — Industrial Growth!
✅ Chaksu Satellite City Master Plan — Government Backed!
✅ Metro आने पर 40-60% और Price बढ़ेगी!

📍 *Office Location:*
https://maps.app.goo.gl/1PG2inY6tC69u2br7

📍 *Project Site Location:*
https://maps.app.goo.gl/XsLcKe4BaHuZFT759

📂 *Brochure & Details:*
https://drive.google.com/file/d/103owbyObLS3CVyerjrP_Ryr_OVlU2QDG/view

🌐 *Website:*
https://www.theshreeaangan.com/

📸 *Instagram (Live Project Photos):*
https://www.instagram.com/shreeaangandevelopers/

📞 Site Visit Free है — कोई Commitment नहीं!
एक बार देखिए, खुद फैसला कीजिए! 🏡✨`;

  const [productName, setProductName] = useState(defaultShreeName);
  const [productPricing, setProductPricing] = useState(defaultShreePrice);
  const [brochureUrl, setBrochureUrl] = useState(defaultShreeBrochure);
  const [productImageUrl, setProductImageUrl] = useState(defaultShreeImg);
  const [whatsappMessageTemplate, setWhatsappMessageTemplate] = useState(defaultShreeTpl);
  const [adminNumber, setAdminNumber] = useState('+918739904737');

  // WhatsApp QR Gateway Configuration
  const [ultraMsgInstanceId, setUltraMsgInstanceId] = useState('');
  const [ultraMsgToken, setUltraMsgToken] = useState('');
  const [evolutionApiUrl, setEvolutionApiUrl] = useState('');
  const [evolutionApiKey, setEvolutionApiKey] = useState('');
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState('');

  const [testNumber, setTestNumber] = useState('+918739904737');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';
      const savedAdmin = localStorage.getItem(`adminNumber_${uid}`) || localStorage.getItem('adminNumber');
      if (savedAdmin) setAdminNumber(savedAdmin);

      const savedName = localStorage.getItem(`productName_${uid}`) || localStorage.getItem('productName');
      if (savedName) setProductName(savedName);

      const savedPrice = localStorage.getItem(`productPricing_${uid}`) || localStorage.getItem('productPricing');
      if (savedPrice) setProductPricing(savedPrice);

      const savedBrochure = localStorage.getItem(`brochureUrl_${uid}`) || localStorage.getItem('brochureUrl');
      if (savedBrochure) setBrochureUrl(savedBrochure);

      const savedTpl = localStorage.getItem(`whatsappMessageTemplate_${uid}`) || localStorage.getItem('whatsappMessageTemplate');
      if (savedTpl) setWhatsappMessageTemplate(savedTpl);

      const savedUInst = localStorage.getItem(`ultraMsgInstanceId_${uid}`) || localStorage.getItem('ultraMsgInstanceId');
      if (savedUInst) setUltraMsgInstanceId(savedUInst);

      const savedUTok = localStorage.getItem(`ultraMsgToken_${uid}`) || localStorage.getItem('ultraMsgToken');
      if (savedUTok) setUltraMsgToken(savedUTok);

      const savedEvoUrl = localStorage.getItem(`evolutionApiUrl_${uid}`) || localStorage.getItem('evolutionApiUrl');
      if (savedEvoUrl) setEvolutionApiUrl(savedEvoUrl);

      const savedEvoKey = localStorage.getItem(`evolutionApiKey_${uid}`) || localStorage.getItem('evolutionApiKey');
      if (savedEvoKey) setEvolutionApiKey(savedEvoKey);
    }
  }, []);

  const handleFillShreeAangan = () => {
    setProductName(defaultShreeName);
    setProductPricing(defaultShreePrice);
    setBrochureUrl(defaultShreeBrochure);
    setProductImageUrl(defaultShreeImg);
    setWhatsappMessageTemplate(defaultShreeTpl);
    setAdminNumber('+918739904737');

    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';
      localStorage.setItem(`adminNumber_${uid}`, '+918739904737');
      localStorage.setItem('adminNumber', '+918739904737');
      localStorage.setItem(`productName_${uid}`, defaultShreeName);
      localStorage.setItem('productName', defaultShreeName);
      localStorage.setItem(`productPricing_${uid}`, defaultShreePrice);
      localStorage.setItem('productPricing', defaultShreePrice);
      localStorage.setItem(`brochureUrl_${uid}`, defaultShreeBrochure);
      localStorage.setItem('brochureUrl', defaultShreeBrochure);
      localStorage.setItem(`productImageUrl_${uid}`, defaultShreeImg);
      localStorage.setItem('productImageUrl', defaultShreeImg);
      localStorage.setItem(`whatsappMessageTemplate_${uid}`, defaultShreeTpl);
      localStorage.setItem('whatsappMessageTemplate', defaultShreeTpl);
    }

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 4000);
  };

  const handleSaveSettings = (e) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';
      localStorage.setItem(`adminNumber_${uid}`, adminNumber.trim());
      localStorage.setItem('adminNumber', adminNumber.trim());
      localStorage.setItem(`productName_${uid}`, productName.trim());
      localStorage.setItem('productName', productName.trim());
      localStorage.setItem(`productPricing_${uid}`, productPricing.trim());
      localStorage.setItem('productPricing', productPricing.trim());
      localStorage.setItem(`brochureUrl_${uid}`, brochureUrl.trim());
      localStorage.setItem('brochureUrl', brochureUrl.trim());
      localStorage.setItem(`productImageUrl_${uid}`, productImageUrl.trim());
      localStorage.setItem('productImageUrl', productImageUrl.trim());
      localStorage.setItem(`whatsappMessageTemplate_${uid}`, whatsappMessageTemplate.trim());
      localStorage.setItem('whatsappMessageTemplate', whatsappMessageTemplate.trim());

      localStorage.setItem(`ultraMsgInstanceId_${uid}`, ultraMsgInstanceId.trim());
      localStorage.setItem('ultraMsgInstanceId', ultraMsgInstanceId.trim());
      localStorage.setItem(`ultraMsgToken_${uid}`, ultraMsgToken.trim());
      localStorage.setItem('ultraMsgToken', ultraMsgToken.trim());

      localStorage.setItem(`evolutionApiUrl_${uid}`, evolutionApiUrl.trim());
      localStorage.setItem('evolutionApiUrl', evolutionApiUrl.trim());
      localStorage.setItem(`evolutionApiKey_${uid}`, evolutionApiKey.trim());
      localStorage.setItem('evolutionApiKey', evolutionApiKey.trim());
    }

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 4000);
  };

  const handleSendTestMessage = async () => {
    if (!testNumber.trim()) {
      alert('Please enter a valid phone number!');
      return;
    }
    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testNumber.trim(),
          leadName: 'Customer',
          message: whatsappMessageTemplate,
          brochureUrl: brochureUrl,
          ultraMsgInstanceId: ultraMsgInstanceId.trim(),
          ultraMsgToken: ultraMsgToken.trim(),
          evolutionApiUrl: evolutionApiUrl.trim(),
          evolutionApiKey: evolutionApiKey.trim(),
          metaAccessToken: metaAccessToken.trim(),
          metaPhoneNumberId: metaPhoneNumberId.trim()
        })
      });

      const data = await res.json();
      setTestResult(data);

      if (data.provider === 'whatsapp_direct' && data.directLink) {
        window.open(data.directLink, '_blank');
      }
    } catch (e) {
      setTestResult({ success: false, error: e.message });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div style={{ maxWidth: '1050px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>💬 WhatsApp Automation & QR Gateway</h1>
          <p className="subtitle">Send automated Shree Aangan brochures from your Admin number (+91 87399 04737)</p>
        </div>

        <button 
          onClick={handleFillShreeAangan} 
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
        >
          ✨ Auto-Fill Shree Aangan Details
        </button>
      </div>

      {showSavedToast && (
        <div className="card mb-6" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981', color: '#10b981', padding: '1rem 1.5rem' }}>
          ✅ WhatsApp settings & Shree Aangan automation saved successfully!
        </div>
      )}

      {/* WHATSAPP QR GATEWAY PAIRING SECTION */}
      <div className="card mb-6" style={{ border: '1px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.04)' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
              📱 WhatsApp Web QR Gateway (Background Auto-Send)
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Link your Admin number once via QR code. AI will auto-send messages in background without opening WhatsApp app!
            </p>
          </div>
          <div className="badge" style={{ background: ultraMsgInstanceId ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: ultraMsgInstanceId ? '#10b981' : '#f59e0b' }}>
            {ultraMsgInstanceId ? '🟢 Gateway Configured' : '🟡 1-Click Scan Required'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="label">UltraMsg Instance ID (Free QR Gateway)</label>
            <input 
              className="input"
              value={ultraMsgInstanceId}
              onChange={(e) => setUltraMsgInstanceId(e.target.value)}
              placeholder="e.g. instance105234"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              👉 Free QR code available at <a href="https://ultramsg.com" target="_blank" rel="noreferrer" style={{ color: '#10b981', textDecoration: 'underline' }}>ultramsg.com</a> (Takes 10 seconds to scan)
            </span>
          </div>

          <div className="form-group">
            <label className="label">UltraMsg Token</label>
            <input 
              className="input"
              type="password"
              value={ultraMsgToken}
              onChange={(e) => setUltraMsgToken(e.target.value)}
              placeholder="e.g. abcd1234efgh"
            />
          </div>
        </div>

        {/* TEST MESSAGE SENDER BOX */}
        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <label className="label" style={{ fontWeight: 600 }}>🧪 Test Send Message from Admin Number</label>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input 
              className="input"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              placeholder="+918739904737"
              style={{ maxWidth: '260px' }}
            />
            <button 
              onClick={handleSendTestMessage}
              disabled={sendingTest}
              className="btn btn-primary"
              style={{ background: '#10b981' }}
            >
              {sendingTest ? 'Sending...' : '🚀 Send Test WhatsApp'}
            </button>
          </div>

          {testResult && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', padding: '0.5rem 0.75rem', borderRadius: '6px', background: testResult.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: testResult.success ? '#10b981' : '#ef4444' }}>
              {testResult.success ? '🎉 Success! Message dispatched successfully to ' + testResult.to : '⚠️ Notice: ' + (testResult.error || testResult.message || 'Ready for dispatch')}
            </div>
          )}
        </div>
      </div>

      {/* WHATSAPP MESSAGE TEMPLATE EDITOR */}
      <div className="card mb-6">
        <h3 className="mb-4">📝 Post-Call WhatsApp Follow-Up Message Template</h3>

        <div className="form-group mb-4">
          <label className="label">Admin WhatsApp Phone Number</label>
          <input 
            className="input"
            value={adminNumber}
            onChange={(e) => setAdminNumber(e.target.value)}
            placeholder="+918739904737"
          />
        </div>

        <div className="form-group mb-4">
          <label className="label">Project Brochure PDF URL (Google Drive / Direct Link)</label>
          <input 
            className="input"
            value={brochureUrl}
            onChange={(e) => setBrochureUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
          />
        </div>

        <div className="form-group mb-4">
          <label className="label">WhatsApp Message Body (Full Pitch + Metro + Maps)</label>
          <textarea 
            className="input"
            rows={14}
            value={whatsappMessageTemplate}
            onChange={(e) => setWhatsappMessageTemplate(e.target.value)}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5' }}
          />
        </div>

        <button 
          onClick={handleSaveSettings}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
        >
          💾 Save WhatsApp Template & Gateway Settings
        </button>
      </div>
    </div>
  );
}
