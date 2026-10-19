import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Check, Minus } from "lucide";
import { HxCheckableElement } from "../../hx-checkable-element.js";
import "../icon/hx-icon.js";

/**
 * @element hx-checkbox
 * @slot - The checkbox label.
 * @fires input - The checked state changed.
 * @fires change - The checked state changed.
 * @csspart control - The box.
 * @csspart label - The label wrapper.
 * @cssstate checked - The checkbox is checked.
 */
@customElement("hx-checkbox")
export class HxCheckbox extends HxCheckableElement {
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
                    on ? "border-primary bg-primary text-primary-foreground" : "border-input"
                } rounded-control-sm size-checkbox flex shrink-0 items-center justify-center border shadow-xs transition-shadow"
            >
                ${
                    on
                        ? html`<hx-icon
                              .icon=${this.indeterminate ? Minus : Check}
                              size="14"
                              stroke-width="3"
                          ></hx-icon>`
                        : nothing
                }
            </span>
            <span part="label" class="text-foreground text-sm leading-none font-medium"><slot></slot></span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-checkbox": HxCheckbox;
    }
}
