import { customElement } from "lit/decorators.js";
import { OuiPanelDescriptionElement } from "../../oui-panel-description-element.js";

/**
 * @element oui-drawer-description
 * @slot - A short text under the title. It describes the dialog.
 */
@customElement("oui-drawer-description")
export class OuiDrawerDescription extends OuiPanelDescriptionElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-drawer-description": OuiDrawerDescription;
    }
}
