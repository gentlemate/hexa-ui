import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Check } from "lucide";
import { HxMenuItemElement } from "../../hx-menu-item-element.js";

/**
 * @element hx-select-option
 * @property value - Value of the option.
 * @property disabled - Prevents selecting the option.
 * @property selected - Whether the option is selected (set by the `hx-select`).
 * @slot - The option label.
 * @csspart base - The option wrapper.
 * @csspart indicator - The check mark of the selected option.
 */
@customElement("hx-select-option")
export class HxSelectOption extends HxMenuItemElement {
    @property({ type: Boolean, reflect: true }) selected = false;

    constructor() {
        super();
        this.internals.role = "option";
    }

    protected override updated() {
        super.updated();
        this.internals.ariaSelected = String(this.selected);
    }

    override render() {
        return this.renderBase(
            html`<slot></slot>${this.renderIndicator(this.selected ? Check : undefined, "right")}`,
            "pl-option pr-8",
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-select-option": HxSelectOption;
    }
}
