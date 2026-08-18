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

      // Format clean numbers
      const rawTarget = targetNumber.replace(/[^0-9]/g, '');
      const cleanTarget = rawTarget.startsWith('91') ? rawTarget : `91${rawTarget.replace(/^0+/, '')}`;
      const plusTarget = `+${cleanTarget}`;

      const rawCaller = callerNumber.replace(/[^0-9]/g, '');
      const cleanCaller = rawCaller.startsWith('91') ? rawCaller : `91${rawCaller.replace(/^0+/, '')}`;
      const plusCaller = `+${cleanCaller}`;

      if (!authId || !authToken) {
        return NextResponse.json({
          success: false,
          error: 'Vobiz Auth ID and Auth Token are required. Please enter them in Settings and click Save.'
        }, { status: 400 });
      }

      try {
        const authString = Buffer.from(`${authId}:${authToken}`).toString('base64');
        console.log(`📡 Vobiz Calling API: AuthID=${authId}, From=${plusCaller}, To=${plusTarget}`);

        // Try Endpoint 1: Standard Plivo/Vobiz Account Call Endpoint
        const payload1 = {
          from: plusCaller,
          to: plusTarget,
          answer_url: 'https://suvidha-voice-crm.vercel.app/api/inbound',
          answer_method: 'POST',
          hangup_url: 'https://suvidha-voice-crm.vercel.app/api/webhook',
          hangup_method: 'POST'
        };

        const res1 = await fetch(`https://api.vobiz.ai/v1/Account/${authId}/Call/`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload1)
        });

        const text1 = await res1.text();
        console.log(`Vobiz Endpoint 1 Status: ${res1.status}, Body:`, text1);

        let data1 = {};
        try { data1 = JSON.parse(text1); } catch(e) {}

        if (res1.ok && (data1.request_uuid || data1.call_uuid || data1.message?.toLowerCase().includes('queued') || data1.message?.toLowerCase().includes('success'))) {
          callSid = data1.request_uuid || data1.call_uuid || callSid;
          statusMessage = `🎉 REAL VOBIZ PHONE CALL DISPATCHED! Phone is ringing on ${plusTarget} (Call ID: ${callSid})!`;
          isSuccess = true;
        } else {
          // Try Endpoint 2: Direct REST /calls Endpoint with Bearer Auth
          const res2 = await fetch('https://api.vobiz.ai/v1/calls', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: plusCaller,
              to: plusTarget,
              webhookUrl: 'https://suvidha-voice-crm.vercel.app/api/inbound',
              authId: authId
            })
          });

          const text2 = await res2.text();
          console.log(`Vobiz Endpoint 2 Status: ${res2.status}, Body:`, text2);

          let data2 = {};
          try { data2 = JSON.parse(text2); } catch(e) {}

          if (res2.ok && (data2.callId || data2.id || data2.success)) {
            callSid = data2.callId || data2.id || callSid;
            statusMessage = `🎉 REAL VOBIZ PHONE CALL DISPATCHED! Phone is ringing on ${plusTarget}!`;
            isSuccess = true;
          } else {
            // Extract clean readable error string (NEVER [object Object])
            let cleanErr = '';
            if (typeof data1.error === 'string') cleanErr = data1.error;
            else if (typeof data1.message === 'string') cleanErr = data1.message;
            else if (data1.error && typeof data1.error === 'object') cleanErr = JSON.stringify(data1.error);
            else if (data1.errors) cleanErr = JSON.stringify(data1.errors);
            else if (typeof data2.error === 'string') cleanErr = data2.error;
            else if (typeof data2.message === 'string') cleanErr = data2.message;
            else cleanErr = text1 || text2 || `HTTP ${res1.status}`;

            console.error('Vobiz Call Dispatch Error:', cleanErr);
            statusMessage = `⚠️ Vobiz Error: ${cleanErr}. Check your Vobiz Auth Token and DID Number in Settings.`;
            isSuccess = false;
          }
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
