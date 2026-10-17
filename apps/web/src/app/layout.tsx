import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { BotIdClient } from "botid/client";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/Providers";
import "../index.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0A0B0E",
};

const protectedRoutes = [
  { path: "/api/checkout", method: "POST" as const },
  { path: "/api/sensitive/*", method: "POST" as const },
  { path: "/api/user/*", method: "POST" as const },
  { path: "/api/v1/*", method: "POST" as const },
];

export const metadata: Metadata = {
  title: "Chain of Command",
  description:
    "AI-powered legal self-representation workspace and case intelligence platform for pro se litigants.",
  openGraph: {
    title: "Chain of Command",
    description:
      "AI-powered legal self-representation workspace and case intelligence platform for pro se litigants.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chain of Command",
    description:
      "AI-powered legal self-representation workspace and case intelligence platform for pro se litigants.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <Script src="/fetch-guard.js" strategy="afterInteractive" />
      </head>
      <body className="bg-[#111214] text-[#e1e2e5] antialiased min-h-screen">
        <BotIdClient protect={protectedRoutes} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#D4AF37] focus:text-black focus:font-semibold focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          Skip to main content
        </a>
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className="min-h-screen flex flex-col focus:outline-none"
        >
          <Providers>{children}</Providers>
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
