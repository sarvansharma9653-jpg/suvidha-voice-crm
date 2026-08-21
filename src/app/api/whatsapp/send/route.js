import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { to, message, brochureUrl, leadName, metaAccessToken, metaPhoneNumberId } = await req.json();

    if (!to) {
      return NextResponse.json({ error: 'Recipient phone number is required' }, { status: 400 });
    }

    const rawTo = to.replace(/[^0-9]/g, '');
    const cleanTo91 = rawTo.startsWith('91') ? rawTo : `91${rawTo.replace(/^0+/, '')}`;

    const textToSend = message || `नमस्ते ${leadName || 'जी'}! 🙏\n\nShree Aangan Developers से बात करने के लिए धन्यवाद। ब्रोशर: ${brochureUrl || 'https://drive.google.com/file/d/103owbyObLS3CVyerjrP_Ryr_OVlU2QDG/view'}`;

    // 1. If Meta WhatsApp Cloud API credentials are provided
    const token = metaAccessToken || process.env.META_ACCESS_TOKEN;
    const phoneId = metaPhoneNumberId || process.env.META_PHONE_NUMBER_ID;

    if (token && phoneId) {
      try {
        console.log(`📡 Sending WhatsApp via Meta Cloud API to +${cleanTo91}...`);
        const metaRes = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanTo91,
            type: 'text',
            text: { body: textToSend }
          })
        });

        const metaData = await metaRes.json();
        if (metaRes.ok) {
          return NextResponse.json({
            success: true,
            provider: 'meta_cloud_api',
            messageId: metaData.messages?.[0]?.id,
            to: `+${cleanTo91}`
          });
        }
      } catch (metaErr) {
        console.error('Meta API Exception:', metaErr.message);
      }
    }

    // 2. Direct WhatsApp Web Link generation (Instant Click-to-Chat fallback)
    const encodedText = encodeURIComponent(textToSend);
    const directLink = `https://api.whatsapp.com/send?phone=${cleanTo91}&text=${encodedText}`;

    return NextResponse.json({
      success: true,
      provider: 'whatsapp_direct',
      to: `+${cleanTo91}`,
      directLink,
      message: `WhatsApp message prepared for +${cleanTo91}`
    });

  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
