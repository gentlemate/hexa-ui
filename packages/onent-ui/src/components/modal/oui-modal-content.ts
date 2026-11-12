import { customElement } from "lit/decorators.js";
import { OuiPanelContentElement } from "../../oui-panel-content-element.js";

/**
 * @element oui-modal-content
 * @slot - The modal content, scrollable when it overflows.
 */
@customElement("oui-modal-content")
export class OuiModalContent extends OuiPanelContentElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-modal-content": OuiModalContent;
    }
}
