import { NextResponse } from "next/server";
import { getMercadoPagoPreferenceClient } from "@/lib/mercadopago";

export const runtime = "nodejs";

const FOUNDER_PRICE = 19;

function normalizeBaseUrl(value: string) {
  const normalizedInput = /^https?:\/\//i.test(value)
    ? value
    : `http://${value}`;

  try {
    const parsed = new URL(normalizedInput);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

function isLocalhostUrl(baseUrl: string) {
  const { hostname } = new URL(baseUrl);
  return hostname === "localhost" || hostname === "127.0.0.1";
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

export async function GET(request: Request) {
  try {
    const preferenceClient = getMercadoPagoPreferenceClient();
    const baseUrl = getBaseUrl(request);

    const successUrl = `${baseUrl}/?checkout=success`;
    const failureUrl = `${baseUrl}/?checkout=failure`;
    const pendingUrl = `${baseUrl}/?checkout=pending`;

    const preferenceBody = {
      items: [
        {
          id: "founder-pre-sale",
          title: "BioNutri - Oferta Fundador",
          quantity: 1,
          currency_id: "BRL",
          unit_price: FOUNDER_PRICE,
        },
      ],
      payment_methods: {
        default_payment_method_id: "pix",
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      redirect_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      external_reference: `founder-${Date.now()}`,
    };

    const preference = await preferenceClient.create({
      body: isLocalhostUrl(baseUrl)
        ? preferenceBody
        : {
            ...preferenceBody,
            auto_return: "approved",
          },
    });

    if (!preference.init_point) {
      return NextResponse.json(
        { error: "Checkout do Mercado Pago indisponivel no momento." },
        { status: 500 }
      );
    }

    return NextResponse.redirect(preference.init_point, { status: 302 });
  } catch (error) {
    console.error("Erro ao redirecionar para checkout Mercado Pago:", error);

    return NextResponse.json(
      { error: "Nao foi possivel abrir o checkout do Mercado Pago agora." },
      { status: 500 }
    );
  }
}
