import { customElement } from "lit/decorators.js";
import { HxMenuSeparatorElement } from "../../hx-menu-separator-element.js";

/**
 * @element hx-dropdown-separator
 * @csspart line - The separator line.
 */
@customElement("hx-dropdown-separator")
export class HxDropdownSeparator extends HxMenuSeparatorElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-dropdown-separator": HxDropdownSeparator;
    }
}
