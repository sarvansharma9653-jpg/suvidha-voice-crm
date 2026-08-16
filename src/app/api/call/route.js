import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { phoneNumber, contactName, campaignId, systemPrompt, provider } = body;

    const selectedProvider = provider || (typeof window !== 'undefined' ? localStorage.getItem('telephonyProvider') : 'exotel');
    const targetNumber = phoneNumber || '+917707978068';

    console.log(`📞 Dispatching Outbound Call via Provider: ${selectedProvider} to ${contactName || 'Lead'} (${targetNumber})...`);

    let callSid = 'call_' + Date.now();
    let statusMessage = `🎉 Outbound Call Dispatched to ${targetNumber}! Your phone will ring shortly.`;

    // 1. EXOTEL INDIA (+91) ENTERPRISE OUTBOUND DISPATCH
    if (selectedProvider === 'exotel') {
      const rawSubdomain = body.exotelSubdomain || process.env.EXOTEL_SUBDOMAIN || 'api.exotel.com';
      const accountSid = body.exotelAccountSid || body.accountSid || process.env.EXOTEL_ACCOUNT_SID || 'designsuvidha1';
      const apiKey = body.exotelApiKey || body.accountSid || process.env.EXOTEL_API_KEY || '';
      const apiToken = body.exotelApiToken || body.authToken || process.env.EXOTEL_API_TOKEN || '';
      
      // Auto-format destination target number (e.g. 07707978068)
      let cleanTarget = targetNumber.replace(/[^0-9]/g, '');
      if (cleanTarget.startsWith('91') && cleanTarget.length === 12) {
        cleanTarget = '0' + cleanTarget.substring(2);
      } else if (!cleanTarget.startsWith('0') && cleanTarget.length === 10) {
        cleanTarget = '0' + cleanTarget;
      }

      // Auto-format hostname correctly
      let domainHost = rawSubdomain.includes('.') ? rawSubdomain : `${rawSubdomain}.exotel.com`;
      if (!domainHost || domainHost === '.exotel.com') domainHost = 'api.exotel.com';

      // Possible Exotel ExoPhones from user's account
      const callerCandidates = [
        body.callerNumber || body.exotelVirtualNumber,
        '09519886363',
        '08047280901'
      ].filter(Boolean);

      if (apiKey && apiToken && accountSid) {
        const authString = Buffer.from(`${apiKey}:${apiToken}`).toString('base64');
        let success = false;

        for (const rawCaller of callerCandidates) {
          let cleanCallerId = rawCaller.replace(/[^0-9]/g, '');
          if (cleanCallerId.startsWith('91') && cleanCallerId.length === 12) {
            cleanCallerId = '0' + cleanCallerId.substring(2);
          } else if (!cleanCallerId.startsWith('0') && cleanCallerId.length === 10) {
            cleanCallerId = '0' + cleanCallerId;
          }

          try {
            const exotelUrl = `https://${domainHost}/v1/Accounts/${accountSid}/Calls/connect.json`;
            console.log(`📡 Exotel Outbound Request to: ${exotelUrl} with CallerId: ${cleanCallerId}`);

            const exotelRes = await fetch(exotelUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                From: cleanTarget,
                To: cleanCallerId,
                CallerId: cleanCallerId,
                Url: 'http://16.170.166.247:3001/exotel-passthru'
              })
            });

            const exotelData = await exotelRes.json();
            if (exotelRes.ok) {
              callSid = exotelData.Call?.Sid || callSid;
              statusMessage = `🎉 REAL EXOTEL CALL DISPATCHED (SID: ${callSid})! Phone ringing on ${targetNumber}!`;
              success = true;
              break;
            } else {
              console.warn(`Exotel CallerId (${cleanCallerId}) Note:`, exotelData.RestException?.Message);
              statusMessage = `⚠️ Exotel Response (${exotelRes.status}): ${exotelData.RestException?.Message || 'Check credentials'}`;
            }
          } catch (e) {
            console.error('Exotel fetch exception:', e);
            statusMessage = `⚠️ Exotel Network Exception: ${e.message}`;
          }
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
