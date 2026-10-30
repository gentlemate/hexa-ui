import { css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ChevronDown, ChevronUp, Minus, Plus, type IconNode } from "lucide";
import { localeOf } from "../../date.js";
import { HxElement } from "../../hx-element.js";
import "../icon/hx-icon.js";

export type HxNumberFieldVariant = "default" | "secondary";

function decimalsOf(value: number) {
    return String(value).split(".")[1]?.length ?? 0;
}

function parseNumber(text: string, format: Intl.NumberFormat) {
    const { locale, numberingSystem, style } = format.resolvedOptions();
    const base = new Intl.NumberFormat(locale, { numberingSystem, useGrouping: false });
    const decimal = base.formatToParts(0.5).find((part) => part.type === "decimal")?.value;
    const digits = [...base.format(9876543210)].reverse();
    const number = [...text]
        .map((char) =>
            char === decimal ? "." : /\d/.test(char) ? char : digits.includes(char) ? String(digits.indexOf(char)) : "",
        )
        .join("");
    if (!/\d/.test(number)) return NaN;
    return ((/[-−]/.test(text) ? -1 : 1) * Number(number)) / (style === "percent" ? 100 : 1);
}

/**
 * @element hx-number-field
 * @property name - Name submitted with the form.
 * @property value - Current number; `undefined` while the field is empty.
 * @property min - Smallest allowed value.
 * @property max - Largest allowed value.
 * @property step - Amount added or removed by the buttons, the arrow keys and the mouse wheel.
 * @property label - Label displayed above the field.
 * @property placeholder - Text shown when the field is empty.
 * @property hint - Help text under the field, replaced by `error` when set.
 * @property error - Error message under the field; also marks the field as invalid.
 * @property locale - Separators and digits of the number; defaults to the closest `lang` attribute.
 * @property formatOptions - `Intl.NumberFormat` options (currency, percent, unit, fraction digits…), as JSON in the attribute.
 * @property variant - `default` puts − and + on each side, `secondary` stacks two chevrons on the right.
 * @property disabled - Prevents user interaction.
 * @property required - Marks the field as required for form validation.
 * @fires input - The value changed.
 * @fires change - The value changed.
 * @cssprop [--hx-height-number-field=var(--hx-height-field)] - Height.
 * @cssprop [--hx-spacing-number-field=var(--hx-spacing-field)] - Horizontal padding.
 * @cssprop [--hx-radius-number-field=var(--hx-radius-field)] - Border radius.
 * @csspart control - The inner `<input>` element.
 * @csspart decrement - The button that removes `step`.
 * @csspart increment - The button that adds `step`.
 */
@customElement("hx-number-field")
export class HxNumberField extends HxElement {
    static formAssociated = true;
    static override shadowRootOptions = { ...HxElement.shadowRootOptions, delegatesFocus: true };
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    @property({ reflect: true }) name = "";
    @property({ type: Number }) value?: number;
    @property({ type: Number }) min?: number;
    @property({ type: Number }) max?: number;
    @property({ type: Number }) step = 1;
    @property() label = "";
    @property() placeholder = "";
    @property() hint = "";
    @property() error = "";
    @property() locale = "";
    @property({ type: Object, attribute: "format-options" }) formatOptions: Intl.NumberFormatOptions = {};
    @property({ reflect: true }) variant: HxNumberFieldVariant = "default";
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;

    @query("#control") private input!: HTMLInputElement;

    @state() private text?: string;

    private internals = this.attachInternals();

    private get formatter() {
        return new Intl.NumberFormat(localeOf(this, this.locale), this.formatOptions ?? {});
    }

    private clamp(value: number) {
        return Math.min(Math.max(value, this.min ?? -Infinity), this.max ?? Infinity);
    }

    private round(value: number) {
        const { maximumFractionDigits = 20, style } = this.formatter.resolvedOptions();
        return Number(value.toFixed(Math.min(maximumFractionDigits + (style === "percent" ? 2 : 0), 100)));
    }

