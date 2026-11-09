import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CircleQuestionMark } from "lucide";
import { focusTargetOf } from "../../focus-target.js";
import { HxElement } from "../../hx-element.js";
import "../icon/hx-icon.js";
import "../tooltip/hx-tooltip.js";

export type HxFormFieldControl = HTMLElement & {
    name?: string;
    required?: boolean;
    invalid: boolean;
    valueText?: string;
    startName?: string;
    endName?: string;
};

/**
 * Lays out a form control with its label and messages. The first descendant control receives `name`, `required`,
 * its accessible name and description, and is marked as invalid when `error` is set.
 *
 * @element hx-form-field
 * @property name - Name of the control.
 * @property label - Label displayed above the control.
 * @property description - Text under the label.
 * @property help - Text of the tooltip on the help icon, at the end of the label row.
 * @property hint - Help text under the control, replaced by `error` when set.
 * @property error - Error message under the control; also marks the control as invalid.
 * @property required - Adds an asterisk to the label and marks the control as required.
 * @property eagerValidation - Inside `hx-form`, validates on `input` without waiting for the first blur.
 * @property control - The form control of the field (read-only).
 * @property names - Names matched against the errors of `hx-form`: `name`, and the names of an `hx-date-range-picker` (read-only).
 * @method focus - Moves the focus to the control.
 * @slot - The form control.
 * @slot label - Rich label, instead of the `label` property.
 * @slot description - Rich description, instead of the `description` property.
 * @slot help - Rich tooltip content, instead of the `help` property.
 * @slot hint - Rich hint, instead of the `hint` property.
 * @slot error - Rich error message, displayed while `error` is set.
 * @fires hx-field-connect - The field found its control and gave it its name.
 * @csspart label - The label.
 * @csspart value - The formatted value of an `hx-slider`.
 * @csspart help - The help button.
 * @csspart description - The description.
 * @csspart hint - The hint.
 * @csspart error - The error message.
 */
@customElement("hx-form-field")
export class HxFormField extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    @property({ reflect: true }) name = "";
    @property() label = "";
    @property() description = "";
    @property() help = "";
    @property() hint = "";
    @property() error = "";
    @property({ type: Boolean, reflect: true }) required = false;
    @property({ type: Boolean, attribute: "eager-validation" }) eagerValidation = false;

    control?: HxFormFieldControl;

    private connected?: HxFormFieldControl;

    get names(): string[] {
        return [this.name, this.control?.startName, this.control?.endName].filter((name) => !!name) as string[];
    }

    private textOf(slot: string, value: string) {
        return this.querySelector(`:scope > [slot="${slot}"]`)?.textContent?.trim() || value;
    }

    private onSlotChange(event: Event) {
        this.control = (event.target as HTMLSlotElement)
            .assignedElements({ flatten: true })
            .flatMap((element) => [element, ...element.querySelectorAll("*")])
            .find((element): element is HxFormFieldControl => "invalid" in element);
        this.requestUpdate();
    }

    override async focus() {
        const control = this.control;
        if (!control) return;
        control.focus();
        (await focusTargetOf(control)).focus();
    }

    private async describe(control: HxFormFieldControl) {
        const message = this.error ? this.textOf("error", this.error) : this.textOf("hint", this.hint);
        const text = [this.textOf("description", this.description), message].filter(Boolean).join(" ");
        const target = await focusTargetOf(control);
        if (text) target.setAttribute("aria-description", text);
        else target.removeAttribute("aria-description");
    }

    protected override updated(changed: PropertyValues<this>) {
        const control = this.control;
        if (!control) return;
        if (this.name && "name" in control) control.name = this.name;
        if ("required" in control && (this.required || changed.get("required"))) control.required = this.required;
        control.invalid = !!this.error;

        const label = this.textOf("label", this.label);
        const text = "checked" in control ? control.textContent.trim() : "";
        if (label) control.ariaLabel = [label, text].filter(Boolean).join(" ");
        this.describe(control);

        if (control === this.connected) return;
        this.connected = control;
        this.dispatchEvent(new Event("hx-field-connect", { bubbles: true }));
    }

    override render() {
        const label = this.textOf("label", this.label);
        const description = this.textOf("description", this.description);
        const help = this.textOf("help", this.help);
        const hint = this.textOf("hint", this.hint);
        const value = this.control?.valueText;
        const update = () => this.requestUpdate();
        return html`<div class="text-foreground flex flex-col gap-1.5">
            <div class="${label || help || value ? "flex" : "hidden"} items-center gap-2">
                <label part="label" class=${label ? "" : "hidden"} @click=${this.focus}>
                    <slot name="label" @slotchange=${update}>${this.label}</slot>${
                        this.required
                            ? html`<span class="text-destructive ml-0.5" aria-hidden="true">*</span>`
                            : nothing
                    }
                </label>
                <div class="ml-auto flex items-center gap-2">
                    ${value ? html`<span part="value" class="text-muted-foreground tabular-nums">${value}</span>` : nothing}
                    <hx-tooltip content=${this.help} ?disabled=${!help}>
                        <button
                            part="help"
                            type="button"
                            aria-label=${help}
                            class="${
                                help ? "flex" : "hidden"
                            } text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 cursor-help rounded-full outline-none focus-visible:ring-[3px]"
                        >
                            <hx-icon .icon=${CircleQuestionMark}></hx-icon>
                        </button>
                        <slot name="help" slot="content" @slotchange=${update}>${this.help}</slot>
                    </hx-tooltip>
                </div>
            </div>
            <p part="description" class="${description ? "" : "hidden"} text-muted-foreground text-sm">
                <slot name="description" @slotchange=${update}>${this.description}</slot>
            </p>
            <slot @slotchange=${this.onSlotChange} @hx-value-change=${update}></slot>
            ${
                this.error
                    ? html`<p part="error" class="text-destructive text-sm" role="alert">
                          <slot name="error" @slotchange=${update}>${this.error}</slot>
                      </p>`
                    : nothing
            }
            <p part="hint" class="${hint && !this.error ? "" : "hidden"} text-muted-foreground text-sm">
                <slot name="hint" @slotchange=${update}>${this.hint}</slot>
            </p>
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-form-field": HxFormField;
    }
}
