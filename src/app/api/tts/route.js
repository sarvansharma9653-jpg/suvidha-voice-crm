import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, gender, voice, elevenLabsApiKey } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const apiKey = elevenLabsApiKey || process.env.ELEVENLABS_API_KEY;

    // 1. If ElevenLabs API Key is provided, generate 100% Ultra-Human Real Studio Voice!
    if (apiKey && apiKey.startsWith('sk_') || (apiKey && apiKey.length > 20)) {
      try {
        // High-Quality Indian Multilingual Voice IDs
        // Female (Sweet Indian): 21m00Tcm4TlvDq8ikWAM (Rachel) / EXAVITQu4vr4xnSDxMaL (Bella)
        // Male (Deep Indian): VR6AewLTigWG4ivDxDxE (Adam) / ErXwobaYiN019PkySvjV (Antoni)
        const voiceId = gender?.toLowerCase() === 'male' 
          ? 'VR6AewLTigWG4ivDxDxE' // Deep natural male
          : '21m00Tcm4TlvDq8ikWAM'; // Sweet natural female

        const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
              similarity_boost: 0.8,
              style: 0.2,
              use_speaker_boost: true
            }
          })
        });

        if (elevenRes.ok) {
          const audioBuffer = await elevenRes.arrayBuffer();
          return new Response(audioBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=86400',
              'X-Source': 'ElevenLabs-Human'
            }
          });
        } else {
          console.log('ElevenLabs API returned status:', elevenRes.status);
        }
      } catch (elevenErr) {
        console.error('ElevenLabs fetch error:', elevenErr.message);
      }
    }

    // 2. High-Fidelity Neural Fallback
    const encodedText = encodeURIComponent(text);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=hi&client=tw-ob`;

    const audioRes = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (audioRes.ok) {
      const audioBuffer = await audioRes.arrayBuffer();
      return new Response(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }

    return NextResponse.json({ error: 'TTS Synthesis fallback' }, { status: 200 });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
