import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getMercadoPagoConfig } from "@/lib/mercadopago";

export const runtime = "nodejs";

type CreatePaymentRequestBody = {
  formData?: {
    transaction_amount?: number;
    payment_method_id?: string;
    payer?: {
      email?: string;
      first_name?: string;
      last_name?: string;
      identification?: {
        type?: string;
        number?: string;
      };
    };
    token?: string;
    installments?: number;
    issuer_id?: number;
    transaction_details?: {
      financial_institution?: string;
    };
  };
};

const FOUNDER_PRICE = 19;

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
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePaymentRequestBody;
    const paymentClient = new Payment(getMercadoPagoConfig());
    const baseUrl = getBaseUrl(request);

    const webhookUrl = process.env.MERCADOPAGO_WEBHOOK_URL?.trim();
    const notificationUrl = webhookUrl
      ? normalizeAbsoluteUrl(webhookUrl)
      : isLocalhostUrl(baseUrl)
        ? null
        : `${baseUrl}/api/mercadopago/webhook`;

    const payment = await paymentClient.create({
      body: {
        transaction_amount: FOUNDER_PRICE,
        payment_method_id: body.formData?.payment_method_id ?? "pix",
        payer: body.formData?.payer,
        token: body.formData?.token,
        installments: body.formData?.installments,
        issuer_id: body.formData?.issuer_id,
        transaction_details: body.formData?.transaction_details,
        description: "BioNutri - Oferta Fundador",
        external_reference: `founder-${Date.now()}`,
        ...(notificationUrl ? { notification_url: notificationUrl } : {}),
      },
    });

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail,
      qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
      ticketUrl: payment.point_of_interaction?.transaction_data?.ticket_url,
    });
  } catch (error) {
    console.error("Erro ao criar pagamento Pix no Mercado Pago:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Nao foi possivel processar o pagamento Pix agora.";

    return NextResponse.json(
      {
        error: "Nao foi possivel processar o pagamento Pix agora.",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}
