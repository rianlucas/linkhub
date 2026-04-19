"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  ExternalLink,
  LoaderCircle,
} from "lucide-react";

type PaymentStatusResponse = {
  id?: number;
  status?: string;
  statusDetail?: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  amount?: number;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  error?: string;
};

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 180; // ~12min

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={<PendingFallback />}>
      <PendingContent />
    </Suspense>
  );
}

function PendingFallback() {
  return (
    <main className="min-h-screen bg-[#F2F2F2] px-6 py-20 md:px-20">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-[#D9D2C8] bg-white p-8 shadow-sm md:p-10">
        <div className="flex items-center gap-3 text-[#4A433D]">
          <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.8} />
          Carregando pagamento...
        </div>
      </section>
    </main>
  );
}

function PendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  const [data, setData] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const missingPaymentId = !paymentId;

  const fetchStatus = useCallback(async () => {
    if (!paymentId) return null;

    const response = await fetch(
      `/api/mercadopago/payment/${encodeURIComponent(paymentId)}`,
      { cache: "no-store" }
    );

    const payload = (await response.json()) as PaymentStatusResponse;

    if (!response.ok) {
      throw new Error(payload.error ?? "Erro ao consultar pagamento.");
    }

    return payload;
  }, [paymentId]);

  useEffect(() => {
    if (!paymentId) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      try {
        const payload = await fetchStatus();
        if (cancelled || !payload) return;

        setData(payload);
        setError(null);

        if (payload.status === "approved") {
          router.replace(
            `/checkout/success?payment_id=${encodeURIComponent(paymentId)}`
          );
          return;
        }

        if (
          payload.status === "rejected" ||
          payload.status === "cancelled" ||
          payload.status === "refunded" ||
          payload.status === "charged_back"
        ) {
          const reason = payload.statusDetail
            ? `&status_detail=${encodeURIComponent(payload.statusDetail)}`
            : "";
          router.replace(
            `/checkout/failure?payment_id=${encodeURIComponent(paymentId)}${reason}`
          );
          return;
        }

        setAttempts((prev) => {
          const next = prev + 1;
          if (next < MAX_POLL_ATTEMPTS) {
            timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
          }
          return next;
        });
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Erro ao consultar pagamento."
        );
        timeoutId = setTimeout(tick, POLL_INTERVAL_MS * 2);
      }
    };

    tick();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [paymentId, fetchStatus, router]);

  const isPix = useMemo(
    () =>
      data?.paymentMethodId === "pix" ||
      data?.paymentTypeId === "bank_transfer",
    [data]
  );

  async function handleCopyPix() {
    if (!data?.qrCode) return;
    try {
      await navigator.clipboard.writeText(data.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Não foi possível copiar o código. Copie manualmente.");
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F2F2] px-6 py-20 md:px-20">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-[#D9D2C8] bg-white p-8 shadow-sm md:p-10">
        <p className="font-[var(--font-dm-mono)] text-xs uppercase tracking-[0.2em] text-[#7D5A3C]">
          Pagamento em análise
        </p>
        <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-semibold tracking-tight text-[#0D0D0D]">
          {isPix
            ? "Quase lá! Finalize o PIX"
            : "Estamos confirmando seu pagamento"}
        </h1>
        <p className="mt-4 text-lg text-[#4A433D]">
          {isPix
            ? "Abra o app do seu banco, escaneie o QR Code ou cole o PIX copia-e-cola. Essa página será atualizada automaticamente quando o pagamento for confirmado."
            : "Aguarde alguns instantes enquanto a operadora confirma a transação. Esta página será atualizada automaticamente."}
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl border border-[#D4CFC7] bg-[#FAFAF8] px-4 py-2 text-sm text-[#4A433D] transition hover:bg-[#F2EEE8]"
        >
          ← Voltar para a landing
        </Link>

        {missingPaymentId ? (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#E1B6B6] bg-[#FFF3F3] px-4 py-4 text-sm text-[#8A3030]">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
            <span>
              Não recebemos o identificador do pagamento. Volte para o checkout
              e tente novamente.
            </span>
          </div>
        ) : !data ? (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#E8E3DB] bg-[#FAFAF8] px-5 py-5 text-[#4A433D]">
            <LoaderCircle
              className="h-5 w-5 animate-spin"
              strokeWidth={1.8}
            />
            Carregando informações do pagamento...
          </div>
        ) : isPix && data.qrCodeBase64 ? (
          <div className="mt-8 grid gap-6 rounded-2xl border border-[#E8E3DB] bg-[#FAFAF8] p-6 md:grid-cols-[220px_1fr]">
            <div className="flex items-center justify-center rounded-xl border border-[#E8E3DB] bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${data.qrCodeBase64}`}
                alt="QR Code PIX"
                className="h-48 w-48"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm text-[#4A7C59]">
                <Clock className="h-4 w-4" strokeWidth={1.8} />
                Aguardando pagamento...
              </div>

              <div>
                <label className="font-[var(--font-dm-mono)] text-xs uppercase tracking-[0.15em] text-[#7A756C]">
                  PIX copia e cola
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    readOnly
                    value={data.qrCode ?? ""}
                    className="w-full rounded-lg border border-[#E8E3DB] bg-white px-3 py-2 font-[var(--font-dm-mono)] text-xs text-[#0D0D0D]"
                    onFocus={(event) => event.currentTarget.select()}
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0D0D0D] px-4 py-2 text-sm text-white transition hover:bg-[#1a1a1a]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" strokeWidth={2} /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" strokeWidth={1.8} /> Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>

              {data.ticketUrl ? (
                <a
                  href={data.ticketUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#7D5A3C] hover:underline"
                >
                  Abrir comprovante no Mercado Pago
                  <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#E8E3DB] bg-[#FAFAF8] px-5 py-5 text-[#4A433D]">
            <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.8} />
            Verificando status junto ao Mercado Pago... ({attempts + 1})
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
