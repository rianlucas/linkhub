"use client";

import { WandSparkles, ShoppingCart, CalendarCheck } from "lucide-react";
import { AnimateOnScroll } from "@/hooks/useInView";

function BioMockupSVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[320px]">
      <g className="opacity-50" transform="translate(30, 20)">
        <rect width="140" height="260" rx="16" fill="#FFFFFF" stroke="#D4CFC7" strokeWidth="1.5" />
        <rect x="20" y="80" width="100" height="30" rx="4" fill="#F2F2F2" />
        <rect x="20" y="120" width="100" height="30" rx="4" fill="#F2F2F2" />
        <rect x="20" y="160" width="100" height="30" rx="4" fill="#F2F2F2" />
        <circle cx="70" cy="40" r="16" fill="#E8E3DB" />
      </g>
      <g transform="translate(190, 0)">
        <rect width="160" height="300" rx="20" fill="#FFFFFF" stroke="#D4CFC7" strokeWidth="1.5" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.05))" />
        <circle cx="80" cy="50" r="24" fill="#EAE4D5" stroke="#7D5A3C" strokeWidth="1.5" />
        <rect x="40" y="90" width="80" height="8" rx="4" fill="#0D0D0D" />
        <rect x="50" y="105" width="60" height="6" rx="3" fill="#7A756C" />
        <rect x="20" y="140" width="120" height="36" rx="6" fill="#FAFAF8" stroke="#E8E3DB" strokeWidth="1" />
        <rect x="28" y="148" width="20" height="20" rx="4" fill="#EAE4D5" />
        <rect x="20" y="186" width="120" height="36" rx="6" fill="#FAFAF8" stroke="#E8E3DB" strokeWidth="1" />
        <rect x="28" y="194" width="20" height="20" rx="4" fill="#EAE4D5" />
        <rect x="20" y="232" width="120" height="40" rx="6" fill="#7D5A3C" className="group-hover:fill-[#6B4C32] transition-colors" />
        <rect x="40" y="249" width="40" height="6" rx="3" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

function EbookSVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[320px]">
      <rect x="50" y="80" width="80" height="110" rx="6" fill="#EAE4D5" stroke="#D4CFC7" strokeWidth="1" />
      <rect x="60" y="95" width="50" height="4" rx="2" fill="#7D5A3C" opacity="0.6" />
      <rect x="40" y="210" width="100" height="36" rx="6" fill="#7D5A3C" className="group-hover:fill-[#6B4C32] transition-colors" />
      <text x="90" y="232" fontFamily="'DM Sans', sans-serif" fontWeight="500" fontSize="12" fill="#FFFFFF" textAnchor="middle">
        Comprar R$47
      </text>
      <path d="M 150,228 C 200,228 220,135 270,135" fill="none" stroke="#D4CFC7" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="210" cy="181" r="10" fill="#4A7C59" />
      <path d="M 206,181 L 209,184 L 214,178" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
      <rect x="280" y="105" width="60" height="60" rx="8" fill="#FAFAF8" stroke="#E8E3DB" strokeWidth="1.5" />
      <path d="M 310,120 L 310,145 M 300,135 L 310,145 L 320,135" fill="none" stroke="#7D5A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="300" y="152" width="20" height="2" fill="#7A756C" />
    </svg>
  );
}

function CalendarSVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[320px]">
      <g transform="translate(40, 50)">
        <rect x="0" y="0" width="45" height="45" rx="4" fill="#FAFAF8" stroke="#E8E3DB" />
        <rect x="55" y="0" width="45" height="45" rx="4" fill="#FAFAF8" stroke="#E8E3DB" />
        <rect x="110" y="0" width="45" height="45" rx="4" fill="rgba(125, 90, 60, 0.1)" stroke="none" />
        <circle cx="132.5" cy="22.5" r="3" fill="#7D5A3C" />
        <rect x="165" y="0" width="45" height="45" rx="4" fill="#FAFAF8" stroke="#E8E3DB" />
        <rect x="220" y="0" width="45" height="45" rx="4" fill="#FAFAF8" stroke="#E8E3DB" />
        <rect x="0" y="55" width="45" height="45" rx="4" fill="#FAFAF8" stroke="#E8E3DB" />
        <rect x="55" y="55" width="45" height="45" rx="4" fill="#FAFAF8" stroke="#7D5A3C" strokeWidth="2" className="group-hover:fill-[#7D5A3C]/5 transition-colors" />
        <rect x="110" y="55" width="45" height="45" rx="4" fill="#FAFAF8" stroke="#E8E3DB" />
        <rect x="165" y="55" width="45" height="45" rx="4" fill="rgba(125, 90, 60, 0.1)" stroke="none" />
        <circle cx="187.5" cy="77.5" r="3" fill="#7D5A3C" />
        <rect x="220" y="55" width="45" height="45" rx="4" fill="#FAFAF8" stroke="#E8E3DB" />
        <g fontFamily="'DM Mono', monospace" fontSize="12" fill="#7A756C" textAnchor="middle">
          <text x="22.5" y="27">12</text>
          <text x="77.5" y="27">13</text>
          <text x="132.5" y="38" fill="#7D5A3C">14</text>
          <text x="77.5" y="82" fill="#0D0D0D" fontWeight="bold">20</text>
          <text x="187.5" y="93" fill="#7D5A3C">22</text>
        </g>
        <rect x="0" y="160" width="265" height="36" rx="6" fill="#F2F2F2" />
        <text x="15" y="182" fontFamily="'DM Mono', monospace" fontSize="11" fill="#7A756C">
          R$150 <tspan fill="#4A7C59">recebido antecipado</tspan>
        </text>
      </g>
    </svg>
  );
}

const features = [
  {
    icon: WandSparkles,
    title: "Mais profissionalismo",
    description:
      "Transmita autoridade logo na primeira impressão e mostre o valor do seu trabalho.",
    visual: BioMockupSVG,
    imageFirst: true,
  },
  {
    icon: ShoppingCart,
    title: "Mais conversões",
    description:
      "Transforme visitantes em pacientes com um caminho claro entre interesse e ação.",
    visual: EbookSVG,
    imageFirst: false,
  },
  {
    icon: CalendarCheck,
    title: "Mais organização",
    description:
      "Centralize tudo em um só lugar: consultas, WhatsApp e oportunidades de venda.",
    visual: CalendarSVG,
    imageFirst: true,
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="bg-[#F2F2F2] bg-[linear-gradient(to_bottom,rgba(182,176,159,0.05)_1px,transparent_1px)] bg-[length:100%_32px] py-24 md:py-32"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-20 flex flex-col gap-24 md:gap-40">
        {features.map((feature) => {
          const Icon = feature.icon;
          const Visual = feature.visual;

          return (
            <div
              key={feature.title}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center"
            >
              {/* Visual */}
              <AnimateOnScroll
                delay={feature.imageFirst ? 0 : 100}
                className={`bg-white rounded-xl border border-[#D4CFC7] shadow-sm p-8 h-[400px] flex items-center justify-center relative hover:-translate-y-1 hover:shadow-xl group transition-all duration-300 ${
                  feature.imageFirst
                    ? "order-2 md:order-1"
                    : "order-2"
                }`}
              >
                <Visual />
              </AnimateOnScroll>

              {/* Text */}
              <AnimateOnScroll
                delay={feature.imageFirst ? 0 : 0}
                className={
                  feature.imageFirst
                    ? "order-1 md:order-2"
                    : "order-1"
                }
              >
                <div className="w-14 h-14 rounded-xl bg-white border border-[#D4CFC7] flex items-center justify-center mb-8 shadow-sm">
                  <Icon className="text-[#0D0D0D] w-7 h-7" strokeWidth={1.5} />
                </div>
                <h3 className="font-[var(--font-playfair)] font-medium text-4xl md:text-5xl text-[#0D0D0D] mb-6 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-xl md:text-2xl text-[#3D3A35] leading-relaxed">
                  {feature.description}
                </p>
              </AnimateOnScroll>
            </div>
          );
        })}
      </div>
    </section>
  );
}
