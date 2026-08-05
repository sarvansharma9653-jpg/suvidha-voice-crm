import { NextResponse } from 'next/server';
import { mockContacts } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(mockContacts);
}

export async function POST(req) {
  try {
    const contact = await req.json();
    const newContact = {
      ...contact,
      id: Date.now().toString(),
      status: 'New',
      lastCalled: null
    };
    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
