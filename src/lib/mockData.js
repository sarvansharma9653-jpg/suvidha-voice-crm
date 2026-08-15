export const mockContacts = [
  { id: '1', name: 'Rahul Sharma', phone: '+919876543210', email: 'rahul.s@example.com', status: 'Interested', stage: 'Qualified', lastCalled: '2026-08-15' },
  { id: '2', name: 'Priya Patel', phone: '+919876543211', email: 'priya.p@example.com', status: 'New', stage: 'New', lastCalled: null },
  { id: '3', name: 'Amit Singh', phone: '+919876543212', email: 'amit.s@example.com', status: 'Not Interested', stage: 'Unqualified', lastCalled: '2026-08-14' },
  { id: '4', name: 'Neha Gupta', phone: '+919876543213', email: 'neha.g@example.com', status: 'Called', stage: 'Follow-up Scheduled', lastCalled: '2026-08-15' },
  { id: '5', name: 'Vikram Reddy', phone: '+919876543214', email: 'vikram.r@example.com', status: 'Interested', stage: 'Converted', lastCalled: '2026-08-15' },
  { id: '6', name: 'Anjali Desai', phone: '+919876543215', email: 'anjali.d@example.com', status: 'New', stage: 'New', lastCalled: null },
  { id: '7', name: 'Karthik Iyer', phone: '+919876543216', email: 'karthik.i@example.com', status: 'Called', stage: 'Follow-up Scheduled', lastCalled: '2026-08-14' },
  { id: '8', name: 'Sneha Verma', phone: '+919876543217', email: 'sneha.v@example.com', status: 'Not Interested', stage: 'Unqualified', lastCalled: '2026-08-13' },
  { id: '9', name: 'Rajesh Kumar', phone: '+919876543218', email: 'rajesh.k@example.com', status: 'Interested', stage: 'Qualified', lastCalled: '2026-08-15' },
  { id: '10', name: 'Meera Menon', phone: '+919876543219', email: 'meera.m@example.com', status: 'Called', stage: 'Called', lastCalled: '2026-08-14' },
];

export const mockCampaigns = [
  { id: 'c1', name: 'Noida 3 BHK Real Estate Leads', status: 'Active', totalContacts: 150, completedCalls: 85, successRate: 35, script: 'Real Estate Sales Qualified Lead' },
  { id: 'c2', name: 'Customer Support Feedback Survey', status: 'Draft', totalContacts: 500, completedCalls: 0, successRate: 0, script: 'Support Feedback Survey' },
  { id: 'c3', name: 'Personal Loan Pre-Approval Campaign', status: 'Completed', totalContacts: 200, completedCalls: 195, successRate: 75, script: 'Financial Loan Advisor' },
];

export const mockCalls = [
  { 
    id: 'call1', 
    contactId: '1', 
    contactName: 'Rahul Sharma', 
    phone: '+919876543210',
    campaignId: 'c1', 
    duration: 145, 
    status: 'Completed', 
    sentiment: '🔥 Hot Lead', 
    stage: 'Qualified',
    summary: 'Rahul requested a site visit for the 3 BHK Flat in Sector 62 Noida this Saturday. Budget: 1.2 Cr.', 
    transcript: 'Agent: Namaste! Main Suvidha AI Real Estate Assistant bol rahi hoon. Kya aap Sector 62 Noida mein 3 BHK luxury flat ke baare mein jaankari chahte hain?\nRahul: Haan bilkul, kitna price hai?\nAgent: Price 1.2 Crore hai aur downpayment par 10% discount mil raha hai. Kya main aapka site visit schedule kar doon?\nRahul: Haan, Saturday 11 AM par rakh lo.', 
    date: '2026-08-15T10:30:00Z' 
  },
  { 
    id: 'call2', 
    contactId: '3', 
    contactName: 'Amit Singh', 
    phone: '+919876543212',
    campaignId: 'c1', 
    duration: 45, 
    status: 'Completed', 
    sentiment: '❌ Not Interested', 
    stage: 'Unqualified',
    summary: 'Not looking for property currently. Asked to remove from list.', 
    transcript: 'Agent: Namaste Amitji, main Suvidha AI Assistant bol rahi hoon.\nAmit: Main abhi koi property nahi dhoondh raha hoon, please call mat karo.', 
    date: '2026-08-14T14:15:00Z' 
  },
  { 
    id: 'call3', 
    contactId: '4', 
    contactName: 'Neha Gupta', 
    phone: '+919876543213',
    campaignId: 'c1', 
    duration: 0, 
    status: 'No Answer', 
    sentiment: '😐 Pending Retry', 
    stage: 'Follow-up Scheduled',
    summary: 'Call went unanswered. Automated 30-minute retry scheduled by AI.', 
    transcript: '[No Answer / Ringing Timed Out]', 
    date: '2026-08-15T09:00:00Z' 
  },
  { 
    id: 'call4', 
    contactId: '5', 
    contactName: 'Vikram Reddy', 
    phone: '+919876543214',
    campaignId: 'c3', 
    duration: 210, 
    status: 'Completed', 
    sentiment: '😊 Interested', 
    stage: 'Converted',
    summary: 'Customer approved loan terms and uploaded KYC documents.', 
    transcript: 'Agent: Namaste Vikramji! Main Personal Loan Pre-Approval Assistant bol rahi hoon.\nVikram: Haan, mujhe 5 Lakh loan ki requirement thi.', 
    date: '2026-08-15T11:20:00Z' 
  },
  { 
    id: 'call5', 
    contactId: '7', 
    contactName: 'Karthik Iyer', 
    phone: '+919876543216',
    campaignId: 'c1', 
    duration: 89, 
    status: 'Completed', 
    sentiment: '⏰ Call Later', 
    stage: 'Follow-up Scheduled',
    summary: 'Customer requested a callback tomorrow at 4 PM.', 
    transcript: 'Agent: Namaste Karthikji! Kya abhi baat karne ka sahi time hai?\nKarthik: Abhi main meeting mein hoon, please kal shaam 4 baje call karna.', 
    date: '2026-08-15T16:45:00Z' 
  },
];

export const mockFollowups = [
  {
    id: 'f1',
    contactId: '7',
    contactName: 'Karthik Iyer',
    phone: '+919876543216',
    reason: 'Customer requested callback ("Kal shaam 4 baje call karna")',
    scheduledTime: 'Today at 4:00 PM',
    status: 'Pending',
    priority: 'High'
  },
  {
    id: 'f2',
    contactId: '4',
    contactName: 'Neha Gupta',
    phone: '+919876543213',
    reason: 'No Answer / Ringing Timed Out',
    scheduledTime: 'In 30 Minutes',
    status: 'Pending',
    priority: 'Medium'
  }
];

export const mockNotifications = [
  {
    id: 'n1',
    title: '🔥 HOT LEAD IDENTIFIED!',
    message: 'Rahul Sharma (+919876543210) agreed to site visit for 3 BHK Noida Flat this Saturday 11 AM!',
    time: '5 mins ago',
    type: 'hot_lead',
    read: false,
    contactId: '1'
  },
  {
    id: 'n2',
    title: '⏰ Follow-up Callback Scheduled',
    message: 'Karthik Iyer requested callback for today at 4:00 PM.',
    time: '20 mins ago',
    type: 'followup',
    read: false,
    contactId: '7'
  }
];
