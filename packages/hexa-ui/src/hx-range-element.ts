import { html, nothing } from "lit";
import { property } from "lit/decorators.js";
import { localeOf } from "./date.js";
import { HxElement } from "./hx-element.js";

/**
 * @property value - Current number.
 * @property min - Smallest value.
 * @property max - Largest value.
 * @property label - Label displayed above the bar, next to the formatted value.
 * @property locale - Separators and digits of the displayed value; defaults to the closest `lang` attribute.
 * @property formatOptions - `Intl.NumberFormat` options of the displayed value, as JSON in the attribute. With `"style": "percent"`, the position between `min` and `max` is displayed.
 */
export abstract class HxRangeElement extends HxElement {
    @property({ type: Number }) value = 0;
    @property({ type: Number }) min = 0;
    @property({ type: Number }) max = 100;
    @property() label = "";
    @property() locale = "";
    @property({ type: Object, attribute: "format-options" }) formatOptions: Intl.NumberFormatOptions = {};

    protected clamp(value: number) {
        return Math.min(Math.max(value, this.min), this.max);
    }

    protected get fraction() {
        return this.max > this.min ? (this.clamp(this.value) - this.min) / (this.max - this.min) : 0;
    }

    protected get valueText() {
        const format = new Intl.NumberFormat(localeOf(this, this.locale), this.formatOptions ?? {});
        return format.format(format.resolvedOptions().style === "percent" ? this.fraction : this.clamp(this.value));
    }

    protected renderHeader(showValue: boolean) {
        if (!this.label) return nothing;
        return html`<div class="flex items-center justify-between gap-3">
            <span id="label" part="label">${this.label}</span>
            ${showValue ? html`<span part="value" class="text-muted-foreground tabular-nums">${this.valueText}</span>` : nothing}
        </div>`;
    }
}
