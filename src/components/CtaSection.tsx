"use client";

import { ShieldCheck } from "lucide-react";
import { AnimateOnScroll } from "@/hooks/useInView";
import { useCheckoutModal } from "@/components/CheckoutModalProvider";

export default function CtaSection() {
  const { openCheckoutModal } = useCheckoutModal();

  return (
    <section
      id="cta"
      className="bg-black text-[#F2F2F2] py-24 md:py-40 relative"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-20 flex flex-col items-center justify-center text-center relative">
        {/* Decorative vertical line */}
        <div className="hidden md:block absolute left-20 top-1/2 -translate-y-1/2 w-[2px] h-20 bg-[#7D5A3C] opacity-40" />

        <AnimateOnScroll>
          <span className="font-[var(--font-dm-mono)] text-sm text-[#7D5A3C] uppercase tracking-[0.2em] mb-6 block">
            Oferta Fundador
          </span>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <h2 className="font-[var(--font-playfair)] font-medium text-5xl md:text-7xl text-[#F2F2F2] leading-tight max-w-4xl mx-auto mb-8 tracking-tight">
            A última bio que você vai precisar configurar.
          </h2>
        </AnimateOnScroll>

        <AnimateOnScroll delay={200}>
          <p className="text-2xl text-[#B6B09F] mb-8">
            Garanta seu plano vitalício com um pagamento único hoje. Plataforma
            no ar em 6 semanas.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll delay={200}>
          <div className="font-[var(--font-dm-mono)] font-semibold text-3xl text-[#7D5A3C] mb-12 tracking-tight">
            [ 23 vagas restantes ]
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={300}>
          <button
            type="button"
            onClick={openCheckoutModal}
            className="inline-block bg-[#7D5A3C] text-white font-normal text-xl px-12 py-5 rounded-md hover:bg-[#6B4C32] transition-all duration-150 hover:scale-[1.02] mb-6 shadow-[0_0_20px_rgba(125,90,60,0.2)]"
          >
            Garantir minha vaga com desconto
          </button>
        </AnimateOnScroll>

        <AnimateOnScroll delay={300} className="flex items-center gap-3 text-base text-[#B6B09F]">
          <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
          Garantia de 7 dias • Risco zero
        </AnimateOnScroll>
      </div>
    </section>
  );
}
