import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getMercadoPagoConfig } from "@/lib/mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Id do pagamento não informado." },
        { status: 400 }
      );
    }

    const paymentClient = new Payment(getMercadoPagoConfig());
    const payment = await paymentClient.get({ id });

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail,
      paymentMethodId: payment.payment_method_id,
      paymentTypeId: payment.payment_type_id,
      amount: payment.transaction_amount,
      qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64:
        payment.point_of_interaction?.transaction_data?.qr_code_base64,
      ticketUrl: payment.point_of_interaction?.transaction_data?.ticket_url,
    });
  } catch (error) {
    console.error("[MercadoPago] Falha ao consultar pagamento:", error);

    return NextResponse.json(
      { error: "Não foi possível consultar o pagamento." },
      { status: 500 }
    );
  }
}
