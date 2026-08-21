import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    let bodyText = '';
    try {
      bodyText = await req.text();
      console.log('📞 Inbound Call Answered on Vobiz! Raw Payload:', bodyText);
    } catch(e) {}

    const url = new URL(req.url);
    let customScript = url.searchParams.get('script') || '';
    let transferNumber = url.searchParams.get('transferNumber') || '+918739904737';
    let shouldTransfer = url.searchParams.get('transfer') === 'true';

    if (customScript) {
      try {
        customScript = decodeURIComponent(customScript);
      } catch(e) {}

      // Clean XML special characters
      customScript = customScript
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/\uFFFD/g, '');
    }

    const defaultSpeech = 'नमस्कार जी! मैं Pooja बोल रही हूँ, The Shree Aangan Developers की तरफ से। Chaksu, Tonk Road पर हमारे 85 Acres के JDA Approved और RERA Registered Gated Township प्रोजेक्ट के लिए कॉल कर रही हूँ। क्या आप इस वीकेंड साइट विजिट के लिए आ सकते हैं?';

    const mainSpeech = customScript.trim() || defaultSpeech;

    // Plivo / Vobiz XML with Polly.Aditi in Hindi (hi-IN)
    let responseXml = '';

    if (shouldTransfer) {
      responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="Polly.Aditi">
    जी बिल्कुल! मैं आपकी कॉल तुरंत हमारे सीनियर मैनेजर को ट्रांसफर कर रही हूँ। कृपया लाइन पर बने रहें।
  </Speak>
  <Wait length="1" />
  <Dial callerId="+917965854263">
    <Number>${transferNumber.trim()}</Number>
  </Dial>
</Response>`;
    } else {
      // Standard AI Speaking Flow (Speaks exact script clearly and waits for user response or ends gracefully)
      responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="Polly.Aditi">
    ${mainSpeech}
  </Speak>
  <Wait length="4" />
  <Speak language="hi-IN" voice="Polly.Aditi">
    पूरी जानकारी और साइट विजिट के लिए हम आपको व्हाट्सएप पर ब्रोशर भेज रहे हैं। धन्यवाद!
  </Speak>
  <Wait length="2" />
</Response>`;
    }

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
  <Speak language="hi-IN" voice="Polly.Aditi">नमस्कार जी! The Shree Aangan Developers से बात करने के लिए धन्यवाद। हम आपको व्हाट्सएप पर पूरी जानकारी भेज रहे हैं।</Speak>
  <Wait length="3" />
</Response>`;
    return new Response(fallbackXml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
  }
}
