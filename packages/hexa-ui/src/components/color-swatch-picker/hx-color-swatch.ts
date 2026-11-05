import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Check } from "lucide";
import { renderSwatch } from "../../color-swatch.js";
import { HxElement } from "../../hx-element.js";
import "../icon/hx-icon.js";

/**
 * @element hx-color-swatch
 * @property value - Color of the swatch, as a hex, `rgb()`, `hsl()` or `oklch()` string.
 * @property label - Accessible name of the swatch; defaults to `value`.
 * @property disabled - Prevents selecting the swatch.
 * @property selected - Whether the swatch is selected (set by the `hx-color-swatch-picker`).
 * @cssprop [--hx-size-color-swatch=1.25rem] - Size of the swatch.
 * @cssprop [--hx-radius-color-swatch=var(--hx-radius-pill)] - Border radius of the swatch.
 * @csspart base - The swatch wrapper, ringed when selected.
 * @csspart swatch - The preview of the color.
 * @csspart check - The check of the selected swatch.
 */
@customElement("hx-color-swatch")
export class HxColorSwatch extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
                cursor: pointer;
                outline: none;
            }
            :host([disabled]) {
                pointer-events: none;
                opacity: 0.5;
            }
            hx-icon::part(svg) {
                width: calc(var(--hx-size-color-swatch) / 2);
                height: calc(var(--hx-size-color-swatch) / 2);
            }
            :host(:focus-visible) [part="base"] {
                box-shadow: 0 0 0 3px color-mix(in oklab, var(--hx-ring) 50%, transparent);
            }
        `,
    ];

    @property({ reflect: true }) value = "";
    @property() label = "";
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) selected = false;

    private internals = this.attachInternals();

    constructor() {
        super();
        this.internals.role = "radio";
    }

    protected override updated() {
        this.internals.ariaChecked = String(this.selected);
        this.internals.ariaDisabled = String(this.disabled);
        this.internals.ariaLabel = this.label || this.value;
    }

    override render() {
        return html`<div part="base" class="${this.selected ? "ring-ring ring-2" : ""} rounded-color-swatch relative">
            ${renderSwatch(this.value)}
            ${
                this.selected
                    ? html`<span part="check" class="text-surface absolute inset-0 flex items-center justify-center">
                          <hx-icon .icon=${Check} stroke-width="3.5"></hx-icon>
                      </span>`
                    : nothing
            }
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-color-swatch": HxColorSwatch;
    }
}
