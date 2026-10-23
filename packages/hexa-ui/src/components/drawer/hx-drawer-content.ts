import { customElement } from "lit/decorators.js";
import { HxPanelContentElement } from "../../hx-panel-content-element.js";

/**
 * @element hx-drawer-content
 * @slot - The drawer content, scrollable when it overflows.
 */
@customElement("hx-drawer-content")
export class HxDrawerContent extends HxPanelContentElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-drawer-content": HxDrawerContent;
    }
}
