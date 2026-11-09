import nodemailer from "nodemailer";
import type { BookedTicket } from "../interface/types.js";
// Samma formatfunktioner som på sidorna (T140), så att datum och priser ser likadana ut
import { langtDatum } from "../../frontend/src/utils/date.ts";
import {
  formatBiljettyper,
  formatPlatser,
  formatPris,
} from "../../frontend/src/utils/format.ts";

/* Det mejlet behöver veta om en bokning */
export interface ConfirmationEmailData {
  to: string; // mottagare: gäst = adressen från bokningsmodalen, inloggad = kontots adress
  bookingNumber: string;
  movieTitle: string;
  date: string; // "2026-11-13"
  time: string; // "18:30"
  auditoriumName: string;
  tickets: BookedTicket[];
  totalPrice: number;
  isMember: boolean; // true = bokad som inloggad
  cancelUrl?: string; // avbokningslänk för gäster. Byggs i P17.2, tills dess utelämnas den
}

const PAY_ON_SITE = "Betalning sker på plats. Ange bokningsnumret i kassan.";
const CANCEL_RULE = "Du kan avboka fram till 2 timmar före visningen.";

// Länken till inloggningen i mejlet. APP_URL i .env, annars den lokala sidan.
function loginUrl(): string {
  const base = (process.env.APP_URL || "http://localhost:5173").replace(/\/+$/, "");
  return `${base}/login`;
}

// Filmtitlar kan innehålla tecken som & och <, så allt som skrivs in i HTML görs ofarligt
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Bygger ämne, textversion och HTML-version. Skickar inget, så den går att testa själv. */
export function buildConfirmationEmail(data: ConfirmationEmailData) {
  const platser = formatPlatser(data.tickets);
  const biljetter = formatBiljettyper(data.tickets.map((t) => t.ticketType));
  const datum = langtDatum(data.date);
  const totalpris = formatPris(data.totalPrice);

  const subject = `Din bokning hos Filmvisarna – bokningsnummer ${data.bookingNumber}`;

  // Sista raden: medlemmar får länk till inloggningen, gäster får avbokningslänken när den finns
  const extra = data.isMember
    ? {
        lead: "Logga in för att se eller avboka din bokning på Mina sidor",
        url: loginUrl(),
      }
    : data.cancelUrl
      ? { lead: "Avboka din bokning", url: data.cancelUrl }
      : null;

  const text = [
    "Tack för din bokning hos Filmvisarna!",
    "",
    `Bokningsnummer: ${data.bookingNumber}`,
    PAY_ON_SITE,
    "",
    `Film: ${data.movieTitle}`,
    `Datum: ${datum}`,
    `Tid: ${data.time}`,
    `Salong: ${data.auditoriumName}`,
    `Platser: ${platser.join("; ")}`,
    `Biljetter: ${biljetter}`,
    `Totalpris: ${totalpris}`,
    "",
    `Avbokning: ${CANCEL_RULE}`,
    ...(extra ? [`${extra.lead}: ${extra.url}`] : []),
  ].join("\n");

  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#555;">${label}</td>` +
    `<td style="padding:4px 0;"><strong>${value}</strong></td></tr>`;

  const html = [
    '<!doctype html><html lang="sv"><body style="margin:0;padding:16px;">',
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:560px;line-height:1.5;">',
    '<h1 style="font-size:20px;margin:0 0 12px;">Tack för din bokning hos Filmvisarna!</h1>',
    `<p style="font-size:18px;margin:0 0 4px;">Bokningsnummer: <strong>${escapeHtml(data.bookingNumber)}</strong></p>`,
    `<p style="margin:0 0 16px;">${PAY_ON_SITE}</p>`,
    '<table style="border-collapse:collapse;margin-bottom:16px;">',
    row("Film", escapeHtml(data.movieTitle)),
    row("Datum", escapeHtml(datum)),
    row("Tid", escapeHtml(data.time)),
    row("Salong", escapeHtml(data.auditoriumName)),
    row("Platser", platser.map(escapeHtml).join("<br>")),
    row("Biljetter", escapeHtml(biljetter)),
    row("Totalpris", escapeHtml(totalpris)),
    "</table>",
    `<p style="margin:0 0 8px;"><strong>Avbokning:</strong> ${CANCEL_RULE}</p>`,
    ...(extra
      ? [
          `<p style="margin:0;">${extra.lead}: <a href="${escapeHtml(extra.url)}">${escapeHtml(extra.url)}</a></p>`,
        ]
      : []),
    "</div></body></html>",
  ].join("\n");

  return { subject, text, html };
}

/* Skickar bekräftelsemejlet med SMTP-uppgifterna i .env.
   Saknas uppgifterna loggas det och inget skickas, så att bokningen fungerar ändå
   för den som inte fyllt i dem. Kastar fel om själva utskicket misslyckas. */
export async function sendConfirmationEmail(
  data: ConfirmationEmailData,
): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    console.warn(
      "E-post är inte inställd (SMTP_HOST, SMTP_USER, SMTP_PASS och MAIL_FROM i .env). Bekräftelsemejl skickas inte.",
    );
    return;
  }

  const port = Number(SMTP_PORT) || 587;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // 465 = krypterat från början, övriga portar använder STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const { subject, text, html } = buildConfirmationEmail(data);

  await transporter.sendMail({
    from: MAIL_FROM,
    to: data.to,
    subject,
    text,
    html,
  });
}
