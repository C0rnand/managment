import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const TITLE = "Tatra Budič (TABU) | Prírodný energetický nápoj z Tatier";
const DESCRIPTION =
  "TABU (Tatra Budič) je prírodný energetický nápoj z bylinných extraktov Vysokých Tatier, ktorý dodáva udržateľnú energiu bez umelých látok a náhleho poklesu výkonu.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Tatra Budič",
    "TABU",
    "energetický nápoj",
    "prírodný energetický nápoj",
    "Vysoké Tatry",
    "byliny",
    "guarana",
    "startup",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    locale: "sk_SK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" className={`${inter.variable} ${grotesk.variable}`}>
      <body className="bg-white text-forest-900 antialiased">{children}</body>
    </html>
  );
}
