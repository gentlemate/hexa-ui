import { customElement } from "lit/decorators.js";
import { OuiPanelTitleElement } from "../../oui-panel-title-element.js";

/**
 * @element oui-modal-title
 * @slot - The modal title. It labels the dialog.
 */
@customElement("oui-modal-title")
export class OuiModalTitle extends OuiPanelTitleElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-modal-title": OuiModalTitle;
    }
}
