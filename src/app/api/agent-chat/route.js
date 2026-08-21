import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { agentName, useCase, script, objections, userQuestion } = await req.json();

    if (!userQuestion || !userQuestion.trim()) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }

    const question = userQuestion.trim();
    const cleanScript = (script || '').trim();
    const cleanObjections = (objections || '').trim();
    const persona = (agentName || 'Pooja').trim();
    const business = (useCase || 'Real Estate').trim();

    let aiReply = '';

    // =========================================================================
    // 1. REAL GOOGLE GEMINI LLM REASONER (AUTHENTIC INDIAN HUMAN SALES CLOSER)
    // =========================================================================
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (geminiKey) {
      const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash'
      ];

      const systemPrompt = `Aap ek bohot hi energetic, polite, aur smart Indian sales consultant (${persona}) hain jo ${business} ke liye kaam karti hain.
Customer ne aapse ek sawal pucha hai. Aapko bilkul ek real Indian sales executive ki tarah 1-2 natural sentences mein Hinglish/Hindi mein jawab dena hai.

IMPORTANT GUIDELINES:
1. Speak naturally like an Indian sales professional — use friendly polite words like "Ji bilkul sir", "Haanji", "Main aapko batati hoon".
2. Keep it crisp (1-2 sentences maximum) so it sounds like a real phone conversation.
3. Answer strictly using the facts from the Script and Objection rules below.
4. End with a polite closing or asking for a Free Weekend Site Visit.

---
PROJECT FACTS:
${cleanScript}

---
OBJECTION & PRICING RULES:
${cleanObjections}
`;

      for (const model of modelsToTry) {
        try {
          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: `${systemPrompt}\n\nCustomer asked: "${question}"\n\nReply in 1-2 natural spoken Hindi sentences as ${persona}:` }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.65,
                maxOutputTokens: 90
              }
            })
          });

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText && rawText.trim().length > 5) {
              aiReply = rawText.replace(/[*_#`"]/g, '').trim();
              break;
            }
          }
        } catch (e) {
          console.log(`Gemini model ${model} note:`, e.message);
        }
      }
    }

    // =========================================================================
    // 2. INTELLIGENT RULE PARSER FALLBACK
    // =========================================================================
    if (!aiReply) {
      const qLower = question.toLowerCase();

      if (qLower.includes('location') || qLower.includes('kahan') || qLower.includes('address') || qLower.includes('jagah') || qLower.includes('city')) {
        aiReply = 'जी बिल्कुल sir! हमारा 85 Acres का प्रोजेक्ट Chaksu, Tonk Road पर NH-12 Highway पर Sheetla Mata Mandir के पास है। क्या मैं आपको WhatsApp पर लाइव लोकेशन भेज दूँ?';
      } else if (qLower.includes('price') || qLower.includes('rate') || qLower.includes('cost') || qLower.includes('kitne') || qLower.includes('paisa') || qLower.includes('daam')) {
        aiReply = 'जी, हमारे JDA Approved Plots ₹800 से ₹2,750 प्रति वर्ग फुट के बीच उपलब्ध हैं — आसान EMI सुविधा के साथ। Complete Price List अभी आपके WhatsApp पर आ रही है!';
      } else if (qLower.includes('metro') || qLower.includes('growth') || qLower.includes('return') || qLower.includes('badhega')) {
        aiReply = 'जी बिल्कुल! Chaksu में हर साल 18 से 25% ग्रोथ है और Jaipur Metro Phase 2 का काम शुरू हो चुका है, जिससे कीमतें 40 से 60% और बढ़ेंगी!';
      } else if (qLower.includes('rera') || qLower.includes('legal') || qLower.includes('jda')) {
        aiReply = 'जी 100% Legal है sir! हमारा RERA नंबर है RAJ/P/2026/4660 और प्रोजेक्ट JDA Approved है। पूरा डॉक्यूमेंटेशन बिल्कुल क्लियर है।';
      } else if (qLower.includes('senior') || qLower.includes('manager') || qLower.includes('transfer') || qLower.includes('baat')) {
        aiReply = 'जी बिल्कुल sir! मैं आपकी कॉल तुरंत हमारे सीनियर मैनेजर (+918739904737) को ट्रांसफर कर रही हूँ। कृपया लाइन पर बने रहें!';
      } else {
        aiReply = 'जी बिल्कुल sir! Chaksu, Tonk Road पर हमारे 85 Acres JDA & RERA Approved Township के लिए क्या आप इस वीकेंड Free Site Visit के लिए आ सकते हैं?';
      }
    }

    aiReply = aiReply.replace(/[*_#`"]/g, '').trim();

    return NextResponse.json({
      success: true,
      reply: aiReply,
      agentName: persona
    });

  } catch (error) {
    console.error('Agent LLM Chat Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
