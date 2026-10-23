import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { HxElement } from "../../hx-element.js";

/**
 * @element hx-input
 * @fires input - The value changed (native event, crosses the Shadow DOM).
 * @fires change - The value was committed (re-dispatched, since the native `change` is not composed).
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
                    class="border-input bg-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 rounded-control h-input px-input w-full border shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50"
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
