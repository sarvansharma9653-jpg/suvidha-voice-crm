'use client';
import { useState } from 'react';

export default function GuidePage() {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const answerUrl = 'https://suvidha-voice-crm.vercel.app/api/inbound';
  const hangupUrl = 'https://suvidha-voice-crm.vercel.app/api/webhook';

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>📖 Complete Setup & Integration Guide</h1>
          <p className="subtitle">Step-by-step instructions with 1-click copy-paste settings to connect Vobiz Telephony, ElevenLabs Voice, and CRM Campaigns</p>
        </div>

        <a href="/settings" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          ⚙️ Go To Settings
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* STEP 1: ElevenLabs Voice Setup */}
        <div className="card" style={{ padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.3)', background: '#0a0a12' }}>
          <h2 style={{ marginTop: 0, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            <span>1️⃣</span> Step 1: ElevenLabs Free Real Human Voice Setup
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.9rem' }}>
            Get 10,000 characters FREE every month from ElevenLabs for 100% human voice quality with natural breaths and emotion:
          </p>
          <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '0.875rem' }}>
            <li>Visit <strong><a href="https://elevenlabs.io" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-purple)' }}>elevenlabs.io</a></strong> and create a free account.</li>
            <li>Go to <strong>Profile (Bottom Left) &rarr; API Keys</strong>.</li>
            <li>Click <strong>Create API Key</strong>, copy your key, and paste it into <a href="/settings" style={{ color: 'var(--accent-purple)' }}><strong>Settings &rarr; ElevenLabs Key</strong></a>.</li>
            <li>Click <strong>Save Voice Key</strong> — your CRM will instantly speak in 100% Real Human Voice!</li>
          </ol>
        </div>

        {/* STEP 2: Vobiz Telephony Voice Application Setup (With 1-Click Copy Buttons!) */}
        <div className="card" style={{ padding: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)', background: '#0a0a12' }}>
          <div className="flex justify-between items-center mb-2">
            <h2 style={{ margin: 0, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
              <span>2️⃣</span> Step 2: Vobiz Inbound Voice Application Setup
            </h2>
            <span className="badge success">Vobiz India</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            When a customer calls your Vobiz +91 number, this webhook instructs Vobiz to answer the call with Suvidha AI:
          </p>

          <div style={{ background: '#07070b', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
            
            {/* Field 1: Application Name */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>1. Application Name (Pehla Box)</span>
                <button 
                  onClick={() => copyToClipboard('Suvidha AI Voice Agent', 'appName')}
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
                >
                  {copiedKey === 'appName' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <code style={{ display: 'block', padding: '0.5rem 0.75rem', background: '#12121c', borderRadius: '6px', fontSize: '0.85rem', color: '#fff' }}>
                Suvidha AI Voice Agent
              </code>
            </div>

            {/* Field 2: Primary Answer URL */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>2. Primary Answer URL (Method: POST)</span>
                <button 
                  onClick={() => copyToClipboard(answerUrl, 'answerUrl')}
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
                >
                  {copiedKey === 'answerUrl' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <code style={{ display: 'block', padding: '0.5rem 0.75rem', background: '#12121c', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-green)', wordBreak: 'break-all' }}>
                {answerUrl}
              </code>
            </div>

            {/* Field 3: Hangup URL */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>3. Hangup URL (Method: POST)</span>
                <button 
                  onClick={() => copyToClipboard(hangupUrl, 'hangupUrl')}
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
                >
                  {copiedKey === 'hangupUrl' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <code style={{ display: 'block', padding: '0.5rem 0.75rem', background: '#12121c', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-blue)', wordBreak: 'break-all' }}>
                {hangupUrl}
              </code>
            </div>

          </div>

          <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '0.875rem' }}>
            <li>Go to <strong><a href="https://new-console.vobiz.ai/app/voice/applications" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-green)' }}>Vobiz Voice Applications</a></strong>.</li>
            <li>Click <strong>+ Create Application</strong> and paste the above 3 values. Click <strong>Create Application</strong>.</li>
            <li>Go to <strong># Numbers &rarr; My number</strong> in the left sidebar.</li>
            <li>Click your <strong>+91 Number</strong>, select <strong>Suvidha AI Voice Agent</strong> from the Application dropdown, and click Save!</li>
          </ol>
        </div>

        {/* STEP 3: Outbound Calling & Bulk Campaigns */}
        <div className="card" style={{ padding: '2rem', border: '1px solid rgba(59, 130, 246, 0.3)', background: '#0a0a12' }}>
          <h2 style={{ marginTop: 0, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            <span>3️⃣</span> Step 3: Outbound AI Calling & Lead Campaigns
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.9rem' }}>
            You have two powerful ways to call your customers:
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '0.875rem' }}>
            <li><strong>⚡ 1-Click Instant Caller (<a href="/campaigns" style={{ color: 'var(--accent-blue)' }}>Campaigns</a>):</strong> Enter any customer phone number (+91...) and describe your product/offer. Click <strong>Launch Instant AI Call</strong> — the AI phone will ring immediately!</li>
            <li><strong>📁 Bulk Lead Calling:</strong> Upload your customer CSV sheet in <a href="/contacts" style={{ color: 'var(--accent-blue)' }}><strong>Lead Lists & CSV</strong></a>. Then create a Bulk Campaign to auto-dial all numbers sequentially with detailed summary reports!</li>
          </ul>
        </div>

        {/* STEP 4: Call Summaries & Transcripts */}
        <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-light)', background: '#0a0a12' }}>
          <h2 style={{ marginTop: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            <span>4️⃣</span> Step 4: Review AI Call Summaries & Transcripts
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.9rem' }}>
            After every phone call, Suvidha AI automatically generates an <strong>Executive Call Summary</strong>:
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '0.875rem' }}>
            <li>Go to <a href="/calls" style={{ color: 'var(--accent-blue)' }}><strong>📊 Call Transcripts</strong></a> to review which leads expressed interest.</li>
            <li>Click on any call row to expand and inspect the <strong>Full Word-by-Word Dialogue Transcript</strong>.</li>
            <li>Export call records anytime via the <strong>📥 Export Executive Summaries (CSV)</strong> button!</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
