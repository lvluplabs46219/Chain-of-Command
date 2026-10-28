import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { BotIdClient } from "botid/client";
const Analytics = () => null;
const SpeedInsights = () => null;
import { Providers } from "@/components/Providers";
import "../index.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#af0a78",
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
    <html lang="en" data-theme="candy" className="candy-theme">
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
      <body className="bg-[#fff7fb] text-[#281330] antialiased min-h-screen font-sans selection:bg-[#ffafd5] selection:text-[#281330]">
        <BotIdClient protect={protectedRoutes} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#af0a78] focus:text-white focus:font-semibold focus:rounded-full focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#e040a0]"
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
