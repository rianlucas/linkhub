"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, X } from "lucide-react";

type WaitlistModalProps = {
  onClose: () => void;
};

type WaitlistResponse = {
  message?: string;
  error?: string;
};

const CONFETTI_COLORS = ["#7D5A3C", "#4A7C59", "#D9C2A5", "#B6B09F", "#F2F2F2"];

export default function WaitlistModal({ onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccessMessage(null);

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Digite um email valido para entrar na lista.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = (await response.json()) as WaitlistResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel salvar seu email agora.");
      }

      setSuccessMessage(data.message ?? "Voce entrou na lista com sucesso! 🎉");
      setEmail("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nao foi possivel salvar seu email agora."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#D9D2C8] bg-[#F7F3EC] p-6 text-[#1F1A15] shadow-[0_24px_120px_rgba(0,0,0,0.35)] md:p-8"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-modal-title"
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
          className="absolute right-4 top-4 rounded-full p-2 text-[#6B635C] transition hover:bg-black/5 hover:text-[#0D0D0D]"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5" strokeWidth={1.8} />
        </button>

        <p className="font-[var(--font-dm-mono)] text-xs uppercase tracking-[0.2em] text-[#7D5A3C]">
          Lista de espera
        </p>
        <h3
          id="waitlist-modal-title"
          className="mt-3 font-[var(--font-playfair)] text-3xl font-semibold tracking-tight text-[#0D0D0D]"
        >
          Entre com seu email
        </h3>
        <p className="mt-3 text-base leading-relaxed text-[#4A433D]">
          Assim que tivermos novidades, voce recebe tudo em primeira mao.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#4A433D]">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full rounded-2xl border border-[#D9D2C8] bg-white px-4 py-3.5 text-base text-[#0D0D0D] outline-none transition focus:border-[#7D5A3C] focus:ring-4 focus:ring-[#7D5A3C]/10"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-[#E1B6B6] bg-[#FFF3F3] px-4 py-3 text-sm text-[#8A3030]">
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <div className="flex items-start gap-3 rounded-xl border border-[#89C29C]/40 bg-[#89C29C]/12 px-4 py-3 text-sm text-[#214D2E]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7D5A3C] px-6 py-4 text-lg font-medium text-white transition hover:bg-[#6B4C32] disabled:cursor-wait disabled:opacity-80"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.8} />
                Salvando...
              </>
            ) : (
              "Entrar na lista"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
