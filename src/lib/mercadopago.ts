import crypto from "crypto";
import { MercadoPagoConfig } from "mercadopago";
import { NextResponse } from "next/server";

const accessToken =
  process.env.MERCADOPAGO_ACCESS_TOKEN ??
  process.env.MERCADO_PAGO_ACCESS_TOKEN ??
  "";

if (!accessToken) {
  // Logamos apenas uma vez no boot para facilitar o debug de ambiente.
  console.warn(
    "[MercadoPago] MERCADOPAGO_ACCESS_TOKEN não definido. As rotas de pagamento irão falhar."
  );
}

const mpClient = new MercadoPagoConfig({ accessToken });

export default mpClient;

// Verificação de assinatura do webhook — protege a rota de acessos maliciosos.
// Referência: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
//
// Retorna `null` quando a requisição é válida (ou quando a checagem foi pulada
// intencionalmente em dev); retorna um `NextResponse` de erro caso contrário.
export function verifyMercadoPagoSignature(request: Request) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim() ?? "";
  const isDev = process.env.NODE_ENV !== "production";

  // Em desenvolvimento, se o secret não estiver configurado, pulamos a
  // verificação para facilitar testes locais. Em produção, isso é obrigatório.
  if (!secret) {
    if (isDev) {
      console.warn(
        "[MercadoPago] MERCADOPAGO_WEBHOOK_SECRET não configurado — pulando verificação de assinatura (apenas em dev)."
      );
      return null;
    }
    return NextResponse.json(
      { error: "MERCADOPAGO_WEBHOOK_SECRET não definido." },
      { status: 500 }
    );
  }

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  if (!xSignature || !xRequestId) {
    return NextResponse.json(
      { error: "Missing x-signature or x-request-id header" },
      { status: 400 }
    );
  }

  let ts = "";
  let v1 = "";

  xSignature.split(",").forEach((part) => {
    const [rawKey, rawValue] = part.split("=");
    const key = rawKey?.trim();
    const value = rawValue?.trim();
    if (!key || !value) return;
    if (key === "ts") ts = value;
    else if (key === "v1") v1 = value;
  });

  if (!ts || !v1) {
    return NextResponse.json(
      { error: "Invalid x-signature header format" },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id");

  let manifest = "";
  if (dataId) manifest += `id:${dataId};`;
  manifest += `request-id:${xRequestId};`;
  manifest += `ts:${ts};`;

  const generatedHash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  if (generatedHash !== v1) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  return null;
}
