import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, gender, voice, elevenLabsApiKey } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const apiKey = elevenLabsApiKey || process.env.ELEVENLABS_API_KEY;

    // 1. Official ElevenLabs Multilingual v2 Engine (100% Real Human Voice!)
    if (apiKey && apiKey.length > 15) {
      try {
        // High-Quality Voice IDs:
        // Male: 'VR6AewLTigWG4ivDxDxE' (Adam) / 'JBFqnCBsd6RMkjVDRZzb' (George)
        // Female: '21m00Tcm4TlvDq8ikWAM' (Rachel) / 'EXAVITQu4vr4xnSDxMaL' (Bella)
        const voiceId = gender?.toLowerCase() === 'male' 
          ? 'VR6AewLTigWG4ivDxDxE'
          : '21m00Tcm4TlvDq8ikWAM';

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
              similarity_boost: 0.8,
              style: 0.25,
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
              'X-Source': 'ElevenLabs-Official'
            }
          });
        } else {
          const errText = await elevenRes.text();
          console.log('ElevenLabs API response:', elevenRes.status, errText);
        }
      } catch (elevenErr) {
        console.error('ElevenLabs fetch error:', elevenErr.message);
      }
    }

    // 2. High-Fidelity Fallback
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

    return NextResponse.json({ error: 'TTS synthesis fallback' }, { status: 200 });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
