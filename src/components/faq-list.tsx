import type { faqs } from "@/content/faqs";

type FAQListProps = {
  items: readonly (typeof faqs)[number][];
};

export function FAQList({ items }: FAQListProps) {
  return (
    <div className="faq-list">
      {items.map(({ question, answer }) => (
        <details className="faq-item" key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}
