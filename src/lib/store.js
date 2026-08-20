import { mockContacts, mockCampaigns, mockCalls, mockFollowups, mockNotifications } from './mockData';

const isBrowser = typeof window !== 'undefined';

let currentUserId = 'default';

export const initialDefaultAgents = [
  {
    id: 'ag_pooja',
    name: 'Pooja - Shree Aangan Real Estate Closer',
    voiceId: 'pooja',
    voice: '👩 Pooja (Warm Sales Closer)',
    gender: 'Female',
    speed: '1.0x (Normal)',
    pitch: 'Warm & Friendly',
    bargeIn: true,
    callType: 'Outbound (AI calls leads)',
    useCase: 'Real Estate & Property Investment',
    script: 'नमस्कार जी! मैं Pooja बोल रही हूँ, The Shree Aangan Developers की तरफ से। आपने हमारे प्रोजेक्ट में interest दिखाया था — Chaksu, Tonk Road पर हमारे 85 Acres के JDA Approved और RERA Registered Gated Township प्रोजेक्ट के लिए। जहाँ Jaipur Metro Phase 2 का काम शुरू हो गया है और Property की कीमतें हर साल 18 से 25% बढ़ रही हैं! क्या इस वीकेंड आप हमारी Free Site Visit के लिए थोड़ा समय निकाल सकते हैं?',
    objections: 'अगर पूछे प्राइस कितना है तो बताएं कि JDA Approved Plots ₹800 से ₹2,750 प्रति वर्ग फुट से शुरू हैं EMI सुविधा के साथ। अगर पूछे लोकेशन कहाँ है तो बताएं कि Chaksu Tonk Road Jaipur NH-12 पर Sheetla Mata Mandir और Bombay Hospital के पास है। अगर पूछे RERA नंबर तो बताएं कि RAJ/P/2026/4660 है। अगर पूछे Metro तो बताएं कि Jaipur Metro Phase 2 का काम शुरू हो गया है जिससे कीमतें 40 से 60% बढ़ेंगी।'
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
    script: 'नमस्ते! मैं Aarav बात कर रहा हूँ। आपके नंबर पर 5 लाख तक का प्री-अप्रूव्ड पर्सनल लोन सबसे कम ब्याज दर पर अप्रूव हुआ है। क्या आपको फंड्स की जरूरत है?',
    objections: 'अगर कस्टमर पूछे ब्याज दर क्या है, तो 9.99% से शुरू बताएं। अगर इंटरेस्टेड हो, तो तुरंत पैन और आधार की डिटेल व्हाट्सएप करने को कहें।'
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
    script: 'नमस्ते! मैं Swara बात कर रही हूँ। हम यह सुनिश्चित करने के लिए कॉल कर रहे हैं कि आपकी सर्विस पूरी तरह से सही चल रही है। क्या आपको किसी सहायता की आवश्यकता है?',
    objections: 'अगर कोई शिकायत हो तो तुरंत टिकट नंबर दर्ज करें और प्रायोरिटी सपोर्ट का आश्वासन दें।'
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
    script: 'नमस्ते सर! मैं Madhur बात कर रहा हूँ। हम आपके बिजनेस की सेल्स और सोशल मीडिया लीड्स को 3 गुना करने में मदद कर सकते हैं। क्या आप 2 मिनट बात कर सकते हैं?',
    objections: 'अगर क्लाइंट पूछे कंपनी का नाम, तो सुविधा ग्रोथ लैब्स बताएं और फ्री ऑडिट कॉल ऑफर करें।'
  }
];

export const store = {
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

  // 1. Voice Agents with AUTO-UPGRADE to Shree Aangan
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
      let parsed = JSON.parse(data);
      // Auto-migrate: ensure Shree Aangan agent is present and updated
      const poojaIdx = parsed.findIndex(a => a.id === 'ag_pooja');
      if (poojaIdx === -1 || !parsed[poojaIdx].script?.includes('Shree Aangan')) {
        if (poojaIdx >= 0) {
          parsed[poojaIdx] = initialDefaultAgents[0];
        } else {
          parsed = [initialDefaultAgents[0], ...parsed];
        }
        localStorage.setItem(key, JSON.stringify(parsed));
        localStorage.setItem('suvidha_custom_agents', JSON.stringify(parsed));
      }
      return parsed;
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

  deleteCampaign: (id, userId) => {
    if (!isBrowser) return;
    const uid = userId || store.getUserId();
    const key = `campaigns_${uid}`;
    const campaigns = store.getCampaigns(uid);
    const filtered = campaigns.filter(c => c.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
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
