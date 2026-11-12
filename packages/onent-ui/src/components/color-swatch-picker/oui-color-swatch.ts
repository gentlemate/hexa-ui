import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Check } from "lucide";
import { renderSwatch } from "../../color-swatch.js";
import { OuiElement } from "../../oui-element.js";
import "../icon/oui-icon.js";

/**
 * @element oui-color-swatch
 * @property value - Color of the swatch, as a hex, `rgb()`, `hsl()` or `oklch()` string.
 * @property label - Accessible name of the swatch; defaults to `value`.
 * @property disabled - Prevents selecting the swatch.
 * @property selected - Whether the swatch is selected (set by the `oui-color-swatch-picker`).
 * @cssprop [--oui-size-color-swatch=1.25rem] - Size of the swatch.
 * @cssprop [--oui-radius-color-swatch=var(--oui-radius-pill)] - Border radius of the swatch.
 * @csspart base - The swatch wrapper, scaled on hover.
 * @csspart swatch - The preview of the color, ringed when selected.
 * @csspart check - The check of the selected swatch.
 */
@customElement("oui-color-swatch")
export class OuiColorSwatch extends OuiElement {
    static override styles = [
        OuiElement.styles,
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
            oui-icon::part(svg) {
                width: calc(var(--oui-size-color-swatch) / 2);
                height: calc(var(--oui-size-color-swatch) / 2);
            }
            [part="base"] {
                transition: scale 150ms ease;
            }
            :host(:not([selected]):hover) [part="base"] {
                scale: 1.1;
            }
            :host([selected]) [part="swatch"] {
                outline: var(--swatch-ring, 2px) solid var(--swatch-color);
                outline-offset: var(--swatch-ring, 2px);
            }
            :host(:focus-visible) [part="swatch"] {
                outline: var(--swatch-ring, 2px) solid var(--oui-ring);
                outline-offset: var(--swatch-ring, 2px);
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
        return html`<div part="base" class="rounded-color-swatch relative">
            ${renderSwatch(this.value)}
            ${
                this.selected
                    ? html`<span part="check" class="text-surface absolute inset-0 flex items-center justify-center">
                          <oui-icon .icon=${Check} stroke-width="3.5"></oui-icon>
                      </span>`
                    : nothing
            }
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-color-swatch": OuiColorSwatch;
    }
}
