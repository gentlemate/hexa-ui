import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { OuiElement } from "../../oui-element.js";
import "./oui-color-swatch.js";
import type { OuiColorSwatch } from "./oui-color-swatch.js";

export type OuiColorSwatchPickerLayout = "horizontal" | "vertical" | "grid";
export type OuiColorSwatchPickerSize = "xs" | "sm" | "md" | "lg" | "xl";

const layouts: Record<OuiColorSwatchPickerLayout, string> = {
    horizontal: "flex flex-wrap",
    vertical: "flex flex-col items-start",
    grid: "grid w-fit",
};

/**
 * @element oui-color-swatch-picker
 * @property name - Name submitted with the form.
 * @property value - Value of the selected `oui-color-swatch`.
 * @property layout - `horizontal` wraps on several lines if needed, `vertical` stacks the swatches, `grid` arranges them in a square.
 * @property size - Size of the swatches, from `xs` 1rem to `xl` 3rem. The gap follows, from 0.5rem to 0.75rem. Without it, `--oui-size-color-swatch-picker` and `--oui-gap-color-swatch-picker` apply.
 * @property disabled - Prevents user interaction.
 * @property required - Marks the group as required for form validation.
 * @property invalid - Marks the field as invalid without displaying a message.
 * @property focusTarget - The swatch that receives the focus (read-only).
 * @slot - The `oui-color-swatch` elements.
 * @fires input - The user selected another swatch.
 * @fires change - The user selected another swatch.
 * @cssprop [--oui-size-color-swatch-picker=2rem] - Size of the swatches.
 * @cssprop [--oui-gap-color-swatch-picker=0.625rem] - Gap between the swatches.
 * @csspart swatches - The wrapper of the swatches.
 */
@customElement("oui-color-swatch-picker")
export class OuiColorSwatchPicker extends OuiElement {
    static formAssociated = true;
    static override styles = [
        OuiElement.styles,
        css`
            :host {
                display: block;
                --oui-size-color-swatch: var(--oui-size-color-swatch-picker);
                --swatch-gap: var(--oui-gap-color-swatch-picker);
                --swatch-ring: 2px;
            }
            :host([size="xs"]) {
                --oui-size-color-swatch: 1rem;
                --swatch-gap: 0.5rem;
                --swatch-ring: 2px;
            }
            :host([size="sm"]) {
                --oui-size-color-swatch: 1.5rem;
                --swatch-gap: 0.5rem;
                --swatch-ring: 2px;
            }
            :host([size="md"]) {
                --oui-size-color-swatch: 2rem;
                --swatch-gap: 0.625rem;
                --swatch-ring: 2px;
            }
            :host([size="lg"]) {
                --oui-size-color-swatch: 2.5rem;
                --swatch-gap: 0.75rem;
                --swatch-ring: 3px;
            }
            :host([size="xl"]) {
                --oui-size-color-swatch: 3rem;
                --swatch-gap: 0.75rem;
                --swatch-ring: 3px;
            }
            :host([disabled]) [part="swatches"] {
                pointer-events: none;
                opacity: 0.5;
            }
        `,
    ];

    @property({ reflect: true }) name = "";
    @property() value = "";
    @property({ reflect: true }) layout: OuiColorSwatchPickerLayout = "horizontal";
    @property({ reflect: true }) size?: OuiColorSwatchPickerSize;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;
    @property({ type: Boolean, reflect: true }) invalid = false;

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
        return [...this.querySelectorAll<OuiColorSwatch>(":scope > oui-color-swatch")];
    }

    get focusTarget() {
        const enabled = this.swatches.filter((swatch) => !swatch.disabled);
        return enabled.find((swatch) => swatch.value === this.value) ?? enabled[0];
    }

    private swatchFrom(target: EventTarget | null) {
        const swatch = target instanceof Element ? target.closest<OuiColorSwatch>("oui-color-swatch") : null;
        return swatch && swatch.parentElement === this && !swatch.disabled && !this.disabled ? swatch : null;
    }

    private select(swatch: OuiColorSwatch) {
        if (swatch.value === this.value) return;
        this.value = swatch.value;
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    private neighbor(swatch: OuiColorSwatch, key: string) {
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
        this.internals.ariaRequired = String(this.required);
        this.internals.ariaInvalid = String(this.invalid);
        this.internals.ariaDisabled = String(this.disabled);
    }

    formResetCallback() {
        this.value = this.getAttribute("value") ?? "";
    }

    override render() {
        return html`<div
            part="swatches"
            class="text-foreground ${layouts[this.layout]} gap-(--swatch-gap)"
            style=${styleMap({
                gridTemplateColumns: this.layout === "grid" ? `repeat(${this.columns}, max-content)` : undefined,
            })}
        >
            <slot @slotchange=${this.onSlotChange}></slot>
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-color-swatch-picker": OuiColorSwatchPicker;
    }
}
