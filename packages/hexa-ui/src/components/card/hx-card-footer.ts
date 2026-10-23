import { customElement } from "lit/decorators.js";
import { HxPanelFooterElement } from "../../hx-panel-footer-element.js";

/**
 * @element hx-card-footer
 * @slot - The card footer (actions…).
 */
@customElement("hx-card-footer")
export class HxCardFooter extends HxPanelFooterElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-card-footer": HxCardFooter;
    }
}
