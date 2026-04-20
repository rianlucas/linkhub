import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Playfair_Display } from "next/font/google";
import { EarlyAccessModalProvider } from "@/components/EarlyAccessModalProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "WellPage | Sua presença digital, do jeito certo.",
  description:
    "A landing page profissional para nutricionistas e personal trainers. Agende, venda ebooks e receba pagamentos em um único lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${dmMono.variable} ${playfair.variable} scroll-smooth`}
    >
      <body>
        <EarlyAccessModalProvider>{children}</EarlyAccessModalProvider>
      </body>
    </html>
  );
}
