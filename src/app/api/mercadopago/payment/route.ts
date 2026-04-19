import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getMercadoPagoConfig } from "@/lib/mercadopago";

export const runtime = "nodejs";

const FOUNDER_PRICE = 19;

type BrickPayer = {
  email?: string;
  first_name?: string;
  last_name?: string;
  identification?: {
    type?: string;
    number?: string;
  };
};

type BrickFormData = {
  transaction_amount?: number;
  payment_method_id?: string;
  payment_method_option_id?: string;
  issuer_id?: number | string;
  token?: string;
  installments?: number;
  payer?: BrickPayer;
  transaction_details?: {
    financial_institution?: string;
  };
};

type CreatePaymentRequestBody = {
  selectedPaymentMethod?: string;
  formData?: BrickFormData;
};

function normalizeAbsoluteUrl(value: string) {
  const normalizedInput = /^https?:\/\//i.test(value)
    ? value
    : `http://${value}`;

  try {
    const parsed = new URL(normalizedInput);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

function normalizeBaseUrl(value: string) {
  const absolute = normalizeAbsoluteUrl(value);

  if (!absolute) {
    return null;
  }

  const parsed = new URL(absolute);
  return `${parsed.protocol}//${parsed.host}`;
}

function getBaseUrl(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (appUrl) {
    const normalized = normalizeBaseUrl(appUrl);

    if (normalized) {
      return normalized;
    }
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    const normalized = normalizeBaseUrl(`${forwardedProto}://${forwardedHost}`);

    if (normalized) {
      return normalized;
    }
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function isLocalhostUrl(baseUrl: string) {
  const { hostname } = new URL(baseUrl);
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".local")
  );
}

const PLACEHOLDER_HOSTS = new Set([
  "seu-dominio.com",
  "seudominio.com",
  "example.com",
  "example.org",
  "localhost",
  "127.0.0.1",
]);

function resolveNotificationUrl(rawEnvWebhookUrl: string | undefined, baseUrl: string) {
  const envWebhook = rawEnvWebhookUrl?.trim();

  if (envWebhook) {
    const normalized = normalizeAbsoluteUrl(envWebhook);
    if (!normalized) return null;

    try {
      const parsed = new URL(normalized);
      // MP exige HTTPS e um domínio real e acessível.
      if (parsed.protocol !== "https:") return null;
      if (PLACEHOLDER_HOSTS.has(parsed.hostname)) return null;
      return parsed.toString();
    } catch {
      return null;
    }
  }

  if (isLocalhostUrl(baseUrl)) return null;
  return `${baseUrl}/api/mercadopago/webhook`;
}

// O Brick às vezes devolve identification.type como null ou vazio.
// Normalizamos para CPF (default BR) e removemos máscara do número.
function normalizeIdentification(identification?: BrickPayer["identification"]) {
  if (!identification) {
    return undefined;
  }

  const number = identification.number?.toString().replace(/\D/g, "");
  if (!number) {
    return undefined;
  }

  const rawType = identification.type?.toString().trim().toUpperCase();
  const type = rawType && rawType.length > 0 ? rawType : "CPF";

  return { type, number };
}

function extractMpErrorDetails(error: unknown) {
  if (error && typeof error === "object") {
    const candidate = error as {
      message?: string;
      cause?: Array<{ code?: string | number; description?: string }>;
      error?: string;
      status?: number;
    };

    const causeMessage = Array.isArray(candidate.cause)
      ? candidate.cause
          .map((item) => item?.description ?? item?.code)
          .filter(Boolean)
          .join("; ")
      : undefined;

    const rawMessage =
      candidate.message ||
      candidate.error ||
      causeMessage ||
      "Erro desconhecido do Mercado Pago.";

    // `internal_error` é um erro genérico do MP. A causa mais comum em
    // desenvolvimento é `notification_url` inválido/placeholder ou credenciais
    // de teste + dados de pagador inválidos.
    const message =
      rawMessage === "internal_error"
        ? "Mercado Pago retornou internal_error. Verifique: 1) MERCADOPAGO_WEBHOOK_URL deve ser HTTPS em um domínio público (ou vazio em localhost); 2) dados do cartão/pagador; 3) se o access token é válido."
        : rawMessage;

    return {
      message,
      status: candidate.status,
      rawMessage,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, status: undefined, rawMessage: error.message };
  }

  return { message: "Erro desconhecido.", status: undefined, rawMessage: undefined };
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = stripUndefined(value as Record<string, unknown>);
      if (Object.keys(nested).length > 0) {
        (result as Record<string, unknown>)[key] = nested;
      }
      continue;
    }
    (result as Record<string, unknown>)[key] = value;
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePaymentRequestBody;
    const formData = body.formData ?? {};

    const paymentMethodId = formData.payment_method_id?.trim();
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "payment_method_id é obrigatório." },
        { status: 400 }
      );
    }

    const amount = Number(formData.transaction_amount) || FOUNDER_PRICE;

    const identification = normalizeIdentification(
      formData.payer?.identification
    );

    const payer = formData.payer
      ? stripUndefined({
          email: formData.payer.email?.trim(),
          first_name: formData.payer.first_name?.trim() || undefined,
          last_name: formData.payer.last_name?.trim() || undefined,
          identification,
        })
      : undefined;

    if (!payer?.email) {
      return NextResponse.json(
        { error: "Informe o e-mail do pagador para prosseguir." },
        { status: 400 }
      );
    }

    const paymentClient = new Payment(getMercadoPagoConfig());
    const baseUrl = getBaseUrl(request);

    const notificationUrl = resolveNotificationUrl(
      process.env.MERCADOPAGO_WEBHOOK_URL,
      baseUrl
    );

    const isCardPayment = Boolean(formData.token);
    const issuerId =
      formData.issuer_id !== undefined && formData.issuer_id !== null
        ? Number(formData.issuer_id)
        : undefined;

    const paymentBody = stripUndefined({
      transaction_amount: amount,
      payment_method_id: paymentMethodId,
      description: "BioNutri - Oferta Fundador",
      external_reference: `founder-${Date.now()}`,
      payer,
      token: isCardPayment ? formData.token : undefined,
      installments: isCardPayment ? formData.installments ?? 1 : undefined,
      issuer_id: isCardPayment && issuerId ? issuerId : undefined,
      transaction_details: formData.transaction_details,
      notification_url: notificationUrl ?? undefined,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[MercadoPago] Criando pagamento:",
        JSON.stringify(
          { ...paymentBody, token: isCardPayment ? "[REDACTED]" : undefined },
          null,
          2
        )
      );
    }

    const payment = await paymentClient.create({ body: paymentBody });

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail,
      paymentMethodId: payment.payment_method_id,
      paymentTypeId: payment.payment_type_id,
      externalReference: payment.external_reference,
      qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64:
        payment.point_of_interaction?.transaction_data?.qr_code_base64,
      ticketUrl: payment.point_of_interaction?.transaction_data?.ticket_url,
    });
  } catch (error) {
    const { message, status, rawMessage } = extractMpErrorDetails(error);
    console.error("[MercadoPago] Falha ao criar pagamento:", {
      message,
      status,
      rawMessage,
    });
    console.error(
      "[MercadoPago] Erro bruto:",
      JSON.stringify(error, Object.getOwnPropertyNames(error ?? {}), 2)
    );

    return NextResponse.json(
      {
        error: "Não foi possível processar o pagamento agora.",
        details:
          process.env.NODE_ENV === "development" || status === 400
            ? message
            : undefined,
      },
      { status: status && status >= 400 && status < 500 ? status : 500 }
    );
  }
}
