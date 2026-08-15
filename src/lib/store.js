import { mockContacts, mockCampaigns, mockCalls, mockFollowups, mockNotifications } from './mockData';

const isBrowser = typeof window !== 'undefined';

export const store = {
  // Contacts
  getContacts: () => {
    if (!isBrowser) return [];
    const contacts = localStorage.getItem('contacts');
    if (!contacts) {
      localStorage.setItem('contacts', JSON.stringify(mockContacts));
      return mockContacts;
    }
    return JSON.parse(contacts);
  },
  addContact: (contact) => {
    if (!isBrowser) return;
    const contacts = store.getContacts();
    const newContact = { 
      ...contact, 
      id: Date.now().toString(), 
      stage: contact.stage || 'New',
      status: contact.status || 'New',
      lastCalled: null 
    };
    localStorage.setItem('contacts', JSON.stringify([...contacts, newContact]));
    return newContact;
  },
  updateContact: (id, updates) => {
    if (!isBrowser) return;
    const contacts = store.getContacts();
    const updated = contacts.map(c => c.id === id ? { ...c, ...updates } : c);
    localStorage.setItem('contacts', JSON.stringify(updated));
  },
  deleteContact: (id) => {
    if (!isBrowser) return;
    const contacts = store.getContacts();
    const filtered = contacts.filter(c => c.id !== id);
    localStorage.setItem('contacts', JSON.stringify(filtered));
  },

  // Campaigns
  getCampaigns: () => {
    if (!isBrowser) return [];
    const campaigns = localStorage.getItem('campaigns');
    if (!campaigns) {
      localStorage.setItem('campaigns', JSON.stringify(mockCampaigns));
      return mockCampaigns;
    }
    return JSON.parse(campaigns);
  },
  addCampaign: (campaign) => {
    if (!isBrowser) return;
    const campaigns = store.getCampaigns();
    const newCampaign = { 
      ...campaign, 
      id: 'c_' + Date.now(), 
      status: 'Active', 
      completedCalls: 0,
      totalContacts: campaign.totalContacts || 0,
      successRate: 0 
    };
    localStorage.setItem('campaigns', JSON.stringify([...campaigns, newCampaign]));
    return newCampaign;
  },
  updateCampaign: (id, updates) => {
    if (!isBrowser) return;
    const campaigns = store.getCampaigns();
    const updated = campaigns.map(c => c.id === id ? { ...c, ...updates } : c);
    localStorage.setItem('campaigns', JSON.stringify(updated));
  },

  // Calls
  getCalls: () => {
    if (!isBrowser) return [];
    const calls = localStorage.getItem('calls');
    if (!calls) {
      localStorage.setItem('calls', JSON.stringify(mockCalls));
      return mockCalls;
    }
    return JSON.parse(calls);
  },
  addCall: (call) => {
    if (!isBrowser) return;
    const calls = store.getCalls();
    const newCall = { ...call, id: 'call_' + Date.now(), date: new Date().toISOString() };
    localStorage.setItem('calls', JSON.stringify([newCall, ...calls]));

    // If call sentiment is Hot Lead, trigger automatic notification!
    if (newCall.sentiment && (newCall.sentiment.includes('Hot') || newCall.sentiment.includes('Interested'))) {
      store.addNotification({
        title: '🔥 HOT LEAD IDENTIFIED!',
        message: `${newCall.contactName || 'Lead'} expressed interest during the call.`,
        type: 'hot_lead',
        contactId: newCall.contactId
      });
    }

    return newCall;
  },

  // Follow-ups Queue
  getFollowups: () => {
    if (!isBrowser) return [];
    const followups = localStorage.getItem('followups');
    if (!followups) {
      localStorage.setItem('followups', JSON.stringify(mockFollowups));
      return mockFollowups;
    }
    return JSON.parse(followups);
  },
  addFollowup: (followup) => {
    if (!isBrowser) return;
    const followups = store.getFollowups();
    const newFollowup = { 
      ...followup, 
      id: 'f_' + Date.now(), 
      status: 'Pending',
      scheduledTime: followup.scheduledTime || 'In 30 Minutes' 
    };
    localStorage.setItem('followups', JSON.stringify([newFollowup, ...followups]));
    return newFollowup;
  },
  updateFollowup: (id, updates) => {
    if (!isBrowser) return;
    const followups = store.getFollowups();
    const updated = followups.map(f => f.id === id ? { ...f, ...updates } : f);
    localStorage.setItem('followups', JSON.stringify(updated));
  },

  // Notifications
  getNotifications: () => {
    if (!isBrowser) return [];
    const notifications = localStorage.getItem('notifications');
    if (!notifications) {
      localStorage.setItem('notifications', JSON.stringify(mockNotifications));
      return mockNotifications;
    }
    return JSON.parse(notifications);
  },
  addNotification: (notif) => {
    if (!isBrowser) return;
    const notifications = store.getNotifications();
    const newNotif = { 
      ...notif, 
      id: 'n_' + Date.now(), 
      time: 'Just now', 
      read: false 
    };
    localStorage.setItem('notifications', JSON.stringify([newNotif, ...notifications]));
  },
  markNotificationsRead: () => {
    if (!isBrowser) return;
    const notifications = store.getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updated));
  }
};
