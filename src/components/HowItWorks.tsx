"use client";

import { CircleUser, Link, Wallet } from "lucide-react";
import { AnimateOnScroll } from "@/hooks/useInView";
import { useEffect, useRef } from "react";

const steps = [
  {
    icon: CircleUser,
    title: "Agendamento direto",
    description:
      "O paciente escolhe horário e avança para fechar consulta sem atrito.",
    highlighted: false,
    offsetClass: "md:-mt-24",
  },
  {
    icon: Link,
    title: "Botão para WhatsApp",
    description:
      "Leve o contato para conversa com contexto certo e maior chance de fechar.",
    highlighted: false,
    offsetClass: "md:mt-24",
  },
  {
    icon: Wallet,
    title: "Venda de e-books e planos",
    description:
      "Ative novas fontes de receita e venda com uma jornada simples.",
    highlighted: true,
    offsetClass: "md:-mt-24",
  },
];

export default function HowItWorks() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          path.style.strokeDashoffset = "0";
          observer.unobserve(path);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(path);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="como-funciona"
      className="bg-[#EAE4D5] border-t border-[#E8E3DB] py-24 md:py-32 overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-20 text-center">
        <AnimateOnScroll>
          <h2 className="font-[var(--font-playfair)] font-medium text-4xl md:text-5xl text-[#0D0D0D] tracking-tight mb-20">
            Com a WellPage você transforma seu Instagram em um sistema de vendas
          </h2>
        </AnimateOnScroll>

        <div className="relative max-w-4xl mx-auto">
          {/* SVG Path */}
          <svg
            className="hidden md:block absolute top-[50%] left-0 w-full h-32 -translate-y-1/2 overflow-visible"
            viewBox="0 0 900 100"
            preserveAspectRatio="none"
          >
            <path
              ref={pathRef}
              className="stroke-[#7D5A3C] fill-none opacity-40"
              strokeWidth={2}
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: 1000,
                transition: "stroke-dashoffset 1.5s ease-in-out",
              }}
              d="M 20,50 C 200,50 250,-20 450,50 C 650,120 700,50 880,50"
            />
            <circle cx="20" cy="50" r="6" className="fill-[#7D5A3C]" />
            <circle
              cx="880"
              cy="50"
              r="10"
              className="fill-[#7D5A3C] animate-pulse"
            />
          </svg>

          <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-16 md:gap-0">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <AnimateOnScroll
                  key={step.title}
                  delay={i * 100}
                  className={`flex flex-col items-center text-center w-full md:w-64 ${step.offsetClass}`}
                >
                  <div
                    className={`w-20 h-20 rounded-xl border shadow-sm flex items-center justify-center mb-6 ${
                      step.highlighted
                        ? "bg-[#7D5A3C] border-transparent shadow-md"
                        : "bg-[#F2F2F2] border-[#D4CFC7]"
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 ${
                        step.highlighted ? "text-white" : "text-[#0D0D0D]"
                      }`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h4 className="font-normal text-2xl text-[#0D0D0D] mb-3 tracking-tight">
                    {step.title}
                  </h4>
                  <p className="text-lg text-[#3D3A35] leading-relaxed">
                    {step.description}
                  </p>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
