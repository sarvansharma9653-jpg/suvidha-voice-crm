import { NextResponse } from 'next/server';

const VAPI_API_KEY = process.env.VAPI_API_KEY;

// GET - List available Vapi phone numbers
export async function GET() {
  try {
    if (!VAPI_API_KEY) {
      return NextResponse.json({ error: 'VAPI_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.vapi.ai/phone-number', {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
