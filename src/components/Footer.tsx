export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] py-12 border-t border-white/5">
      <div className="max-w-[1280px] mx-auto px-6 md:px-20 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 opacity-80">
          <span className="font-[var(--font-playfair)] font-medium text-2xl text-[#F2F2F2] tracking-tight">
            BioNutri
          </span>
        </div>
        <div className="text-base text-[#7A756C] font-[var(--font-dm-mono)]">
          &copy; 2024 BioNutri. Feito para profissionais.
        </div>
      </div>
    </footer>
  );
}
