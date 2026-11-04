import type { Metadata } from "next";
import { FAQList } from "@/components/faq-list";
import { faqs } from "@/content/faqs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Typing Test and Typing Games FAQs",
  description:
    "Answers about the free FingerFox typing test, online typing games, WPM scores, privacy, mobile support, and daily challenge.",
  path: "/faq",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <main className="page-shell text-page">
      <p className="eyebrow">FINGERFOX HELP</p>
      <h1>Typing test and typing games FAQs</h1>
      <p className="lead">
        Quick answers about free typing practice, WPM results, privacy, and
        playing on mobile.
      </p>
      <FAQList items={faqs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  );
}
