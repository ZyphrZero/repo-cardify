import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'repo-cardify',
  description: 'Generate beautiful GitHub repository cards.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&family=Merriweather:wght@400;700&family=Oswald:wght@500;700&family=Playfair+Display:wght@600;800&family=Poppins:wght@400;600;800&display=swap"
        />
      </head>
      <body suppressHydrationWarning className="bg-white text-zinc-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
