import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Check, Minus } from "lucide";
import { OuiCheckableElement } from "../../oui-checkable-element.js";
import "../icon/oui-icon.js";

/**
 * @element oui-checkbox
 * @property indeterminate - Shows a dash instead of the check mark; cleared when the user toggles it.
 * @property value - Value submitted with the form when checked.
 * @property checked - Whether the checkbox is checked (not reflected as an attribute).
 * @slot - The checkbox label.
 * @fires input - The checked state changed.
 * @fires change - The checked state changed.
 * @cssprop [--oui-size-checkbox=1.25rem] - Width and height of the box.
 * @cssprop [--oui-radius-checkbox=0.375rem] - Border radius of the box.
 * @csspart control - The box.
 * @csspart label - The label wrapper.
 * @cssstate checked - The checkbox is checked.
 */
@customElement("oui-checkbox")
export class OuiCheckbox extends OuiCheckableElement {
    @property({ type: Boolean }) indeterminate = false;

    constructor() {
        super("checkbox");
    }

    protected override toggle() {
        this.indeterminate = false;
        super.toggle();
    }

    protected override get checkedState() {
        return this.indeterminate ? "mixed" : super.checkedState;
    }

    override render() {
        const on = this.checked || this.indeterminate;
        return html`<span
                part="control"
                class="${
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                } rounded-checkbox size-checkbox flex shrink-0 items-center justify-center border shadow-xs transition-shadow"
            >
                ${
                    on
                        ? html`<oui-icon
                              .icon=${this.indeterminate ? Minus : Check}
                              size="14"
                              stroke-width="3"
                          ></oui-icon>`
                        : nothing
                }
            </span>
            <span part="label" class="text-foreground leading-none"><slot></slot></span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-checkbox": OuiCheckbox;
    }
}
