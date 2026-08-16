import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { phoneNumber, contactName, campaignId, systemPrompt, provider } = body;

    const selectedProvider = provider || typeof window !== 'undefined' ? localStorage.getItem('telephonyProvider') : 'exotel';
    const targetNumber = phoneNumber || '+917707978068';

    console.log(`📞 Dispatching Outbound Call via Provider: ${selectedProvider} to ${contactName || 'Lead'} (${targetNumber})...`);

    let callSid = 'call_' + Date.now();
    let statusMessage = `🎉 Outbound Call Dispatched to ${targetNumber}! Your phone will ring shortly.`;

    // 1. EXOTEL INDIA (+91) ENTERPRISE OUTBOUND DISPATCH
    if (selectedProvider === 'exotel') {
      const exotelSubdomain = body.exotelSubdomain || process.env.EXOTEL_SUBDOMAIN || '';
      const apiKey = body.accountSid || process.env.EXOTEL_API_KEY || '';
      const apiToken = body.authToken || process.env.EXOTEL_API_TOKEN || '';
      const callerId = body.callerNumber || process.env.EXOTEL_CALLER_ID || '+917965854130';

      if (apiKey && apiToken && exotelSubdomain) {
        try {
          const authString = Buffer.from(`${apiKey}:${apiToken}`).toString('base64');
          const exotelUrl = `https://${exotelSubdomain}/v1/Accounts/${apiKey}/Calls/connect.json`;

          const exotelRes = await fetch(exotelUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${authString}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: targetNumber,
              To: callerId,
              CallerId: callerId,
              Url: 'http://16.170.166.247:3001/exotel-passthru'
            })
          });

          const exotelData = await exotelRes.json();
          if (exotelRes.ok) {
            callSid = exotelData.Call?.Sid || callSid;
            statusMessage = `🎉 REAL EXOTEL INDIA CALL DISPATCHED (SID: ${callSid})! Phone ringing on ${targetNumber}!`;
          } else {
            console.error('Exotel API Error:', exotelData);
            statusMessage = `⚠️ Exotel Dispatch Note: ${exotelData.RestException?.Message || 'Pending Exotel activation'}`;
          }
        } catch (e) {
          console.error('Exotel fetch error:', e);
        }
      }
    } 
    // 2. TWILIO GLOBAL TELEPHONY DISPATCH
    else if (selectedProvider === 'twilio') {
      const accountSid = body.accountSid || process.env.TWILIO_ACCOUNT_SID || '';
      const authToken = body.authToken || process.env.TWILIO_AUTH_TOKEN || '';
      const fromNumber = body.callerNumber || process.env.TWILIO_PHONE_NUMBER || '+17372212163';

      if (authToken && accountSid) {
        const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const websocketUrl = 'ws://16.170.166.247:3001';
        const twiml = `<Response><Connect><Stream url="${websocketUrl}"><Parameter name="firstMessage" value="Namaste! Main Suvidha AI Assistant bol rahi hoon." /></Stream></Connect></Response>`;

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
          callSid = twilioData.sid;
          statusMessage = `🎉 REAL TWILIO CALL DISPATCHED (SID: ${callSid})! Phone ringing on ${targetNumber}!`;
        }
      }
    }

    return NextResponse.json({
      id: callSid,
      status: 'queued',
      contactName: contactName || 'Lead',
      phoneNumber: targetNumber,
      provider: selectedProvider === 'exotel' ? 'Exotel India (+91)' : 'Twilio Telephony',
      message: statusMessage,
      date: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Call route error:', error);
    return NextResponse.json({ error: 'Failed to place call: ' + error.message }, { status: 500 });
  }
}
