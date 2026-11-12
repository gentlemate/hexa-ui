import { customElement } from "lit/decorators.js";
import { OuiPanelHeaderElement } from "../../oui-panel-header-element.js";

/**
 * @element oui-modal-header
 * @slot - The `oui-modal-title` and `oui-modal-description` elements, or a custom header.
 */
@customElement("oui-modal-header")
export class OuiModalHeader extends OuiPanelHeaderElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-modal-header": OuiModalHeader;
    }
}
