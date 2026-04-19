import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("[MercadoPago Webhook] Evento recebido:", payload);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[MercadoPago Webhook] Erro ao processar evento:", error);

    return NextResponse.json(
      { error: "Webhook recebido com erro de parse." },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  console.log("[MercadoPago Webhook] Query recebida:", {
    id: url.searchParams.get("id"),
    topic: url.searchParams.get("topic"),
    type: url.searchParams.get("type"),
  });

  return NextResponse.json({ ok: true });
}
