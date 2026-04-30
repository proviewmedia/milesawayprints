import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith('your_')) return null;
  _resend = new Resend(key);
  return _resend;
}

const FROM = 'Miles Away Prints <orders@milesawayprints.com>';
const REPLY_TO = 'milesawayprintsllc@gmail.com';

interface DigitalDeliveryArgs {
  to: string;
  customerName: string;
  productName: string;
  downloadUrl: string;
  expiresAt: Date;
  maxDownloads: number;
}

export async function sendDigitalDeliveryEmail(args: DigitalDeliveryArgs) {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY missing or placeholder; skipping send');
    return { skipped: true };
  }

  const expiresStr = args.expiresAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #0e0e0e; background: #ffffff;">
    <h1 style="font-size: 28px; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 16px;">Your print is ready</h1>
    <p style="font-size: 15px; line-height: 1.5; color: #6b6b6b; margin: 0 0 24px;">
      Hi ${escapeHtml(args.customerName)} — thanks for picking up
      <strong style="color: #0e0e0e;">${escapeHtml(args.productName)}</strong>.
      Your digital print is below.
    </p>
    <div style="margin: 32px 0;">
      <a href="${args.downloadUrl}" style="display: inline-block; background: #0e0e0e; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 14px; padding: 14px 28px; border-radius: 999px;">
        Download your print
      </a>
    </div>
    <p style="font-size: 13px; line-height: 1.6; color: #6b6b6b; margin: 0 0 8px;">
      This link expires <strong style="color: #0e0e0e;">${expiresStr}</strong> and can be used up to ${args.maxDownloads} times.
    </p>
    <p style="font-size: 13px; line-height: 1.6; color: #6b6b6b; margin: 0 0 24px;">
      If you didn't make this purchase, you can ignore this email.
    </p>
    <hr style="border: none; border-top: 1px solid #e8e6e0; margin: 32px 0;" />
    <p style="font-size: 12px; color: #9c9c9c; margin: 0;">
      Miles Away Prints · <a href="https://milesawayprints.com" style="color: #6b6b6b;">milesawayprints.com</a>
    </p>
  </body>
</html>`.trim();

  return resend.emails.send({
    from: FROM,
    to: args.to,
    reply_to: REPLY_TO,
    subject: `Your ${args.productName} print is ready`,
    html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
