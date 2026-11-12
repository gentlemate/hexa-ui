import { customElement } from "lit/decorators.js";
import { OuiPanelDescriptionElement } from "../../oui-panel-description-element.js";

/**
 * @element oui-modal-description
 * @slot - A short text under the title. It describes the dialog.
 */
@customElement("oui-modal-description")
export class OuiModalDescription extends OuiPanelDescriptionElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-modal-description": OuiModalDescription;
    }
}
