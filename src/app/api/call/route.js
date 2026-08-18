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
      const authId = (body.vobizAuthId || process.env.VOBIZ_AUTH_ID || 'MA_QTLGTSF9').trim();
      const authToken = (body.vobizAuthToken || body.vobizApiKey || process.env.VOBIZ_AUTH_TOKEN || '').trim();
      const callerNumber = (body.vobizVirtualNumber || body.callerNumber || process.env.VOBIZ_CALLER_ID || '+917965854263').trim();

      // Format E.164 phone numbers with +91
      const rawTarget = targetNumber.replace(/[^0-9]/g, '');
      const cleanTarget91 = rawTarget.startsWith('91') ? rawTarget : `91${rawTarget.replace(/^0+/, '')}`;
      const plusTarget = `+${cleanTarget91}`;

      const rawCaller = callerNumber.replace(/[^0-9]/g, '');
      const cleanCaller91 = rawCaller.startsWith('91') ? rawCaller : `91${rawCaller.replace(/^0+/, '')}`;
      const plusCaller = `+${cleanCaller91}`;

      if (!authId || !authToken) {
        return NextResponse.json({
          success: false,
          error: 'Vobiz Auth ID and Auth Token are required. Please enter them in Settings and click Save.'
        }, { status: 400 });
      }

      try {
        const authString = Buffer.from(`${authId}:${authToken}`).toString('base64');
        console.log(`📡 Vobiz API Call: AuthID=${authId}, From=${plusCaller}, To=${plusTarget}`);

        const payload = {
          from: plusCaller,
          to: plusTarget,
          answer_url: 'https://suvidha-voice-crm.vercel.app/api/inbound',
          answer_method: 'POST',
          hangup_url: 'https://suvidha-voice-crm.vercel.app/api/webhook',
          hangup_method: 'POST'
        };

        const headers = {
          'Authorization': `Basic ${authString}`,
          'X-Auth-ID': authId,
          'X-Auth-Token': authToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        // Try Official Vobiz Base URL (/api/v1/)
        let vobizRes = await fetch(`https://api.vobiz.ai/api/v1/Account/${authId}/Call/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        let resText = await vobizRes.text();
        console.log(`Vobiz /api/v1/ Status: ${vobizRes.status}, Body:`, resText);

        // Fallback without trailing slash
        if (vobizRes.status === 404) {
          vobizRes = await fetch(`https://api.vobiz.ai/api/v1/Account/${authId}/Call`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });
          resText = await vobizRes.text();
          console.log(`Vobiz /api/v1/Call (no slash) Status: ${vobizRes.status}, Body:`, resText);
        }

        // Fallback to /v1/Account
        if (vobizRes.status === 404) {
          vobizRes = await fetch(`https://api.vobiz.ai/v1/Account/${authId}/Call/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });
          resText = await vobizRes.text();
          console.log(`Vobiz /v1/ Status: ${vobizRes.status}, Body:`, resText);
        }

        let resJson = {};
        try { resJson = JSON.parse(resText); } catch(e) {}

        if (vobizRes.ok && (resJson.request_uuid || resJson.call_uuid || resJson.message?.toLowerCase().includes('queued') || resJson.message?.toLowerCase().includes('success'))) {
          callSid = resJson.request_uuid || resJson.call_uuid || callSid;
          statusMessage = `🎉 REAL VOBIZ PHONE CALL DISPATCHED! Phone is ringing on ${plusTarget} (Call ID: ${callSid})!`;
          isSuccess = true;
        } else {
          // Unpack clean error
          let cleanErr = '';
          if (typeof resJson.error === 'string') cleanErr = resJson.error;
          else if (typeof resJson.message === 'string') cleanErr = resJson.message;
          else if (resJson.error && typeof resJson.error === 'object') cleanErr = JSON.stringify(resJson.error);
          else cleanErr = resText || `HTTP ${vobizRes.status}`;

          statusMessage = `⚠️ Vobiz Notice: ${cleanErr}`;
          isSuccess = false;
        }
      } catch (err) {
        console.error('Vobiz Network Exception:', err);
        statusMessage = `⚠️ Vobiz Network Exception: ${err.message}`;
        isSuccess = false;
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
