import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import mpClient from "@/lib/mercadopago";

export const runtime = "nodejs";

// Lida com o retorno do Checkout Pro para pagamentos pendentes (ex: PIX).
// É chamada quando o cliente clica em "Voltar ao site" após gerar um PIX.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const paymentId = searchParams.get("payment_id");
  const externalReference = searchParams.get("external_reference");

  if (!paymentId || !externalReference) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const payment = new Payment(mpClient);
    const paymentData = await payment.get({ id: paymentId });

    if (
      paymentData.status === "approved" ||
      paymentData.date_approved !== null
    ) {
      return NextResponse.redirect(new URL("/?status=sucesso", request.url));
    }

    return NextResponse.redirect(new URL("/?status=pendente", request.url));
  } catch (error) {
    console.error("[MercadoPago] Falha ao consultar pagamento pendente:", error);
    return NextResponse.redirect(new URL("/?status=pendente", request.url));
  }
}
