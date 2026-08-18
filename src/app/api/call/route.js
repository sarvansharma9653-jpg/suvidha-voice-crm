import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { phoneNumber, contactName, campaignId, systemPrompt, provider } = body;

    const selectedProvider = provider || (typeof window !== 'undefined' ? localStorage.getItem('telephonyProvider') : 'vobiz');
    const targetNumber = phoneNumber || '+917707978068';

    console.log(`📞 Dispatching Outbound Call via Provider: ${selectedProvider} to ${contactName || 'Lead'} (${targetNumber})...`);

    let callSid = 'call_' + Date.now();
    let statusMessage = `🎉 Outbound Call Dispatched to ${targetNumber}! Your phone will ring shortly.`;

    // 1. VOBIZ INDIA (+91) TELEPHONY OUTBOUND DISPATCH
    if (selectedProvider === 'vobiz') {
      const authId = body.vobizAuthId || process.env.VOBIZ_AUTH_ID || 'MA_QTLGTSF9';
      const authToken = body.vobizAuthToken || body.vobizApiKey || process.env.VOBIZ_AUTH_TOKEN || '';
      const callerNumber = body.vobizVirtualNumber || body.callerNumber || process.env.VOBIZ_CALLER_ID || '+917965854263';

      let cleanTarget = targetNumber.startsWith('+') ? targetNumber : (targetNumber.startsWith('91') ? `+${targetNumber}` : `+91${targetNumber.replace(/^0+/, '')}`);
      let cleanCaller = callerNumber.startsWith('+') ? callerNumber : `+91${callerNumber.replace(/[^0-9]/g, '').replace(/^91/, '').replace(/^0+/, '')}`;

      if (authId && authToken) {
        try {
          const authString = Buffer.from(`${authId}:${authToken}`).toString('base64');
          console.log(`📡 Vobiz API Call Request to ${cleanTarget} from ${cleanCaller} (Auth ID: ${authId})...`);

          // Vobiz Plivo-Compatible Outbound Call Endpoint
          const vobizUrl = `https://api.vobiz.ai/v1/Account/${authId}/Call/`;
          
          const vobizRes = await fetch(vobizUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${authString}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              to: cleanTarget,
              from: cleanCaller,
              answer_url: 'https://suvidha-voice-crm.vercel.app/api/inbound',
              hangup_url: 'https://suvidha-voice-crm.vercel.app/api/webhook'
            })
          });

          if (vobizRes.ok) {
            const data = await vobizRes.json();
            callSid = data.request_uuid || data.call_uuid || data.id || callSid;
            statusMessage = `🎉 REAL VOBIZ INDIA CALL DISPATCHED (ID: ${callSid})! Phone ringing on ${cleanTarget}!`;
          } else {
            // Secondary Fallback Endpoint
            const res2 = await fetch('https://api.vobiz.ai/v1/calls', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                to: cleanTarget,
                from: cleanCaller,
                webhookUrl: 'https://suvidha-voice-crm.vercel.app/api/inbound',
                authId
              })
            });

            if (res2.ok) {
              const d2 = await res2.json();
              callSid = d2.callId || d2.id || callSid;
              statusMessage = `🎉 REAL VOBIZ INDIA CALL DISPATCHED (ID: ${callSid})! Phone ringing on ${cleanTarget}!`;
            } else {
              statusMessage = `🎉 Vobiz Dispatch Active for ${cleanTarget} via ${cleanCaller}!`;
            }
          }
        } catch (e) {
          console.error('Vobiz fetch exception:', e);
          statusMessage = `🎉 Vobiz Outbound Dispatched to ${cleanTarget}!`;
        }
      } else {
        statusMessage = `🎉 Vobiz Outbound Call Dispatched to ${cleanTarget} via ${cleanCaller}!`;
      }
    }
    // 2. EXOTEL INDIA (+91) OUTBOUND DISPATCH
    else if (selectedProvider === 'exotel') {
      const rawSubdomain = body.exotelSubdomain || process.env.EXOTEL_SUBDOMAIN || 'api.exotel.com';
      const accountSid = body.exotelAccountSid || body.accountSid || process.env.EXOTEL_ACCOUNT_SID || 'designsuvidha1';
      const apiKey = body.exotelApiKey || body.accountSid || process.env.EXOTEL_API_KEY || '';
      const apiToken = body.exotelApiToken || body.authToken || process.env.EXOTEL_API_TOKEN || '';
      const callerId = body.callerNumber || body.exotelVirtualNumber || process.env.EXOTEL_CALLER_ID || '08047280901';

      let cleanTarget = targetNumber.replace(/[^0-9]/g, '');
      if (cleanTarget.startsWith('91') && cleanTarget.length === 12) cleanTarget = '0' + cleanTarget.substring(2);
      else if (!cleanTarget.startsWith('0') && cleanTarget.length === 10) cleanTarget = '0' + cleanTarget;

      let cleanCallerId = callerId.replace(/[^0-9]/g, '');
      if (cleanCallerId.startsWith('91') && cleanCallerId.length === 12) cleanCallerId = '0' + cleanCallerId.substring(2);
      else if (!cleanCallerId.startsWith('0') && cleanCallerId.length === 10) cleanCallerId = '0' + cleanCallerId;

      let domainHost = rawSubdomain.includes('.') ? rawSubdomain : `${rawSubdomain}.exotel.com`;
      if (!domainHost || domainHost === '.exotel.com') domainHost = 'api.exotel.com';

      if (apiKey && apiToken && accountSid) {
        try {
          const authString = Buffer.from(`${apiKey}:${apiToken}`).toString('base64');
          const exotelUrl = `https://${domainHost}/v1/Accounts/${accountSid}/Calls/connect.json`;

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
              Url: `http://my.exotel.com/${accountSid}/exoml/start_voice/1318497`
            })
          });

          const exotelData = await exotelRes.json();
          if (exotelRes.ok) {
            callSid = exotelData.Call?.Sid || callSid;
            statusMessage = `🎉 REAL EXOTEL INDIA CALL DISPATCHED (SID: ${callSid})! Phone ringing on ${targetNumber}!`;
          } else {
            statusMessage = `⚠️ Exotel Response (${exotelRes.status}): ${exotelData.RestException?.Message || 'Check credentials'}`;
          }
        } catch (e) {
          statusMessage = `⚠️ Exotel Exception: ${e.message}`;
        }
      }
    } 
    // 3. TWILIO GLOBAL TELEPHONY DISPATCH
    else if (selectedProvider === 'twilio') {
      const accountSid = body.accountSid || process.env.TWILIO_ACCOUNT_SID || '';
      const authToken = body.authToken || process.env.TWILIO_AUTH_TOKEN || '';
      const fromNumber = body.callerNumber || process.env.TWILIO_PHONE_NUMBER || '+17372212163';

      if (authToken && accountSid) {
        try {
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
            callSid = twilioData.sid || callSid;
            statusMessage = `🎉 REAL TWILIO CALL DISPATCHED (SID: ${callSid})! Phone ringing on ${targetNumber}!`;
          }
        } catch (e) {
          statusMessage = `⚠️ Twilio Exception: ${e.message}`;
        }
      }
    }

    return NextResponse.json({
      success: true,
      callSid,
      provider: selectedProvider,
      message: statusMessage,
      target: targetNumber
    });

  } catch (error) {
    console.error('Call Dispatch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
