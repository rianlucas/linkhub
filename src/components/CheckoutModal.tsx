"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { formatCpf, isValidCpf, isValidEmail, onlyDigits } from "@/lib/validation";
import { useMercadoPago } from "@/hooks/useMercadoPago";

type CheckoutModalProps = {
  onClose: () => void;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type FounderResponse = {
  founder?: { id: string };
  status?: "created" | "existing";
  error?: string;
  fieldErrors?: FieldErrors;
};

const INITIAL_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  cpf: "",
};

function validate(values: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.firstName.trim()) errors.firstName = "Informe seu nome.";
  if (!values.lastName.trim()) errors.lastName = "Informe seu sobrenome.";
  if (!isValidEmail(values.email)) errors.email = "Email inválido.";
  if (!isValidCpf(values.cpf)) errors.cpf = "CPF inválido.";
  return errors;
}

export default function CheckoutModal({ onClose }: CheckoutModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { createMercadoPagoCheckout } = useMercadoPago();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setGlobalError(null);

    const trimmed: FormState = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      cpf: onlyDigits(form.cpf),
    };

    const validationErrors = validate(trimmed);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/founders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trimmed),
      });

      const data = (await response.json()) as FounderResponse;

      if (!response.ok || !data.founder) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        throw new Error(data.error ?? "Não foi possível salvar seus dados.");
      }

      await createMercadoPagoCheckout({
        founderId: data.founder.id,
        userEmail: trimmed.email,
        firstName: trimmed.firstName,
        lastName: trimmed.lastName,
        cpf: trimmed.cpf,
      });
      // O redirect para o Mercado Pago acontece dentro do hook; mantemos o
      // submitting ativo até o navegador sair da página.
    } catch (err) {
      setGlobalError(
        err instanceof Error
          ? err.message
          : "Não foi possível processar agora. Tente novamente."
      );
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      onClick={() => {
        if (!submitting) onClose();
      }}
      role="presentation"
    >
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#D9D2C8] bg-[#F7F3EC] p-6 text-[#1F1A15] shadow-[0_24px_120px_rgba(0,0,0,0.35)] md:p-8"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 rounded-full p-2 text-[#6B635C] transition hover:bg-black/5 hover:text-[#0D0D0D] disabled:opacity-50"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5" strokeWidth={1.8} />
        </button>

        <p className="font-[var(--font-dm-mono)] text-xs uppercase tracking-[0.2em] text-[#7D5A3C]">
          Oferta Fundador · R$19 vitalício
        </p>
        <h3
          id="checkout-modal-title"
          className="mt-3 font-[var(--font-playfair)] text-3xl font-semibold tracking-tight text-[#0D0D0D] md:text-4xl"
        >
          Seus dados pra emitir a cobrança
        </h3>
        <p className="mt-3 text-base leading-relaxed text-[#4A433D]">
          Precisamos desses dados para gerar a cobrança no Mercado Pago. O CPF
          é exigido para pagamentos via PIX e cartão.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nome"
              value={form.firstName}
              onChange={(value) => handleChange("firstName", value)}
              error={errors.firstName}
              autoComplete="given-name"
              disabled={submitting}
            />
            <Field
              label="Sobrenome"
              value={form.lastName}
              onChange={(value) => handleChange("lastName", value)}
              error={errors.lastName}
              autoComplete="family-name"
              disabled={submitting}
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => handleChange("email", value)}
              error={errors.email}
              autoComplete="email"
              placeholder="voce@exemplo.com"
              disabled={submitting}
            />
            <Field
              label="CPF"
              value={formatCpf(form.cpf)}
              onChange={(value) => handleChange("cpf", onlyDigits(value))}
              error={errors.cpf}
              inputMode="numeric"
              placeholder="000.000.000-00"
              disabled={submitting}
            />
          </div>

          {globalError ? (
            <div className="flex items-start gap-3 rounded-xl border border-[#E1B6B6] bg-[#FFF3F3] px-4 py-3 text-sm text-[#8A3030]">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
              <span>{globalError}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7D5A3C] px-6 py-4 text-lg font-medium text-white transition hover:bg-[#6B4C32] disabled:cursor-wait disabled:opacity-80"
          >
            {submitting ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.8} />
                Abrindo checkout...
              </>
            ) : (
              "Continuar para pagamento"
            )}
          </button>

          <p className="flex items-center justify-center gap-2 text-xs text-[#6B635C]">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
            Pagamento seguro processado pelo Mercado Pago.
          </p>
        </form>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "email";
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
};

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  disabled,
}: FieldProps) {
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
        disabled={disabled}
        className={`rounded-2xl border bg-white px-4 py-3 text-[#0D0D0D] outline-none transition focus:border-[#7D5A3C] focus:ring-4 focus:ring-[#7D5A3C]/10 disabled:cursor-not-allowed disabled:opacity-70 ${
          error ? "border-[#E1B6B6]" : "border-[#D9D2C8]"
        }`}
      />
      {error ? <span className="text-xs text-[#8A3030]">{error}</span> : null}
    </label>
  );
}
