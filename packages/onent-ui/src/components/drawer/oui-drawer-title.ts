import { customElement } from "lit/decorators.js";
import { OuiPanelTitleElement } from "../../oui-panel-title-element.js";

/**
 * @element oui-drawer-title
 * @slot - The drawer title. It labels the dialog.
 */
@customElement("oui-drawer-title")
export class OuiDrawerTitle extends OuiPanelTitleElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-drawer-title": OuiDrawerTitle;
    }
}
