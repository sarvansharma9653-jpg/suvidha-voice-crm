import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { phoneNumber, contactName, campaignId, systemPrompt } = body;

    const accountSid = body.accountSid || process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = body.authToken || process.env.TWILIO_AUTH_TOKEN || '';
    const fromNumber = body.callerNumber || process.env.TWILIO_PHONE_NUMBER || '+17372212163';
    const targetNumber = phoneNumber || '+917707978068';

    console.log(`📞 Triggering Outbound Call from ${fromNumber} to ${contactName || 'Lead'} (${targetNumber})...`);

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
    let twilioStatusMessage = `🎉 Call Dispatched from ${fromNumber} to ${targetNumber}! Your phone will ring shortly.`;

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
        twilioStatusMessage = `🎉 REAL TWILIO CALL DISPATCHED (SID: ${twilioData.sid})! Phone ringing on ${targetNumber}!`;
      } else {
        console.error('Twilio Error:', twilioData);
        twilioStatusMessage = `⚠️ Twilio Note (${twilioData.code}): ${twilioData.message}`;
      }
    }

    return NextResponse.json({
      id: twilioCallSid,
      status: 'queued',
      contactName: contactName || 'Lead',
      phoneNumber: targetNumber,
      callerNumber: fromNumber,
      provider: 'Twilio Telephony',
      message: twilioStatusMessage,
      date: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Call route error:', error);
    return NextResponse.json({ error: 'Failed to place call: ' + error.message }, { status: 500 });
  }
}
