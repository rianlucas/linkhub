import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";

type FailurePageProps = {
  searchParams: Promise<{
    payment_id?: string;
    reason?: string;
    status_detail?: string;
  }>;
};

const REASON_MESSAGES: Record<string, string> = {
  cc_rejected_insufficient_amount: "Saldo ou limite insuficiente no cartão.",
  cc_rejected_bad_filled_card_number: "Número do cartão inválido.",
  cc_rejected_bad_filled_date: "Data de validade inválida.",
  cc_rejected_bad_filled_security_code: "Código de segurança inválido.",
  cc_rejected_bad_filled_other: "Revise os dados do cartão e tente novamente.",
  cc_rejected_high_risk: "Pagamento recusado por análise de risco.",
  cc_rejected_call_for_authorize:
    "Seu banco precisa autorizar este pagamento. Entre em contato com ele.",
  cc_rejected_card_disabled: "Cartão desabilitado. Entre em contato com o banco.",
  cc_rejected_duplicated_payment:
    "Já identificamos um pagamento semelhante. Aguarde alguns minutos antes de tentar novamente.",
  cc_rejected_other_reason: "Pagamento recusado pelo emissor do cartão.",
};

function getHumanReason(reason?: string, fallback?: string) {
  if (reason && REASON_MESSAGES[reason]) {
    return REASON_MESSAGES[reason];
  }

  if (fallback && REASON_MESSAGES[fallback]) {
    return REASON_MESSAGES[fallback];
  }

  if (reason || fallback) {
    return (
      "Não foi possível concluir o pagamento (" + (reason ?? fallback) + ")."
    );
  }

  return "Não foi possível concluir o pagamento.";
}

export default async function CheckoutFailurePage({
  searchParams,
}: FailurePageProps) {
  const { payment_id, reason, status_detail } = await searchParams;
  const message = getHumanReason(reason, status_detail);

  return (
    <main className="min-h-screen bg-[#F2F2F2] px-6 py-20 md:px-20">
      <section className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[#E1B6B6] bg-white p-10 shadow-sm">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#E1B6B6]/20 blur-3xl" />

        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E1B6B6]/20">
            <AlertCircle
              className="h-8 w-8 text-[#8A3030]"
              strokeWidth={1.8}
            />
          </div>

          <p className="mt-6 font-[var(--font-dm-mono)] text-xs uppercase tracking-[0.2em] text-[#8A3030]">
            Pagamento não concluído
          </p>

          <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-semibold tracking-tight text-[#0D0D0D] md:text-5xl">
            Algo não saiu como esperado
          </h1>

          <p className="mt-4 text-lg text-[#4A433D]">{message}</p>

          {payment_id ? (
            <dl className="mt-8 rounded-2xl border border-[#E8E3DB] bg-[#FAFAF8] p-5 text-sm text-[#4A433D]">
              <div className="flex justify-between gap-4">
                <dt className="font-medium">ID do pagamento</dt>
                <dd className="font-[var(--font-dm-mono)] text-[#0D0D0D]">
                  {payment_id}
                </dd>
              </div>
            </dl>
          ) : null}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D5A3C] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#6B4C32]"
            >
              <RefreshCcw className="h-4 w-4" strokeWidth={1.8} />
              Tentar novamente
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4CFC7] bg-white px-6 py-3 text-sm font-medium text-[#0D0D0D] transition hover:bg-[#FAFAF8]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
              Voltar para a home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
