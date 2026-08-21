import { NextResponse } from 'next/server';

function generateInboundXml(reqUrl) {
  try {
    const url = new URL(reqUrl);
    let customScript = url.searchParams.get('script') || '';

    if (customScript) {
      try {
        customScript = decodeURIComponent(customScript);
      } catch(e) {}

      customScript = customScript
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    const defaultSpeech = 'Namaskar ji! Main Pooja bol rahi hoon, The Shree Aangan Developers ki taraf se. Chaksu, Tonk Road par hamara 85 Acres ka JDA Approved township project hai. Kya aap Jaipur mein plot ya property investment ke baare mein soch rahe hain?';

    const speechToSpeak = (customScript.trim() || defaultSpeech)
      .replace(/[*_#`]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const actionUrl = 'https://suvidha-voice-crm.vercel.app/api/inbound/process-speech';

    // 100% Plivo Compatible Speech Recognition XML
    const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetInput action="${actionUrl}" method="POST" inputType="speech" language="en-IN" speechEndTimeout="2" redirect="true">
    <Speak language="en-IN">${speechToSpeak}</Speak>
  </GetInput>
  <Speak language="en-IN">
    Shree Aangan Developers se baat karne ke liye dhanyawaad. Poori details hum aapko WhatsApp par bhej rahe hain.
  </Speak>
</Response>`;

    return responseXml.trim();
  } catch (err) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="en-IN">Namaskar ji! The Shree Aangan Developers se baat karne ke liye dhanyawaad.</Speak>
</Response>`;
  }
}

export async function POST(req) {
  try {
    const xml = generateInboundXml(req.url);
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Inbound POST Error:', error);
    return new Response('<Response><Speak language="en-IN">Namaste! Shree Aangan Developers.</Speak></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml; charset=utf-8' }
    });
  }
}

export async function GET(req) {
  try {
    const xml = generateInboundXml(req.url);
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Inbound GET Error:', error);
    return new Response('<Response><Speak language="en-IN">Namaste! Shree Aangan Developers.</Speak></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml; charset=utf-8' }
    });
  }
}
