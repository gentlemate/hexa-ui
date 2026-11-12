import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { parseColor } from "./color.js";

export function renderSwatch(color: string, part = "swatch") {
    return html`<span
        part=${part}
        class="bg-swatch rounded-color-swatch size-color-swatch border-foreground/10 block shrink-0 border"
        style=${styleMap({ "--swatch-color": parseColor(color) ? color : "transparent" })}
    ></span>`;
}
