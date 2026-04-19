import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Endpoint de diagnóstico para validar se o MERCADOPAGO_ACCESS_TOKEN está
// funcionando. Faz uma chamada autenticada direto na API do MP (GET /users/me).
export async function GET() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "MERCADOPAGO_ACCESS_TOKEN não definido." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const payload = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          status: response.status,
          error: payload?.message ?? payload?.error ?? "Falha na autenticação.",
          mp: payload,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      environment: token.startsWith("TEST-") ? "test" : "production",
      user: {
        id: payload.id,
        nickname: payload.nickname,
        email: payload.email,
        site_id: payload.site_id,
        country_id: payload.country_id,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Erro desconhecido.",
      },
      { status: 500 }
    );
  }
}
