import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { HxElement } from "../../hx-element.js";

/**
 * @element hx-input
 * @property name - Name submitted with the form.
 * @property value - Current value.
 * @property type - Type of the inner `<input>`.
 * @property label - Label displayed above the field.
 * @property placeholder - Text shown when the field is empty.
 * @property hint - Help text under the field, replaced by `error` when set.
 * @property error - Error message under the field; also marks the field as invalid.
 * @property disabled - Prevents user interaction.
 * @property required - Marks the field as required for form validation.
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
    @property() label = "";
    @property() placeholder = "";
    @property() hint = "";
    @property() error = "";
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;

    private internals = this.attachInternals();

    protected override updated() {
        this.internals.setFormValue(this.value);
    }

    formResetCallback() {
        this.value = this.getAttribute("value") ?? "";
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
                <input
                    id="control"
                    part="control"
                    class="border-border bg-field placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 rounded-input h-input px-input w-full border shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50"
                    .value=${this.value}
                    type=${this.type}
                    placeholder=${ifDefined(this.placeholder || undefined)}
                    ?disabled=${this.disabled}
                    ?required=${this.required}
                    aria-invalid=${this.error ? "true" : "false"}
                    @input=${(e: Event) => (this.value = (e.target as HTMLInputElement).value)}
                    @change=${() => this.dispatchEvent(new Event("change", { bubbles: true, composed: true }))}
                />
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
        "hx-input": HxInput;
    }
}
