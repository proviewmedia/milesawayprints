import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN_FORM_FILL_MS = 3_000; // bots submit instantly; humans take seconds

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, subject, message, website, openedAt } = body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    website?: string;
    openedAt?: number;
  };

  // Honeypot — bots fill the hidden 'website' field; real users don't.
  if (typeof website === 'string' && website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  // Submit-timing guard
  if (typeof openedAt === 'number' && Date.now() - openedAt < MIN_FORM_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'Please fill in every field.' }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Please use a valid email.' }, { status: 400 });
  }
  if (message.length > 5000 || subject.length > 200 || name.length > 100) {
    return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
  }

  try {
    await sendContactEmail({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Could not send your message. Try again or email us directly.', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
