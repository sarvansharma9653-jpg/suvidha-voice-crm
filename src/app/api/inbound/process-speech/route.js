import { NextResponse } from 'next/server';

const defaultShreeScript = `नमस्कार जी! मैं Pooja बोल रही हूँ, The Shree Aangan Developers की तरफ से।

जी, मैं आपको एक बहुत ही महत्वपूर्ण जानकारी देने के लिए Call कर रही हूँ।

आपने जयपुर में Property Investment या घर लेने के बारे में सोचा होगा — तो आज मैं आपको Jaipur का सबसे बड़ा Golden Opportunity बताने वाली हूँ।

Chaksu, Tonk Road पर हमारा 85 Acres का JDA Approved और RERA Registered Gated Township प्रोजेक्ट है — जहाँ Property की कीमतें हर साल 18 से 25 प्रतिशत बढ़ रही हैं!

और सबसे बड़ी बात — Jaipur Metro Phase 2 की नींव July 2026 में रख दी गई है! जब Metro आएगी, तो यहाँ की Property की कीमतें 40 से 60 प्रतिशत तक और बढ़ जाएंगी।

यह Last Chance है सही Price में लेने का — क्या आप इस Weekend हमारी Site Visit के लिए आ सकते हैं? हम आपको सब कुछ खुद दिखाएंगे!`;

