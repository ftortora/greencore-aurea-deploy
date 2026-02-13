import nodemailer from "nodemailer";
import config from "../config/config.js";
import logger from "./logger.js";

let transporter = null;

// Setup transporter only if enabled + required fields
if (
  config.email.enabled &&
  config.email.host &&
  config.email.user &&
  config.email.pass
) {
  transporter = nodemailer.createTransport({
    host: config.email.host, // e.g. smtp.office365.com
    port: config.email.port || 587, // 587 per STARTTLS
    secure: !!config.email.secure, // false su 587
    auth: {
      user: config.email.user,
      pass: config.email.pass, // ⚠️ per Outlook spesso serve APP PASSWORD
    },
    requireTLS: true,
    tls: {
      // meglio evitare rejectUnauthorized:false in prod
      rejectUnauthorized: false,
      servername: config.email.host,
    },
  });

  transporter.verify((err) => {
    if (err) logger.warn("📧 SMTP verify failed", { error: err.message });
    else logger.info("📧 SMTP ready");
  });
}

function baseTemplate(title, content) {
  return `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0f1115;font-family:'Segoe UI',Tahoma,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:20px;">
<div style="background:linear-gradient(135deg,#065f46,#10b981);padding:30px;border-radius:16px 16px 0 0;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:26px;">🌱 Green Core AUREA</h1>
<p style="color:#a7f3d0;margin:5px 0 0;font-size:13px;letter-spacing:2px;">ENERGY MANAGEMENT PLATFORM</p></div>
<div style="background:#1a1d23;padding:30px;border-radius:0 0 16px 16px;border:1px solid #2d3039;border-top:none;">${content}</div>
<div style="text-align:center;padding:20px;color:#6b7280;font-size:11px;"><p>&copy; ${new Date().getFullYear()} Green Core AUREA — Powered by renewable energy data</p></div>
</div></body></html>`;
}

async function sendEmail({ to, subject, html, text }) {
  // DEV MODE fallback
  if (!config.email.enabled || !transporter) {
    logger.info(`📧 [DEV] Email → ${to} | ${subject}`);
    return { success: true, dev: true };
  }

  try {
    const info = await transporter.sendMail({
      from: config.email.from || config.email.user,
      to,
      subject,
      html,
      text,
    });

    logger.info(`📧 Email sent → ${to}`, { messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Tip: Outlook 535 => credenziali/app password
    logger.error(`📧 Email failed → ${to}`, {
      error: error.message,
      hint: error?.message?.includes("535")
        ? "Outlook/Office365: verifica user/pass o usa App Password se 2FA attivo"
        : undefined,
    });
    return { success: false, error: error.message };
  }
}

// ── Welcome Email ──
export async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: "🌱 Benvenuto su Green Core AUREA!",
    html: baseTemplate(
      "Benvenuto",
      `
      <h2 style="color:#10b981;margin-top:0;">Benvenuto, ${user.name}! 🎉</h2>
      <p style="color:#d1d5db;font-size:15px;line-height:1.7;">
        Grazie per esserti registrato su <strong style="color:#10b981;">Green Core AUREA</strong>.
        Inizia subito a monitorare i tuoi consumi energetici e il tuo impatto ambientale.
      </p>
      <div style="background:#111318;border-left:4px solid #10b981;padding:15px;margin:20px 0;border-radius:0 8px 8px 0;">
        <p style="margin:5px 0;color:#d1d5db;">👤 <strong>${user.name}</strong></p>
        <p style="margin:5px 0;color:#9ca3af;">📧 ${user.email}</p>
      </div>
      <div style="text-align:center;margin:25px 0;">
        <a href="${config.frontendUrl}/dashboard"
           style="display:inline-block;background:linear-gradient(135deg,#065f46,#10b981);color:#fff;padding:12px 30px;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
          Vai alla Dashboard
        </a>
      </div>
      `
    ),
  });
}

// ── Password Reset Email ──
export async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;
  return sendEmail({
    to: user.email,
    subject: "🔐 Reset Password - Green Core AUREA",
    html: baseTemplate(
      "Reset Password",
      `
      <h2 style="color:#10b981;margin-top:0;">Reset Password 🔐</h2>
      <p style="color:#d1d5db;font-size:15px;line-height:1.7;">
        Hai richiesto il reset della password per il tuo account <strong style="color:#10b981;">${user.name}</strong>.
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${resetUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#065f46,#10b981);color:#fff;padding:14px 36px;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">
          Reimposta Password
        </a>
      </div>
      <p style="color:#9ca3af;font-size:13px;">
        Il link scade tra <strong>1 ora</strong>. Se non hai richiesto il reset, ignora questa email.
      </p>
      <div style="background:#1c1f26;border:1px solid #374151;padding:12px;margin:15px 0;border-radius:8px;">
        <p style="margin:0;color:#6b7280;font-size:11px;word-break:break-all;">Link diretto: ${resetUrl}</p>
      </div>
      `
    ),
    text: `Reset password: ${resetUrl}`,
  });
}

