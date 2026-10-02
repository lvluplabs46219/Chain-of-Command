import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../index.css";

export const metadata: Metadata = {
  title: "Chain of Command",
  description: "AI-powered legal self-representation workspace and case intelligence platform.",
  openGraph: {
    title: "Chain of Command",
    description: "AI-powered legal self-representation workspace and case intelligence platform.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chain of Command",
    description: "AI-powered legal self-representation workspace and case intelligence platform.",
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
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#111214] text-[#e1e2e5] antialiased min-h-screen">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
