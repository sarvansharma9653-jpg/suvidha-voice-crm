import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, gender, voice, elevenLabsApiKey } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const apiKey = elevenLabsApiKey || process.env.ELEVENLABS_API_KEY || 'sk_fd1cace7cf05a5e700ce78a557f61815046a23576e8cb477';

    // 1. ElevenLabs Multilingual v2 Ultra-Human Real Studio Voice
    if (apiKey && apiKey.length > 20) {
      try {
        let voiceId = 'JBFqnCBsd6RMkjVDRZzb'; // Male (George / Adam)
        if (gender?.toLowerCase() === 'female' || voice === 'swara' || voice === 'ananya' || voice === 'pooja' || voice === 'kavya') {
          voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Female (Sarah / Rachel)
        }

        const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8
            }
          })
        });

        if (elevenRes.ok) {
          const audioBuffer = await elevenRes.arrayBuffer();
          const base64Audio = Buffer.from(audioBuffer).toString('base64');
          
          return NextResponse.json({
            success: true,
            audioBase64: `data:audio/mp3;base64,${base64Audio}`,
            source: 'ElevenLabs-Multilingual-v2',
            voice: voiceId
          });
        } else {
          console.log('ElevenLabs status:', elevenRes.status, await elevenRes.text());
        }
      } catch (elevenErr) {
        console.error('ElevenLabs fetch error:', elevenErr.message);
      }
    }

    // 2. High-Speed Fallback
    const encodedText = encodeURIComponent(text);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=hi&client=tw-ob`;

    const audioRes = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (audioRes.ok) {
      const audioBuffer = await audioRes.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      return NextResponse.json({
        success: true,
        audioBase64: `data:audio/mp3;base64,${base64Audio}`,
        source: 'Neural-Fallback'
      });
    }

    return NextResponse.json({ error: 'TTS fallback failed' }, { status: 500 });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
