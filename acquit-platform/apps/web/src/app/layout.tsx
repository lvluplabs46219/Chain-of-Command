import './globals.css';
import type { Metadata } from 'react';

export const metadata: Metadata = {
  title: 'Acquit Legal Operating System',
  description: 'AI-Powered Legal Workspace & Multi-Agent Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
