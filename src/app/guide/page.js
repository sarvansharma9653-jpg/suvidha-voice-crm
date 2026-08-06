'use client';

export default function GuidePage() {
  return (
    <div style={{ maxWidth: '900px' }}>
      <h1>📖 Suvidha Platform User Guide</h1>
      <p className="subtitle" style={{ marginBottom: '2.5rem' }}>Step-by-step tutorial to configure telephony, upload leads, and start automatic calling campaigns</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Step 1: Telephony Number */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginTop: 0, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>1️⃣</span> Step 1: Get your Telephony Number (Twilio)
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            To place voice calls, you need a virtual phone number. We recommend using **Twilio** since it is fully supported by our dialer engine:
          </p>
          <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <li>Sign up for a free developer account at <strong><a href="https://twilio.com" target="_blank" style={{color: 'var(--accent-blue)'}}>twilio.com</a></strong>.</li>
            <li>Go to the Twilio console home and click <strong>"Get a Trial Number"</strong>.</li>
            <li>Copy your <strong>Account SID</strong> and <strong>Auth Token</strong> from the dashboard project info pane.</li>
            <li>Navigate to the **Settings** page in this dashboard and enter these credentials under "Telephony Config". Click Save.</li>
          </ol>
        </div>

        {/* Step 2: Upload Leads */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginTop: 0, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>2️⃣</span> Step 2: Format & Upload your Leads List (CSV)
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            You can add contacts manually or bulk-import them using a `.csv` spreadsheet file:
          </p>
          <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <li>Create a spreadsheet (Excel / Google Sheets) with three columns: <code>Name</code>, <code>Phone</code>, and <code>Email</code>.</li>
            <li>Export the sheet as a **Comma Separated Values (.csv)** file.</li>
            <li>Go to the **Contacts** tab in the sidebar navigation.</li>
            <li>Click **"Import CSV"** and select your file. All phone numbers will automatically be formatted with country codes (e.g. <code>+91</code>) and saved to your list!</li>
          </ol>
        </div>

        {/* Step 3: Run Dialer */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginTop: 0, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>3️⃣</span> Step 3: Launch the Background Auto-Dialer
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            To place calls automatically after uploading your leads, you must start the auto-dialer daemon in your server terminal:
          </p>
          <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <li>Open a command prompt / terminal inside your project directory (<code>d:\calling agent</code>).</li>
            <li>Start the auto-dialer script by running the command:
              <pre style={{
                background: 'rgba(0,0,0,0.4)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                marginTop: '0.5rem',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: 'var(--accent-green)'
              }}>node server/autoDialer.js</pre>
            </li>
            <li>The dialer will now scan your contacts queue. Every 10 seconds, it will automatically place a call, record the conversation, rate the lead quality, and log summaries to your dashboard!</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
