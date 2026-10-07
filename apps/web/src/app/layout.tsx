import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { BotIdClient } from "botid/client";
import "../index.css";

const Analytics = () => null;
const SpeedInsights = () => null;

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
    "AI-powered legal self-representation workspace and case intelligence platform.",
  openGraph: {
    title: "Chain of Command",
    description:
      "AI-powered legal self-representation workspace and case intelligence platform.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chain of Command",
    description:
      "AI-powered legal self-representation workspace and case intelligence platform.",
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
        <Script src="/fetch-guard.js" strategy="beforeInteractive" />
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
          {children}
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
