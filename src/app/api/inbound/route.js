import { NextResponse } from 'next/server';

function generateInboundXml(reqUrl) {
  try {
    const url = new URL(reqUrl);
    let customScript = url.searchParams.get('script') || '';

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

    const defaultSpeech = 'नमस्कार जी! मैं Pooja बोल रही हूँ, The Shree Aangan Developers की तरफ से। Chaksu, Tonk Road पर हमारे 85 Acres के JDA Approved टाउनशिप प्रोजेक्ट के लिए कॉल कर रही हूँ। क्या आप जयपुर में सही कीमत पर प्लॉट या इन्वेस्टमेंट के बारे में सोच रहे हैं?';

    const speechToSpeak = (customScript.trim() || defaultSpeech)
      .replace(/[*_#`]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Plivo GetInput with Speech Recognition in Hindi (hi-IN)
    // As soon as the customer speaks, Plivo stops speaking (Barge-in), transcribes customer speech, and POSTs to process-speech
    const actionUrl = 'https://suvidha-voice-crm.vercel.app/api/inbound/process-speech';

    const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetInput action="${actionUrl}" method="POST" inputType="speech" language="hi-IN" speechEndTimeout="2" redirect="true">
    <Speak language="hi-IN" voice="WOMAN">${speechToSpeak}</Speak>
  </GetInput>
  <Speak language="hi-IN" voice="WOMAN">
    साइट विजिट और पूरी जानकारी के लिए हम आपको व्हाट्सएप पर ब्रोशर भेज रहे हैं। आपका धन्यवाद!
  </Speak>
</Response>`;

    return responseXml.trim();
  } catch (err) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="WOMAN">नमस्कार जी! The Shree Aangan Developers से बात करने के लिए धन्यवाद।</Speak>
</Response>`;
  }
}

export async function POST(req) {
  try {
    const xml = generateInboundXml(req.url);
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Inbound POST Error:', error);
    return new Response('<Response><Speak language="hi-IN" voice="WOMAN">Namaste! Shree Aangan Developers.</Speak></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml; charset=utf-8' }
    });
  }
}

export async function GET(req) {
  try {
    const xml = generateInboundXml(req.url);
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Inbound GET Error:', error);
    return new Response('<Response><Speak language="hi-IN" voice="WOMAN">Namaste! Shree Aangan Developers.</Speak></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml; charset=utf-8' }
    });
  }
}
