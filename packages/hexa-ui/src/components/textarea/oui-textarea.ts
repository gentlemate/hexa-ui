import { css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { OuiElement } from "../../oui-element.js";

/**
 * @element oui-textarea
 * @property name - Name submitted with the form.
 * @property value - Current value.
 * @property placeholder - Text shown when the field is empty.
 * @property rows - Number of visible text lines.
 * @property disabled - Prevents user interaction.
 * @property required - Marks the field as required for form validation.
 * @property invalid - Marks the field as invalid without displaying a message.
 * @property ariaLabel - Accessible name of the field, set with the `aria-label` attribute.
 * @property focusTarget - The inner element that receives the focus (read-only).
 * @fires input - The value changed (native event, crosses the Shadow DOM).
 * @fires change - The value was committed (re-dispatched, since the native `change` is not composed).
 * @cssprop [--oui-spacing-textarea=var(--oui-spacing-field)] - Horizontal padding.
 * @cssprop [--oui-radius-textarea=var(--oui-radius-field)] - Border radius.
 * @csspart control - The inner `<textarea>` element.
 */
@customElement("oui-textarea")
export class OuiTextarea extends OuiElement {
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
    @property() placeholder = "";
    @property({ type: Number }) rows = 3;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;
    @property({ type: Boolean, reflect: true }) invalid = false;
    @property({ attribute: "aria-label" }) override ariaLabel: string | null = null;

    @query("#control") focusTarget!: HTMLTextAreaElement;

    private internals = this.attachInternals();

    protected override updated() {
        this.internals.setFormValue(this.value);
        this.internals.setValidity(this.focusTarget.validity, this.focusTarget.validationMessage, this.focusTarget);
    }

    formResetCallback() {
        this.value = this.getAttribute("value") ?? "";
    }

    override render() {
        return html`
            <textarea
                id="control"
                part="control"
                class="text-foreground border-border bg-field placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 rounded-textarea px-textarea min-h-16 w-full resize-y border py-2 shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50"
                .value=${this.value}
                rows=${this.rows}
                placeholder=${ifDefined(this.placeholder || undefined)}
                ?disabled=${this.disabled}
                ?required=${this.required}
                aria-label=${ifDefined(this.ariaLabel || undefined)}
                aria-invalid=${this.invalid ? "true" : "false"}
                @input=${(e: Event) => (this.value = (e.target as HTMLTextAreaElement).value)}
                @change=${() => this.dispatchEvent(new Event("change", { bubbles: true, composed: true }))}
            ></textarea>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-textarea": OuiTextarea;
    }
}
