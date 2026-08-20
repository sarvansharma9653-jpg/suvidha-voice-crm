import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, gender, voice, elevenLabsApiKey } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const apiKey = (elevenLabsApiKey || process.env.ELEVENLABS_API_KEY || 'sk_fd1cace7cf05a5e700ce78a557f61815046a23576e8cb477').trim();

    // Map each Voice Model to high-quality ElevenLabs Voice IDs
    const voiceMap = {
      pooja: 'EXAVITQu4vr4xnSDxMaL',    // Sarah / Warm Indian Closer
      aarav: 'JBFqnCBsd6RMkjVDRZzb',    // George / Energetic Finance Specialist
      swara: '21m00Tcm4TlvDq8ikWAM',    // Rachel / Premium Consultant
      madhur: 'VR6AewLTigWG4xSOukaG',   // Josh / Corporate B2B
      ananya: 'AZnzlk1XvdvUeBnXmlld',   // Domi / Modern Hinglish
      rohan: 'pNInz6obpgDQGcFmaJgB',    // Adam / Deep Bass Executive
      kavya: 'LcfcDJNUP1GQjkzn1xUU'     // Emily / Retail & Deals
    };

    let targetVoiceId = voiceMap[voice?.toLowerCase()] || (gender?.toLowerCase() === 'male' ? 'JBFqnCBsd6RMkjVDRZzb' : 'EXAVITQu4vr4xnSDxMaL');

    // 1. ElevenLabs Multilingual v2 Ultra-Human Real Studio Voice
    if (apiKey && apiKey.length > 15) {
      try {
        console.log(`🎙️ Synthesizing Voice via ElevenLabs Multilingual v2 (Voice ID: ${targetVoiceId})...`);
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
              stability: 0.45,
              similarity_boost: 0.85,
              style: 0.20,
              use_speaker_boost: true
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
            voice: targetVoiceId
          });
        } else {
          const errBody = await elevenRes.text();
          console.log('ElevenLabs status:', elevenRes.status, errBody);
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
