"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Pencil,
} from "lucide-react";

type PaymentApiResponse = {
  id?: number;
  status?: string;
  statusDetail?: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  externalReference?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  error?: string;
  details?: string;
};

type BrickPayer = {
  email?: string;
  first_name?: string;
  last_name?: string;
  identification?: { type?: string; number?: string };
};

type BrickFormData = {
  transaction_amount?: number;
  payment_method_id?: string;
  token?: string;
  installments?: number;
  issuer_id?: number | string;
  payer?: BrickPayer;
  transaction_details?: { financial_institution?: string };
};

type BrickSubmitPayload = {
  selectedPaymentMethod?: string;
  formData?: BrickFormData;
};

type PayerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
};

const FOUNDER_PRICE = 19;

const PUBLIC_KEY =
  process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ??
  process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ??
  "";

if (typeof window !== "undefined" && PUBLIC_KEY) {
  initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isValidCpf(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calc = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * (factor - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calc(digits.slice(0, 9), 10);
  const d2 = calc(digits.slice(0, 10), 11);
  return d1 === Number(digits[9]) && d2 === Number(digits[10]);
}

function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payer, setPayer] = useState<PayerDetails | null>(null);
  const [form, setForm] = useState<PayerDetails>({
    firstName: "",
    lastName: "",
    email: "",
    cpf: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PayerDetails, string>>>({});

  const canRenderBrick = Boolean(PUBLIC_KEY);

  const brickInitialization = useMemo(() => {
    if (!payer) return null;
    return {
      amount: FOUNDER_PRICE,
      payer: {
        firstName: payer.firstName,
        lastName: payer.lastName,
        email: payer.email,
        identification: {
          type: "CPF",
          number: onlyDigits(payer.cpf),
        },
      },
    };
  }, [payer]);

  function validateForm(values: PayerDetails) {
    const errors: Partial<Record<keyof PayerDetails, string>> = {};
    if (!values.firstName.trim()) errors.firstName = "Informe seu nome.";
    if (!values.lastName.trim()) errors.lastName = "Informe seu sobrenome.";
    if (!isValidEmail(values.email)) errors.email = "Email inválido.";
    if (!isValidCpf(values.cpf)) errors.cpf = "CPF inválido.";
    return errors;
  }

  function handlePayerSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setPayer({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      cpf: onlyDigits(form.cpf),
    });
    setError(null);
  }

  async function handlePaymentSubmit(rawPayload: unknown) {
    const paymentData = rawPayload as BrickSubmitPayload;
    if (!payer) {
      setError("Preencha seus dados antes de pagar.");
      throw new Error("payer-missing");
    }

    try {
      setSubmitting(true);
      setError(null);

      if (paymentData.selectedPaymentMethod === "wallet_purchase") {
        return;
      }

      const mergedFormData: BrickFormData = {
        ...paymentData.formData,
        payer: {
          ...paymentData.formData?.payer,
          email: paymentData.formData?.payer?.email ?? payer.email,
          first_name:
            paymentData.formData?.payer?.first_name ?? payer.firstName,
          last_name:
            paymentData.formData?.payer?.last_name ?? payer.lastName,
          identification: {
            type:
              paymentData.formData?.payer?.identification?.type ?? "CPF",
            number:
              paymentData.formData?.payer?.identification?.number ??
              payer.cpf,
          },
        },
      };

      const response = await fetch("/api/mercadopago/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedPaymentMethod: paymentData.selectedPaymentMethod,
          formData: mergedFormData,
        }),
      });

      const data = (await response.json()) as PaymentApiResponse;

      if (!response.ok) {
        throw new Error(
          [data.error, data.details].filter(Boolean).join(" - ") ||
            "Não foi possível processar o pagamento."
        );
      }

      redirectByStatus(data);
    } catch (submitError) {
      setError(
        submitError instanceof Error && submitError.message !== "payer-missing"
          ? submitError.message
          : "Não foi possível processar seu pagamento."
      );
      throw submitError;
    } finally {
      setSubmitting(false);
    }
  }

  function redirectByStatus(data: PaymentApiResponse) {
    const id = data.id ? String(data.id) : "";
    const query = new URLSearchParams();
    if (id) query.set("payment_id", id);

    switch (data.status) {
      case "approved":
        router.push(`/checkout/success?${query.toString()}`);
        return;

      case "rejected":
      case "cancelled":
      case "refunded":
      case "charged_back": {
        if (data.statusDetail) query.set("status_detail", data.statusDetail);
        router.push(`/checkout/failure?${query.toString()}`);
        return;
      }

      case "pending":
      case "in_process":
      case "authorized":
      default:
        router.push(`/checkout/pending?${query.toString()}`);
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F2F2] px-6 py-20 md:px-20">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-[#D9D2C8] bg-white p-8 shadow-sm md:p-10">
        <p className="font-[var(--font-dm-mono)] text-xs uppercase tracking-[0.2em] text-[#7D5A3C]">
          Checkout BioNutri
        </p>
        <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-semibold tracking-tight text-[#0D0D0D]">
          Finalize sua oferta fundador
        </h1>
        <p className="mt-4 text-lg text-[#4A433D]">
          Pagamento único de R${FOUNDER_PRICE} para garantir seu plano vitalício
          com 50% OFF.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl border border-[#D4CFC7] bg-[#FAFAF8] px-4 py-2 text-sm text-[#4A433D] transition hover:bg-[#F2EEE8]"
        >
          ← Voltar para a landing
        </Link>

        {!canRenderBrick ? (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#E1B6B6] bg-[#FFF3F3] px-4 py-4 text-sm text-[#8A3030]">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
            <span>
              Public key do Mercado Pago não configurada. Defina
              <code className="mx-1 rounded bg-white px-1 py-0.5 font-[var(--font-dm-mono)] text-xs">
                NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
              </code>
              no arquivo <code>.env</code>.
            </span>
          </div>
        ) : !payer || !brickInitialization ? (
          <form
            onSubmit={handlePayerSubmit}
            className="mt-8 rounded-2xl border border-[#E8E3DB] bg-[#FAFAF8] p-6"
          >
            <p className="font-[var(--font-dm-mono)] text-xs uppercase tracking-[0.15em] text-[#7A756C]">
              Passo 1 de 2 · Dados do pagador
            </p>
            <h2 className="mt-2 text-xl font-medium text-[#0D0D0D]">
              Quem está comprando?
            </h2>
            <p className="mt-1 text-sm text-[#4A433D]">
              Precisamos desses dados para gerar a cobrança. O CPF é exigido
              pelo Mercado Pago para PIX e cartão.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <PayerInput
                label="Nome"
                value={form.firstName}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, firstName: value }))
                }
                error={formErrors.firstName}
                autoComplete="given-name"
              />
              <PayerInput
                label="Sobrenome"
                value={form.lastName}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, lastName: value }))
                }
                error={formErrors.lastName}
                autoComplete="family-name"
              />
              <PayerInput
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, email: value }))
                }
                error={formErrors.email}
                autoComplete="email"
              />
              <PayerInput
                label="CPF"
                value={formatCpf(form.cpf)}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, cpf: onlyDigits(value) }))
                }
                error={formErrors.cpf}
                inputMode="numeric"
                placeholder="000.000.000-00"
              />
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0D0D0D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1a1a1a]"
            >
              Continuar para pagamento
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8E3DB] bg-[#FAFAF8] px-5 py-4">
              <div className="text-sm text-[#4A433D]">
                <p className="font-medium text-[#0D0D0D]">
                  {payer.firstName} {payer.lastName}
                </p>
                <p>
                  {payer.email} · CPF {formatCpf(payer.cpf)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayer(null)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#D4CFC7] bg-white px-3 py-1.5 text-xs text-[#4A433D] transition hover:bg-[#F2EEE8]"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
                Editar
              </button>
            </div>

            <div className="rounded-2xl border border-[#E8E3DB] bg-[#FAFAF8] p-5">
              <div className="mb-4 flex items-center gap-2 text-sm text-[#4A433D]">
                <CheckCircle2
                  className="h-4 w-4 text-[#4A7C59]"
                  strokeWidth={1.8}
                />
                Passo 2 de 2 · Escolha PIX ou Cartão de crédito
              </div>

              <Payment
                initialization={brickInitialization}
                customization={{
                  paymentMethods: {
                    creditCard: "all",
                    bankTransfer: ["pix"],
                    maxInstallments: 12,
                  },
                  visual: {
                    style: { theme: "default" },
                  },
                }}
                onSubmit={handlePaymentSubmit}
                onError={(brickError) => {
                  console.error("[Payment Brick]", brickError);
                  setError(
                    "Não foi possível carregar o formulário de pagamento. Recarregue a página."
                  );
                }}
              />

              {submitting ? (
                <div className="mt-4 flex items-center gap-2 text-[#4A433D]">
                  <LoaderCircle
                    className="h-5 w-5 animate-spin"
                    strokeWidth={1.8}
                  />
                  Processando pagamento...
                </div>
              ) : null}
            </div>
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

type PayerInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "email";
  autoComplete?: string;
  placeholder?: string;
};

function PayerInput({
  label,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
}: PayerInputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[#4A433D]">
      <span className="font-medium text-[#0D0D0D]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`rounded-lg border bg-white px-3 py-2 text-[#0D0D0D] outline-none transition focus:border-[#7D5A3C] focus:ring-2 focus:ring-[#7D5A3C]/20 ${
          error ? "border-[#E1B6B6]" : "border-[#D4CFC7]"
        }`}
      />
      {error ? (
        <span className="text-xs text-[#8A3030]">{error}</span>
      ) : null}
    </label>
  );
}
