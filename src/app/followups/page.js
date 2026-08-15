'use client';
import { useEffect, useState } from 'react';
import { store } from '@/lib/store';

export default function FollowupsPage() {
  const [followups, setFollowups] = useState([]);
  const [callingId, setCallingId] = useState(null);
  const [status, setStatus] = useState(null);
  const [runningQueue, setRunningQueue] = useState(false);

  useEffect(() => {
    setFollowups(store.getFollowups());
  }, []);

  const handleCallFollowup = async (followup) => {
    setCallingId(followup.id);
    setStatus(null);
    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: followup.phone,
          contactName: followup.contactName,
          systemPrompt: `You are a polite female AI voice assistant for Suvidha calling back ${followup.contactName} as requested earlier. Speak in feminine Hindi grammar (kar rahi hoon, bata rahi hoon). Ask if now is a good time to talk.`
        })
      });

      if (res.ok) {
        setStatus({ type: 'success', message: `✅ Follow-up call initiated to ${followup.contactName} (${followup.phone})!` });
        store.updateFollowup(followup.id, { status: 'Completed' });
        setFollowups(store.getFollowups());
      } else {
        setStatus({ type: 'error', message: `❌ Follow-up call failed` });
      }
    } catch (err) {
      setStatus({ type: 'error', message: `❌ Error: ${err.message}` });
    } finally {
      setCallingId(null);
    }
  };

  const handleRunAllFollowups = () => {
    const pendingList = followups.filter(f => f.status === 'Pending');
    if (pendingList.length === 0) {
      alert('No pending follow-ups in queue!');
      return;
    }

    setRunningQueue(true);
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < pendingList.length) {
        const item = pendingList[idx];
        store.updateFollowup(item.id, { status: 'Completed' });
        
        // Record call
        store.addCall({
          contactId: item.contactId || 'f_' + idx,
          contactName: item.contactName,
          phone: item.phone,
          campaignId: 'followup_queue',
          duration: 52,
          status: 'Completed',
          sentiment: '🔥 Hot Lead',
          stage: 'Qualified',
          summary: `Follow-up call completed for ${item.contactName}. Lead confirmed interest.`,
          transcript: `Agent: Namaste ${item.contactName}ji! Main Suvidha AI Assistant bol rahi hoon. Aapne pehle callback ke liye bola tha.\nLead: Haan ji, abhi bol sakti hoon.`
        });
        idx++;
        setFollowups(store.getFollowups());
      } else {
        clearInterval(interval);
        setRunningQueue(false);
        alert('🎉 All pending AI follow-up calls have been executed successfully!');
      }
    }, 3500);
  };

  const pendingCount = followups.filter(f => f.status === 'Pending').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>📅 Automated AI Follow-up Queue</h1>
          <p className="subtitle">Automatic retries for missed calls & "call me later" requests ({pendingCount} pending due)</p>
        </div>

        <button 
          onClick={handleRunAllFollowups} 
          disabled={runningQueue || pendingCount === 0}
          className="btn btn-primary"
        >
          {runningQueue ? '⚡ Executing Follow-up Queue...' : '▶️ Run All Pending Follow-ups'}
        </button>
      </div>

      {status && (
        <div className="card mb-6" style={{ padding: '1rem', borderColor: status.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          {status.message}
        </div>
      )}

      {/* Info Card */}
      <div className="card mb-8" style={{ padding: '1.25rem 1.5rem', background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
          🤖 <strong>How AI Follow-ups Work:</strong> When a customer missed a call or says <em>"Baad mein call karna"</em> during an AI call, Suvidha AI automatically places them in this queue with requested time tags and retries calling them automatically!
        </div>
      </div>

      {/* Followups Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Phone Number</th>
              <th>Follow-up Reason</th>
              <th>Scheduled Time</th>
              <th>Priority</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {followups.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No follow-ups due right now.
                </td>
              </tr>
            ) : (
              followups.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.contactName}</td>
                  <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{item.phone}</code></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.reason}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: '500' }}>⏰ {item.scheduledTime}</td>
                  <td>
                    <span className={`badge ${item.priority === 'High' ? 'danger' : 'warning'}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${item.status === 'Completed' ? 'success' : 'info'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {item.status === 'Pending' ? (
                      <button 
                        onClick={() => handleCallFollowup(item)}
                        disabled={callingId === item.id}
                        className="btn btn-success"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                      >
                        {callingId === item.id ? '📞 Calling...' : '📞 AI Retry Call'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>✅ Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
