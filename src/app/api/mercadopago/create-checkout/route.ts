import { NextRequest, NextResponse } from "next/server";
import { Preference } from "mercadopago";
import mpClient from "@/lib/mercadopago";

export const runtime = "nodejs";

const FOUNDER_PRICE = 19;

type CreateCheckoutBody = {
  founderId?: string;
  userEmail?: string;
  firstName?: string;
  lastName?: string;
  cpf?: string;
};

function normalizeBaseUrl(value: string | null | undefined) {
  if (!value) return null;

  const withProtocol = /^https?:\/\//i.test(value)
    ? value
    : `http://${value}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

function isLocalhostOrigin(origin: string) {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local")
    );
  } catch {
    return true;
  }
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === "") continue;
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
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

function extractMpErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return error instanceof Error ? error.message : "Erro desconhecido.";
  }
  const candidate = error as {
    message?: string;
    error?: string;
    status?: number;
    cause?: Array<{ code?: string | number; description?: string }>;
  };
  const causeMessage = Array.isArray(candidate.cause)
    ? candidate.cause
        .map((item) => item?.description ?? item?.code)
        .filter(Boolean)
        .join("; ")
    : "";
  return (
    candidate.message ||
    candidate.error ||
    causeMessage ||
    "Erro desconhecido."
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as CreateCheckoutBody;

    const origin =
      normalizeBaseUrl(req.headers.get("origin")) ??
      normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ??
      "http://localhost:3000";

    const cpfDigits = (body.cpf ?? "").replace(/\D/g, "");

    // Montamos o payer só com os campos que vieram do formulário, sem defaults
    // "mágicos" — o Mercado Pago valida os campos e rejeita strings vazias ou
    // valores suspeitos (ex: email no campo sobrenome).
    const payer = stripUndefined({
      email: body.userEmail?.trim().toLowerCase(),
      first_name: body.firstName?.trim(),
      last_name: body.lastName?.trim(),
      identification:
        cpfDigits.length === 11
          ? { type: "CPF", number: cpfDigits }
          : undefined,
    });

    const preferenceClient = new Preference(mpClient);

    const basePreference = stripUndefined({
      external_reference: body.founderId ?? `founder-${Date.now()}`,
      metadata: body.founderId ? { founderId: body.founderId } : undefined,
      payer,
      items: [
        {
          id: "bionutri-founder",
          title: "BioNutri — Oferta Fundador",
          description: "Acesso vitalício com 50% OFF no plano BioNutri.",
          quantity: 1,
          unit_price: FOUNDER_PRICE,
          currency_id: "BRL",
          category_id: "services",
        },
      ],
      payment_methods: {
        installments: 12,
      },
      back_urls: {
        success: `localhost:3000/?status=sucesso`,
        failure: `localhost:3000/?status=falha`,
        pending: `localhost:3000/api/mercadopago/pending`,
      },
      auto_return: "approved",
    });

    // auto_return exige back_urls HTTPS públicas — o MP rejeita em localhost.
    const preferenceBody = isLocalhostOrigin(origin)
      ? basePreference
      : { ...basePreference, auto_return: "approved" };

    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[MercadoPago] Criando preference:",
        JSON.stringify(preferenceBody, null, 2)
      );
    }

    const createdPreference = await preferenceClient.create({
      body: preferenceBody,
    });

    if (!createdPreference.id || !createdPreference.init_point) {
      throw new Error("Mercado Pago não retornou o preferenceId.");
    }

    return NextResponse.json({
      preferenceId: createdPreference.id,
      initPoint: createdPreference.init_point,
    });
  } catch (error) {
    const message = extractMpErrorMessage(error);
    console.error("[MercadoPago] Falha ao criar preference:", message);
    console.error(
      "[MercadoPago] Erro bruto:",
      JSON.stringify(error, Object.getOwnPropertyNames(error ?? {}), 2)
    );

    return NextResponse.json(
      {
        error: "Não foi possível iniciar o checkout agora.",
        details:
          process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}
