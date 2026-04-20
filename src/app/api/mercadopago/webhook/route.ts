import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import mpClient, { verifyMercadoPagoSignature } from "@/lib/mercadopago";
import { handleMercadoPagoPayment } from "@/server/mercadopago/handle-payment";

export const runtime = "nodejs";

type WebhookPayload = {
  type?: string;
  action?: string;
  data?: { id?: string | number };
};

export async function POST(request: Request) {
  try {
    const signatureError = verifyMercadoPagoSignature(request);
    if (signatureError) return signatureError;

    const body = (await request.json()) as WebhookPayload;
    const { type, data } = body;

    switch (type) {
      case "payment": {
        if (!data?.id) break;

        const payment = new Payment(mpClient);
        const paymentData = await payment.get({ id: String(data.id) });

        if (
          paymentData.status === "approved" ||
          paymentData.date_approved !== null
        ) {
          await handleMercadoPagoPayment(paymentData);
        }
        break;
      }
      default:
        console.log("[MercadoPago] Evento não tratado:", type);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[MercadoPago] Falha no webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
