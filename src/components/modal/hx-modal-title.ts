import { customElement } from "lit/decorators.js";
import { HxPanelTitleElement } from "../../hx-panel-title-element.js";

/**
 * @element hx-modal-title
 * @slot - The modal title. It labels the dialog.
 */
@customElement("hx-modal-title")
export class HxModalTitle extends HxPanelTitleElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-modal-title": HxModalTitle;
    }
}
