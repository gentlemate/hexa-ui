import { customElement } from "lit/decorators.js";
import { HxPanelHeaderElement } from "../../hx-panel-header-element.js";

/**
 * @element hx-drawer-header
 * @slot - The `hx-drawer-title` and `hx-drawer-description` elements, or a custom header.
 */
@customElement("hx-drawer-header")
export class HxDrawerHeader extends HxPanelHeaderElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-drawer-header": HxDrawerHeader;
    }
}
