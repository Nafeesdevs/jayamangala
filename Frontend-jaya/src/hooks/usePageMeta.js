/**
 * usePageMeta — sets <title> and <meta name="description"> for individual pages.
 * Call at the top of any page component.
 *
 * Usage:
 *   usePageMeta("Products – Jayamangala Agro Foods", "Browse all edible oils and food products.");
 */
import { useEffect } from "react";

const BASE = "Jayamangala Agro Foods";

export function usePageMeta(title, description) {
  useEffect(() => {
    if (title) {
      document.title = title.includes(BASE) ? title : `${title} | ${BASE}`;
    }
    if (description) {
      let el = document.querySelector('meta[name="description"]');
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", "description");
        document.head.appendChild(el);
      }
      el.setAttribute("content", description);
    }
    // Restore default on unmount
    return () => {
      document.title = `${BASE} | Quality Edible Oils & Food Products – Kumbakonam`;
    };
  }, [title, description]);
}

