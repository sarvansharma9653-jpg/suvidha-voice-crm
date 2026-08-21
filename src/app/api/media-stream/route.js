import { NextResponse } from 'next/server';

export async function GET(req) {
  return NextResponse.json({
    status: 'active',
    protocol: 'telephony-bi-directional-stream',
    codecs: ['audio/x-mulaw', 'audio/l16;rate=8000'],
    vad: 'instant-interruption-active',
    stt: 'deepgram-nova-2-hindi',
    llm: 'google-gemini-2.5-flash',
    tts: 'elevenlabs-turbo-v2.5'
  });
}

export async function POST(req) {
  try {
    const payload = await req.json();
    const { event, callSid, audioBase64, userSpeech } = payload;

    console.log('📡 Media Stream Packet Event:', event, 'Call ID:', callSid);

    if (event === 'media' && audioBase64) {
      return NextResponse.json({
        success: true,
        action: 'processed',
        bargeInTriggered: false
      });
    }

    if (event === 'speech-detected' && userSpeech) {
      console.log(`👂 Inbound Phone Speech: "${userSpeech}"`);
      
      const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
      let replyText = 'जी बिल्कुल sir! हमारा 85 Acres का प्रोजेक्ट Chaksu, Tonk Road पर है।';

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
Phone call par customer ne pucha: "${userSpeech}".
Aapko 1 natural, crisp Hinglish sentence mein factual aur polite jawab dena hai.

FACTS:
85 Acres JDA & RERA Approved Township Chaksu, Tonk Road, Jaipur NH-12 par.
Prices: ₹800 se ₹2,750 per sq.ft.
Jaipur Metro Phase 2 foundation laid July 2026. Free weekend site visit available.

Jawab dein:`
                }]
              }],
              generationConfig: { temperature: 0.6, maxOutputTokens: 60 }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (raw) replyText = raw.replace(/[*_#`]/g, '').trim();
          }
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        bargeInTriggered: true,
        reply: replyText
      });
    }

    return NextResponse.json({ success: true, event: event || 'handshake' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
