'use client';
import { useEffect, useState } from 'react';
import { store } from '@/lib/store';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [callingId, setCallingId] = useState(null);
  const [callResult, setCallResult] = useState(null);

  useEffect(() => {
    setContacts(store.getContacts());
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    store.addContact({ ...formData, status: 'New' });
    setContacts(store.getContacts());
    setShowModal(false);
    setFormData({ name: '', phone: '', email: '' });
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const contact = {};
        headers.forEach((h, idx) => {
          contact[h] = values[idx] || '';
        });
        if (contact.phone) {
          let phone = contact.phone.replace(/[^0-9+]/g, '');
          if (!phone.startsWith('+')) phone = '+91' + phone;
          store.addContact({
            name: contact.name || 'Unknown',
            phone: phone,
            email: contact.email || '',
            status: 'New'
          });
        }
      }
      setContacts(store.getContacts());
      alert(`✅ ${lines.length - 1} contacts imported successfully!`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCall = async (contact) => {
    setCallingId(contact.id);
    setCallResult(null);
    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: contact.phone,
          contactName: contact.name,
          systemPrompt: `You are Suvidha AI assistant calling ${contact.name}. Be professional, speak in Hinglish. Ask if they are interested in our services. Keep it brief.`
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCallResult({ type: 'success', message: `✅ Call initiated to ${contact.name}!` });
        // Update contact status
        const updatedContacts = contacts.map(c => 
          c.id === contact.id ? { ...c, status: 'Called', lastCalled: new Date().toISOString().split('T')[0] } : c
        );
        localStorage.setItem('contacts', JSON.stringify(updatedContacts));
        setContacts(updatedContacts);
        
        // Add to call logs
        store.addCall({
          contactId: contact.id,
          contactName: contact.name,
          campaignId: 'manual',
          duration: 0,
          status: 'In-progress',
          sentiment: '⏳ Pending',
          summary: 'Call in progress...',
          transcript: '',
          vapiCallId: data.vapiCallId || data.id
        });
      } else {
        setCallResult({ type: 'error', message: `❌ ${data.error || 'Call failed'}` });
      }
    } catch (err) {
      setCallResult({ type: 'error', message: `❌ Network error: ${err.message}` });
    }
    setTimeout(() => { setCallingId(null); setCallResult(null); }, 5000);
  };

  const handleDelete = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    localStorage.setItem('contacts', JSON.stringify(updated));
    setContacts(updated);
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>👥 Contacts</h1>
          <p className="subtitle">Manage your outbound calling leads ({contacts.length} total)</p>
        </div>
        <div className="flex gap-4">
          <label className="btn btn-secondary" style={{cursor: 'pointer'}}>
            📥 Import CSV
            <input type="file" accept=".csv,.txt" onChange={handleCSVImport} style={{display: 'none'}} />
          </label>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Add Contact</button>
        </div>
      </div>

      {callResult && (
        <div className={`card mb-4`} style={{
          borderColor: callResult.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
          padding: '1rem 1.5rem'
        }}>
          {callResult.message}
        </div>
      )}

      <div className="mb-4">
        <input 
          type="text" 
          placeholder="🔍 Search contacts by name, email or phone..." 
          className="form-control"
          style={{maxWidth: '400px'}}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Last Called</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(contact => (
              <tr key={contact.id}>
                <td>{contact.name}</td>
                <td>{contact.phone}</td>
                <td>{contact.email || '—'}</td>
                <td>
                  <span className={`badge ${contact.status === 'New' ? 'new' : contact.status === 'Called' ? 'info' : contact.status === 'Interested' ? 'success' : 'danger'}`}>
                    {contact.status}
                  </span>
                </td>
                <td>{contact.lastCalled || 'Never'}</td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-primary" 
                      style={{padding: '0.25rem 0.75rem', fontSize: '0.75rem'}}
                      onClick={() => handleCall(contact)}
                      disabled={callingId === contact.id}
                    >
                      {callingId === contact.id ? '⏳ Calling...' : '📞 Call'}
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem'}}
                      onClick={() => handleDelete(contact.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredContacts.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No contacts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{marginBottom: 0}}>➕ Add New Contact</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✖</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Full Name</label>
                <input required type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="form-group">
                <label>Phone Number (with country code)</label>
                <input required type="tel" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+919876543210" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="rahul@example.com" />
              </div>
              <div className="flex justify-between" style={{marginTop: '1.5rem'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">💾 Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