// ── Username Recovery Email ──
export async function sendUsernameRecoveryEmail(user) {
  return sendEmail({
    to: user.email,
    subject: "👤 Recupero Username - Green Core AUREA",
    html: baseTemplate(
      "Recupero Username",
      `
      <h2 style="color:#10b981;margin-top:0;">Recupero Username 👤</h2>
      <p style="color:#d1d5db;font-size:15px;">Ecco le credenziali associate alla tua email:</p>
      <div style="background:#111318;border-left:4px solid #10b981;padding:20px;margin:20px 0;border-radius:0 8px 8px 0;text-align:center;">
        <p style="margin:0;color:#10b981;font-size:22px;font-weight:bold;">${user.username}</p>
      </div>
      <div style="text-align:center;margin:25px 0;">
        <a href="${config.frontendUrl}/login"
           style="display:inline-block;background:linear-gradient(135deg,#065f46,#10b981);color:#fff;padding:12px 30px;text-decoration:none;border-radius:8px;font-size:15px;">
          Vai al Login
        </a>
      </div>
      `
    ),
  });
}

// ── Account Locked Email ──
export async function sendAccountLockedEmail(user) {
  return sendEmail({
    to: user.email,
    subject: "⚠️ Account Bloccato - Green Core AUREA",
    html: baseTemplate(
      "Account Bloccato",
      `
      <h2 style="color:#ef4444;margin-top:0;">⚠️ Account Bloccato</h2>
      <p style="color:#d1d5db;font-size:15px;">
        Il tuo account <strong>${user.name}</strong> è stato temporaneamente bloccato a causa di troppi tentativi di accesso falliti.
      </p>
      <p style="color:#9ca3af;">Sarà sbloccato automaticamente dopo <strong style="color:#fbbf24;">30 minuti</strong>.</p>
      <p style="color:#6b7280;font-size:13px;margin-top:20px;">
        Se non sei stato tu, ti consigliamo di cambiare la password appena possibile.
      </p>
      `
    ),
  });
}

// ── Newsletter Welcome Email ──
export async function sendNewsletterWelcome(subscriber) {
  const unsubUrl = `${config.frontendUrl}/unsubscribe/${subscriber.unsubscribeToken}`;
  return sendEmail({
    to: subscriber.email,
    subject: "📬 Iscrizione Newsletter - Green Core AUREA",
    html: baseTemplate(
      "Newsletter",
      `
      <h2 style="color:#10b981;margin-top:0;">Iscrizione Confermata! 📬</h2>
      <p style="color:#d1d5db;font-size:15px;line-height:1.7;">
        ${
          subscriber.name
            ? `Ciao <strong>${subscriber.name}</strong>, sei`
            : "Sei"
        } ora iscritto/a alla newsletter di
        <strong style="color:#10b981;">Green Core AUREA</strong>.
      </p>
      <p style="color:#9ca3af;">
        Riceverai aggiornamenti su energia sostenibile, consigli per il risparmio energetico e novità della piattaforma.
      </p>
      <hr style="border:none;border-top:1px solid #2d3039;margin:25px 0;">
      <p style="color:#6b7280;font-size:11px;text-align:center;">
        <a href="${unsubUrl}" style="color:#6b7280;">Disiscriviti</a>
      </p>
      `
    ),
  });
}

// ── Newsletter Broadcast Email ──
export async function sendNewsletterEmail(subscriber, subject, content) {
  const unsubUrl = `${config.frontendUrl}/unsubscribe/${subscriber.unsubscribeToken}`;
  return sendEmail({
    to: subscriber.email,
    subject: `🌱 ${subject}`,
    html: baseTemplate(
      subject,
      `
      ${
        subscriber.name
          ? `<p style="color:#9ca3af;font-size:14px;">Ciao ${subscriber.name},</p>`
          : ""
      }
      <div style="color:#d1d5db;font-size:15px;line-height:1.7;">${content}</div>
      <hr style="border:none;border-top:1px solid #2d3039;margin:30px 0;">
      <p style="color:#6b7280;font-size:11px;text-align:center;">
        <a href="${unsubUrl}" style="color:#6b7280;">Disiscriviti dalla newsletter</a>
      </p>
      `
    ),
    text: content.replace(/<[^>]+>/g, ""),
  });
}

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendUsernameRecoveryEmail,
  sendAccountLockedEmail,
  sendNewsletterWelcome,
  sendNewsletterEmail,
};
