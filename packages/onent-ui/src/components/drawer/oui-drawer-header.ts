import { customElement } from "lit/decorators.js";
import { OuiPanelHeaderElement } from "../../oui-panel-header-element.js";

/**
 * @element oui-drawer-header
 * @slot - The `oui-drawer-title` and `oui-drawer-description` elements, or a custom header.
 */
@customElement("oui-drawer-header")
export class OuiDrawerHeader extends OuiPanelHeaderElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-drawer-header": OuiDrawerHeader;
    }
}
