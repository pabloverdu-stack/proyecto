import { EMAIL_FROM, N8N_WEBHOOK_URL, OWNER_EMAIL, RESEND_API_KEY } from 'astro:env/server';
import { formatEuros, site } from '../config/site';
import type { CardRecord, OrderInput, OrderRecord } from './store';

interface Notification {
  order: OrderRecord;
  input: OrderInput;
  cards: CardRecord[];
  productName: string;
  unitsText: string;
  siteUrl: string;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

async function sendEmail(to: string, subject: string, html: string, text: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: EMAIL_FROM || `${site.name} <pedidos@fichaviva.es>`,
      to: [to],
      reply_to: site.email,
      subject,
      html,
      text,
    }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
}

function customerEmail({ input, unitsText }: Notification) {
  const name = input.customerName?.split(' ')[0] ?? '';
  const lines = [
    `Hola${name ? ` ${name}` : ''}:`,
    '',
    `Gracias por tu pedido. Hemos recibido el pago de ${unitsText} para ${input.business.name}.`,
    '',
    'Esto es lo que pasa ahora:',
    `1. Comprobamos que el enlace lleva a la ficha de Google de ${input.business.name}.`,
    '2. Programamos tu pedido y lo bloqueamos para que nadie pueda cambiar el enlace.',
    `3. Te lo enviamos: llega en ${site.shipping.time} laborables a la dirección que nos diste.`,
    '',
    `Importe: ${formatEuros(input.amountTotal)}, IVA incluido.`,
    '',
    `¿Algo no está bien? Responde a este email o escríbenos a ${site.email}.`,
    '',
    site.name,
  ];
  const text = lines.join('\n');
  const html = `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.55;color:#17191a;max-width:560px">${lines
    .map((line) => (line ? `<p style="margin:0 0 8px">${escapeHtml(line)}</p>` : ''))
    .join('')}</div>`;
  return { subject: `Hemos recibido tu pedido de ${site.name}`, html, text };
}

function ownerEmail({ order, input, cards, productName, unitsText, siteUrl }: Notification) {
  const address = input.shippingAddress ? JSON.stringify(input.shippingAddress) : 'sin dirección';
  const rows: [string, string][] = [
    ['Estado', input.status === 'needs_review' ? 'REVISAR ANTES DE PROGRAMAR' : 'Pagado'],
    ['Notas', input.notes ?? '—'],
    ['Producto', `${productName}: ${unitsText}`],
    ['Importe', formatEuros(input.amountTotal)],
    ['Negocio', `${input.business.name}${input.business.address ? `, ${input.business.address}` : ''}`],
    ['Enlace de reseña', input.business.reviewUrl],
    ['Cliente', `${input.customerName ?? ''} <${input.customerEmail ?? ''}> ${input.phone ?? ''}`],
    ['NIF/CIF', input.taxId ?? '—'],
    ['Envío', address],
    ['Sesión de Stripe', input.stripeSessionId],
    ['Pedido', order.id],
  ];
  const cardLines = cards.map((card) => `${siteUrl}/t/${card.code}`);
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), '', 'URL para grabar en cada chip y QR:', ...cardLines].join('\n');
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#17191a">
<table style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#5b6166;vertical-align:top">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
    )
    .join('')}</table>
<p style="margin:16px 0 4px"><strong>URL para grabar en cada chip y QR:</strong></p>
<ul>${cardLines.map((line) => `<li><code>${escapeHtml(line)}</code></li>`).join('')}</ul></div>`;
  const flag = input.status === 'needs_review' ? '[REVISAR] ' : '';
  return { subject: `${flag}Nuevo pedido: ${input.business.name} (${unitsText})`, html, text };
}

/** Envía los avisos disponibles. Un fallo aquí nunca bloquea el pedido. */
export async function sendOrderNotifications(notification: Notification) {
  const tasks: Promise<unknown>[] = [];
  const { input, cards, siteUrl } = notification;

  if (RESEND_API_KEY && input.customerEmail) {
    const email = customerEmail(notification);
    tasks.push(sendEmail(input.customerEmail, email.subject, email.html, email.text));
  }
  if (RESEND_API_KEY && OWNER_EMAIL) {
    const email = ownerEmail(notification);
    tasks.push(sendEmail(OWNER_EMAIL, email.subject, email.html, email.text));
  }
  if (N8N_WEBHOOK_URL) {
    tasks.push(
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'order.paid',
          order: notification.order,
          details: input,
          product: notification.productName,
          cards: cards.map((card) => ({ code: card.code, url: `${siteUrl}/t/${card.code}` })),
        }),
      }).then((response) => {
        if (!response.ok) throw new Error(`n8n ${response.status}`);
      }),
    );
  }

  if (!tasks.length) {
    console.info('[avisos] Sin RESEND_API_KEY ni N8N_WEBHOOK_URL: no se ha enviado ningún aviso.', ownerEmail(notification).text);
    return;
  }
  const results = await Promise.allSettled(tasks);
  results.forEach((result) => {
    if (result.status === 'rejected') console.error('[avisos]', result.reason);
  });
}
