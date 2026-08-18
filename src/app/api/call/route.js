import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { phoneNumber, contactName, campaignId, systemPrompt, provider } = body;

    const selectedProvider = provider || 'vobiz';
    const targetNumber = phoneNumber || '+917707978068';

    console.log(`📞 Dispatching Outbound Call via Provider: ${selectedProvider} to ${contactName || 'Lead'} (${targetNumber})...`);

    let callSid = 'call_' + Date.now();
    let statusMessage = `🎉 Outbound Call Dispatched to ${targetNumber}! Your phone will ring shortly.`;
    let isSuccess = true;

    // 1. VOBIZ INDIA (+91) TELEPHONY OUTBOUND DISPATCH
    if (selectedProvider === 'vobiz') {
      const authId = body.vobizAuthId || process.env.VOBIZ_AUTH_ID || 'MA_QTLGTSF9';
      const authToken = body.vobizAuthToken || body.vobizApiKey || process.env.VOBIZ_AUTH_TOKEN || '';
      const callerNumber = body.vobizVirtualNumber || body.callerNumber || process.env.VOBIZ_CALLER_ID || '+917965854263';

      // Format clean numbers (both with and without +91)
      const rawTarget = targetNumber.replace(/[^0-9]/g, '');
      const cleanTarget91 = rawTarget.startsWith('91') ? rawTarget : `91${rawTarget.replace(/^0+/, '')}`;
      const plusTarget = `+${cleanTarget91}`;

      const rawCaller = callerNumber.replace(/[^0-9]/g, '');
      const cleanCaller91 = rawCaller.startsWith('91') ? rawCaller : `91${rawCaller.replace(/^0+/, '')}`;
      const plusCaller = `+${cleanCaller91}`;

      if (authId && authToken) {
        try {
          const authString = Buffer.from(`${authId.trim()}:${authToken.trim()}`).toString('base64');
          console.log(`📡 Vobiz Request: To=${plusTarget}, From=${plusCaller}, AuthID=${authId}`);

          // Try Primary Vobiz Endpoint (Plivo / Vobiz standard)
          const vobizUrl = `https://api.vobiz.ai/v1/Account/${authId.trim()}/Call/`;
          const vobizRes = await fetch(vobizUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${authString}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              to: cleanTarget91,
              from: cleanCaller91,
              answer_url: 'https://suvidha-voice-crm.vercel.app/api/inbound',
              hangup_url: 'https://suvidha-voice-crm.vercel.app/api/webhook'
            })
          });

          const resText = await vobizRes.text();
          console.log(`Vobiz API Status: ${vobizRes.status}, Response:`, resText);

          let resJson = {};
          try { resJson = JSON.parse(resText); } catch(e) {}

          if (vobizRes.ok) {
            callSid = resJson.request_uuid || resJson.call_uuid || resJson.message || callSid;
            statusMessage = `🎉 REAL VOBIZ CALL DISPATCHED! Phone ringing on ${plusTarget} (Call ID: ${callSid})!`;
          } else {
            // Secondary Vobiz REST Endpoint
            const res2 = await fetch('https://api.vobiz.ai/v1/calls', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authToken.trim()}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                to: plusTarget,
                from: plusCaller,
                webhookUrl: 'https://suvidha-voice-crm.vercel.app/api/inbound',
                authId: authId.trim()
              })
            });

            const text2 = await res2.text();
            console.log(`Vobiz REST Status: ${res2.status}, Response:`, text2);
            let json2 = {};
            try { json2 = JSON.parse(text2); } catch(e) {}

            if (res2.ok) {
              callSid = json2.callId || json2.id || callSid;
              statusMessage = `🎉 REAL VOBIZ CALL DISPATCHED! Phone ringing on ${plusTarget}!`;
            } else {
              // Return exact error message from Vobiz to user screen
              const errMsg = resJson.message || resJson.error || json2.message || json2.error || `HTTP ${vobizRes.status}`;
              statusMessage = `⚠️ Vobiz Notice: ${errMsg}. Please verify Auth ID & Token in Settings.`;
            }
          }
        } catch (e) {
          console.error('Vobiz Network Error:', e);
          statusMessage = `⚠️ Vobiz Network Error: ${e.message}`;
        }
      } else {
        statusMessage = `⚠️ Vobiz Auth Token missing! Please enter Auth ID and Token in Settings.`;
      }
    }
    // 2. EXOTEL INDIA (+91) OUTBOUND DISPATCH
    else if (selectedProvider === 'exotel') {
      const rawSubdomain = body.exotelSubdomain || 'api.exotel.com';
      const accountSid = body.exotelAccountSid || 'designsuvidha1';
      const apiKey = body.exotelApiKey || '';
      const apiToken = body.exotelApiToken || '';
      const callerId = body.callerNumber || '08047280901';

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
            statusMessage = `🎉 REAL EXOTEL INDIA CALL DISPATCHED! Phone ringing on ${targetNumber}!`;
          } else {
            statusMessage = `⚠️ Exotel: ${exotelData.RestException?.Message || 'Check credentials'}`;
          }
        } catch (e) {
          statusMessage = `⚠️ Exotel Exception: ${e.message}`;
        }
      }
    } 

    return NextResponse.json({
      success: isSuccess,
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
