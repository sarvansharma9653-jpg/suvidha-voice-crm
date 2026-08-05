'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function FollowupsPage() {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [callingId, setCallingId] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'Follow-up Required')
        .order('follow_up_date', { ascending: true });

      if (error) throw error;
      setFollowups(data || []);
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async (contact) => {
    setCallingId(contact.id);
    setStatus(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: contact.phone,
          contactName: contact.name,
          userId: user.id,
          campaignId: 'follow-up'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: `✅ Call successfully placed to ${contact.name}!` });
        // Update contact status in DB
        await supabase
          .from('contacts')
          .update({ status: 'Called', is_scheduled: false })
          .eq('id', contact.id);

        setFollowups(followups.filter(f => f.id !== contact.id));
      } else {
        setStatus({ type: 'error', message: `❌ Calling failed: ${data.error}` });
      }
    } catch (err) {
      setStatus({ type: 'error', message: `❌ Error: ${err.message}` });
    } finally {
      setCallingId(null);
    }
  };

  const handleCancel = async (id) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'New', is_scheduled: false, follow_up_date: null, follow_up_notes: null })
        .eq('id', id);

      if (error) throw error;
      setFollowups(followups.filter(f => f.id !== id));
      setStatus({ type: 'success', message: '📅 Follow-up cancelled successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: `❌ Error cancelling: ${err.message}` });
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading followups...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>📅 Follow-ups / Scheduled Calls</h1>
          <p className="subtitle">Manage contacts who requested callback or follow-up conversations ({followups.length} scheduled)</p>
        </div>
      </div>

      {status && (
        <div className="card mb-4" style={{
          borderColor: status.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
          padding: '1rem 1.5rem',
          maxWidth: '600px'
        }}>
          {status.message}
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Contact Name</th>
              <th>Phone</th>
              <th>Follow-up Date / Time</th>
              <th>Scheduler Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {followups.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>{item.phone}</td>
                <td style={{ color: 'var(--accent-orange)' }}>
                  {new Date(item.follow_up_date).toLocaleString()}
                </td>
                <td style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
                  {item.follow_up_notes || 'Requested callback.'}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={() => handleCall(item)}
                      disabled={callingId === item.id}
                    >
                      {callingId === item.id ? '⏳ Calling...' : '📞 Call Now'}
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => handleCancel(item.id)}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {followups.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem' }}>No pending follow-ups scheduled!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
