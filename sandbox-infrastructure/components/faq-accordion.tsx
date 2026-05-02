"use client";
import { useRef } from "react";

import { faqItems } from "@/data/site-content";

export function FaqAccordion() {
  const refs = useRef<(HTMLDetailsElement | null)[]>([]);

  function handleToggle(index: number) {
    if (refs.current[index]?.open) {
      refs.current.forEach((el, i) => {
        if (el && i !== index) el.removeAttribute("open");
      });
    }
  }

  return (
    <div className="faq-list">
      {faqItems.map((item, index) => (
        <details
          className="faq-item"
          key={item.question}
          ref={(el) => { refs.current[index] = el; }}
          onToggle={() => handleToggle(index)}
        >
          <summary>{item.question}</summary>
          <p className="faq-answer">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
