import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { formatColor, parseColor, type HxColorFormat } from "../../color.js";
import { renderSwatch } from "../../color-swatch.js";
import { HxElement } from "../../hx-element.js";

export type HxColorFieldFormat = HxColorFormat;

/**
 * @element hx-color-field
 * @property name - Name submitted with the form.
 * @property value - Current color, as a hex, `rgb()`, `hsl()` or `oklch()` string; kept as is until the user edits it.
 * @property format - Format of the value once the user edits it.
 * @property alpha - Keeps the transparency of the typed color.
 * @property label - Label displayed above the field.
 * @property placeholder - Text shown when the field is empty.
 * @property hint - Help text under the field, replaced by `error` when set.
 * @property error - Error message under the field; also marks the field as invalid.
 * @property disabled - Prevents user interaction.
 * @property required - Marks the field as required for form validation.
 * @fires input - The value changed, on blur or with the Enter key.
 * @fires change - The value changed, on blur or with the Enter key.
 * @cssprop [--hx-height-color-field=var(--hx-height-field)] - Height.
 * @cssprop [--hx-spacing-color-field=var(--hx-spacing-field)] - Horizontal padding.
 * @cssprop [--hx-radius-color-field=var(--hx-radius-field)] - Border radius.
 * @cssprop [--hx-size-color-swatch=1.25rem] - Size of the swatch.
 * @cssprop [--hx-radius-color-swatch=var(--hx-radius-pill)] - Border radius of the swatch.
 * @csspart control - The inner `<input>` element.
 * @csspart swatch - The preview of the color.
 */
@customElement("hx-color-field")
export class HxColorField extends HxElement {
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
    @property() value = "";
    @property({ reflect: true }) format: HxColorFormat = "hex";
    @property({ type: Boolean, reflect: true }) alpha = false;
    @property() label = "";
    @property() placeholder = "";
    @property() hint = "";
    @property() error = "";
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;

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
    }

    protected override updated() {
        this.internals.setFormValue(this.value);
    }

    formResetCallback() {
        this.value = this.getAttribute("value") ?? "";
        this.text = undefined;
    }

    override render() {
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
                    class="border-border bg-field focus-within:border-ring focus-within:ring-ring/50 data-invalid:border-destructive data-invalid:ring-destructive/20 rounded-color-field h-color-field px-color-field flex w-full items-center gap-2 border shadow-xs focus-within:ring-[3px] data-disabled:cursor-not-allowed data-disabled:opacity-50"
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
                        aria-label=${ifDefined(this.label ? undefined : "Color")}
                        ?disabled=${this.disabled}
                        ?required=${this.required}
                        aria-invalid=${this.error ? "true" : "false"}
                        @input=${(event: Event) => {
                            event.stopPropagation();
                            this.text = (event.target as HTMLInputElement).value;
                        }}
                        @blur=${this.commit}
                        @keydown=${this.onKeyDown}
                    />
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
        "hx-color-field": HxColorField;
    }
}
