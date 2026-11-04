import type { Metadata, Viewport } from "next";
import { Header, Footer } from "@/components/site-shell";
import { ConsentBanner } from "@/components/consent-banner";
import { ServiceWorker } from "@/components/service-worker";
import { InstallPrompt } from "@/components/install-prompt";
import { geistMono, manrope, montserrat, onest } from "@/lib/fonts";
import { business } from "../../config/business";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl.startsWith("https://") ? business.siteUrl : "https://fingerfox.example"),
  title: { default: "FingerFox | Find your typing rhythm", template: "%s | FingerFox" },
  description: "Free, friendly typing games that help you find your rhythm. Practice privately with progress saved on your device.",
  applicationName: "FingerFox",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/fingerfox-192.png", apple: "/icons/fingerfox-192.png" },
  openGraph: { title: "FingerFox", description: "A little practice goes a long way.", type: "website" },
};

export const viewport: Viewport = { themeColor: "#171715", colorScheme: "dark light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const initializeTheme = `try { document.documentElement.dataset.theme = localStorage.getItem('fingerfox-theme-v1') || 'system'; } catch { document.documentElement.dataset.theme = 'system'; }`;
  return <html lang="en" data-theme="system" suppressHydrationWarning data-scroll-behavior="smooth" className={`${manrope.variable} ${montserrat.variable} ${onest.variable} ${geistMono.variable}`}><head><script dangerouslySetInnerHTML={{ __html: initializeTheme }} /></head><body><a className="skip-link" href="#main-content">Skip to content</a><Header /><div id="main-content">{children}</div><Footer /><ConsentBanner /><InstallPrompt /><ServiceWorker /></body></html>;
}
