import { mockContacts, mockCampaigns, mockCalls, mockFollowups, mockNotifications } from './mockData';

const isBrowser = typeof window !== 'undefined';

let currentUserId = 'default';

export const initialDefaultAgents = [  {
    id: 'ag_pooja',
    name: 'Pooja — Shree Aangan Investment Advisor',
    voiceId: 'pooja',
    voice: '👩 Pooja (Warm Sales Closer)',
    gender: 'Female',
    speed: '1.0x (Normal)',
    pitch: 'Warm & Friendly',
    bargeIn: true,
    callType: 'Outbound (AI calls leads)',
    useCase: 'The Shree Aangan Developers — Jaipur Real Estate',
    script: "नमस्कार जी! मैं Pooja बोल रही हूँ, The Shree Aangan Developers की तरफ से।\n\nजी, मैं आपको एक बहुत ही महत्वपूर्ण जानकारी देने के लिए Call कर रही हूँ।\n\nआपने जयपुर में Property Investment या घर लेने के बारे में सोचा होगा — तो आज मैं आपको Jaipur का सबसे बड़ा Golden Opportunity बताने वाली हूँ।\n\nChaksu, Tonk Road पर हमारा 85 Acres का JDA Approved और RERA Registered Gated Township प्रोजेक्ट है — जहाँ Property की कीमतें हर साल 18 से 25 प्रतिशत बढ़ रही हैं!\n\nऔर सबसे बड़ी बात — Jaipur Metro Phase 2 की नींव July 2026 में रख दी गई है! जब Metro आएगी, तो यहाँ की Property की कीमतें 40 से 60 प्रतिशत तक और बढ़ जाएंगी।\n\nयह Last Chance है सही Price में लेने का — क्या आप इस Weekend हमारी Site Visit के लिए आ सकते हैं? हम आपको सब कुछ खुद दिखाएंगे!",
    objections: "अगर Customer पूछे \"Price kya hai\" / \"Rate kya hai\":\nजी, हमारे JDA Approved Plots ₹800 से ₹2,750 प्रति वर्ग फुट के बीच उपलब्ध हैं — EMI Facility के साथ। और अभी जो कीमत है, 3 साल बाद यह Double हो जाएगी क्योंकि Jaipur Metro Phase 2 Tonk Road पर आ रही है। Complete Price List अभी व्हाट्सएप कर रही हूँ!\n\nअगर Customer पूछे \"Location kahan hai\" / \"Kitna door hai\":\nजी, प्रोजेक्ट Chaksu, Tonk Road पर है — Jaipur से सिर्फ 25-30 km की दूरी पर NH-12 Jaipur-Kota Highway पर। Jaipur Outer Ring Road से बिल्कुल Connected है। Sheetla Mata Mandir और Bombay Hospital के पास। Google Maps Location अभी आपके व्हाट्सएप पर भेज रही हूँ।\n\nअगर Customer पूछे \"Grow karega kya\" / \"Return milega?\" :\nजी बिल्कुल! Chaksu में इस साल Property 18-25% बढ़ी है। Jaipur Metro Phase 2 का काम शुरू हो गया है — Metro आने पर Property 40-60% और बढ़ेगी। Delhi-Mumbai Industrial Corridor (DMIC) का 39% हिस्सा Rajasthan से जाता है — इसके Influence Zone में हैं हम! यह Jaipur का Next Booming Zone है।\n\nअगर Customer पूछे \"Iska RERA Number kya hai\" / \"Legal hai?\":\nजी बिल्कुल Legal है! हमारा RERA Registration Number है RAJ/P/2026/4660 — Rajasthan RERA पर Verify कर सकते हैं। JDA Approved Project है। पूरा Documentation 100% Clear है।\n\nअगर Customer पूछे \"Koi Guarantee?\" / \"Trustworthy hai?\":\nजी, The Shree Aangan एक Trusted Developer है। RERA Approved, JDA Approved, 85 Acres का Gated Township, 1500+ Satisfied Customers। आप हमारे Instagram @shreeaangandevelopers पर Photos और Projects देख सकते हैं।\n\nअगर Customer पूछे \"Mujhe zaroorat nahi\" / \"Baad mein sochenge\":\nSir, मैं समझती हूँ। लेकिन Metro Phase 2 का काम शुरू हो गया है — जैसे ही Metro आती है, आज की Price में नहीं मिलेगा। Limited Plots बचे हैं। एक बार बिना किसी Commitment के साइट देखें — पसंद आए तो आगे बात करें। क्या Saturday या Sunday Convenient रहेगा?\n\nअगर Customer पूछे \"Brochure bhejo\" / \"Details chahiye\":\nजी बिल्कुल! Complete Brochure, Plot Map, RERA Details, Floor Plan, Pricing, और Google Maps Location — सब कुछ अभी आपके व्हाट्सएप पर भेज रही हूँ। Site Visit की एक Free Slot भी Book कर देती हूँ!\n\nअगर Customer कहे \"Interested hoon\" / \"Sahi lagta hai\":\nअरे बहुत बढ़िया! आपके लिए Best Plot Reserve कर देती हूँ — Site Visit पर आकर चुन लीजिए। Brochure अभी WhatsApp पर आ रहा है!\n\nअगर Customer कहे \"Baad mein call karo\" / \"Busy hoon\":\nजी ज़रूर! कब Convenient रहेगा — क्या कल सुबह 10 बजे Call करूँ? तब तक मैं पूरी Details और Video Tour WhatsApp पर भेज देती हूँ।"
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
      if (poojaIdx === -1 || !parsed[poojaIdx].script?.includes('महत्वपूर्ण जानकारी')) {
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
      const initial = [];
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
