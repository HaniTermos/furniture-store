import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "High Tech Wood | Premium Modern Furniture",
    template: "%s | High Tech Wood",
  },
  description:
    "Discover premium, thoughtfully designed furniture for modern living. Handcrafted pieces that blend form and function.",
  keywords: ["furniture", "modern furniture", "premium furniture", "home decor", "High Tech Wood"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "High Tech Wood",
    title: "High Tech Wood | Premium Modern Furniture",
    description:
      "Discover premium, thoughtfully designed furniture for modern living.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
