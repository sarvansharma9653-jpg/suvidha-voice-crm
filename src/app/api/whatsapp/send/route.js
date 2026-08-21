import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { 
      to, 
      message, 
      brochureUrl, 
      leadName, 
      metaAccessToken, 
      metaPhoneNumberId,
      ultraMsgInstanceId,
      ultraMsgToken,
      evolutionApiUrl,
      evolutionApiKey,
      evolutionInstance
    } = await req.json();

    if (!to) {
      return NextResponse.json({ error: 'Recipient phone number is required' }, { status: 400 });
    }

    const rawTo = to.replace(/[^0-9]/g, '');
    const cleanTo91 = rawTo.startsWith('91') ? rawTo : `91${rawTo.replace(/^0+/, '')}`;

    const textToSend = message || `नमस्ते ${leadName || 'जी'}! 🙏\n\nThe Shree Aangan Developers की तरफ से ब्रोशर और डिटेल्स:\n\n🏡 *The Shree Aangan - 85 Acres Gated Township (Jaipur)*\n📍 Chaksu, Tonk Road, NH-12\n📄 Brochure: ${brochureUrl || 'https://drive.google.com/file/d/103owbyObLS3CVyerjrP_Ryr_OVlU2QDG/view'}\n\nक्या इस वीकेंड आप साइट विजिट के लिए आ सकते हैं?`;

    // 1. ULTRAMSG WHATSAPP QR GATEWAY DISPATCH (Admin's personal number background send)
    const uInstance = ultraMsgInstanceId || process.env.ULTRAMSG_INSTANCE_ID;
    const uToken = ultraMsgToken || process.env.ULTRAMSG_TOKEN;

    if (uInstance && uToken) {
      try {
        console.log(`📡 Dispatching WhatsApp via UltraMsg QR Gateway from Admin number to +${cleanTo91}...`);
        const ultraRes = await fetch(`https://api.ultramsg.com/${uInstance}/messages/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token: uToken,
            to: `+${cleanTo91}`,
            body: textToSend
          })
        });

        const ultraData = await ultraRes.json();
        if (ultraData.sent === 'true' || ultraData.id) {
          return NextResponse.json({
            success: true,
            provider: 'ultramsg_qr_gateway',
            messageId: ultraData.id,
            to: `+${cleanTo91}`,
            message: 'Message sent automatically from Admin WhatsApp number in background!'
          });
        }
      } catch (uErr) {
        console.error('UltraMsg dispatch exception:', uErr.message);
      }
    }

    // 2. EVOLUTION API / WPPCONNECT GATEWAY DISPATCH
    const evoUrl = evolutionApiUrl || process.env.EVOLUTION_API_URL;
    const evoKey = evolutionApiKey || process.env.EVOLUTION_API_KEY;
    const evoInst = evolutionInstance || 'admin';

    if (evoUrl && evoKey) {
      try {
        const targetUrl = evoUrl.endsWith('/') ? `${evoUrl}message/sendText/${evoInst}` : `${evoUrl}/message/sendText/${evoInst}`;
        const evoRes = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evoKey
          },
          body: JSON.stringify({
            number: cleanTo91,
            options: { delay: 1200, presence: 'composing' },
            textMessage: { text: textToSend }
          })
        });

        const evoData = await evoRes.json();
        if (evoRes.ok) {
          return NextResponse.json({
            success: true,
            provider: 'evolution_qr_gateway',
            messageId: evoData.key?.id || 'live',
            to: `+${cleanTo91}`
          });
        }
      } catch (evoErr) {
        console.error('Evolution API exception:', evoErr.message);
      }
    }

    // 3. META CLOUD API DISPATCH
    const token = metaAccessToken || process.env.META_ACCESS_TOKEN;
    const phoneId = metaPhoneNumberId || process.env.META_PHONE_NUMBER_ID;

    if (token && phoneId) {
      try {
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
      } catch (metaErr) {}
    }

    // 4. INSTANT DIRECT WHATSAPP WEB LINK FALLBACK
    const encodedText = encodeURIComponent(textToSend);
    const directLink = `https://api.whatsapp.com/send?phone=${cleanTo91}&text=${encodedText}`;

    return NextResponse.json({
      success: true,
      provider: 'whatsapp_direct',
      to: `+${cleanTo91}`,
      directLink,
      message: `WhatsApp link ready for +${cleanTo91}`
    });

  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
