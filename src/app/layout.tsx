import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WebForge: find the bottleneck, build the fix",
  description:
    "We find the problem costing your business the most, build the AI system that fixes it on your own accounts, and report what it's worth every month.",
  openGraph: {
    title: "WebForge",
    description: "Find the bottleneck. Build the fix. Measure it every month.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={`${spaceGrotesk.variable} ${GeistSans.variable}`}>
      <body className="font-sans bg-bg text-text antialiased">
        <div className="grain-overlay" aria-hidden="true" />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
