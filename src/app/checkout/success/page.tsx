import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";

type SuccessPageProps = {
  searchParams: Promise<{ payment_id?: string; external_reference?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { payment_id, external_reference } = await searchParams;

  return (
    <main className="min-h-screen bg-[#F2F2F2] px-6 py-20 md:px-20">
      <section className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[#89C29C]/40 bg-white p-10 shadow-sm">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#4A7C59]/10 blur-3xl" />

        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4A7C59]/10">
            <CheckCircle2
              className="h-8 w-8 text-[#4A7C59]"
              strokeWidth={1.8}
            />
          </div>

          <p className="mt-6 font-[var(--font-dm-mono)] text-xs uppercase tracking-[0.2em] text-[#4A7C59]">
            Pagamento aprovado
          </p>

          <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-semibold tracking-tight text-[#0D0D0D] md:text-5xl">
            Bem-vindo à BioNutri
            <Sparkles
              className="ml-3 inline-block h-8 w-8 text-[#D9C2A5]"
              strokeWidth={1.5}
            />
          </h1>

          <p className="mt-4 text-lg text-[#4A433D]">
            Recebemos sua oferta fundador e seu plano vitalício com 50% OFF já
            está garantido. Enviamos um e-mail de confirmação com os próximos
            passos.
          </p>

          {(payment_id || external_reference) && (
            <dl className="mt-8 grid gap-3 rounded-2xl border border-[#E8E3DB] bg-[#FAFAF8] p-5 text-sm text-[#4A433D]">
              {payment_id ? (
                <div className="flex justify-between gap-4">
                  <dt className="font-medium">ID do pagamento</dt>
                  <dd className="font-[var(--font-dm-mono)] text-[#0D0D0D]">
                    {payment_id}
                  </dd>
                </div>
              ) : null}
              {external_reference ? (
                <div className="flex justify-between gap-4">
                  <dt className="font-medium">Referência</dt>
                  <dd className="font-[var(--font-dm-mono)] text-[#0D0D0D]">
                    {external_reference}
                  </dd>
                </div>
              ) : null}
            </dl>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-[#0D0D0D] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#1a1a1a]"
            >
              Voltar para a home
            </Link>
            <a
              href="mailto:contato@bionutri.app"
              className="inline-flex items-center justify-center rounded-xl border border-[#D4CFC7] bg-white px-6 py-3 text-sm font-medium text-[#0D0D0D] transition hover:bg-[#FAFAF8]"
            >
              Falar com o time
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
