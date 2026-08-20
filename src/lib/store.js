import { mockContacts, mockCampaigns, mockCalls, mockFollowups, mockNotifications } from './mockData';

const isBrowser = typeof window !== 'undefined';

let currentUserId = 'default';

export const initialDefaultAgents = [
  {
    id: 'ag_pooja',
    name: 'Pooja - Real Estate & Luxury Sales Closer',
    voiceId: 'pooja',
    voice: '👩 Pooja (Warm & Polite Closer)',
    gender: 'Female',
    speed: '1.0x (Normal)',
    pitch: 'Warm & Friendly',
    bargeIn: true,
    callType: 'Outbound (AI calls leads)',
    useCase: 'Real Estate & Property',
    script: 'नमस्ते सर! मै�?पूजा बा�?कर रही हूँ। हमार�?पा�?2 और 3 बीएचके लक्ज़री फ्लैट्�?का एक्सक्लूसि�?ऑफ�?है�?क्या मै�?आपको व्हाट्सए�?पर ब्रोशर और प्राइसिं�?भे�?दू�?',
    objections: 'अग�?कस्टमर बोले बज�?कम है, तो 35 ला�?वाले अफोर्डेब�?विकल्प बताएं। अग�?बोले बिजी हू�? तो शा�?6 बज�?फॉलो-अप शेड्यू�?करें�?
  },
  {
    id: 'ag_aarav',
    name: 'Aarav - Pre-Approved Loans & Finance Advisor',
    voiceId: 'aarav',
    voice: '👨 Aarav (Confident Finance Specialist)',
    gender: 'Male',
    speed: '1.0x (Normal)',
    pitch: 'Professional & Trustworthy',
    bargeIn: true,
    callType: 'Outbound (AI calls leads)',
    useCase: 'Loans & Banking',
    script: 'नमस्ते! मै�?आर�?बा�?कर रह�?हूँ। आपके नंबर पर 5 ला�?तक का प्री-अप्रूव्ड पर्सनल लो�?सबसे कम ब्या�?दर पर अप्रूव हु�?है�?क्या आपको फंड्�?की जरूर�?है?',
    objections: 'अग�?कस्टमer पूछे ब्या�?दर क्या है, तो 9.99% से शुरू बताएं। अग�?इंटरेस्टेड हो, तो तुरं�?पै�?और आधार की डिटे�?व्हाट्सए�?करने को कहें�?
  },
  {
    id: 'ag_swara',
    name: 'Swara - Client Support & Retention Manager',
    voiceId: 'swara',
    voice: '👩 Swara (Persuasive Support Expert)',
    gender: 'Female',
    speed: '0.9x (Slow & Clear)',
    pitch: 'Empathetic & Polite',
    bargeIn: true,
    callType: 'Inbound & Outbound',
    useCase: 'Customer Support & Retention',
    script: 'नमस्ते! मै�?स्वर�?बा�?कर रही हूँ। हम यह सुनिश्चि�?करने के लि�?कॉ�?कर रह�?है�?कि आपकी सर्विस पूरी तर�?से सही चल रही है�?क्या आपको किसी सहायता की आवश्यकता है?',
    objections: 'अग�?को�?शिकायत हो तो तुरं�?टिकट नंबर दर्ज करें और प्रायोरिटी सपोर्ट का आश्वास�?दें।'
  },
  {
    id: 'ag_madhur',
    name: 'Madhur - High-Ticket B2B Growth Consultant',
    voiceId: 'madhur',
    voice: '👨 Madhur (Corporate Executive)',
    gender: 'Male',
    speed: '1.1x (Energetic)',
    pitch: 'Authoritative Corporate',
    bargeIn: true,
    callType: 'Outbound (AI calls leads)',
    useCase: 'B2B Sales & Digital Marketing',
    script: 'नमस्ते सर! मै�?मधुर बा�?कर रह�?हूँ। हम आपके बिजनेस की सेल्�?और सोशल मीडिया लीड्�?को 3 गुना करने मे�?मद�?कर सकते हैं। क्या आप 2 मिनट बा�?कर सकते है�?',
    objections: 'अग�?क्लाइं�?पूछे कंपनी का ना�? तो सुविधा ग्रो�?लैब्�?बताए�?और फ्री ऑडिट कॉ�?ऑफ�?करें�?
  }
];

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

  // 1. Voice Agents (Scoped by User ID & Persisted Permanently)
  getAgents: (userId) => {
    if (!isBrowser) return initialDefaultAgents;
    const uid = userId || store.getUserId();
    const key = `suvidha_custom_agents_${uid}`;
    const data = localStorage.getItem(key) || localStorage.getItem('suvidha_custom_agents');
    
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initialDefaultAgents));
      localStorage.setItem('suvidha_custom_agents', JSON.stringify(initialDefaultAgents));
      return initialDefaultAgents;
    }
    try {
      return JSON.parse(data);
    } catch(e) {
      return initialDefaultAgents;
    }
  },

  addAgent: (agent, userId) => {
    if (!isBrowser) return;
    const uid = userId || store.getUserId();
    const key = `suvidha_custom_agents_${uid}`;
    const agents = store.getAgents(uid);
    const newAgent = { 
      ...agent, 
      id: agent.id || ('ag_' + Date.now()),
      createdAt: new Date().toISOString()
    };
    const updated = [newAgent, ...agents.filter(a => a.id !== newAgent.id)];
    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem('suvidha_custom_agents', JSON.stringify(updated));
    return newAgent;
  },

  updateAgent: (id, updates, userId) => {
    if (!isBrowser) return;
    const uid = userId || store.getUserId();
    const key = `suvidha_custom_agents_${uid}`;
    const agents = store.getAgents(uid);
    const updated = agents.map(a => a.id === id ? { ...a, ...updates } : a);
    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem('suvidha_custom_agents', JSON.stringify(updated));
  },

  deleteAgent: (id, userId) => {
    if (!isBrowser) return;
    const uid = userId || store.getUserId();
    const key = `suvidha_custom_agents_${uid}`;
    const agents = store.getAgents(uid);
    const filtered = agents.filter(a => a.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    localStorage.setItem('suvidha_custom_agents', JSON.stringify(filtered));
  },

  // 2. Contacts (Scoped by User ID)
  getContacts: (userId) => {
    if (!isBrowser) return [];
    const uid = userId || store.getUserId();
    const key = `contacts_${uid}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      const initial = uid === 'default' ? mockContacts : [
        { id: '1', name: 'Sample Lead', phone: '+918739904737', email: 'lead@example.com', stage: 'New', status: 'New', lastCalled: null }
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

  // 3. Campaigns (Scoped by User ID)
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

  // 4. Calls & Transcripts (Scoped by User ID)
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

  // 5. Follow-up Queue (Scoped by User ID)
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

  // 6. Notifications (Scoped by User ID)
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
