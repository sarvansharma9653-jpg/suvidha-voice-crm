// Suvidha Background Auto-Dialer Engine
// Sequentially processes outbound calling queues from campaigns

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Auto-Dialer cannot run.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

let isRunning = false;

// Trigger an outbound Twilio call using the tenant's own credentials
const dialLead = async (callRecord, credentials) => {
  try {
    const websocketUrl = process.env.WEBSOCKET_SERVER_URL || 'wss://your-domain.ngrok-free.app/media-stream';

    const twiml = `
      <Response>
        <Connect>
          <Stream url="${websocketUrl}">
            <Parameter name="contactName" value="${callRecord.contact_name}" />
          </Stream>
        </Connect>
      </Response>
    `;

    const authString = Buffer.from(`${credentials.account_sid}:${credentials.auth_token}`).toString('base64');
    
    console.log(`🤖 Dialer: Dailing phone ${callRecord.phone_number}...`);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${credentials.account_sid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: callRecord.phone_number,
          From: credentials.phone_number,
          Twiml: twiml.trim(),
          Record: 'true',
          RecordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhook`
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Dialer: Twilio Error for Call ${callRecord.id}:`, data.message);
      return null;
    }

    console.log(`✅ Dialer: Call successfully placed! SID: ${data.sid}`);
    return data.sid;

  } catch (error) {
    console.error(`❌ Dialer: Connection failed for Call ${callRecord.id}:`, error.message);
    return null;
  }
};

const checkAndDial = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    // 0. Check for due scheduled follow-ups
    const { data: followup, error: followupError } = await supabase
      .from('contacts')
      .select('*')
      .eq('status', 'Follow-up Required')
      .lte('follow_up_date', new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (!followupError && followup) {
      console.log(`🤖 Dialer: Found scheduled follow-up due for ${followup.name}`);
      
      // Update contact status to prevent double enqueueing
      await supabase
        .from('contacts')
        .update({ status: 'Called', is_scheduled: false })
        .eq('id', followup.id);

      // Insert pending task into calls table
      await supabase
        .from('calls')
        .insert([{
          user_id: followup.user_id,
          contact_id: followup.id,
          contact_name: followup.name,
          phone_number: followup.phone,
          status: 'Pending',
          sentiment: '⏳ Pending',
          summary: `Scheduled Callback: ${followup.follow_up_notes || 'Requested follow-up'}`
        }]);
    }

    // 1. Fetch next queued/pending call log
    const { data: pendingCall, error: fetchError } = await supabase
      .from('calls')
      .select('*')
      .eq('status', 'Pending')
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (pendingCall) {
      console.log(`🤖 Dialer: Next task found! Call ID: ${pendingCall.id} for ${pendingCall.contact_name}`);

      // Update status to prevent duplicate dialing
      await supabase
        .from('calls')
        .update({ status: 'Dialing...' })
        .eq('id', pendingCall.id);

      // 2. Fetch tenant telephony credentials
      const { data: creds, error: credsError } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', pendingCall.user_id)
        .maybeSingle();

      if (credsError || !creds) {
        console.error(`❌ Dialer: Telephony credentials missing for user ${pendingCall.user_id}`);
        await supabase
          .from('calls')
          .update({ status: 'Failed', summary: 'Error: Telephony credentials not configured' })
          .eq('id', pendingCall.id);
        isRunning = false;
        return;
      }

      // 3. Dial lead number
      const twilioSid = await dialLead(pendingCall, creds);

      if (twilioSid) {
        // Save Twilio CallSid and set call to In-progress
        await supabase
          .from('calls')
          .update({ 
            status: 'In-progress',
            vapiCallId: twilioSid // Store Twilio SID here to track callbacks
          })
          .eq('id', pendingCall.id);
      } else {
        await supabase
          .from('calls')
          .update({ status: 'Failed', summary: 'Error: Call placement failed' })
          .eq('id', pendingCall.id);
      }
    }
  } catch (error) {
    console.error('Dialer Loop Error:', error.message);
  } finally {
    isRunning = false;
  }
};

// Poll the database calling queue every 10 seconds
console.log('🚀 Suvidha Background Auto-Dialer initialized & active.');
setInterval(checkAndDial, 10000);
