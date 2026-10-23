import { customElement } from "lit/decorators.js";
import { HxPanelDescriptionElement } from "../../hx-panel-description-element.js";

/**
 * @element hx-drawer-description
 * @slot - A short text under the title. It describes the dialog.
 */
@customElement("hx-drawer-description")
export class HxDrawerDescription extends HxPanelDescriptionElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-drawer-description": HxDrawerDescription;
    }
}
