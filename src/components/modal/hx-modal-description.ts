import { customElement } from "lit/decorators.js";
import { HxPanelDescriptionElement } from "../../hx-panel-description-element.js";

/**
 * @element hx-modal-description
 * @slot - A short text under the title. It describes the dialog.
 */
@customElement("hx-modal-description")
export class HxModalDescription extends HxPanelDescriptionElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-modal-description": HxModalDescription;
    }
}
