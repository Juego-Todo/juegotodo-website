import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Juego Todo | Filipino Combat Sports",
    template: "%s | Juego Todo",
  },
  description:
    "A cinematic, modern combat sports platform for Juego Todo and Filipino Martial Arts.",
  metadataBase: new URL("https://juegotodo.com"),
  openGraph: {
    title: "Juego Todo | The Evolution of Filipino Combat Sports",
    description:
      "Premium Filipino combat sports events, fighters, rankings, media, registration, and partnerships.",
    siteName: "Juego Todo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Juego Todo",
    description: "The Evolution of Filipino Combat Sports.",
  },
};

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${inter.variable} ${bebas.variable}`} lang="en">
      <body>
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black"
          href="#main-content"
        >
          Skip to content
        </a>
        <div className="noise" aria-hidden />
        <Navbar />
        <div id="main-content">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
