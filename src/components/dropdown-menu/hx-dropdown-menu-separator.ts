import { customElement } from "lit/decorators.js";
import { HxMenuSeparatorElement } from "../../hx-menu-separator-element.js";

/**
 * @element hx-dropdown-menu-separator
 * @csspart line - The separator line.
 */
@customElement("hx-dropdown-menu-separator")
export class HxDropdownMenuSeparator extends HxMenuSeparatorElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-dropdown-menu-separator": HxDropdownMenuSeparator;
    }
}
