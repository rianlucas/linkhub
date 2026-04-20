"use client";

import { useEffect, useState } from "react";
import { useEarlyAccessModal } from "@/components/EarlyAccessModalProvider";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { openEarlyAccessModal } = useEarlyAccessModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      id="navbar"
      className={`fixed w-full top-0 z-50 transition-all duration-300 h-16 flex items-center ${
        scrolled
          ? "bg-white/90 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto w-full px-6 md:px-20 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="font-[var(--font-playfair)] font-medium text-xl text-[#0D0D0D] tracking-tight">
            BioNutri
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#7D5A3C] mb-1" />
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-lg">
          {[
            { href: "#problema", label: "Problema" },
            { href: "#como-funciona", label: "Como funciona" },
            { href: "#planos", label: "Planos" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="relative group text-[#3D3A35] hover:text-[#0D0D0D] transition-colors"
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#0D0D0D] transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={openEarlyAccessModal}
          className="bg-[#7D5A3C] hover:bg-[#6B4C32] text-white text-base rounded-md px-5 py-2.5 transition-all duration-150 hover:scale-[1.02] flex items-center gap-2 shadow-sm"
        >
          Garantir acesso
        </button>
      </div>
    </nav>
  );
}
