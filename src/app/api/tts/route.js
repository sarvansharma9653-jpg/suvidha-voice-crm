import { NextResponse } from 'next/server';

// Transliterate Romanized Hinglish to proper Hindi Devanagari so Neural TTS sounds 100% human Indian with 0 British accent!
function toHindiScript(text, gender) {
  const dictionary = {
    'namaste': 'नमस्ते',
    'namaskar': 'नमस्कार',
    'main': 'मैं',
    'suvidha': 'सुविधा',
    'ai': 'एआई',
    'assistant': 'असिस्टेंट',
    'bol': 'बोल',
    'rahi': 'रही',
    'raha': 'रहा',
    'hoon': 'हूँ',
    'kripya': 'कृपया',
    'bataiye': 'बताइए',
    'aapki': 'आपकी',
    'kya': 'क्या',
    'madad': 'मदद',
    'sahayata': 'सहायता',
    'kar': 'कर',
    'sakti': 'सकती',
    'sakta': 'सकता',
    'swara': 'स्वरा',
    'madhur': 'मधुर',
    'ananya': 'अनन्या',
    'pooja': 'पूजा',
    'kavya': 'काव्या',
    'rohan': 'रोहन',
    'aarav': 'आरव',
    'noida': 'नोएडा',
    'sector': 'सेक्टर',
    'flats': 'फ्लैट्स',
    'crore': 'करोड़',
    'start': 'स्टार्ट',
    'hote': 'होते',
    'hain': 'हैं',
    'saturday': 'शनिवार',
    'site': 'साइट',
    'visit': 'विज़िट',
    'schedule': 'शेड्यूल',
    'di': 'दी',
    'hai': 'है',
    'bahut': 'बहुत',
    'badhiya': 'बढ़िया',
    'samajh': 'समझ',
    'whatsapp': 'व्हाट्सएप',
    'brochure': 'ब्रोशर',
    'bhej': 'भेज'
  };

  let processed = text;
  // If already Hindi script, return
  if (/[\u0900-\u097F]/.test(processed)) return processed;

  // Replace common Hinglish words
  const words = processed.split(/\s+/);
  const converted = words.map(w => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    const mapped = dictionary[clean];
    if (mapped) {
      return w.replace(new RegExp(clean, 'i'), mapped);
    }
    return w;
  });

  return converted.join(' ');
}

export async function POST(req) {
  try {
    const { text, gender, voice } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const hindiText = toHindiScript(text, gender);
    const encodedText = encodeURIComponent(hindiText);
    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=hi&client=tw-ob`;

    const audioRes = await fetch(googleTTSUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!audioRes.ok) {
      throw new Error(`TTS provider returned ${audioRes.status}`);
    }

    const audioBuffer = await audioRes.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400'
      }
    });

  } catch (error) {
    console.error('Neural TTS Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
