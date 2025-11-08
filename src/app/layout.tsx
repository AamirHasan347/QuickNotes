import type { Metadata } from "next";
import { League_Spartan, Public_Sans } from "next/font/google";
import "./globals.css";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuickNotes - AI-Powered Note-Taking for Students",
  description: "A minimal, clean, and intelligent note-taking app for competitive exam preparation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${leagueSpartan.variable} ${publicSans.variable}`}>
      <body className="bg-[--color-cream] text-[--color-text-black] antialiased">
        {children}
      </body>
    </html>
  );
}
