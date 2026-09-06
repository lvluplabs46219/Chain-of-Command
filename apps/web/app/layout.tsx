import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acquit.ai — Legal Case Workspace",
  description: "AI-powered legal self-representation workspace and case intelligence platform.",
  openGraph: {
    title: "Acquit.ai",
    description: "AI-powered legal self-representation workspace and case intelligence platform.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Acquit.ai",
    description: "AI-powered legal self-representation workspace and case intelligence platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎨</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ height: "100%", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
