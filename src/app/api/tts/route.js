import { NextResponse } from 'next/server';

const AWS_TTS_SERVER = process.env.AWS_TTS_SERVER || 'http://16.170.166.247:8000/tts';

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
  if (/[\u0900-\u097F]/.test(processed)) return processed;

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
    const { text, gender, voice, engine } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const hindiText = toHindiScript(text, gender);

    // 1. Try AWS Self-Hosted ChatTTS / XTTS Engine if online
    try {
      const awsRes = await fetch(AWS_TTS_SERVER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: hindiText,
          engine: engine || 'chat_tts',
          gender: gender?.toLowerCase() || 'female',
          language: 'hi',
          format: 'wav'
        }),
        signal: AbortSignal.timeout(3000)
      });

      if (awsRes.ok) {
        const audioBuffer = await awsRes.arrayBuffer();
        return new Response(audioBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'audio/wav',
            'Cache-Control': 'public, max-age=86400',
            'X-Source': 'AWS-ChatTTS'
          }
        });
      }
    } catch (awsErr) {
      // Fallback to high-speed Neural stream
    }

    // 2. High-Speed Neural Speech Stream Fallback
    const encodedText = encodeURIComponent(hindiText);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=hi&client=tw-ob`;

    const audioRes = await fetch(ttsUrl, {
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
        'Cache-Control': 'public, max-age=86400',
        'X-Voice-Gender': gender || 'Female'
      }
    });

  } catch (error) {
    console.error('Neural TTS Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
