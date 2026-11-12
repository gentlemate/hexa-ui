import { customElement } from "lit/decorators.js";
import { OuiMenuSeparatorElement } from "../../oui-menu-separator-element.js";

/**
 * @element oui-dropdown-separator
 * @csspart line - The separator line.
 */
@customElement("oui-dropdown-separator")
export class OuiDropdownSeparator extends OuiMenuSeparatorElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-dropdown-separator": OuiDropdownSeparator;
    }
}
