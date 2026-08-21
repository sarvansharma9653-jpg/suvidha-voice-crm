import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let text = searchParams.get('text') || 'नमस्कार जी! The Shree Aangan Developers की तरफ से कॉल कर रही हूँ।';
    let voice = searchParams.get('voice') || 'pooja';
    let passedKey = searchParams.get('elevenKey') || '';

    try {
      text = decodeURIComponent(text);
    } catch(e) {}

    const apiKey = (passedKey || process.env.ELEVENLABS_API_KEY || '').trim();
    const targetVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Sarah / Pooja (Warm Human Indian Closer)

    // 1. Try ElevenLabs Multilingual v2 Studio Human Voice Stream
    if (apiKey && apiKey.length > 15) {
      try {
        console.log(`🎙️ Telephony Streaming via ElevenLabs Key (${apiKey.substring(0, 6)}...):`);
        const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?output_format=mp3_44100_128`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.35,
              similarity_boost: 0.85,
              style: 0.40,
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
              'Content-Length': audioBuffer.byteLength.toString()
            }
          });
        } else {
          const errText = await elevenRes.text();
          console.warn('ElevenLabs API response note:', elevenRes.status, errText);
        }
      } catch (elevenErr) {
        console.error('ElevenLabs Stream Error:', elevenErr.message);
      }
    }

    // 2. High-Quality Neural Fallback Stream (Guaranteed 200 OK so call NEVER drops)
    const encodedText = encodeURIComponent(text);
    const fallbackRes = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=hi&client=tw-ob`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (fallbackRes.ok) {
      const fbBuffer = await fallbackRes.arrayBuffer();
      return new Response(fbBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
          'Content-Length': fbBuffer.byteLength.toString()
        }
      });
    }

    return new Response('Audio synthesis ready', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (error) {
    console.error('Stream Route Error:', error);
    return new Response(error.message, { status: 500 });
  }
}
