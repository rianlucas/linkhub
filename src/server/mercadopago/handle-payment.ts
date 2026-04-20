import "server-only";

import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import {
  recordFounderPayment,
  type FounderPaymentStatus,
} from "@/server/founders/store";

function mapStatus(rawStatus?: string): FounderPaymentStatus {
  switch (rawStatus) {
    case "approved":
      return "paid";
    case "refunded":
    case "charged_back":
      return "refunded";
    case "rejected":
    case "cancelled":
      return "failed";
    default:
      return "pending";
  }
}

export async function handleMercadoPagoPayment(paymentData: PaymentResponse) {
  // O MP serializa chaves de `metadata` em snake_case.
  const metadata = (paymentData.metadata ?? {}) as Record<string, unknown>;
  const founderIdFromMetadata =
    typeof metadata.founder_id === "string" ? metadata.founder_id : undefined;

  // `external_reference` é setado pelo create-checkout como o founderId.
  const founderId =
    founderIdFromMetadata ??
    (typeof paymentData.external_reference === "string"
      ? paymentData.external_reference
      : undefined);

  const email =
    paymentData.payer?.email ??
    (typeof metadata.user_email === "string"
      ? (metadata.user_email as string)
      : undefined);

  const status = mapStatus(paymentData.status);

  const updated = await recordFounderPayment({
    founderId,
    email,
    payment: {
      paymentId: String(paymentData.id),
      status,
      amount: paymentData.transaction_amount,
      paymentMethodId: paymentData.payment_method_id,
      paymentTypeId: paymentData.payment_type_id,
      paidAt: paymentData.date_approved ?? undefined,
      rawStatus: paymentData.status,
      statusDetail: paymentData.status_detail,
    },
  });

  if (!updated) {
    console.warn(
      "[MercadoPago] Pagamento recebido mas nenhum founder correspondente foi encontrado.",
      { founderId, email, paymentId: paymentData.id }
    );
    return;
  }

  console.log("[MercadoPago] Founder atualizado pelo webhook:", {
    founderId: updated.id,
    email: updated.email,
    paymentStatus: updated.payment?.status,
    paymentId: updated.payment?.paymentId,
  });

  // TODO(email): enviar confirmação de compra para `updated.email` quando
  // `status === "paid"`.
}
