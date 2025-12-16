import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from "geist/font/mono";
import { Playfair_Display, Roboto, Cardo } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

const cardo = Cardo({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-cardo',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: "ext: the file processor",
  description: "Process entire directories and convert your codebase into AI-ready plain text. Privacy-first, browser-based file processing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${playfair.variable}`}
    >
      <body
        className={`${GeistSans.className} ${roboto.variable} ${cardo.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}