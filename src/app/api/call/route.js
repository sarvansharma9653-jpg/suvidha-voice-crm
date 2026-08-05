import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req) {
  try {
    const { phoneNumber, contactName, campaignId, userId } = await req.json();

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Fetch user's saved Twilio credentials
    const { data: creds, error: credsError } = await supabase
      .from('credentials')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (credsError || !creds) {
      return NextResponse.json({ 
        error: 'Telephony credentials not configured. Please go to Settings to connect Twilio.' 
      }, { status: 400 });
    }

    // 2. Fetch the active assistant prompt & configuration
    const { data: assistant } = await supabase
      .from('assistants')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const websocketUrl = process.env.WEBSOCKET_SERVER_URL || 'wss://your-domain.ngrok-free.app/media-stream';

    // TwiML payload to start the WebSockets Media Stream with our custom WebSocket server
    const twiml = `
      <Response>
        <Connect>
          <Stream url="${websocketUrl}">
            <Parameter name="assistantPrompt" value="${assistant?.system_prompt || 'You are a professional assistant.'}" />
            <Parameter name="firstMessage" value="${assistant?.first_message || 'Hello!'}" />
          </Stream>
        </Connect>
      </Response>
    `;

    // 3. Make direct REST API call to Twilio
    const authString = Buffer.from(`${creds.account_sid}:${creds.auth_token}`).toString('base64');
    
    console.log(`📞 Triggering Twilio call to ${phoneNumber} from ${creds.phone_number}...`);

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${creds.account_sid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: creds.phone_number,
          Twiml: twiml.trim(),
          Record: 'true',
          RecordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhook`
        })
      }
    );

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio Error:', twilioData);
      return NextResponse.json({ 
        error: twilioData.message || 'Twilio call failed', 
        details: twilioData 
      }, { status: twilioResponse.status });
    }

    // 4. Save call log record in Supabase
    const { error: dbError } = await supabase
      .from('calls')
      .insert([{
        user_id: userId,
        contact_name: contactName || 'Unknown',
        phone_number: phoneNumber,
        status: 'In-progress',
        sentiment: '⏳ Pending',
        summary: 'Call placed. WebSocket stream initiated.'
      }]);

    if (dbError) console.error('Error saving call log to db:', dbError);

    return NextResponse.json({
      id: twilioData.sid,
      status: 'queued',
      contactName,
      phoneNumber,
      message: `Call successfully placed via your connected Twilio account!`,
      date: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Call route error:', error);
    return NextResponse.json({ error: 'Failed to place call: ' + error.message }, { status: 500 });
  }
}
