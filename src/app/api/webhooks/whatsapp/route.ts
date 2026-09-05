import { NextRequest, NextResponse } from 'next/server';
import { getMessagingProvider } from '@/lib/messaging/base-provider';
import { globalWhatsAppPipeline } from '@/lib/messaging/pipeline';

// GET: Meta Verification Challenge
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'forgeiq_verify_token_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// POST: WhatsApp Inbound Webhook Event Handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const provider = getMessagingProvider();

    // Verify signature if header present
    const signature = req.headers.get('x-hub-signature-256') || '';
    if (!provider.verifyWebhook(signature, JSON.stringify(body))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Process incoming message payload
    const entry = body.entry?.[0];
    const message = entry?.changes?.[0]?.value?.messages?.[0];

    if (message) {
      const fromPhone = message.from;
      const text = message.text?.body || '';

      await globalWhatsAppPipeline.processIncomingWhatsAppOrder(fromPhone, text);
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
