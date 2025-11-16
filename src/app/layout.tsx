import type { Metadata } from "next";
import { League_Spartan, Public_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
  description:
    "A minimal, clean, and intelligent note-taking app for competitive exam preparation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${leagueSpartan.variable} ${publicSans.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
