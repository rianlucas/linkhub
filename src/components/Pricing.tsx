"use client";

import { useState } from "react";
import {
  CheckCircle,
  Check,
  ShieldCheck,
  Star,
  Mail,
} from "lucide-react";
import { AnimateOnScroll } from "@/hooks/useInView";
import { useCheckoutModal } from "@/components/CheckoutModalProvider";
import WaitlistModal from "@/components/WaitlistModal";

const starterFeatures = [
  { text: "Perfil profissional básico", included: true },
  { text: "Links ilimitados", included: true },
  { text: "Venda de Ebooks", included: false },
  { text: "Agendamento com cobrança", included: false },
];

const clinicFeatures = [
  { text: "Até 5 profissionais", included: true },
  { text: "Divisão de pagamentos nativa", included: true },
  { text: "Suporte prioritário", included: true },
];

const founderPerks = [
  {
    icon: Check,
    iconBg: "bg-[#4A7C59]/10",
    iconColor: "text-[#4A7C59]",
    text: (
      <>
        Receba{" "}
        <strong className="font-medium text-[#0D0D0D]">
          50% de OFF VITALÍCIO
        </strong>{" "}
        (de R$39/mês por R$19/mês)
      </>
    ),
  },
  {
    icon: Check,
    iconBg: "bg-[#4A7C59]/10",
    iconColor: "text-[#4A7C59]",
    text: "Pagamento único de R$19 agora — plataforma lançada em 6 semanas",
  },
  {
    icon: ShieldCheck,
    iconBg: "bg-[#4A7C59]/10",
    iconColor: "text-[#4A7C59]",
    text: "Garantia de 7 dias: se não gostar, devolvemos 100% do seu dinheiro",
  },
  {
    icon: Star,
    iconBg: "bg-[#7D5A3C]/10",
    iconColor: "text-[#7D5A3C]",
    text: "Você entrará na fila prioritária de beta testers",
  },
  {
    icon: Mail,
    iconBg: "bg-[#7D5A3C]/10",
    iconColor: "text-[#7D5A3C]",
    text: "Acesso imediato à lista de espera + atualizações semanais por email",
  },
];

