import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ORIGIN = "https://finance4all-global-reach.vercel.app";
const DEFAULT_DESCRIPTION = "Explore open financial education, Finance Debriefed, research, programs, events and community chapters with Finance4All and FinanceMeta.";

export function usePageMetadata(title?: string, description = DEFAULT_DESCRIPTION, canonicalOverride?: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    const previousTitle = document.title;
    const fullTitle = title ? `${title} · Finance for All` : document.title;
    document.title = fullTitle;
    const restored: (() => void)[] = [];
    const set = (selector: string, tag: string, attributes: Record<string, string>, key: string, value: string) => {
      let element = document.head.querySelector(selector);
      const existed = Boolean(element);
      if (!element) { element = document.createElement(tag); Object.entries(attributes).forEach(([name, content]) => element!.setAttribute(name, content)); document.head.append(element); }
      const previous = element.getAttribute(key);
      element.setAttribute(key, value);
      const target = element;
      restored.push(() => { if (!existed) target.remove(); else if (previous === null) target.removeAttribute(key); else target.setAttribute(key, previous); });
    };
    const canonicalPath = canonicalOverride ?? pathname.replace(/^\/learn\/debriefs/, "/debriefed");
    set('link[rel="canonical"]', "link", { rel: "canonical" }, "href", `${ORIGIN}${canonicalPath}`);
    set('meta[name="description"]', "meta", { name: "description" }, "content", description);
    for (const [name, content] of Object.entries({ "og:title": fullTitle, "og:description": description, "og:url": `${ORIGIN}${canonicalPath}`, "og:type": "website" })) set(`meta[property="${name}"]`, "meta", { property: name }, "content", content);
    for (const [name, content] of Object.entries({ "twitter:title": fullTitle, "twitter:description": description })) set(`meta[name="${name}"]`, "meta", { name }, "content", content);
    return () => { document.title = previousTitle; restored.reverse().forEach(restore => restore()); };
  }, [pathname, title, description, canonicalOverride]);
}
