import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { siteConfig } from "@/shared/config";

type Mail = { to: string; subject: string; html: string; text: string };

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  // Yandex Cloud Postbox (SMTP) or any SMTP relay inside Russia — no personal data leaves the country.
  const url = process.env.SMTP_URL;
  transporter = url ? nodemailer.createTransport(url) : null;
  return transporter;
}

export async function sendMail(mail: Mail): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    // Development: print the email instead of sending it.
    console.info(`\n✉  ${mail.subject} → ${mail.to}\n${mail.text}\n`);
    return;
  }
  await transport.sendMail({
    from:
      process.env.MAIL_FROM ?? `${siteConfig.name} <no-reply@${new URL(siteConfig.url).hostname}>`,
    ...mail,
  });
}
