import { LitElement, unsafeCSS, type CSSResultGroup } from "lit";
import tailwind from "./styles/tailwind.css?inline";

const properties = tailwind.match(/@property\s[^{]+\{[^}]*\}/g);
if (properties && typeof document !== "undefined") {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(properties.join("\n"));
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}

export abstract class HxElement extends LitElement {
    static override styles: CSSResultGroup = unsafeCSS(tailwind);
}
