import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createElement, type IconNode } from "lucide";
import { HxElement } from "../../hx-element.js";

/**
 * @element hx-icon
 * @property icon - Lucide icon to render, set as a JS property.
 * @property size - Width and height in pixels.
 * @property strokeWidth - Stroke width of the paths.
 * @property label - Accessible name; without it, the icon is decorative.
 * @csspart svg - The inner `<svg>` element.
 */
@customElement("hx-icon")
export class HxIcon extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: inline-flex;
                flex-shrink: 0;
            }
        `,
    ];

    @property({ attribute: false }) icon?: IconNode;
    @property({ type: Number }) size = 16;
    @property({ type: Number, attribute: "stroke-width" }) strokeWidth = 2;
    @property() label = "";

    override render() {
        if (!this.icon) return nothing;
        const svg = createElement(this.icon, {
            width: String(this.size),
            height: String(this.size),
            "stroke-width": String(this.strokeWidth),
            part: "svg",
        });
        if (this.label) {
            svg.setAttribute("role", "img");
            svg.setAttribute("aria-label", this.label);
        } else {
            svg.setAttribute("aria-hidden", "true");
        }
        return html`${svg}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-icon": HxIcon;
    }
}
