import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const url = new URL(req.url);
    let customScript = url.searchParams.get('script') || '';
    let transferNumber = url.searchParams.get('transferNumber') || '+918739904737';

    if (customScript) {
      try {
        customScript = decodeURIComponent(customScript);
      } catch(e) {}

      customScript = customScript
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/\uFFFD/g, '');
    }

    const defaultSpeech = 'नमस्कार जी! मैं Pooja बोल रही हूँ, The Shree Aangan Developers की तरफ से। Chaksu, Tonk Road पर हमारे 85 Acres के JDA Approved और RERA Registered Gated Township प्रोजेक्ट के लिए कॉल कर रही हूँ। क्या आप जयपुर में सही कीमत पर प्लॉट या इन्वेस्टमेंट के बारे में जानकारी चाहते हैं?';

    const speechToSpeak = customScript.trim() || defaultSpeech;

    // Plivo / Vobiz GetInput with Speech Recognition (Barge-in enabled)
    // As soon as customer speaks, speech playback stops, speech is transcribed in hi-IN and sent to process-speech
    const actionUrl = 'https://suvidha-voice-crm.vercel.app/api/inbound/process-speech';

    const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetInput action="${actionUrl}" method="POST" inputType="speech" speechModel="command_and_search" language="hi-IN" speechEndTimeout="1" executionTimeout="15" redirect="true">
    <Speak language="hi-IN" voice="Polly.Aditi">
      ${speechToSpeak}
    </Speak>
  </GetInput>
  <Speak language="hi-IN" voice="Polly.Aditi">
    साइट विजिट और पूरी जानकारी के लिए हम आपको व्हाट्सएप पर ब्रोशर और लोकेशन भेज रहे हैं। आपका बहुत-बहुत धन्यवाद!
  </Speak>
  <Wait length="2" />
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
  <Speak language="hi-IN" voice="Polly.Aditi">नमस्कार जी! The Shree Aangan Developers से बात करने के लिए धन्यवाद।</Speak>
</Response>`;
    return new Response(fallbackXml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
  }
}
