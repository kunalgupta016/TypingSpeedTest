import type { Metadata, Viewport } from "next";
import { Header, Footer } from "@/components/site-shell";
import { ConsentBanner } from "@/components/consent-banner";
import { ServiceWorker } from "@/components/service-worker";
import { InstallPrompt } from "@/components/install-prompt";
import { geistMono, manrope, montserrat, onest } from "@/lib/fonts";
import { business } from "../../config/business";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: { default: "Free Typing Games & Typing Test | FingerFox", template: "%s | FingerFox" },
  description: "Play free online typing games and take a typing test. Practice accuracy and speed, track progress privately, and play without an account.",
  applicationName: "FingerFox",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/fingerfox-192.png", apple: "/icons/fingerfox-192.png" },
  openGraph: {
    title: "Free Typing Games and Typing Test",
    description: "Play free online typing games and take a typing test. Practice privately without an account.",
    siteName: "FingerFox",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = { themeColor: "#171715", colorScheme: "dark light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const initializeTheme = `try { document.documentElement.dataset.theme = localStorage.getItem('fingerfox-theme-v1') || 'system'; } catch { document.documentElement.dataset.theme = 'system'; }`;
  return <html lang="en" data-theme="system" suppressHydrationWarning data-scroll-behavior="smooth" className={`${manrope.variable} ${montserrat.variable} ${onest.variable} ${geistMono.variable}`}><head><script dangerouslySetInnerHTML={{ __html: initializeTheme }} /></head><body><a className="skip-link" href="#main-content">Skip to content</a><Header /><div id="main-content">{children}</div><Footer /><ConsentBanner /><InstallPrompt /><ServiceWorker /></body></html>;
}
