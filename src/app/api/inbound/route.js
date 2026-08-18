import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    let speechResult = '';
    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await req.json();
        speechResult = json.SpeechResult || json.speech_result || json.text || '';
      } else {
        const bodyText = await req.text();
        const params = new URLSearchParams(bodyText);
        speechResult = params.get('SpeechResult') || params.get('speech_result') || params.get('Speech') || '';
      }
      console.log(`📞 Inbound Speech Received: "${speechResult}"`);
    } catch(e) {}

    let aiSpeech = 'नमस्ते! मैं सुविधा एआई वॉइस असिस्टेंट बोल रही हूँ। हमारे पास आपके लिए 2 और 3 बीएचके लक्ज़री फ्लैट्स और बिजनेस सर्विसेज के बेस्ट ऑफर्स उपलब्ध हैं। हम आपको सारी डिटेल्स और ब्रोशर व्हाट्सएप पर भी भेज रहे हैं। बताइए, क्या आप इस बारे में और जानकारी जानना चाहते हैं?';

    if (speechResult) {
      const lower = speechResult.toLowerCase();
      if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('rate') || lower.includes('kitna') || lower.includes('daam')) {
        aiSpeech = 'जी बिल्कुल! हमारे फ्लैट्स 45 लाख से शुरू हैं और अभी 10% डिस्काउंट चल रहा है। मैंने आपका नंबर नोट कर लिया है और ब्रोशर तुरंत आपको व्हाट्सएप कर रही हूँ!';
      } else if (lower.includes('yes') || lower.includes('haan') || lower.includes('theek') || lower.includes('interested') || lower.includes('bhejo') || lower.includes('send')) {
        aiSpeech = 'बहुत बढ़िया! मैंने आपकी डिटेल नोट कर ली है। हमारी टीम तुरंत आपके इसी नंबर पर पूरी जानकारी और ब्रोशर व्हाट्सएप कर रही है। आपका बहुत-बहुत धन्यवाद!';
      } else {
        aiSpeech = 'जी बिल्कुल, मैं समझ गई। हम आपको तुरंत व्हाट्सएप पर पूरी जानकारी भेज रहे हैं। क्या आपका कोई और सवाल है?';
      }
    }

    // 100% Valid Container XML (Speak nested inside GetInput + Wait fallback)
    const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetInput action="https://suvidha-voice-crm.vercel.app/api/inbound" method="POST" inputType="speech">
    <Speak language="hi-IN" voice="WOMAN">
      ${aiSpeech}
    </Speak>
  </GetInput>
  <Speak language="hi-IN" voice="WOMAN">
    क्या आप सुन पा रहे हैं? बताइए मैं आपकी क्या सहायता करूँ?
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
  <Speak language="hi-IN" voice="WOMAN">
    नमस्ते! सुविधा एआई में आपका स्वागत है। हम आपको व्हाट्सएप पर डिटेल भेज रहे हैं।
  </Speak>
  <Wait length="30" />
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
