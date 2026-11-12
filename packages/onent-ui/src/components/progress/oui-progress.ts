import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { OuiRangeElement } from "../../oui-range-element.js";

/**
 * @element oui-progress
 * @property label - Label displayed above the bar, next to the formatted value.
 * @property indeterminate - The progress is unknown: the bar is animated and no value is displayed.
 * @property indeterminateAlternate - Same as `indeterminate`, but the bar goes back and forth across the track.
 * @cssprop [--oui-height-progress=0.5rem] - Height of the track.
 * @cssprop [--oui-radius-progress=var(--oui-radius-pill)] - Border radius of the track and the fill.
 * @csspart label - The label.
 * @csspart value - The formatted value.
 * @csspart track - The track.
 * @csspart fill - The filled part of the track.
 */
@customElement("oui-progress")
export class OuiProgress extends OuiRangeElement {
    static override styles = [
        OuiRangeElement.styles,
        css`
            :host {
                display: block;
            }
            @keyframes indeterminate {
                from {
                    translate: -100%;
                }
                to {
                    translate: 250%;
                }
            }
        `,
    ];

    @property() label = "";
    @property({ type: Boolean, reflect: true }) indeterminate = false;
    @property({ type: Boolean, reflect: true, attribute: "indeterminate-alternate" }) indeterminateAlternate = false;

    private internals = this.attachInternals();

    constructor() {
        super();
        this.internals.role = "progressbar";
    }

    private get unknown() {
        return this.indeterminate || this.indeterminateAlternate;
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        this.internals.ariaLabel = this.label || null;
        this.internals.ariaValueMin = String(this.min);
        this.internals.ariaValueMax = String(this.max);
        this.internals.ariaValueNow = this.unknown ? null : String(this.clamp(this.value));
        this.internals.ariaValueText = this.unknown ? null : this.valueText;
    }

    protected renderHeader(showValue: boolean) {
        if (!this.label) return nothing;
        return html`<div class="flex items-center justify-between gap-3">
            <span id="label" part="label">${this.label}</span>
            ${showValue ? html`<span part="value" class="text-muted-foreground tabular-nums">${this.valueText}</span>` : nothing}
        </div>`;
    }

    override render() {
        return html`<div class="text-foreground flex flex-col gap-1.5">
            ${this.renderHeader(!this.unknown)}
            <div part="track" class="bg-muted h-progress rounded-progress overflow-hidden">
                <div
                    part="fill"
                    class="bg-primary ${
                        this.unknown
                            ? this.indeterminateAlternate
                                ? "w-2/5 animate-[indeterminate_1.5s_ease-in-out_infinite_alternate]"
                                : "w-2/5 animate-[indeterminate_1.5s_ease-in-out_infinite]"
                            : "transition-[width]"
                    } rounded-progress h-full"
                    style=${this.unknown ? "" : `width: ${this.fraction * 100}%`}
                ></div>
            </div>
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-progress": OuiProgress;
    }
}
