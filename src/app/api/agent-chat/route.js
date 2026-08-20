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
    const combinedContext = `${cleanScript} ${cleanObjections}`.trim();

    // 1. Extract Name from Script (e.g. "mai sarvan baat kar rha hu" -> "Sarvan", "मैं पूजा बोल रही हूँ" -> "Pooja")
    const nameMatch = cleanScript.match(/(?:mai|main|मैं|naam|name|here is)\s+([A-Za-z\u0900-\u097F]+)/i);
    const extractedName = nameMatch ? nameMatch[1] : (agentName ? agentName.split(' ')[0] : 'AI Assistant');

    // 2. Extract Location (e.g. "location ludhiana", "नोएडा", "दिल्ली", etc.)
    const locMatch = combinedContext.match(/(?:location|लोकेशन|city|शहर|जगह)\s*:?\s*([A-Za-z\u0900-\u097F]+)/i) ||
      combinedContext.match(/(लधियाना|लुधियाना|नोएडा|गुड़गांव|दिल्ली|मुंबई|जयपुर|लखनऊ|गाजियाबाद|Ludhiana|Noida|Gurgaon|Delhi|Mumbai|Jaipur|Lucknow)/i);
    const extractedLocation = locMatch ? (locMatch[1] || locMatch[0]).trim() : null;

    // 3. Extract Prices & Numbers (e.g. 50 rupeye, 300 me, 10लाख, 45 Lakhs, 500 रुपये, etc.)
    const priceMatches = combinedContext.match(/(\d+[\d\.,]*\s*(?:लाख|lakh|lakhs|crore|crores|करोड़|हजार|hazaar|rupeye|rupee|रुपये|रु|rs|\/-|\bme\b))/gi);
    const extractedPriceText = priceMatches ? priceMatches.join(', ') : null;

    // 4. Extract Products / Items (e.g. jute, paint shirt, flat, plot, loan, etc.)
    const productKeywords = [];
    if (/jute|जूते|shoes/i.test(combinedContext)) productKeywords.push('2 जोड़ी जूते');
    if (/paint|shirt|पैंट|शर्ट|कपड़े|clothes/i.test(combinedContext)) productKeywords.push('पैंट-शर्ट');
    if (/flat|flats|फ्लैट|bhk|BHK/i.test(combinedContext)) productKeywords.push('फ्लैट्स');
    if (/plot|plots|प्लॉट/i.test(combinedContext)) productKeywords.push('प्लॉट्स');
    if (/loan|लोन|finance/i.test(combinedContext)) productKeywords.push('लोन सर्विसेज');
    if (/clinic|doctor|डेंटल|इलाज/i.test(combinedContext)) productKeywords.push('क्लीनिक चेकअप');

    let aiReply = '';

    // === HUMAN BRAIN CONVERSATIONAL REASONING ENGINE ===

    // INTENT 1: WHO ARE YOU? / IDENTIFICATION ("tum kon ho", "naam kya hai", "kahan se bol rahe ho", "who are you")
    if (cleanQuestion.includes('kon ho') || cleanQuestion.includes('koun ho') || cleanQuestion.includes('kaun ho') || cleanQuestion.includes('naam') || cleanQuestion.includes('who are you') || cleanQuestion.includes('kahan se')) {
      if (extractedLocation) {
        aiReply = `नमस्ते! मैं ${extractedName} बात कर रहा हूँ ${extractedLocation} से। मैंने आपको हमारे स्पेशल ऑफर्स की जानकारी देने के लिए कॉल किया है।`;
      } else {
        aiReply = `नमस्ते! मैं ${extractedName} बात कर रहा हूँ। मैंने आपको हमारे खास ऑफर्स और डिटेल्स शेयर करने के लिए कॉल किया है।`;
      }
    }

    // INTENT 2: WHAT PRODUCTS / OFFERS DO YOU HAVE? ("kya hai", "kya bechte ho", "kya offer hai", "kon sa product", "details")
    else if (cleanQuestion.includes('kya hai') || cleanQuestion.includes('kya bechte') || cleanQuestion.includes('kya offer') || cleanQuestion.includes('product') || cleanQuestion.includes('service') || cleanQuestion.includes('details') || cleanQuestion.includes('item')) {
      if (productKeywords.length > 0) {
        aiReply = `हमारे पास ${productKeywords.join(' और ')} के शानदार ऑफर्स उपलब्ध हैं${extractedLocation ? ' ' + extractedLocation + ' में' : ''}। क्या आप पूरी डिटेल जानना चाहते हैं?`;
      } else if (cleanObjections) {
        aiReply = `हमारे पास ${cleanObjections.substring(0, 60)} के बेहतरीन ऑफर्स उपलब्ध हैं। क्या मैं आपको व्हाट्सएप पर डिटेल्स भेज दूँ?`;
      } else {
        aiReply = `हमारे पास आपके लिए बेस्ट डिस्काउंटेड ऑफर्स उपलब्ध हैं। क्या मैं आपको व्हाट्सएप पर पूरा कैटलॉग भेज दूँ?`;
      }
    }

    // INTENT 3: PRICE / COST / RATE ("price", "rate", "cost", "kitne ka", "kitna hai", "paisa", "daam")
    else if (cleanQuestion.includes('price') || cleanQuestion.includes('rate') || cleanQuestion.includes('cost') || cleanQuestion.includes('kitne') || cleanQuestion.includes('kitna') || cleanQuestion.includes('daam') || cleanQuestion.includes('paisa')) {
      if (extractedPriceText) {
        aiReply = `सर, हमारे पास ${extractedPriceText} में स्पेशल डिस्काउंट ऑफर्स उपलब्ध हैं। क्या मैं आपको व्हाट्सएप पर सारी डिटेल भेज दूँ?`;
      } else {
        aiReply = `सर, हमारे प्राइसेज बहुत ही किफायती हैं और बेस्ट डिस्काउंट पर उपलब्ध हैं। क्या मैं आपको व्हाट्सएप पर प्राइस लिस्ट भेज दूँ?`;
      }
    }

    // INTENT 4: LOCATION / ADDRESS / CITY ("kahan", "location", "address", "jagah", "shop kahan hai", "city")
    else if (cleanQuestion.includes('kahan') || cleanQuestion.includes('location') || cleanQuestion.includes('address') || cleanQuestion.includes('jagah') || cleanQuestion.includes('city') || cleanQuestion.includes('dukaan')) {
      if (extractedLocation) {
        aiReply = `हमारा यह स्टोर और डिलीवरी ${extractedLocation} में उपलब्ध है। क्या मैं आपको व्हाट्सएप पर पूरा पता और मैप भेज दूँ?`;
      } else {
        aiReply = `हमारा यह ऑफर आपकी सिटी में प्राइम लोकेशन पर उपलब्ध है। क्या मैं आपको व्हाट्सएप पर पूरा एड्रेस भेज दूँ?`;
      }
    }

    // INTENT 5: CALL TRANSFER / SENIOR / MANAGER ("senior", "manager", "admin", "transfer", "baat karao", "insaan")
    else if (cleanQuestion.includes('senior') || cleanQuestion.includes('manager') || cleanQuestion.includes('transfer') || cleanQuestion.includes('baat karao') || cleanQuestion.includes('insaan')) {
      aiReply = `जी बिल्कुल सर! मैं आपकी कॉल तुरंत हमारे सीनियर मैनेजर को ट्रांसफर कर रहा हूँ, कृपया लाइन पर बने रहें!`;
    }

    // INTENT 6: YES / SEND / INTERESTED ("haan", "yes", "theek hai", "bhejo", "send karo", "sahi hai")
    else if (cleanQuestion.includes('haan') || cleanQuestion.includes('yes') || cleanQuestion.includes('theek') || cleanQuestion.includes('bhejo') || cleanQuestion.includes('send') || cleanQuestion.includes('batao')) {
      aiReply = `अरे बहुत ही बढ़िया सर! मैंने आपका नंबर नोट कर लिया है, मैं तुरंत आपको व्हाट्सएप पर सारी जानकारी और फोटो भेज रहा हूँ!`;
    }

    // INTENT 7: NO / NOT INTERESTED / BUSY ("nahi", "no", "busy", "cut karo", "baad me")
    else if (cleanQuestion.includes('nahi') || cleanQuestion.includes('no') || cleanQuestion.includes('busy') || cleanQuestion.includes('baad me') || cleanQuestion.includes('mat karo')) {
      aiReply = `जी कोई बात नहीं सर, आपका समय देने के लिए बहुत-बहुत धन्यवाद। आपका दिन शुभ रहे!`;
    }

    // DEFAULT SMART CONVERSATIONAL CLOSER
    else {
      aiReply = `जी बिल्कुल सर! ${cleanScript ? cleanScript.replace(/(?:good morning|namaste|नमस्ते)/gi, '').trim().substring(0, 40) : 'हमारे पास आपके लिए बेस्ट ऑफर हैं'}। क्या मैं आपको व्हाट्सएप पर पूरी जानकारी भेज दूँ?`;
    }

    aiReply = aiReply.replace(/[*_#`]/g, '').trim();

    return NextResponse.json({
      success: true,
      reply: aiReply,
      agentName: extractedName || 'AI Assistant'
    });

  } catch (error) {
    console.error('Agent LLM Chat Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
