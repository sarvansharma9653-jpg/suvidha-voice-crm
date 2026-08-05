import { NextResponse } from 'next/server';

// GET or POST endpoint called by Twilio when an inbound call comes in
export async function POST(req) {
  try {
    const websocketUrl = process.env.WEBSOCKET_SERVER_URL || 'wss://your-domain.ngrok-free.app/media-stream';

    // Return TwiML to connect the inbound call to our WebSocket voice streaming server
    const twiml = `
      <Response>
        <Connect>
          <Stream url="${websocketUrl}">
            <Parameter name="inbound" value="true" />
          </Stream>
        </Connect>
      </Response>
    `;

    return new Response(twiml.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Inbound webhook error:', error);
    return NextResponse.json({ error: 'Failed to process inbound call' }, { status: 500 });
  }
}

// Support GET for testing
export async function GET(req) {
  return POST(req);
}
