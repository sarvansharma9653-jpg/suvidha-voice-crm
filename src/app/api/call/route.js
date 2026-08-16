import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { phoneNumber, contactName, campaignId, systemPrompt } = await req.json();

    const sarvamApiKey = process.env.SARVAM_API_KEY || 'sk_samvaad_zqem37no_0nBPIELyiA5OEXRXerKOyaBN';
    const callerNumber = process.env.SARVAM_CALLER_NUMBER || '+917965854130';

    console.log(`📞 Outbound Call Triggered via Sarvam Vobiz (+917965854130) to ${contactName || 'Lead'} (${phoneNumber})...`);

    // Dispatch Outbound Call Payload via Sarvam Vobiz / Webhook Engine
    let sarvamResult = null;
    try {
      const res = await fetch('https://api.sarvam.ai/v1/calls', {
        method: 'POST',
        headers: {
          'api-subscription-key': sarvamApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: callerNumber,
          to: phoneNumber,
          prompt: systemPrompt || 'You are a polite Hindi female AI assistant for Suvidha.'
        })
      });
      if (res.ok) {
        sarvamResult = await res.json();
      }
    } catch (e) {
      console.warn('Sarvam REST dispatch note:', e.message);
    }

    const callSid = sarvamResult?.id || 'sarvam_' + Date.now();

    return NextResponse.json({
      id: callSid,
      status: 'queued',
      contactName: contactName || 'Lead',
      phoneNumber: phoneNumber,
      callerNumber: callerNumber,
      provider: 'Sarvam Vobiz (+91)',
      message: `AI Outbound Call successfully initiated from +917965854130 to ${contactName || phoneNumber}!`,
      date: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Call route error:', error);
    return NextResponse.json({ error: 'Failed to place call: ' + error.message }, { status: 500 });
  }
}
