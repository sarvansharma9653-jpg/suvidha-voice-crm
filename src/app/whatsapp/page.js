'use client';
import { useState, useEffect } from 'react';
import { store } from '@/lib/store';

export default function WhatsAppPage() {
  const [adminNumber, setAdminNumber] = useState('');
  const [productName, setProductName] = useState('Suvidha Luxury 2 & 3 BHK Apartments');
  const [productPricing, setProductPricing] = useState('Starting at ₹45 Lakhs with 10% Booking Offer');
  const [brochureUrl, setBrochureUrl] = useState('https://suvidha-voice-crm.vercel.app/sample_brochure.pdf');
  const [productImageUrl, setProductImageUrl] = useState('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800');
  const [whatsappMessageTemplate, setWhatsappMessageTemplate] = useState('नमस्ते! सुविधा AI से बात करने के लिए धन्यवाद। यहाँ हमारे प्रोजेक्ट की पूरी डिटेल्स, प्राइसिंग और ब्रोशर है:\n\n📌 ऑफर: 2 & 3 BHK Luxury Apartments\n💰 प्राइसिंग: ₹45 Lakhs onwards\n📄 ब्रोशर: https://suvidha-voice-crm.vercel.app/sample_brochure.pdf\n\nक्या आप इस वीकेंड साइट विजिट के लिए फ्री हैं?');
  const [autoSendOnCallEnd, setAutoSendOnCallEnd] = useState(true);

  // Quick Direct WhatsApp Sender State
  const [directPhone, setDirectPhone] = useState('+917707978068');
  const [directMsg, setDirectMsg] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('suvidha_auth_user_id') || 'default';
      setAdminNumber(localStorage.getItem(`adminNumber_${uid}`) || localStorage.getItem('adminNumber') || '+917707978068');
      setProductName(localStorage.getItem(`productName_${uid}`) || localStorage.getItem('productName') || 'Suvidha Luxury 2 & 3 BHK Apartments');
      setProductPricing(localStorage.getItem(`productPricing_${uid}`) || localStorage.getItem('productPricing') || 'Starting at ₹45 Lakhs with 10% Booking Offer');
      setBrochureUrl(localStorage.getItem(`brochureUrl_${uid}`) || localStorage.getItem('brochureUrl') || 'https://suvidha-voice-crm.vercel.app/sample_brochure.pdf');
      setProductImageUrl(localStorage.getItem(`productImageUrl_${uid}`) || localStorage.getItem('productImageUrl') || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800');
      
      const savedTpl = localStorage.getItem(`whatsappMessageTemplate_${uid}`) || localStorage.getItem('whatsappMessageTemplate');
      if (savedTpl) setWhatsappMessageTemplate(savedTpl);
    }
  }, []);

  const handleSaveCatalog = (e) => {
    e.preventDefault();
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
    }
    setStatus({ type: 'success', message: '🎉 WhatsApp Product Brochure Catalog & Auto-Dispatch Settings Saved!' });
    setTimeout(() => setStatus(null), 4000);
  };

  const handleSendDirectWhatsApp = () => {
    if (!directPhone) {
      alert('Please enter recipient phone number (+91...)');
      return;
    }
    const msgToSend = directMsg || whatsappMessageTemplate;
    const cleanNum = directPhone.replace(/[^0-9]/g, '');
    const target = cleanNum.startsWith('91') ? cleanNum : `91${cleanNum.replace(/^0+/, '')}`;

    const waLink = `https://api.whatsapp.com/send?phone=${target}&text=${encodeURIComponent(msgToSend)}`;
    window.open(waLink, '_blank');
    setStatus({ type: 'success', message: `📲 Opening WhatsApp Chat with ${directPhone} to send brochure & details!` });
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>💬 WhatsApp Automation & Brochure Catalog</h1>
          <p className="subtitle">Send automated WhatsApp brochures & hot lead alerts immediately when AI call completes</p>
        </div>
      </div>

      {status && (
        <div className="card mb-6" style={{ padding: '1rem', borderColor: status.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)', background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
          {status.message}
        </div>
      )}

      {/* HOW WHATSAPP MESSAGING WORKS EXPLANATION */}
      <div className="card mb-6" style={{ padding: '1.25rem 1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.25)' }}>
        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--accent-blue)', marginBottom: '0.4rem' }}>
          💡 Voice Calling DID vs WhatsApp Number (Kaise Kaam Karta Hai?):
        </div>
        <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          • <strong>Calling Number (+917965854263):</strong> Yeh Vobiz ka Voice-Only DID hai jo customer ko phone call karne ke liye use hota hai.
          <br />
          • <strong>WhatsApp Delivery:</strong> AI call khatam hone par system customer ke number par direct <strong>WhatsApp Brochure, Photos aur Pricing Link</strong> deliver karta hai, aur aapke <strong>Admin WhatsApp Number</strong> par instant Hot Lead Alert bhejta hai!
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '2rem' }}>
        
        {/* CARD 1: Automated Brochure & Template Setup */}
        <div className="card" style={{ padding: '2rem', background: '#0e0e14', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div className="flex justify-between items-center mb-3">
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-green)' }}>
              📁 1. Product Brochure & WhatsApp Template
            </h2>
            <span className="badge success">Auto-Dispatch</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1.5rem' }}>
            Customer se call par baat hone ke baad AI yahi details WhatsApp par bhejegi:
          </p>

          <form onSubmit={handleSaveCatalog}>
            <div className="form-group mb-4">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Product / Project Name</label>
              <input 
                required
                type="text" 
                className="form-control" 
                value={productName} 
                onChange={e => setProductName(e.target.value)} 
                placeholder="e.g. Suvidha Luxury 2 & 3 BHK Apartments" 
              />
            </div>

            <div className="form-group mb-4">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Pricing & Special Offers</label>
              <input 
                required
                type="text" 
                className="form-control" 
                value={productPricing} 
                onChange={e => setProductPricing(e.target.value)} 
                placeholder="e.g. Starting at ₹45 Lakhs with 10% Booking Offer" 
              />
            </div>

            <div className="form-group mb-4">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Brochure PDF Link (Google Drive / Direct URL)</label>
              <input 
                type="text" 
                className="form-control" 
                value={brochureUrl} 
                onChange={e => setBrochureUrl(e.target.value)} 
                placeholder="https://drive.google.com/your-brochure.pdf" 
              />
            </div>

            <div className="form-group mb-4">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Product Photo / Image Link</label>
              <input 
                type="text" 
                className="form-control" 
                value={productImageUrl} 
                onChange={e => setProductImageUrl(e.target.value)} 
                placeholder="https://your-domain.com/photo.jpg" 
              />
            </div>

            <div className="form-group mb-4">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Auto-WhatsApp Message Template</label>
              <textarea 
                required
                rows="4" 
                className="form-control" 
                value={whatsappMessageTemplate} 
                onChange={e => setWhatsappMessageTemplate(e.target.value)} 
                style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
              />
            </div>

            {/* Toggle Auto Send */}
            <div style={{ background: '#0a0a10', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.825rem', color: '#fff', fontWeight: '600' }}>
                ⚡ Auto-Send WhatsApp on Call Finish:
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.825rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                <input type="checkbox" checked={autoSendOnCallEnd} onChange={e => setAutoSendOnCallEnd(e.target.checked)} />
                Active
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontWeight: '700' }}>
              💾 Save WhatsApp Catalog & Template
            </button>
          </form>
        </div>

        {/* CARD 2: Admin Alerts & 1-Click Direct WhatsApp Dispatch */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Admin Hot Lead Alert Number */}
          <div className="card" style={{ padding: '2rem', background: '#0e0e14', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div className="flex justify-between items-center mb-2">
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>📲 2. Admin Hot Lead Alert Mobile Number</h2>
              <span className="badge primary">Real-time</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
              Customer ke "Interested" bolte hi is number par instant alert aayega:
            </p>

            <div className="form-group mb-4">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Your Admin WhatsApp Number (+91)</label>
              <input 
                type="text" 
                className="form-control" 
                value={adminNumber} 
                onChange={e => setAdminNumber(e.target.value)} 
                placeholder="e.g. +91 7707978068" 
              />
            </div>

            <button 
              type="button" 
              onClick={handleSaveCatalog}
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '0.75rem', fontWeight: '700', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }}
            >
              💾 Save Admin Mobile Number
            </button>
          </div>

          {/* 1-Click Direct WhatsApp Tester */}
          <div className="card" style={{ padding: '2rem', background: '#0e0e14', border: '1px solid var(--border-light)' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>🚀 3. Instant WhatsApp Message Tester</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
              Test karke dekhein ki customer ko WhatsApp message kaisa deliver hota hai:
            </p>

            <div className="form-group mb-3">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Target Phone Number (+91)</label>
              <input 
                type="text" 
                className="form-control" 
                value={directPhone} 
                onChange={e => setDirectPhone(e.target.value)} 
                placeholder="e.g. +91 7707978068" 
              />
            </div>

            <button 
              type="button" 
              onClick={handleSendDirectWhatsApp}
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '0.85rem', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 0 15px rgba(37, 99, 235, 0.3)'
              }}
            >
              📲 Test Send WhatsApp Brochure Now &rarr;
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
