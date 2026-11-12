import { customElement } from "lit/decorators.js";
import { OuiPanelContentElement } from "../../oui-panel-content-element.js";

/**
 * @element oui-drawer-content
 * @slot - The drawer content, scrollable when it overflows.
 */
@customElement("oui-drawer-content")
export class OuiDrawerContent extends OuiPanelContentElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-drawer-content": OuiDrawerContent;
    }
}
