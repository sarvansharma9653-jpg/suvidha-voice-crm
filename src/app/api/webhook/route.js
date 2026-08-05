import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppAlert } from '@/lib/whatsapp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // ==========================================
    // 1. HANDLE TWILIO WEBHOOKS (form-urlencoded)
    // ==========================================
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      const callSid = formData.get('CallSid');
      const callStatus = formData.get('CallStatus');
      const recordingUrl = formData.get('RecordingUrl');
      const duration = formData.get('CallDuration') || formData.get('DialCallDuration');

      console.log(`📞 Twilio Webhook - CallSid: ${callSid}, Status: ${callStatus}, Recording: ${recordingUrl}`);

      if (callSid) {
        // Find user_id from call logs
        const { data: callLog } = await supabase
          .from('calls')
          .select('*')
          .eq('vapiCallId', callSid) // vapiCallId stores Twilio CallSid for custom calls
          .maybeSingle();

        const updateData = {};
        if (callStatus) {
          updateData.status = callStatus === 'completed' ? 'Completed' : callStatus === 'no-answer' ? 'No Answer' : 'Failed';
        }
        if (duration) {
          updateData.duration = parseInt(duration);
        }
        if (recordingUrl) {
          updateData.recording_url = recordingUrl;
        }

        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('calls')
            .update(updateData)
            .eq('vapiCallId', callSid);
        }

        // Simulating text analysis & WhatsApp Alert for Twilio Calls
        if (callStatus === 'completed' && callLog) {
          const mockSummary = "Customer answered the call, expressed high interest in the Suvidha platform services, and requested a call back on Monday.";
          
          await supabase
            .from('calls')
            .update({
              summary: mockSummary,
              sentiment: '😊 Positive'
            })
            .eq('vapiCallId', callSid);

          // Retrieve user's WhatsApp credentials from database
          const { data: creds } = await supabase
            .from('credentials')
            .select('*')
            .eq('user_id', callLog.user_id)
            .maybeSingle();

          // Send WhatsApp Notification to Admin
          await sendWhatsAppAlert({
            leadName: callLog.contact_name,
            summary: mockSummary,
            adminNumber: creds?.phone_number,
            metaAccessToken: process.env.META_ACCESS_TOKEN,
            metaPhoneNumberId: process.env.META_PHONE_NUMBER_ID
          });
        }
      }

      return new Response('<Response></Response>', {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    // ==========================================
    // 2. HANDLE VAPI / JSON WEBHOOKS
    // ==========================================
    const payload = await req.json();
    const { message } = payload;

    console.log('📞 JSON Webhook received:', message?.type);

    if (message?.type === 'end-of-call-report') {
      const callSid = message.call?.id;
      const transcript = message.transcript || '';
      const summary = message.summary || 'No summary available';
      const sentiment = analyzeSentiment(transcript);
      const recordingUrl = message.recordingUrl || null;
      const duration = message.durationSeconds || 0;
      const name = message.call?.metadata?.contactName || 'Unknown';
      const campaignId = message.call?.metadata?.campaignId || 'manual';

      const callData = {
        contact_name: name,
        phone_number: message.call?.customer?.number || '',
        duration: duration,
        status: message.endedReason === 'customer-ended-call' || message.endedReason === 'assistant-ended-call' ? 'Completed' : 'Failed',
        transcript: transcript,
        summary: summary,
        sentiment: sentiment,
        recording_url: recordingUrl,
        date: new Date().toISOString()
      };

      console.log('✅ Call report:', callData);

      // Check for follow-up request
      const followUp = detectFollowUpRequest(transcript);
      if (followUp.requested) {
        // Query to find contact id and update
        const { data: contact } = await supabase
          .from('contacts')
          .select('id')
          .eq('phone', callData.phone_number)
          .maybeSingle();

        if (contact) {
          await supabase
            .from('contacts')
            .update({
              status: 'Follow-up Required',
              follow_up_date: followUp.date,
              follow_up_notes: followUp.notes,
              is_scheduled: true
            })
            .eq('id', contact.id);
        }
      }

      // Trigger WhatsApp Alert for positive leads
      if (sentiment.includes('Positive')) {
        await sendWhatsAppAlert({
          leadName: name,
          summary: summary,
          adminNumber: process.env.ADMIN_NOTIFICATION_NUMBER,
          metaAccessToken: process.env.META_ACCESS_TOKEN,
          metaPhoneNumberId: process.env.META_PHONE_NUMBER_ID
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Verification GET route
export async function GET() {
  return NextResponse.json({ status: 'active' });
}

function analyzeSentiment(transcript) {
  const lower = transcript.toLowerCase();
  const positiveWords = ['interested', 'yes', 'sure', 'great', 'good', 'haan', 'bilkul', 'theek', 'achha', 'okay'];
  const negativeWords = ['no', 'not interested', 'nahi', 'mat karo', 'busy', 'don\'t call', 'stop'];

  const positiveCount = positiveWords.filter(w => lower.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lower.includes(w)).length;

  if (positiveCount > negativeCount) return '😊 Positive';
  if (negativeCount > positiveCount) return '😠 Negative';
  return '😐 Neutral';
}

function detectFollowUpRequest(transcript) {
  const lower = transcript.toLowerCase();
  const followUpKeywords = ['tomorrow', 'later', 'busy', 'call back', 'baad mein', 'dusre din', 'kal', 'busy hoon', 'time nahi'];
  
  const requested = followUpKeywords.some(keyword => lower.includes(keyword));
  
  if (requested) {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 1); // Set to next day by default
    return {
      requested: true,
      date: followUpDate.toISOString(),
      notes: 'Customer requested a callback/follow-up call.'
    };
  }
  
  return { requested: false, date: null, notes: '' };
}
