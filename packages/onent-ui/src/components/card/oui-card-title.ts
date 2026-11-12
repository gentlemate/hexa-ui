import { customElement } from "lit/decorators.js";
import { OuiPanelTitleElement } from "../../oui-panel-title-element.js";

/**
 * @element oui-card-title
 * @slot - The card title.
 */
@customElement("oui-card-title")
export class OuiCardTitle extends OuiPanelTitleElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-card-title": OuiCardTitle;
    }
}
