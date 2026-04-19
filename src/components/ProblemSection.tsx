"use client";

import { AnimateOnScroll } from "@/hooks/useInView";

const painPoints = [
  {
    number: "01",
    title:
      "Copiar link da agenda, colar no WhatsApp, esperar confirmação, repetir.",
    description:
      "3 a 5 horas por semana que você poderia usar atendendo ou descansando.",
  },
  {
    number: "02",
    title: "Paciente marcou, não pagou, não veio. Horário perdido.",
    description:
      "No-show custa em média R$180 por consulta desperdiçada.",
  },
  {
    number: "03",
    title:
      "Ebook pronto. Mas vender por onde? Mais uma taxa, mais uma senha.",
    description:
      "A fragmentação afasta o paciente que quer comprar por impulso.",
  },
];

export default function ProblemSection() {
  return (
    <section
      id="problema"
      className="bg-black text-[#F2F2F2] py-24 md:py-32 flex flex-col items-center"
    >
      <div className="max-w-[1280px] w-full mx-auto px-6 md:px-20">
        <AnimateOnScroll>
          <h2 className="font-[var(--font-playfair)] font-medium italic text-4xl md:text-5xl text-center text-[#EAE4D5] mb-20 max-w-4xl mx-auto tracking-tight leading-tight">
            &ldquo;Quantas horas da sua semana você passa fazendo isso?&rdquo;
          </h2>
        </AnimateOnScroll>

        <div className="max-w-3xl mx-auto flex flex-col gap-16 relative">
          {/* Timeline line */}
          <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-[#7D5A3C] opacity-40" />

          {painPoints.map((point, i) => (
            <AnimateOnScroll
              key={point.number}
              delay={i * 100}
              className="pl-8 relative"
            >
              <div className="absolute left-[-3px] top-1.5 w-2 h-2 rounded-full bg-[#7D5A3C]" />
              <span className="font-[var(--font-dm-mono)] text-sm text-[#7D5A3C] uppercase tracking-wide block mb-3">
                {point.number} /
              </span>
              <h3 className="font-[var(--font-playfair)] font-normal text-3xl md:text-4xl leading-tight mb-4 tracking-tight">
                {point.title}
              </h3>
              <p className="text-[#B6B09F] text-xl md:text-2xl leading-relaxed">
                {point.description}
              </p>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
