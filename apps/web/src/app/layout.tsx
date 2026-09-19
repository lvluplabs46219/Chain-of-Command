import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "Acquit.ai — Legal OS & Pro Se Workspace",
  description: "AI-Powered Legal Workspace for Self-Represented Litigants and Legal Counsel",
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
      </body>
    </html>
  );
}
