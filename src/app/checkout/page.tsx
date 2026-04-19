"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { AlertCircle, CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";

type PaymentApiResponse = {
  id?: number;
  status?: string;
  statusDetail?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  error?: string;
  details?: string;
};

type BrickSubmitPayload = {
  formData?: Record<string, unknown>;
};

const PUBLIC_KEY =
  process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ??
  process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ??
  "";

if (PUBLIC_KEY) {
  initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
}

export default function CheckoutPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentApiResponse | null>(null);
  const canRenderBrick = useMemo(() => Boolean(PUBLIC_KEY), []);
  const paymentCompleted = Boolean(result?.id);
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => ({
        id: index,
        left: `${(index * 11.7) % 100}%`,
        delay: `${(index % 6) * 0.06}s`,
        duration: `${0.8 + (index % 5) * 0.2}s`,
        rotate: `${(index * 29) % 360}deg`,
      })),
    []
  );

  async function handlePaymentSubmit(paymentData: BrickSubmitPayload) {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/mercadopago/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: paymentData.formData }),
      });

      const data = (await response.json()) as PaymentApiResponse;

      if (!response.ok) {
        throw new Error([data.error, data.details].filter(Boolean).join(" - "));
      }

      setResult(data);
      return data;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nao foi possivel processar seu pagamento Pix."
      );

      throw submitError;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F2F2] px-6 py-20 md:px-20">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-[#D9D2C8] bg-white p-8 shadow-sm md:p-10">
        <p className="font-[var(--font-dm-mono)] text-xs uppercase tracking-[0.2em] text-[#7D5A3C]">
          Checkout Pix
        </p>
        <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-semibold tracking-tight text-[#0D0D0D]">
          Finalize sua oferta fundador
        </h1>
        <p className="mt-4 text-lg text-[#4A433D]">
          Pagamento unico de R$19 para garantir seu plano vitalicio com 50% OFF.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl border border-[#D4CFC7] bg-[#FAFAF8] px-4 py-2 text-sm text-[#4A433D] transition hover:bg-[#F2EEE8]"
        >
          ← Voltar para a landing
        </Link>

        {paymentCompleted ? (
          <div className="relative mt-8 overflow-hidden rounded-2xl border border-[#89C29C]/40 bg-[#89C29C]/10 p-6">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {confettiPieces.map((piece) => (
                <span
                  key={piece.id}
                  className="absolute top-[-10px] h-3 w-2 rounded-sm"
                  style={{
                    left: piece.left,
                    backgroundColor: piece.id % 2 === 0 ? "#4A7C59" : "#D9C2A5",
                    transform: `rotate(${piece.rotate})`,
                    animation: `confetti-fall ${piece.duration} ease-out ${piece.delay} forwards`,
                  }}
                />
              ))}
            </div>

            <div className="relative flex items-start gap-3 text-[#214D2E]">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-base font-semibold">Pagamento realizado com sucesso! 🎉</p>
                <p className="mt-1 text-sm">
                  Recebemos sua confirmacao e seu acesso sera liberado em breve.
                </p>
              </div>
            </div>
          </div>
        ) : !canRenderBrick ? (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#E1B6B6] bg-[#FFF3F3] px-4 py-4 text-sm text-[#8A3030]">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
            <span>
              Public key do Mercado Pago nao configurada. Defina
              NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no .env.
            </span>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-[#E8E3DB] bg-[#FAFAF8] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-[#4A433D]">
              <CheckCircle2 className="h-4 w-4 text-[#4A7C59]" strokeWidth={1.8} />
              Metodos habilitados: Pix e Cartao de credito
            </div>

            <Payment
              initialization={{ amount: 19 }}
              customization={{
                paymentMethods: {
                  bankTransfer: "all",
                  creditCard: "all",
                  maxInstallments: 12,
                  types: { included: ["bank_transfer", "creditCard"] },
                },
              }}
              onSubmit={handlePaymentSubmit}
              onError={(brickError) => {
                console.error("Erro no Payment Brick:", brickError);
                setError("Nao foi possivel carregar o Brick de pagamento.");
              }}
            />

            {submitting ? (
              <div className="mt-4 flex items-center gap-2 text-[#4A433D]">
                <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.8} />
                Processando pagamento Pix...
              </div>
            ) : null}
          </div>
        )}

        {error ? (
          <div className="mt-6 flex items-start gap-2 rounded-2xl border border-[#E1B6B6] bg-[#FFF3F3] px-4 py-4 text-sm text-[#8A3030]">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
            <span>{error}</span>
          </div>
        ) : null}

      </section>
    </main>
  );
}
