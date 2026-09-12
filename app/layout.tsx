import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spacer po Zawierciu",
  description: "Mobilna trasa spacerowa po dziewięciu miejscach w Zawierciu.",
  openGraph: {
    type: "website",
    locale: "pl_PL",
    title: "Spacer po Zawierciu",
    description: "9 miejsc, 9 historii. Mobilny przewodnik po Zawierciu.",
    images: [{ url: "/og.png", width: 1740, height: 910, alt: "Spacer po Zawierciu - 9 miejsc, 9 historii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spacer po Zawierciu",
    description: "9 miejsc, 9 historii. Mobilny przewodnik po Zawierciu.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
