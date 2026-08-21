import { NextResponse } from 'next/server';

const defaultShreeScript = `नमस्कार जी! मैं Pooja बोल रही हूँ, The Shree Aangan Developers की तरफ से।
Chaksu, Tonk Road पर हमारा 85 Acres का JDA Approved और RERA Registered Gated Township प्रोजेक्ट है — जहाँ Property की कीमतें हर साल 18 से 25 प्रतिशत बढ़ रही हैं!
Jaipur Metro Phase 2 की नींव July 2026 में रख दी गई है, जिससे कीमतें 40 से 60 प्रतिशत तक और बढ़ जाएंगी।
यह Last Chance है सही Price में लेने का — क्या आप इस Weekend हमारी Site Visit के लिए आ सकते हैं?`;

const defaultShreeObjections = `अगर पूछे "Price kya hai": जी, हमारे JDA Approved Plots ₹800 से ₹2,750 प्रति वर्ग फुट के बीच उपलब्ध हैं EMI Facility के साथ।
अगर पूछे "Location kahan hai": जी, प्रोजेक्ट Chaksu, Tonk Road पर है — Jaipur से सिर्फ 25-30 km की दूरी पर NH-12 Jaipur-Kota Highway पर Sheetla Mata Mandir के पास।
अगर पूछे "Metro": जी बिल्कुल! Jaipur Metro Phase 2 का काम शुरू हो गया है, जिससे कीमतें 40-60% और बढ़ेंगी।
अगर पूछे "Legal / RERA": जी बिल्कुल Legal है! हमारा RERA नंबर है RAJ/P/2026/4660 और JDA Approved है।`;

export async function POST(req) {
  try {
    let customerSpeech = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      customerSpeech = formData.get('Speech') || formData.get('speech') || formData.get('SpeechResult') || '';
    } else {
      try {
        const json = await req.json();
        customerSpeech = json.Speech || json.speech || json.SpeechResult || json.text || '';
      } catch(e) {}
    }

    console.log(`🎙️ Live Phone Speech Detected: "${customerSpeech}"`);

    const cleanInput = (customerSpeech || '').trim();

    if (!cleanInput) {
      const silenceXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="WOMAN">
    क्या आप मुझे सुन पा रहे हैं sir? यदि आप Shree Aangan प्रोजेक्ट की साइट विजिट या प्राइसिंग चाहते हैं, तो हम आपको व्हाट्सएप पर पूरी जानकारी भेज रहे हैं।
  </Speak>
</Response>`;
      return new Response(silenceXml.trim(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml; charset=utf-8' }
      });
    }

    const lower = cleanInput.toLowerCase();

    // 1. LIVE ADMIN CALL TRANSFER
    if (lower.includes('senior') || lower.includes('manager') || lower.includes('admin') || lower.includes('transfer') || lower.includes('baat')) {
      const transferXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="WOMAN">
    जी बिल्कुल sir! मैं आपकी कॉल तुरंत हमारे सीनियर मैनेजर को ट्रांसफर कर रही हूँ। कृपया लाइन पर बने रहें।
  </Speak>
  <Wait length="1" />
  <Dial callerId="+917965854263">
    <Number>+918739904737</Number>
  </Dial>
</Response>`;
      return new Response(transferXml.trim(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml; charset=utf-8' }
      });
    }

    // 2. REAL GEMINI LLM REASONING
    let aiResponse = '';
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (geminiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{
                text: `Aap Pooja hain, The Shree Aangan Developers (Jaipur) ki sales consultant.
Phone call par customer ne aapse pucha: "${cleanInput}".
Aapko 1-2 natural, crisp Hinglish sentences mein factual aur polite jawab dena hai.

FACTS:
${defaultShreeScript}
${defaultShreeObjections}

Jawab Hindi mein dein:`
              }]
            }],
            generationConfig: { temperature: 0.6, maxOutputTokens: 80 }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw && raw.trim().length > 4) {
            aiResponse = raw.replace(/[*_#`]/g, '').trim();
          }
        }
      } catch(e) {}
    }

    // Fallback if LLM offline
    if (!aiResponse) {
      if (lower.includes('location') || lower.includes('kahan') || lower.includes('jagah')) {
        aiResponse = 'जी बिल्कुल sir! हमारा प्रोजेक्ट Chaksu, Tonk Road पर NH-12 Highway पर Sheetla Mata Mandir के पास है। क्या मैं आपको WhatsApp पर मैप भेज दूँ?';
      } else if (lower.includes('price') || lower.includes('rate') || lower.includes('cost') || lower.includes('kitne')) {
        aiResponse = 'जी, हमारे JDA Approved Plots ₹800 से ₹2,750 प्रति वर्ग फुट से शुरू हैं आसान EMI के साथ। Complete Price List अभी आपके WhatsApp पर भेज रही हूँ!';
      } else if (lower.includes('metro')) {
        aiResponse = 'जी बिल्कुल! Jaipur Metro Phase 2 का काम शुरू हो गया है, जिससे कीमतें 40 से 60% और बढ़ेंगी!';
      } else {
        aiResponse = 'जी बहुत बढ़िया sir! मैं आपको WhatsApp पर तुरंत प्रोजेक्ट की पूरी डिटेल्स और ब्रोशर भेज रही हूँ। क्या कल आप साइट विजिट के लिए फ्री हैं?';
      }
    }

    const cleanReply = aiResponse
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const actionUrl = 'https://suvidha-voice-crm.vercel.app/api/inbound/process-speech';

    // Loop back with GetInput for continuous two-way conversation
    const nextTurnXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetInput action="${actionUrl}" method="POST" inputType="speech" language="hi-IN" speechEndTimeout="2" redirect="true">
    <Speak language="hi-IN" voice="WOMAN">${cleanReply}</Speak>
  </GetInput>
  <Speak language="hi-IN" voice="WOMAN">
    धन्यवाद sir! हमने आपकी डिटेल्स नोट कर ली हैं और व्हाट्सएप पर ब्रोशर भेज दिया है।
  </Speak>
</Response>`;

    return new Response(nextTurnXml.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Process speech error:', error);
    return new Response('<Response><Speak language="hi-IN" voice="WOMAN">Shree Aangan Developers se baat karne ke liye dhanyawaad.</Speak></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml; charset=utf-8' }
    });
  }
}
