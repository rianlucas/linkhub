"use client";

import {
  ArrowRight,
  ArrowDown,
  ArrowDownLeft,
  Calendar,
  CalendarCheck,
  ChevronRight,
  Book,
  MessageCircle,
} from "lucide-react";
import { AnimateOnScroll } from "@/hooks/useInView";
import { useCheckoutModal } from "@/components/CheckoutModalProvider";

export default function Hero() {
  const { openCheckoutModal } = useCheckoutModal();

  return (
    <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-[linear-gradient(to_bottom,rgba(182,176,159,0.05)_1px,transparent_1px)] bg-[length:100%_32px]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-20 grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
        {/* Text Column */}
        <div className="md:col-span-7 flex flex-col items-start z-10">
          {/* Badge */}
          <AnimateOnScroll className="relative inline-flex items-center gap-2 mb-8 group">
            <div className="absolute inset-0 bg-[#7D5A3C] rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative inline-flex items-center gap-2 bg-white/60 border border-[#7D5A3C]/20 text-[#7D5A3C] font-[var(--font-dm-mono)] text-xs uppercase tracking-wide px-4 py-2 rounded-full backdrop-blur-sm shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#7D5A3C] animate-pulse" />
              <span className="tracking-widest">Acesso Antecipado Liberado</span>
            </div>
          </AnimateOnScroll>

          {/* Headline */}
          <h1 className="font-[var(--font-playfair)] font-bold text-5xl md:text-7xl lg:text-[5rem] leading-[0.93] tracking-tight text-[#0D0D0D] mb-8">
            <AnimateOnScroll delay={100}>
              <span className="block">Sua bio.</span>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
              <span className="block">Sua marca.</span>
            </AnimateOnScroll>
            <AnimateOnScroll delay={300}>
              <span className="block text-[#7D5A3C]">Suas vendas.</span>
            </AnimateOnScroll>
          </h1>

          <AnimateOnScroll delay={300}>
            <p className="text-2xl text-[#3D3A35] leading-relaxed max-w-lg mb-10">
              Nutricionistas e personal trainers que faturam sério merecem uma
              bio que trabalha por eles — não 5 ferramentas desconexas.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll
            delay={300}
            className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
          >
            {/* Primary CTA */}
            <div className="relative w-full sm:w-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#7D5A3C] to-[#EAE4D5] rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500" />
              <button
                type="button"
                onClick={openCheckoutModal}
                className="relative flex flex-col items-center justify-center w-full sm:w-auto bg-[#7D5A3C] hover:bg-[#6B4C32] text-white px-8 py-4 rounded-md transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
              >
                <span className="text-xl">Garantir vaga com 50% OFF</span>
                <div className="flex items-center gap-2 mt-1 text-white/80 text-sm font-[var(--font-dm-mono)]">
                  <span className="line-through decoration-white/50">
                    R$39/mês
                  </span>
                  <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                  <span className="text-white">R$19 vitalício</span>
                </div>
              </button>
            </div>

            {/* Secondary */}
            <a
              href="#como-funciona"
              className="text-[#7A756C] hover:text-[#0D0D0D] text-lg transition-colors flex items-center gap-2 relative group"
            >
              Ver como funciona
              <ArrowDown
                className="w-5 h-5 transition-transform group-hover:translate-y-1"
                strokeWidth={1.5}
              />
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#0D0D0D] transition-all duration-200 group-hover:w-full" />
            </a>
          </AnimateOnScroll>
        </div>

        {/* Visual Column - Mobile Mockup */}
        <AnimateOnScroll className="md:col-span-5 relative w-full h-[500px] flex items-center justify-center" delay={200}>
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#7D5A3C]/5 to-transparent rounded-full blur-3xl" />

          {/* Floating phone */}
          <div className="relative w-[280px] md:w-[320px] mx-auto z-10 animate-[float_6s_ease-in-out_infinite]">
            {/* PIX Notification */}
            <div className="absolute -right-8 md:-right-16 top-24 z-30 bg-white/80 backdrop-blur-md rounded-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-3.5 flex items-center gap-3 animate-[float-slow_8s_ease-in-out_infinite]">
              <div className="w-10 h-10 rounded-full bg-[#4A7C59]/10 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-5 h-5 text-[#4A7C59]" strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-[var(--font-dm-mono)] text-[#7A756C]">
                  PIX Recebido
                </span>
                <span className="text-base font-medium text-[#0D0D0D] tracking-tight">
                  R$ 47,00
                </span>
              </div>
            </div>

            {/* Calendar Notification */}
            <div className="absolute -left-6 md:-left-12 bottom-32 z-30 bg-white/80 backdrop-blur-md rounded-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-3.5 flex items-center gap-3 animate-[float-slow_7s_ease-in-out_infinite_reverse]">
              <div className="w-10 h-10 rounded-full bg-[#7D5A3C]/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#7D5A3C]" strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-[var(--font-dm-mono)] text-[#7A756C]">
                  Nova Consulta
                </span>
                <span className="text-base font-medium text-[#0D0D0D] tracking-tight">
                  Amanhã, 14:00
                </span>
              </div>
            </div>

            {/* Phone Frame */}
            <div className="relative rounded-[2.5rem] bg-white border-[6px] border-[#F2F2F2] shadow-2xl overflow-hidden aspect-[9/19] ring-1 ring-black/5">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
                <div className="w-32 h-5 bg-[#F2F2F2] rounded-b-2xl" />
              </div>

              {/* Screen Content */}
              <div className="absolute inset-0 bg-[#FAFAF8] pt-12 pb-6 px-6 flex flex-col items-center overflow-hidden">
                {/* Cover */}
                <div className="absolute top-0 left-0 w-full h-32 bg-[#EAE4D5] z-0" />

                {/* Avatar */}
                <div className="relative z-10 w-24 h-24 rounded-full border-4 border-[#FAFAF8] bg-white shadow-sm mt-8 mb-4 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-[#D4CFC7] flex items-center justify-center font-[var(--font-playfair)] text-3xl text-white tracking-tight">
                    SS
                  </div>
                </div>

                <h3 className="relative z-10 font-[var(--font-playfair)] text-2xl font-medium text-[#0D0D0D] tracking-tight">
                  Dra. Sarah Silva
                </h3>
                <p className="relative z-10 text-sm text-[#7A756C] font-[var(--font-dm-mono)] mb-8">
                  CRN 12345/SP
                </p>

                {/* Link Buttons */}
                <div className="w-full flex flex-col gap-3 relative z-10">
                  <div className="w-full bg-[#7D5A3C] text-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarCheck className="w-5 h-5" strokeWidth={1.5} />
                      <span className="text-base font-medium">
                        Agendar Consulta
                      </span>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 opacity-70"
                      strokeWidth={1.5}
                    />
                  </div>

                  <div className="w-full bg-white border border-[#E8E3DB] rounded-xl p-3 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-12 bg-[#F2F2F2] rounded flex items-center justify-center shrink-0">
                        <Book className="w-5 h-5 text-[#7D5A3C]" strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-base font-medium text-[#0D0D0D] tracking-tight">
                          E-book Receitas
                        </span>
                        <span className="text-xs font-[var(--font-dm-mono)] text-[#4A7C59]">
                          R$ 47,00
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-[#F2F2F2] text-[#3D3A35] rounded-xl p-4 flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                      <span className="text-base font-medium">
                        Falar no WhatsApp
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
