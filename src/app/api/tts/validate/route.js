import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { apiKey } = await req.json();
    if (!apiKey || apiKey.trim().length < 15) {
      return NextResponse.json({ success: false, error: 'Please enter a valid ElevenLabs API key' }, { status: 400 });
    }

    const res = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
      headers: { 'xi-api-key': apiKey.trim() }
    });

    const data = await res.json();

    if (res.ok) {
      const charCount = data.character_count || 0;
      const charLimit = data.character_limit || 10000;
      const remaining = Math.max(0, charLimit - charCount);
      const tier = data.tier || 'free';

      return NextResponse.json({
        success: true,
        tier,
        remainingCharacters: remaining,
        totalLimit: charLimit,
        usedCharacters: charCount,
        message: `ElevenLabs API Key Active (${remaining.toLocaleString()} credits available, Plan: ${tier})`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.detail?.message || 'Invalid ElevenLabs API Key or Quota Exceeded'
      }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
