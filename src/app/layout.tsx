import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SupportChat } from "@/components/support-chat";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Compte.shop — Marché ouvert & vérifié de comptes de jeu",
  description:
    "Achetez et vendez des comptes de jeu entre joueurs. Vendeurs vérifiés par pièce d'identité, paiement bloqué en séquestre jusqu'à réception du compte.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        {children}
        <SupportChat />
      </body>
    </html>
  );
}
