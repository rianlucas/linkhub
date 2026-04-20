import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import mpClient from "@/lib/mercadopago";
import { handleMercadoPagoPayment } from "@/server/mercadopago/handle-payment";

export const runtime = "nodejs";

/**
 * Rota utilitária para simular o webhook do Mercado Pago em desenvolvimento.
 *
 * MODOS de uso:
 *
 * 1) Buscar um pagamento real no MP e processar:
 *    POST /api/mercadopago/webhook/simulate
 *    { "paymentId": "123456789" }
 *
 * 2) Forçar aprovação local (não consulta o MP) — útil quando o MP não aprova
 *    PIX em sandbox:
 *    POST /api/mercadopago/webhook/simulate
 *    { "founderId": "<uuid>", "email": "...", "amount": 19, "fake": true }
 *
 * Esta rota é desabilitada em produção.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Disponível apenas em desenvolvimento." },
      { status: 404 }
    );
  }

  try {
    const body = (await request.json()) as {
      paymentId?: string | number;
      founderId?: string;
      email?: string;
      amount?: number;
      fake?: boolean;
    };

    if (body.fake) {
      await handleMercadoPagoPayment({
        id: Date.now(),
        status: "approved",
        status_detail: "accredited",
        payment_method_id: "pix",
        payment_type_id: "bank_transfer",
        transaction_amount: body.amount ?? 19,
        external_reference: body.founderId,
        date_approved: new Date().toISOString(),
        payer: body.email ? { email: body.email } : undefined,
        metadata: body.founderId ? { founder_id: body.founderId } : {},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      return NextResponse.json({ simulated: true });
    }

    if (!body.paymentId) {
      return NextResponse.json(
        { error: "Informe `paymentId` ou use `fake: true` com `founderId`." },
        { status: 400 }
      );
    }

    const payment = new Payment(mpClient);
    const paymentData = await payment.get({ id: String(body.paymentId) });

    await handleMercadoPagoPayment(paymentData);

    return NextResponse.json({
      simulated: true,
      status: paymentData.status,
      paymentId: paymentData.id,
    });
  } catch (error) {
    console.error("[MercadoPago] Falha ao simular webhook:", error);
    return NextResponse.json(
      {
        error: "Falha ao simular webhook.",
        details: error instanceof Error ? error.message : "Erro desconhecido.",
      },
      { status: 500 }
    );
  }
}