const defaultShreeObjections = `अगर Customer पूछे "Price kya hai" / "Rate kya hai":
जी, हमारे JDA Approved Plots ₹800 से ₹2,750 प्रति वर्ग फुट के बीच उपलब्ध हैं — EMI Facility के साथ। और अभी जो कीमत है, 3 साल बाद यह Double हो जाएगी क्योंकि Jaipur Metro Phase 2 Tonk Road पर आ रही है। Complete Price List अभी व्हाट्सएप कर रही हूँ!

अगर Customer पूछे "Location kahan hai" / "Kitna door hai":
जी, प्रोजेक्ट Chaksu, Tonk Road पर है — Jaipur से सिर्फ 25-30 km की दूरी पर NH-12 Jaipur-Kota Highway पर। Jaipur Outer Ring Road से बिल्कुल Connected है। Sheetla Mata Mandir और Bombay Hospital के पास। Google Maps Location अभी आपके व्हाट्सएप पर भेज रही हूँ।

अगर Customer पूछे "Grow karega kya" / "Return milega?" :
जी बिल्कुल! Chaksu में इस साल Property 18-25% बढ़ी है। Jaipur Metro Phase 2 का काम शुरू हो गया है — Metro आने पर Property 40-60% और बढ़ेगी। Delhi-Mumbai Industrial Corridor (DMIC) का 39% हिस्सा Rajasthan से जाता है — इसके Influence Zone में हैं हम! यह Jaipur का Next Booming Zone है।

अगर Customer पूछे "Iska RERA Number kya hai" / "Legal hai?":
जी बिल्कुल Legal है! हमारा RERA Registration Number है RAJ/P/2026/4660 — Rajasthan RERA पर Verify कर सकते हैं। JDA Approved Project है। पूरा Documentation 100% Clear है।

अगर Customer पूछे "Koi Guarantee?" / "Trustworthy hai?":
जी, The Shree Aangan एक Trusted Developer है। RERA Approved, JDA Approved, 85 Acres का Gated Township, 1500+ Satisfied Customers। आप हमारे Instagram @shreeaangandevelopers पर Photos और Projects देख सकते हैं।

अगर Customer पूछे "Mujhe zaroorat nahi" / "Baad mein sochenge":
Sir, मैं समझती हूँ। लेकिन Metro Phase 2 का काम शुरू हो गया है — जैसे ही Metro आती है, आज की Price में नहीं मिलेगा। Limited Plots बचे हैं। एक बार बिना किसी Commitment के साइट देखें — पसंद आए तो आगे बात करें। क्या Saturday या Sunday Convenient रहेगा?

अगर Customer पूछे "Brochure bhejo" / "Details chahiye":
जी बिल्कुल! Complete Brochure, Plot Map, RERA Details, Floor Plan, Pricing, और Google Maps Location — सब कुछ अभी आपके व्हाट्सएप पर भेज रही हूँ। Site Visit की एक Free Slot भी Book कर देती हूँ!

अगर Customer कहे "Interested hoon" / "Sahi lagta hai":
अरे बहुत बढ़िया! आपके लिए Best Plot Reserve कर देती हूँ — Site Visit पर आकर चुन लीजिए। Brochure अभी WhatsApp पर आ रहा है!

अगर Customer कहे "Baad mein call karo" / "Busy hoon":
जी ज़रूर! कब Convenient रहेगा — क्या कल सुबह 10 बजे Call करूँ? तब तक मैं पूरी Details और Video Tour WhatsApp पर भेज देती हूँ।`;

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

    console.log(`🎙️ Customer Spoke on Phone Call: "${customerSpeech}"`);

    const cleanInput = (customerSpeech || '').trim();

    // If silence or empty speech
    if (!cleanInput) {
      const silenceXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="Polly.Aditi">
    क्या आप मुझे सुन पा रहे हैं? यदि आप जयपुर में Shree Aangan प्रोजेक्ट की साइट विजिट या प्राइसिंग डिटेल्स चाहते हैं, तो हम आपको व्हाट्सएप पर पूरी जानकारी भेज रहे हैं। धन्यवाद!
  </Speak>
  <Wait length="2" />
</Response>`;
      return new Response(silenceXml.trim(), {
        status: 200,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' }
      });
    }

    const lower = cleanInput.toLowerCase();

    // 1. CHECK FOR LIVE CALL TRANSFER TO ADMIN
    if (lower.includes('senior') || lower.includes('manager') || lower.includes('admin') || lower.includes('transfer') || lower.includes('baat karao') || lower.includes('insaan')) {
      const transferXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="Polly.Aditi">
    जी बिल्कुल सर! मैं आपकी कॉल तुरंत हमारे सीनियर मैनेजर को ट्रांसफर कर रही हूँ। कृपया लाइन पर बने रहें।
  </Speak>
  <Wait length="1" />
  <Dial callerId="+917965854263">
    <Number>+918739904737</Number>
  </Dial>
</Response>`;
      return new Response(transferXml.trim(), {
        status: 200,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' }
      });
    }

    // 2. REAL GOOGLE GEMINI LLM REASONING ON LIVE CALL
    let aiResponse = '';
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (geminiKey) {
      const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash'
      ];

      const systemPrompt = `You are Pooja, an energetic, friendly, and persuasive sales executive for The Shree Aangan Developers (Jaipur Real Estate).
A customer is on a LIVE phone call and just said: "${cleanInput}".

YOUR INSTRUCTIONS:
1. Speak in 1-2 natural, crisp, conversational Hindi sentences.
2. Answer their question accurately using the project facts below.
3. Keep it brief, polite, and energetic for phone call clarity.
4. End with asking for a Free Weekend Site Visit or offering WhatsApp brochure.

FACTS:
${defaultShreeScript}

OBJECTION RULES:
${defaultShreeObjections}
`;

      for (const model of modelsToTry) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
              generationConfig: { temperature: 0.6, maxOutputTokens: 100 }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (raw && raw.trim().length > 5) {
              aiResponse = raw.replace(/[*_#`"]/g, '').trim();
              break;
            }
          }
        } catch(e) {}
      }
    }

    // 3. SMART FALLBACK IF LLM OFFLINE
    if (!aiResponse) {
      if (lower.includes('location') || lower.includes('kahan') || lower.includes('jagah') || lower.includes('address')) {
        aiResponse = 'जी, प्रोजेक्ट Chaksu, Tonk Road पर है — Jaipur से सिर्फ 25-30 km की दूरी पर NH-12 Highway पर Sheetla Mata Mandir के पास। क्या आप इस वीकेंड साइट विजिट के लिए आ सकते हैं?';
      } else if (lower.includes('price') || lower.includes('rate') || lower.includes('cost') || lower.includes('kitne') || lower.includes('paisa')) {
        aiResponse = 'जी, हमारे JDA Approved Plots ₹800 से ₹2,750 प्रति वर्ग फुट से शुरू हैं EMI सुविधा के साथ। Complete Price List अभी आपके WhatsApp पर भेज रही हूँ!';
      } else if (lower.includes('metro') || lower.includes('growth') || lower.includes('return')) {
        aiResponse = 'जी बिल्कुल! Chaksu में 18 से 25% annual growth है और Jaipur Metro Phase 2 का काम शुरू हो गया है, जिससे कीमतें 40 से 60% और बढ़ेंगी!';
      } else if (lower.includes('rera') || lower.includes('legal') || lower.includes('jda')) {
        aiResponse = 'जी बिल्कुल 100% Legal है! हमारा RERA नंबर है RAJ/P/2026/4660 और प्रोजेक्ट JDA Approved है। पूरा Documentation 100% Clear है।';
      } else {
        aiResponse = 'जी बहुत बढ़िया! मैं आपको WhatsApp पर तुरंत प्रोजेक्ट की पूरी डिटेल्स, मैप और ब्रोशर भेज रही हूँ। क्या कल सुबह हमारी टीम आपसे संपर्क कर सकती है?';
      }
    }

    // Clean XML characters
    const cleanSpeech = aiResponse
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const actionUrl = 'https://suvidha-voice-crm.vercel.app/api/inbound/process-speech';

    // Return next interactive turn (Barge-in enabled)
    const nextTurnXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetInput action="${actionUrl}" method="POST" inputType="speech" speechModel="command_and_search" language="hi-IN" speechEndTimeout="1" executionTimeout="12" redirect="true">
    <Speak language="hi-IN" voice="Polly.Aditi">
      ${cleanSpeech}
    </Speak>
  </GetInput>
  <Speak language="hi-IN" voice="Polly.Aditi">
    धन्यवाद जी! हमने आपकी डिटेल्स नोट कर ली हैं और व्हाट्सएप पर ब्रोशर भेज दिया है।
  </Speak>
  <Wait length="2" />
</Response>`;

    return new Response(nextTurnXml.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Process speech error:', error);
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="Polly.Aditi">The Shree Aangan Developers से बात करने के लिए धन्यवाद। हम आपको व्हाट्सएप पर ब्रोशर भेज रहे हैं।</Speak>
</Response>`;
    return new Response(fallbackXml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
  }
}
