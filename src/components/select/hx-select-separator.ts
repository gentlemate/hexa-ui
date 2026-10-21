import { customElement } from "lit/decorators.js";
import { HxMenuSeparatorElement } from "../../hx-menu-separator-element.js";

/**
 * @element hx-select-separator
 * @csspart line - The separator line.
 */
@customElement("hx-select-separator")
export class HxSelectSeparator extends HxMenuSeparatorElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-select-separator": HxSelectSeparator;
    }
}
