import { customElement } from "lit/decorators.js";
import { OuiPanelDescriptionElement } from "../../oui-panel-description-element.js";

/**
 * @element oui-card-description
 * @slot - A short text under the title.
 */
@customElement("oui-card-description")
export class OuiCardDescription extends OuiPanelDescriptionElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-card-description": OuiCardDescription;
    }
}
