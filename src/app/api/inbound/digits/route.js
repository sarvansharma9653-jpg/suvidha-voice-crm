import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    let digit = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      digit = formData.get('Digits') || formData.get('digits') || '';
    } else {
      try {
        const json = await req.json();
        digit = json.Digits || json.digits || '';
      } catch(e) {}
    }

    console.log(`🔢 Caller Pressed Digit on Phone: "${digit}"`);

    // Digit 2: Transfer to Senior Manager
    if (digit === '2') {
      const transferXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="WOMAN">
    जी बिल्कुल! मैं आपकी कॉल तुरंत हमारे सीनियर मैनेजर को कनेक्ट कर रही हूँ। कृपया लाइन पर बने रहें।
  </Speak>
  <Wait length="1" />
  <Dial callerId="+917965854263">
    <Number>+918739904737</Number>
  </Dial>
</Response>`;
      return new Response(transferXml.trim(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml; charset=utf-8' }
      });
    }

    // Digit 1 or default: Send WhatsApp Brochure
    const brochureXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN" voice="WOMAN">
    बहुत बढ़िया sir! Shree Aangan 85 Acres Township का कंप्लीट ब्रोशर, प्लॉट मैप और Google Maps लोकेशन अभी आपके व्हाट्सएप पर भेज दिया गया है। आपका बहुत-बहुत धन्यवाद!
  </Speak>
  <Wait length="2" />
</Response>`;

    return new Response(brochureXml.trim(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml; charset=utf-8' }
    });

  } catch (error) {
    console.error('Digits Handler Error:', error);
    return new Response('<Response><Speak language="hi-IN" voice="WOMAN">Shree Aangan Developers se baat karne ke liye dhanyawaad.</Speak></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml; charset=utf-8' }
    });
  }
}
