import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, gender, voice, elevenLabsApiKey } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    // Default to the provided working user ElevenLabs API key
    const apiKey = elevenLabsApiKey || process.env.ELEVENLABS_API_KEY || 'sk_fd1cace7cf05a5e700ce78a557f61815046a23576e8cb477';

    // 1. ElevenLabs Multilingual v2 Real Human Voice Engine
    if (apiKey && apiKey.length > 20) {
      try {
        // Pre-made Free-Tier Supported Voice IDs:
        // Male: 'JBFqnCBsd6RMkjVDRZzb' (George - Deep Human Male)
        // Female: 'EXAVITQu4vr4xnSDxMaL' (Sarah - Sweet Human Female)
        let voiceId = 'JBFqnCBsd6RMkjVDRZzb'; // Male default
        if (gender?.toLowerCase() === 'female' || voice === 'swara' || voice === 'ananya' || voice === 'pooja' || voice === 'kavya') {
          voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Female
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
          return new Response(audioBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=86400',
              'X-Source': 'ElevenLabs-Official'
            }
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
      return new Response(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }

    return NextResponse.json({ error: 'TTS fallback' }, { status: 200 });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
