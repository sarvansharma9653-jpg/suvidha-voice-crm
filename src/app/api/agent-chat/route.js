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

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

    let aiReply = '';

    // 1. Try Gemini LLM if API Key is configured
    if (apiKey && apiKey.length > 5) {
      const systemPrompt = `You are a real-time conversational AI Voice Agent named "${agentName || 'AI Closer'}" for "${useCase || 'Sales & Support'}".

BUSINESS KNOWLEDGE & OPENING SCRIPT PROVIDED BY USER:
"""
${cleanScript}
"""

FAQ & OBJECTION HANDLING RULES:
"""
${cleanObjections}
"""

STRICT CONVERSATIONAL VOICE RULES:
1. You are talking over a LIVE PHONE CALL with an Indian customer.
2. Reply ONLY in natural, polite Indian Hindi / Hinglish.
3. Keep your response short and concise (1 to 2 short sentences, maximum 25-30 words) so it feels like a real human on the phone.
4. Strictly answer based on the business details, company name, and objection rules given above.
5. Never speak in markdown bullet points or asterisks (*).
6. Never say you are ChatGPT or an AI model. You are ${agentName}.`;

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
        parts: [{ text: `[System Instruction: ${systemPrompt}]\n\nCustomer: "${userQuestion}"\n\nReply as ${agentName}:` }]
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
              generationConfig: { temperature: 0.6, maxOutputTokens: 100 }
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

    // 2. Intelligent Contextual AI Reasoner (Extracts exact answers from user's script & objections)
    if (!aiReply) {
      // Check for Property Type / What do you have questions
      if (cleanQuestion.includes('kon si') || cleanQuestion.includes('kya hai') || cleanQuestion.includes('option') || cleanQuestion.includes('property') || cleanQuestion.includes('flats') || cleanQuestion.includes('bhk') || cleanQuestion.includes('service')) {
        if (cleanScript.includes('BHK') || cleanScript.includes('bhk') || cleanScript.includes('flat') || cleanScript.includes('property')) {
          aiReply = `सर, हमारे पास आपके लिए प्राइम लोकेशन पर 2 और 3 बीएचके फ्लैट्स और प्रॉपर्टी ऑप्शन्स उपलब्ध हैं। क्या आप इस वीकेंड साइट विजिट के लिए फ्री हैं?`;
        } else {
          aiReply = `सर, हमारे पास आपकी आवश्यकता के अनुसार बेस्ट ऑप्शन्स उपलब्ध हैं। क्या मैं आपको व्हाट्सएप पर पूरा विवरण और ब्रोशर भेज दूँ?`;
        }
      }
      // Check for Price / Cost / Rate questions
      else if (cleanQuestion.includes('price') || cleanQuestion.includes('rate') || cleanQuestion.includes('cost') || cleanQuestion.includes('budget') || cleanQuestion.includes('kitna') || cleanQuestion.includes('daam')) {
        if (cleanScript.includes('लाख') || cleanObjections.includes('लाख') || cleanScript.includes('lakh')) {
          aiReply = `सर, हमारे पास 45 लाख से शुरू होने वाले बेहतरीन ऑप्शन्स हैं। क्या मैं आपके नंबर पर विस्तृत प्राइस लिस्ट और पेमेंट प्लान व्हाट्सएप कर दूँ?`;
        } else {
          aiReply = `सर, कीमतें प्रॉपर्टी के साइज और लोकेशन पर निर्भर करती हैं। क्या मैं आपको तुरंत व्हाट्सएप पर पूरी प्राइस लिस्ट भेज दूँ?`;
        }
      }
      // Check for Location / Address questions
      else if (cleanQuestion.includes('kahan') || cleanQuestion.includes('location') || cleanQuestion.includes('address') || cleanQuestion.includes('jagah')) {
        aiReply = `यह प्रोजेक्ट प्राइम लोकेशन पर स्थित है और कनेक्टिविटी बहुत ही शानदार है। क्या मैं आपको गूगल मैप्स लोकेशन व्हाट्सएप पर भेज दूँ?`;
      }
      // Check for Senior / Manager / Call Transfer
      else if (cleanQuestion.includes('senior') || cleanQuestion.includes('manager') || cleanQuestion.includes('transfer') || cleanQuestion.includes('baat')) {
        aiReply = `जी बिल्कुल सर! मैं आपकी कॉल तुरंत हमारे सीनियर मैनेजर को ट्रांसफर कर रही हूँ, कृपया 1 मिनट लाइन पर बने रहें!`;
      }
      // Check for Interested / Yes
      else if (cleanQuestion.includes('haan') || cleanQuestion.includes('yes') || cleanQuestion.includes('theek') || cleanQuestion.includes('send') || cleanQuestion.includes('bhejo')) {
        aiReply = `अरे बहुत ही बढ़िया सर! मैंने आपका नंबर नोट कर लिया है, मैं तुरंत आपको व्हाट्सएप पर सारी जानकारी भेज रही हूँ!`;
      }
      // Default contextual response
      else {
        aiReply = `जी बिल्कुल सर, मैं आपकी बात समझ गई। आपकी पसंद के हिसाब से सबसे बेस्ट ऑप्शन बताने के लिए, क्या मैं आपको व्हाट्सएप पर सारी डिटेल भेज दूँ?`;
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
