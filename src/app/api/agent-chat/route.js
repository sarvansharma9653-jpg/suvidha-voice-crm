import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { agentName, useCase, script, objections, userQuestion, history } = await req.json();

    if (!userQuestion) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }

    const cleanQuestion = userQuestion.trim().toLowerCase();
    const cleanScript = (script || '').trim();
    const cleanObjections = (objections || '').trim();
    const combinedContext = `${cleanScript} ${cleanObjections}`;

    // Extract dynamic price from user's custom input (e.g. 10लाख, 25 Lakhs, 1 Crore, etc.)
    const priceMatch = combinedContext.match(/(\d+[\d\.,]*\s*(?:लाख|lakh|lakhs|crore|crores|करोड़|हजार|hazaar|k|cr|rs|\/-))/i);
    const extractedPrice = priceMatch ? priceMatch[0] : null;

    // Extract dynamic location if mentioned (e.g. Noida, Gurgaon, Sector 62, Delhi, etc.)
    const locationMatch = combinedContext.match(/(?:में|in|at|near|पास)\s+([A-Za-z\u0900-\u097F\s0-9]{3,25})/i);
    const extractedLocation = locationMatch ? locationMatch[1].trim() : null;

    // Extract property / offer type (e.g. 2 BHK, Flat, Plot, Villa, Loan, etc.)
    const offerMatch = combinedContext.match(/(\d+\s*(?:bhk|BHK)|flat|flats|plot|plots|villa|villas|apartment|apartments|commercial|loan|सेवा)/i);
    const extractedOffer = offerMatch ? offerMatch[0] : 'प्रॉपर्टी व सर्विसेज';

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

    let aiReply = '';

    // 1. Prioritize Google Gemini LLM
    if (apiKey && apiKey.length > 5) {
      const systemPrompt = `You are a real-time conversational AI Voice Agent named "${agentName || 'AI Closer'}" for "${useCase || 'Sales'}".

STRICT BUSINESS CONTEXT & SCRIPT FROM USER:
"""
${cleanScript}
"""

STRICT FAQ & OBJECTION RULES FROM USER:
"""
${cleanObjections}
"""

CRITICAL INSTRUCTIONS:
1. ONLY answer using the exact prices, numbers, locations, and details provided in the script and objection rules above.
2. If the user mentioned a specific price (e.g. 10लाख), you MUST state that exact price.
3. Reply in short, conversational Indian Hindi / Hinglish (1-2 sentences, max 25 words).
4. Never make up facts not present in the user text. Never say you are an AI.`;

      const conversationContents = [];
      if (history && Array.isArray(history)) {
        history.forEach(h => {
          conversationContents.push({
            role: h.speaker === 'You' || h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text || h.content }]
          });
        });
      }

      conversationContents.push({
        role: 'user',
        parts: [{ text: `[System Context: ${systemPrompt}]\n\nCustomer asks: "${userQuestion}"\n\nReply as ${agentName} strictly using the details given:` }]
      });

      const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
      for (const modelName of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: conversationContents,
              generationConfig: { temperature: 0.3, maxOutputTokens: 80 }
            })
          });

          if (response.ok) {
            const data = await response.json();
            aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (aiReply) break;
          }
        } catch (err) {
          console.warn(`Model ${modelName} note:`, err.message);
        }
      }
    }

    // 2. Intelligent Dynamic Matcher (Strictly uses user's own numbers, prices & text)
    if (!aiReply) {
      // PRICE QUESTIONS
      if (cleanQuestion.includes('price') || cleanQuestion.includes('rate') || cleanQuestion.includes('cost') || cleanQuestion.includes('budget') || cleanQuestion.includes('kitna') || cleanQuestion.includes('daam')) {
        if (extractedPrice) {
          aiReply = `सर, हमारे पास ${extractedPrice} से शुरू होने वाले बेहतरीन ऑप्शन्स उपलब्ध हैं। क्या मैं आपको व्हाट्सएप पर पूरा प्राइस चार्ट और ब्रोशर भेज दूँ?`;
        } else {
          aiReply = `सर, कीमतें आपके चुने हुए विकल्प और साइज पर निर्भर करती हैं। क्या मैं आपको विस्तृत प्राइस लिस्ट व्हाट्सएप पर भेज दूँ?`;
        }
      }
      // PROPERTY TYPE / WHAT DO YOU HAVE
      else if (cleanQuestion.includes('kon si') || cleanQuestion.includes('kya hai') || cleanQuestion.includes('option') || cleanQuestion.includes('property') || cleanQuestion.includes('flats') || cleanQuestion.includes('bhk') || cleanQuestion.includes('service')) {
        if (extractedOffer) {
          aiReply = `सर, हमारे पास आपकी पसंद के अनुसार ${extractedOffer} के बेहतरीन ऑप्शन्स उपलब्ध हैं। क्या मैं आपको व्हाट्सएप पर पूरी डिटेल्स भेज दूँ?`;
        } else {
          aiReply = `सर, हमारे पास आपकी जरूरत के हिसाब से बेस्ट ऑप्शन्स उपलब्ध हैं। क्या मैं आपको व्हाट्सएप पर सारी जानकारी भेज दूँ?`;
        }
      }
      // LOCATION / WHERE QUESTIONS
      else if (cleanQuestion.includes('kahan') || cleanQuestion.includes('location') || cleanQuestion.includes('address') || cleanQuestion.includes('jagah')) {
        if (extractedLocation) {
          aiReply = `सर, यह प्रोजेक्ट ${extractedLocation} में प्राइम लोकेशन पर स्थित है। क्या मैं आपको लोकेशन का मैप व्हाट्सएप पर शेयर कर दूँ?`;
        } else {
          aiReply = `सर, यह प्रोजेक्ट बहुत ही प्राइम लोकेशन पर स्थित है। क्या मैं आपको गूगल मैप्स लोकेशन व्हाट्सएप पर भेज दूँ?`;
        }
      }
      // CALL TRANSFER / SENIOR / MANAGER
      else if (cleanQuestion.includes('senior') || cleanQuestion.includes('manager') || cleanQuestion.includes('transfer') || cleanQuestion.includes('baat')) {
        aiReply = `जी बिल्कुल सर! मैं आपकी कॉल तुरंत हमारे सीनियर मैनेजर को ट्रांसफर कर रही हूँ, कृपया लाइन पर बने रहें!`;
      }
      // YES / INTERESTED
      else if (cleanQuestion.includes('haan') || cleanQuestion.includes('yes') || cleanQuestion.includes('theek') || cleanQuestion.includes('send') || cleanQuestion.includes('bhejo')) {
        aiReply = `अरे बहुत ही बढ़िया सर! मैंने आपका नंबर नोट कर लिया है, मैं तुरंत आपको व्हाट्सएप पर सारी जानकारी और ब्रोशर भेज रही हूँ!`;
      }
      // DEFAULT DIRECT CUSTOM ANSWER
      else {
        aiReply = `जी बिल्कुल सर! आपकी आवश्यकता के अनुसार सबसे सही जानकारी देने के लिए, क्या मैं आपको व्हाट्सएप पर पूरा ब्रोशर भेज दूँ?`;
      }
    }

    aiReply = aiReply.replace(/[*_#`]/g, '').trim();

    return NextResponse.json({
      success: true,
      reply: aiReply,
      agentName: agentName || 'AI Assistant'
    });

  } catch (error) {
    console.error('Agent LLM Chat Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
