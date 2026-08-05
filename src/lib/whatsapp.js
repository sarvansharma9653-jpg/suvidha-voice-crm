// WhatsApp Meta Cloud API Helper
// Sends alerts when hot leads (interested customers) are qualified by the voice assistant

export async function sendWhatsAppAlert({ leadName, summary, adminNumber, metaAccessToken, metaPhoneNumberId }) {
  try {
    const accessToken = metaAccessToken || process.env.META_ACCESS_TOKEN;
    const phoneNumberId = metaPhoneNumberId || process.env.META_PHONE_NUMBER_ID;
    const to = adminNumber || process.env.ADMIN_NOTIFICATION_NUMBER;

    if (!accessToken || !phoneNumberId || !to) {
      console.warn('⚠️ WhatsApp alerts skipped: Missing Meta credentials or Admin phone number.');
      return false;
    }

    console.log(`💬 Sending WhatsApp Hot Lead notification to ${to}...`);

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: {
            body: `🔥 *Hot Lead Qualified on Suvidha!* \n\n👤 *Lead Name:* ${leadName}\n📋 *Conversation Summary:* ${summary}\n\nPlease follow up immediately. Check full transcript in your Suvidha CRM Dashboard!`
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      return false;
    }

    console.log('✅ WhatsApp alert sent successfully!');
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp alert:', error);
    return false;
  }
}
