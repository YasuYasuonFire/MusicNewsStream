import type { Metadata } from "next";
import { Inter, Bebas_Neue, Oswald, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "NOISE | Alternative Rock News",
  description: "Your daily dose of alternative rock news, reviews, and interviews. Stay ahead with the latest from Radiohead, Arctic Monkeys, The Strokes, and more.",
  keywords: ["alternative rock", "indie rock", "music news", "rock news", "radiohead", "arctic monkeys"],
  openGraph: {
    title: "NOISE | Alternative Rock News",
    description: "Your daily dose of alternative rock news",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body
        className={cn(
          "min-h-screen antialiased",
          inter.variable,
          bebasNeue.variable,
          oswald.variable,
          notoSansJP.variable
        )}
      >
        {/* Noise Overlay for texture */}
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
