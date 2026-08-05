export const mockContacts = [
  { id: '1', name: 'Rahul Sharma', phone: '+919876543210', email: 'rahul.s@example.com', status: 'Interested', lastCalled: '2023-10-25' },
  { id: '2', name: 'Priya Patel', phone: '+919876543211', email: 'priya.p@example.com', status: 'New', lastCalled: null },
  { id: '3', name: 'Amit Singh', phone: '+919876543212', email: 'amit.s@example.com', status: 'Not Interested', lastCalled: '2023-10-24' },
  { id: '4', name: 'Neha Gupta', phone: '+919876543213', email: 'neha.g@example.com', status: 'Called', lastCalled: '2023-10-26' },
  { id: '5', name: 'Vikram Reddy', phone: '+919876543214', email: 'vikram.r@example.com', status: 'Interested', lastCalled: '2023-10-26' },
  { id: '6', name: 'Anjali Desai', phone: '+919876543215', email: 'anjali.d@example.com', status: 'New', lastCalled: null },
  { id: '7', name: 'Karthik Iyer', phone: '+919876543216', email: 'karthik.i@example.com', status: 'Called', lastCalled: '2023-10-25' },
  { id: '8', name: 'Sneha Verma', phone: '+919876543217', email: 'sneha.v@example.com', status: 'Not Interested', lastCalled: '2023-10-23' },
  { id: '9', name: 'Rajesh Kumar', phone: '+919876543218', email: 'rajesh.k@example.com', status: 'Interested', lastCalled: '2023-10-26' },
  { id: '10', name: 'Meera Menon', phone: '+919876543219', email: 'meera.m@example.com', status: 'Called', lastCalled: '2023-10-25' },
];

export const mockCampaigns = [
  { id: 'c1', name: 'Lead Qualification Q3', status: 'Active', totalContacts: 150, completedCalls: 85, successRate: 35 },
  { id: 'c2', name: 'Diwali Promo Offer', status: 'Draft', totalContacts: 500, completedCalls: 0, successRate: 0 },
  { id: 'c3', name: 'Feedback Collection', status: 'Completed', totalContacts: 200, completedCalls: 195, successRate: 75 },
];

export const mockCalls = [
  { id: 'call1', contactId: '1', contactName: 'Rahul Sharma', campaignId: 'c1', duration: 145, status: 'Completed', sentiment: '😊 Positive', summary: 'Customer showed high interest in the Q3 package. Requested follow-up via email.', transcript: 'Agent: Hello, am I speaking with Rahul?\nRahul: Yes, this is Rahul.', date: '2023-10-25T10:30:00Z' },
  { id: 'call2', contactId: '3', contactName: 'Amit Singh', campaignId: 'c1', duration: 45, status: 'Completed', sentiment: '😠 Negative', summary: 'Not interested at the moment. Hung up early.', transcript: 'Agent: Hi Amit, I am calling regarding...\nAmit: Not interested, thanks.', date: '2023-10-24T14:15:00Z' },
  { id: 'call3', contactId: '4', contactName: 'Neha Gupta', campaignId: 'c1', duration: 12, status: 'Failed', sentiment: '😐 Neutral', summary: 'Call went to voicemail.', transcript: '[Voicemail]', date: '2023-10-26T09:00:00Z' },
  { id: 'call4', contactId: '5', contactName: 'Vikram Reddy', campaignId: 'c3', duration: 210, status: 'Completed', sentiment: '😊 Positive', summary: 'Provided excellent feedback on the recent service.', transcript: 'Agent: How was your experience?\nVikram: It was great, very smooth.', date: '2023-10-26T11:20:00Z' },
  { id: 'call5', contactId: '7', contactName: 'Karthik Iyer', campaignId: 'c1', duration: 89, status: 'Completed', sentiment: '😐 Neutral', summary: 'Asked to call back later next week.', transcript: 'Agent: Is this a good time?\nKarthik: No, please call back next week.', date: '2023-10-25T16:45:00Z' },
];