export default function Pricing() {
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const { openCheckoutModal } = useCheckoutModal();

  return (
    <>
      <section id="planos" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-[#F2F2F2] -z-20" />
      <div className="absolute inset-0 bg-[rgba(182,176,159,0.12)] bg-[linear-gradient(to_bottom,rgba(182,176,159,0.05)_1px,transparent_1px)] bg-[length:100%_32px] -z-10" />

      <div className="max-w-[1280px] mx-auto px-6 md:px-20 text-center">
        <AnimateOnScroll>
          <h2 className="font-[var(--font-playfair)] font-medium text-4xl md:text-5xl text-[#0D0D0D] tracking-tight mb-6">
            Um investimento que se paga.
          </h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={100}>
          <p className="text-2xl text-[#3D3A35] mb-20 max-w-2xl mx-auto">
            Apenas um paciente fechado a mais por mês já paga um ano inteiro de
            BioNutri.
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
          {/* Starter */}
          <AnimateOnScroll className="bg-white rounded-xl border border-[#D4CFC7] p-8 shadow-sm opacity-90 hover:opacity-100 transition-opacity flex flex-col items-start text-left h-full">
            <span className="font-normal text-lg text-[#7A756C] uppercase tracking-wide mb-4">
              Starter
            </span>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="font-[var(--font-dm-mono)] font-semibold text-5xl text-[#0D0D0D] tracking-tight">
                R$0
              </span>
              <span className="font-[var(--font-dm-mono)] text-xl text-[#7A756C]">
                /mês
              </span>
            </div>
            <div className="w-full h-[1px] bg-[#E8E3DB] mb-8" />
            <ul className="flex flex-col gap-5 mb-10 w-full">
              {starterFeatures.map((f) => (
                <li
                  key={f.text}
                  className={`flex items-start gap-3 text-lg ${
                    f.included ? "text-[#3D3A35]" : "text-[#7A756C] opacity-60"
                  }`}
                >
                  {f.included ? (
                    <CheckCircle
                      className="text-[#7D5A3C] w-6 h-6 mt-0.5 shrink-0"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <span className="w-5 h-[1.5px] bg-[#7A756C] mt-3 shrink-0" />
                  )}
                  {f.text}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setWaitlistModalOpen(true)}
              className="w-full bg-transparent border-[1.5px] border-[#D4CFC7] text-[#0D0D0D] font-normal text-lg px-6 py-3 rounded-md hover:bg-[#FAFAF8] transition-colors mt-auto cursor-pointer"
            >
              Entrar na lista de espera
            </button>
          </AnimateOnScroll>

          {/* Founder — Highlighted */}
          <AnimateOnScroll
            delay={100}
            className="bg-white rounded-xl border-[1.5px] border-[#7D5A3C]/40 p-10 shadow-xl transform md:scale-105 z-10 flex flex-col items-start text-left relative h-full"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#7D5A3C] text-white font-[var(--font-dm-mono)] text-sm uppercase tracking-wide px-4 py-1.5 rounded-md shadow-sm">
              Vagas Limitadas
            </div>

            <span className="font-normal text-lg text-[#7A756C] uppercase tracking-wide mb-4 mt-2">
              Oferta Fundador
            </span>

            <div className="flex flex-col gap-1 mb-8 w-full">
              <div className="flex items-baseline gap-2">
                <span className="font-[var(--font-dm-mono)] font-semibold text-6xl text-[#0D0D0D] tracking-tight">
                  R$19
                </span>
                <span className="font-[var(--font-dm-mono)] text-xl text-[#7A756C]">
                  hoje
                </span>
              </div>
              <span className="text-base text-[#7A756C]">
                Garante R$19/mês vitalício no lançamento
              </span>
            </div>

            <ul className="flex flex-col gap-5 mb-10 w-full border-t border-[#E8E3DB] pt-8">
              {founderPerks.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <li
                    key={i}
                    className="flex items-start gap-4 text-base text-[#3D3A35]"
                  >
                    <div
                      className={`w-6 h-6 rounded-full ${perk.iconBg} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <Icon
                        className={`${perk.iconColor} w-4 h-4`}
                        strokeWidth={perk.icon === Check ? 2 : 1.5}
                      />
                    </div>
                    <span className="leading-relaxed">{perk.text}</span>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={openCheckoutModal}
              className="w-full bg-[#7D5A3C] text-white font-normal text-xl px-6 py-4 rounded-md hover:bg-[#6B4C32] transition-all duration-150 hover:scale-[1.02] shadow-md mt-auto cursor-pointer inline-flex items-center justify-center"
            >
              Garantir vaga com 50% OFF
            </button>
          </AnimateOnScroll>

          {/* Clínica */}
          <AnimateOnScroll
            delay={200}
            className="bg-white rounded-xl border border-[#D4CFC7] p-8 shadow-sm opacity-90 hover:opacity-100 transition-opacity flex flex-col items-start text-left h-full"
          >
            <span className="font-normal text-lg text-[#7A756C] uppercase tracking-wide mb-4">
              Clínica
            </span>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="font-[var(--font-dm-mono)] font-semibold text-5xl text-[#0D0D0D] tracking-tight">
                R$89
              </span>
              <span className="font-[var(--font-dm-mono)] text-xl text-[#7A756C]">
                /mês
              </span>
            </div>
            <div className="w-full h-[1px] bg-[#E8E3DB] mb-8" />
            <ul className="flex flex-col gap-5 mb-10 w-full">
              {clinicFeatures.map((f) => (
                <li
                  key={f.text}
                  className="flex items-start gap-3 text-lg text-[#3D3A35]"
                >
                  <CheckCircle
                    className="text-[#7D5A3C] w-6 h-6 mt-0.5 shrink-0"
                    strokeWidth={1.5}
                  />
                  {f.text}
                </li>
              ))}
            </ul>
            <button className="w-full bg-transparent border-[1.5px] border-[#D4CFC7] text-[#0D0D0D] font-normal text-lg px-6 py-3 rounded-md hover:bg-[#FAFAF8] transition-colors mt-auto cursor-pointer">
              Falar com time
            </button>
          </AnimateOnScroll>
        </div>
      </div>
    </section>

      {waitlistModalOpen ? (
        <WaitlistModal onClose={() => setWaitlistModalOpen(false)} />
      ) : null}
    </>
  );
}
