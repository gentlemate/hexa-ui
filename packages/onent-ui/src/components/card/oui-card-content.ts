import { customElement } from "lit/decorators.js";
import { OuiPanelContentElement } from "../../oui-panel-content-element.js";

/**
 * @element oui-card-content
 * @slot - The card content.
 */
@customElement("oui-card-content")
export class OuiCardContent extends OuiPanelContentElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-card-content": OuiCardContent;
    }
}
