import { css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { HxElement } from "../../hx-element.js";

/**
 * @element hx-input
 * @property name - Name submitted with the form.
 * @property value - Current value.
 * @property type - Type of the inner `<input>`.
 * @property placeholder - Text shown when the field is empty.
 * @property disabled - Prevents user interaction.
 * @property required - Marks the field as required for form validation.
 * @property invalid - Marks the field as invalid without displaying a message.
 * @property ariaLabel - Accessible name of the field, set with the `aria-label` attribute.
 * @property focusTarget - The inner element that receives the focus (read-only).
 * @fires input - The value changed (native event, crosses the Shadow DOM).
 * @fires change - The value was committed (re-dispatched, since the native `change` is not composed).
 * @cssprop [--hx-height-input=var(--hx-height-field)] - Height.
 * @cssprop [--hx-spacing-input=var(--hx-spacing-field)] - Horizontal padding.
 * @cssprop [--hx-radius-input=var(--hx-radius-field)] - Border radius.
 * @csspart control - The inner `<input>` element.
 */
@customElement("hx-input")
export class HxInput extends HxElement {
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
    @property() type: "text" | "email" | "password" | "search" | "tel" | "url" | "number" = "text";
    @property() placeholder = "";
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;
    @property({ type: Boolean, reflect: true }) invalid = false;
    @property({ attribute: "aria-label" }) override ariaLabel: string | null = null;

    @query("#control") focusTarget!: HTMLInputElement;

    private internals = this.attachInternals();

    private onKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" && !event.isComposing) this.internals.form?.requestSubmit();
    }

    protected override updated() {
        this.internals.setFormValue(this.value);
        this.internals.setValidity(this.focusTarget.validity, this.focusTarget.validationMessage, this.focusTarget);
    }

    formResetCallback() {
        this.value = this.getAttribute("value") ?? "";
    }

    override render() {
        return html`
            <input
                id="control"
                part="control"
                class="text-foreground border-border bg-field placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 rounded-input h-input px-input w-full border shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50"
                .value=${this.value}
                type=${this.type}
                placeholder=${ifDefined(this.placeholder || undefined)}
                ?disabled=${this.disabled}
                ?required=${this.required}
                aria-label=${ifDefined(this.ariaLabel || undefined)}
                aria-invalid=${this.invalid ? "true" : "false"}
                @input=${(e: Event) => (this.value = (e.target as HTMLInputElement).value)}
                @change=${() => this.dispatchEvent(new Event("change", { bubbles: true, composed: true }))}
                @keydown=${this.onKeyDown}
            />
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-input": HxInput;
    }
}
