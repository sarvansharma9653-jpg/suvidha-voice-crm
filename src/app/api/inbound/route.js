import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    let bodyText = '';
    try {
      bodyText = await req.text();
      console.log('📞 Inbound Call Answered on Vobiz! Raw Payload:', bodyText);
    } catch(e) {}

    // Extract dynamic script and transfer number from URL parameter or query
    const url = new URL(req.url);
    let customScript = url.searchParams.get('script') || '';
    let transferNumber = url.searchParams.get('transferNumber') || '+917707978068';

    if (customScript) {
      try {
        customScript = decodeURIComponent(customScript);
      } catch(e) {}

      customScript = customScript
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    const mainSpeech = customScript.trim() || 'नमस्ते! मैं आपका एआई वॉइस असिस्टेंट बोल रही हूँ। हमारे पास आपके लिए बेस्ट बिजनेस और रियल एस्टेट ऑफर्स हैं।';

    // 100% Valid Plivo / Vobiz Voice XML with Amazon Polly Aditi (Official Hindi Voice) and Live Dial Bridge
    const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="Polly.Aditi">
    ${mainSpeech}
  </Speak>
  <Wait length="3" />
  <Speak language="hi-IN" voice="Polly.Aditi">
    अगर आप हमारे सीनियर मैनेजर से बात करना चाहते हैं, तो कृपया लाइन पर बने रहें, मैं आपकी कॉल कनेक्ट कर रही हूँ।
  </Speak>
  <Wait length="2" />
  <Dial callerId="+917965854263">
    <Number>${transferNumber.trim()}</Number>
  </Dial>
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
  <Speak language="hi-IN" voice="Polly.Aditi">नमस्ते! आपका बहुत-बहुत धन्यवाद। हम आपको व्हाट्सएप पर डिटेल भेज रहे हैं।</Speak>
  <Wait length="20" />
</Response>`;
    return new Response(fallbackXml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}
