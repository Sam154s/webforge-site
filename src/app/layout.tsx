import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WebForge - Bespoke Websites for Businesses That Mean It",
  description:
    "We build clean, bespoke websites that convert. No templates. No AI slop. A system that takes care of everything.",
  openGraph: {
    title: "WebForge",
    description: "Bespoke websites. Built for businesses that mean it.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${GeistSans.variable}`}>
      <body className="font-sans bg-bg text-text antialiased">
        <div className="grain-overlay" aria-hidden="true" />
        <SmoothScroll>
          <CustomCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
