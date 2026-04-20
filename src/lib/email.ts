import "server-only";

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() ?? "";

// `EMAIL_FROM` aceita os formatos "Nome <email@dominio>" ou "email@dominio".
// Em dev/sem config, usamos o sender público da Resend (`onboarding@resend.dev`),
// que só funciona enviando para o email dono da conta.
const EMAIL_FROM =
  process.env.EMAIL_FROM?.trim() ?? "BioNutri <onboarding@resend.dev>";

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  if (!RESEND_API_KEY) {
    console.warn(
      "[Email] RESEND_API_KEY não configurado — envios de email estão desabilitados."
    );
    return null;
  }
  if (!cachedClient) cachedClient = new Resend(RESEND_API_KEY);
  return cachedClient;
}

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

async function send({ to, subject, html, text }: SendArgs) {
  const client = getClient();
  if (!client) return { skipped: true as const };

  const { data, error } = await client.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[Email] Falha ao enviar via Resend:", error);
    throw error;
  }

  return { skipped: false as const, id: data?.id };
}

const BRAND_COLOR = "#7D5A3C";
const TEXT_COLOR = "#1F1A15";
const MUTED_COLOR = "#6B635C";
const BG_COLOR = "#F7F3EC";

function layout(opts: { heading: string; bodyHtml: string }) {
  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:32px 16px;background:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${TEXT_COLOR};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E4DED4;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:28px 32px;border-bottom:1px solid #EFE9DE;">
          <div style="font-size:12px;letter-spacing:0.18em;color:${BRAND_COLOR};text-transform:uppercase;">BioNutri</div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${TEXT_COLOR};">${opts.heading}</h1>
          <div style="font-size:16px;line-height:1.6;color:${TEXT_COLOR};">${opts.bodyHtml}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 28px;border-top:1px solid #EFE9DE;color:${MUTED_COLOR};font-size:12px;">
          Você recebeu este email porque se cadastrou no site da BioNutri.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendEarlyAccessWelcomeEmail(to: string) {
  const subject = "Bem-vindo ao Acesso Antecipado BioNutri";
  const html = layout({
    heading: "Seu lugar no Acesso Antecipado está reservado",
    bodyHtml: `
      <p>Obrigado por querer fazer parte desde o início. A BioNutri foi pensada pra nutricionistas e personal trainers que levam o negócio a sério — e a sua escolha de entrar agora ajuda a moldar o produto.</p>
      <p><strong>Próximo passo:</strong> em breve você vai receber outro email com as informações de pagamento para garantir sua vaga com <strong>50% OFF vitalício</strong>.</p>
      <p>Enquanto isso, fica tranquilo: nada é cobrado sem sua confirmação.</p>
      <p style="margin-top:24px;">Qualquer dúvida, é só responder este email.</p>
      <p style="margin-top:24px;color:${MUTED_COLOR};">Até já,<br/>Time BioNutri</p>
    `,
  });
  const text = [
    "Seu lugar no Acesso Antecipado está reservado.",
    "",
    "Obrigado por querer fazer parte desde o início.",
    "Em breve você receberá outro email com as informações de pagamento para garantir sua vaga com 50% OFF vitalício.",
    "",
    "Nada é cobrado sem sua confirmação.",
    "",
    "Qualquer dúvida, é só responder este email.",
    "Time BioNutri",
  ].join("\n");

  return send({ to, subject, html, text });
}

export async function sendWaitlistWelcomeEmail(to: string) {
  const subject = "Você está na lista de espera do BioNutri";
  const html = layout({
    heading: "Obrigado por entrar na lista de espera",
    bodyHtml: `
      <p>Seu email foi confirmado na lista de espera da BioNutri.</p>
      <p>Assim que tivermos novidades sobre o lançamento, novas funcionalidades ou condições especiais, você fica sabendo em primeira mão.</p>
      <p style="margin-top:24px;color:${MUTED_COLOR};">Até já,<br/>Time BioNutri</p>
    `,
  });
  const text = [
    "Obrigado por entrar na lista de espera da BioNutri.",
    "",
    "Assim que tivermos novidades, você fica sabendo em primeira mão.",
    "",
    "Time BioNutri",
  ].join("\n");

  return send({ to, subject, html, text });
}
