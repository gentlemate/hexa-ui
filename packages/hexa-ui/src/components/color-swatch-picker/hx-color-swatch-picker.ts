import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { HxElement } from "../../hx-element.js";
import "./hx-color-swatch.js";
import type { HxColorSwatch } from "./hx-color-swatch.js";

export type HxColorSwatchPickerLayout = "horizontal" | "vertical" | "grid";
export type HxColorSwatchPickerSize = "xs" | "sm" | "md" | "lg" | "xl";

const layouts: Record<HxColorSwatchPickerLayout, string> = {
    horizontal: "flex flex-wrap",
    vertical: "flex flex-col items-start",
    grid: "grid w-fit",
};

/**
 * @element hx-color-swatch-picker
 * @property name - Name submitted with the form.
 * @property value - Value of the selected `hx-color-swatch`.
 * @property layout - `horizontal` wraps on several lines if needed, `vertical` stacks the swatches, `grid` arranges them in a square.
 * @property size - Size of the swatches, from `xs` 1rem to `xl` 3rem. The gap follows, from 0.5rem to 0.75rem. Without it, `--hx-size-color-swatch-picker` and `--hx-gap-color-swatch-picker` apply.
 * @property label - Label displayed above the swatches.
 * @property hint - Help text under the swatches, replaced by `error` when set.
 * @property error - Error message under the swatches; also marks the group as invalid.
 * @property disabled - Prevents user interaction.
 * @property required - Marks the group as required for form validation.
 * @property focusTarget - The swatch that receives the focus (read-only).
 * @slot - The `hx-color-swatch` elements.
 * @fires input - The user selected another swatch.
 * @fires change - The user selected another swatch.
 * @cssprop [--hx-size-color-swatch-picker=2rem] - Size of the swatches.
 * @cssprop [--hx-gap-color-swatch-picker=0.625rem] - Gap between the swatches.
 * @csspart label - The label.
 * @csspart swatches - The wrapper of the swatches.
 */
@customElement("hx-color-swatch-picker")
export class HxColorSwatchPicker extends HxElement {
    static formAssociated = true;
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
                --hx-size-color-swatch: var(--hx-size-color-swatch-picker);
                --swatch-gap: var(--hx-gap-color-swatch-picker);
            }
            :host([size="xs"]) {
                --hx-size-color-swatch: 1rem;
                --swatch-gap: 0.5rem;
            }
            :host([size="sm"]) {
                --hx-size-color-swatch: 1.5rem;
                --swatch-gap: 0.5rem;
            }
            :host([size="md"]) {
                --hx-size-color-swatch: 2rem;
                --swatch-gap: 0.625rem;
            }
            :host([size="lg"]) {
                --hx-size-color-swatch: 2.5rem;
                --swatch-gap: 0.75rem;
            }
            :host([size="xl"]) {
                --hx-size-color-swatch: 3rem;
                --swatch-gap: 0.75rem;
            }
            :host([disabled]) [part="swatches"] {
                pointer-events: none;
                opacity: 0.5;
            }
        `,
    ];

    @property({ reflect: true }) name = "";
    @property() value = "";
    @property({ reflect: true }) layout: HxColorSwatchPickerLayout = "horizontal";
    @property({ reflect: true }) size?: HxColorSwatchPickerSize;
    @property() label = "";
    @property() hint = "";
    @property() error = "";
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;

    @state() private columns = 1;

    private internals = this.attachInternals();

    constructor() {
        super();
        this.internals.role = "radiogroup";
        this.addEventListener("click", (event) => {
            const swatch = this.swatchFrom(event.target);
            if (swatch) this.select(swatch);
        });
        this.addEventListener("keydown", (event) => this.onKeyDown(event));
    }

    private get swatches() {
        return [...this.querySelectorAll<HxColorSwatch>(":scope > hx-color-swatch")];
    }

    get focusTarget() {
        const enabled = this.swatches.filter((swatch) => !swatch.disabled);
        return enabled.find((swatch) => swatch.value === this.value) ?? enabled[0];
    }

    private swatchFrom(target: EventTarget | null) {
        const swatch = target instanceof Element ? target.closest<HxColorSwatch>("hx-color-swatch") : null;
        return swatch && swatch.parentElement === this && !swatch.disabled && !this.disabled ? swatch : null;
    }

    private select(swatch: HxColorSwatch) {
        if (swatch.value === this.value) return;
        this.value = swatch.value;
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    private neighbor(swatch: HxColorSwatch, key: string) {
        const swatches = this.swatches;
        const row = this.layout === "grid" ? this.columns : 1;
        const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: row, ArrowUp: -row }[key];
        if (!step) return undefined;
        const count = swatches.length;
        const index = swatches.indexOf(swatch);
        for (let distance = 1; distance <= count; distance++) {
            const next = swatches[(((index + step * distance) % count) + count) % count];
            if (!next.disabled) return next;
        }
        return undefined;
    }

    private onKeyDown(event: KeyboardEvent) {
        const swatch = this.swatchFrom(event.target);
        if (!swatch) return;
        const enabled = this.swatches.filter((swatch) => !swatch.disabled);
        const next =
            event.key === " "
                ? swatch
                : event.key === "Home"
                  ? enabled[0]
                  : event.key === "End"
                    ? enabled.at(-1)
                    : this.neighbor(swatch, event.key);
        if (!next) return;
        event.preventDefault();
        next.focus();
        this.select(next);
    }

    private sync() {
        const target = this.focusTarget;
        for (const swatch of this.swatches) {
            swatch.selected = swatch.value === this.value;
            swatch.tabIndex = swatch === target && !this.disabled ? 0 : -1;
        }
    }

    private onSlotChange() {
        this.columns = Math.ceil(Math.sqrt(this.swatches.length));
        this.sync();
    }

    protected override updated() {
        this.sync();
        this.internals.setFormValue(this.value);
        if (this.required && !this.value)
            this.internals.setValidity({ valueMissing: true }, "Please select a color.", this.focusTarget);
        else this.internals.setValidity({});
        this.internals.ariaLabel = this.label || null;
        this.internals.ariaRequired = String(this.required);
        this.internals.ariaInvalid = String(!!this.error);
        this.internals.ariaDisabled = String(this.disabled);
    }

    formResetCallback() {
        this.value = this.getAttribute("value") ?? "";
    }

    override render() {
        return html`<div class="text-foreground flex flex-col gap-1.5">
            ${
                this.label
                    ? html`<span id="label" part="label" @click=${() => this.focusTarget?.focus()}
                          >${this.label}${
                              this.required
                                  ? html`<span class="text-destructive ml-0.5" aria-hidden="true">*</span>`
                                  : nothing
                          }</span
                      >`
                    : nothing
            }
            <div
                part="swatches"
                class="${layouts[this.layout]} gap-(--swatch-gap)"
                style=${styleMap({
                    gridTemplateColumns: this.layout === "grid" ? `repeat(${this.columns}, max-content)` : undefined,
                })}
            >
                <slot @slotchange=${this.onSlotChange}></slot>
            </div>
            ${
                this.error
                    ? html`<p class="text-destructive text-sm" role="alert">${this.error}</p>`
                    : this.hint
                      ? html`<p class="text-muted-foreground text-sm">${this.hint}</p>`
                      : nothing
            }
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-color-swatch-picker": HxColorSwatchPicker;
    }
}
