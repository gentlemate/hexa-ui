import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Check } from "lucide";
import { OuiMenuItemElement } from "../../oui-menu-item-element.js";

/**
 * @element oui-select-option
 * @property value - Value of the option.
 * @property disabled - Prevents selecting the option.
 * @property selected - Whether the option is selected (set by the `oui-select`).
 * @slot - The option label.
 * @csspart base - The option wrapper.
 * @csspart indicator - The check mark of the selected option.
 */
@customElement("oui-select-option")
export class OuiSelectOption extends OuiMenuItemElement {
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
        "oui-select-option": OuiSelectOption;
    }
}
