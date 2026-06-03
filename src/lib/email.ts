import { Resend } from 'resend';
import { SITE_URL } from './site';

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
const SUPPORT_INBOX = 'milesawayprintsllc@gmail.com';

// ────────────────────────────────────────────────────────────────────────────
// Shared layout
// ────────────────────────────────────────────────────────────────────────────

interface WrapArgs {
  /** Email <title>, also used as the visible H1 unless `heading` is set */
  preheader: string;
  /** Visible H1 inside the email body */
  heading: string;
  /** Inner HTML — paragraphs / blocks / order-summary tables go here */
  bodyHtml: string;
  /** Optional primary CTA (button) */
  cta?: { label: string; href: string };
}

/**
 * Single source of truth for transactional email styling. All templates
 * (order confirmation, shipping, digital delivery) wrap their inner
 * content with this so the brand chrome stays consistent.
 */
function wrapEmail({ preheader, heading, bodyHtml, cta }: WrapArgs): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(preheader)}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #0e0e0e; background: #ffffff;">
    <p style="font-size: 12px; color: #9c9c9c; margin: 0 0 24px; letter-spacing: 0.06em; text-transform: uppercase;">
      Miles Away Prints
    </p>
    <h1 style="font-size: 28px; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 16px; line-height: 1.15;">
      ${escapeHtml(heading)}
    </h1>
    ${bodyHtml}
    ${
      cta
        ? `<div style="margin: 32px 0;">
        <a href="${cta.href}" style="display: inline-block; background: #0e0e0e; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 14px; padding: 14px 28px; border-radius: 999px;">
          ${escapeHtml(cta.label)}
        </a>
      </div>`
        : ''
    }
    <hr style="border: none; border-top: 1px solid #e8e6e0; margin: 32px 0;" />
    <p style="font-size: 12px; color: #9c9c9c; margin: 0 0 8px;">
      Miles Away Prints · <a href="${SITE_URL}" style="color: #6b6b6b;">milesawayprints.com</a>
    </p>
    <p style="font-size: 12px; color: #9c9c9c; margin: 0;">
      Questions? Reply to this email or reach <a href="mailto:${REPLY_TO}" style="color: #6b6b6b;">${REPLY_TO}</a>.
    </p>
  </body>
