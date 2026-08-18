import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    let bodyText = '';
    try {
      bodyText = await req.text();
      console.log('📞 Inbound Call Answered on Vobiz! Raw Payload:', bodyText);
    } catch(e) {}

    // 100% Valid Plivo / Vobiz Voice XML with Amazon Polly Aditi (Official Hindi Voice)
    const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="Polly.Aditi">
    नमस्ते! मैं सुविधा एआई वॉइस असिस्टेंट बोल रही हूँ। हमारे पास आपके लिए 2 और 3 बीएचके लक्ज़री फ्लैट्स और बिजनेस के बेस्ट ऑफर्स हैं। हम आपको सारी जानकारी और ब्रोशर तुरंत व्हाट्सएप पर भी भेज रहे हैं।
  </Speak>
  <Wait length="5" />
  <Speak language="hi-IN" voice="Polly.Aditi">
    अगर आप और जानकारी चाहते हैं, तो कृपया लाइन पर बने रहें। हमारी टीम आपसे तुरंत संपर्क करेगी। धन्यवाद!
  </Speak>
  <Wait length="30" />
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
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="Polly.Aditi">नमस्ते! सुविधा एआई में आपका स्वागत है।</Speak>
  <Wait length="20" />
</Response>`;
    return new Response(fallbackXml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
  }
}

export async function GET(req) {
  return POST(req);
}
