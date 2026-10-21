import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Check } from "lucide";
import { HxMenuItemElement } from "../../hx-menu-item-element.js";

/**
 * @element hx-select-option
 * @slot - The option label.
 * @csspart base - The option wrapper.
 * @csspart indicator - The check mark of the selected option.
 *
 * An option of an `hx-select`. `selected` is managed by the `hx-select` from its `value`.
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
            "pl-menu-item pr-8",
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-select-option": HxSelectOption;
    }
}
