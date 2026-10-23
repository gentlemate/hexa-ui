import { LitElement, unsafeCSS, type CSSResultGroup } from "lit";
import tailwind from "./styles/tailwind.css?inline";

/**
 * Browsers ignore `@property` inside a Shadow DOM: without these registrations, the `--tw-*`
 * variables (border-style, shadow, ring…) have no initial value and `border`, `shadow-xs` and
 * `ring-*` render nothing. Registered once at the document level, they apply everywhere.
 */
const properties = tailwind.match(/@property\s[^{]+\{[^}]*\}/g);
if (properties && typeof document !== "undefined") {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(properties.join("\n"));
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}

/* Base class for all components: injects Tailwind into the Shadow DOM (shared stylesheet). */
export abstract class HxElement extends LitElement {
    static override styles: CSSResultGroup = unsafeCSS(tailwind);
}
