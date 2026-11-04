import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({
  title: "FingerFox Refund Policy",
  description: "Review the FingerFox refund policy. The typing games and online typing test are free, with no purchases or subscriptions in this release.",
  path: "/refund",
});
export default function RefundPage() { return <main className="page-shell text-page"><p className="eyebrow">REFUND POLICY · VERSION 1.0.0</p><h1>FingerFox is free.</h1><p className="lead">There are no purchases, subscriptions, or fees in this version.</p><div className="prose"><p>Because FingerFox currently offers no paid products or services, there is nothing to refund. If paid features are introduced later, this page will be updated before they are offered.</p><p>Refund policy version 1.0.0. Last updated November 2, 2026.</p></div></main>; }
