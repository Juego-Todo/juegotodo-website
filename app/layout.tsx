import type { Viewport } from "next";
import { Bebas_Neue, Inter, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { buildRootMetadata } from "@/lib/seo/metadata";
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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata = buildRootMetadata();

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${inter.variable} ${bebas.variable} ${spaceGrotesk.variable}`} data-scroll-behavior="smooth" lang="en">
      <body>
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black"
          href="#main-content"
        >
          Skip to content
        </a>
        <div className="noise" aria-hidden />
        <Providers>
          <Navbar />
          <div id="main-content">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
