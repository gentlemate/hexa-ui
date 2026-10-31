import { css, html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HxRangeElement } from "../../hx-range-element.js";

/**
 * @element hx-progress
 * @property indeterminate - The progress is unknown: the bar is animated and no value is displayed.
 * @property indeterminateAlternate - Same as `indeterminate`, but the bar goes back and forth across the track.
 * @cssprop [--hx-height-progress=0.5rem] - Height of the track.
 * @cssprop [--hx-radius-progress=9999px] - Border radius of the track and the fill.
 * @csspart label - The label.
 * @csspart value - The formatted value.
 * @csspart track - The track.
 * @csspart fill - The filled part of the track.
 */
@customElement("hx-progress")
export class HxProgress extends HxRangeElement {
    static override styles = [
        HxRangeElement.styles,
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

    override render() {
        return html`<div class="text-foreground flex flex-col gap-1.5">
            ${this.renderHeader(!this.unknown)}
            <div part="track" class="bg-field h-progress rounded-progress overflow-hidden">
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
        "hx-progress": HxProgress;
    }
}
