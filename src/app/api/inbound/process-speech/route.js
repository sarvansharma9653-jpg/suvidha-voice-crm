import { NextResponse } from 'next/server';

const defaultShreeScript = `Namaskar ji! Main Pooja bol rahi hoon, The Shree Aangan Developers ki taraf se.
Chaksu, Tonk Road par hamara 85 Acres ka JDA Approved aur RERA Registered Gated Township project hai — jahan property prices har saal 18 se 25 percent badh rahi hain!
Jaipur Metro Phase 2 ki neev July 2026 mein rakh di gayi hai, jisse prices 40 se 60 percent tak aur badh jayengi.
Kya aap is weekend hamari free site visit ke liye aa sakte hain?`;

const defaultShreeObjections = `Agar customer pooche "Price kya hai": Ji, hamare JDA Approved Plots 800 se 2750 rupaye per sq ft ke beech available hain EMI facility ke sath.
Agar pooche "Location kahan hai": Ji, project Chaksu, Tonk Road par hai — Jaipur se sirf 25-30 km ki doori par NH-12 Highway par Sheetla Mata Mandir ke paas.
Agar pooche "Metro": Ji bilkul! Jaipur Metro Phase 2 ka kaam shuru ho chuka hai, jisse prices 40 se 60 percent aur badhengi.
Agar pooche "Legal / RERA": Ji bilkul 100% legal hai! Hamara RERA number hai RAJ/P/2026/4660 aur project JDA Approved hai.`;

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

    console.log(`🎙️ [Phone Call STT] Customer Spoke: "${customerSpeech}"`);

    const cleanInput = (customerSpeech || '').trim();

    if (!cleanInput) {
      const silenceXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="en-IN">
    Kya aap mujhe sun pa rahe hain sir? Shree Aangan project ki site visit aur pricing ke liye hum aapko WhatsApp par poori details bhej rahe hain. Dhanyawaad!
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
  <Speak language="en-IN">
    Ji bilkul sir! Main aapki call turant hamare senior manager ko connect kar rahi hoon. Kripya line par bane rahein.
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

    // 2. REAL GEMINI 2.5 FLASH LLM REASONING
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
                text: `Aap Pooja hain, The Shree Aangan Developers (Jaipur) ki sales telecaller.
Live phone call par customer ne aapse pucha: "${cleanInput}".
Aapko 1-2 natural, crisp Hinglish sentences mein polite aur factual jawab dena hai jaise ek Indian telecaller phone par bolti hai.

FACTS:
${defaultShreeScript}
${defaultShreeObjections}

Jawab Hinglish/Hindi mein dein (maximum 20 words):`
              }]
            }],
            generationConfig: { temperature: 0.6, maxOutputTokens: 60 }
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
      if (lower.includes('location') || lower.includes('kahan') || lower.includes('jagah') || lower.includes('address')) {
        aiResponse = 'Ji bilkul sir! Hamara 85 Acres ka project Chaksu, Tonk Road par NH-12 Highway par Sheetla Mata Mandir ke paas hai. Kya main aapko WhatsApp par map bhej doon?';
      } else if (lower.includes('price') || lower.includes('rate') || lower.includes('cost') || lower.includes('kitne') || lower.includes('budget')) {
        aiResponse = 'Ji, hamare JDA Approved Plots 800 se 2750 rupaye per sq ft se shuru hain easy EMI ke sath. Complete price list abhi aapke WhatsApp par bhej rahi hoon!';
      } else if (lower.includes('metro') || lower.includes('growth') || lower.includes('return')) {
        aiResponse = 'Ji bilkul! Chaksu mein 18 se 25% annual growth hai aur Jaipur Metro Phase 2 ka kaam shuru ho gaya hai, jisse prices 40 se 60% aur badhengi!';
      } else if (lower.includes('rera') || lower.includes('legal') || lower.includes('jda')) {
        aiResponse = 'Ji 100% Legal hai sir! Hamara RERA number hai RAJ/P/2026/4660 aur project JDA Approved hai. Poora documentation clear hai.';
      } else {
        aiResponse = 'Ji bahut badhiya sir! Main aapko WhatsApp par turant project ki poori details aur brochure bhej rahi hoon. Kya is weekend aap site visit ke liye aa sakte hain?';
      }
    }

    const cleanReply = aiResponse
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const actionUrl = 'https://suvidha-voice-crm.vercel.app/api/inbound/process-speech';

    // Loop back with GetInput for continuous two-way conversation
    const nextTurnXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetInput action="${actionUrl}" method="POST" inputType="speech" language="en-IN" speechEndTimeout="2" redirect="true">
    <Speak language="en-IN">${cleanReply}</Speak>
  </GetInput>
  <Speak language="en-IN">
    Dhanyawaad sir! Hamne aapki details note kar li hain aur WhatsApp par brochure bhej diya hai.
  </Speak>
</Response>`;

    return new Response(nextTurnXml.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Process speech error:', error);
    return new Response('<Response><Speak language="en-IN">Shree Aangan Developers se baat karne ke liye dhanyawaad.</Speak></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml; charset=utf-8' }
    });
  }
}
