import { mockContacts, mockCampaigns, mockCalls, mockFollowups, mockNotifications } from './mockData';

const isBrowser = typeof window !== 'undefined';

let currentUserId = 'default';

export const store = {
  // Set active tenant user ID
  setUserId: (userId) => {
    if (userId) currentUserId = userId;
  },

  getUserId: () => {
    if (isBrowser) {
      const savedUser = localStorage.getItem('suvidha_auth_user_id');
      if (savedUser) return savedUser;
    }
    return currentUserId;
  },

  // 1. Contacts (Scoped by User ID)
  getContacts: (userId) => {
    if (!isBrowser) return [];
    const uid = userId || store.getUserId();
    const key = `contacts_${uid}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      // If default/first-time admin, load mock data, otherwise clean starter for new clients
      const initial = uid === 'default' ? mockContacts : [
        { id: '1', name: 'Sample Lead', phone: '+919876543210', email: 'lead@example.com', stage: 'New', status: 'New', lastCalled: null }
      ];
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  addContact: (contact, userId) => {
    if (!isBrowser) return;
    const uid = userId || store.getUserId();
    const key = `contacts_${uid}`;
    const contacts = store.getContacts(uid);
    const newContact = { 
      ...contact, 
      id: Date.now().toString(), 
      stage: contact.stage || 'New',
      status: contact.status || 'New',
      lastCalled: null 
    };
    localStorage.setItem(key, JSON.stringify([...contacts, newContact]));
    return newContact;
  },

  updateContact: (id, updates, userId) => {
    if (!isBrowser) return;
    const uid = userId || store.getUserId();
    const key = `contacts_${uid}`;
    const contacts = store.getContacts(uid);
    const updated = contacts.map(c => c.id === id ? { ...c, ...updates } : c);
    localStorage.setItem(key, JSON.stringify(updated));
  },

  deleteContact: (id, userId) => {
    if (!isBrowser) return;
    const uid = userId || store.getUserId();
    const key = `contacts_${uid}`;
    const contacts = store.getContacts(uid);
    const filtered = contacts.filter(c => c.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  },

  // 2. Campaigns (Scoped by User ID)
  getCampaigns: (userId) => {
    if (!isBrowser) return [];
    const uid = userId || store.getUserId();
    const key = `campaigns_${uid}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      const initial = uid === 'default' ? mockCampaigns : [];
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  addCampaign: (campaign, userId) => {
    if (!isBrowser) return;
    const uid = userId || store.getUserId();
    const key = `campaigns_${uid}`;
    const campaigns = store.getCampaigns(uid);
    const newCampaign = { 
      ...campaign, 
      id: 'c_' + Date.now(), 
      status: 'Active', 
      completedCalls: 0,
      totalContacts: campaign.totalContacts || 0,
      successRate: 0 
    };
    localStorage.setItem(key, JSON.stringify([...campaigns, newCampaign]));
    return newCampaign;
  },

  updateCampaign: (id, updates, userId) => {
    if (!isBrowser) return;
    const uid = userId || store.getUserId();
    const key = `campaigns_${uid}`;
    const campaigns = store.getCampaigns(uid);
    const updated = campaigns.map(c => c.id === id ? { ...c, ...updates } : c);
    localStorage.setItem(key, JSON.stringify(updated));
  },

  // 3. Calls & Transcripts (Scoped by User ID)
  getCalls: (userId) => {
    if (!isBrowser) return [];
    const uid = userId || store.getUserId();
    const key = `calls_${uid}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      const initial = uid === 'default' ? mockCalls : [];
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  addCall: (call, userId) => {
    if (!isBrowser) return;
    const uid = userId || store.getUserId();
    const key = `calls_${uid}`;
    const calls = store.getCalls(uid);
    const newCall = { 
      ...call, 
      id: 'call_' + Date.now(), 
      date: new Date().toISOString() 
    };
    localStorage.setItem(key, JSON.stringify([newCall, ...calls]));
    return newCall;
  },

  // 4. Follow-up Queue (Scoped by User ID)
  getFollowups: (userId) => {
    if (!isBrowser) return [];
    const uid = userId || store.getUserId();
    const key = `followups_${uid}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      const initial = uid === 'default' ? mockFollowups : [];
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  addFollowup: (followup, userId) => {
    if (!isBrowser) return;
    const uid = userId || store.getUserId();
    const key = `followups_${uid}`;
    const followups = store.getFollowups(uid);
    const newFollowup = { ...followup, id: 'f_' + Date.now() };
    localStorage.setItem(key, JSON.stringify([...followups, newFollowup]));
    return newFollowup;
  },

  // 5. Notifications (Scoped by User ID)
  getNotifications: (userId) => {
    if (!isBrowser) return [];
    const uid = userId || store.getUserId();
    const key = `notifs_${uid}`;
    const data = localStorage.getItem(key);
    if (!data) {
      const initial = uid === 'default' ? mockNotifications : [
        { id: '1', title: 'Welcome to Suvidha CRM', message: 'Your AI Calling workspace is ready!', time: 'Just now', read: false }
      ];
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  markNotificationsRead: (userId) => {
    if (!isBrowser) return;
    const uid = userId || store.getUserId();
    const key = `notifs_${uid}`;
    const notifs = store.getNotifications(uid);
    const updated = notifs.map(n => ({ ...n, read: true }));
    localStorage.setItem(key, JSON.stringify(updated));
  }
};
