import type { Metadata } from "next";
import Link from "next/link";
import { business } from "../../../config/business";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FingerFox Terms of Use",
  description: "Read the terms for using FingerFox's free online typing games, typing test, and browser-based practice tools.",
  path: "/terms",
});

export default function TermsPage() {
  const configured = !business.legalName.startsWith("PLACEHOLDER");
  return <main className="page-shell text-page">
    <p className="eyebrow">Terms of use - Version 1.0.0</p>
    <h1>Simple terms for a free practice tool.</h1>
    <p className="lead">By using FingerFox, you agree to these terms.</p>
    <div className="prose">
      <p>Effective November 2, 2026. FingerFox provides free, browser-based typing games for personal practice. No account or payment is required. No paid products are offered in this version.</p>
      <h2>Use of the service</h2>
      <p>Please use the games lawfully and do not attempt to disrupt the website or interfere with other users. The games are provided for practice and entertainment and do not guarantee a particular typing outcome.</p>
      <h2>Your data</h2>
      <p>Guest run summaries and aggregated key metrics are stored in your browser. They are not synchronized or backed up by FingerFox. You are responsible for exporting any data you want to keep before clearing browser storage.</p>
      <h2>Availability and changes</h2>
      <p>We may update or discontinue features. The service is provided as available. To the extent permitted by applicable law, FingerFox disclaims implied warranties. Nothing in these terms limits rights that cannot legally be limited.</p>
      <h2>Provider and contact</h2>
      {configured ? <p>{business.legalName}, trading as FingerFox, {business.address}. Contact: <a href={`mailto:${business.contactEmail}`}>{business.contactEmail}</a>.</p> : <p>The operator legal name, public address, and contact details must be configured before public launch. Current details are listed on the <Link href="/contact">contact page</Link>.</p>}
      <p>Terms version 1.0.0. Last updated November 2, 2026.</p>
    </div>
  </main>;
}