    private setValue(value: number | undefined) {
        this.text = undefined;
        if (value === (this.value ?? undefined)) return;
        this.value = value;
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    private commit() {
        if (this.text === undefined) return;
        if (!this.text.trim()) return this.setValue(undefined);
        const value = parseNumber(this.text, this.formatter);
        if (isNaN(value)) this.text = undefined;
        else this.setValue(this.clamp(this.round(value)));
    }

    private increment(direction: number) {
        this.commit();
        const value = this.value ?? undefined;
        if (value === undefined) return this.setValue(this.clamp(0));
        const decimals = Math.max(decimalsOf(value), decimalsOf(this.step));
        this.setValue(this.clamp(Number((value + direction * this.step).toFixed(decimals))));
    }

    private onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case "ArrowUp":
            case "ArrowDown":
                this.increment(event.key === "ArrowUp" ? 1 : -1);
                break;
            case "Home":
            case "End": {
                const bound = event.key === "Home" ? this.min : this.max;
                if (bound == null) return;
                this.setValue(bound);
                break;
            }
            case "Enter":
                this.commit();
                break;
            default:
                return;
        }
        event.preventDefault();
    }

    private onWheel(event: WheelEvent) {
        if (!event.deltaY || this.shadowRoot?.activeElement !== this.input) return;
        event.preventDefault();
        this.increment(event.deltaY < 0 ? 1 : -1);
    }

    protected override updated() {
        this.internals.setFormValue(this.value == null ? "" : String(this.value));
    }

    formResetCallback() {
        const value = this.getAttribute("value");
        this.value = value ? Number(value) : undefined;
        this.text = undefined;
    }

    private renderStepper(direction: 1 | -1, icon: IconNode, size: number, classes: string) {
        const bound = direction > 0 ? this.max : this.min;
        const limited =
            this.value != null && bound != null && (direction > 0 ? this.value >= bound : this.value <= bound);
        return html`<button
            part=${direction > 0 ? "increment" : "decrement"}
            type="button"
            tabindex="-1"
            aria-label=${direction > 0 ? "Increase" : "Decrease"}
            ?disabled=${this.disabled || limited}
            class="${classes} ${
                limited ? "opacity-50" : ""
            } text-muted-foreground hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center justify-center disabled:pointer-events-none"
            @mousedown=${(event: MouseEvent) => {
                event.preventDefault();
                this.input.focus();
            }}
            @click=${() => this.increment(direction)}
        >
            <hx-icon .icon=${icon} size=${size}></hx-icon>
        </button>`;
    }

    override render() {
        const formatted = this.value == null ? "" : this.formatter.format(this.value);
        const secondary = this.variant === "secondary";
        const input = html`<input
            id="control"
            part="control"
            type="text"
            inputmode="decimal"
            role="spinbutton"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            class="${
                secondary ? "" : "text-center"
            } placeholder:text-muted-foreground px-number-field min-w-0 flex-1 bg-transparent tabular-nums outline-none disabled:cursor-not-allowed"
            .value=${this.text ?? formatted}
            placeholder=${ifDefined(this.placeholder || undefined)}
            ?disabled=${this.disabled}
            ?required=${this.required}
            aria-valuenow=${ifDefined(this.value ?? undefined)}
            aria-valuetext=${ifDefined(formatted || undefined)}
            aria-valuemin=${ifDefined(this.min ?? undefined)}
            aria-valuemax=${ifDefined(this.max ?? undefined)}
            aria-invalid=${this.error ? "true" : "false"}
            @input=${(event: Event) => {
                event.stopPropagation();
                this.text = (event.target as HTMLInputElement).value;
            }}
            @blur=${this.commit}
            @keydown=${this.onKeyDown}
            @wheel=${this.onWheel}
        />`;
        return html`
            <div class="text-foreground flex flex-col gap-1.5">
                ${
                    this.label
                        ? html`<label for="control"
                              >${this.label}${
                                  this.required
                                      ? html`<span class="text-destructive ml-0.5" aria-hidden="true">*</span>`
                                      : nothing
                              }</label
                          >`
                        : nothing
                }
                <div
                    ?data-invalid=${!!this.error}
                    ?data-disabled=${this.disabled}
                    class="border-border bg-field focus-within:border-ring focus-within:ring-ring/50 data-invalid:border-destructive data-invalid:ring-destructive/20 rounded-number-field h-number-field flex w-full overflow-hidden border shadow-xs focus-within:ring-[3px] data-disabled:cursor-not-allowed data-disabled:opacity-50"
                >
                    ${
                        secondary
                            ? html`${input}
                                  <div class="border-border flex flex-col border-l">
                                      ${this.renderStepper(1, ChevronUp, 14, "flex-1 px-1.5")}
                                      ${this.renderStepper(-1, ChevronDown, 14, "border-border flex-1 border-t px-1.5")}
                                  </div>`
                            : html`${this.renderStepper(-1, Minus, 16, "border-border w-(--height-number-field) border-r")}
                              ${input}
                              ${this.renderStepper(1, Plus, 16, "border-border w-(--height-number-field) border-l")}`
                    }
                </div>
                ${
                    this.error
                        ? html`<p class="text-destructive text-sm" role="alert">${this.error}</p>`
                        : this.hint
                          ? html`<p class="text-muted-foreground text-sm">${this.hint}</p>`
                          : nothing
                }
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-number-field": HxNumberField;
    }
}
