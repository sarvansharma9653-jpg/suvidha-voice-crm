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
    // 1. REAL GOOGLE GEMINI LLM CALL (HUMAN BRAIN CONVERSATIONAL REASONER)
    // =========================================================================
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (geminiKey) {
      const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash',
        'gemini-flash'
      ];

      const systemPrompt = `You are ${persona}, a top-performing, energetic, polite, and highly persuasive Indian human sales consultant working for ${business}.

CRITICAL INSTRUCTIONS:
1. Speak in natural, energetic, conversational Hindi / Hinglish (1 to 2 crisp sentences only).
2. Answer the customer's question directly, accurately, and confidently using the provided Script and Objection Handling Rules below.
3. NEVER make up fake details, store names, or placeholder words like 'kahan'.
4. If customer asks about price, location, metro, RERA, investment return, or company details, use the exact facts from the rules.
5. End with a warm, energetic call-to-action (e.g. asking for site visit or offering WhatsApp details).

---
BUSINESS SCRIPT:
${cleanScript}

---
OBJECTION & FAQ RULES:
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
                    { text: `${systemPrompt}\n\nCustomer says: "${question}"\n\nRespond as ${persona} in natural spoken Hindi:` }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 120
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
    // 2. INTELLIGENT RULE PARSER FALLBACK (IF LLM OFFLINE)
    // =========================================================================
    if (!aiReply) {
      const qLower = question.toLowerCase();

      // Check rule lines inside objections directly
      const ruleLines = cleanObjections.split('\n').map(l => l.trim()).filter(Boolean);

      // Match Location
      if (qLower.includes('location') || qLower.includes('kahan') || qLower.includes('address') || qLower.includes('jagah') || qLower.includes('city')) {
        const locRule = ruleLines.find(l => /location|kahan|जगह|कहाँ/i.test(l) && !l.startsWith('अगर'));
        if (locRule) {
          aiReply = locRule.replace(/^[-d.s*]+/, '').trim();
        } else {
          aiReply = 'जी, प्रोजेक्ट Chaksu, Tonk Road पर है — Jaipur से सिर्फ 25-30 km की दूरी पर NH-12 Jaipur-Kota Highway पर, Sheetla Mata Mandir के पास। क्या मैं आपको WhatsApp पर मैप भेज दूँ?';
        }
      }
      // Match Price
      else if (qLower.includes('price') || qLower.includes('rate') || qLower.includes('cost') || qLower.includes('kitne') || qLower.includes('paisa') || qLower.includes('daam') || qLower.includes('budget')) {
        const priceRule = ruleLines.find(l => /price|rate|रुपये|plots|sq.ft|लाख/i.test(l) && !l.startsWith('अगर'));
        if (priceRule) {
          aiReply = priceRule.replace(/^[-d.s*]+/, '').trim();
        } else {
          aiReply = 'जी, हमारे JDA Approved Plots ₹800 से ₹2,750 प्रति वर्ग फुट के बीच उपलब्ध हैं — EMI सुविधा के साथ। Complete Price List अभी आपके WhatsApp पर भेज रही हूँ!';
        }
      }
      // Match Metro / Growth / Return
      else if (qLower.includes('metro') || qLower.includes('growth') || qLower.includes('return') || qLower.includes('badhega') || qLower.includes('faayda')) {
        aiReply = 'जी बिल्कुल! Chaksu में 18 से 25% annual growth है और Jaipur Metro Phase 2 की नींव July 2026 में रखी गई है, जिससे कीमतें 40 से 60% और बढ़ेंगी!';
      }
      // Match RERA / Legal / Documents
      else if (qLower.includes('rera') || qLower.includes('legal') || qLower.includes('jda') || qLower.includes('government') || qLower.includes('document')) {
        aiReply = 'जी बिल्कुल 100% Legal है! हमारा RERA नंबर है RAJ/P/2026/4660 और प्रोजेक्ट JDA Approved है। पूरा Documentation बिल्कुल Clear है।';
      }
      // Match Who Are You
      else if (qLower.includes('kon ho') || qLower.includes('koun ho') || qLower.includes('kaun ho') || qLower.includes('naam') || qLower.includes('who are you')) {
        aiReply = `नमस्कार जी! मैं ${persona} बोल रही हूँ, The Shree Aangan Developers की तरफ से। Chaksu Tonk Road 85 Acres Township प्रोजेक्ट के सिलसिले में बात कर रही हूँ।`;
      }
      // Match Call Transfer / Senior Manager
      else if (qLower.includes('senior') || qLower.includes('manager') || qLower.includes('admin') || qLower.includes('transfer') || qLower.includes('baat karao')) {
        aiReply = 'जी बिल्कुल सर! मैं आपकी कॉल तुरंत हमारे सीनियर मैनेजर (+918739904737) को ट्रांसफर कर रही हूँ। कृपया लाइन पर बने रहें!';
      }
      // Default Intelligent Response
      else {
        aiReply = `जी बिल्कुल सर! Chaksu, Tonk Road पर हमारे 85 Acres JDA & RERA Approved Township के लिए क्या आप इस वीकेंड Free Site Visit के लिए आ सकते हैं?`;
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
