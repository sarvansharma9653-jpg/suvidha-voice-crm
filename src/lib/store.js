import { mockContacts, mockCampaigns, mockCalls } from './mockData';

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
    const newContact = { ...contact, id: Date.now().toString(), lastCalled: null };
    localStorage.setItem('contacts', JSON.stringify([...contacts, newContact]));
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
    const newCampaign = { ...campaign, id: Date.now().toString(), status: 'Active', completedCalls: 0 };
    localStorage.setItem('campaigns', JSON.stringify([...campaigns, newCampaign]));
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
    const newCall = { ...call, id: Date.now().toString(), date: new Date().toISOString() };
    localStorage.setItem('calls', JSON.stringify([newCall, ...calls]));
  }
};
