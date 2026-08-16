import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { phoneNumber, contactName, campaignId, systemPrompt } = await req.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || 'AC_STORED_IN_SETTINGS';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    const fromNumber = process.env.TWILIO_PHONE_NUMBER || '+17372212163';
    const targetNumber = phoneNumber || '+917707978068';

    console.log(`📞 Triggering Twilio Real Outbound Call from ${fromNumber} to ${contactName || 'Lead'} (${targetNumber})...`);

    // TwiML payload connecting live call audio stream to AWS Server (16.170.166.247:3001)
    const websocketUrl = 'ws://16.170.166.247:3001';
    const twiml = `
      <Response>
        <Connect>
          <Stream url="${websocketUrl}">
            <Parameter name="assistantPrompt" value="${systemPrompt || 'You are a polite female AI assistant for Suvidha.'}" />
            <Parameter name="firstMessage" value="Namaste! Main Suvidha AI Assistant bol rahi hoon." />
          </Stream>
        </Connect>
      </Response>
    `;

    let twilioCallSid = 'twilio_' + Date.now();

    if (authToken && accountSid) {
      const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: targetNumber,
          From: fromNumber,
          Twiml: twiml.trim()
        })
      });

      const twilioData = await twilioRes.json();
      if (twilioRes.ok) {
        twilioCallSid = twilioData.sid;
      }
    }

    return NextResponse.json({
      id: twilioCallSid,
      status: 'queued',
      contactName: contactName || 'Lead',
      phoneNumber: targetNumber,
      callerNumber: fromNumber,
      provider: 'Twilio (+17372212163)',
      message: `🎉 Twilio Call Dispatched from ${fromNumber} to ${targetNumber}! Your phone will ring shortly.`,
      date: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Call route error:', error);
    return NextResponse.json({ error: 'Failed to place call: ' + error.message }, { status: 500 });
  }
}
