"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Mail,
  X,
} from "lucide-react";
import { isValidEmail } from "@/lib/validation";
import { getEmailDomain, trackEvent } from "@/lib/analytics";

type EarlyAccessModalProps = {
  onClose: () => void;
};

type FoundersResponse = {
  status?: "created" | "existing";
  founder?: { id: string; email: string };
  message?: string;
  error?: string;
  fieldErrors?: { email?: string };
};

const CONFETTI_COLORS = ["#7D5A3C", "#4A7C59", "#D9C2A5", "#B6B09F", "#F2F2F2"];

export default function EarlyAccessModal({ onClose }: EarlyAccessModalProps) {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: `${(index * 13.7) % 100}%`,
        delay: `${(index % 6) * 0.06}s`,
        duration: `${0.9 + (index % 5) * 0.15}s`,
        rotate: `${(index * 29) % 360}deg`,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      })),
    []
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);
    setGlobalError(null);

    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) {
      trackEvent("email_submission_error", {
        flow: "early_access",
        step: "validation",
      });
      setFieldError("Informe um email válido.");
      return;
    }

    trackEvent("submit_early_access_email", {
      email_domain: getEmailDomain(trimmed),
    });

    try {
      setSubmitting(true);

      const response = await fetch("/api/founders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = (await response.json()) as FoundersResponse;

      if (!response.ok) {
        if (data.fieldErrors?.email) setFieldError(data.fieldErrors.email);
        throw new Error(data.error ?? "Não foi possível cadastrar agora.");
      }

      trackEvent("email_submission_success", {
        flow: "early_access",
        email_domain: getEmailDomain(trimmed),
      });

      setSuccessMessage(
        data.message ??
          "Pronto! Em instantes você recebe um email com as próximas instruções."
      );
      setEmail("");
    } catch (err) {
      trackEvent("email_submission_error", {
        flow: "early_access",
        step: "request",
      });

      setGlobalError(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar agora. Tente novamente."
      );
    } finally {
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
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#D9D2C8] bg-[#F7F3EC] p-6 text-[#1F1A15] shadow-[0_24px_120px_rgba(0,0,0,0.35)] md:p-8"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="early-access-modal-title"
      >
        {successMessage ? (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {confettiPieces.map((piece) => (
              <span
                key={piece.id}
                className="absolute top-[-12px] h-3 w-2 rounded-sm"
                style={{
                  left: piece.left,
                  backgroundColor: piece.color,
                  transform: `rotate(${piece.rotate})`,
                  animation: `confetti-fall ${piece.duration} ease-out ${piece.delay} forwards`,
                }}
              />
            ))}
          </div>
        ) : null}

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
          Acesso Antecipado · 50% OFF vitalício
        </p>
        <h3
          id="early-access-modal-title"
          className="mt-3 font-[var(--font-playfair)] text-3xl font-semibold tracking-tight text-[#0D0D0D] md:text-4xl"
        >
          Garanta sua vaga de fundador
        </h3>
        <p className="mt-3 text-base leading-relaxed text-[#4A433D]">
          Cadastre seu email agora. Em seguida, enviamos as instruções de
          pagamento do acesso antecipado para você garantir o{" "}
          <strong>50% OFF vitalício</strong>. Nada é cobrado sem sua confirmação.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#4A433D]">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (fieldError) setFieldError(null);
              }}
              autoComplete="email"
              placeholder="voce@exemplo.com"
              disabled={submitting}
              className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-base text-[#0D0D0D] outline-none transition focus:border-[#7D5A3C] focus:ring-4 focus:ring-[#7D5A3C]/10 disabled:cursor-not-allowed disabled:opacity-70 ${
                fieldError ? "border-[#E1B6B6]" : "border-[#D9D2C8]"
              }`}
            />
            {fieldError ? (
              <span className="mt-1 block text-xs text-[#8A3030]">
                {fieldError}
              </span>
            ) : null}
          </label>

          {globalError ? (
            <div className="flex items-start gap-3 rounded-xl border border-[#E1B6B6] bg-[#FFF3F3] px-4 py-3 text-sm text-[#8A3030]">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
              <span>{globalError}</span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="flex items-start gap-3 rounded-xl border border-[#89C29C]/40 bg-[#89C29C]/12 px-4 py-3 text-sm text-[#214D2E]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting || Boolean(successMessage)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7D5A3C] px-6 py-4 text-lg font-medium text-white transition hover:bg-[#6B4C32] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.8} />
                Cadastrando...
              </>
            ) : successMessage ? (
              "Cadastro confirmado"
            ) : (
              "Quero meu acesso antecipado"
            )}
          </button>

          <p className="flex items-center justify-center gap-2 text-xs text-[#6B635C]">
            <Mail className="h-4 w-4" strokeWidth={1.8} />
            As instruções de pagamento vão no próximo email.
          </p>
        </form>
      </div>
    </div>
  );
}
