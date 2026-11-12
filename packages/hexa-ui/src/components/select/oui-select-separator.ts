import { customElement } from "lit/decorators.js";
import { OuiMenuSeparatorElement } from "../../oui-menu-separator-element.js";

/**
 * @element oui-select-separator
 * @csspart line - The separator line.
 */
@customElement("oui-select-separator")
export class OuiSelectSeparator extends OuiMenuSeparatorElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-select-separator": OuiSelectSeparator;
    }
}
