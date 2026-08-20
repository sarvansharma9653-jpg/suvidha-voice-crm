import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { agentName, useCase, script, objections, userQuestion, history } = await req.json();

    if (!userQuestion) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

    const systemPrompt = `You are a real-time conversational AI Voice Agent named "${agentName || 'AI Closer'}" for "${useCase || 'Sales & Support'}".

BUSINESS KNOWLEDGE & OPENING SCRIPT PROVIDED BY USER:
"""
${script || 'नमस्ते! मैं सुविधा एआई से बात कर रही हूँ। हमारे पास आपके लिए बेस्ट बिजनेस ऑफर्स हैं।'}
"""

FAQ & OBJECTION HANDLING RULES:
"""
${objections || 'अगर कस्टमर सवाल पूछे तो विनम्रता से सटीक जानकारी दें और व्हाट्सएप पर ब्रोशर भेजने का ऑफर दें।'}
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
      parts: [{ 
        text: `[System Instruction: ${systemPrompt}]\n\nCustomer: "${userQuestion}"\n\nReply as ${agentName}:` 
      }]
    });

    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
    let aiReply = '';

    if (apiKey) {
      for (const modelName of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: conversationContents,
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 120
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (aiReply) break;
          }
        } catch (err) {
          console.warn(`Model ${modelName} error:`, err.message);
        }
      }
    }

    if (!aiReply) {
      // Intelligent fallback using user-defined details
      const isPrice = userQuestion.toLowerCase().includes('price') || userQuestion.toLowerCase().includes('rate');
      if (isPrice && objections) {
        aiReply = `सर, कीमत और ऑफर की पूरी लिस्ट के लिए क्या मैं आपको व्हाट्सएप पर ब्रोशर भेज दूँ?`;
      } else {
        aiReply = `जी बिल्कुल, ${script ? script.substring(0, 45) + '...' : 'हमारे पास आपके लिए बेस्ट ऑप्शन उपलब्ध हैं।'} क्या आप इसके बारे में और जानकारी चाहते हैं?`;
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
