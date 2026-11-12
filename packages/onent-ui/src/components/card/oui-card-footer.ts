import { customElement } from "lit/decorators.js";
import { OuiPanelFooterElement } from "../../oui-panel-footer-element.js";

/**
 * @element oui-card-footer
 * @slot - The card footer (actions…).
 */
@customElement("oui-card-footer")
export class OuiCardFooter extends OuiPanelFooterElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-card-footer": OuiCardFooter;
    }
}