</html>`.trim();
}

// ────────────────────────────────────────────────────────────────────────────
// Order confirmation email — sent at payment for every paid order
// ────────────────────────────────────────────────────────────────────────────

export interface OrderConfirmationItem {
  name: string;
  format: 'physical' | 'digital';
  size?: string;
  priceCents: number;
  isGift?: boolean;
}

export interface OrderShippingAddress {
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
}

interface OrderConfirmationArgs {
  to: string;
  customerName: string;
  orderNumber: string | number;
  orderToken: string;
  items: OrderConfirmationItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  /** Set on physical orders */
  shipping?: OrderShippingAddress;
  /** Set on digital orders */
  digital?: {
    downloadUrl: string;
    expiresAt: Date;
    maxDownloads: number;
  };
}

export async function sendOrderConfirmationEmail(args: OrderConfirmationArgs) {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY missing; skipping order-confirmation send');
    return { skipped: true };
  }

  const firstName = args.customerName.split(' ')[0] || 'there';
  const hasPhysical = args.items.some((i) => i.format === 'physical');
  const hasDigital = args.items.some((i) => i.format === 'digital');

  const itemsHtml = args.items
    .map(
      (it) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e8e6e0; font-size: 14px; color: #0e0e0e;">
        ${escapeHtml(it.name)}
        <div style="font-size: 12px; color: #6b6b6b; margin-top: 2px;">
          ${it.format === 'digital' ? 'Digital download' : escapeHtml(it.size ?? '')}
          ${it.isGift ? ' · Gift' : ''}
        </div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e8e6e0; font-size: 14px; color: #0e0e0e; text-align: right; white-space: nowrap;">
        $${(it.priceCents / 100).toFixed(2)}
      </td>
    </tr>`,
    )
    .join('');

  const shippingBlock = args.shipping
    ? `
    <div style="margin: 24px 0;">
      <p style="font-size: 11px; color: #9c9c9c; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 8px;">
        Shipping to
      </p>
      <p style="font-size: 14px; color: #0e0e0e; margin: 0; line-height: 1.55;">
        ${escapeHtml(args.shipping.name)}<br />
        ${escapeHtml(args.shipping.line1)}${args.shipping.line2 ? '<br />' + escapeHtml(args.shipping.line2) : ''}<br />
        ${escapeHtml(args.shipping.city)}${args.shipping.state ? ', ' + escapeHtml(args.shipping.state) : ''} ${escapeHtml(args.shipping.postalCode)}<br />
        ${escapeHtml(args.shipping.country)}
      </p>
    </div>`
    : '';

  const digitalBlock = args.digital
    ? `
    <div style="margin: 24px 0; padding: 16px; background: #f5f3ef; border-radius: 8px;">
      <p style="font-size: 13px; color: #0e0e0e; font-weight: 500; margin: 0 0 8px;">
        Digital download ready
      </p>
      <p style="font-size: 13px; color: #6b6b6b; line-height: 1.55; margin: 0 0 12px;">
        Click below to grab your file. The link works for ${args.digital.maxDownloads} downloads
        through ${args.digital.expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
      </p>
      <a href="${args.digital.downloadUrl}" style="display: inline-block; background: #0e0e0e; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 13px; padding: 10px 20px; border-radius: 999px;">
        Download your print
      </a>
    </div>`
    : '';

  const tail = hasPhysical
    ? '<p style="font-size: 13px; color: #6b6b6b; line-height: 1.6; margin: 24px 0 0;">We&rsquo;ll email you again with tracking as soon as your print ships — usually within 3–5 business days.</p>'
    : hasDigital
    ? '<p style="font-size: 13px; color: #6b6b6b; line-height: 1.6; margin: 24px 0 0;">If your link expires before you download, just reply to this email and we&rsquo;ll re-issue it.</p>'
    : '';

  const bodyHtml = `
    <p style="font-size: 15px; line-height: 1.6; color: #6b6b6b; margin: 0 0 8px;">
      Thanks, ${escapeHtml(firstName)} — we got your order.
    </p>
    <p style="font-size: 13px; color: #9c9c9c; margin: 0 0 24px; letter-spacing: 0.04em;">
      Order #${escapeHtml(String(args.orderNumber))}
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 0 0 16px;" role="presentation">
      ${itemsHtml}
      <tr>
        <td style="padding: 12px 0 4px; font-size: 13px; color: #6b6b6b;">Subtotal</td>
        <td style="padding: 12px 0 4px; font-size: 13px; color: #0e0e0e; text-align: right;">$${(args.subtotalCents / 100).toFixed(2)}</td>
      </tr>
      ${
        hasPhysical
          ? `<tr>
        <td style="padding: 4px 0; font-size: 13px; color: #6b6b6b;">Shipping</td>
        <td style="padding: 4px 0; font-size: 13px; color: #0e0e0e; text-align: right;">$${(args.shippingCents / 100).toFixed(2)}</td>
      </tr>`
          : ''
      }
      <tr>
        <td style="padding: 8px 0 4px; font-size: 14px; font-weight: 500; color: #0e0e0e; border-top: 1px solid #e8e6e0;">Total</td>
        <td style="padding: 8px 0 4px; font-size: 14px; font-weight: 500; color: #0e0e0e; text-align: right; border-top: 1px solid #e8e6e0;">$${(args.totalCents / 100).toFixed(2)}</td>
      </tr>
    </table>

    ${digitalBlock}
    ${shippingBlock}
    ${tail}
  `;

  const html = wrapEmail({
    preheader: `Order #${args.orderNumber} confirmed`,
    heading: 'Order confirmed',
    bodyHtml,
    cta: {
      label: 'View your order',
      href: `${SITE_URL}/order/${args.orderToken}`,
    },
  });

  return resend.emails.send({
    from: FROM,
    to: args.to,
    reply_to: REPLY_TO,
    subject: `Order confirmed — #${args.orderNumber}`,
    html,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Shipping email — sent when Printful's package_shipped fires
// ────────────────────────────────────────────────────────────────────────────

interface ShippingArgs {
  to: string;
  customerName: string;
  orderNumber: string | number;
  orderToken: string;
  trackingNumber: string;
  trackingUrl?: string | null;
  carrier?: string | null;
  /** Short summary of items so the customer recognizes which order */
  itemSummary: string;
}

export async function sendShippingEmail(args: ShippingArgs) {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY missing; skipping shipping email');
    return { skipped: true };
  }

  const firstName = args.customerName.split(' ')[0] || 'there';

  const trackHref = args.trackingUrl ?? `${SITE_URL}/order/${args.orderToken}`;

  const bodyHtml = `
    <p style="font-size: 15px; line-height: 1.6; color: #6b6b6b; margin: 0 0 8px;">
      Hi ${escapeHtml(firstName)} — your print is on its way.
    </p>
    <p style="font-size: 13px; color: #9c9c9c; margin: 0 0 24px; letter-spacing: 0.04em;">
      Order #${escapeHtml(String(args.orderNumber))} · ${escapeHtml(args.itemSummary)}
    </p>

    <div style="margin: 0 0 24px; padding: 16px; background: #f5f3ef; border-radius: 8px;">
      <p style="font-size: 11px; color: #9c9c9c; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 6px;">
        Tracking ${args.carrier ? '· ' + escapeHtml(args.carrier) : ''}
      </p>
      <p style="font-size: 14px; color: #0e0e0e; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; margin: 0; word-break: break-all;">
        ${escapeHtml(args.trackingNumber)}
      </p>
    </div>

    <p style="font-size: 13px; color: #6b6b6b; line-height: 1.6; margin: 0;">
      Delivery times vary by destination — typically 3–10 business days from
      shipment. Tracking can take 24–48 hours to start updating.
    </p>
  `;

  const html = wrapEmail({
    preheader: `Your print has shipped — #${args.orderNumber}`,
    heading: 'Your print has shipped',
    bodyHtml,
    cta: {
      label: args.trackingUrl ? 'Track your package' : 'View your order',
      href: trackHref,
    },
  });

  return resend.emails.send({
    from: FROM,
    to: args.to,
    reply_to: REPLY_TO,
    subject: `Your print has shipped — #${args.orderNumber}`,
    html,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Digital delivery — kept as a fallback caller, but the order
// confirmation now embeds the download link inline so this is rarely
// invoked directly. Left here for the legacy webhook path.
// ────────────────────────────────────────────────────────────────────────────

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
    console.warn('[email] RESEND_API_KEY missing; skipping send');
    return { skipped: true };
  }

  const expiresStr = args.expiresAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const bodyHtml = `
    <p style="font-size: 15px; line-height: 1.5; color: #6b6b6b; margin: 0 0 24px;">
      Hi ${escapeHtml(args.customerName)} — thanks for picking up
      <strong style="color: #0e0e0e;">${escapeHtml(args.productName)}</strong>.
      Your digital print is below.
    </p>
    <p style="font-size: 13px; line-height: 1.6; color: #6b6b6b; margin: 0 0 8px;">
      This link expires <strong style="color: #0e0e0e;">${expiresStr}</strong>
      and can be used up to ${args.maxDownloads} times.
    </p>
    <p style="font-size: 13px; line-height: 1.6; color: #6b6b6b; margin: 0;">
      If you didn&apos;t make this purchase, you can ignore this email.
    </p>
  `;

  const html = wrapEmail({
    preheader: `Your ${args.productName} print is ready`,
    heading: 'Your print is ready',
    bodyHtml,
    cta: { label: 'Download your print', href: args.downloadUrl },
  });

  return resend.emails.send({
    from: FROM,
    to: args.to,
    reply_to: REPLY_TO,
    subject: `Your ${args.productName} print is ready`,
    html,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Contact form — internal-only, plain layout
// ────────────────────────────────────────────────────────────────────────────

interface ContactArgs {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(args: ContactArgs) {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY missing; skipping contact send');
    return { skipped: true };
  }
  const html = `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0e0e0e;background:#fff;">
<h2 style="font-size:18px;margin:0 0 16px;">New contact form message</h2>
<p style="font-size:14px;color:#6b6b6b;margin:0 0 4px;"><strong style="color:#0e0e0e;">From:</strong> ${escapeHtml(args.name)} &lt;${escapeHtml(args.email)}&gt;</p>
<p style="font-size:14px;color:#6b6b6b;margin:0 0 16px;"><strong style="color:#0e0e0e;">Subject:</strong> ${escapeHtml(args.subject)}</p>
<hr style="border:none;border-top:1px solid #e8e6e0;margin:16px 0;" />
<pre style="font-family:-apple-system,sans-serif;font-size:14px;color:#0e0e0e;line-height:1.5;white-space:pre-wrap;margin:0;">${escapeHtml(args.message)}</pre>
</body></html>`.trim();
  return resend.emails.send({
    from: FROM,
    to: SUPPORT_INBOX,
    reply_to: args.email,
    subject: `[Contact] ${args.subject}`,
    html,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Marathon manual-fulfillment notification — sent to the admin inbox when
// a marathon order is paid, since marathons aren't auto-submitted to Printful
// (admin builds the print file by hand).
// ────────────────────────────────────────────────────────────────────────────

export interface MarathonFulfillmentArgs {
  orderNumber: string | number;
  orderToken: string;
  customer: { name: string; email: string };
  shipping?: OrderShippingAddress;
  city: string;
  variant: 'full' | 'half';
  size: string;
  pricePaidCents: number;
  customization: {
    bib: string;
    firstName: string;
    lastName: string;
    raceDate: string;
    finishTime: string;
  };
}

export async function sendMarathonFulfillmentEmail(args: MarathonFulfillmentArgs) {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY missing; skipping marathon fulfillment notification');
    return { skipped: true };
  }

  const variantLabel = args.variant === 'half' ? 'Half Marathon' : 'Marathon';
  const subject = `[Marathon] ${args.city} ${variantLabel} #${args.orderNumber} — ${args.customization.firstName} ${args.customization.lastName}`;

  const shippingHtml = args.shipping
    ? `<p style="font-size:13px;color:#0e0e0e;margin:0 0 4px;line-height:1.5;">
         ${escapeHtml(args.shipping.name)}<br/>
         ${escapeHtml(args.shipping.line1)}${args.shipping.line2 ? `<br/>${escapeHtml(args.shipping.line2)}` : ''}<br/>
         ${escapeHtml(args.shipping.city)}${args.shipping.state ? `, ${escapeHtml(args.shipping.state)}` : ''} ${escapeHtml(args.shipping.postalCode)}<br/>
         ${escapeHtml(args.shipping.country)}
       </p>`
    : '<p style="font-size:13px;color:#9c9c9c;margin:0;">No shipping address on file.</p>';

  const html = `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0e0e0e;background:#fff;">
<p style="font-size:12px;color:#9c9c9c;margin:0 0 16px;letter-spacing:0.06em;text-transform:uppercase;">Marathon order — manual fulfillment</p>
<h2 style="font-size:20px;margin:0 0 16px;font-weight:500;">${escapeHtml(args.city)} ${variantLabel}</h2>
<table style="font-size:14px;color:#0e0e0e;border-collapse:collapse;margin:0 0 24px;">
  <tr><td style="padding:4px 16px 4px 0;color:#6b6b6b;">Order</td><td>#${escapeHtml(String(args.orderNumber))} <span style="color:#9c9c9c;font-size:12px;">(${escapeHtml(args.orderToken)})</span></td></tr>
  <tr><td style="padding:4px 16px 4px 0;color:#6b6b6b;">Variant</td><td>${escapeHtml(variantLabel)}</td></tr>
  <tr><td style="padding:4px 16px 4px 0;color:#6b6b6b;">Size</td><td>${escapeHtml(args.size)}</td></tr>
  <tr><td style="padding:4px 16px 4px 0;color:#6b6b6b;">Paid</td><td>$${(args.pricePaidCents / 100).toFixed(2)}</td></tr>
</table>
<h3 style="font-size:14px;margin:16px 0 8px;color:#0e0e0e;font-weight:600;">Personalization</h3>
<table style="font-size:14px;color:#0e0e0e;border-collapse:collapse;margin:0 0 24px;">
  <tr><td style="padding:4px 16px 4px 0;color:#6b6b6b;">Name</td><td>${escapeHtml(args.customization.firstName)} ${escapeHtml(args.customization.lastName)}</td></tr>
  <tr><td style="padding:4px 16px 4px 0;color:#6b6b6b;">Bib</td><td>#${escapeHtml(args.customization.bib)}</td></tr>
  <tr><td style="padding:4px 16px 4px 0;color:#6b6b6b;">Race date</td><td>${escapeHtml(args.customization.raceDate)}</td></tr>
  <tr><td style="padding:4px 16px 4px 0;color:#6b6b6b;">Finish time</td><td>${escapeHtml(args.customization.finishTime)}</td></tr>
</table>
<h3 style="font-size:14px;margin:16px 0 8px;color:#0e0e0e;font-weight:600;">Customer</h3>
<p style="font-size:13px;color:#0e0e0e;margin:0 0 4px;">${escapeHtml(args.customer.name)} &lt;${escapeHtml(args.customer.email)}&gt;</p>
<h3 style="font-size:14px;margin:16px 0 8px;color:#0e0e0e;font-weight:600;">Ship to</h3>
${shippingHtml}
<hr style="border:none;border-top:1px solid #e8e6e0;margin:24px 0;" />
<p style="font-size:13px;color:#6b6b6b;margin:0;line-height:1.5;">
  Build the personalized print file, place the order in Printful manually
  (matte poster catalog variant for ${escapeHtml(args.size)}), then update
  this order in Supabase with the Printful order ID.
</p>
</body></html>`.trim();

  return resend.emails.send({
    from: FROM,
    to: SUPPORT_INBOX,
    subject,
    html,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Newsletter welcome — sent on signup with the 10% off promo code
// ────────────────────────────────────────────────────────────────────────────

interface NewsletterWelcomeArgs {
  to: string;
  promoCode: string;
}

export async function sendNewsletterWelcomeEmail({
  to,
  promoCode,
}: NewsletterWelcomeArgs) {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping newsletter welcome');
    return { skipped: true };
  }

  const html = wrapEmail({
    preheader: `Welcome — your 10% off code is ${promoCode}`,
    heading: 'Welcome to Miles Away.',
    bodyHtml: `
<p style="font-size: 15px; color: #6b6b6b; margin: 0 0 24px; line-height: 1.6;">
  Thanks for signing up. As a thank-you, here's <strong style="color: #0e0e0e;">10% off your first print</strong> — apply this code at checkout:
</p>
<div style="margin: 0 0 24px; padding: 20px 24px; background: #f5f3ef; border-radius: 12px; text-align: center;">
  <p style="font-size: 11px; color: #6b6b6b; margin: 0 0 8px; letter-spacing: 0.12em; text-transform: uppercase;">Your code</p>
  <p style="font-family: ui-monospace, SFMono-Regular, monospace; font-size: 22px; color: #0e0e0e; margin: 0; letter-spacing: 0.04em;">
    ${escapeHtml(promoCode)}
  </p>
</div>
<p style="font-size: 14px; color: #6b6b6b; margin: 0 0 24px; line-height: 1.6;">
  This code is good for one use and applies to your first order. We'll occasionally email when we add new prints or run a promotion — and never any spam.
</p>`,
    cta: {
      label: 'Browse the shop',
      // ?code= is read by /checkout's auto-apply logic — the discount
      // shows up in the Stripe panel from the first render so the
      // customer never has to copy/paste.
      href: `${SITE_URL}/shop?code=${encodeURIComponent(promoCode)}`,
    },
  });

  return resend.emails.send({
    from: FROM,
    to,
    reply_to: REPLY_TO,
    subject: `Welcome — here's 10% off your first print`,
    html,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Stripe health alert — sent when the hourly cron probe fails
// ────────────────────────────────────────────────────────────────────────────

interface StripeAlertArgs {
  errorMessage: string;
}

export async function sendStripeBrokenAlertEmail({ errorMessage }: StripeAlertArgs) {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping Stripe alert');
    return { skipped: true };
  }

  const timestamp = new Date().toUTCString();

  const html = wrapEmail({
    preheader: 'Stripe API is failing on milesawayprints.com',
    heading: 'Stripe API check failed',
    bodyHtml: `
<p style="font-size: 15px; color: #6b6b6b; margin: 0 0 16px; line-height: 1.6;">
  The hourly health check at <code style="background:#f5f3ef;padding:1px 4px;border-radius:4px;">/api/health/stripe</code> failed. Customers may be unable to check out until this is fixed.
</p>
<div style="margin: 0 0 24px; padding: 16px 20px; background: #fff5f5; border-left: 3px solid #dc2626; border-radius: 4px;">
  <p style="font-size: 11px; color: #6b6b6b; margin: 0 0 6px; letter-spacing: 0.1em; text-transform: uppercase;">Error</p>
  <p style="font-family: ui-monospace, SFMono-Regular, monospace; font-size: 13px; color: #0e0e0e; margin: 0; word-break: break-word;">
    ${escapeHtml(errorMessage)}
  </p>
</div>
<p style="font-size: 13px; color: #6b6b6b; margin: 0 0 8px;">
  <strong style="color:#0e0e0e;">Detected:</strong> ${escapeHtml(timestamp)}
</p>
<p style="font-size: 13px; color: #6b6b6b; margin: 0 0 24px; line-height: 1.6;">
  Most common cause: the live Stripe secret key was rotated or expired. Check Stripe Dashboard → API keys, then update <code style="background:#f5f3ef;padding:1px 4px;border-radius:4px;">STRIPE_SECRET_KEY</code> in Vercel and redeploy.
</p>
<table style="width: 100%; margin: 0 0 8px;">
  <tr>
    <td style="padding: 0 8px 0 0;">
      <a href="https://dashboard.stripe.com/apikeys" style="display: inline-block; background: #0e0e0e; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 14px; padding: 12px 20px; border-radius: 999px;">Stripe Dashboard →</a>
    </td>
    <td>
      <a href="https://vercel.com/melvinxmorales-projects/milesawayprints/settings/environment-variables" style="display: inline-block; background: #f5f3ef; color: #0e0e0e; text-decoration: none; font-weight: 500; font-size: 14px; padding: 12px 20px; border-radius: 999px;">Vercel env vars →</a>
    </td>
  </tr>
</table>`,
  });

  return resend.emails.send({
    from: FROM,
    to: SUPPORT_INBOX,
    subject: '[Alert] Stripe API is failing on milesawayprints.com',
    html,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
