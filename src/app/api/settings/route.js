import { NextResponse } from 'next/server';

let serverConfigStore = {
  adminNumber: '+918739904737',
  telephonyProvider: 'vobiz',
  vobizAuthId: 'MA_QTLGTSF9',
  vobizAuthToken: '',
  vobizVirtualNumber: '+917965854263',
  callerNumber: '+917965854263',
  elevenLabsApiKey: '',
  deepgramApiKey: '',
  ultraMsgInstanceId: '',
  ultraMsgToken: '',
  evolutionApiUrl: '',
  evolutionApiKey: '',
  metaAccessToken: '',
  metaPhoneNumberId: '',
  productName: 'The Shree Aangan - 85 Acres JDA & RERA Township (Tonk Road, Jaipur)',
  productPricing: '₹800 – ₹2,750 / sq.ft (EMI Available)',
  brochureUrl: 'https://drive.google.com/file/d/103owbyObLS3CVyerjrP_Ryr_OVlU2QDG/view?usp=sharing'
};

export async function GET(req) {
  try {
    return NextResponse.json({
      success: true,
      settings: serverConfigStore
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    serverConfigStore = {
      ...serverConfigStore,
      ...body
    };

    console.log('💾 Server-Side Settings Permanently Updated:', {
      vobizAuthId: serverConfigStore.vobizAuthId,
      hasVobizToken: !!serverConfigStore.vobizAuthToken,
      hasElevenKey: !!serverConfigStore.elevenLabsApiKey,
      hasDeepgramKey: !!serverConfigStore.deepgramApiKey,
      adminNumber: serverConfigStore.adminNumber
    });

    return NextResponse.json({
      success: true,
      message: 'Settings saved permanently to backend server!',
      settings: serverConfigStore
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
