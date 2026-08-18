import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    let bodyText = '';
    let speechResult = '';
    let digits = '';

    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await req.json();
        speechResult = json.SpeechResult || json.speech_result || json.text || '';
        digits = json.Digits || json.digits || '';
      } else {
        bodyText = await req.text();
        const params = new URLSearchParams(bodyText);
        speechResult = params.get('SpeechResult') || params.get('speech_result') || params.get('Speech') || '';
        digits = params.get('Digits') || params.get('digits') || '';
      }
      console.log(`📞 Inbound Speech Received: "${speechResult}", Digits: "${digits}"`);
    } catch(e) {
      console.log('Body parse note:', e.message);
    }

    let aiSpeech = 'नमस्ते! मैं सुविधा एआई वॉइस असिस्टेंट बोल रही हूँ। हमारे पास आपके लिए बेस्ट बिजनेस और रियल एस्टेट ऑफर्स हैं। बताइए, आज मैं आपकी क्या सहायता कर सकती हूँ?';

    // Conversational Intelligence Response Loop
    if (speechResult) {
      const lower = speechResult.toLowerCase();
      if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('rate') || lower.includes('kitna') || lower.includes('daam')) {
        aiSpeech = 'जी बिल्कुल! हमारे पैकेजेस बहुत ही कस्टमाइज़्ड और किफायती हैं। क्या मैं आपकी जरूरत के हिसाब से बेस्ट प्लान और ब्रोशर व्हाट्सएप पर भेज दूँ?';
      } else if (lower.includes('flat') || lower.includes('noida') || lower.includes('property') || lower.includes('house') || lower.includes('ghar')) {
        aiSpeech = 'जी! नोएडा सेक्टर 62 में हमारे पास 2 और 3 बीएचके फ्लैट्स 45 लाख से शुरू हैं। क्या आप इस वीकेंड साइट विजिट के लिए फ्री हैं?';
      } else if (lower.includes('yes') || lower.includes('haan') || lower.includes('theek') || lower.includes('sure') || lower.includes('sahi')) {
        aiSpeech = 'बहुत बढ़िया! मैंने आपका नंबर नोट कर लिया है। हमारी सीनियर टीम आपको 10 मिनट के अंदर सारी डिटेल्स व्हाट्सएप कर देगी। क्या आपका कोई और सवाल है?';
      } else if (lower.includes('no') || lower.includes('nahi') || lower.includes('baad mein')) {
        aiSpeech = 'कोई बात नहीं सर! आपका बहुत-बहुत धन्यवाद। जब भी आपको जरूरत हो, आप इस नंबर पर संपर्क कर सकते हैं। आपका दिन शुभ हो!';
      } else {
        aiSpeech = `जी बिल्कुल, मैं समझ गई। हम आपको पूरी सहायता देंगे। क्या आप इसके बारे में और डिटेल जानना चाहते हैं?`;
      }
    } else if (digits) {
      aiSpeech = 'धन्यवाद! आपका इनपुट मिल गया है। हमारे एग्जीक्यूटिव तुरंत आपसे संपर्क करेंगे। क्या आपका कोई अन्य प्रश्न है?';
    }

    // Continuous Two-Way Interactive Voice Loop (Never Hangs Up Early!)
    const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetInput action="https://suvidha-voice-crm.vercel.app/api/inbound" method="POST" inputType="speech" speechEndTimeout="2" language="hi-IN">
    <Speak language="hi-IN" voice="WOMAN">
      ${aiSpeech}
    </Speak>
  </GetInput>
  <Gather action="https://suvidha-voice-crm.vercel.app/api/inbound" method="POST" inputType="speech" timeout="6" speechEndTimeout="2" language="hi-IN">
    <Speak language="hi-IN" voice="WOMAN">
      ${aiSpeech}
    </Speak>
  </Gather>
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
