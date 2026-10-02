import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BotIdClient } from "botid/client";
import "../index.css";

const protectedRoutes = [
  {
    path: "/api/checkout",
    method: "POST" as const,
  },
  {
    path: "/api/sensitive/*",
    method: "POST" as const,
  },
  {
    path: "/api/user/*",
    method: "POST" as const,
  },
  {
    path: "/api/v1/*",
    method: "POST" as const,
  },
];

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
        <script
          id="window-fetch-guard"
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                if (typeof window !== 'undefined') {
                  var proto = window.Window ? window.Window.prototype : Object.getPrototypeOf(window);
                  var desc = Object.getOwnPropertyDescriptor(window, 'fetch') ||
                             (proto && Object.getOwnPropertyDescriptor(proto, 'fetch'));
                  if (!desc || !desc.set || !desc.writable) {
                    var _origFetch = window.fetch ? window.fetch.bind(window) : null;
                    var _currentFetch = _origFetch;
                    Object.defineProperty(window, 'fetch', {
                      configurable: true,
                      enumerable: true,
                      get: function() { return _currentFetch; },
                      set: function(fn) { _currentFetch = fn; }
                    });
                  }
                }
              } catch (e) {
                console.warn('[FetchGuard] Warning:', e);
              }
            })();`,
          }}
        />
        <BotIdClient protect={protectedRoutes} />
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
