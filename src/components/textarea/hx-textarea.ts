import { css, html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { HxElement } from "../../hx-element.js";

/**
 * @element hx-textarea
 * @fires input - The value changed (native event, crosses the Shadow DOM).
 * @fires change - The value was committed (re-dispatched, since the native `change` is not composed).
 * @csspart control - The inner `<textarea>` element.
 */
@customElement("hx-textarea")
export class HxTextarea extends HxElement {
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
    @property() label = "";
    @property() placeholder = "";
    @property() hint = "";
    @property() error = "";
    @property({ type: Number }) rows = 3;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;

    @query("textarea") private control!: HTMLTextAreaElement;

    private internals = this.attachInternals();

    protected override updated() {
        this.internals.setFormValue(this.value);
        this.internals.setValidity(this.control.validity, this.control.validationMessage, this.control);
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
                <textarea
                    id="control"
                    part="control"
                    class="border-input bg-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 rounded-control px-input min-h-16 w-full resize-y border py-2 shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50"
                    .value=${this.value}
                    rows=${this.rows}
                    placeholder=${ifDefined(this.placeholder || undefined)}
                    ?disabled=${this.disabled}
                    ?required=${this.required}
                    aria-invalid=${this.error ? "true" : "false"}
                    @input=${(e: Event) => (this.value = (e.target as HTMLTextAreaElement).value)}
                    @change=${() => this.dispatchEvent(new Event("change", { bubbles: true, composed: true }))}
                ></textarea>
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
        "hx-textarea": HxTextarea;
    }
}
