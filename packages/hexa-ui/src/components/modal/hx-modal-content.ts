import { customElement } from "lit/decorators.js";
import { HxPanelContentElement } from "../../hx-panel-content-element.js";

/**
 * @element hx-modal-content
 * @slot - The modal content, scrollable when it overflows.
 */
@customElement("hx-modal-content")
export class HxModalContent extends HxPanelContentElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-modal-content": HxModalContent;
    }
}
