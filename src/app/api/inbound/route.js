import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    let bodyText = '';
    try {
      bodyText = await req.text();
      console.log('📞 Inbound Call Answer Webhook Triggered! Body:', bodyText);
    } catch(e) {}

    // Vobiz / Plivo Compliant Voice XML Response
    const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="WOMAN">
    नमस्ते! मैं सुविधा एआई वॉइस असिस्टेंट बोल रही हूँ। हमारे पास आपके लिए बेस्ट बिजनेस और रियल एस्टेट ऑफर्स उपलब्ध हैं। बताइए, आज मैं आपकी क्या सहायता कर सकती हूँ?
  </Speak>
  <Wait length="2" />
  <Speak language="hi-IN" voice="WOMAN">
    क्या आप हमारे ऑफर्स की जानकारी व्हाट्सएप पर पाना चाहते हैं?
  </Speak>
</Response>`;

    return new Response(responseXml.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Inbound webhook error:', error);
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?><Response><Speak language="hi-IN">नमस्ते! सुविधा में आपका स्वागत है।</Speak></Response>`;
    return new Response(fallbackXml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
  }
}

export async function GET(req) {
  return POST(req);
}
