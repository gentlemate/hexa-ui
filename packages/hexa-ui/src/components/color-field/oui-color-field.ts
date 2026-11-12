import { css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { formatColor, parseColor, type OuiColorFormat } from "../../color.js";
import { renderSwatch } from "../../color-swatch.js";
import { OuiElement } from "../../oui-element.js";

export type OuiColorFieldFormat = OuiColorFormat;

/**
 * @element oui-color-field
 * @property name - Name submitted with the form.
 * @property value - Current color, as a hex, `rgb()`, `hsl()` or `oklch()` string; kept as is until the user edits it.
 * @property format - Format of the value once the user edits it.
 * @property alpha - Keeps the transparency of the typed color.
 * @property placeholder - Text shown when the field is empty.
 * @property disabled - Prevents user interaction.
 * @property required - Marks the field as required for form validation.
 * @property invalid - Marks the field as invalid without displaying a message.
 * @property ariaLabel - Accessible name of the field, set with the `aria-label` attribute.
 * @property focusTarget - The inner element that receives the focus (read-only).
 * @fires input - The value changed, on blur or with the Enter key.
 * @fires change - The value changed, on blur or with the Enter key.
 * @cssprop [--oui-height-color-field=var(--oui-height-field)] - Height.
 * @cssprop [--oui-spacing-color-field=var(--oui-spacing-field)] - Horizontal padding.
 * @cssprop [--oui-radius-color-field=var(--oui-radius-field)] - Border radius.
 * @cssprop [--oui-size-color-swatch=1.25rem] - Size of the swatch.
 * @cssprop [--oui-radius-color-swatch=var(--oui-radius-pill)] - Border radius of the swatch.
 * @csspart control - The inner `<input>` element.
 * @csspart swatch - The preview of the color.
 */
@customElement("oui-color-field")
export class OuiColorField extends OuiElement {
    static formAssociated = true;
    static override shadowRootOptions = { ...OuiElement.shadowRootOptions, delegatesFocus: true };
    static override styles = [
        OuiElement.styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    @property({ reflect: true }) name = "";
    @property() value = "";
    @property({ reflect: true }) format: OuiColorFormat = "hex";
    @property({ type: Boolean, reflect: true }) alpha = false;
    @property() placeholder = "";
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;
    @property({ type: Boolean, reflect: true }) invalid = false;
    @property({ attribute: "aria-label" }) override ariaLabel: string | null = null;

    @query("#control") focusTarget!: HTMLInputElement;

    @state() private text?: string;

    private internals = this.attachInternals();

    private commit() {
        if (this.text === undefined) return;
        const text = this.text.trim();
        this.text = undefined;
        const color = parseColor(text) ?? parseColor(`#${text}`);
        if (text === this.value || (text && !color)) return;
        const value = color ? formatColor(color, this.format, this.alpha) : "";
        if (value === this.value) return;
        this.value = value;
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        this.commit();
        this.updateComplete.then(() => this.internals.form?.requestSubmit());
    }

    protected override updated() {
        this.internals.setFormValue(this.value);
        this.internals.setValidity(this.focusTarget.validity, this.focusTarget.validationMessage, this.focusTarget);
    }

    formResetCallback() {
        this.value = this.getAttribute("value") ?? "";
        this.text = undefined;
    }

    override render() {
        return html`
            <div
                ?data-invalid=${this.invalid}
                ?data-disabled=${this.disabled}
                class="text-foreground border-border bg-field focus-within:border-ring focus-within:ring-ring/50 data-invalid:border-destructive data-invalid:ring-destructive/20 rounded-color-field h-color-field px-color-field flex w-full items-center gap-2 border shadow-xs focus-within:ring-[3px] data-disabled:cursor-not-allowed data-disabled:opacity-50"
            >
                ${renderSwatch(this.value)}
                <input
                    id="control"
                    part="control"
                    type="text"
                    autocomplete="off"
                    autocorrect="off"
                    spellcheck="false"
                    class="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
                    .value=${this.text ?? this.value}
                    placeholder=${ifDefined(this.placeholder || undefined)}
                    aria-label=${this.ariaLabel || "Color"}
                    ?disabled=${this.disabled}
                    ?required=${this.required}
                    aria-invalid=${this.invalid ? "true" : "false"}
                    @input=${(event: Event) => {
                        event.stopPropagation();
                        this.text = (event.target as HTMLInputElement).value;
                    }}
                    @blur=${this.commit}
                    @keydown=${this.onKeyDown}
                />
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-color-field": OuiColorField;
    }
}
